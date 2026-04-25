# Playto Payout Engine

A robust, cross-border payout engine built for the Playto Founding Engineer Challenge.

This system handles idempotent API requests, utilizes strict database-level locking to prevent concurrency race conditions, and maintains absolute money integrity via a strict double-entry ledger without relying on Python-level arithmetic.

## Tech Stack

-   **Backend:** Django, Django REST Framework, PostgreSQL
-   **Workers:** Django-Q2 (Background tasks & Cron jobs)
-   **Frontend:** React, Tailwind CSS v4, Vite
-   **Deployment:** Render (Backend/DB) & Vercel (Frontend)

## Live Demo

-   **Frontend Dashboard:** `[INSERT_YOUR_VERCEL_URL_HERE]`
-   **Backend API:** `[INSERT_YOUR_RENDER_URL_HERE]`

## Local Setup Instructions

### 1. Backend (Django)

Ensure you have Python 3.10+ and PostgreSQL installed.

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Setup Database & Run Migrations
python manage.py migrate

# Seed the database with Merchants and initial credits
python seed_data.py

# Terminal 1: Start the API Server
python manage.py runserver
2. Background Worker
Open a new terminal window, activate the virtual environment, and start the Django-Q worker to process payouts.

Bash
cd backend
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
python manage.py qcluster
3. Frontend (React)
Open a third terminal window.

Bash
cd frontend
npm install

# Start the dev server
npm run dev
4. Running the Tests
To run the automated tests validating database concurrency locks and API idempotency:

Bash
cd backend
python manage.py test
Architecture Notes
Please see the EXPLAINER.md file for deep dives into the Ledger Math, Concurrency Locks, Idempotency handling, and the Strict State Machine logic.


Just remember to swap out the `[INSERT_YOUR_VERCEL_URL_HERE]` and `[INSERT_YOUR_RENDER_URL_HERE]` placeholders with your actual deployed links before you finalize the commit!
```
