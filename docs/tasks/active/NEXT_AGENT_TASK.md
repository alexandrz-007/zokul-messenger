# Next Agent Task: ZOKUL-SCROLL-001 - Fix auto-scroll on chat switch

Protocol version: 1.0
Task type: implementation
Execution owner: current agent (executor under governor)
Created by: project-governor
State required before execution: Ready for Execution

## Goal

Fix message list scroll: when switching to a different chat, always open at the bottom (latest message). New incoming message auto-scrolls down ONLY if user is near bottom (<=120px). Eliminate the "scroll stuck in the middle" bug.

## Current State

- `client/src/components/chat/ChatView.tsx` renders messages; there is NO separate `MessagesList` component.
- Scroll logic (lines 54-74): `bottomRef` + `useLayoutEffect([messages, chatId, loading])`.
- Bug root causes:
  1. `useLayoutEffect` returns early when `loading` is true, and calls `scrollIntoView` synchronously before images/avatars finish rendering -> `scrollHeight` is intermediate -> ends up mid-list.
  2. No `key={chatId}` on the scroll container -> React reuses the same DOM node across chats, preserving stale `scrollTop`.

## Allowed Files

- `client/src/components/chat/ChatView.tsx`
- `client/__tests__/chatScroll.test.tsx` (new)
- `docs/CONTROL_PLANE.md`, `docs/AI_WORKLOG.md`, `docs/tasks/active/NEXT_AGENT_TASK.md`

## Forbidden Files

- `server/**`, backend
- PWA (`sw.*`, `vite.config.ts`, `nginx.conf`), SSL, deploy, Cloudflare
- read-receipts logic (only scroll changes)

## Must Do

- [ ] Add `scrollContainerRef` to the outer scroll `div` (`flex-1 overflow-y-auto`).
- [ ] Add `key={chatId}` to that scroll container so switching chats remounts it (resets stale `scrollTop`).
- [ ] Replace scroll effect:
  - On chat switch (`scrolledChatRef.current !== chatId`): after render, `requestAnimationFrame(() => { const el = scrollContainerRef.current; if (el) el.scrollTop = el.scrollHeight; scrolledChatRef.current = chatId; })`. Use double rAF if needed for image height.
  - Do NOT early-return on `loading`; instead require `messages.length > 0`.
  - Remove `loading` from scroll-decision (keep dependency only on `[messages, chatId]`).
- [ ] Add `isNearBottom()` helper: `const el = scrollContainerRef.current; return el ? el.scrollHeight - el.scrollTop - el.clientHeight < 120 : true;`
- [ ] On new incoming message (existing `message:new` handler in `useMessages`/ChatView): if `isNearBottom()` -> set `el.scrollTop = el.scrollHeight` (smooth), else leave.
- [ ] Tests: `client/__tests__/chatScroll.test.tsx` mocking `useSocket` + `useMessages` data; assert container gets `scrollTop === scrollHeight` (mock `scrollTo`/`scrollIntoView`) after `chatId` change with messages present.

## Must Not Do

- [ ] Do NOT change backend / PWA / SSL / deploy / Cloudflare.
- [ ] Do NOT alter read-receipts behavior.
- [ ] Do NOT remove `bottomRef` if still used elsewhere; keep as fallback but primary scroll via `scrollContainerRef`.

## Acceptance Criteria

- [ ] Switching A(scroll up) -> B opens at bottom; B -> A opens at bottom.
- [ ] New message in open chat scrolls down only if near-bottom (<=120px); reading older messages is not yanked down.
- [ ] "Scroll in the middle" bug gone.
- [ ] `npm test` (client) green incl. new scroll test; `npm run build` (client) exit 0.

## Test Requirements

| Type | Required | Scope |
| --- | --- | --- |
| Unit (mock socket + scroll) | yes | chat switch -> scrollTop=scrollHeight; near-bottom gating |
| Build | yes | client build |

## Verification Commands

| Command | Required | Expected |
| --- | --- | --- |
| `cd client && npm test` | yes | green, incl. chatScroll |
| `cd client && npm run build` | yes | exit 0 |

## Documentation Updates Required

- [ ] `docs/CONTROL_PLANE.md`
- [ ] `docs/AI_WORKLOG.md`
- [ ] this task -> Execution Result

## Stop Conditions

- Stop if `scrollTo` mocking in jsdom cannot assert scrollTop (fallback: assert `scrollIntoView` called with bottom on chat switch).

## Notes

- `key={chatId}` remount also resets `scrolledChatRef` naturally; keep the ref for new-message gating.
- Double `requestAnimationFrame` recommended to wait for lazy image layout.

## Execution Result

Status: Completed — scroll fix implemented; tests green (24/24 client). Pending merge to master + production deploy + manual Safari/iPhone verification.
