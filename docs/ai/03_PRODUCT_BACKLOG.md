# Product Backlog

Last reviewed: 2026-07-17
Source commit: 96d5818

## P1: Messaging Features

- [ ] ZOKUL-VOICE-001 Implement working voice messages
  - Status: Ready for Executor
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

## P1: UI Polish

- [x] ZOKUL-UI-001 Messenger visual redesign
  - Status: Reverted after user review
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
