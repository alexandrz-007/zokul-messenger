# Next Agent Task: PWA-EMERGENCY-001 - Emergency SW self-destruct to fix stale cache

Protocol version: 1.0
Task type: hotfix
Execution owner: current agent
Created by: project-governor
State required before execution: Ready for Execution

## Goal

Emergency-fix: make the Service Worker self-destruct (delete all caches, skip waiting, claim clients, unregister, reload windows) so the site works as a plain web app after deploy, until a proper PWA strategy is implemented in Phase 2.

## Current State

- `client/sw.ts` uses `precacheAndRoute()`, caches `/api/*` via `NetworkFirst`, has no `skipWaiting`/`clientsClaim`.
- After deploy, old SW serves stale precached `index.html` and stale API cache → app broken on refresh.
- User must append `?v=clean3` to bypass cache.

## Allowed Files

- `client/sw.ts`

## Forbidden Files

- `.env`
- `node_modules/`
- `dist/`
- `server/`
- `client/vite.config.ts`
- `client/vite.config.js`
- `client/vite.config.d.ts`

## Must Do

- [ ] Replace entire `client/sw.ts` with emergency self-destruct SW:
  ```typescript
  /// <reference lib="webworker" />
  declare const self: ServiceWorkerGlobalScope;

  self.addEventListener('install', () => { self.skipWaiting(); });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys()
        .then((names) => Promise.all(names.map((n) => caches.delete(n))))
        .then(() => self.clientsClaim())
        .then(() => self.registration.unregister())
        .then(() => {
          // Reload all open windows/tabs
          self.clients.matchAll({ type: 'window' }).then((clients) => {
            clients.forEach((client) => client.navigate(client.url));
          });
        })
    );
  });
  ```
- [ ] Run `npm.cmd run build` to confirm SW compiles.
- [ ] Run `npm.cmd test` to confirm no regressions.
- [ ] **Do NOT change** `vite.config.ts` or any other file.

## Must Not Do

- [ ] Do not implement any proper PWA strategy in this task (reserved for Phase 2).
- [ ] Do not change `vite.config.ts`, `sw.ts` registration in main app, or any server/client code.

## Acceptance Criteria

- [ ] Built `dist/sw.js` exists and contains `skipWaiting`, `clientsClaim`, `unregister`, `caches.delete`.
- [ ] `npm.cmd run build` passes (client + server).
- [ ] `npm.cmd test` passes.
- [ ] Docker build passes.
- [ ] After deploy: open site in fresh tab → no stale cache, works without `?v=clean3`.

## Test Requirements

| Type | Required | Scope |
| --- | --- | --- |
| Build | yes | `npm.cmd run build` must compile SW |
| Manual | yes | After deploy, test on iPhone/Safari/PC without VPN |

## Verification Commands

| Command | Required | Expected |
| --- | --- | --- |
| `cd client && npx tsc --noEmit` | yes | No type errors |
| `cd client && npm run build` | yes | `dist/sw.js` built |
| `cd .. && npm test` | yes | All tests pass |
| `docker compose -f docker-compose.prod.yml build` | yes | Images build |

## Documentation Updates Required

- [ ] `docs/AI_WORKLOG.md`
- [ ] `docs/CONTROL_PLANE.md`
- [ ] `docs/DEPLOY_GUIDE.md` — add PWA emergency steps

## Stop Conditions

- Stop if SW build fails.
- Stop if tests fail.
- Stop if changes required outside `client/sw.ts`.

## Notes

- Phase 1 only — Phase 2 (proper PWA) will be a separate task after user confirms emergency fix works.
- Emergency SW has NO push notification support. Push will be restored in Phase 2.
- After unregister + navigate, all windows reload with fresh server content.

## Execution Result

Status: Not started
