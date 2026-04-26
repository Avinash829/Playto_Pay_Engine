# Playto Payout Engine: Architecture Deep-Dive

This document outlines the engineering philosophy, concurrency guarantees, and safety mechanisms implemented to ensure **100% data integrity**, **financial correctness**, and **concurrency safety** in the Playto Payout Engine.

---

# 1. Atomic Ledger & Mathematical Invariants

## Concept

**Immutable Double-Entry Inspired Ledger**

The system calculates balances through dynamic aggregation of atomic ledger events instead of storing a mutable `balance` field on the Merchant model.

This design eliminates stale-state bugs and guarantees auditability.

## Implementation

```python
def get_merchant_available_balance(merchant_id):
    result = LedgerEntry.objects.filter(
        merchant_id=merchant_id
    ).aggregate(
        total=Sum(
            Case(
                When(
                    entry_type__in=['CREDIT', 'REFUND'],
                    then=F('amount_paise')
                ),
                When(
                    entry_type__in=['HOLD', 'DEBIT'],
                    then=-F('amount_paise')
                ),
                default=0
            )
        )
    )

    return result['total'] or 0
```

## Why this is Production-Grade

### Zero-Arithmetic Policy

Python never performs balance math.

All arithmetic is delegated to PostgreSQL.

Benefits:

- Eliminates floating-point precision issues
- Prevents application-layer inconsistencies
- Centralizes financial logic in the database

---

### Positive-Only Invariant

The database enforces:

```python
CheckConstraint(amount_paise > 0)
```

This guarantees:

- No ambiguous negative amounts
- Explicit transaction direction through `entry_type`
- Prevention of double-negative logic bugs

---

### State-to-Balance Mapping

A `HOLD` entry is treated as a debit for available balance calculation.

This ensures reserved payout funds cannot be spent twice.

---

# 2. Concurrency Control: Preventing Overdrafts

## Concept

**Pessimistic Locking with Row-Level Isolation**

To solve the double-spend problem, the engine uses PostgreSQL row-level locks.

## Implementation

```python
@transaction.atomic
def create_payout(
    *,
    merchant_id,
    amount_paise,
    bank_account_id,
    idempotency_key
):
    merchant = Merchant.objects.select_for_update().get(
        id=merchant_id
    )

    available_balance = get_merchant_available_balance(
        merchant.id
    )

    if available_balance < amount_paise:
        raise InsufficientFundsException()

    LedgerEntry.objects.create(
        merchant=merchant,
        amount_paise=amount_paise,
        entry_type='HOLD'
    )
```

## How It Works

### SELECT FOR UPDATE

PostgreSQL locks the Merchant row:

```sql
SELECT ... FOR UPDATE
```

This ensures only one payout transaction can mutate merchant funds at a time.

---

### Race Condition Prevention

Without locking:

Thread A sees ₹100  
Thread B sees ₹100

Both attempt ₹60 payout.

Result:

₹120 withdrawn from ₹100.

With locking:

Thread B waits for Thread A.

After Thread A commits:

Available balance becomes ₹40.

Thread B fails safely.

---

# 3. Distributed Idempotency Strategy

## Concept

**Unique Request Tracking with In-Flight Protection**

In distributed systems, retries are unavoidable.

The system guarantees duplicate requests never create duplicate payouts.

---

## Atomic Reservation

Uses:

```python
get_or_create()
```

with a unique constraint:

```text
(merchant, idempotency_key)
```

This guarantees only one logical payout per client request.

---

## In-Flight Protection

Tracks:

```python
is_processing
```

If another request arrives while processing:

Returns:

```http
409 Conflict
```

or

```http
202 Accepted
```

This prevents duplicate background worker execution.

---

## Result Caching

Once completed:

Original API response is persisted.

Future retries return cached results.

No ledger logic is re-executed.

---

# 4. Formal State Machine Enforcement

## Concept

**Deterministic Lifecycle Management**

Payout states are enforced at the model layer.

Transitions are validated inside:

- `clean()`
- `save()`

---

## State Transition Rules

| Current Status | Allowed Next Status |
|---------------|---------------------|
| PENDING | PROCESSING |
| PROCESSING | COMPLETED, FAILED |
| COMPLETED | Terminal |
| FAILED | Terminal |

---

## Why This Matters

Prevents invalid transitions such as:

```text
PENDING → COMPLETED
FAILED → PROCESSING
COMPLETED → FAILED
```

This ensures deterministic payout execution.

---

## Failure Recovery

If a payout fails:

Fund reversal happens inside the same database transaction.

Guarantee:

A payout can never be marked `FAILED` without restoring funds.

Atomic consistency is preserved.

---

# 5. Senior Engineering Audit: Correcting Faulty AI Logic

## Audit Note

During initial development, an AI assistant suggested creating payout holds using negative `amount_paise`.

Example:

```python
amount_paise = -5000
```

This approach was rejected.

---

## Why It Was Wrong

### Aggregation Failure

If balance calculation uses:

```python
Sum(amount_paise)
```

Then subtracting a negative becomes addition.

Example:

```text
Balance = 10000
Hold = -5000

10000 - (-5000) = 15000
```

This creates money out of thin air.

Critical financial bug.

---

### Audit Integrity Failure

Negative ledger rows create ambiguity:

Was this:

- a reversal?
- a debit?
- a refund?

Ambiguity destroys audit clarity.

---

## Final Fix

Implemented **State-Based Ledger Mutation**

Flow:

```text
Payout Created → HOLD
Payout Success → HOLD becomes DEBIT
Payout Failure → HOLD reversed as REFUND
```

This preserves:

- Positive-only amounts
- Clear transaction semantics
- Safe aggregation logic

---

# Core Financial Guarantees

## Ledger Safety

✅ No mutable balances  
✅ Full audit trail  
✅ Positive-only monetary storage  

---

## Concurrency Safety

✅ No race-condition overdrafts  
✅ Strict row-level isolation  
✅ Transactional consistency  

---

## Retry Safety

✅ Safe retries  
✅ No duplicate payouts  
✅ Cached deterministic responses  

---

## State Integrity

✅ Deterministic payout lifecycle  
✅ Invalid transitions blocked  
✅ Automatic recovery on failure  

---

# Final Engineering Philosophy

The Playto Payout Engine was designed around one principle:

> Financial systems must optimize for correctness first, convenience second.

In payout infrastructure:

- Losing money is unacceptable.
- Duplicate payments are unacceptable.
- Race conditions are unacceptable.

This system treats the database as the source of truth and enforces correctness through:

- Immutable ledgers
- Database locking
- Idempotency guarantees
- State machine validation
