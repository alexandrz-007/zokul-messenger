# AI Control Plane

Last updated: 2026-07-17
Source commit: fd5b6eb

## Current State

State: Cleanup

Allowed next states:

- Commit
- Release Check
- Deploy Approval

## Active Work

- Active task: Public repository cleanup
- Task ID: ZOKUL-DOC-002
- Branch: master
- Owner role: Governor / Documentation
- Risk: Low
- Confidence: High

## Latest Accepted Work

- ZOKUL-VOICE-002: Voice recording behavior fixes accepted and packaged.
- ZOKUL-UI-001: Sidebar visual polish accepted.
- ZOKUL-UI-002: Sidebar composition & states polish accepted.
- ZOKUL-UI-003: Create menu & theme toggle accepted.
- ZOKUL-UI-004: Soft light theme polish accepted.
- ZOKUL-UI-005: Light theme balance fix accepted.
- ZOKUL-UI-006: Participant avatar viewer accepted.

## Latest Review

- ZOKUL-UI-006: Accepted after Governor review. Build and 95/95 tests pass.
- Changes:
  - **Chat header avatar** (HomePage.tsx): In 1:1 chats where `otherUser.avatarUrl` exists, the header avatar is wrapped in a `<button>` with `aria-label`. Click opens the existing `ImageViewer` modal. Group header and fallback-initials avatars remain non-clickable.
  - **Message list avatar** (ChatView.tsx): Incoming message avatars with a real `avatarUrl` are wrapped in a clickable `<button>` with `aria-label`. Own avatars (already hidden in message list) are untouched. Fallback-initials avatars remain non-clickable.
  - **ImageViewer**: Reused as-is. Avatar and message-image viewers are independent (separate state variables).
- No backend, API, socket, dependencies, or layout changes.
- Changes (color-only rebalance of ZOKUL-UI-004 values):
  - **App shell**: `#F3F6FA` -> `#EAF1F8` - deeper, warmer base bg.
  - **Sidebar**: `#E7EDF5` -> `#E8EFF7`, borders `#CBD6E2` -> `#C9D6E4` - closer to chat area.
  - **Chat section**: `#F5F8FB` -> `#EAF1F8` - no longer white/blank.
  - **Chat header**: `#F5F8FB` -> `#E6EEF7` (denser than main bg), border `#D5DEE9` -> `#C9D6E4`.
  - **Composer bar**: `#E8EEF6` -> `#E1EAF4` (denser), form border `#D5DEE9` -> `#C9D6E4`.
  - **Selected row**: `#DCE8F7` -> `#D7E6F6`, hover row `#E7EDF5` -> `#DFEAF5`.
  - **Incoming bubble**: `#E6EDF5` -> `#DDE8F3` (denser against chat bg).
  - **All button hovers** (create, theme, logout): `#DCE8F7` -> `#D7E6F6`.
  - **All menu/popover hovers**: `#E7EDF5` -> `#DFEAF5`.
  - **Empty state icons**: `#E7EDF5` -> `#DFEAF5`.
  - **Reply quote, recorder surfaces**: `#E8EEF6` -> `#E1EAF4`.
  - **Delete button hover, track bars**: `#CBD6E2` -> `#C9D6E4`.
  - **Popover elevated surfaces** (create menu, actions, emoji picker, delete confirm): kept `bg-[#F8FAFD]` as lighter-than-base surfaces.
- Dark theme untouched. No features, dependencies, or layout changes.

## Project Health

- Build: passed after cleanup
- Tests: passed after cleanup, 95/95
- Docker production build: passed from `C:\zokul-deploy`
- Release package: passed, `C:\zokul-deploy` rebuilt from cleaned `master`
- Docs freshness: protocol documentation is being consolidated into one `docs/` tree
- Known blockers:
  - Safari/iPhone recorder MIME & gesture behavior unverified on device (unchanged)
  - Production runtime start still requires `.env` and SSL files in `C:\zokul-deploy\ssl`

## Next Action

Wait for user review. Do not commit or push until the user approves the final cleaned structure.
