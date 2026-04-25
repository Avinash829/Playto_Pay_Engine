# Playto Payout Engine - Architecture Explainer

### 1. The Ledger

**Query:**

```python
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
Why model credits and debits this way?
To strictly enforce mathematical invariants. Storing negative numbers in a financial ledger is an anti-pattern prone to double-negative bugs. Instead, the database enforces a CheckConstraint(amount_paise > 0). The entry_type enum dictates the math. By calculating the balance dynamically using a Case/When aggregation, the mathematical invariant is pushed entirely to the PostgreSQL layer, strictly avoiding any Python-level arithmetic on fetched rows.

2. The Lock
Code:

Python
@transaction.atomic
def create_payout(*, merchant_id, amount_paise, bank_account_id, idempotency_key):
    merchant = Merchant.objects.select_for_update().get(id=merchant_id)
    # ... balance check and deduction logic follows
Database Primitive:
This relies on PostgreSQL's SELECT ... FOR UPDATE row-level locking. It acquires a write lock on the specific Merchant row for the duration of the transaction. If two concurrent requests attempt to withdraw funds, the database forces the second request to wait until the first transaction commits or rolls back. The second request then reads the new, post-deduction balance, entirely eliminating the check-then-deduct race condition.

3. The Idempotency
How does the system know it has seen a key before?
The database enforces a unique_together = ('merchant', 'key') constraint on the IdempotencyKey table.

What happens if the first request is in flight when the second arrives?
When the first request starts, it creates the IdempotencyKey record with is_processing = True. If a second request arrives with the same key before the first finishes, it queries the key, sees is_processing == True, and safely short-circuits to return a 202 Accepted (or 409 Conflict) indicating the request is already in-flight. This prevents get_or_create deadlocks on the database. Keys expire after 24 hours.

4. The State Machine
Where is failed-to-completed blocked?
It is blocked at the model level via the clean() method, guaranteeing enforcement no matter where save() is called (API or Background Worker).

The Check:

Python
def clean(self):
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
5. The AI Audit
The error: Initially, an AI tool generated logic that stored a HOLD as a negative integer (amount_paise=-amount_paise). To complete a payout, it suggested writing a new DEBIT entry with amount_paise=0 to clear the hold.

What I caught: Writing a 0 value to a financial ledger is a massive red flag. Furthermore, if you run Sum(Credits) - Sum(Debits) on negative stored values, mathematically subtracting a negative number adds it back to the balance, catastrophically breaking the invariant constraint.

The replacement: I replaced this by enforcing strictly positive integers at the database level. I rewrote the balance aggregator to dynamically apply signs based on entry_type. Finally, instead of creating a 0 debit, the background worker now safely mutates the existing HOLD entry into a hard DEBIT when a payout succeeds, ensuring the ledger math remains flawless.


```
