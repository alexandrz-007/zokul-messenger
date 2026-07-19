# Project Health

Last reviewed: 2026-07-17
Source commit: d61adcf
Reviewed by: Governor

## Current Branch State

- Main branch: `master`
- Production branch: `production`
- Active work branch: `master`
- Local status: cleanup in progress, not pushed
- Dirty working tree: Yes, limited to repository hygiene and documentation path consolidation before commit

Known dirty/untracked items at migration time:

- removing generated `client/vite.config.js` and `client/vite.config.d.ts`
- removing `reports/`, `server/test-uploads/`, and `fixer-brain.md`
- moving protocol documentation from `docs/ai/*` into `docs/*`
- removing duplicate legacy documentation files in `docs/00...10...`, `docs/PROCESS.md`, `docs/PROGRESS.md`, and `docs/FUTURE_PLAN.md`

## Verification Status

| Check | Status | Last run | Notes |
|---|---|---|---|
| Build | Passed | 2026-07-18 | `npm.cmd run build` passed (ZOKUL-CHAT-UX-001) |
| Tests | Passed | 2026-07-18 | `npm.cmd test` passed, 19/19 |
| Release package | Pending | 2026-07-18 | Will run `prepare-release.ps1` after commit |
| Docker build | Passed | 2026-07-18 | `docker compose -f docker-compose.local.yml build` passed |
| Lint | Unknown |  | Not run during chat UX fixes |
| Security review | Partial | 2026-07-17 | Realtime/upload/auth hardening reviewed |
| Docs freshness | Current | 2026-07-18 | Protocol docs updated; chat UX task accepted |

## Active Task

- Task: ZOKUL-UX-007 Fix instant scroll and real-time new chat for 1-on-1
- Status: Ready for Planning
- Owner role: Governor/Executor
- Risk: Low
- Confidence: High

## Known Risks

- Full Socket.IO integration tests are still missing.
- Build may continue to modify tracked/generated client files.
- Runtime DB migration approach is acceptable for MVP but should move toward versioned migrations later.
- Uploads are local-disk based; object storage/CDN is future scaling work.
- Push notifications currently arrive, but subscription recovery after a DB reset and delivery-error observability remain hardening gaps.

## Next Recommended Action

1. Fix scroll jump by using useLayoutEffect instead of useEffect + setTimeout.
2. Fix 1-on-1 chat real-time notification by adding socket.emit('chat:created') in CreateChatModal.
3. Push hardening — ZOKUL-PUSH-001 after UX fixes.

## Risk Matrix

| Area | Risk | Impact | Likelihood | Owner | Mitigation | Status |
|---|---|---|---:|---:|---|---|---|
| Realtime | Socket handlers may lack true integration tests | Medium | Medium | Governor/Executor | Add real Socket.IO integration tests | Open |
| Build hygiene | TypeScript/Vite generated files appear in working tree | Medium | High | Governor/Executor | Decide ignore/remove/tracking policy | Open |
| Database | Runtime migrate function may drift as schema grows | Medium | Medium | Governor | Follow migration policy and plan versioned migrations | Open |
| Uploads | Audio validation is MIME-based only | Medium | Medium | Security Agent | Consider content sniffing or stricter audio handling | Open |
| Media storage | Local uploads do not scale well | Medium | Medium | Governor | Plan S3/R2/MinIO and CDN when usage grows | Planned |
| Deployment | Production branch can be accidentally touched | High | Low | Release Agent | Human approval gate | Controlled |
| Docs | Documentation path changes can break agent navigation | Medium | Medium | Documentation Agent | Keep one canonical `docs/` tree and update internal references | Controlled |
