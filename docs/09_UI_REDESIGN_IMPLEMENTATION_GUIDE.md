# Zokul: UI redesign implementation guide

## Purpose

This document is an implementation brief for an AI agent or developer who will redesign the existing Zokul web messenger UI.

The goal is to make the current product feel more polished, modern, and intentional without adding new user-facing features.

## Core rule

Do not add UI for features that do not exist.

Specifically:

- do not add call buttons;
- do not add video buttons;
- do not add pinned chats unless the feature exists;
- do not add unread logic unless it already exists in the current code path;
- do not add message reactions unless implemented;
- do not add admin/group management controls unless implemented;
- do not add settings pages unless implemented.

The redesign must improve only the screens and interactions that already exist.

## Existing product surface

The current UI includes:

- login screen;
- register screen;
- chat list/sidebar;
- selected chat screen;
- empty chat state;
- message bubbles;
- image messages;
- voice messages;
- message input;
- typing indicator;
- online/offline status;
- create direct chat modal;
- create group modal;
- profile editor;
- image viewer;
- message actions;
- light/dark theme support if currently wired through `ThemeContext`.

## Design direction

Use a calm premium messenger style:

- professional, compact, and readable;
- dark mode first, but do not break light mode;
- modern without looking like a landing page;
- no decorative gimmicks;
- no oversized hero sections inside the app;
- no fake future controls.

The interface should feel closer to a finished messenger product, not a technical MVP.

## Visual principles

### 1. Density with breathing room

The app should fit many chats and messages comfortably, but not feel cramped.

Guidelines:

- chat rows should be compact and scannable;
- message bubbles should have stable max widths;
- sidebar width should remain practical on desktop;
- mobile should prioritize touch targets and readability.

### 2. Stronger hierarchy

Important information must be easier to scan:

- chat name;
- last message;
- timestamp;
- selected chat;
- sender/receiver distinction;
- online/offline status;
- input action state.

### 3. Softer brand identity

Avoid the current "everything is bright blue" feeling.

Use blue as the primary action/message accent, but support it with a richer dark surface system and calmer avatar colors.

### 4. Honest interface

Every visible control must correspond to a working feature.

If a button does not do anything meaningful today, do not add it.

## Suggested color system

Implement as Tailwind classes, CSS variables, or existing project conventions. Prefer reusing the current theme structure if one exists.

Dark theme:

| Role | Color |
|---|---|
| App background | `#0B111C` |
| Sidebar background | `#0E1726` |
| Header/input panels | `#111C2D` |
| Elevated surface | `#162235` |
| Incoming bubble | `#1B2738` |
| Outgoing bubble | `#2F7CF6` |
| Outgoing bubble hover/active | `#2563EB` |
| Primary text | `#F8FAFC` |
| Secondary text | `#94A3B8` |
| Muted text | `#64748B` |
| Border | `rgba(148, 163, 184, 0.16)` |
| Online | `#22C55E` |
| Danger | `#EF4444` |

Light theme:

| Role | Color |
|---|---|
| App background | `#F6F8FB` |
| Sidebar background | `#FFFFFF` |
| Header/input panels | `#FFFFFF` |
| Elevated surface | `#F1F5F9` |
| Incoming bubble | `#E8EEF6` |
| Outgoing bubble | `#2F7CF6` |
| Primary text | `#0F172A` |
| Secondary text | `#475569` |
| Border | `rgba(15, 23, 42, 0.10)` |

## Typography

Keep the current font stack unless the project already supports custom fonts.

Improve typography through:

- clearer font sizes;
- consistent weights;
- better line heights;
- no negative letter spacing;
- no viewport-based font scaling.

Recommended scale:

| Usage | Size | Weight |
|---|---:|---:|
| App/user title | 15-16px | 600 |
| Chat row title | 14-15px | 600 |
| Chat preview | 13px | 400 |
| Message text | 14-15px | 400 |
| Timestamp | 11-12px | 400 |
| Button/input | 14-15px | 500 |

## Component-level implementation plan

### 1. Auth screens

Files to inspect:

- `client/src/components/auth/LoginForm.tsx`
- `client/src/components/auth/RegisterForm.tsx`
- `client/src/App.tsx`
- `client/src/index.css`

Required changes:

- make login/register feel branded but not like a marketing page;
- keep the form centered, but reduce the feeling of empty dead space;
- add a restrained auth panel or layout container;
- keep fields and actions clear;
- improve focus states;
- improve error presentation if current errors are visible.

Do not:

- add marketing sections;
- add fake social login;
- add illustrations that slow down implementation.

Acceptance:

- login/register look intentional on desktop and mobile;
- form fields are readable;
- focus state is visible;
- no text overlaps.

### 2. Sidebar and chat list

Files to inspect:

- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatList.tsx`
- `client/src/components/common/Avatar.tsx`
- `client/src/components/chat/OnlineDot.tsx`

Required changes:

- improve sidebar header spacing and visual hierarchy;
- make current user area cleaner;
- keep existing buttons only: create group, create chat, logout/profile;
- redesign chat rows for better scanning;
- selected chat should have a clear but subtle highlight;
- timestamps should align consistently;
- previews should truncate cleanly;
- avatars should look less repetitive than identical bright blue circles when no image exists.

Optional if simple:

- add a visual search input only if search already exists. If there is no working search, do not add it.

Do not:

- add pinned chats;
- add archive;
- add folders;
- add filters;
- add inactive controls.

Acceptance:

- chat list is denser and easier to scan;
- selected chat is obvious;
- long names/previews do not break layout;
- desktop sidebar remains usable around 320-400px width.

### 3. Empty chat state

Files to inspect:

- `client/src/components/HomePage.tsx`

Required changes:

- replace the plain "Select a chat" empty state with a more polished, quiet empty state;
- keep the message practical;
- optionally include a simple icon created with CSS/lucide/manual existing icons if the project already uses them.

Do not:

- add a large hero layout;
- add marketing copy.

Suggested copy:

```text
Select a chat
Choose a conversation from the sidebar or create a new one.
```

Acceptance:

- empty state looks intentional on wide screens;
- does not dominate the app.

### 4. Chat header

Files to inspect:

- `client/src/components/HomePage.tsx`
- `client/src/components/common/Avatar.tsx`
- `client/src/components/chat/OnlineDot.tsx`

Required changes:

- improve avatar/name/status alignment;
- make header height stable;
- keep only working controls;
- if no header actions exist today, do not add call/video/search icons.

Acceptance:

- name/status are readable;
- header looks connected to the message area;
- mobile back button remains clear.

### 5. Message area and bubbles

Files to inspect:

- `client/src/components/chat/ChatView.tsx`
- `client/src/components/chat/ReplyQuote.tsx`
- `client/src/components/chat/MessageActions.tsx`
- `client/src/components/chat/VoicePlayer.tsx`
- `client/src/components/chat/ImageViewer.tsx`

Required changes:

- improve bubble spacing, radius, max width, and color;
- integrate timestamp/checkmark more cleanly;
- make date separators more refined;
- keep outgoing messages blue, but use a calmer blue;
- incoming messages should use elevated slate surfaces;
- ensure message groups do not feel randomly spaced.

Important image rule:

- remove the thick blue border/background around forwarded/uploaded image messages;
- image messages should look like rounded media cards;
- outgoing image messages may have a subtle 1px outline or small blue accent, but not a fat frame;
- image corner radius should align with bubble radius;
- timestamps should not overlap the image.

Do not:

- add reactions;
- add read receipts if not already implemented;
- add forward buttons if not already implemented.

Acceptance:

- text messages look polished;
- image messages do not have a heavy frame;
- long messages wrap correctly;
- small messages do not look like oversized pills;
- message actions still work.

### 6. Message input

Files to inspect:

- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/chat/VoiceRecorder.tsx`

Required changes:

- make bottom composer feel like one polished dock;
- keep existing actions: attach/image, emoji if implemented, voice if implemented, send;
- send button should have a clear enabled/disabled visual state;
- input should have visible focus;
- placeholder can become contextual if current component has chat name available, otherwise keep generic.

Do not:

- add buttons for features that do not exist;
- add fake emoji picker if it is not implemented.

Acceptance:

- composer is stable in height;
- no overlap on mobile;
- icons are aligned;
- keyboard focus is visible.

### 7. Modals

Files to inspect:

- `client/src/components/common/Modal.tsx`
- `client/src/components/chat/CreateChatModal.tsx`
- `client/src/components/chat/CreateGroupModal.tsx`
- `client/src/components/profile/ProfileEditor.tsx`

Required changes:

- align modal styling with new surface system;
- improve fields, buttons, and spacing;
- keep modal content compact;
- ensure mobile modals fit viewport.

Acceptance:

- modals feel like part of the same design system;
- no overflow or clipped actions.

## Implementation constraints

- Prefer existing Tailwind setup and current component structure.
- Keep edits scoped to UI files unless a small shared style token change is needed.
- Do not change API contracts.
- Do not change message data structures.
- Do not change authentication logic.
- Do not change Socket.IO behavior.
- Do not add new dependencies unless absolutely necessary.
- If icons are already manual SVGs, it is acceptable to keep them and restyle them.
- If adding an icon library would be useful, ask first.

## Files likely to change

Primary:

- `client/src/index.css`
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
- `client/tailwind.config.js`

## Visual QA checklist

Check desktop:

- login screen;
- register screen;
- chat list with no selected chat;
- selected direct chat;
- selected group chat if available;
- text messages;
- image messages;
- voice messages;
- modals;
- profile editor.

Check mobile/narrow width:

- sidebar screen;
- open chat screen;
- back navigation;
- composer;
- image message;
- modal.

Required viewport checks:

- desktop around `1920x1080`;
- laptop around `1366x768`;
- mobile around `390x844`;
- narrow desktop/window similar to the provided screenshot.

## Functional QA checklist

The redesign must not break current behavior:

- login works;
- register works;
- logout works;
- chat selection works;
- create direct chat works;
- create group works;
- send text message works;
- upload/send image works;
- send multiple images works if currently supported;
- voice message works if currently supported;
- edit/delete message actions work;
- profile editor works;
- image viewer opens and closes;
- draft behavior still works;
- typing behavior still works.

## Commands for agent

Before changes:

```powershell
git status --short --branch
npm.cmd run build
npm.cmd test
```

During client-only work:

```powershell
cd client
npm.cmd run build
npm.cmd test
cd ..
```

Before final:

```powershell
npm.cmd run build
npm.cmd test
git diff --check
git status --short
```

If the environment cannot run the live app because backend services are missing, still run build and tests. State clearly what was not manually verified.

## Browser verification

If possible, run the app locally and inspect visually:

```powershell
npm.cmd run dev
```

Use real or seeded data when available. If no backend data is available, rely on component-level inspection and build/test checks.

The agent should take screenshots if the environment supports it and verify:

- no overlapping text;
- no clipped buttons;
- no layout shift from hover/focus;
- image cards are not surrounded by thick outgoing blue frames;
- mobile composer remains visible and usable.

## Acceptance criteria

- [ ] No UI controls for unavailable features were added.
- [ ] Existing functionality still works.
- [ ] Login/register screens are visually improved.
- [ ] Sidebar/chat list is more polished and scannable.
- [ ] Empty state is improved.
- [ ] Chat header is cleaner.
- [ ] Message bubbles are refined.
- [ ] Image messages no longer have a thick blue frame.
- [ ] Message input is redesigned as a stable composer dock.
- [ ] Modals match the new visual system.
- [ ] Desktop and mobile layouts are checked.
- [ ] `npm.cmd run build` passes.
- [ ] `npm.cmd test` passes, or any pre-existing failure is documented separately.
- [ ] Final response includes changed files and verification results.

## Commit guidance

Recommended branch:

```text
codex/zokul-ui-redesign
```

Recommended commit message:

```text
style: polish messenger interface
```

Before commit:

```powershell
git diff --stat
git diff --check
git status --short
```

Stage only intentional UI redesign files.

Do not mix unrelated generated files or previous build artifacts into the commit.
