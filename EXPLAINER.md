# Playto Payout Engine: Technical Architecture

This document explains the core architecture of the Playto Payout Engine built for **data integrity**, **safe concurrency**, and **financial correctness**.

---

## 1. Atomic Ledger System

### Concept

Merchant balances are **derived from ledger entries**, not stored in a mutable balance field.

Why:

* Prevents stale state
* Makes every transaction auditable
* Avoids balance corruption

### Balance Calculation

```python
from django.db.models import Sum, Case, When, F

def get_available_balance(merchant_id):
    result = LedgerEntry.objects.filter(
        merchant_id=merchant_id
    ).aggregate(
        total=Sum(
            Case(
                When(entry_type__in=["CREDIT", "REFUND"], then=F("amount_paise")),
                When(entry_type__in=["HOLD", "DEBIT"], then=-F("amount_paise")),
                default=0
            )
        )
    )
    return result["total"] or 0
```

### Core Rule

All amounts must be positive:

```python
CheckConstraint(check=Q(amount_paise__gt=0))
```

Transaction type decides direction.

This removes negative-value ambiguity.

---

## 2. Concurrency Safety

### Problem

Two payout requests at the same time can overspend.

```text
Balance = ₹100
Request A = ₹60
Request B = ₹60
Final = -₹20 ❌
```

### Solution: Row Locking

```python
from django.db import transaction

@transaction.atomic
def create_payout(merchant_id, amount_paise):
    merchant = Merchant.objects.select_for_update().get(
        id=merchant_id
    )

    balance = get_available_balance(merchant.id)

    if balance < amount_paise:
        raise InsufficientFundsException()

    LedgerEntry.objects.create(
        merchant=merchant,
        amount_paise=amount_paise,
        entry_type="HOLD"
    )
```

### Why it works

`select_for_update()` locks the merchant row.

Guarantees:

* One payout at a time
* No double-spending
* Atomic execution

---

## 3. Idempotency Protection

### Problem

Clients retry failed network requests.

Without protection:

Same payout may run twice.

### Solution

Every request includes an `Idempotency-Key`.

```python
record, created = IdempotencyKey.objects.get_or_create(
    merchant=merchant,
    key=idempotency_key
)
```

### Flow

* First request creates key
* Duplicate request is blocked
* Completed response is cached

Guarantee:

One request → One payout

---

## 4. State Machine Enforcement

Payout lifecycle is strictly controlled.

### Allowed

```text
PENDING → PROCESSING
PROCESSING → COMPLETED
PROCESSING → FAILED
```

### Blocked

```text
FAILED → COMPLETED ❌
COMPLETED → FAILED ❌
```

Validation is enforced inside:

* `clean()`
* `save()`

This prevents illegal transitions.

---

## 5. Failure Recovery

If payout fails:

1. Status becomes `FAILED`
2. Funds are returned

Both happen in the same transaction.

Guarantee:

No lost money.

---

## Ledger Lifecycle

```text
Payout Created  → HOLD
Payout Success  → DEBIT
Payout Failed   → REFUND
```

This keeps audit logs clear and simple.

---

## Why Positive-Only Amounts?

Wrong:

```python
amount_paise = -500
```

Problem:

```text
1000 - (-500) = 1500 ❌
```

Balance increases after withdrawal.

Correct:

```text
amount = 500
type = DEBIT
```

Safer and easier to audit.

---

## Core Guarantees

✅ No overdrafts
✅ No double-spending
✅ No duplicate payouts
✅ Safe retries
✅ Full audit trail
✅ Correct balance math

---

## Engineering Principles

1. Correctness over convenience
2. Consistency over speed
3. Auditability over shortcuts
4. Safety over assumptions

In financial systems, invalid states must be impossible.
