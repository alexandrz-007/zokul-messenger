# ACTIVE_TASK: Sidebar Composition & States Polish

Task ID: ZOKUL-UI-002
Status: Ready for Executor
Created by: Governor
Assigned role: Executor
Recommended branch: current working branch unless user says otherwise
Change type: design
Risk level: Medium
Confidence: Medium

## Executive Summary

Refine the already implemented sidebar visual direction after user review. The current style is accepted directionally, but the account/profile area is compositionally wrong: the profile looks like a chat row, the `Zokul` brand is detached at the top, and the sidebar zones need clearer structure.

This task must polish only sidebar composition, spacing, chat row density, states, and mobile/sidebar ergonomics. Do not redesign the chat canvas, header, message bubbles, composer, auth screens, or backend.

## User Feedback

Reference screenshot after `ZOKUL-UI-001`:
- `local screenshot reference`

User said:
- The style direction is good.
- Layout is a bit crooked.
- `Zokul` should be in the empty space to the right of the user's nickname (`aa`/current profile name), not alone at the very top.
- User name/profile should be moved up.
- Add boundaries/dividers because the profile currently looks like a chat dialog.
- The next step may include other sidebar-appropriate polish, but must stay scoped.

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

- Recompose the account/header area in `HomePage.tsx`.
- Move `Zokul` into the profile/header row, in the free space to the right of the user name area.
- Make the profile area visually distinct from chat rows.
- Add clear boundaries/dividers between account header, chat list, and bottom action bar.
- Improve sidebar spacing system: consistent horizontal padding, row radii, and vertical rhythm.
- Refine chat list density in `ChatList.tsx`: avatar size around 42-44px, compact rows, refined selected state, optional left accent line, cleaner timestamp/unread alignment.
- Improve loading/empty/error states inside the sidebar to match the new visual style.
- Refine avatar fallback colors in `Avatar.tsx` if needed: less acidic, more premium/dark UI friendly, still deterministic.
- Improve hover/active/focus-visible microstates for sidebar controls and rows.
- Ensure bottom action bar feels integrated, with clear top divider and equal icon alignment.
- Preserve mobile behavior and make sure the bottom action bar does not cover the last chat row.

Out of scope:

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
- `client/src/components/chat/ChatList.tsx`
- `client/src/components/common/Avatar.tsx`
- `docs/10_AI_WORKLOG.md`
- `docs/tasks/active/NEXT_AGENT_TASK.md`
- `docs/CONTROL_PLANE.md`
- `docs/03_PRODUCT_BACKLOG.md`

## Forbidden Files

- Server files
- Docker/deployment files
- Database/migration files
- `ChatView.tsx`
- `MessageInput.tsx`
- `VoicePlayer.tsx`
- `VoiceRecorder.tsx`
- Auth screens
- Modals, unless a tiny class-only change is absolutely required by a visible sidebar regression
- New search/settings/calls/video UI

If a forbidden file seems necessary, stop and add a change request instead of editing it.

## Design Instructions

### 1. Account Header

Target structure:

```text
[avatar] user name/status          Zokul
----------------------------------------
chat list
```

Requirements:

- Profile block should sit higher and feel like an account header, not a chat row.
- `Zokul` should sit in the same top/account zone, visually to the right, using free space.
- Use a subtle panel/background/border/divider to separate the account header from the chat list.
- Keep profile/header click behavior for profile editing.
- Preserve profile editor behavior.
- Do not add dropdown/settings behavior.

### 2. Chat Rows

- Reduce row visual bulk compared with `ZOKUL-UI-001`.
- Use avatar size around 42-44px.
- Selected state should be closer to the concept: compact selected fill, optional left accent line, no oversized card feeling.
- Row content hierarchy: name clear, preview muted, timestamp aligned and not wrapping, unread badge stable.
- Delete affordance should not make rows visually unstable.

### 3. Sidebar States

Update only sidebar-local states:

- loading skeleton;
- empty chat state;
- error state.

They should match the dark/premium sidebar style and not look like default placeholders.

### 4. Bottom Action Bar

- Keep exactly three actions: create chat, theme toggle, logout.
- Add/keep clear top divider.
- Buttons should have equal hit areas and consistent icon sizing.
- No settings button yet.

### 5. Mobile

- Sidebar remains full-width on chat list screen.
- Account header should not consume too much vertical space.
- Chat list scroll area should remain usable.
- Bottom action bar should not cover the last row.
- Touch targets should remain at least 40px.

## Must Not Do

- Do not add chat search.
- Do not add settings UI.
- Do not add fake controls.
- Do not change chat/message/composer visuals.
- Do not change business logic for chats, messages, auth, or sockets.
- Do not introduce new product features.

## Verification Commands

```powershell
npm.cmd run build
npm.cmd test
git diff --check
git status --short --branch
```

Manual QA:

- Desktop: account header no longer looks like a chat row.
- Desktop: `Zokul` appears in the free space to the right of the profile/name area.
- Desktop: profile click still opens profile editor.
- Desktop: selected chat row is compact and visually clear.
- Desktop: bottom actions remain create/theme/logout and work.
- Mobile/narrow viewport: sidebar remains usable; bottom bar does not cover last chat.
- No search/settings/calls/video controls appear.
- No text overlap/clipping in profile/header or chat rows.

## Acceptance Criteria

- [ ] User profile/header is visually distinct from chat rows.
- [ ] `Zokul` is moved into the account/header area to the right of the user identity.
- [ ] Sidebar zones have clear boundaries/dividers.
- [ ] Chat rows are more compact and better aligned.
- [ ] Selected chat state is refined and not oversized.
- [ ] Loading/empty/error states match the sidebar style.
- [ ] Bottom action bar is visually integrated.
- [ ] Mobile sidebar remains usable.
- [ ] No out-of-scope UI controls are added.
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
- Replaced the 12-color palette with deeper, premium-friendly colors: `#007AFF`, `#E5534B`, `#38A169`, `#DD6B20`, `#7C3AED`, `#14B8A6`, `#EC4899`, `#8B5CF6`, `#D69E2E`, `#10B981`, `#3B82F6`, `#F97316`.
- Algorithm unchanged (hash-based index, deterministic per name).
- Uploaded avatars (`url` prop) unaffected.

**HomePage.tsx** (`client/src/components/HomePage.tsx`):
- Merged Zokul brand into the account header row: `[avatar] user name / Online [flex-1] ZOKUL` with `group-hover:text-primary` on the user name.
- Profile sits at the very top (`pt-3 pb-3`, `px-4`), no standalone "Zokul" line.
- Added `mx-4` horizontal divider after account header.
- Bottom action bar has `border-t` divider, `w-11 h-11` uniform buttons, `w-5 h-5` uniform icons, `focus-visible:ring-2 focus-visible:ring-primary` accessibility.
- Removed `mx-3` and `rounded-xl` from profile button (was making it look like a chat row).

**ChatList.tsx** (`client/src/components/chat/ChatList.tsx`):
- Avatar size reduced from 48px to 42px.
- Row padding reduced from `py-3` to `py-2.5`. Removed `rounded-xl`.
- Selected state uses `border-l-[3px] border-primary` + `bg-gray-100 dark:bg-gray-800/60`. Non-selected uses `border-transparent`.
- Added `LoadingSkeleton`, `EmptyState`, `ErrorState` sub-components with avatar+text skeleton, centered icons, and red error icon respectively.
- `formatTime` fixed to compare year/month/day instead of simple date diff, preventing month/year boundary bugs.
- Delete button: smaller (`p-1`, `w-3.5 h-3.5` icon), cleaner rounded-md hover.
- Container: `overflow-y-auto` without extra side padding (rows handle their own `px-4`).

### Verification

- `npm.cmd run build`: passed (client tsc + vite + server)
- `npm.cmd test`: passed, 95/95 (client 23 + server 72)
- `git diff --check`: CRLF warnings only (Windows expected)
- `git status --short --branch`: modified tracked files as expected

### Manual QA Status

Not performed on device. Recommended checks:

- Desktop: account header no longer looks like a chat row
- Desktop: `Zokul` appears to the right of the user identity in the same header row
- Desktop: profile click still opens profile editor
- Desktop: selected chat row is compact with left accent bar
- Desktop: bottom actions create/theme/logout work
- Mobile/narrow: sidebar usable, bottom bar does not cover last chat row
- No search/settings/calls/video controls
- No text overlap/clipping

## Change Request Rule

If implementation requires settings/search/calls/video, backend APIs, new dependencies, or changes outside allowed files, stop and add `docs/CHANGE_REQUESTS.md`.

## Governor Review Result

Status: Accepted.

Reviewed on: 2026-07-17

Accepted:
- Scope stayed within allowed sidebar/avatar/docs files.
- Account header now combines profile identity and `Zokul` in one row.
- Profile/header is visually distinct from chat rows.
- Sidebar has clearer dividers between account header, chat list, and bottom action bar.
- Chat rows are more compact with a left selected accent.
- Loading, empty, and error states were polished within sidebar scope.
- Bottom actions remain create chat, theme toggle, logout.
- No search/settings/calls/video controls were added.

Verification:
- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 95/95.
- `git diff --check`: passed with CRLF warnings only.

Non-blocking follow-up:
- `ChatList.tsx` still contains a nested delete button inside the chat row button. This was pre-existing and should be cleaned up in a separate accessibility task rather than mixed into this visual polish.
