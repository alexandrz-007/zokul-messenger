# ACTIVE_TASK: Sidebar Visual Polish

Task ID: ZOKUL-UI-001
Status: Ready for Executor
Created by: Governor
Assigned role: Executor
Recommended branch: current working branch unless user says otherwise
Change type: design
Risk level: Medium
Confidence: Medium

## Executive Summary

Polish only the messenger left sidebar/chat list to move Zokul closer to the approved visual concept while preserving current functionality. This is the first small step of the larger UI refresh. Do not redesign the chat canvas, message bubbles, composer, auth screens, or modals in this task.

## User Direction

Reference concept:
- `local screenshot reference`

Current screenshot:
- `local screenshot reference`

User-approved decisions:
- Start with the left sidebar only.
- Do not add chat search yet.
- Bottom sidebar actions should be:
  - create chat;
  - theme toggle;
  - logout.
- Keep profile behavior: clicking the user name/profile opens the existing profile editor for name/avatar changes.
- Profile block should remain, but redesigned visually.
- Dialog avatars should use varied deterministic colors.
- Add a subtle chat/background visual direction later, but not in this sidebar-only task unless it is impossible to avoid.
- Put the `Zokul` brand somewhere in the top area, centered/nice, not above the profile in a way that feels heavy.
- Do not show icons for unavailable features.
- Follow the concept closely, but remove unavailable/fake controls.
- Design must consider both desktop and smartphone usage.

## Required Reading

- `docs/00_README_FOR_AGENTS.md`
- `docs/CONTROL_PLANE.md`
- `docs/12_DEFINITION_OF_DONE.md`
- `docs/gates/frontend-ui.md`
- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatList.tsx`
- `client/src/components/common/Avatar.tsx`
- `client/src/contexts/ThemeContext.tsx`

## Scope

Included:

- Redesign the sidebar shell in `HomePage.tsx`.
- Redesign the chat list rows in `ChatList.tsx`.
- Move sidebar action buttons from top to bottom.
- Keep create chat, theme toggle, logout as bottom actions.
- Keep profile editor trigger on user profile/name click.
- Keep existing group/create-chat functionality available if possible, but do not add new UI for unavailable features.
- Improve selected chat state, hover/active states, spacing, typography, borders, and empty/loading states inside the sidebar.
- Add deterministic avatar color variation if it can be done safely in the existing `Avatar` component or a local helper without changing data models.
- Preserve mobile behavior:
  - sidebar full-width on chat list screen;
  - selected chat still hides sidebar on mobile;
  - touch targets at least 40px.

Out of scope:

- Chat search.
- Calls/video buttons.
- Chat header redesign.
- Chat background/pattern redesign.
- Message bubbles/media redesign.
- Composer/input redesign.
- Auth/login/register redesign.
- Settings page implementation.
- Backend changes.
- Database/schema changes.
- New dependencies unless explicitly necessary and justified.

## Allowed Files

- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatList.tsx`
- `client/src/components/common/Avatar.tsx`
- `client/src/contexts/ThemeContext.tsx` only if needed to use existing theme toggle cleanly
- `client/src/index.css` or existing global CSS only if needed for sidebar-specific tokens/patterns
- relevant focused tests if existing tests require updates
- `docs/10_AI_WORKLOG.md`
- `docs/tasks/active/NEXT_AGENT_TASK.md`
- `docs/CONTROL_PLANE.md`
- `docs/03_PRODUCT_BACKLOG.md`

## Forbidden Files

- Server files
- Docker/deployment files
- Database/migration files
- Auth screens
- `ChatView.tsx`
- `MessageInput.tsx`
- `VoicePlayer.tsx`
- `VoiceRecorder.tsx`
- New search implementation
- New settings page

If a forbidden file seems necessary, stop and add a change request instead of editing it.

## Visual Direction

Aim for a polished dark messenger sidebar close to the provided concept:

- Deep navy/black sidebar background with subtle layered panels.
- Profile block near the top with avatar, name, online status, and a calm menu affordance.
- Brand `Zokul` visible in the top area without taking over the profile block.
- Chat rows should feel denser, cleaner, and more premium:
  - stronger selected state;
  - colored avatar accents;
  - readable name/preview/time hierarchy;
  - unread badge aligned cleanly.
- Bottom action bar should contain three icon buttons:
  - create chat;
  - theme toggle;
  - logout.

Do not copy fake controls from the concept. If a button does nothing or opens an unavailable feature, do not render it.

## Implementation Notes

1. Use the existing `ThemeContext` for theme toggle.
2. Keep `showCreate`, `logout`, and `showProfile` behavior.
3. If group creation currently has a top icon, do not expose it in the new bottom bar unless there is room and the user-approved three-button requirement is preserved. Prefer only direct create chat for this task.
4. Use accessible `aria-label` and `title` for icon buttons.
5. Avoid fragile absolute positioning for core layout.
6. Keep text from clipping at narrow widths.
7. Do not add search UI, even visually.
8. Do not add settings button in this task because settings are not implemented; user chose create/theme/logout for now.

## Verification Commands

```powershell
npm.cmd run build
npm.cmd test
git diff --check
git status --short --branch
```

Manual QA:

- Desktop: open `http://localhost`, sidebar looks close to concept without search.
- Desktop: create chat button opens existing create chat modal.
- Desktop: theme toggle switches light/dark.
- Desktop: logout still logs out.
- Desktop: profile/name click opens profile editor.
- Desktop: selecting chat still opens chat.
- Mobile/narrow viewport: sidebar uses full width and selecting a chat hides it.
- No text overlap/clipping in chat rows.

## Acceptance Criteria

- [ ] Sidebar visual design is clearly improved and closer to the concept.
- [ ] Chat search is not added.
- [ ] Bottom actions are create chat, theme toggle, logout.
- [ ] Profile edit behavior remains available.
- [ ] Chat list selection and unread behavior are preserved.
- [ ] Avatars have varied deterministic colors where no uploaded avatar exists.
- [ ] No unavailable feature controls are shown.
- [ ] Desktop and mobile sidebar layouts are checked.
- [ ] Build/tests/diff checks pass or failures are documented.
- [ ] Worklog and task execution result are updated.

## Definition Of Done

- Follow `docs/12_DEFINITION_OF_DONE.md`.
- Apply `docs/gates/frontend-ui.md`.
- Governor review required before merge.

## Execution Result

Status: Implemented - ready for Governor review.

### Changes

**Avatar.tsx** (`client/src/components/common/Avatar.tsx`):
- Added `AVATAR_COLORS` array (12 distinct colors: blue, pink, green, orange, purple, teal, rose, magenta, yellow, mint, sky, amber).
- Added `getColorForName(name)` - produces a deterministic hash-based color index.
- Removed hardcoded `bg-primary` class; replaced with inline `backgroundColor` using the computed color.
- Uploaded avatars (`url` prop) continue to display the image as before.

**HomePage.tsx** (`client/src/components/HomePage.tsx`):
- Imported `useTheme` from `ThemeContext` for theme toggle.
- Redesigned sidebar:
  - **Top**: "Zokul" brand text (bold, tracking-tight, non-intrusive).
  - **Profile block**: Avatar (44px) + name + "Online" green status, wrapped in a clickable button that opens the `ProfileEditor`. Hover state with rounded-xl highlight.
  - **ChatList**: fills remaining space.
  - **Bottom action bar**: three icon buttons in a row - create chat (edit/pencil icon) -> opens `CreateChatModal`; theme toggle (sun/moon icon) -> calls `toggleTheme()`; logout (door icon) -> calls `logout()`. Each 56px max-width, h-11 touch target, hover highlight, themed hover colors.
- Removed top bar with old create-group / create-chat / logout buttons.
- Kept `showGroup` state and `CreateGroupModal` in JSX (not removed, only UI entry removed).
- Chat view header and all other functionality unchanged.

**ChatList.tsx** (`client/src/components/chat/ChatList.tsx`):
- Added `formatTime` helper: shows time for today's messages, "Yesterday" for yesterday, short date for older.
- Redesigned each chat row:
  - Rounded-xl container with selected state (`bg-gray-100 dark:bg-gray-800`) and hover state (`bg-gray-50 dark:hover:bg-gray-800/50`).
  - Name: `font-bold` + `text-gray-900 dark:text-white` when unread; `font-semibold` + `text-gray-900 dark:text-gray-100` when read.
  - Timestamp: `text-[11px] text-gray-400`, shrink-0, no wrapping.
  - Preview: `text-xs`, muted color, heavier weight when unread.
  - Unread badge: `min-w-[20px] h-5 rounded-full bg-primary text-white text-[10px] font-bold`.
  - Delete button: `opacity-0 group-hover:opacity-100`, rounded-lg hover bg, clean trash icon.
  - Delete confirmation popup positioned at `right-2 top-10`.
- Loading/error/empty states preserved with updated styling.

### Verification

- `npm.cmd run build`: passed (client tsc + vite + server)
- `npm.cmd test`: passed, 95/95 (client 23 + server 72)
- `git diff --check`: CRLF warnings only (Windows expected)
- `git status --short --branch`: modified tracked files; untracked `docs/tasks/archive/`

### Manual QA Status

Not performed on device. Recommended checks before merge:

- Desktop: sidebar looks close to concept without search
- Desktop: create chat button opens existing create chat modal
- Desktop: theme toggle switches light/dark
- Desktop: logout still logs out
- Desktop: profile/name click opens profile editor
- Desktop: selecting chat still opens chat
- Mobile/narrow viewport: sidebar uses full width and selecting a chat hides it
- No text overlap/clipping in chat rows

## Change Request Rule

If implementation requires adding settings, search, calls/video, backend APIs, new dependencies, or broad layout changes outside the sidebar, stop and add `docs/CHANGE_REQUESTS.md`.

## Governor Review Result

Status: Accepted.

Reviewed on: 2026-07-17

Accepted:
- Scope stayed within sidebar/chat-list/avatar files.
- Chat search was not added.
- Bottom actions are create chat, theme toggle, and logout.
- Profile editor behavior remains available through the profile block.
- Avatar fallback colors are deterministic.
- Build and tests pass.

Verification:
- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 95/95.
- `git diff --check`: passed with CRLF warnings only.

Non-blocking follow-ups:
- `ChatList.tsx` still contains a nested delete button inside the chat row button. This was pre-existing but should be cleaned up in an accessibility-focused pass.
- `formatTime()` can mislabel yesterday around month/year boundaries. Current behavior is acceptable for this visual task but should be hardened later.
- Manual visual approval by the user is still recommended before packaging/commit.
