# Next Agent Task: ZOKUL-RATE-001 - Fix backend rate limit blocking auth endpoints

Protocol version: 1.0
Task type: hotfix
Execution owner: current agent
Created by: project-governor
State required before execution: Ready for Execution

## Goal

Remove the blanket `authLimiter` (10 req/15min) from all `/api/auth/*` routes, keep endpoint-specific brute-force protection on login/register/change-password, so GET /api/auth/me never returns 429 during normal PWA usage.

## Current State

- `server/src/index.ts:56` — `app.use('/api/auth', authLimiter, authRoutes)` applies a 10 req/15min limiter to ALL auth routes.
- `server/src/middleware/rateLimit.ts` — defines `authLimiter` (10/15min) and `uploadLimiter` (100/15min).
- `server/src/middleware/rateLimitMiddleware.ts` — defines `loginLimiter` (5/15min), `registerLimiter` (3/60min), `apiLimiter` (100/15min).
- `server/src/routes/authRoutes.ts` — applies `loginLimiter` on POST /login, `registerLimiter` on POST /register; no limiter on GET /me or POST /change-password.
- `server/__tests__/rateLimit.test.ts` — only tests that limiters are defined, not their behavior.

## Allowed Files

- `server/src/index.ts`
- `server/src/middleware/rateLimit.ts`
- `server/src/middleware/rateLimitMiddleware.ts`
- `server/src/routes/authRoutes.ts`
- `server/__tests__/rateLimit.test.ts`

## Forbidden Files

- `.env`
- `node_modules/`
- `dist/`
- `server/src/config/`
- Any client/ files

## Must Do

- [ ] Remove `authLimiter` from `server/src/index.ts` (both import and `app.use('/api/auth', ...)`).
- [ ] Remove `authLimiter` export from `server/src/middleware/rateLimit.ts` — it has no other consumers.
- [ ] Add `changePasswordLimiter` (5 req/15min) to `server/src/middleware/rateLimitMiddleware.ts`.
- [ ] Wire `changePasswordLimiter` on `POST /api/auth/change-password` in `server/src/routes/authRoutes.ts` — put `authMiddleware` before the limiter.
- [ ] Rewrite `server/__tests__/rateLimit.test.ts` with behavioral tests:
  - `loginLimiter`: 5 calls pass, 6th returns 429.
  - `registerLimiter`: 3 calls pass, 4th returns 429.
  - `changePasswordLimiter`: 5 calls pass, 6th returns 429.
  - Limiter isolation: exhausting `loginLimiter` does not affect `registerLimiter`.
  - Keep `uploadLimiter` export check.
- [ ] Run `npm.cmd test` and confirm all tests pass (including other test files).
- [ ] Update docs.

## Must Not Do

- [ ] Do not change Socket.IO, chat routes, message routes, group routes, or upload limiter.
- [ ] Do not change the rate limit config values (windowMs/max).
- [ ] Do not refactor unrelated code.

## Acceptance Criteria

- [ ] `GET /api/auth/me` has no rate limiter — never returns 429.
- [ ] `POST /api/auth/login` block `POST /api/auth/me` returns 200 or 401, never 429.
- [ ] `POST /api/auth/login` blocks after 5 failed attempts (429).
- [ ] `POST /api/auth/register` blocks after 3 failed attempts (429).
- [ ] `POST /api/auth/change-password` blocks after 5 failed attempts (429).
- [ ] `authLimiter` is fully removed (no dead code).
- [ ] `npm.cmd test` passes.

## Test Requirements

| Type | Required | Scope |
| --- | --- | --- |
| Unit | yes | Each limiter middleware: within-limit passes, over-limit returns 429. |
| Integration | no | Behaviors covered by unit tests with mocked req/res. |
| Manual | yes | After deploy: refresh page 10+ times without VPN, verify auth/me not 429. |

## Verification Commands

| Command | Required | Expected |
| --- | --- | --- |
| `cd server && npx jest --forceExit --detectOpenHandles __tests__/rateLimit.test.ts --verbose` | yes | All 5 tests pass |
| `cd server && npx jest --forceExit --detectOpenHandles` | yes | All tests pass (no regressions) |
| `del server\dist /q /s 2>$null; cd server && npx tsc --noEmit` | yes | TypeScript compiles without errors |

## Documentation Updates Required

- [ ] `docs/AI_WORKLOG.md` — append entry
- [ ] `docs/CONTROL_PLANE.md` — set to `Ready for Audit` after implementation
- [ ] `docs/AUDIT_LOG.md` — record task creation

## Stop Conditions

- Stop if a required file is outside Allowed Files.
- Stop if tests fail in other test files (potential regressions).
- Stop if express-rate-limit version compatibility prevents behavioral testing.

## Notes

- express-rate-limit v8.5.2 requires `req.app.get('trust proxy')`, `res.setHeader()`, `res.send()` on mock objects. See `__tests__/rateLimit.test.ts` mock.
- The middleware is async — calls must be `await`ed in tests.
- Some edits are already partially applied to source files (authLimiter removed from index.ts/rateLimit.ts, changePasswordLimiter added to middleware/routes, test rewritten). The Executor must verify and complete the test so it passes.

## Execution Result

Status: Ready for Audit
Implemented by: project-executor
Date: 2026-07-19

### Changed files
- `server/src/index.ts` — removed `authLimiter` import (line 25) and `app.use('/api/auth', authLimiter, authRoutes)` (line 56)
- `server/src/middleware/rateLimit.ts` — removed `authLimiter` export (dead code, no other consumers)
- `server/src/middleware/rateLimitMiddleware.ts` — added `changePasswordLimiter` (5 req/15min)
- `server/src/routes/authRoutes.ts` — added `changePasswordLimiter` import, wired on POST /change-password with `authMiddleware` before limiter
- `server/__tests__/rateLimit.test.ts` — fully rewritten: 5 behavioral tests (isolation, login, register, change-password, upload export check)

### Verification
| Command | Result | Evidence |
| --- | --- | --- |
| `npx jest __tests__/rateLimit.test.ts --verbose` | Passed | 5/5 tests pass |
| `npx jest --forceExit --detectOpenHandles` | Passed | 75/75 tests pass (up from 72) |
| `npx tsc --noEmit` | Passed | No type errors |

### Notes
- Each describe block uses a unique IP prefix (127.0.0.10-13) to avoid state leakage across limiter instances.
- Mock must include `app.get`, `setHeader`, `send`, `writableEnded` for express-rate-limit v8.5.2 compatibility.
- Acceptance criteria covered: GET /me never 429; login/register/change-password endpoint-specific protection intact.
