# Next Agent Task: ZOKUL-READ-002 - Read Receipts (Stage 2: frontend)

Protocol version: 1.0
Task type: implementation
Execution owner: current agent (executor under governor)
Created by: project-governor
State required before execution: Ready for Execution

## Goal

Frontend for read receipts. Depends on Stage 1 backend (`chat:read` socket event + `message:read` broadcast + `message_reads` table). When user opens a chat, emit `chat:read` so backend marks others' messages read and broadcasts `message:read`. Other participants' clients update read ticks on sender's messages. Chat list unread count resets on open (already client-side; reinforced by server marking).

## Current State

- Backend Stage 1 done & accepted: `socket.on('chat:read')` marks others' messages read, emits `message:read {chatId, userId, messageIds}` to room (not sender).
- Frontend `useChat.ts`: `useUnread` (in-memory Map, +1 on `message:new` in inactive chat, `markRead` deletes entry), `useMessages` (fetch + socket message:new/edited/deleted).
- `ChatView.tsx` renders messages; mine vs others; shows single check + edited + time. No read state.
- `HomePage.tsx`: `handleSelectChat` calls `markRead(chat.id)`.
- `ChatList.tsx`: badge from `unreadCount(chat.id)`.

## Allowed Files

- `client/src/types/index.ts`
- `client/src/hooks/useChat.ts`
- `client/src/components/chat/ChatView.tsx`
- `client/__tests__/` (new test for read-receipt logic)
- `docs/CONTROL_PLANE.md`, `docs/AI_WORKLOG.md`, `docs/tasks/active/NEXT_AGENT_TASK.md`

## Forbidden Files

- `server/**` (Stage 1 complete; do NOT change backend)
- `client/src/services/api.ts` (no REST read endpoint in scope)
- deploy/PWA/SSL/Cloudflare

## Must Do

- [ ] `types/index.ts`: add `ReadReceipt { messageId; userId; readAt }`; add `Message.readBy?: string[]`; add `Chat.unreadCount?: number`.
- [ ] `useChat.ts` `useUnread.markRead(chatId)`: also `socket?.emit('chat:read', { chatId })` so backend marks read + broadcasts `message:read` to others. Keep local map reset.
- [ ] `useChat.ts` `useMessages`: add `socket.on('message:read', ({chatId, userId, messageIds}) => ...)` handler that, for each id in `messageIds`, marks the local message (if it belongs to current user as sender) by adding `userId` to `readBy`. Remove on cleanup.
- [ ] `ChatView.tsx`: for `isMine` messages, render read indicator:
  - no `readBy` (or empty) -> single check (sent)
  - `readBy.length > 0` -> "Read" / double-check (for 1-on-1); for groups show `Read ${readBy.length}` or "Read".
  - Do NOT show read state on others' messages.
- [ ] Tests: add `client/__tests__/readReceipts.test.ts(x)` mocking socket via `SocketContext` to assert: (a) opening chat emits `chat:read`; (b) `message:read` handler adds reader to `readBy` of own message. Keep minimal.

## Must Not Do

- [ ] Do NOT modify backend.
- [ ] Do NOT add REST read endpoint (socket-only per plan).
- [ ] Do NOT change PWA/SSL/deploy/Cloudflare.

## Acceptance Criteria

- [ ] Opening a chat emits `chat:read {chatId}` (verified by test/socket log).
- [ ] When another participant reads, sender's message shows read state (readBy updated via `message:read`).
- [ ] Chat list unread badge resets on open (existing behavior preserved).
- [ ] `npm run build` (client) succeeds; `npm test` (client) green.

## Test Requirements

| Type | Required | Scope |
| --- | --- | --- |
| Unit (mock socket) | yes | chat:read emitted on open; message:read updates readBy |
| Build | yes | client tsc/vite build |

## Verification Commands

| Command | Required | Expected |
| --- | --- | --- |
| `cd client && npm test` | yes | green, incl. new read test |
| `cd client && npm run build` | yes | exit 0 |

## Documentation Updates Required

- [ ] `docs/CONTROL_PLANE.md`
- [ ] `docs/AI_WORKLOG.md`
- [ ] this task -> Execution Result

## Stop Conditions

- Stop if `SocketContext` mock cannot be provided in test without heavy refactor (then test via service-level logic only).

## Notes

- Local `useUnread` count stays as quick UI indicator; server marking is source of truth for cross-device.
- No backend round-trip needed for the badge; `chat:read` emit is enough.

## Execution Result

Status: Completed — frontend implemented; tests green (22/22 client, 78/78 server). Pending merge to master + production deploy + manual Safari/iPhone verification.
