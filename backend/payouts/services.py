from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from django.db.models import Sum, Case, When, F
from .models import Merchant, Payout, LedgerEntry, IdempotencyKey

def get_merchant_available_balance(merchant_id):
    result = LedgerEntry.objects.filter(merchant_id=merchant_id).aggregate(
        total=Sum(
            Case(
                When(entry_type__in=['CREDIT', 'REFUND'], then=F('amount_paise')),
                When(entry_type__in=['HOLD', 'DEBIT'], then=-F('amount_paise')),
                default=0
            )
        )
    )
    return result['total'] or 0

@transaction.atomic
def create_payout(*, merchant_id, amount_paise, bank_account_id, idempotency_key):
    merchant = Merchant.objects.select_for_update().get(id=merchant_id)

    try:
        idem = IdempotencyKey.objects.get(merchant=merchant, key=idempotency_key)
        if idem.expires_at > timezone.now():
            if idem.is_processing:
                return None, 202, {'message': 'Request in progress'}
            return None, idem.response_code, idem.response_body
    except IdempotencyKey.DoesNotExist:
        idem = IdempotencyKey.objects.create(
            merchant=merchant,
            key=idempotency_key,
            expires_at=timezone.now() + timedelta(hours=24),
            is_processing=True
        )

    balance = get_merchant_available_balance(merchant.id)

    if balance < amount_paise:
        response = {'error': 'Insufficient balance'}
        idem.response_code = 400
        idem.response_body = response
        idem.is_processing = False
        idem.save(update_fields=['response_code', 'response_body', 'is_processing'])
        return None, 400, response

    payout = Payout.objects.create(
        merchant=merchant,
        amount_paise=amount_paise,
        bank_account_id=bank_account_id
    )

    # All Ledger Entries are strictly positive integers
    LedgerEntry.objects.create(
        merchant=merchant,
        payout=payout,
        amount_paise=amount_paise,
        entry_type='HOLD'
    )

    response = {
        'id': payout.id,
        'status': payout.status,
        'amount_paise': payout.amount_paise
    }

    idem.response_code = 201
    idem.response_body = response
    idem.is_processing = False
    idem.save(update_fields=['response_code', 'response_body', 'is_processing'])

    return payout, 201, response