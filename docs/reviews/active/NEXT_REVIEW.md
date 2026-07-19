# Next Review: ZOKUL-READ-001 (Stage 1) - Read receipts backend

Protocol version: 1.0
Review type: implementation
Reviewer: project-auditor
Verdict: Accepted
Reviewed at: 2026-07-19

## Scope Reviewed
- Task: `docs/tasks/active/NEXT_AGENT_TASK.md` (ZOKUL-READ-001 Stage 1)
- Changed files (all allowed):
  - `server/src/config/db.ts` — `message_reads` table + index
  - `server/src/types/index.ts` — `ReadReceipt`
  - `server/src/models/Message.ts` — `isParticipant`, `markChatRead`, `getReadReceipts`
  - `server/src/services/messageService.ts` — `markChatRead`, `getReadReceipts`
  - `server/src/socket/index.ts` — `chat:read` listener
  - `server/__tests__/messageService.test.ts` — read-receipt tests
  - docs: CONTROL_PLANE.md, AI_WORKLOG.md, NEXT_AGENT_TASK.md

## Scope Audit
- Only allowed files changed. Frontend (`client/**`), PWA/SSL/deploy/Cloudflare NOT touched. ✅
- Docs required by task updated (CONTROL_PLANE, AI_WORKLOG, task). ✅

## Verification Evidence
| Command/Check | Result | Evidence |
| --- | --- | --- |
| `npm test` (server) | Passed | 78/78, incl. new read-receipt tests |
| `npm run build` (server) | Passed | tsc exit 0 |

## Acceptance Criteria Check
| Criterion | Status | Evidence |
| --- | --- | --- |
| `message_reads` migration idempotent | Passed | `CREATE TABLE IF NOT EXISTS` + index in db.ts |
| `markChatRead` only for participants | Passed | `isParticipant` check returns [] if not member; socket uses `ensureChatParticipant` → Forbidden |
| marks only OTHER senders' messages | Passed | `WHERE sender_id <> $2` |
| race-safe, no NOT IN | Passed | `INSERT ... ON CONFLICT (message_id,user_id) DO NOTHING RETURNING` |
| emits `message:read` to room, not sender | Passed | `socket.to('chat:'+chatId).emit('message:read', ...)` |
| own messages never marked read | Passed | `sender_id <> $2` excludes self |
| new tests green | Passed | messageService.test.ts read-receipt block |

## User-Confirmed Decisions Verified
1. `markChatRead` verifies participant (forbids foreign-chat marking) ✅
2. `ON CONFLICT DO NOTHING RETURNING` used (race-safe) ✅
3. `message:read` emitted only via `socket.to(room)`, not current socket; no ack ✅

## Findings

### Critical
- None

### Important
- None

### Improvements
- I-1: `getReadReceipts` currently returns reader list excluding viewer; for 1-on-1 a simpler "read/unread" boolean may suffice, but current design supports groups (per plan). No change required.
- I-2: No REST endpoint for `markChatRead` was added (socket-only per plan). If a client ever needs read-marking without socket, add `POST /api/chats/:chatId/read` later. Not required for acceptance.

## Required Remediation
- None

## Notes
- Frontend (Stage 2) deferred per plan: emit `chat:read` on open, consume `message:read` for ticks, show backend `unreadCount`. Not in this stage.
- Branch `feature/read-receipts` NOT merged to production (per protocol, audit before merge). Manual socket verification deferred to Stage 2.
