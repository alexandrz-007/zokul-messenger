# Next Agent Task: ZOKUL-SCROLL-002 - Stabilize auto-scroll via ResizeObserver

Protocol version: 1.0
Task type: implementation (remediation/improvement of ZOKUL-SCROLL-001)
Execution owner: current agent (executor under governor)
Created by: project-governor
State required before execution: Ready for Execution
Parent task: ZOKUL-SCROLL-001 (Accepted but residual mid-list on chat switch)

## Goal

Make the message list ALWAYS open at the bottom after switching chats, even when the
list height grows after the first scroll attempt (regardless of images/avatars). Replace
the fragile `requestAnimationFrame` scroll with a `ResizeObserver`-driven "stick to bottom"
loop that keeps `scrollTop = scrollHeight` until the container height stabilizes, while the
chat is in "auto-scroll mode". Keep near-bottom (<=120px) gating for incoming messages.

## Residual Bug (why ZOKUL-SCROLL-001 was insufficient)

- `useLayoutEffect([messages, chatId])` sets `scrollTop = scrollHeight` once, then a single
  `requestAnimationFrame`. If `messages` for the new chat arrive/re-render AFTER that rAF
  (or layout/font/emoji changes height), the container grows but `scrollTop` is already fixed
  -> user lands mid-list. Happens even with NO images/avatars (text reflow, async message load).
- `scrolledChatRef` reset in a separate `useEffect` runs AFTER the layout scroll, causing a
  race where the second scroll-on-messages may not fire.

## Allowed Files

- `client/src/components/chat/ChatView.tsx`
- `client/__tests__/chatScroll.test.tsx` (extend existing)
- `docs/CONTROL_PLANE.md`, `docs/AI_WORKLOG.md`, `docs/tasks/active/NEXT_AGENT_TASK.md`

## Forbidden Files

- `server/**`, backend
- PWA (`sw.*`, `vite.config.ts`, `nginx.conf`), SSL, deploy, Cloudflare
- read-receipts logic (only scroll changes)

## Must Do

- [ ] Add a `ResizeObserver` on `scrollContainerRef` (create in a `useEffect`, disconnect on unmount).
- [ ] While `scrolledChatRef.current === chatId` (auto-scroll mode for this chat), on EVERY observed
      size change set `el.scrollTop = el.scrollHeight` (so growth after first scroll is corrected).
- [ ] On chat switch (`chatId` changes): in the SAME `useLayoutEffect`, FIRST set
      `scrolledChatRef.current = chatId` (so observer/stick logic is active), THEN set
      `el.scrollTop = el.scrollHeight`. Remove the separate reset `useEffect` that ran after layout.
- [ ] Keep `isNearBottom()` (120px) for incoming-message gating: new message scrolls down only if near-bottom.
- [ ] Keep `key={chatId}` on the scroll container (resets DOM/scrollTop on switch).
- [ ] Ensure observer does NOT fight the user: once user manually scrolls up (away from bottom) during the
      same chat, set `scrolledChatRef.current = null` (exit auto-scroll mode) so observer stops forcing bottom.
- [ ] Tests (extend `client/__tests__/chatScroll.test.tsx`):
      - Existing: chat switch -> scrollTop === scrollHeight.
      - NEW: simulate container `scrollHeight` increasing AFTER mount (mock ResizeObserver firing / re-render
        with taller content) and assert `scrollTop` ends at new `scrollHeight` (proves observer-driven stick).
      - NEW or existing: when user scrolls up (isNearBottom false), incoming message does NOT change scrollTop.

## Must Not Do

- [ ] Do NOT change backend / PWA / SSL / deploy / Cloudflare.
- [ ] Do NOT alter read-receipts behavior.
- [ ] Do NOT remove `bottomRef` if still used; keep as harmless fallback.

## Acceptance Criteria

- [ ] Switching chats ALWAYS opens at the very bottom, even if list height changes after first paint.
- [ ] No mid-list landing on chat switch (residual bug gone).
- [ ] Incoming message scrolls down only when user is near bottom (<=120px); reading older messages is not yanked.
- [ ] Manual scroll-up during a chat disables auto-scroll until next switch.
- [ ] `npm test` (client) green incl. extended scroll tests; `npm run build` (client) exit 0.

## Test Requirements

| Type | Required | Scope |
| --- | --- | --- |
| Unit (mock socket + scroll + ResizeObserver) | yes | chat switch -> bottom; height-grows-after -> still bottom; near-bottom gating |
| Build | yes | client build |

## Verification Commands

| Command | Required | Expected |
| --- | --- | --- |
| `cd client && npm test` | yes | green, incl. chatScroll (extended) |
| `cd client && npm run build` | yes | exit 0 |

## Documentation Updates Required

- [ ] `docs/CONTROL_PLANE.md` (state -> In Execution during work, then Ready for Audit)
- [ ] `docs/AI_WORKLOG.md` (new entry ZOKUL-SCROLL-002)
- [ ] this task -> Execution Result

## Stop Conditions

- If jsdom `ResizeObserver` is unavailable, polyfill a no-op or trigger the same code path via a re-render
  with larger content; do NOT leave the stick logic untested.

## Notes

- `ResizeObserver` catches ANY height growth (text reflow, async messages, fonts, emojis, images) — this is the
  real fix for the residual bug, not image-specific.
- Branch stays `feature/scroll-fix`; commit separately from ZOKUL-SCROLL-001 work.

## Execution Result

Status: Completed. Replaced fragile rAF scroll with ResizeObserver-driven "stick to bottom":
- `ChatView.tsx`: added `ResizeObserver` on `scrollContainerRef` re-pinning `scrollTop = scrollHeight` while
  `scrolledChatRef.current === chatId`; removed separate reset `useEffect` (set ref BEFORE scroll in same layout
  effect to kill the race); added `handleScroll` exiting auto-scroll mode when user scrolls up away from bottom.
- `chatScroll.test.tsx` extended to 4 tests (switch->bottom; height-grows-after->bottom; near-bottom gating;
  user-scroll-up disables auto-scroll). All green.
- Verification: `npm test` 26/26; `npm run build` exit 0 (killer PWA retained). Pending audit.
