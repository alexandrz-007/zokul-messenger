# Next Review: ZOKUL-SCROLL-002 - Reverted

Protocol version: 1.0
Review type: implementation (reverted)
Reviewer: project-auditor
Verdict: Reverted
Reviewed at: 2026-07-19

## Summary
ZOKUL-SCROLL-002 introduced a `ResizeObserver`-driven stick-to-bottom that REGRESSED scroll behavior:
chats opened in the middle or at the start more often than before. The root cause was the layout effect
depending only on `[chatId]` (not `messages`), so it scrolled before the new chat's messages arrived,
and `handleScroll` reset the auto-scroll ref on the programmatic scroll event from the `key={chatId}`
remount. Per user decision, the change was rolled back to the ZOKUL-SCROLL-001 rAF implementation.

## Revert
- `git revert`-style checkout of `ChatView.tsx` + `chatScroll.test.tsx` from faaa45d (ZOKUL-SCROLL-001).
- Commit: 9222807 "Revert ZOKUL-SCROLL-002: roll back to ZOKUL-SCROLL-001 rAF scroll".
- Verification: `npx vitest run` 24/24; `npm run build` exit 0 (killer PWA).

## Acceptance
- Branch `feature/scroll-fix` now equals the ZOKUL-SCROLL-001 scroll behavior (pre-ResizeObserver).
- Pending: user browser re-verification; then merge to master + production deploy.

## Notes
- The residual "sometimes mid-list" bug from ZOKUL-SCROLL-001 remains known but is less severe than the
  ZOKUL-SCROLL-002 regression. No further scroll changes unless user requests a new, properly-scoped attempt.
