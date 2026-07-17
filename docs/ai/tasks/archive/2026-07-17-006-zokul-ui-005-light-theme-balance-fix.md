# NEXT_AGENT_TASK: Light Theme Balance Fix

Task ID: ZOKUL-UI-005
Status: Review
Created by: Governor
Assigned role: Executor
Recommended branch: current working branch `codex/zokul-ui-redesign`
Change type: design
Risk level: Medium
Confidence: High

## Executive Summary

The first soft light theme pass improved harsh white surfaces, but user visual QA showed the layout is still unbalanced: the left sidebar reads as a gray block while the main chat area reads as a large white/empty field. This task is a focused corrective pass to visually unify the left and right zones in light mode.

Do not redesign the interface. Do not add new features. Adjust only the light-theme balance of existing surfaces so the messenger feels intentional and cohesive.

## User Visual Feedback

Screenshot: `C:/Users/Lotus/Pictures/Screenshots/Снимок экрана (13).png`

Observed problem:

- Left sidebar is visibly more gray/blue.
- Main chat area is too bright and almost white.
- Header/composer do not create enough visual weight.
- Large empty chat area looks like a document page rather than messenger space.

## Must Do

- Make the main chat area darker/warmer within the same soft blue-gray family.
- Make the sidebar slightly less gray or better aligned with the main chat background.
- Make chat header and composer feel like deliberate surfaces, not white strips.
- Keep selected chat row clearly visible.
- Keep incoming/outgoing messages readable.
- Keep dark theme unchanged.
- Keep layout/functionality unchanged.

## Must Not Do

- Do not add avatar viewer in this task.
- Do not add search, settings page, calls/video, reactions, read receipts, pinned chats, or new controls.
- Do not touch backend/API/database/socket code.
- Do not change auth screens.
- Do not add dependencies.
- Do not refactor components or state.
- Do not change message ordering, upload logic, voice recording logic, or chat creation behavior.

## Target Visual Direction

Use one coherent soft-light palette instead of separate gray-left/white-right zones.

Recommended palette:

- App shell / main chat background: `#EAF1F8`
- Chat subtle depth overlay/pattern: optional, extremely subtle, light-mode only
- Sidebar background: `#E8EFF7`
- Sidebar selected row: `#D7E6F6`
- Sidebar hover row: `#DFEAF5`
- Sidebar/header border: `#C9D6E4`
- Chat header: `#E6EEF7`
- Composer bar: `#E1EAF4`
- Composer input: `#F4F7FB` or `#EDF3F8`
- Incoming bubble: `#DDE8F3`
- Incoming timestamp/secondary text: `#7890A8`
- Popovers/elevated surfaces: `#F4F7FB`

Avoid pure white in the logged-in messenger light theme except possibly tiny highlights.

## Optional Pattern Guidance

You may add a very subtle light-only chat background texture using CSS gradients in existing className/style if it stays understated.

Allowed style idea:

- Base color remains `#EAF1F8`.
- Pattern opacity must be extremely low.
- No decorative blobs/orbs.
- No busy illustration.
- Must not reduce message readability.

If unsure, skip the pattern and solve with surfaces/colors only.

## Required Reading

- `docs/ai/00_README_FOR_AGENTS.md`
- `docs/ai/CONTROL_PLANE.md`
- `docs/ai/12_DEFINITION_OF_DONE.md`
- `docs/ai/gates/frontend-ui.md`
- `client/src/components/layout/AppLayout.tsx`
- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatList.tsx`
- `client/src/components/chat/ChatView.tsx`
- `client/src/components/chat/MessageInput.tsx`

## Scope

Included:

- Light theme color balance for sidebar, chat area, header, composer, chat rows, bubbles, and relevant popovers.
- Adjusting arbitrary Tailwind color values introduced by `ZOKUL-UI-004`.
- Optional very subtle light-only chat background gradient/pattern.
- Documentation updates required by protocol.

Out of scope:

- Avatar viewer.
- Dark theme redesign.
- Auth screen redesign.
- Backend/API/database/socket changes.
- New UI controls.
- Layout restructuring.
- New dependencies.

## Allowed Files

- `client/src/components/layout/AppLayout.tsx`
- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatList.tsx`
- `client/src/components/chat/ChatView.tsx`
- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/chat/MessageActions.tsx` only if popover color must be rebalanced
- `client/src/components/chat/ReplyQuote.tsx` only if quote color must be rebalanced
- `client/src/components/chat/VoicePlayer.tsx` only if track color must be rebalanced
- `client/src/components/chat/VoiceRecorder.tsx` only if recorder color must be rebalanced
- `docs/ai/10_AI_WORKLOG.md`
- `docs/ai/tasks/active/NEXT_AGENT_TASK.md`
- `docs/ai/CONTROL_PLANE.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`
- `docs/ai/AUDIT_LOG.md`

## Forbidden Files

- Server files
- Docker/deployment files
- Database/migration files
- Auth components
- `ThemeContext.tsx`
- Package/dependency files
- New component files
- Modal logic files unless a change request is approved

## Implementation Instructions

1. Inspect the current `ZOKUL-UI-004` arbitrary colors.
2. Replace main chat background `#F5F8FB` style values with a slightly deeper `#EAF1F8` family.
3. Rebalance sidebar from `#E7EDF5` if needed toward `#E8EFF7`, so it no longer feels much darker than the chat area.
4. Make chat header and composer surfaces slightly denser than the main chat background.
5. Make incoming bubble slightly denser than the chat background.
6. Keep outgoing message blue unchanged unless contrast is broken.
7. Keep all `dark:` classes visually equivalent to before.
8. Do not change dimensions, spacing, message layout, or component behavior unless unavoidable for a color-only class.
9. Update docs with execution result and verification results.

## Tests To Add Or Update

No new automated tests required for color-only adjustment unless existing tests fail. Do not add snapshots.

## Verification Commands

```powershell
npm.cmd run build
npm.cmd test
git diff --check
git status --short --branch
```

Manual QA:

- Light theme: sidebar and chat area feel like one coherent interface.
- Light theme: main chat area is not plain white.
- Light theme: header and composer have intentional surface contrast.
- Light theme: selected chat row remains visible.
- Light theme: incoming/outgoing bubbles remain readable.
- Dark theme: no obvious regression.
- Create menu, theme toggle, logout, chat select, send text/image/voice still work.

## Acceptance Criteria

- [ ] Right chat area no longer looks like a mostly white blank document.
- [ ] Left and right zones are visually balanced.
- [ ] Header/composer are coherent with the rest of the light theme.
- [ ] No out-of-scope functionality added.
- [ ] Dark theme not regressed.
- [ ] Build/tests/diff checks pass or failures are documented.
- [ ] Worklog and active task execution result updated.

## Definition Of Done

- Follow `docs/ai/12_DEFINITION_OF_DONE.md`.
- Apply `docs/ai/gates/frontend-ui.md`.
- Governor review required before packaging/commit.

## Execution Result

Status: Implemented — ready for Governor review.

### Changes

Color-only rebalance of the light theme so sidebar and chat area feel cohesive. All values are Tailwind arbitrary colors — no design tokens, no new features.

| Area | ZOKUL-UI-004 → ZOKUL-UI-005 |
|---|---|
| App shell | `#F3F6FA` → `#EAF1F8` |
| Sidebar | `#E7EDF5` → `#E8EFF7` |
| Sidebar/hader border | `#CBD6E2` → `#C9D6E4`, `#D5DEE9` → `#C9D6E4` |
| Chat section bg | `#F5F8FB` → `#EAF1F8` |
| Chat header | `#F5F8FB` → `#E6EEF7` |
| Composer bar | `#E8EEF6` → `#E1EAF4` |
| Form/header border | `#D5DEE9` → `#C9D6E4` |
| Selected row | `#DCE8F7` → `#D7E6F6` |
| Hover rows | `#E7EDF5` → `#DFEAF5` |
| Button hovers | `#DCE8F7` → `#D7E6F6` |
| Menu/popover hovers | `#E7EDF5` → `#DFEAF5` |
| Incoming bubble | `#E6EDF5` → `#DDE8F3` |
| Reply quote / recorder | `#E8EEF6` → `#E1EAF4` |
| Track/delete hover | `#CBD6E2` → `#C9D6E4` |
| Empty state icons | `#E7EDF5` → `#DFEAF5` |
| Popovers (elevated) | kept `#F8FAFD` (lighter) |

### Verification

- `npm.cmd run build`: passed (client tsc + vite + server)
- `npm.cmd test`: passed, 95/95 (client 23 + server 72)
- `git diff --check`: CRLF warnings only (Windows expected)
- `git status --short --branch`: modified tracked files as expected

### Manual QA Status

Not performed. Recommended checks:
1. Light theme: sidebar and chat area feel like one coherent blue-gray interface
2. Main chat area is no longer plain white
3. Header/composer are slightly denser than the main chat bg
4. Selected chat row remains clearly visible (`#D7E6F6`)
5. Incoming bubble (`#DDE8F3`) reads against chat bg (`#EAF1F8`)
6. Dark theme unchanged
7. Create menu, theme toggle, logout, chat selection work
8. Desktop and mobile no clipping

## Change Request Rule

If implementation requires touching files outside Allowed Files, changing behavior outside Scope, or adding any feature/control, stop and add `docs/ai/CHANGE_REQUESTS.md`.

## Governor Review Result

Status: Accepted.

Review date: 2026-07-17

### Findings

- No blocking findings.
- Scope stayed within `ZOKUL-UI-005`: color-only light theme balance correction.
- No out-of-scope features were added.

### Verification

- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 95/95.
- `git diff --check`: passed with CRLF warnings only.

### Next Step

Docker rebuild and user visual QA before packaging/commit.
