# Control Plane

Protocol version: 1.0
Mode: standard
State: Accepted
Active task: ZOKUL-SCROLL-002
Active review: ZOKUL-SCROLL-002 - Accepted
Owner: project-executor
Last updated: 2026-07-19

## Current Focus

ZOKUL-SCROLL-002 Accepted (ResizeObserver-driven stick-to-bottom). Branch `feature/scroll-fix` ready to merge
to master then production (killer PWA retained). Pending production deploy + manual Safari/iPhone check.

## Recently Completed

- **ZOKUL-READ-001** (Stage 1, backend) — `message_reads` table, `markChatRead` (participant-checked, `ON CONFLICT DO NOTHING`), `getReadReceipts`, `chat:read` socket -> `message:read`. Accepted.
- **ZOKUL-READ-002** (Stage 2, frontend) — `chat:read` emitted on chat open; `message:read` updates `readBy`; ChatView read ticks; types + tests. Accepted. Merged to master (9cbede6).
- **PWA-PROPER-001** — split SW into build-time `sw.kill.ts`/`sw.pwa.ts` + `select-sw.mjs`. Branch `feature/pwa-proper` (NOT merged; killer stays production-default).
- **PWA-EMERGENCY / SSL / ZOKUL-RATE-001 / ZOKUL-NET-001** — resolved/accepted earlier; production on killer PWA.

## Next Required Action

1. Deploy read-receipts to production: `prepare-release.ps1`, push `master:production --force`, server `git reset --hard origin/production && docker compose -f docker-compose.prod.yml up -d --build`.
2. Verify `/api/health`, `message:read`/`chat:read` behavior, and (manual) Safari/iPhone read ticks.
3. Keep production on killer SW (`sw.ts` = killer, inherited from master).

## Blockers

- None.

## Notes

- `feature/pwa-proper` remains separate; do NOT merge until manual Safari stability confirmed.
- Cloudflare tunnel (ZOKUL-NET-001) is off per user; direct 443 + killer PWA only.
