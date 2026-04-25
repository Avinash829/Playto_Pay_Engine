import random
from datetime import timedelta
from django_q.tasks import async_task
from django.db import transaction
from django.utils import timezone
from .models import Payout, LedgerEntry

MAX_RETRIES = 3
BASE_RETRY_SECONDS = 30

def enqueue_payout(payout_id):
    async_task('payouts.tasks.process_payout', payout_id)

def process_payout(payout_id):
    with transaction.atomic():
        payout = Payout.objects.select_for_update().get(id=payout_id)
        if payout.status != 'PENDING':
            return
        payout.status = 'PROCESSING'
        payout.save(update_fields=['status'])

    outcome = random.random()

    with transaction.atomic():
        payout = Payout.objects.select_for_update().get(id=payout_id)
        if payout.status != 'PROCESSING':
            return

        if outcome < 0.7:
            payout.status = 'COMPLETED'
            payout.save(update_fields=['status'])
            LedgerEntry.objects.filter(payout=payout, entry_type='HOLD').update(entry_type='DEBIT')
            return

        if outcome < 0.9:
            payout.status = 'FAILED'
            payout.save(update_fields=['status'])
            LedgerEntry.objects.create(
                merchant=payout.merchant,
                payout=payout,
                amount_paise=payout.amount_paise,
                entry_type='REFUND'
            )
            return

        payout.next_retry_at = timezone.now() + timedelta(
            seconds=BASE_RETRY_SECONDS * (2 ** payout.retry_count)
        )
        payout.save(update_fields=['next_retry_at'])

def retry_stuck_payouts():
    now = timezone.now()
    payouts = Payout.objects.filter(status='PROCESSING', next_retry_at__lte=now)

    for payout in payouts:
        with transaction.atomic():
            locked = Payout.objects.select_for_update().get(id=payout.id)
            
            if locked.retry_count >= MAX_RETRIES:
                locked.status = 'FAILED'
                locked.save(update_fields=['status'])
                LedgerEntry.objects.create(
                    merchant=locked.merchant,
                    payout=locked,
                    amount_paise=locked.amount_paise,
                    entry_type='REFUND'
                )
                continue

            locked.retry_count += 1
            locked.save(update_fields=['retry_count'])

        enqueue_payout(locked.id)