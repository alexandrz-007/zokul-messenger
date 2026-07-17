# NEXT_AGENT_TASK: Mobile Voice Tap Recording And Safe-Area Polish

Task ID: ZOKUL-VOICE-003
Status: Implemented - ready for Governor review
Created by: Governor
Assigned role: Executor
Execution owner: current agent
Recommended branch: current `master`
Change type: UX bugfix
Risk level: Medium
Confidence: High

## Executive Summary

Adjust the existing mobile voice-message UX so smartphone users start recording with one tap on the microphone and stop/send with a second tap. Also fix the main menu bottom buttons being too low under the mobile browser viewport/safe area.

This task must stay narrow: client UI behavior only. Do not change voice upload, backend APIs, sockets, database, Docker, or deployment.

## User Direction

User requested:

- On smartphone, voice recording should not require holding the microphone button.
- Recording should start on tap and stop/send on the next tap.
- Bottom main-menu buttons on smartphone currently sit too low and should be lifted so create chat, theme, and logout remain visible.

## Must Do

- Change touch/mobile voice recording from hold-to-record to tap-to-start/tap-to-stop.
- Keep desktop voice recorder behavior unchanged.
- Keep the existing cancel button while recording so a user can discard a recording.
- Keep minimum-duration behavior for very short recordings.
- Update labels/text so UI no longer says "hold" or "slide" on mobile tap mode.
- Improve mobile viewport/safe-area handling so bottom main-menu/sidebar action buttons are not hidden under the browser bottom area.
- Keep existing voice upload/send/playback behavior.
- Update docs/worklog per protocol.

## Must Not Do

- Do not change backend/API/database/socket logic.
- Do not change upload endpoint behavior.
- Do not add dependencies.
- Do not add calls/video/circles/transcription/waveforms.
- Do not redesign the messenger.
- Do not change desktop voice recorder behavior except for shared safe-area layout if necessary.
- Do not touch auth screens.
- Do not push or deploy.

## Required Reading

- `docs/00_README_FOR_AGENTS.md`
- `docs/CONTROL_PLANE.md`
- `docs/12_DEFINITION_OF_DONE.md`
- `docs/gates/frontend-ui.md`
- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/HomePage.tsx`
- `client/src/components/layout/AppLayout.tsx`
- `client/src/utils/voice.ts`
- `client/__tests__/voice.test.ts`

## Scope

Included:

- Mobile/touch recording interaction in `MessageInput.tsx`.
- Mobile viewport/safe-area class polish in app shell/sidebar bottom action bar.
- Focused utility/test update only if an existing gesture helper becomes obsolete.
- Required protocol docs.

Out of scope:

- Voice upload protocol changes.
- MediaRecorder MIME changes.
- Server validation changes.
- New UI features.
- Production packaging.

## Allowed Files

- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/HomePage.tsx`
- `client/src/components/layout/AppLayout.tsx`
- `client/src/utils/voice.ts`
- `client/__tests__/voice.test.ts`
- `docs/10_AI_WORKLOG.md`
- `docs/tasks/active/NEXT_AGENT_TASK.md`
- `docs/CONTROL_PLANE.md`
- `docs/03_PRODUCT_BACKLOG.md`
- `docs/AUDIT_LOG.md`

## Forbidden Files

- Server files
- Docker/deployment files
- Database/migration files
- Auth components
- Package/dependency files
- New component files unless a change request is approved

## Implementation Instructions

1. In `MessageInput.tsx`, replace the mobile/touch hold handlers with a tap toggle:
   - first tap starts `startTouchRecording()`;
   - second tap calls `finishTouchRecording(false)`;
   - if the user taps stop while microphone startup is still pending, store a pending finish and send/discard according to the existing minimum duration rule after startup completes.
2. Preserve `cancelTouchRecording()` and the cancel button in the recording bar.
3. Remove mobile "Slide to cancel" / "Release to cancel" language from the tap-mode UI.
4. Keep desktop path (`setShowVoiceRecorder(true)`) unchanged.
5. Update or remove obsolete gesture helper usage/tests if the helper is no longer used by product code.
6. Add viewport/safe-area polish:
   - prefer dynamic viewport height for the app shell;
   - add bottom safe-area padding to the main-menu/sidebar bottom action bar so mobile browser UI does not cover create/theme/logout controls.
7. Run verification commands.
8. Update worklog and execution result.

## Tests To Add Or Update

Automated tests are optional for React pointer behavior unless current test setup makes it simple. If `shouldCancelGesture` becomes unused, remove or adjust its tests so the test suite reflects current code.

Required manual QA notes:

- Smartphone/touch mode: tap mic starts recording.
- Smartphone/touch mode: tap mic again stops and sends if duration is long enough.
- Smartphone/touch mode: cancel button discards recording.
- Desktop mode: click mic still opens the existing recorder UI.
- Bottom sidebar action buttons are visible on mobile.
- Composer controls are not intentionally changed by this task.

## Verification Commands

```powershell
npm.cmd run build
npm.cmd test
git diff --check
git status --short --branch
```

## Acceptance Criteria

- [ ] Mobile voice recording starts by tapping the microphone once.
- [ ] Mobile voice recording stops/sends by tapping the microphone again.
- [ ] Mobile cancel button still discards the recording.
- [ ] Mobile UI no longer instructs the user to hold or slide.
- [ ] Desktop voice recording behavior is preserved.
- [ ] Bottom main-menu controls are lifted above the browser safe area.
- [ ] No backend/API/database/dependency changes are made.
- [ ] Build/tests/diff checks pass or failures are documented.
- [ ] Worklog and active task execution result are updated.

## Definition Of Done

- Follow `docs/12_DEFINITION_OF_DONE.md`.
- Apply `docs/gates/frontend-ui.md`.
- Governor review required before packaging/commit.

## Execution Result

Status: Implemented - ready for Governor review.

### Changes

**MessageInput.tsx** (`client/src/components/chat/MessageInput.tsx`):
- Replaced mobile/touch hold-to-record pointer handlers with tap toggle behavior.
- First tap starts `startTouchRecording()`.
- Second tap stops and sends via `finishTouchRecording(false)`.
- A second tap during async microphone startup is stored as a pending finish and handled after startup.
- Existing cancel button still discards the active recording.
- Mobile tap-mode copy now says `Tap mic to send`; hold/slide language was removed from the mobile path.
- Desktop recorder path remains `setShowVoiceRecorder(true)` and is unchanged.

**HomePage.tsx** (`client/src/components/HomePage.tsx`):
- Added bottom safe-area padding to the main-menu/sidebar action bar containing create chat, theme, and logout.

**AppLayout.tsx** (`client/src/components/layout/AppLayout.tsx`):
- Changed app shell height from `h-screen` to `h-[100dvh] min-h-screen` so mobile browser viewport chrome is handled better.

**voice.ts / voice.test.ts**:
- Removed obsolete slide-to-cancel gesture helper and tests because product code no longer uses slide cancellation.
- Kept MIME, extension, touch-device, and minimum-duration tests.

### Files Changed

- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/HomePage.tsx`
- `client/src/components/layout/AppLayout.tsx`
- `client/src/utils/voice.ts`
- `client/__tests__/voice.test.ts`
- `docs/tasks/active/NEXT_AGENT_TASK.md`
- `docs/CONTROL_PLANE.md`
- `docs/03_PRODUCT_BACKLOG.md`
- `docs/AUDIT_LOG.md`

### Verification

- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 91/91.
- `git diff --check`: passed with CRLF warnings only.
- `git status --short --branch`: modified files listed above.

### Manual QA Status

Not performed in a real smartphone browser in this turn. Required user QA:

1. Open the main menu/sidebar on smartphone and confirm create/theme/logout buttons are visible.
2. In a chat on smartphone, tap mic once to start recording.
3. Tap mic again to stop/send after at least 1 second.
4. Start recording and tap cancel to confirm it discards.
5. On desktop, confirm mic still opens the existing recorder UI.

### Known Risks

- iPhone/Safari MediaRecorder support remains device-dependent; this task changes interaction mechanics, not browser codec support.
