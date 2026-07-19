# Security Notes

Last reviewed: 2026-07-17
Source commit: 96d5818

## Auth

- JWT is stored in an httpOnly cookie.
- Cookie uses `sameSite: strict`.
- Cookie `secure` is dynamic based on HTTPS/proxy.
- `authMiddleware` verifies token and tokenVersion.
- Password hashing uses bcryptjs.
- Password validation minimum length is enforced in auth service.

## REST Authorization

- Authenticated routes use `authMiddleware`.
- Chat message routes use participant checks where routed through `checkParticipant`.

## Socket.IO Authorization

Current hardening:

- socket connection authenticates via token/cookie;
- `chat:join` checks participant access;
- `message:typing` checks participant access;
- `message:send/edit/delete` checks participant access;
- `chat:created` gets participant IDs from DB, not client payload;
- `chat:leave` checks participant access.

Risk:

- socket tests are not yet full integration tests.

## Uploads

- `uploadMiddleware` uses image/audio MIME whitelist.
- `processImage` and `processAvatar` validate images through `sharp`.
- failed image processing removes temporary file.
- file size limit is 20 MB.

Risk:

- audio validation is MIME-based, not full content sniffing.
- media is local disk storage; object storage/CDN is future scaling work.

## Secrets

Never commit:

- `.env`;
- real JWT secrets;
- real VAPID private keys;
- production DB credentials.

## Approval Required

Require explicit user approval for:

- production branch changes;
- deploy;
- destructive DB migration;
- auth/security config with broad impact;
- force push/reset;
- deleting user data or uploads.
