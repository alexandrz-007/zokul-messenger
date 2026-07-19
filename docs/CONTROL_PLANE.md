# Control Plane

Protocol version: 1.0
Mode: standard
State: Accepted
Active task: ZOKUL-READ-002
Active review: ZOKUL-READ-002 (Stage 2) - Accepted
Owner: project-executor
Last updated: 2026-07-19

## Current Focus

Read Receipts COMPLETE (Stage 1 backend + Stage 2 frontend, both Accepted). Branch `feature/read-receipts` ready to merge to master then production (killer PWA retained). Manual Safari/iPhone verification deferred to deploy step.

## Current Focus

ZOKUL-READ-001 (Stage 1): Read receipts backend. Add `message_reads` table (per-message), `markChatRead`/`getReadReceipts` in Message model+service, `chat:read` socket listener emitting `message:read` to room (excluding sender). Frontend is Stage 2 (deferred). Production stays on killer PWA; no deploy/PWA/SSL/Cloudflare changes.

## Secondary incident (2026-07-19): SSL cert mismatch on direct IP — RESOLVED

- Symptom: Firefox "potential security risk" / HSTS screen; without VPN browser hung on loading.
- Root cause: `~/zokul/ssl/fullchain.pem` contained a self-signed `CN=localhost` cert (notAfter Jul 20), not the Let's Encrypt cert.
- Resolution: copied `/etc/letsencrypt/live/zokul.zhichkin.space/{fullchain,privkey}.pem` into `~/zokul/ssl/`, restarted `client`. Verified `CN = zokul.zhichkin.space`, notAfter Oct 10 2026.

## Next Required Action

Executor implements ZOKUL-NET-001: add `tunnel` service to docker-compose.prod.yml + DEPLOY_GUIDE tunnel section. User creates tunnel in Cloudflare UI, adds token to server .env, runs `docker compose up -d tunnel`, verifies `curl https://zokul.zhichkin.space` returns 200 without VPN.

## Blockers

- None. Tunnel token requires user action in Cloudflare UI.
