from django.db import models
from django.db.models import Q
from django.core.exceptions import ValidationError
import uuid

class Merchant(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Payout(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING'
        PROCESSING = 'PROCESSING'
        COMPLETED = 'COMPLETED'
        FAILED = 'FAILED'

    merchant = models.ForeignKey(
        Merchant, on_delete=models.CASCADE, related_name='payouts'
    )
    amount_paise = models.BigIntegerField()
    bank_account_id = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    retry_count = models.PositiveIntegerField(default=0)
    next_retry_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['status', 'updated_at']),
            models.Index(fields=['status', 'next_retry_at'])
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(amount_paise__gt=0), name='payout_amount_positive'
            )
        ]

    def clean(self):
        # Strict State Machine Enforcement
        if self.pk:
            old_status = Payout.objects.get(pk=self.pk).status
            valid_transitions = {
                'PENDING': ['PROCESSING'],
                'PROCESSING': ['COMPLETED', 'FAILED'],
                'COMPLETED': [],
                'FAILED': []
            }
            if self.status != old_status and self.status not in valid_transitions.get(old_status, []):
                raise ValidationError(f"Invalid state transition from {old_status} to {self.status}")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

class LedgerEntry(models.Model):
    class EntryType(models.TextChoices):
        CREDIT = 'CREDIT'
        HOLD = 'HOLD'
        DEBIT = 'DEBIT'
        REFUND = 'REFUND'

    merchant = models.ForeignKey(
        Merchant, on_delete=models.CASCADE, related_name='ledger_entries'
    )
    payout = models.ForeignKey(
        Payout, null=True, blank=True, on_delete=models.PROTECT, related_name='ledger_entries'
    )
    amount_paise = models.BigIntegerField()
    entry_type = models.CharField(max_length=20, choices=EntryType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(amount_paise__gt=0), name='ledger_amount_positive'
            )
        ]

class IdempotencyKey(models.Model):
    
    merchant = models.ForeignKey(
        Merchant, on_delete=models.CASCADE, related_name='idempotency_keys'
    )
    key = models.UUIDField(default=uuid.uuid4)
    response_code = models.IntegerField(null=True, blank=True)
    response_body = models.JSONField(null=True, blank=True)
    is_processing = models.BooleanField(default=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('merchant', 'key')