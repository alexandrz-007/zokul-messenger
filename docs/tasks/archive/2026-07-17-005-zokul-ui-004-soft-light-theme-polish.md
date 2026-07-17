# NEXT_AGENT_TASK: Soft Light Theme Polish

Task ID: ZOKUL-UI-004
Status: Review
Created by: Governor
Assigned role: Executor
Recommended branch: current working branch `codex/zokul-ui-redesign`
Change type: design
Risk level: Medium
Confidence: High

## Executive Summary

The current light theme is too bright because several surfaces resolve to pure white or near-white. Keep the approved messenger layout and dark theme, but make the light theme softer and less eye-straining. The target is a calm blue-gray "soft light" palette similar to a polished messenger, not a blank white app.

This task must only tune existing visual colors and surface contrast. Do not add features, restructure layout, or redesign message behavior.

## Must Do

- Replace harsh pure-white/very bright light surfaces in the logged-in messenger UI with a soft blue-gray light palette.
- Keep the dark theme visually unchanged except where a class must be paired with a light class.
- Preserve all existing workflows: chat selection, profile edit, create menu, group chat, theme toggle, logout, send text/image/voice.
- Make the light theme look coherent across sidebar, chat area, chat header, composer, popovers, empty/loading/error states, and message bubbles.
- Keep outgoing messages blue and readable.
- Keep incoming messages neutral blue-gray and readable.
- Verify desktop and narrow/mobile layout does not clip or overlap.

## Must Not Do

- Do not add search, settings page, calls/video, avatar viewer, reactions, pinned chats, or read receipts.
- Do not change backend/API/database/socket code.
- Do not change auth/login/register screens unless the exact same theme bug is visible there and a change request is documented first.
- Do not change modal behavior or form logic.
- Do not introduce new dependencies.
- Do not rename components or refactor state management.
- Do not remove `darkMode: 'class'` from Tailwind config.

## Context

User approved the current redesigned sidebar and create menu, but reported the light theme is too bright. The theme toggle now works after adding `darkMode: 'class'` in `client/tailwind.config.js`.

Preferred light palette:

- App/chat background: `#F3F6FA` or Tailwind-like `slate-100`/custom equivalent.
- Sidebar background: `#E7EDF5`.
- Selected chat row: `#DCE8F7`.
- Chat panel background: `#F5F8FB`.
- Incoming bubble: `#E6EDF5`.
- Composer/input surface: `#E8EEF6`.
- Borders: `#D5DEE9` / `#CBD6E2`.
- Text: keep dark enough for accessibility, roughly slate/gray 800-900 for primary text and slate/gray 500-600 for secondary text.

Use Tailwind arbitrary values if that is the smallest safe change, for example `bg-[#F3F6FA]`. Prefer local component classes over adding a new design token system in this task.

## Required Reading

- `docs/00_README_FOR_AGENTS.md`
- `docs/CONTROL_PLANE.md`
- `docs/12_DEFINITION_OF_DONE.md`
- `docs/gates/frontend-ui.md`
- `client/tailwind.config.js`
- `client/src/components/layout/AppLayout.tsx`
- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatList.tsx`
- `client/src/components/chat/ChatView.tsx`
- `client/src/components/chat/MessageInput.tsx`

## Scope

Included:

- Light theme surface colors in the logged-in messenger shell.
- Sidebar background, divider, account header, bottom action bar, create menu popover, and chat row light states.
- Chat header light surface and border.
- Main chat background light surface.
- Incoming message bubble light surface.
- Composer/input light surface, border, hover/focus surfaces, emoji popover if visually harsh.
- Empty/loading/error state surfaces if they look too white.
- Minimal Tailwind config use only if required for theme classes to compile.

Out of scope:

- Dark theme redesign.
- Auth screen redesign.
- Avatar viewer.
- Read receipts.
- Calls/video controls.
- Chat search.
- Message data model or delivery logic.
- Backend/API/database changes.

## Allowed Files

- `client/src/components/layout/AppLayout.tsx`
- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatList.tsx`
- `client/src/components/chat/ChatView.tsx`
- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/chat/MessageActions.tsx` only if its light popover remains harsh white
- `client/src/components/chat/ReplyQuote.tsx` only if its light quote surface remains harsh white
- `client/src/components/chat/VoicePlayer.tsx` only if its light track/surface remains harsh
- `client/src/components/chat/VoiceRecorder.tsx` only if its light recorder surface remains harsh
- `client/tailwind.config.js` only to preserve/verify `darkMode: 'class'`, not for broad token work
- `docs/10_AI_WORKLOG.md`
- `docs/tasks/active/NEXT_AGENT_TASK.md`
- `docs/CONTROL_PLANE.md`
- `docs/03_PRODUCT_BACKLOG.md`
- `docs/AUDIT_LOG.md`

## Forbidden Files

- Server files
- Docker/deployment files
- Database/migration files
- Auth components unless a change request is approved
- `ThemeContext.tsx` unless the theme toggle is broken again
- Modal internals unless a small color-only change request is documented
- New component files
- Package/dependency files

## Implementation Instructions

1. Inspect current light and dark classes in the allowed UI files.
2. Keep every existing `dark:` class behavior unless it is clearly paired with a light-only class that needs adjustment.
3. Replace light-only harsh surfaces:
   - `bg-white` in messenger popovers/surfaces should become a soft elevated surface like `bg-[#F8FAFD]` or `bg-[#F3F6FA]` where appropriate.
   - `bg-gray-50` sidebar/main surfaces should become slightly cooler blue-gray surfaces.
   - `bg-gray-100` incoming/composer surfaces should become `bg-[#E6EDF5]` or `bg-[#E8EEF6]`.
   - `border-gray-200` should become a softer blue-gray border like `border-[#D5DEE9]`.
4. Ensure selected chat row is visible in light mode, e.g. `bg-[#DCE8F7]` plus existing primary left border.
5. Ensure hover states remain subtle and do not jump to pure white.
6. Ensure outgoing blue messages still have enough contrast with white text.
7. Do not alter layout sizes, component structure, message ordering, socket logic, upload logic, or modal behavior.
8. Update the task execution result and worklog with exact files changed and verification results.

## Tests To Add Or Update

No new automated tests are required for this color-only UI task unless existing tests fail due to class assertions. Do not add snapshot tests. Manual visual QA is required.

## Verification Commands

```powershell
npm.cmd run build
npm.cmd test
git diff --check
git status --short --branch
```

Manual QA:

- Toggle to light theme.
- Confirm no main messenger surface is harsh pure white.
- Confirm sidebar, chat panel, selected chat row, incoming bubble, composer, and popovers look coherent.
- Confirm text remains readable.
- Confirm dark theme still looks like before.
- Confirm create menu still opens Personal/Group.
- Confirm desktop and narrow/mobile width do not clip/overlap.

## Acceptance Criteria

- [ ] Light theme uses a calm blue-gray palette instead of pure white surfaces.
- [ ] Sidebar and chat area are visually separated without harsh contrast.
- [ ] Selected chat row remains obvious.
- [ ] Incoming and outgoing message bubbles remain readable.
- [ ] Composer/input area looks integrated with the light theme.
- [ ] Dark theme is not visually regressed.
- [ ] No new features or controls are added.
- [ ] Build/tests/diff checks pass or failures are documented.
- [ ] Worklog and active task execution result are updated.

## Definition Of Done

- Follow `docs/12_DEFINITION_OF_DONE.md`.
- Apply `docs/gates/frontend-ui.md`.
- Governor review required before packaging/commit.

## Execution Result

Status: Implemented - ready for Governor review.

### Changes

Color-only edits across 9 component files. Every existing `dark:` class preserved. No features, layout, dependencies, or dark theme changes.

| Area | Before | After |
|---|---|---|
| App background | transparent/white | `#F3F6FA` |
| Sidebar bg | `bg-gray-50` | `#E7EDF5` |
| Sidebar borders | `border-gray-200` | `#CBD6E2` |
| Chat section bg | transparent/white | `#F5F8FB` |
| Chat header | transparent | `#F5F8FB` with `border-[#D5DEE9]` |
| Incoming bubble | `bg-gray-100` | `#E6EDF5` |
| Selected chat row | `bg-gray-100` | `#DCE8F7` |
| Chat row hover | `bg-gray-50` | `#E7EDF5` |
| Composer surface | `bg-gray-100` | `#E8EEF6` |
| Form/top borders | `border-gray-200` | `#D5DEE9` |
| Popovers (menu/actions/emoji/delete) | `bg-white` / `border-gray-200` | `bg-[#F8FAFD]` / `border-[#D5DEE9]` |
| Popover hover | `bg-gray-100` | `#E7EDF5` |
| Reply quote | `bg-gray-100` | `#E8EEF6` |
| Skeleton / track / progress bars | `bg-gray-200` / `bg-gray-300` | `#D5DEE9` / `#CBD6E2` |
| Status dot border | `border-gray-50` | `border-[#E7EDF5]` |
| Menu divider | `border-gray-100` | `border-[#D5DEE9]` |
| Touch recorder / VoiceRecorder surfaces | `bg-gray-100` | `#E8EEF6` |

### Files Changed

- `client/src/components/layout/AppLayout.tsx` - global app bg
- `client/src/components/HomePage.tsx` - sidebar, borders, create menu, buttons, chat section bg
- `client/src/components/chat/ChatList.tsx` - skeleton, empty state, selected/hover rows, delete popover
- `client/src/components/chat/ChatView.tsx` - incoming bubble, empty state icon
- `client/src/components/chat/MessageInput.tsx` - composer, emoji picker, touch recorder, borders
- `client/src/components/chat/MessageActions.tsx` - popover surface & hover
- `client/src/components/chat/ReplyQuote.tsx` - quote surface
- `client/src/components/chat/VoicePlayer.tsx` - track bar
- `client/src/components/chat/VoiceRecorder.tsx` - all surfaces & track

### Verification

- `npm.cmd run build`: passed (client tsc + vite + server)
- `npm.cmd test`: passed, 95/95 (client 23 + server 72)
- `git diff --check`: CRLF warnings only (Windows expected)
- `git status --short --branch`: modified tracked files as listed

### Manual QA Status

Not performed. Recommended checks:
1. Toggle to light theme - no harsh pure white surfaces
2. Sidebar `#E7EDF5`, chat panel `#F5F8FB`, selected row `#DCE8F7` visible
3. Composer `#E8EEF6` blends with form
4. Incoming bubble `#E6EDF5`, outgoing still blue
5. Create menu opens Personal/Group correctly
6. Dark theme unchanged
7. Desktop and mobile no clipping

## Change Request Rule

If implementation requires touching files outside Allowed Files, changing behavior outside Scope, or adding any new feature/control, stop and add an entry to `docs/CHANGE_REQUESTS.md`.

## Worklog Requirements

Update `docs/10_AI_WORKLOG.md` with:

- task ID and branch;
- changed files;
- summary of color changes;
- verification command results;
- manual QA status or not-run reason;
- follow-ups.

## Final Report Format

Report:

- changed files;
- exact visual areas changed;
- build/test/diff results;
- known risks/TODOs;
- whether Docker rebuild is needed for user verification.

## Governor Review Result

Status: Accepted.

Review date: 2026-07-17

### Findings

- No blocking findings.
- Scope stayed within `ZOKUL-UI-004`: color-only light theme polish for existing messenger UI surfaces.
- No out-of-scope features were added.

### Verification

- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 95/95.
- `git diff --check`: passed with CRLF warnings only.

### Next Step

Docker rebuild and user visual QA before packaging/commit.
