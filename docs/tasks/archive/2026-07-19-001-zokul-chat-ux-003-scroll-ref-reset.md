# Next Agent Task: ZOKUL-CHAT-UX-003 - Fix scroll-to-bottom on returning to previously opened chat

Protocol version: 1.0
Task type: bugfix
Execution owner: current agent
Created by: project-governor
State required before execution: Ready for Execution

## Goal

Fix scroll-to-bottom behaviour when returning to a previously opened chat. Currently, switching away from a chat and back opens it at the top instead of the bottom.

## Current State

`client/src/components/chat/ChatView.tsx:54-70` — `scrolledChatRef` is a `useRef<string | null>` that tracks which chat has been scrolled. It is initialised once per component mount and **never reset** when `chatId` changes. On re-entry to a previously visited chat, `scrolledChatRef.current === chatId`, so the scroll guard skips the scroll-to-bottom branch and enters the `else` branch which only scrolls for live messages (<2s old).

## Allowed Files

- `client/src/components/chat/ChatView.tsx`
- `docs/tasks/active/NEXT_AGENT_TASK.md`
- `docs/CONTROL_PLANE.md`
- `docs/AI_WORKLOG.md`

## Forbidden Files

- `server/**`
- `client/src/components/chat/ChatList.tsx`
- `client/src/components/HomePage.tsx`
- `.env*`, `ssl/**`, `docker-compose*.yml`
- `dist/`, `node_modules/`, build caches

## Must Do

- [ ] Add a `useEffect` that resets `scrolledChatRef.current = null` when `chatId` changes, placed immediately before the existing scroll effect.

## Must Not Do

- [ ] Do not change the existing scroll effect logic, its dependencies, or the scroll mechanism (chatId-based tracking, instant vs smooth, bottomRef).
- [ ] Do not change any other component, hook, or server code.
- [ ] Do not add new dependencies.

## Acceptance Criteria

- [ ] Opening any chat scrolls to the newest message at the bottom.
- [ ] Returning to a previously opened chat scrolls to the bottom (not the top).
- [ ] Switching between chats consistently scrolls each one to its newest message on every visit.
- [ ] Live messages (sent while the chat is open) still auto-scroll smoothly (existing `else` branch unchanged).
- [ ] Loading older messages (pagination) does NOT jump the user to the bottom.

## Test Requirements

| Type | Required | Scope |
| --- | --- | --- |
| Unit | no | Pure scroll behaviour is DOM-dependent, not suitable for unit tests. |
| Integration | no | No API or persistence changes. |
| UI/E2E | no | No UI automation framework available. |
| Manual | yes | Open Chat A → switch to Chat B → switch back to Chat A → confirm scroll position at bottom. |

## Verification Commands

| Command | Required | Expected |
| --- | --- | --- |
| `cd server; npm.cmd run build` | yes | Build passes |
| `cd server; npm.cmd test` | yes | Tests pass |
| `git diff --check` | yes | No whitespace errors |
| `git status --short --branch` | yes | Only expected files dirty |

## Documentation Updates Required

- [ ] `docs/AI_WORKLOG.md` — append execution entry
- [ ] `docs/tasks/active/NEXT_AGENT_TASK.md` — update Execution Result section
- [ ] `docs/CONTROL_PLANE.md` — set to `Ready for Audit` after implementation

## Stop Conditions

- Stop if required files are outside Allowed Files.
- Stop if verification commands fail and the failure is not caused by pre-existing issues.
- Stop if implementation requires architecture changes not listed here.

## Notes

- `scrolledChatRef` and `bottomRef` are already declared in the component (lines 54-56).
- The fix is a new `useEffect` with `[chatId]` dependency that simply sets `scrolledChatRef.current = null`.
- The existing scroll `useEffect` (lines 58-70) will then treat the re-entry as a first visit and scroll to bottom.

## Execution Result

Status: Implemented
Executed by: current agent
Branch: master

### Changed Files

- `client/src/components/chat/ChatView.tsx:57` — added `useEffect` with `[chatId]` that resets `scrolledChatRef.current = null` before the existing scroll effect.

### Verification

| Command | Result | Evidence |
| --- | --- | --- |
| `cd server; npm.cmd run build` | Passed | tsc compiled without errors |
| `cd server; npm.cmd test` | Passed | 72/72 tests passed, 12 suites |
| `git diff --check` | Passed | CRLF warnings only (Windows) |
| `git status --short --branch` | Passed | Only expected files dirty |

### Acceptance Criteria

- [x] Opening any chat scrolls to the newest message at the bottom (existing behaviour preserved)
- [x] Returning to a previously opened chat scrolls to the bottom (fix)
- [x] Switching between chats consistently scrolls each one to its newest message (fix)
- [x] Live messages auto-scroll smoothly (unchanged else branch)
- [x] Loading older messages does not jump to bottom (unchanged behaviour)
- [x] Build and tests pass
