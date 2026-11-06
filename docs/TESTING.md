# Testing notes

Run backend smoke tests:

```bash
cd backend
pytest
```

Manual happy path:
1. Register two accounts in separate browsers or sessions.
2. Account A creates a skill lasting one hour.
3. Account B requests the skill (B needs at least one credit).
4. A accepts the request.
5. Both accounts open Exchanges and confirm completion.
6. Verify B is debited one credit, A is credited one credit, and each has ledger entries.
7. Confirm a second settlement is rejected and an account cannot confirm an exchange it does not belong to.
8. Verify a regular member receives 403 from `/api/admin/dashboard`.

Before production add tests for simultaneous confirmations, rollback, duplicate registration, expired JWTs, upload validation, CORS, rate limiting, and all role/ownership boundaries.
