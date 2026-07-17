# Product Backlog

Last reviewed: 2026-07-17
Source commit: 96d5818

## P1: Messaging Features

- [x] ZOKUL-VOICE-001 Implement working voice messages
  - Status: Implemented
- [x] ZOKUL-VOICE-002 Telegram-like voice recording UX
  - Status: Implemented
  - Priority: P1
  - Owner: Governor/Executor
  - Files:
    - `client/src/components/HomePage.tsx`
    - `client/src/components/chat/MessageInput.tsx`
    - `client/src/components/chat/VoiceRecorder.tsx`
    - `client/src/components/chat/VoicePlayer.tsx`
    - `client/src/hooks/useChat.ts`
    - `server/src/middleware/uploadMiddleware.ts`
  - Goal: Complete the existing unfinished voice-message path without redesigning the messenger.
  - Scope: recorder button, recording/upload/send flow, playback hardening, tests.
  - Out of scope: calls, transcription, waveform generation, storage migration.
  - Acceptance criteria:
    - voice recording starts only after explicit user action;
    - voice message uploads and sends through existing socket flow;
    - received voice messages render with playable `VoicePlayer`;
    - unsupported browsers fail gracefully;
    - build/tests pass.

- [ ] ZOKUL-VOICE-003 Mobile tap-to-record voice UX
  - Status: Implemented - ready for review
  - Priority: P1
  - Owner: Governor/Executor
  - Files:
    - `client/src/components/chat/MessageInput.tsx`
    - `client/src/components/HomePage.tsx`
    - `client/src/components/layout/AppLayout.tsx`
  - Goal: On smartphones, start voice recording with one mic tap and stop/send with the next tap; lift main-menu controls above mobile browser safe areas.
  - Scope: mobile/touch voice interaction and bottom safe-area polish only.
  - Out of scope: backend, upload protocol, sockets, calls, video circles, broad redesign.
  - Acceptance criteria:
    - first mobile mic tap starts recording;
    - second mobile mic tap stops/sends when duration is valid;
    - cancel still discards;
    - desktop voice recorder behavior remains unchanged;
    - main-menu bottom controls remain visible on mobile;
    - build/tests pass.

## P1: UI Polish

- [x] ZOKUL-UI-LEGACY-001 Messenger visual redesign
  - Status: Reverted after user review; legacy attempt, not part of the new staged UI refresh numbering
  - Priority: P1
  - Owner: Governor/Executor
  - Files:
    - `client/src/components/HomePage.tsx`
    - `client/src/components/chat/ChatList.tsx`
    - `client/src/components/chat/ChatView.tsx`
    - `client/src/components/chat/MessageInput.tsx`
    - `client/src/components/auth/LoginForm.tsx`
    - `client/src/components/auth/RegisterForm.tsx`
  - Goal: Make current UI feel polished without adding unavailable features.
  - Scope: login/register, sidebar, empty state, chat header, bubbles, image messages, composer, modals.
  - Out of scope: calls, video, reactions, pinned chats, fake search or other unavailable features.
  - Acceptance criteria:
    - image messages no longer have a thick outgoing blue frame;
    - no controls for unavailable features;
    - desktop and mobile layouts checked;
    - build/tests pass.
  - Source: `docs/09_UI_REDESIGN_IMPLEMENTATION_GUIDE.md`

- [ ] ZOKUL-UI-001 Sidebar visual polish
  - Status: Accepted
  - Priority: P1
  - Owner: Governor/Executor
  - Files:
    - `client/src/components/HomePage.tsx`
    - `client/src/components/chat/ChatList.tsx`
    - `client/src/components/common/Avatar.tsx`
  - Goal: Redesign only the left sidebar/chat list toward the approved concept without adding unavailable features.
  - Scope: profile block, brand placement, chat rows, varied avatar colors, bottom create/theme/logout actions, desktop/mobile sidebar behavior.
  - Out of scope: chat search, calls/video, chat header, message bubbles, composer, backend.
  - Acceptance criteria:
    - sidebar looks closer to concept;
    - no chat search is added;
    - bottom actions are create chat, theme toggle, logout;
    - profile editor still opens from profile/name;
    - mobile sidebar behavior remains usable;
    - build/tests pass.

- [ ] ZOKUL-UI-002 Sidebar composition and states polish
  - Status: Accepted
  - Priority: P1
  - Owner: Governor/Executor
  - Files:
    - `client/src/components/HomePage.tsx`
    - `client/src/components/chat/ChatList.tsx`
    - `client/src/components/common/Avatar.tsx`
  - Goal: Fix sidebar composition after visual review so the profile/header, chat list, and bottom actions feel like distinct zones.
  - Scope: account header, `Zokul` placement, dividers, chat row density, selected state, sidebar loading/empty/error states, bottom action bar polish, mobile sidebar ergonomics.
  - Out of scope: search, settings, calls/video, chat header, messages, composer, backend.
  - Acceptance criteria:
    - profile/header no longer looks like a chat row;
    - `Zokul` is placed to the right of the user identity in the account/header area;
    - sidebar zones have clear boundaries;
    - chat rows are more compact and aligned;
    - no out-of-scope controls are added;
    - build/tests pass.

- [ ] ZOKUL-UI-003 Sidebar create menu and theme toggle
  - Status: Accepted
  - Priority: P1
  - Owner: Governor/Executor
  - Files:
    - `client/src/components/HomePage.tsx`
    - `client/src/contexts/ThemeContext.tsx`
  - Goal: Restore group chat creation through a compact create menu and make the theme button visibly useful.
  - Scope: one create button menu with personal/group chat choices, theme toggle verification/light sidebar polish, desktop/mobile menu usability.
  - Out of scope: avatar viewer, search, settings, calls/video, chat header, messages, composer, backend.
  - Acceptance criteria:
    - group creation is reachable again;
    - personal and group chat creation are both available from one create menu;
    - bottom bar still has exactly three buttons;
    - theme toggle visibly changes theme;
    - sidebar looks acceptable in light and dark modes;
    - build/tests pass.

- [ ] ZOKUL-UI-004 Soft light theme polish
  - Status: Accepted
  - Priority: P1
  - Owner: Governor/Executor
  - Files:
    - `client/src/components/layout/AppLayout.tsx`
    - `client/src/components/HomePage.tsx`
    - `client/src/components/chat/ChatList.tsx`
    - `client/src/components/chat/ChatView.tsx`
    - `client/src/components/chat/MessageInput.tsx`
  - Goal: Replace harsh bright light theme surfaces with a calm blue-gray messenger palette.
  - Scope: color-only polish for light theme surfaces, borders, chat rows, bubbles, composer, and popovers.
  - Out of scope: dark redesign, avatar viewer, search, settings, calls/video, read receipts, backend.
  - Acceptance criteria:
    - light theme is not pure white/harsh;
    - dark theme is not regressed;
    - no new controls or features are added;
    - build/tests pass.

- [ ] ZOKUL-UI-005 Light theme balance fix
  - Status: Accepted
  - Priority: P1
  - Owner: Governor/Executor
  - Goal: Rebalance light theme after visual QA so the sidebar is not a gray block and the chat area is not a white blank field.
  - Scope: color-only correction for existing light theme surfaces, including sidebar, chat background, header, composer, incoming bubble, and relevant popovers.
  - Out of scope: avatar viewer, new controls, backend, dark redesign, layout restructuring.
  - Acceptance criteria:
    - right chat area no longer looks plain white;
    - left and right zones feel cohesive;
    - header/composer have intentional contrast;
    - dark theme not regressed;
    - build/tests pass.

- [ ] ZOKUL-UI-006 Participant avatar viewer
  - Status: Accepted
  - Priority: P2
  - Owner: Governor/Executor
  - Goal: Allow a user to view another participant's avatar image from existing chat UI.
  - Scope idea:
    - click/tap participant avatar in chat header or message area;
    - open an image viewer/modal for the participant avatar when an avatar URL exists;
    - keep fallback initials non-clickable or show a simple profile/avatar placeholder only if already supported.
  - Out of scope:
    - profile pages;
    - social features;
    - editing another user's avatar;
    - backend schema changes unless code discovery proves avatar URL is not available on the client.
  - Notes:
    - This is intentionally separate from light theme balance to avoid mixed UI/functionality scope.
    - Reuse existing `ImageViewer`; do not add backend/profile/social scope.

## P2: Product Experience

- [ ] ZOKUL-PROD-001 Improve empty states and onboarding copy
  - Status: Todo
  - Priority: P2
  - Goal: Make first-run and no-chat states clearer.
  - Acceptance criteria:
    - no marketing-style landing page inside app;
    - empty states provide clear next action.

- [ ] ZOKUL-PROD-002 Improve chat list scanability
  - Status: Todo
  - Priority: P2
  - Goal: Make timestamps, previews, selected state, and avatars easier to scan.
  - Out of scope: new unread logic unless already supported.

- [ ] ZOKUL-PROD-003 View participant avatar
  - Status: Idea captured - not part of current sidebar task
  - Priority: P2
  - Goal: Allow opening another participant's avatar/profile image from the chat UI.
  - Scope idea: click avatar in chat header or participant surface to open existing/new image viewer.
  - Out of scope for now: profile pages, social features, backend schema changes.

## P2: Administration

- [ ] ZOKUL-ADMIN-ROADMAP Admin panel initiative
  - Status: Idea captured - needs Governor discovery before implementation
  - Priority: P2
  - Owner: Governor
  - Goal: Add a secure graphical admin interface for operating the Zokul resource.
  - Recommended approach: built-in `/admin` React area with backend `/api/admin/*` namespace.
  - Proposed phases:
    - `ZOKUL-ADMIN-001`: admin role, backend `adminOnly` guard, admin audit log.
    - `ZOKUL-ADMIN-002`: admin stats and users API.
    - `ZOKUL-ADMIN-003`: admin UI shell, dashboard, users page, audit log page.
    - `ZOKUL-ADMIN-004`: user ban/unban management.
    - `ZOKUL-ADMIN-005`: uploads/media administration.
    - `ZOKUL-ADMIN-006`: moderation and reports.
    - `ZOKUL-ADMIN-007`: settings and feature flags.
  - Scope guard: do not implement as one large task; create one active executor handoff per phase.
  - Security notes:
    - enforce admin access on the backend, not only in UI;
    - log every admin action;
    - avoid destructive actions without confirmation and audit trail.
