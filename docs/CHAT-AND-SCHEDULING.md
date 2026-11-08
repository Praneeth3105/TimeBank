# TimeBank chat, contact and scheduling update

## What this adds
- A phone number field at registration and in Profile.
- Phone and general city/neighbourhood are returned only to the two participants of an accepted exchange, through the authenticated Exchanges endpoint. They are not added to public people or skill listings.
- Private exchange chat stored in SQLite/PostgreSQL. The Exchanges screen refreshes messages every 4 seconds.
- Both participants can set or update the date/time, online meeting URL, in-person public meeting place and notes. Both see the latest saved details.
- Online links must start with `http://` or `https://`. In-person scheduling requires a public meeting location.

## Files changed
### Backend
- `backend/app/models.py`: adds `User.phone`, schedule fields on `Exchange`, and `ChatMessage`.
- `backend/app/schemas.py`: adds phone, chat-message and schedule request schemas.
- `backend/app/main.py`: adds a small startup migration for existing databases plus authenticated chat and schedule APIs.

### Frontend
- `frontend/src/App.tsx`: adds phone input to registration/profile and embeds private chat/contact/schedule controls in each Exchanges card.
- `frontend/src/style.css`: styles the communication and scheduling panels.

## API routes added
- `GET /api/exchanges/{exchange_id}/messages` — list messages (participants only).
- `POST /api/exchanges/{exchange_id}/messages` — send a message (participants only). Body: `{ "body": "Hello" }`.
- `PATCH /api/exchanges/{exchange_id}/schedule` — either participant updates meeting details.

## Apply to an existing checkout
1. Stop FastAPI and Vite.
2. Extract this update ZIP to a temporary folder.
3. Copy the contents of `TimeBank/` over your existing `TimeBank/` folder, allowing the changed files to replace the old versions. Do not delete your `.env` or `backend/timebank.db`.
4. Restart the backend with `python -m uvicorn app.main:app --reload`. Startup adds the new columns to existing SQLite databases.
5. Restart the frontend with `npm run dev`. No new npm or Python packages are required.
6. Existing users can add their phone number in Workspace → Profile. New users can add it during registration.

## Important privacy and product notes
- Phone and location are visible only to the accepted exchange participants, not to all members. Use a contact number you are comfortable sharing with a person after accepting an exchange.
- Use a public location for in-person meetings; do not publish a home address.
- Chat uses authenticated REST requests with 4-second polling, not WebSockets. It is suitable for local testing and a small prototype.
- Both participants can update the shared meeting details. The latest save replaces the previous details. The system does not yet detect calendar conflicts or automatically create Google Meet/Zoom rooms; users paste a meeting URL they create themselves.
- Back up `backend/timebank.db` before applying any database update.
