from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import uuid

from .models import Merchant, Payout, LedgerEntry
from .serializers import (
    PayoutSerializer,
    LedgerEntrySerializer
)
from .services import create_payout, get_merchant_available_balance
from .tasks import enqueue_payout


class MerchantBalanceView(APIView):
    def get(self, request, merchant_id):
        merchant = get_object_or_404(
            Merchant,
            id=merchant_id
        )

        available_balance = get_merchant_available_balance(merchant.id)

        held_balance = Payout.objects.filter(
            merchant=merchant,
            status__in=[
                'PENDING',
                'PROCESSING'
            ]
        ).count()

        return Response({
            'merchant_id': merchant.id,
            'merchant_name': merchant.name,
            'available_balance_paise': available_balance,
            'held_payouts_count': held_balance
        })


class PayoutListCreateView(APIView):
    def post(self, request, merchant_id):
        key = request.headers.get('Idempotency-Key')

        if not key:
            return Response(
                {'error': 'Idempotency-Key required'},
                status=400
            )

        payout, code, response = create_payout(
            merchant_id=merchant_id,
            amount_paise=int(request.data['amount_paise']),
            bank_account_id=request.data['bank_account_id'],
            idempotency_key=uuid.UUID(key)
        )

        if payout:
            enqueue_payout(payout.id)

        return Response(response, status=code)

    def get(self, request, merchant_id):
        merchant = get_object_or_404(
            Merchant,
            id=merchant_id
        )

        payouts = Payout.objects.filter(
            merchant=merchant
        ).order_by('-created_at')

        serializer = PayoutSerializer(payouts, many=True)

        return Response(serializer.data)


class MerchantTransactionsView(APIView):
    def get(self, request, merchant_id):
        merchant = get_object_or_404(
            Merchant,
            id=merchant_id
        )

        entries = LedgerEntry.objects.filter(
            merchant=merchant
        ).order_by('-created_at')

        serializer = LedgerEntrySerializer(entries, many=True)

        return Response(serializer.data)