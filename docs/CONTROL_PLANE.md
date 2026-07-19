# Control Plane

Protocol version: 1.0
Mode: standard
State: Accepted
Active task: None
Active review: ZOKUL-DOCS-001 - Accepted
Owner: project-executor
Last updated: 2026-07-19

## Current Focus

Idle. Last work (ZOKUL-DOCS-001 docs sync) complete. Production is current:
- read receipts (ZOKUL-READ-001/002) deployed to production (e52812f).
- auto-scroll fix (ZOKUL-SCROLL-001) deployed to production (9897dd5).
- `feature/pwa-proper` NOT merged; killer PWA (`sw.ts`) is production default.
- Cloudflare tunnel OFF per user; direct 443 + killer PWA only.

## Recently Completed

- **ZOKUL-READ-001** (Stage 1, backend) — `message_reads` table, `markChatRead` (participant-checked, `ON CONFLICT DO NOTHING`), `getReadReceipts`, `chat:read` socket -> `message:read`. Accepted. In production (e52812f).
- **ZOKUL-READ-002** (Stage 2, frontend) — `chat:read` emitted on chat open; `message:read` updates `readBy`; ChatView read ticks; types + tests. Accepted. In production (e52812f).
- **ZOKUL-SCROLL-001** (auto-scroll on chat switch) — `scrollContainerRef` + `key={chatId}` + rAF + near-bottom 120px. Accepted. In production (9897dd5).
- **ZOKUL-SCROLL-002** — ResizeObserver experiment; REGRESSED scroll ("middle/start" more often). Reverted to ZOKUL-SCROLL-001 at 9222807; user re-verified browser behavior OK.
- **ZOKUL-DOCS-001** — synced docs to production reality; archived scroll-002 artifacts.
- **PWA-PROPER-001** — split SW into build-time `sw.kill.ts`/`sw.pwa.ts` + `select-sw.mjs`. Branch `feature/pwa-proper` (NOT merged; killer stays production-default).
- **PWA-EMERGENCY / SSL / ZOKUL-RATE-001 / ZOKUL-NET-001** — resolved/accepted earlier; production on killer PWA.

## Next Required Action

1. (Deferred, manual) Verify read receipts on real Safari/iPhone.
2. (Optional, future) Merge `feature/pwa-proper` only after manual Safari stability confirmed.
3. Keep production on killer SW (`sw.ts` = killer, inherited from master).

## Blockers

- None.

## Notes

- `feature/pwa-proper` remains separate; do NOT merge until manual Safari stability confirmed.
- Cloudflare tunnel (ZOKUL-NET-001) is off per user; direct 443 + killer PWA only.
