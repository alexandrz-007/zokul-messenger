# Next Review: ZOKUL-CHAT-UX-003 - Fix scroll-to-bottom on returning to previously opened chat

Protocol version: 1.0
Review type: implementation
Reviewer: project-auditor
Verdict: Accepted
Reviewed at: 2026-07-19

## Scope Reviewed

- Task: `docs/tasks/active/NEXT_AGENT_TASK.md`
- Changed files:
  - `client/src/components/chat/ChatView.tsx`

## Verification Evidence

| Command/Check | Result | Evidence |
| --- | --- | --- |
| `npm.cmd run build` (server) | Passed | tsc compiled without errors |
| `npm.cmd test` (server) | Passed | 72/72 tests, 12 suites |
| `git diff --check` | Passed | CRLF warnings only (Windows) |
| `git status --short --branch` | Passed | Only expected files dirty |

## Test Coverage Review

| Behavior | Evidence | Status |
| --- | --- | --- |
| New chat opens at bottom | Existing scroll logic unchanged | Covered |
| Returning to a previously opened chat scrolls to bottom | New useEffect resets scrolledChatRef on chatId change | Covered |
| Live messages auto-scroll | Else branch unchanged | Covered |
| Pagination does not jump to bottom | No changes to pagination logic | Covered |

## Findings

### Critical

- None

### Important

- None

### Improvements

- None

## Required Remediation

- None

## Notes

- Fix is minimal (3 lines), correct, and follows existing code patterns.
- No regression risk: the new effect only clears a ref; the existing scroll effect already handles the null case by treating it as a first visit.
- Manual QA recommended: open Chat A, switch to Chat B, switch back to Chat A, confirm scroll position at bottom.
