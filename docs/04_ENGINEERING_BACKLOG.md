# Engineering Backlog

Last reviewed: 2026-07-17
Source commit: 96d5818

## Done / Recently Completed

- [x] ZOKUL-CHAT-UX-001 Fix chat opening, scroll, and delete placement
  - Status: Accepted
  - Priority: P1
  - Result:
    - Nested delete button removed from ChatList (chat rows are clean `<button>`)
    - Delete action moved to selected-chat header `⋮` menu with confirmation modal
    - Scroll logic tracks by `chatId`, not message count — works for short chats
    - Build/tests passed; User QA confirmed on real phone

- [x] ZOKUL-SEC-001 Harden Socket.IO chat access
  - Status: Done
  - Priority: P0
  - Commits:
    - `7609f40 fix: harden realtime auth, uploads, and tests`
    - `96d5818 fix: secure chat leave handling`
  - Result:
    - `chat:join`, `message:typing`, `chat:created`, and `chat:leave` check participant access.
    - `chat:created` no longer trusts client-provided participant IDs.

- [x] ZOKUL-REL-001 Fix multi-tab presence offline behavior
  - Status: Done
  - Priority: P0
  - Commit: `7609f40`
  - Result:
    - user goes offline only after last socket disconnects.

- [x] ZOKUL-SEC-002 Harden upload validation
  - Status: Done
  - Priority: P1
  - Commit: `7609f40`
  - Result:
    - stricter MIME whitelist;
    - invalid image cleanup.

- [x] ZOKUL-TEST-001 Stabilize test suite
  - Status: Done
  - Priority: P1
  - Commits: `7609f40`, `96d5818`
  - Verification:
    - last known `npm.cmd test`: 71/71 passed.

## P1: Test Quality

- [ ] ZOKUL-TEST-002 Add real Socket.IO integration tests
  - Status: Todo
  - Priority: P1
  - Goal: Test actual socket handlers with client/server instead of only duplicated access-control logic.
  - Files:
    - `server/__tests__/socket.test.ts`
    - possible test utilities
  - Acceptance criteria:
    - participant/non-participant join/leave/typing scenarios are tested through Socket.IO behavior;
    - no unused dependencies are added.

## P1: Build Hygiene

- [ ] ZOKUL-DX-001 Resolve generated build file changes
  - Status: Todo
  - Priority: P1
  - Files:
    - `client/tsconfig.node.tsbuildinfo`
    - `client/tsconfig.tsbuildinfo`
    - `client/vite.config.js`
    - `.gitignore`
  - Goal: Decide whether generated TypeScript/Vite artifacts should be tracked.
  - Acceptance criteria:
    - after `npm.cmd run build`, `git status --short` has no unexpected generated changes;
    - generated files are ignored or intentionally tracked.

## P2: Database Governance

- [ ] ZOKUL-DB-001 Improve migration governance
  - Status: Todo
  - Priority: P2
  - Source: `docs/08_DATABASE_MIGRATION_POLICY.md`
  - Goal: Move from runtime `migrate()` toward versioned migrations when project grows.
  - Out of scope: do not introduce a migration framework in a mixed security/UI task.

## P2: Observability

- [ ] ZOKUL-INC-001 Production runtime identity and push recovery
  - Status: Ready for Executor
  - Priority: P0
  - Evidence: public bundle is older than `origin/production`; existing browser push subscriptions are not re-posted after database data is cleared.
  - Goal: add deploy/runtime verification and reliable subscription reconciliation without exposing secrets.

- [ ] ZOKUL-OPS-001 Add runtime observability plan
  - Status: Todo
  - Priority: P2
  - Goal: Define metrics/logging/alerting for production readiness.
  - Acceptance criteria:
    - request/socket/upload/push failure signals identified;
    - production monitoring candidate selected.
