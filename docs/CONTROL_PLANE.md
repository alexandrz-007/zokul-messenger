# AI Control Plane

Last updated: 2026-07-17
Source commit: d61adcf

## Current State

State: Ready for Execution

Allowed next states:

- Ready for Execution
- In Execution
- Review
- Commit Approval

## Active Work

- Active task: Fix chat opening, initial position, and delete placement
- Task ID: ZOKUL-CHAT-UX-001
- Branch: master
- Owner role: Governor / external Executor
- Execution owner: external agent
- Risk: High
- Confidence: High

## Latest Accepted Work

- ZOKUL-VOICE-002: Voice recording behavior fixes accepted and packaged.
- ZOKUL-UI-001: Sidebar visual polish accepted.
- ZOKUL-UI-002: Sidebar composition & states polish accepted.
- ZOKUL-UI-003: Create menu & theme toggle accepted.
- ZOKUL-UI-004: Soft light theme polish accepted.
- ZOKUL-UI-005: Light theme balance fix accepted.
- ZOKUL-UI-006: Participant avatar viewer accepted.

## Incident Finding

- Public production is serving an older client bundle (`index-DWolPdvT.js`) despite `origin/production` containing the later mobile source.
- The served bundle has legacy `Slide to cancel`, `Release to cancel`, and `min-h-screen` markers, and lacks `Tap mic to send`, `startupToken`, and safe-area-bottom markers.
- Therefore prior production mobile QA is invalid: the VPS client image must be rebuilt/recreated and verified before assigning further mobile code work.
- Push subscriptions are not restored after the database is cleared because the client returns early when the browser already has a Push API subscription.
- Push notifications are currently observed as working again; the recovery defect remains a planned hardening item, not a confirmed live outage.
- Chat rows nest deletion inside the open-chat button, and initial message scroll does not reliably reach the newest messages.

## Latest Review

- ZOKUL-MOBILE-001: Governor review passed for user device QA.
- Verification:
  - `npm.cmd run build`: passed.
  - `npm.cmd test`: passed, 91/91.
  - `git diff --check`: passed with Windows CRLF warnings only.
- Review result:
  - Startup cancel race is fixed with `startupTokenRef`.
  - `min-h-screen` was removed from `AppLayout`.
  - `client/src/index.css` scope exception was documented and approved.
  - No backend, socket, upload, dependency, Docker, or deploy changes were made.
- Remaining gate: real iPhone/Android QA by user before acceptance/commit/release.

- ZOKUL-MOBILE-001: Fixes applied after Governor review. Awaiting re-review.
- Findings addressed:
  - P1: startup token ref added to prevent cancel race during microphone async startup.
  - P1/P2: `min-h-screen` removed; only `h-[100dvh] max-h-screen` used.
  - P2: `client/src/index.css` added to Allowed Files + CHANGE_REQUESTS.md entry.
  - P2: protocol docs aligned (branch, owner, state).
- Remaining: real-device QA required before acceptance.

- ZOKUL-VOICE-003: User/device QA failed. Superseded by ZOKUL-MOBILE-001.
- Findings:
  - Mobile mic tap can still behave as hold-to-record or immediately stop after first tap on iPhone/Android.
  - iPhone headers and composer need safe-area/top-bottom correction.
  - Android light mobile layout clips outgoing voice bubbles and composer controls.
  - Main-screen bottom action buttons can be hidden below the visible mobile browser area.

- ZOKUL-VOICE-003 previous implementation notes:
  - Changes:
    - **Mobile voice recording**: touch/mobile mic button is now tap-to-start and tap-to-stop/send.
  - **Cancel**: existing cancel button remains available while recording.
  - **Main menu buttons**: create/theme/logout bottom action bar now includes mobile safe-area bottom padding.
  - **Viewport**: app shell uses dynamic viewport height (`100dvh`) with `min-h-screen` fallback.
- No backend, API, socket, upload, dependency, Docker, or auth changes.

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

Executor must implement `ZOKUL-CHAT-UX-001`. `ZOKUL-PUSH-001` remains planned hardening after this user-visible UX task is accepted.
