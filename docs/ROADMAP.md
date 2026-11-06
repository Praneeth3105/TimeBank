# Implementation status and roadmap

## Included in this runnable MVP
- Public landing page, login and registration
- Member dashboard, profile editing and people discovery
- Skill listings, service requests and accept/decline
- Exchange confirmation by both parties
- Wallet, ledger and idempotent credit settlement
- Reviews API and basic admin statistics/user controls
- Responsive styling and local demo seed data

## Next implementation phases
1. Email verification, password reset and refresh-token rotation.
2. Availability calendar, richer service scheduling and cancellation/expiry policies.
3. Real-time one-to-one messaging, read receipts, block/report and notifications using WebSockets.
4. Moderator role and granular permission matrix; dispute/report queues and audited resolution.
5. Category management, admin transaction explorer and platform settings UI.
6. Image uploads via Cloudinary/S3 with file validation and malware scanning.
7. Smart skill matching using weighted skill/location/availability/rating/history signals.
8. AI assistant and suspicious-activity flagging with human review.
9. Alembic migrations, rate limiting, security headers, observability, backups and deployment automation.
10. Expanded integration, concurrency, authorization and security tests.

The blueprint specifies a starter allowance of 2 credits as the recommended policy. This MVP applies that policy once at registration. Verify that it is the final policy before production.
