# Next Agent Task: ZOKUL-READ-001 - Read Receipts (Stage 1: backend + migration + tests)

Protocol version: 1.0
Task type: implementation
Execution owner: current agent (executor under governor)
Created by: project-governor
State required before execution: Ready for Execution

## Goal

Add read receipts backend. When a user opens a chat, all unread messages from OTHER
participants in that chat are marked as read. Other participants get a `message:read`
socket event. (Frontend is Stage 2 — NOT in scope here.)

Data model: per-message `message_reads(message_id, user_id, read_at)` table.
Trigger: opening a chat -> client emits `chat:read {chatId}`.
Groups: handled via the same table (no separate logic).

## Current State

- No read-state exists anywhere (messages, chats, chat_participants). Unread is client-only in-memory.
- `server/src/config/db.ts` `migrate()` uses inline `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` (no ORM/migration tool). `server/migrations/` is empty.
- `server/src/models/Message.ts` has the query layer; `server/src/services/messageService.ts` has business logic.
- `server/src/socket/index.ts` already has `ensureChatParticipant(chatId, userId)` helper.
- Existing backend tests mock models (see `server/__tests__/messageService.test.ts`).

## Allowed Files

- `server/src/config/db.ts` (add `message_reads` table)
- `server/src/models/Message.ts` (add read functions)
- `server/src/types/index.ts` (add `ReadReceipt` type)
- `server/src/services/messageService.ts` (add `markChatRead`, `getReadReceipts`)
- `server/src/socket/index.ts` (add `chat:read` listener)
- `server/__tests__/messageService.test.ts` (extend with read-marking tests)
- `docs/CONTROL_PLANE.md`, `docs/AI_WORKLOG.md`, `docs/tasks/active/NEXT_AGENT_TASK.md`

## Forbidden Files

- `client/**` (frontend is Stage 2, do NOT touch)
- deploy scripts, `docker-compose.prod.yml`, SSL, PWA (`sw.*`, `vite.config.ts`, `nginx.conf`)
- Cloudflare / VPN / IPv6 related code

## Must Do

- [ ] `db.ts`: add `CREATE TABLE IF NOT EXISTS message_reads (message_id, user_id, read_at, PK(message_id,user_id), FKs + ON DELETE CASCADE)` + index on user_id.
- [ ] `types/index.ts`: add `ReadReceipt { messageId: string; userId: string; readAt: string }`.
- [ ] `Message.ts`:
  - `markChatRead(chatId, userId)`: first verify `userId` is a participant of `chatId` (query `chat_participants`); if not, throw/return false. Then:
    `INSERT INTO message_reads (message_id, user_id) SELECT id, $userId FROM messages WHERE chat_id=$chatId AND sender_id <> $userId AND deleted_at IS NULL ON CONFLICT (message_id, user_id) DO NOTHING RETURNING message_id`
    return array of marked message_ids.
  - `getReadReceipts(messageIds: string[], viewerUserId: string)`: return rows `{messageId, userId, readAt}` for those message_ids where reader <> sender (so a sender sees who read their message). Used later by frontend; include now.
- [ ] `messageService.ts`:
  - `markChatRead(chatId, userId)`: call `Message.markChatRead`, return marked ids.
  - `getReadReceipts(messageIds, viewerUserId)`: delegate to model.
- [ ] `socket/index.ts`: add listener `socket.on('chat:read', async ({chatId}) => { ... })`:
  - verify participant via `ensureChatParticipant(chatId, userId)`; if false `socket.emit('error', {message:'Forbidden'})` and return.
  - call `messageService.markChatRead(chatId, userId)` -> `ids`.
  - if ids.length: `socket.to('chat:'+chatId).emit('message:read', { chatId, userId, messageIds: ids })` (NOT to current socket).
- [ ] Tests in `messageService.test.ts`: mock `Message` model; verify `markChatRead`:
  - marks only messages from OTHER senders (not own),
  - does not duplicate (idempotent),
  - `getReadReceipts` returns reader list excluding sender.

## Must Not Do

- [ ] Do NOT modify frontend (`client/**`).
- [ ] Do NOT touch PWA/SSL/deploy/Cloudflare.
- [ ] Do NOT emit `message:read` to the current socket (only `socket.to(room)`).
- [ ] Do NOT mark own messages as read.

## Acceptance Criteria

- [ ] `npm test` (server) passes; new read-marking tests green.
- [ ] `npm run build` (server) succeeds (tsc).
- [ ] Migration `message_reads` applies idempotently (CREATE TABLE IF NOT EXISTS).
- [ ] `chat:read` only works for chat participants; marks only others' messages; emits `message:read` to room excluding sender.

## Test Requirements

| Type | Required | Scope |
| --- | --- | --- |
| Unit (mock model) | yes | `markChatRead` logic, `getReadReceipts` filtering |
| Build | yes | server `tsc`/vite build passes |
| Manual socket | no (Stage 2) | deferred |

## Verification Commands

| Command | Required | Expected |
| --- | --- | --- |
| `cd server && npm test` | yes | pass, incl. new read tests |
| `cd server && npm run build` | yes | exit 0 |

## Documentation Updates Required

- [ ] `docs/CONTROL_PLANE.md`
- [ ] `docs/AI_WORKLOG.md`
- [ ] this task -> Execution Result

## Stop Conditions

- Stop if `message_reads` FK to `messages`/`users` breaks existing data (should not; cascade).
- Stop if tests cannot mock model cleanly.

## Notes

- `chat:read` returns nothing to sender; sender learns of reads via inbound `message:read` from others.
- Frontend Stage 2 will: emit `chat:read` on open, consume `message:read` for ticks, show backend `unreadCount`.

## Execution Result

Status: In progress
