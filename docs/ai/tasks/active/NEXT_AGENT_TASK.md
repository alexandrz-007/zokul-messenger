# NEXT_AGENT_TASK: Telegram-like voice recording UX

Task ID: ZOKUL-VOICE-002
Status: Ready for Executor
Created by: Governor
Assigned role: Executor
Recommended branch: codex/zokul-ui-redesign
Change type: feature
Risk level: Medium
Confidence: Medium

## Executive Summary

Improve the voice-message composer UX after the basic voice-message feature is accepted. The target interaction is Telegram-like on mobile: press and hold to record, release to send, slide left to cancel. Desktop should keep a reliable click-based fallback (tap mic, explicit stop/send).

Do not implement video circles, transcription, waveform, calls, or redesign.

## Must Do

- Keep current working voice-message pipeline intact.
- Add mobile/touch hold-to-record behavior:
  - pointer down starts recording;
  - release sends recording;
  - slide left cancels recording;
  - very short recordings (< 1 sec) are discarded with clear feedback.
- Keep desktop accessible behavior:
  - click starts recording;
  - explicit stop/send button sends;
  - explicit cancel button cancels.
- Use Pointer Events where practical.
- Add visual recording state: duration, cancel hint for slide-left, release-to-send hint.
- Ensure microphone permission is requested only after explicit user action.
- Preserve text/image message behavior.
- Add tests for gesture state helpers.

## Must Not Do

- Do not add video messages, video notes, calls, transcription, reactions, or waveform rendering.
- Do not redesign the whole composer or messenger.
- Do not change database schema.
- Do not change server upload/storage.
- Do not remove the fallback click-based recorder flow.

## Context

User preference: voice messages should feel closer to Telegram, especially on smartphones.

Phased UX for this task:
1. Mobile: hold to record, release to send, slide left to cancel.
2. Desktop: click to start, explicit stop/send to finish.
3. Slide-up to lock recording is deferred.

## Required Reading

- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/chat/VoiceRecorder.tsx`
- `client/src/utils/voice.ts`
- `docs/ai/gates/frontend-ui.md`

## Scope

Included:
- client-side voice recorder gesture UX;
- mobile/touch handling;
- desktop fallback handling;
- tests for gesture thresholds/helper logic;
- docs/worklog updates.

Out of scope:
- backend schema/API changes;
- video messages/circles;
- broad UI redesign;
- deployment changes.

## Allowed Files

- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/chat/VoiceRecorder.tsx`
- `client/src/utils/voice.ts`
- `client/__tests__/*`
- `docs/ai/10_AI_WORKLOG.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`
- `docs/ai/tasks/active/NEXT_AGENT_TASK.md`

## Forbidden Files

- `.env`
- `node_modules/`
- `dist/`
- `client/tsconfig*.tsbuildinfo`
- server files unless a Governor-approved change request exists
- Docker/deployment files

## Implementation Instructions

1. Model recorder interaction as explicit states: `idle`, `pressing`, `recording`, `uploading`, `error`.
2. Replace current inline VoiceRecorder (which auto-starts on mount) with a gesture-based approach:
   - Mobile: render a mic button that supports Pointer Events.
     - `onPointerDown`: call `navigator.mediaDevices.getUserMedia` and start MediaRecorder.
     - `onPointerMove`: track horizontal delta; if moved left beyond 80px threshold, mark as cancelled.
     - `onPointerUp`: if cancelled → stop tracks and discard; if not cancelled → stop recorder, upload, send.
     - `onPointerCancel`: cancel safely (stop tracks, discard).
   - Desktop: if Pointer Events not available or no touch support, fall back to click → explicit stop/send.
3. Use thresholds:
   - cancel when horizontal movement left exceeds 80px;
   - discard recordings shorter than 1.0 sec;
4. Prevent page scrolling/selection during active recording by calling `e.preventDefault()` on touch events and setting `touch-action: none` on the button.
5. Always stop microphone tracks on send, cancel, pointer cancel, unmount, and error.
6. After upload succeeds, call `onSendVoice(url, duration)` and close recorder.
7. Add visual feedback: when recording, show a compact bar with elapsed time, cancel hint text ("slide left to cancel"), and release hint.
8. Keep keyboard-accessible fallback: if no touch support, show the old click-based VoiceRecorder.
9. Add helper functions in `client/src/utils/voice.ts` for gesture decisions and unit-test them.

## Tests To Add Or Update

- Unit tests for gesture helper thresholds:
  - release without cancel -> should send;
  - slide left beyond 80px threshold -> should cancel;
  - recording below minimum duration (1s) -> should discard;
- Existing voice MIME tests from ZOKUL-VOICE-001 must still pass.

## Verification Commands

```powershell
npm.cmd run build
npm.cmd test
git diff --check
git status --short --branch
```

Manual QA:
- Desktop Chrome/Edge: click flow works.
- Mobile Safari/iPhone: hold to record, release to send.
- Mobile Safari/iPhone: slide left cancels.
- Android Chrome if available: hold/release/cancel.
- Text and image sending still work.

## Acceptance Criteria

- [ ] Mobile hold-to-record works.
- [ ] Release sends recording.
- [ ] Slide left cancels and sends nothing.
- [ ] Very short recordings (< 1 sec) are discarded safely.
- [ ] Desktop fallback remains usable (click → explicit stop/send).
- [ ] No microphone request before explicit user action.
- [ ] Text/image messaging is not regressed.
- [ ] Build and tests pass.
- [ ] Worklog and task execution result are updated.

## Definition Of Done

- Follow `docs/ai/12_DEFINITION_OF_DONE.md`.
- Apply `docs/ai/gates/frontend-ui.md`.
- Governor review required before merge.

## Change Request Rule

If implementation requires backend changes, new dependencies, schema changes, or video-message support, stop and add `docs/ai/CHANGE_REQUESTS.md`.

## Execution Result

Status: Implemented — ready for Governor review.

Changed files:
- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/chat/VoiceRecorder.tsx`
- `client/src/utils/voice.ts`
- `client/__tests__/voice.test.ts`
- `docs/ai/10_AI_WORKLOG.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`
- `docs/ai/tasks/active/NEXT_AGENT_TASK.md`
- `docs/ai/CONTROL_PLANE.md`

Voice flow implemented:
1. **Touch (mobile)**: Hold mic button → pointerdown starts recording, inline bar with timer + "Slide to cancel" hint appears → slide left >80px triggers visual cancel indicator (bar turns red, text becomes "Release to cancel") → release sends (if not cancelled, duration >= 1s) or discards.
2. **Desktop (no touch)**: Click mic → mounts VoiceRecorder → auto-starts recording → explicit stop/send or cancel buttons.
3. Short recordings (< 1s) are silently discarded.
4. Mic permission requested only after explicit pointer-down / click.

Build/test results:
- `npm.cmd run build`: passed
- `npm.cmd test`: passed, 95/95 (23 client + 72 server)
- `git diff --check`: CRLF warnings only

Manual browser/device QA status: Not performed. Recommended before merge.

Commit: committed as `feat: add hold-to-record voice UX`

Known risks/TODOs:
- Safari/iPhone behavior unverified.
- Slide-up-to-lock recording deferred.
