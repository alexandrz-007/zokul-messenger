# ACTIVE_TASK: Sidebar Create Menu & Theme Toggle

Task ID: ZOKUL-UI-003
Status: Accepted
Created by: Governor
Assigned role: Executor
Recommended branch: current working branch unless user says otherwise
Change type: design
Risk level: Medium
Confidence: Medium

## Executive Summary

Restore access to group chat creation without adding a fourth sidebar button, and make the theme action visibly useful. The bottom create button should open a compact menu with two choices: personal chat and group chat. The theme button must actually switch light/dark mode and the sidebar must look acceptable in both themes.

This task continues the staged sidebar UI work. Keep the scope small and do not redesign the chat area.

## User Direction

User likes the current sidebar design. Remaining concerns:

- The old group chat creation button disappeared.
- Do not add more clutter to the bottom bar.
- Prefer one create button that lets the user choose:
  - personal chat;
  - group chat.
- The theme button should actually be useful; if light theme looks broken, fix light-mode sidebar styling within this scope.
- Viewing another participant's avatar is desired later, but must not be mixed into this task.

## Required Reading

- `docs/00_README_FOR_AGENTS.md`
- `docs/CONTROL_PLANE.md`
- `docs/DEFINITION_OF_DONE.md`
- `docs/gates/frontend-ui.md`
- `client/src/components/HomePage.tsx`
- `client/src/contexts/ThemeContext.tsx`
- `client/src/components/chat/CreateChatModal.tsx`
- `client/src/components/chat/CreateGroupModal.tsx`

## Scope

Included:

- Change the bottom create action in `HomePage.tsx` so it opens a compact create menu instead of immediately opening personal chat.
- Menu options:
  - New personal chat -> opens existing `CreateChatModal`.
  - New group chat -> opens existing `CreateGroupModal`.
- Keep bottom action bar at exactly three visible buttons:
  - create menu;
  - theme toggle;
  - logout.
- Menu must close when:
  - an option is selected;
  - user clicks outside;
  - user presses Escape where practical.
- Menu must work on desktop and mobile/narrow sidebar.
- Theme toggle must visibly switch between light and dark.
- If the sidebar light theme looks poor, adjust only sidebar-related light/dark classes in allowed files.
- Keep existing profile click/edit behavior, chat selection, and bottom logout behavior.

Out of scope:

- Avatar preview/viewer.
- Chat search.
- Settings page or settings button.
- Calls/video controls.
- Chat header redesign.
- Chat background/pattern redesign.
- Message bubbles/media redesign.
- Composer/input redesign.
- Auth/login/register redesign.
- Backend/API/database changes.
- New dependencies unless explicitly justified.

## Allowed Files

- `client/src/components/HomePage.tsx`
- `client/src/contexts/ThemeContext.tsx` only if the current toggle logic is broken
- `docs/AI_WORKLOG.md`
- `docs/tasks/active/NEXT_AGENT_TASK.md`
- `docs/CONTROL_PLANE.md`
- `docs/BACKLOG.md`

## Forbidden Files

- Server files
- Docker/deployment files
- Database/migration files
- `ChatView.tsx`
- `MessageInput.tsx`
- `VoicePlayer.tsx`
- `VoiceRecorder.tsx`
- Auth screens
- Modal internals unless a tiny class-only fix is required for the existing modals opened by this menu
- Avatar preview/viewer implementation
- New search/settings/calls/video UI

If a forbidden file seems necessary, stop and add a change request instead of editing it.

## Implementation Notes

1. Reuse existing state:
   - `showCreate`
   - `showGroup`
   - `setShowCreate(true)`
   - `setShowGroup(true)`
2. Add a small local state such as `showCreateMenu`.
3. Keep the bottom create icon button as the single visible create action.
4. Render a small popover/menu above the create button or bottom bar.
5. The menu should visually match the sidebar style:
   - subtle border;
   - dark/light theme support;
   - compact rows;
   - clear labels;
   - no oversized card.
6. Suggested menu labels:
   - `Personal chat`
   - `Group chat`
7. Use accessible labels and keyboard-friendly behavior where practical.
8. Do not remove `CreateGroupModal`; it should become reachable again through the menu.
9. If theme toggle already works technically, do not rewrite `ThemeContext`; improve only visible sidebar light-mode styling if needed.

## Verification Commands

```powershell
npm.cmd run build
npm.cmd test
git diff --check
git status --short --branch
```

Manual QA:

- Desktop: create button opens compact menu.
- Desktop: personal chat option opens existing personal chat modal.
- Desktop: group chat option opens existing group chat modal.
- Desktop: menu closes after selection and on outside click/Escape where implemented.
- Desktop: theme button visibly switches light/dark.
- Desktop: sidebar looks acceptable in light and dark modes.
- Mobile/narrow: create menu is usable and does not overflow/cut off.
- Bottom bar still has exactly three visible buttons.
- No search/settings/calls/video/avatar preview controls appear.

## Acceptance Criteria

- [ ] Group chat creation is reachable again.
- [ ] Personal and group creation are both available from one create menu.
- [ ] Bottom action bar still shows exactly three buttons.
- [ ] Theme toggle visibly changes theme.
- [ ] Sidebar light mode is acceptable.
- [ ] Menu works on desktop and mobile/narrow widths.
- [ ] No out-of-scope features are added.
- [ ] Build/tests/diff checks pass or failures are documented.
- [ ] Worklog and task execution result are updated.

## Definition Of Done

- Follow `docs/DEFINITION_OF_DONE.md`.
- Apply `docs/gates/frontend-ui.md`.
- Governor review required before merge.

## Execution Result

Status: Implemented - ready for Governor review.

### Changes

**HomePage.tsx** (`client/src/components/HomePage.tsx`):

- Added `showCreateMenu` state and `createMenuRef`.
- Added `useEffect` with `mousedown` (outside click) and `keydown` (Escape) listeners to close the menu.
- Create button: `onClick` now toggles `showCreateMenu`. Button highlights when menu is open (`text-primary bg-gray-100 dark:bg-gray-800`).
- Create menu: compact popover positioned above the create button (`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20`).
  - Two menu items with icons and labels:
    - **Personal chat** (user icon) - closes menu, opens `CreateChatModal` via `setShowCreate(true)`.
    - **Group chat** (group icon) - closes menu, opens `CreateGroupModal` via `setShowGroup(true)`.
  - Both modals are reused as-is with zero changes to their internals.
  - Menu supports `role="menu"` / `role="menuitem"` for accessibility.
- Bottom action bar still shows exactly three visible buttons (create menu, theme toggle, logout).

**ThemeContext**: Not modified. Verified working - `toggleTheme()` correctly toggles `dark` class on `<html>` and persists to `localStorage`. Sidebar already has proper `dark:` variants (`dark:bg-gray-900`, `dark:border-gray-800`, `dark:text-white`, etc.). Light mode uses `bg-gray-50` sidebar - acceptable for this scope.

### Verification

- `npm.cmd run build`: passed (client tsc + vite + server)
- `npm.cmd test`: passed, 95/95 (client 23 + server 72)
- `git diff --check`: CRLF warnings only (Windows expected)
- `git status --short --branch`: modified tracked files as expected

### Manual QA Status

Not performed on device. Recommended checks:

- Desktop: create button opens compact menu with Personal / Group options
- Desktop: Personal chat opens existing CreateChatModal
- Desktop: Group chat opens existing CreateGroupModal
- Desktop: menu closes after selection, on outside click, and on Escape
- Desktop: theme button visibly switches light/dark
- Desktop: sidebar looks acceptable in light and dark modes
- Mobile/narrow: create menu usable and not cut off
- Bottom bar still has exactly three visible buttons
- No search/settings/calls/video/avatar preview controls added

## Change Request Rule

If implementation requires avatar viewer, settings, search, calls/video, backend APIs, new dependencies, or changes outside allowed files, stop and add `docs/CHANGE_REQUESTS.md`.

## Governor Review Result

Status: Accepted.

Review date: 2026-07-17

### Findings

- No blocking findings.
- Non-blocking: a second click on the already-open create button may not close the menu because the outside-click listener tracks the popover but not the button. Selection, outside click, and Escape close paths are sufficient for this task.

### Verification

- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 95/95.
- `git diff --check`: passed with CRLF warnings only.

### Next Step

Docker rebuild and user visual QA before packaging/commit.
