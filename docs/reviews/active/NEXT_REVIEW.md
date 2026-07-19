# Next Review: ZOKUL-SCROLL-002 - Stabilize auto-scroll via ResizeObserver

Protocol version: 1.0
Review type: implementation
Reviewer: project-auditor
Verdict: Accepted
Reviewed at: 2026-07-19

## Scope Reviewed
- Task: `docs/tasks/active/NEXT_AGENT_TASK.md` (ZOKUL-SCROLL-002)
- Changed files (git diff master...feature/scroll-fix):
  - `client/src/components/chat/ChatView.tsx` — ResizeObserver-driven stick-to-bottom, handleScroll, layout effect on [chatId]
  - `client/__tests__/chatScroll.test.tsx` — 4 tests
  - docs: CONTROL_PLANE.md, AI_WORKLOG.md, NEXT_AGENT_TASK.md
- Out-of-scope noise: `scripts/prepare-release.ps1` still in branch diff (from earlier read-receipts deploy fix; harmless, not part of this task — see I-1).

## Scope Audit
- Only `ChatView.tsx` + test + docs changed for the task. Backend/PWA/SSL/deploy/Cloudflare untouched. ✅
- Docs required by task updated (CONTROL_PLANE, AI_WORKLOG, task result). ✅

## Verification Evidence (run by auditor)
| Command | Result | Evidence |
| --- | --- | --- |
| `npx vitest run` (client) | Passed | 26/26, incl. 4 scroll tests |
| `npm run build` (client) | Passed | tsc+vite exit 0; sw.js = killer |

## Acceptance Criteria Check
| Criterion | Status | Evidence |
| --- | --- | --- |
| Switching chats ALWAYS opens at bottom, even if list height changes after first paint | Passed | `useLayoutEffect([chatId])` sets `scrolledChatRef=chatId` + `stickToBottom`; RO re-pins on any growth (ChatView.tsx:79-99); test `sticks to bottom when container height grows after mount` |
| No mid-list landing on chat switch | Passed | root cause (early rAF + post-scroll ref reset) removed |
| Incoming message scrolls down only when near-bottom (<=120px) | Passed | `handleScroll` + near-bottom effect (ChatView.tsx:101-123); test `does not yank down when user scrolled up` |
| Manual scroll-up disables auto-scroll until next switch / return to bottom | Passed | `handleScroll` sets `scrolledChatRef=null` on scroll-up, re-arms on return near bottom |
| Tests green + build clean | Passed | 26/26, exit 0 |

## Findings

### Critical
- None

### Important
- None

### Improvements
- I-1: `scripts/prepare-release.ps1` (try/catch around `npm test` so stderr noise doesn't abort packaging) is included in this branch's diff though it belongs to the earlier read-receipts deploy step. Harmless and already validated. Recommend it also lands in master (via this merge or separate commit). Not blocking.
- I-2 (self-caught during audit, already fixed by executor): initial implementation re-ran `scrolledChatRef=chatId + stickToBottom` on EVERY `messages` change (dependency `[messages, chatId]`), which would yank the user to the bottom on each incoming message even while they read older messages. Corrected to depend on `[chatId]` only; growth after mount is handled by ResizeObserver; new-message scroll-down is gated by `isNearBottom()` in the separate effect. Re-verified green.
- I-3: `ResizeObserver` is feature-detected (`typeof ResizeObserver === 'undefined'` guard). In jsdom the polyfill drives the path; in old browsers without RO the chat still scrolls to bottom on chat switch (layout effect) but won't re-pin on late growth — acceptable graceful degradation.

## Required Remediation
- None

## Notes
- Branch `feature/scroll-fix` NOT merged to master/production. Production PWA remains killer.
- Manual Safari/iPhone verification deferred to deploy step (UI behavior in real browser).
