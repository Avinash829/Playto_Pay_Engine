from rest_framework import serializers
from .models import Merchant, Payout, LedgerEntry
from .services import get_merchant_available_balance


class MerchantSerializer(serializers.ModelSerializer):
    available_balance_paise = serializers.SerializerMethodField()

    class Meta:
        model = Merchant
        fields = [
            'id',
            'name',
            'email',
            'available_balance_paise'
        ]

    def get_available_balance_paise(self, obj):
        return get_merchant_available_balance(obj.id)


class PayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payout
        fields = [
            'id',
            'merchant',
            'amount_paise',
            'bank_account_id',
            'status',
            'retry_count',
            'next_retry_at',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'status',
            'retry_count',
            'next_retry_at',
            'created_at',
            'updated_at'
        ]

    def validate_amount_paise(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "amount_paise must be greater than 0"
            )
        return value

    def validate_bank_account_id(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "bank_account_id cannot be empty"
            )
        return value


class LedgerEntrySerializer(serializers.ModelSerializer):
    payout_status = serializers.SerializerMethodField()

    class Meta:
        model = LedgerEntry
        fields = [
            'id',
            'merchant',
            'payout',
            'payout_status',
            'amount_paise',
            'entry_type',
            'created_at'
        ]

    def get_payout_status(self, obj):
        if obj.payout:
            return obj.payout.status
        return None