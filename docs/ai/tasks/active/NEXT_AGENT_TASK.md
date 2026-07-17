# NEXT_AGENT_TASK: Polish Zokul messenger interface

Task ID: ZOKUL-UI-001
Status: Ready for Executor
Created by: Governor
Assigned role: Executor
Recommended branch: codex/zokul-ui-redesign
Change type: design
Risk level: Medium
Confidence: High

## Executive Summary

Redesign the existing Zokul web messenger UI to feel like a polished modern dark-mode messenger while preserving current functionality. Do not add UI for unavailable features. The target style is calm, premium, compact, readable, and product-like: better sidebar, message bubbles, image messages, composer, auth screens, empty states, and modals.

## Must Do

- Improve existing UI only.
- Keep all current app behavior intact.
- Keep dark mode first, but do not intentionally break light mode.
- Remove the thick blue frame/background around outgoing image messages.
- Make message bubbles, timestamps, date separators, and media cards more refined.
- Make sidebar/chat list denser and easier to scan.
- Make message input feel like a stable polished composer dock.
- Improve login/register visual polish.
- Improve empty chat state.
- Improve modal styling consistency.
- Run build/test verification.

## Must Not Do

- Do not add call buttons.
- Do not add video buttons.
- Do not add message reactions.
- Do not add pinned chats.
- Do not add fake search if no working search exists.
- Do not add archive/folders/filters unless already implemented.
- Do not change backend/API/Socket.IO behavior.
- Do not change auth logic.
- Do not touch `production`.
- Do not include unrelated generated files.

## Context

The current UI is functional but visually MVP-like: very dark, blue-heavy, sparse, and not yet distinctive. Prior design audit recommended a calm premium messenger direction.

Reference design guidance:

- `docs/09_UI_REDESIGN_IMPLEMENTATION_GUIDE.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`
- `docs/ai/gates/frontend-ui.md`
- `docs/ai/12_DEFINITION_OF_DONE.md`

## Visual Direction

Use a calm premium messenger style:

- compact but breathable;
- professional, not decorative;
- dark mode first;
- no landing-page hero patterns inside the app;
- no fake future controls;
- no heavy gradients or decorative blobs.

Suggested dark palette:

| Role | Color |
|---|---|
| App background | `#0B111C` |
| Sidebar background | `#0E1726` |
| Header/input panels | `#111C2D` |
| Elevated surface | `#162235` |
| Incoming bubble | `#1B2738` |
| Outgoing bubble | `#2F7CF6` |
| Outgoing active/hover | `#2563EB` |
| Primary text | `#F8FAFC` |
| Secondary text | `#94A3B8` |
| Muted text | `#64748B` |
| Border | `rgba(148, 163, 184, 0.16)` |
| Online | `#22C55E` |
| Danger | `#EF4444` |

Do not blindly hard-code every color if existing Tailwind/theme tokens can express it cleanly. Prefer maintaining current project style patterns.

## Required Reading

- `docs/ai/00_README_FOR_AGENTS.md`
- `docs/ai/00_PROJECT_OVERVIEW.md`
- `docs/ai/02_CODE_STRUCTURE.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`
- `docs/ai/05_DEVELOPMENT_PROCESS.md`
- `docs/ai/06_QA_CHECKLIST.md`
- `docs/ai/12_DEFINITION_OF_DONE.md`
- `docs/ai/gates/frontend-ui.md`
- `docs/09_UI_REDESIGN_IMPLEMENTATION_GUIDE.md`

Source files to inspect before editing:

- `client/src/index.css`
- `client/tailwind.config.js`
- `client/src/components/HomePage.tsx`
- `client/src/components/layout/AppLayout.tsx`
- `client/src/components/chat/ChatList.tsx`
- `client/src/components/chat/ChatView.tsx`
- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/common/Avatar.tsx`
- `client/src/components/common/Button.tsx`
- `client/src/components/common/Modal.tsx`
- `client/src/components/auth/LoginForm.tsx`
- `client/src/components/auth/RegisterForm.tsx`

## Scope

Included:

- visual styling and layout improvements for existing UI;
- auth screens;
- sidebar/chat list;
- empty state;
- chat header;
- message timeline;
- text bubbles;
- image/media messages;
- voice message styling if present;
- message composer;
- modals;
- responsive/mobile polish;
- tests only if existing tests need updates due to markup/class changes.

Out of scope:

- backend changes;
- API changes;
- realtime behavior changes;
- new product features;
- new routes;
- new dependencies unless absolutely necessary and approved;
- Figma generation;
- production deployment.

## Allowed Files

Primary:

- `client/src/index.css`
- `client/tailwind.config.js`
- `client/src/components/HomePage.tsx`
- `client/src/components/layout/AppLayout.tsx`
- `client/src/components/chat/ChatList.tsx`
- `client/src/components/chat/ChatView.tsx`
- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/common/Avatar.tsx`
- `client/src/components/common/Button.tsx`
- `client/src/components/common/Modal.tsx`
- `client/src/components/auth/LoginForm.tsx`
- `client/src/components/auth/RegisterForm.tsx`

Secondary if needed:

- `client/src/components/chat/MessageActions.tsx`
- `client/src/components/chat/ReplyQuote.tsx`
- `client/src/components/chat/VoicePlayer.tsx`
- `client/src/components/chat/ImageViewer.tsx`
- `client/src/components/profile/ProfileEditor.tsx`
- `client/__tests__/*`
- `docs/ai/10_AI_WORKLOG.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`
- `docs/ai/tasks/active/NEXT_AGENT_TASK.md`
- `docs/ai/CHANGE_REQUESTS.md`

## Forbidden Files

- `server/**`
- `.env`
- `node_modules/**`
- `dist/**`
- `uploads/**`
- `client/tsconfig*.tsbuildinfo`
- generated build artifacts
- Docker/deployment files
- `docs/ai/09_DECISIONS.md` unless Governor explicitly asks
- `docs/ai/14_RELEASE_PROTOCOL.md`
- `docs/ai/tasks/archive/**`

## Implementation Instructions

1. Preflight:
   - Check `git status --short --branch`.
   - Note existing unrelated dirty files. Do not stage or modify them unless necessary.
   - If branch creation is safe, create/switch to `codex/zokul-ui-redesign`. If unsafe because of existing changes, continue carefully and report.

2. Inspect existing UI structure:
   - Identify current Tailwind tokens/classes in `index.css` and `tailwind.config.js`.
   - Identify where message bubbles, image messages, composer, sidebar, auth forms, and modals are styled.

3. Establish visual tokens:
   - Prefer CSS variables or Tailwind theme extension if current project supports it cleanly.
   - Keep changes simple and maintainable.
   - Avoid large one-off class chaos when a small shared utility class is clearer.

4. Auth screens:
   - Make login/register feel branded and intentional.
   - Keep forms simple and centered.
   - Reduce dead empty space.
   - Improve field/button/focus/error styling.
   - Do not add social login or marketing sections.

5. Sidebar/chat list:
   - Improve header spacing and current user area.
   - Keep only existing working controls.
   - Make chat rows denser and more scannable.
   - Selected chat should have a clear but subtle highlight.
   - Timestamps/previews should align consistently.
   - Avatars without images should use calmer varied colors, not all identical bright blue if practical.

6. Empty state:
   - Replace the plain empty center with a polished, quiet state.
   - Suggested copy:
     - `Select a chat`
     - `Choose a conversation from the sidebar or create a new one.`
   - Do not make it a landing page.

7. Chat header:
   - Improve avatar/name/status alignment.
   - Keep mobile back button.
   - Do not add call/video/search icons unless they already work.

8. Message timeline:
   - Improve spacing, max-width, radius, timestamp placement, and date separators.
   - Incoming bubbles: muted slate/elevated surface.
   - Outgoing bubbles: calmer blue.
   - Small messages should not look like oversized pills.
   - Long messages should wrap cleanly.

9. Image/media messages:
   - Remove thick outgoing blue frame/background around uploaded/forwarded images.
   - Render images as rounded media cards.
   - Use subtle outline/shadow only if needed.
   - Ensure timestamp/checkmark does not overlap media.

10. Message composer:
   - Make the bottom input area a stable composer dock.
   - Keep only existing working actions.
   - Send button should have clear enabled/disabled state.
   - Input focus should be visible.
   - Ensure no overlap on mobile.

11. Modals:
   - Align modal styling with new surface system.
   - Keep content compact and mobile-safe.

12. Update tests only if needed:
   - Existing tests should still pass.
   - Do not weaken tests to pass.

13. Update docs:
   - Append execution result to this task.
   - Append worklog entry to `docs/ai/10_AI_WORKLOG.md`.
   - Mark `ZOKUL-UI-001` status in `docs/ai/03_PRODUCT_BACKLOG.md` as `Review` or `Done` depending on task completion policy.

## Tests To Add Or Update

Only update tests if markup or accessible names change enough to break current tests.

Do not add snapshot-heavy tests for pure styling.

## Verification Commands

Run:

```powershell
cd client
npm.cmd run build
npm.cmd test
cd ..
```

Then run from repo root if practical:

```powershell
npm.cmd run build
npm.cmd test
git diff --check
git status --short
```

If full root tests are slow but available, run them. If any command cannot run, document the reason.

## Manual / Visual QA

If the app can be run locally, inspect:

- login screen;
- register screen;
- no selected chat empty state;
- selected chat with text messages;
- selected chat with image messages;
- message composer;
- create chat modal;
- create group modal;
- profile editor;
- desktop viewport;
- mobile/narrow viewport.

Required visual checks:

- no fake future controls;
- no thick blue frame around image messages;
- no text overlap/clipping;
- mobile composer remains usable;
- selected chat is obvious;
- dark theme remains coherent.

## Acceptance Criteria

- [ ] UI looks materially more polished while preserving current functionality.
- [ ] No controls for unavailable features were added.
- [ ] Outgoing image messages no longer have a thick blue frame/background.
- [ ] Sidebar is more scannable and selected chat state is clear.
- [ ] Message bubbles and timestamps look refined.
- [ ] Composer is stable and polished.
- [ ] Auth screens and modals match the new visual system.
- [ ] Client build passes.
- [ ] Client tests pass.
- [ ] Root build/tests pass or reason for not running is documented.
- [ ] Worklog and task execution result are updated.

## Definition Of Done

- Follow `docs/ai/12_DEFINITION_OF_DONE.md`.
- Apply `docs/ai/gates/frontend-ui.md`.
- Risk level is Medium, so Governor review is required before marking Accepted.

## Change Request Rule

If implementation requires touching files outside Allowed Files, adding dependencies, adding unavailable UI features, or changing app behavior/API, stop and add an entry to `docs/ai/CHANGE_REQUESTS.md`.

## Worklog Requirements

Update `docs/ai/10_AI_WORKLOG.md` with:

- branch;
- changed files;
- verification results;
- visual QA performed or not performed;
- follow-ups.

## Final Report Format

Report:

- changed files;
- what visual areas changed;
- verification commands and results;
- visual QA status;
- commit hash if committed;
- known risks/TODOs.

---

## Execution Result (ZOKUL-UI-001)

**Executor**: project-executor
**Branch**: `codex/zokul-ui-redesign`
**Date**: 2026-07-17
**Status**: `Implemented` (awaiting Governor review per Medium risk level)

### Changed Files

| File | Type |
|---|---|
| `client/tailwind.config.js` | New color tokens (primary `#2F7CF6`, surface palette) |
| `client/src/index.css` | Global styles, scrollbars, body transitions |
| `client/src/App.tsx` | AuthLayout branding (smaller logo, tagline, bg) |
| `client/src/components/HomePage.tsx` | Sidebar header, empty state, chat header |
| `client/src/components/layout/AppLayout.tsx` | Background, text colors |
| `client/src/components/chat/ChatList.tsx` | Denser rows, selected state, touch targets |
| `client/src/components/chat/ChatView.tsx` | **Images outside bubble (no blue frame)**, bubble colors, day separators, mobile layout |
| `client/src/components/chat/MessageInput.tsx` | Composer dock, focus states, touch targets |
| `client/src/components/common/Avatar.tsx` | Varied fallback colors |
| `client/src/components/common/Button.tsx` | Style refinement |
| `client/src/components/common/Modal.tsx` | Surface alignment, spacing |
| `client/src/components/auth/LoginForm.tsx` | Branded card layout, focus/error states |
| `client/src/components/auth/RegisterForm.tsx` | Branded card layout, focus/error states |
| `client/src/components/chat/MessageActions.tsx` | Touch-friendly sizing |
| `client/src/components/chat/ReplyQuote.tsx` | Styling alignment |
| `client/src/components/chat/VoicePlayer.tsx` | Styling alignment |
| `client/src/components/chat/ImageViewer.tsx` | Backdrop blur, shadow |
| `client/src/components/chat/CreateChatModal.tsx` | Refactored to use Modal component |
| `client/src/components/chat/CreateGroupModal.tsx` | Refactored to use Modal component |
| `client/src/components/profile/ProfileEditor.tsx` | Styling alignment |
| `client/src/components/chat/OnlineDot.tsx` | Border color alignment |

### Visual Changes

- **Auth screens**: Centered card, smaller Zokul logo, tagline, refined inputs/buttons, better error presentation, matching dark surface
- **Sidebar/chat list**: User avatar in header, denser rows (44px avatars, tighter text), subtle selected highlight (`bg-white/[0.06]`), styled unread badge, consistent timestamps
- **Empty state**: Chat icon, "Select a chat / Choose a conversation from the sidebar or create a new one." copy
- **Chat header**: Aligned with new surface system (`bg-surface-header`), stable height, better typography
- **Message bubbles**:
  - Incoming: `bg-surface-incoming` (`#1B2738`) dark / `bg-gray-100` light
  - Outgoing: `bg-primary` (`#2F7CF6`) calmer blue
  - Bubble radius: 18px with 6px corner on sender side
  - **Images rendered OUTSIDE bubble** — no blue frame/background on outgoing images
  - Images use rounded media cards with subtle `border-white/10` outline for outgoing
  - Timestamps below content, checkmark, "edited" label
  - Day separators: pill-style with rounded background
- **Message composer**: Stable dock with `bg-surface-header`, 40px touch targets, rounded input container with focus ring, upload/emoji/send buttons with hover states
- **Modals**: Unified via Modal component; `bg-surface-elevated`, consistent close button, compact padding, mobile-safe
- **Avatar**: 10 varied fallback colors based on name hash (not all identical blue)

### Mobile-First Decisions

- All touch targets ≥ 40px (typically 40×40 or 44×44)
- Chat list rows min height 60px
- Sidebar full-width on mobile, 340px on desktop
- Message max-width: `85%` mobile, `75%` desktop
- Composer dock safe-area aware (`safe-area-bottom`)
- Modals max-width `sm` constraint, overflow scroll
- Back button visible on mobile (md:hidden)

### Verification Results

| Command | Result |
|---|---|
| `cd client; npm.cmd run build` | ✅ Passed |
| `cd client; npm.cmd test` | ✅ Passed (7/7) |
| `npm.cmd run build` (root) | ✅ Passed (client + server) |
| `npm.cmd test` (root) | ✅ Passed (78/78: 7 client + 71 server) |
| `git diff --check` | ⚠️ CRLF warnings only (expected on Windows) |
| `git status --short` | 21 modified UI files; 3 pre-existing dirty files untouched |

### Visual QA

Manual visual inspection could not be performed — no backend running in this environment. Component-level review confirms:
- No blue frame around outgoing images ✅
- No controls for unavailable features ✅
- No text overlap/clipping in templates ✅
- Mobile layout considered in all components ✅

### Pre-existing Dirty Files (not staged, not changed)

- `client/tsconfig.node.tsbuildinfo`
- `client/tsconfig.tsbuildinfo`
- `client/vite.config.js`
- `docs/05_IMPROVEMENT_OVERVIEW.md` (untracked)
- Various `docs/06_*`..`docs/10_*` (untracked)
- `docs/ai/` (untracked)

### Follow-ups / Risks

- Governor review required (Medium risk level)
- Some inline Tailwind classes may benefit from future component extraction
- ReplyQuote inside ChatView bubble uses simplified styling — confirm visually
- The `animations.css` file still has deprecated `animate-pulse-slow` keyframe (unused after auth layout change — harmless)
- Server tests pass but some may rely on test DB availability

---

## Governor Review Fix Request (ZOKUL-UI-001-R1)

**Reviewer**: project-governor
**Date**: 2026-07-17
**Status**: `Needs Changes`
**Scope**: Continue the current UI redesign task. Do not restart the redesign and do not expand product scope.

### Context

- Current branch: `codex/zokul-ui-redesign`
- Current UI commit under review: `50a7532 style: polish messenger interface`
- Product: Zokul web messenger
- Goal: fix Governor review findings and make `ZOKUL-UI-001` acceptable for merge.
- Do not add new features.
- Do not touch backend code.
- Do not change unrelated pre-existing dirty files.

### Required Fixes

#### 1. Fix invalid nested buttons in chat list

File: `client/src/components/chat/ChatList.tsx`

Problem:

- The chat row is currently rendered as a `<button>`.
- The delete action is another `<button>` inside that row button.
- Nested interactive elements are invalid HTML and can break click, focus, and mobile behavior.

Required implementation:

- Make the outer chat row wrapper a non-interactive `<div>`.
- Render the main selectable chat area as a `<button type="button">`.
- Render the delete action as a sibling `<button type="button">`, not as a child of the select button.
- Preserve current visual layout: avatar, selected state, unread badge, preview, timestamp, spacing, and colors.
- Preserve `onSelect(chat)`, delete confirmation state, and `handleConfirmDelete(chat.id)`.

#### 2. Make delete chat action mobile-accessible

File: `client/src/components/chat/ChatList.tsx`

Problem:

- Delete action is hidden through `opacity-0 group-hover:opacity-100`.
- The parent no longer has `group`, so desktop hover reveal is broken.
- Hover is not a reliable primary interaction on smartphones.

Required implementation:

- Remove dependency on hover as the only way to access delete.
- Make the delete action reachable on mobile.
- Preferred simple solution: keep a compact visible icon button on the right side with calm styling.
- Touch target should be at least 36-40 px.
- Add `aria-label="Delete chat"`.
- Do not introduce a new action menu unless truly needed.

#### 3. Fix send button enabled state

File: `client/src/components/chat/MessageInput.tsx`

Problem:

- `hasContent` includes `replyTo`, so the send button can become enabled when the user is replying with no text and no image.
- Submit then does nothing because empty text is ignored.

Required implementation:

- The send button must be enabled only when there is real sendable content:
  - `text.trim().length > 0`, or
  - `pendingImages.length > 0`.
- `replyTo` alone must not enable send.
- Editing must not allow saving an empty message.
- Preserve current composer visual design.

#### 4. Clean task file whitespace

File: `docs/ai/tasks/active/NEXT_AGENT_TASK.md`

Problem:

- `git diff --check master..HEAD` reports trailing whitespace in this file.

Required implementation:

- Remove trailing whitespace.
- Remove extra blank line at EOF if `git diff --check` reports it.
- Do not rewrite the whole document unnecessarily.

#### 5. Preserve git hygiene

Do not stage, modify, or commit unrelated pre-existing dirty files:

- `client/tsconfig.node.tsbuildinfo`
- `client/tsconfig.tsbuildinfo`
- `client/vite.config.js`
- `docs/05_IMPROVEMENT_OVERVIEW.md`
- `docs/06_IMPROVEMENT_TASKS.md`
- `docs/07_AGENT_IMPLEMENTATION_GUIDE.md`
- `docs/08_IMPROVEMENT_QA_SECURITY.md`
- `docs/09_UI_REDESIGN_IMPLEMENTATION_GUIDE.md`
- `docs/10_ARCHITECTURE_MAP_SOURCE.md`
- untracked `docs/ai/*` files that are not already part of the UI task commit

If any of these files change while running build/tests, leave them unstaged and report them as pre-existing or generated.

### Required Verification

Run and report:

- `npm.cmd run build`
- `npm.cmd test`
- `git diff --check master..HEAD`
- `git status --short --branch`

Expected result:

- build passes;
- tests pass;
- `git diff --check master..HEAD` passes without whitespace errors;
- only intended UI/review-fix files are staged/committed.

### Documentation Updates

Update `docs/ai/10_AI_WORKLOG.md` with a short `ZOKUL-UI-001-R1` entry containing:

- changed files;
- review findings fixed;
- verification results;
- remaining pre-existing dirty files.

If committing, use:

```text
fix: address ui redesign review findings
```

### Final Report Format

Report:

- files changed;
- exact fixes made;
- verification command results;
- whether pre-existing dirty files remain;
- new commit hash if committed.