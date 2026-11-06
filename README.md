# TimeBank

A full-stack time-exchange platform. Members offer skills, request help, complete exchanges and earn/spend internal time credits (not cash).

## Included in this starter release

- Responsive React + Vite + Tailwind interface
- FastAPI backend with JWT authentication and role checks
- SQLAlchemy models and PostgreSQL support (SQLite is the zero-setup local default)
- User profiles, skills/services, service requests and exchange workflow
- Double-confirmation completion and atomic wallet settlement
- Immutable-style credit ledger with unique exchange settlement references
- Reviews, admin overview, seed/demo data and API docs
- Docker Compose PostgreSQL service and environment examples

This is a working MVP foundation, not a claim that every item in the larger blueprint (email delivery, WebSockets chat, identity verification, Redis, AI recommendations, dispute operations and production deployment hardening) is fully implemented. Those are clearly listed in `docs/ROADMAP.md`.

## Requirements

- Python 3.11+
- Node.js 20+
- npm
- Optional: Docker Desktop for PostgreSQL

## 1. Start the backend

Windows PowerShell:

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

macOS/Linux:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Backend: http://127.0.0.1:8000  
Swagger API docs: http://127.0.0.1:8000/docs

SQLite database `timebank.db` is created automatically on first start. For PostgreSQL, start the database from the project root with `docker compose up -d db`, then set `DATABASE_URL` in `backend/.env` to:

```env
DATABASE_URL=postgresql+psycopg://timebank:timebank_dev_password@localhost:5432/timebank
```

## 2. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

macOS/Linux: use `cp .env.example .env` instead of `Copy-Item`.

Frontend: http://localhost:5173

## 3. Demo account

For a local demo, set `SEED_DEMO=true` in `backend/.env` before starting the backend.

- Admin: `admin@timebank.local` / `Admin123!`
- Member: `member@timebank.local` / `Member123!`

Change these credentials immediately and never enable demo seeding in production.

## Important configuration

Backend `.env`:
- `SECRET_KEY`: replace with a long random secret before any shared deployment.
- `DATABASE_URL`: SQLite default or PostgreSQL URL.
- `FRONTEND_URL`: frontend origin.
- `SEED_DEMO`: local-only demo data switch.

Frontend `.env`:
- `VITE_API_URL=http://127.0.0.1:8000/api`

## Core credit rules implemented

- One approved hour equals one time credit.
- New accounts receive a one-time starter allowance of 2 credits.
- Credits are not money and cannot be withdrawn.
- Credits are settled only after both participants confirm completion.
- A settlement uses a database transaction, row-level locking where supported, and a unique exchange reference to prevent duplicate settlement.
- A requester cannot spend more credits than available.
- Every wallet change creates a ledger record.

## Tests

```bash
cd backend
pytest
```

## Production checklist

Do not deploy with the development secret, demo accounts, SQLite, wildcard CORS, or debug settings. Configure managed PostgreSQL, HTTPS, email verification/reset delivery, secure token storage, rate limiting, upload scanning, backups, monitoring, migrations, privacy/retention policies and a reviewed threat model first.

See `docs/` for architecture, API, schema and roadmap notes.