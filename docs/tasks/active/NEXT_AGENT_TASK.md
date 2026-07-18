# NEXT_AGENT_TASK: Fix Chat Opening, Initial Position, And Delete Placement

Task ID: ZOKUL-CHAT-UX-001
Status: Accepted
Created by: Governor
Assigned role: Executor
Execution owner: external agent
Recommended branch: codex/chat-opening-scroll-delete
Change type: bugfix / UX correctness
Risk level: Medium
Confidence: High

## Executive Summary

Fix three linked chat UX defects without changing chat backend rules:

- a chat row must open on its first tap/click;
- a newly opened chat must show its newest messages at the bottom;
- chat deletion must leave the list row and become a confirmed destructive action in an actions menu inside the open chat header.

The current list nests a delete button inside the open-chat button. Nested interactive elements are invalid HTML and cause ambiguous touch behavior. Initial scroll depends on message-count growth while prior chat state remains during loading, so it can miss a valid first response. Older-message pagination also needs to retain the descending API state order.

## Must Do

- Make each chat row a single, valid interactive control that opens the chat on its first click/tap.
- Remove all delete controls and confirmation popovers from `ChatList`.
- Add one header actions trigger in an already-open chat. Its dropdown must contain only the existing destructive action: delete this chat.
- Require an explicit confirmation before emitting the existing `chat:delete` socket event.
- Reliably scroll the initial successful message result to the bottom after layout, regardless of whether its count is smaller, equal, or larger than the prior chat's count.
- Preserve correct chronological rendering when older messages are loaded from the descending API.
- Keep existing server permissions: direct chats remain deletable by participants; group deletion remains restricted to group creators.

## Must Not Do

- Do not modify server chat deletion authorization, socket event names, database, auth, message content actions, or add a chat settings page.
- Do not add search, calls, settings, pinning, archive, mute, or any future action.
- Do not change mobile voice, notifications, Docker, service worker, or dependencies.
- Do not push or deploy without explicit user approval.

## Required Reading

- `docs/00_README_FOR_AGENTS.md`
- `docs/CONTROL_PLANE.md`
- `docs/12_DEFINITION_OF_DONE.md`
- `docs/gates/frontend-ui.md`
- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatList.tsx`
- `client/src/components/chat/ChatView.tsx`
- `server/src/services/chatService.ts` (read-only behavior reference)
- `server/src/socket/index.ts` (read-only event reference)

## Allowed Files

- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatList.tsx`
- `client/src/components/chat/ChatView.tsx`
- `client/__tests__/ChatList.test.tsx` (new or existing)
- `client/__tests__/ChatView.test.tsx` (new or existing)
- `docs/03_PRODUCT_BACKLOG.md`
- `docs/10_AI_WORKLOG.md`
- `docs/11_PROJECT_HEALTH.md`
- `docs/AUDIT_LOG.md`
- `docs/CONTROL_PLANE.md`
- `docs/tasks/active/NEXT_AGENT_TASK.md`

## Forbidden Files

- `server/**` except read-only inspection
- `.env*`, `ssl/**`, `docker-compose*.yml`
- `client/sw.ts`
- generated files, `dist/`, `node_modules/`, build caches

## Implementation Instructions

1. In `ChatList`, remove `deleteTarget`, `onDelete`, the row delete button, and its confirmation popover. Do not render a button inside another button.
2. In `HomePage`, stop passing deletion into `ChatList`. Add a compact icon-only actions button in the selected-chat header, with an accessible label and a popover containing only Delete chat. The delete item opens a confirmation surface before it calls the existing `handleDeleteChat(selectedChat.id)`.
3. Close the header actions popover when the selected chat changes, when its delete confirmation completes/cancels, and when clicking outside or pressing Escape.
4. In `ChatView`, track initial-scroll completion by chat ID rather than prior message count. After the first successful non-empty render for a chat, scroll `bottomRef` into view with non-animated initial behavior. New live messages may still scroll smoothly only when appropriate.
5. (N/A — confirmed working) The message API returns newest-first. The existing `prependMessages` places the older page at the beginning of the newest-first state, which after `ChatView`'s reverse yields correct chronological display. No change needed.

## Tests To Add Or Update

- Chat row click invokes selection exactly once and no delete control is rendered in the list.
- Header delete action opens confirmation and emits deletion only after confirmation.
- Initial scroll executes for the first loaded result even when its message count is not greater than the previous chat's count.
- (N/A — existing prepend + reverse order is correct.)

## Verification Commands

- `npm.cmd run build`
- `npm.cmd test`
- `git diff --check`
- `git status --short --branch`

## Acceptance Criteria

- [x] First tap/click on a chat row immediately opens that chat on desktop and phone.
- [x] No nested buttons remain in chat-list rows.
- [x] The only chat-delete entry is in the selected chat header's actions menu and requires confirmation.
- [x] Opening any chat begins at its newest available message, not its oldest one.
- [x] Loading older messages preserves chronological display and does not jump the user to the bottom.
- [x] Existing deletion permissions and socket event behavior remain unchanged.
- [x] Build, tests, diff check, and protocol docs pass.

## Change Request Rule

If execution requires changing server behavior, socket contracts, deletion permissions, or files outside Allowed Files, stop and create a `docs/CHANGE_REQUESTS.md` entry before continuing.

## Worklog Requirements

Record changed files, test output, manual desktop/mobile QA status, commit hash, and remaining risks in the worklog and audit log.
