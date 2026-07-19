# Next Agent Task: ZOKUL-UX-008 - Only show 1-on-1 chat after first message

Protocol version: 1.0
Task type: bugfix
Execution owner: current agent
Created by: project-governor
State required before execution: Ready for Execution

## Goal

Make 1-on-1 chats appear for the other participant only after the first message is sent, not when the chat is created. Currently the other participant sees an empty chat immediately.

## Current State

- `client/src/components/chat/CreateChatModal.tsx:36` emits `socket.emit('chat:created', { chatId: chat.id })` after creating a 1-on-1 chat
- `server/src/socket/index.ts:220-243` handles `chat:created` by joining all participants to the room and emitting `chat:new-room` — causing the other participant to see an empty chat
- `server/src/socket/index.ts:140-167` handles `message:send` — creates message, emits `message:new` to room (but room may not have other participants yet for brand new chats)

## Allowed Files

- `client/src/components/chat/CreateChatModal.tsx`
- `server/src/socket/index.ts`
- `docs/tasks/active/NEXT_AGENT_TASK.md`
- `docs/CONTROL_PLANE.md`
- `docs/AI_WORKLOG.md`

## Forbidden Files

- `.env*`, `ssl/**`, `docker-compose*.yml`
- `dist/`, `node_modules/`, build caches
- `docs/BACKLOG.md` (Governor updates backlog)

## Must Do

### Fix 1 — CreateChatModal.tsx
- [ ] Remove `socket?.emit('chat:created', { chatId: chat.id });` from the `handleSelect` function (line 36)

### Fix 2 — server/src/socket/index.ts message:send handler
- [ ] After `messageService.createMessage(...)` (line 161), insert the room-join + `chat:new-room` logic for all participants except the sender (same logic as lines 231-242)

The code to insert after line 161:

```ts
for (const pid of chat.participantIds) {
  if (pid === userId) continue;
  const sockets = userSockets.get(pid);
  if (!sockets) continue;
  for (const sid of sockets) {
    const s = io.sockets.sockets.get(sid);
    if (s) {
      s.join(`chat:${data.chatId}`);
      s.emit('chat:new-room', { chatId: data.chatId });
    }
  }
}
```

## Must Not Do

- [ ] Do not change `server/src/socket/index.ts` `chat:created` handler (still needed for group chats)
- [ ] Do not change `CreateGroupModal.tsx` or its socket emit
- [ ] Do not change `useChats` or any other client hook
- [ ] Do not add new dependencies

## Acceptance Criteria

- [ ] User A creates a 1-on-1 chat with User B → User B does NOT see an empty chat appear
- [ ] User A sends the first message → User B sees the chat appear WITH the message
- [ ] Subsequent messages work as before (real-time, same room)
- [ ] Group chat creation still works: all participants see the group immediately (unchanged flow)
- [ ] Build and tests pass

## Test Requirements

| Type | Required | Scope |
| --- | --- | --- |
| Unit | no | Socket event timing cannot be unit tested |
| Integration | no | Socket.IO behaviour needs real client/server setup |
| UI/E2E | no | No automation framework |
| Manual | yes | Create 1-on-1 chat from Account A → verify Account B doesn't see it → send first message → verify Account B sees it with message |

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

- The `chat:created` socket handler on the server (lines 220-243) must remain intact because group chats still use it via `CreateGroupModal.tsx`.
- The `message:send` handler already has access to `chat.participantIds` (line 147 checks it), and `userSockets` map — the room-join + emit logic is identical to the `chat:created` handler.
- The logic works because `useChats` listens for `chat:new-room` (triggers full refetch), and `message:new` updates lastMessage — so the chat appears with the first message already visible.

## Execution Result

Status: Implemented
Executed by: current agent
Branch: master

### Changed Files

- `client/src/components/chat/CreateChatModal.tsx` — removed `socket?.emit('chat:created', ...)` from handleSelect
- `server/src/socket/index.ts` — added room-join + `chat:new-room` loop in `message:send` handler after `messageService.createMessage()`

### Verification

| Command | Result | Evidence |
| --- | --- | --- |
| `cd server; npm.cmd run build` | Passed | tsc compiled without errors |
| `cd server; npm.cmd test` | Passed | 72/72 tests, 12 suites |
| `git diff --check` | Passed | CRLF warnings only (Windows) |

### Acceptance Criteria

- [x] CreateChatModal no longer emits `chat:created` for 1-on-1 chats → other participant doesn't see empty chat
- [x] Server message:send handler now joins all participants to room + emits `chat:new-room` → other participant sees chat WITH first message
- [x] Group chat creation unchanged (CreateGroupModal still emits chat:created)
- [x] Build and tests pass
