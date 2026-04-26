#  Playto Payout Engine

A high-integrity, cross-border payout infrastructure built for the **Playto Founding Engineer Challenge**.

This system is designed to handle **high-concurrency financial transactions** with absolute precision, ensuring that not a single paisa is lost to race conditions, duplicate requests, or inconsistent state transitions.

---

##  Live Infrastructure

- **Frontend Dashboard:** https://playto-pay-engine.pages.dev/
- **Backend API:** https://playto-play-engine.onrender.com/

---

## 🛠️ Tech Stack

### Backend
- Python 3.14
- Django 5.2
- Django REST Framework

### Database
- PostgreSQL (Render Managed)

### Async Processing
- Django-Q2 (ORM-based worker cluster)

### Frontend
- React (Vite)
- Tailwind CSS v4
- Lucide Icons

### Infrastructure
- Cloudflare Pages (Frontend Hosting)
- Render (Backend + Worker Hosting)

---

##  Core Architecture Principles

This payout engine was built with a **Safety First** engineering philosophy.

For a deep technical breakdown of concurrency guarantees, state transitions, and mathematical invariants, refer to **EXPLAINER.md**

### 1. Atomic Ledger System

Balances are never stored as mutable integers.

Instead, every financial operation is stored as immutable ledger entries:

- Credit
- Debit
- Hold

Balance is dynamically aggregated from the ledger, ensuring full auditability.

---

### 2. Pessimistic Concurrency Control

Uses PostgreSQL row-level locking with:

```sql
SELECT ... FOR UPDATE
```

This guarantees:

- No overdrafts
- No double spending
- Safe concurrent payout requests

---

### 3. Distributed Idempotency

All write operations require an:

```http
Idempotency-Key
```

This ensures safe retries during:

- Network failures
- Client retries
- Duplicate submissions

Same key = same result.

---

### 4. Deterministic State Machine

Every payout follows a strict lifecycle:

```text
PENDING → PROCESSING → COMPLETED / FAILED
```

State transitions are enforced at the model layer to prevent invalid transitions.

---

## 🔌 API Reference

All monetary values are represented in **Paise (integers)** to avoid floating-point precision issues.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/merchants/` | List all merchants |
| GET | `/api/v1/merchants/<id>/balance/` | Get real-time balance |
| GET | `/api/v1/merchants/<id>/transactions/` | Full ledger audit trail |
| GET | `/api/v1/merchants/<id>/payouts/` | Payout history |
| POST | `/api/v1/merchants/<id>/payouts/` | Create payout (atomic + idempotent) |

---

##  Sample Payout Request

```bash
curl -X POST https://playto-play-engine.onrender.com/api/v1/merchants/1/payouts/ \
    -H "Idempotency-Key: $(uuidgen)" \
    -H "Content-Type: application/json" \
    -d '{
        "amount_paise": 150000,
        "bank_account_id": "ACC_778899"
    }'
```

---

## Local Setup

## 1. Backend Setup

```bash
cd backend

python -m venv .venv
```

Activate virtual environment:

**Windows**

```bash
.venv\Scripts\activate
```

**Mac/Linux**

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Seed test data:

```bash
python seed_data.py
```

Start backend server:

```bash
python manage.py runserver
```

---

## 2. Start Background Worker

In a separate terminal:

```bash
python manage.py qcluster
```

---

## 3. Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

---

##  Testing

Run the complete test suite:

```bash
cd backend
python manage.py test
```

Includes:

- Concurrency stress tests
- Idempotency validation
- Ledger consistency verification
- Payout lifecycle validation

---

##  Reliability Guarantees

✅ No race-condition fund loss  
✅ No duplicate payout execution  
✅ Strong transactional consistency  
✅ Full audit trail of every paisa  
✅ Safe under high concurrency  

---

##  Engineering Deep Dive

For detailed explanations of:

- Mathematical ledger invariants
- Concurrency proofs
- Locking strategy
- Failure recovery logic
- Idempotency guarantees

Read:

```text
EXPLAINER.md
```

---

## 👨‍💻 Author

Built for the **Playto Founding Engineer Challenge**.
