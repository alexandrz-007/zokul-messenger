# NEXT_AGENT_TASK: Implement working voice messages

Task ID: ZOKUL-VOICE-001
Status: Ready for Executor
Created by: Governor
Assigned role: Executor
Recommended branch: codex/voice-messages
Change type: feature
Risk level: Medium
Confidence: Medium

## Executive Summary

Zokul already contains partial voice-message code, but the feature is hidden/incomplete. The server data model, Socket.IO message flow, upload endpoint, and `VoicePlayer` mostly exist. The missing and risky parts are in the client recorder integration and browser compatibility, especially Safari/iPhone.

Implement voice messages as an existing unfinished feature, not as a redesign. The goal is to let a user record a short audio message, upload it, send it through the existing `message:send` socket flow, render it in chat, and play it back reliably on desktop and mobile browsers.

## Must Do

- Re-enable voice message UI in the existing composer.
- Wire `sendVoice` from `HomePage` into `MessageInput`.
- Integrate `VoiceRecorder` into `MessageInput` with clear start, cancel, stop/send, uploading, and error states.
- Fix `VoiceRecorder` MIME selection for Chrome/Android/Safari/iPhone instead of assuming `audio/webm`.
- Keep uploads on the existing `/api/upload` endpoint unless a real blocker is found.
- Preserve existing text/image message behavior.
- Add or update tests around MIME support and voice message send flow where practical.
- Update `docs/ai/10_AI_WORKLOG.md` with execution results.

## Must Not Do

- Do not redesign the messenger UI.
- Do not add calls, video calls, transcription, waveform generation, reactions, or other new voice-related features.
- Do not change database schema unless current columns are proven insufficient.
- Do not weaken upload security by accepting arbitrary MIME types or extension-only validation.
- Do not touch deployment secrets or `.env` values.

## Current Diagnosis

Code already present:

- `client/src/components/chat/VoiceRecorder.tsx`
- `client/src/components/chat/VoicePlayer.tsx`
- `client/src/hooks/useChat.ts` exposes `sendVoice`
- `client/src/components/HomePage.tsx` destructures `sendVoice`
- `server/src/socket/index.ts` accepts `voiceUrl` and `voiceDuration`
- `server/src/models/Message.ts` stores and returns `voice_url` and `voice_duration`
- `server/src/config/db.ts` creates `voice_url` and `voice_duration` columns
- `server/src/middleware/uploadMiddleware.ts` accepts audio MIME types

Likely causes of the broken/hidden feature:

1. `HomePage` gets `sendVoice`, but does not pass it to `MessageInput`.
2. `MessageInputProps` has no `onSendVoice` prop.
3. `MessageInput` does not import or render `VoiceRecorder`.
4. `VoiceRecorder` uses `MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''`, then falls back to `audio/webm` for blob type. This is unsafe for Safari/iPhone, where `audio/mp4` may be the supported format.
5. `VoiceRecorder` starts recording immediately on mount, so the composer integration must avoid accidental mount/start behavior.
6. The recorder timer uses a ref only, so duration display may not update while recording unless state is added.
7. `VoicePlayer.toggle()` does not handle `audio.play()` promise rejection.

## Required Reading

- `docs/ai/00_README_FOR_AGENTS.md`
- `docs/ai/01_ARCHITECTURE_MAP.md`
- `docs/ai/02_CODE_STRUCTURE.md`
- `docs/ai/06_QA_CHECKLIST.md`
- `docs/ai/gates/frontend-ui.md`
- `docs/ai/gates/backend.md`
- `client/src/components/HomePage.tsx`
- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/chat/VoiceRecorder.tsx`
- `client/src/components/chat/VoicePlayer.tsx`
- `client/src/hooks/useChat.ts`
- `server/src/middleware/uploadMiddleware.ts`
- `server/src/socket/index.ts`
- `server/src/models/Message.ts`

## Scope

Included:

- Composer voice button and recorder state.
- Client voice recording/upload/send path.
- Voice message playback hardening.
- Minimal backend/upload MIME adjustments if required for browser compatibility.
- Tests and docs/worklog updates.

Out of scope:

- UI redesign.
- Voice calls.
- Message transcription.
- Push notifications for voice specifically.
- Large media storage architecture changes.
- S3/object storage migration.

## Allowed Files

- `client/src/components/HomePage.tsx`
- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/chat/VoiceRecorder.tsx`
- `client/src/components/chat/VoicePlayer.tsx`
- `client/src/hooks/useChat.ts`
- `client/src/types/index.ts`
- `server/src/middleware/uploadMiddleware.ts`
- `server/__tests__/upload.test.ts`
- `client/__tests__/*`
- `server/__tests__/*`
- `docs/ai/10_AI_WORKLOG.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`
- `docs/ai/tasks/active/NEXT_AGENT_TASK.md`

## Forbidden Files

- `.env`
- `node_modules/`
- `dist/`
- `client/tsconfig*.tsbuildinfo`
- unrelated UI/design files
- Docker/deployment files unless a voice-upload Docker-only blocker is proven and documented in `docs/ai/CHANGE_REQUESTS.md`

## Implementation Instructions

1. Add `onSendVoice?: (voiceUrl: string, voiceDuration: number) => void` to `MessageInputProps`.
2. Pass `onSendVoice={sendVoice}` from `HomePage` into `MessageInput`.
3. Import and render `VoiceRecorder` from `MessageInput` only when the user explicitly taps/clicks a microphone button.
4. Add a microphone button to the composer only when:
   - not editing a message;
   - not uploading images;
   - `navigator.mediaDevices?.getUserMedia` and `window.MediaRecorder` are available.
5. When recorder is active, show recorder controls instead of the normal text input row or in a compact inline area. Keep existing text/image send behavior untouched.
6. In `VoiceRecorder`, implement a robust MIME preference list:
   - `audio/webm;codecs=opus`
   - `audio/webm`
   - `audio/mp4`
   - `audio/aac`
   - fallback to default `new MediaRecorder(stream)` and use `recorder.mimeType` after creation.
7. Derive upload extension from the actual recorder/blob MIME:
   - webm -> `.webm`
   - mp4 -> `.mp4`
   - aac -> `.aac`
   - ogg -> `.ogg`
   - otherwise `.webm` only if actual type is empty and browser produced playable data.
8. Track duration in React state so the recording timer visibly updates.
9. Stop microphone tracks on send, cancel, unmount, and error.
10. Do not call `onCancel()` immediately after permission errors if doing so hides the error too fast; show a short visible error or return error to `MessageInput`.
11. After upload succeeds, call `onSendVoice(url, duration)` and close recorder.
12. Harden `VoicePlayer`:
   - catch `audio.play()` rejection;
   - reset playing state on error;
   - keep existing visual style.
13. Confirm server upload MIME whitelist includes every MIME produced by the implemented recorder. Add tests for any newly accepted audio MIME.
14. Add at least one client test or focused component test if the current test setup can support it. If not practical, document why in worklog.

## Tests To Add Or Update

- Update `server/__tests__/upload.test.ts` if new audio MIME types are accepted.
- Add or update client tests for:
  - microphone button visibility when recorder APIs exist;
  - `onSendVoice` called after recorder upload success, if practical with mocks;
  - existing image/text send behavior still available.

If browser API mocking is too heavy for the current test setup, add a small helper function for MIME selection and unit-test that helper.

## Verification Commands

```powershell
npm.cmd run build
npm.cmd test
git diff --check
git status --short --branch
```

Manual verification after Docker rebuild:

```powershell
docker compose -f docker-compose.local.yml down
docker compose -f docker-compose.local.yml up --build
```

Then verify in browser:

- text messages still send;
- image messages still upload;
- microphone permission prompt appears only after tapping the mic button;
- recording can be cancelled;
- recording can be sent;
- sent voice message appears in chat;
- playback works for sender and recipient;
- iPhone/Safari behavior is tested if device is available.

## Acceptance Criteria

- [ ] Voice button is visible only when supported and appropriate.
- [ ] Recording starts only after explicit user action.
- [ ] Cancel stops the microphone and sends nothing.
- [ ] Stop/send uploads audio and sends `message:send` with `voiceUrl` and `voiceDuration`.
- [ ] `VoicePlayer` renders and plays received voice messages.
- [ ] Text and image messages still work.
- [ ] Unsupported browsers fail gracefully without broken controls.
- [ ] Build passes.
- [ ] Tests pass.
- [ ] Worklog is updated.

## Definition Of Done

- Follow `docs/ai/12_DEFINITION_OF_DONE.md`.
- Apply `docs/ai/gates/frontend-ui.md`.
- Apply `docs/ai/gates/backend.md` if upload MIME/server code changes.
- Risk level is Medium, so Governor review is required before merge.

## Change Request Rule

If implementation requires a new dependency, a database migration, a separate upload endpoint, Docker image changes, or broad UI redesign, stop and add an entry to `docs/ai/CHANGE_REQUESTS.md` before coding further.

## Worklog Requirements

Update `docs/ai/10_AI_WORKLOG.md` with:

- branch;
- commit;
- changed files;
- browser support decisions;
- verification results;
- manual QA performed or not performed;
- known follow-ups.

## Backlog Requirements

Update `docs/ai/03_PRODUCT_BACKLOG.md`:

- add or update `ZOKUL-VOICE-001`;
- set status to `Implemented` only after code and verification are complete.

## Final Report Format

Report:

- changed files;
- exact voice flow implemented;
- supported recorder MIME types;
- build/test results;
- manual browser/device QA status;
- commit hash if committed;
- known risks/TODOs.
