# Next Review: ZOKUL-SCROLL-001 - Fix auto-scroll on chat switch

Protocol version: 1.0
Review type: implementation
Reviewer: project-auditor
Verdict: Accepted
Reviewed at: 2026-07-19

## Scope Reviewed
- Task: `docs/tasks/active/NEXT_AGENT_TASK.md` (ZOKUL-SCROLL-001)
- Changed files:
  - `client/src/components/chat/ChatView.tsx` — scrollContainerRef + key={chatId} + rAF scroll + near-bottom gating
  - `client/__tests__/chatScroll.test.tsx` — 2 tests
  - docs: CONTROL_PLANE.md, AI_WORKLOG.md, NEXT_AGENT_TASK.md
  - NOTE: `scripts/prepare-release.ps1` also in diff (carried over from prior read-receipts deploy fix; not part of this task scope but harmless — see Findings I-1)

## Scope Audit
- Only `ChatView.tsx` + new test + docs changed for the task. Backend/PWA/SSL/deploy/Cloudflare untouched. ✅
- `prepare-release.ps1` change is out-of-scope noise (from earlier step); see I-1.

## Verification Evidence
| Command/Check | Result | Evidence |
| --- | --- | --- |
| `npx vitest run` (client) | Passed | 24/24, incl. 2 new scroll tests |
| `npm run build` (client) | Passed | tsc+vite exit 0; sw.js = killer |

## Acceptance Criteria Check
| Criterion | Status | Evidence |
| --- | --- | --- |
| Switching A(scroll up) -> B opens at bottom | Passed | test `scrolls to bottom again when switching to another chat`; key={chatId} remount + scrollTop=scrollHeight in ChatView.tsx:79-91 |
| B -> A opens at bottom | Passed | same mechanism; scrolledChatRef reset on chatId change (ChatView.tsx:75-77) |
| New message scrolls down only if near-bottom (<=120px) | Passed | `isNearBottom()` 120px threshold (ChatView.tsx:59-63); effect ChatView.tsx:93-98 |
| "Scroll in the middle" bug gone | Passed | rAF re-apply after image layout + key remount resets stale scrollTop |
| client tests green | Passed | 24/24 |
| client build green | Passed | exit 0 |

## Findings

### Critical
- None

### Important
- None

### Improvements
- I-1: `scripts/prepare-release.ps1` (try/catch around `npm test` so stderr noise doesn't abort packaging) is included in this branch's diff though it belongs to the earlier read-receipts deploy step. It is harmless and already validated. Recommend it also lands in master (e.g., via this merge or a separate commit). Not blocking.
- I-2: The reset `useEffect` (ChatView.tsx:75-77) sets `scrolledChatRef.current = null` after the layout scroll; on the next `messages` update the layout effect scrolls again. This is intentional (double-scroll for image layout) but slightly redundant; acceptable.

## Required Remediation
- None

## Notes
- Branch `feature/scroll-fix` NOT merged to master/production. Production PWA remains killer.
- Manual Safari/iPhone verification deferred to deploy step.
