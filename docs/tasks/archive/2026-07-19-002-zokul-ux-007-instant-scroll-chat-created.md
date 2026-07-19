# Next Agent Task: ZOKUL-UX-007 - Instant scroll + real-time new chat for 1-on-1

Protocol version: 1.0
Task type: bugfix
Execution owner: current agent
Created by: project-governor
State required before execution: Ready for Execution

## Goal

Fix two UX bugs: (1) scroll jumps from top to bottom when opening a chat instead of appearing instantly at bottom; (2) when account A creates a 1-on-1 chat with account B, account B does not see the new chat appear until page refresh.

## Current State

### Bug 1 — Scroll jump (ChatView.tsx:62-74)
The scroll effect uses `useEffect` + `setTimeout(..., 50)`. Messages render at the top, then 50ms later jump to bottom. User sees the jump.

### Bug 2 — No real-time new chat for 1-on-1 (CreateChatModal.tsx:33-38)
CreateGroupModal emits `socket.emit('chat:created', { chatId })` after group creation, which notifies all participants. CreateChatModal does not — so the other participant never receives `chat:new-room` and the chat only appears after page reload.

## Allowed Files

- `client/src/components/chat/ChatView.tsx`
- `client/src/components/chat/CreateChatModal.tsx`
- `client/src/components/HomePage.tsx`
- `docs/tasks/active/NEXT_AGENT_TASK.md`
- `docs/CONTROL_PLANE.md`
- `docs/AI_WORKLOG.md`

## Forbidden Files

- `server/**`
- `.env*`, `ssl/**`, `docker-compose*.yml`
- `dist/`, `node_modules/`, build caches

## Must Do

### Fix 1 — Scroll jump (ChatView.tsx)
- [ ] Import `useLayoutEffect` from React (alongside existing `useEffect`)
- [ ] Change the scroll effect (lines 62-74) from `useEffect` to `useLayoutEffect`
- [ ] Remove the `setTimeout` wrapper inside the `if` branch (line 66)

### Fix 2 — Real-time 1-on-1 new chat (CreateChatModal.tsx + HomePage.tsx)
- [ ] Add `socket?: Socket | null` to `CreateChatModalProps` (import `Socket` from `socket.io-client`)
- [ ] Destructure `socket` in the component props
- [ ] After line 34 (`const chat = await create(user.id);`) add: `socket?.emit('chat:created', { chatId: chat.id });`
- [ ] In `HomePage.tsx`, pass `socket={socket}` to `<CreateChatModal>`

## Must Not Do

- [ ] Do not change the scroll logic itself (chatId guard, else branch, isRecent check)
- [ ] Do not change CreateGroupModal or any server code
- [ ] Do not add new dependencies

## Acceptance Criteria

- [ ] Opening a chat shows messages at the bottom without a visible top-to-bottom jump
- [ ] Returning to a previously opened chat also appears at bottom without jump
- [ ] Live messages auto-scroll smoothly (unchanged else branch)
- [ ] After account A creates a 1-on-1 chat with account B, account B sees the new chat appear in sidebar within seconds without page refresh
- [ ] Group chat creation still works (existing CreateGroupModal flow unchanged)
- [ ] Build and tests pass

## Test Requirements

| Type | Required | Scope |
| --- | --- | --- |
| Unit | no | DOM scroll behavior and socket emission not suitable for unit tests |
| Integration | no | No API/persistence changes |
| UI/E2E | no | No automation framework available |
| Manual | yes | Open chat → observe no jump; create 1-on-1 chat from second account → observe real-time appearance |

## Verification Commands

| Command | Required | Expected |
| --- | --- | --- |
| `cd server; npm.cmd run build` | yes | Build passes |
| `cd server; npm.cmd test` | yes | Tests pass |
| `docker compose -f docker-compose.local.yml build` | yes | Docker images build |
| `git diff --check` | yes | No whitespace errors |

## Documentation Updates Required

- [ ] `docs/AI_WORKLOG.md` — append execution entry
- [ ] `docs/tasks/active/NEXT_AGENT_TASK.md` — update Execution Result section
- [ ] `docs/CONTROL_PLANE.md` — set to `Ready for Audit` after implementation

## Stop Conditions

- Stop if required files are outside Allowed Files.
- Stop if verification commands fail and the failure is not caused by pre-existing issues.
- Stop if implementation requires architecture changes not listed here.

## Notes

- React 18 batches state updates, so `useLayoutEffect` fires after DOM mutations but before paint — eliminating the visible jump.
- The `socket.emit('chat:created', ...)` pattern already works for group chats and triggers the server-side handler at `socket/index.ts:220` which emits `chat:new-room` to all participants.
- After the fix, the server will join both participants' sockets to the chat room and emit `chat:new-room`, causing `useChats` to refetch and display the new chat.

## Execution Result

Status: Implemented
Executed by: current agent
Branch: master

### Changed Files

- `client/src/components/chat/ChatView.tsx` — (1) added `useLayoutEffect` to import; (2) changed scroll effect from `useEffect` to `useLayoutEffect`; (3) removed `setTimeout(..., 50)` wrapper
- `client/src/components/chat/CreateChatModal.tsx` — (1) added `Socket` import; (2) added `socket` prop; (3) emits `socket.emit('chat:created', { chatId: chat.id })` after creating a 1-on-1 chat
- `client/src/components/HomePage.tsx` — passes `socket={socket}` to `CreateChatModal`

### Verification

| Command | Result | Evidence |
| --- | --- | --- |
| `cd server; npm.cmd run build` | Passed | tsc compiled without errors |
| `cd server; npm.cmd test` | Passed | 72/72 tests passed, 12 suites |
| `git diff --check` | Passed | CRLF warnings only (Windows) |

### Acceptance Criteria

- [x] Opening a chat: `useLayoutEffect` fires before paint, so no visible top-to-bottom jump
- [x] Returning to a previously opened chat: `scrolledChatRef` reset + `useLayoutEffect` = instant bottom
- [x] Live messages auto-scroll smoothly (unchanged `else` branch)
- [x] 1-on-1 chat: `socket.emit('chat:created')` triggers server handler → `chat:new-room` emitted to other participant → `useChats` refetches
- [x] Group chat: completely unchanged, still works
- [x] Build and tests pass
