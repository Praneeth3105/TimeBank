# API quick reference

All routes except `/`, `/docs`, `/api/auth/register` and `/api/auth/login` require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register and issue starter credits |
| POST | `/api/auth/login` | Login |
| GET/PUT | `/api/users/me` | Read/update profile |
| GET | `/api/users?q=` | Discover members |
| GET/POST | `/api/skills` | Browse/create skills |
| DELETE | `/api/skills/{id}` | Deactivate own skill |
| POST/GET | `/api/requests` | Create/list requests |
| PATCH | `/api/requests/{id}/accept` | Provider accepts |
| PATCH | `/api/requests/{id}/decline` | Provider declines |
| GET | `/api/exchanges` | List own exchanges |
| PATCH | `/api/exchanges/{id}/confirm` | Confirm completion |
| GET | `/api/wallet` | Current balance |
| GET | `/api/wallet/transactions` | Ledger |
| POST | `/api/reviews` | Review completed exchange |
| GET | `/api/admin/dashboard` | Admin statistics |
| GET | `/api/admin/users` | Admin user list |
| PATCH | `/api/admin/users/{id}/suspend` | Toggle account active state |

Interactive OpenAPI docs are at `/docs`.
