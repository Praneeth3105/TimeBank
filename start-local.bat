@echo off
echo Start PostgreSQL only if you changed DATABASE_URL to PostgreSQL.
start "TimeBank API" cmd /k "cd backend && if not exist .venv py -3.11 -m venv .venv && call .venv\Scripts\activate && pip install -r requirements.txt && if not exist .env copy .env.example .env && uvicorn app.main:app --reload"
start "TimeBank Frontend" cmd /k "cd frontend && if not exist .env copy .env.example .env && npm install && npm run dev"
