# Next Agent Task: PWA-EMERGENCY-001-REMEDIATION - Fix SW no-response on API requests

Protocol version: 1.0
Task type: remediation
Execution owner: current agent
Created by: project-governor
State required before execution: Ready for Execution

## Goal

Fix the emergency Service Worker so it stops intercepting API/navigation requests with a workbox precache handler that rejects with "no-response". The site must work as a plain web app after deploy.

## Current State

- `client/sw.ts` (commit d70775f / production b70d25d) was replaced with an emergency self-destruct SW.
- It calls `precacheAndRoute(self.__WB_MANIFEST)` from `workbox-precaching`. This registers a `fetch` event listener.
- In `activate`, the handler deletes ALL caches, then `clientsClaim()`, then `unregister()`.
- Between `clientsClaim()` and `unregister()` the SW controls pages and workbox intercepts `/api/*` requests. Because the precache is already empty, workbox rejects the fetch with `Error: no-response`.
- Confirmed in production: browser console shows
  `Failed to load 'https://zokul.zhichkin.space/api/auth/me'. ServiceWorker passed a promise to FetchEvent.respondWith() which rejected with error 'Error: no-response'`.
- Confirmed server API works: `POST /api/auth/login` and `POST /api/auth/register` return 200 and create users. The bug is purely client-side SW behavior.

## Allowed Files

- `client/sw.ts`

## Forbidden Files

- `.env`
- `node_modules/`
- `dist/`
- `server/`
- `client/vite.config.ts`
- `client/src/**`

## Must Do

- [ ] Remove `import { precacheAndRoute } from 'workbox-precaching'` from `client/sw.ts`.
- [ ] Remove the `precacheAndRoute(self.__WB_MANIFEST)` call.
- [ ] Keep a reference to `self.__WB_MANIFEST` (required by vite-plugin-pwa injectManifest build) — e.g. `self.__WB_MANIFEST;` — so the build still injects the manifest without importing workbox runtime.
- [ ] Add a `fetch` event handler that does `event.respondWith(fetch(event.request))` (network-only, no cache). This guarantees API/navigation requests go straight to the network and never reject.
- [ ] Keep the emergency behavior: `install` -> `skipWaiting()`; `activate` -> delete all caches, `clientsClaim()`, `unregister()`, navigate all windows.

## Must Not Do

- [ ] Do not reintroduce any workbox runtime import or `precacheAndRoute`.
- [ ] Do not change `vite.config.ts`, the SW registration code, or any other file.
- [ ] Do not implement a proper PWA strategy (that is Phase 2).

## Acceptance Criteria

- [ ] Built `dist/sw.js` exists and contains `skipWaiting`, `clientsClaim`, `unregister`, `caches.delete`, and a `respondWith(fetch(` network-only handler.
- [ ] Built `dist/sw.js` contains NO `precacheAndRoute` and NO `workbox-precaching` import.
- [ ] `npm run build` passes (client + server).
- [ ] `npm test` passes.
- [ ] Docker build passes.
- [ ] After deploy: opening the site in a fresh tab without `?v=clean3` no longer logs `no-response` for `/api/auth/me`; the app loads and auth works.

## Test Requirements

| Type | Required | Scope |
| --- | --- | --- |
| Build | yes | `npm run build` must compile SW without workbox-precaching |
| Grep | yes | `dist/sw.js` must not contain `precacheAndRoute` or `workbox-precaching` |
| Manual | yes | After deploy, test on PC/iPhone/Safari without VPN |

## Verification Commands

| Command | Required | Expected |
| --- | --- | --- |
| `cd client && npm run build` | yes | `dist/sw.js` built, no workbox-precaching import |
| `cd .. && npm test` | yes | All tests pass |
| `docker compose -f docker-compose.prod.yml build` | yes | Images build |
| `grep -c precacheAndRoute client/dist/sw.js` | yes | 0 |

## Documentation Updates Required

- [ ] `docs/AI_WORKLOG.md`
- [ ] `docs/CONTROL_PLANE.md`
- [ ] `docs/AUDIT_LOG.md`

## Stop Conditions

- Stop if SW build fails.
- Stop if tests fail.
- Stop if changes required outside `client/sw.ts`.

## Notes

- Phase 1 only. Phase 2 (proper PWA) is a separate task after user confirms the emergency fix works.
- Emergency SW has NO push notification support. Push will be restored in Phase 2.

## Execution Result

Status: Not started
