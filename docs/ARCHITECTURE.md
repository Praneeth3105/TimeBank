# TimeBank architecture

- **Frontend:** React 18, TypeScript, Vite, React Router, Tailwind CSS and Axios.
- **Backend:** FastAPI with request validation through Pydantic and business operations in API service functions.
- **Persistence:** SQLAlchemy 2.x. SQLite is the local default; PostgreSQL is supported by setting `DATABASE_URL`.
- **Authentication:** Bearer JWT, Argon2 password hashing, protected member and administrator routes.
- **Wallet:** Wallet balance plus transaction ledger. Completion requires both members to confirm. Settlement updates both balances and inserts debit/credit ledger entries in one DB transaction. A unique `(reference, entry_type)` constraint blocks duplicate entries.

## Main data relationships

- User 1—1 Wallet
- User 1—many Skills
- Skill 1—many ServiceRequests
- ServiceRequest 1—0/1 Exchange
- Exchange 1—many Reviews (one per reviewer)
- User 1—many Transactions

Exact home addresses are not collected or shown. Store only general location text.
