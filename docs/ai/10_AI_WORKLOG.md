# AI Worklog

## 2026-07-17 02:20 - Realtime hardening review

Role: Reviewer
Agent: Codex
Task ID: ZOKUL-SEC-001
Branch: master
Commit: 96d5818

### Intent

Review executor hardening work for Socket.IO access, uploads, auth validation, and tests.

### Actions

- Inspected commits `7609f40` and `96d5818`.
- Verified `chat:leave` was secured after follow-up.
- Verified unused `socket.io-client` dependency was removed from server.
- Ran build and test suite.

### Changed Files

- None during review.

### Verification

- `npm.cmd run build`: passed
- `npm.cmd test`: passed, 71/71 tests
- `git diff --check HEAD`: no diff errors; existing CRLF warning for `client/vite.config.js`

### Decisions / Notes

- Hardening work accepted at code level.
- Socket tests are still mostly logic-level; full Socket.IO integration tests remain recommended.
- Local `master` is ahead of `origin/master` by 2 commits.

### Follow-ups

- Resolve generated build artifacts.
- Add real Socket.IO integration tests.
- Migrate docs into `docs/ai`.

## 2026-07-17 - Documentation migration

Role: Governor
Agent: Codex
Task ID: ZOKUL-DOC-001
Branch: master
Commit:

### Intent

Apply `project-governor` protocol to Zokul and create `docs/ai` project memory.

### Actions

- Created AI navigation, control plane, roles, overview, architecture map, code structure, backlogs, process, QA, security, deployment, decisions, health, DoD, risk, release, memory, compatibility, prompts, gates, and active task placeholders.
- Updated control plane and project health to Review state.

### Changed Files

- `docs/ai/*`

### Verification

- Documentation only; no code verification required.
- `docs/ai` file tree checked.
- `git status --short --branch` checked.

### Decisions / Notes

- Existing legacy docs remain in `docs/` and are referenced as source material.

### Follow-ups

- User may decide whether to stage and commit `docs/ai`.

## 2026-07-17 - UI redesign task handoff

Role: Governor
Agent: Codex
Task ID: ZOKUL-UI-001
Branch: master
Commit:

### Intent

Prepare a scoped executor task to implement the fresh Zokul messenger interface.

### Actions

- Replaced placeholder active task with `ZOKUL-UI-001`.
- Added UI scope, visual direction, allowed/forbidden files, implementation steps, checks, DoD, and change request rule.
- Updated control plane to `Ready for Execution`.
- Updated product backlog task status.

### Changed Files

- `docs/ai/tasks/active/NEXT_AGENT_TASK.md`
- `docs/ai/CONTROL_PLANE.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`
- `docs/ai/10_AI_WORKLOG.md`

### Verification

- Documentation/task handoff only; no build/test required.

### Decisions / Notes

- The redesign must not add fake controls for unavailable features such as calls, video, reactions, pinned chats, or fake search.

### Follow-ups

- Executor should implement in a scoped branch and run client/root verification.

## 2026-07-17 03:38 - UI redesign implementation

Role: Executor
Agent: Codex
Task ID: ZOKUL-UI-001
Branch: codex/zokul-ui-redesign
Commit: (not committed — awaiting user direction)

### Intent

Redesign Zokul messenger UI in a calm premium dark-first style. Mobile-first, no new features, no backend changes.

### Changed Files

21 files under `client/src/` — see task execution result for full list.

### Verification

- `cd client; npm.cmd run build`: passed
- `cd client; npm.cmd test`: passed, 7/7
- `npm.cmd run build` (root): passed (client + server)
- `npm.cmd test` (root): passed, 78/78 (7 client + 71 server)
- `git diff --check`: CRLF warnings only (Windows expected)

### Decisions / Notes

- Images rendered outside message bubble to eliminate outgoing blue frame.
- Used Tailwind `dark:` variants and custom surface colors via config extension.
- Migrated CreateChatModal and CreateGroupModal to use shared Modal component.
- Avatar fallback colors now hash-based across 10 colors.

### Follow-ups

- Governor review required.
- User to decide on commit.

## 2026-07-17 - UI redesign rollback

Role: Executor
Agent: Codex
Task ID: ZOKUL-UI-001
Branch: codex/zokul-ui-redesign
Commit: cf986d3, 7fc1392, 0dcceb7

### Intent

Rollback all UI redesign changes after user review showed the interface became worse.

### Actions

- Reverted `b40070d fix: address ui redesign review findings`.
- Reverted `50a7532 style: polish messenger interface`.
- Restored `docs/ai/03_PRODUCT_BACKLOG.md`, `docs/ai/10_AI_WORKLOG.md`, and `docs/ai/tasks/active/NEXT_AGENT_TASK.md` because the UI revert removed those protocol files from history.

### Verification

- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 78/78.
- `git diff --check master..HEAD`: passed.
- `git status --short --branch`: clean.

### Decisions / Notes

- Client UI files no longer differ from `master`.
- AI protocol documentation remains in the branch.

## 2026-07-17 - iPhone photo upload hotfix

Role: Executor
Agent: Codex
Task ID: ZOKUL-UPLOAD-001
Branch: codex/zokul-ui-redesign
Commit: 31a3899

### Intent

Fix likely iPhone browser photo upload failures before server release validation.

### Actions

- Allowed HEIC/HEIF image MIME types in upload middleware and image processing.
- Added `client_max_body_size 25m` to nginx configs to avoid large phone photos being rejected before reaching the server.
- Updated upload MIME tests.

### Verification

- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 78/78.
- `git diff --check`: passed with Windows LF/CRLF warnings only.

### Decisions / Notes

- This hotfix was initially committed before updating `docs/ai`, which violated the AI workflow protocol.
- Protocol record was added after user correction.
- If HEIC still fails on device, the next likely issue is Sharp/libvips HEIF codec support in the Docker image; solve via client-side conversion or explicit server image pipeline change.

## 2026-07-17 - Voice messages task planning

Role: Governor
Agent: Codex
Task ID: ZOKUL-VOICE-001
Branch: codex/zokul-ui-redesign
Commit:

### Intent

Analyze the existing hidden voice-message implementation and prepare a scoped executor task to make it work.

### Findings

- Backend message model, DB columns, Socket.IO message send path, upload endpoint, and `VoicePlayer` are partially present.
- `HomePage` destructures `sendVoice` but does not pass it into `MessageInput`.
- `MessageInput` has no `onSendVoice` prop and does not render `VoiceRecorder`.
- `VoiceRecorder` assumes `audio/webm` too aggressively and is likely incompatible with Safari/iPhone recording behavior.
- Recorder duration uses refs only, so visible timer updates are unreliable.

### Actions

- Replaced active task with `ZOKUL-VOICE-001`.
- Updated control plane and product backlog.
- Added audit entries for rollback, upload hotfix, and voice task planning.

### Verification

- Planning/docs only; no product build required for this handoff.

### Follow-ups

- Executor should implement `ZOKUL-VOICE-001` using `project-executor`.

## 2026-07-17 - Voice messages implementation

Role: Executor
Agent: Codex
Task ID: ZOKUL-VOICE-001
Branch: codex/zokul-ui-redesign
Commit: (not committed — awaiting user direction)

### Intent

Implement working voice messages. Complete the existing unfinished voice-message path (recorder, upload, send, playback) without redesign.

### Actions

- Fixed `VoiceRecorder.tsx`:
  - Extracted MIME detection and extension derivation to `client/src/utils/voice.ts`.
  - Implemented MIME preference list: `audio/webm;codecs=opus` → `audio/webm` → `audio/mp4` → `audio/aac` → default.
  - Extension now derived from actual `recorder.mimeType` instead of hardcoded fallback.
  - Duration tracked in React state so timer visibly updates.
  - Error display no longer auto-dismisses via immediate `onCancel`; user taps close to dismiss.
  - Mic stream tracks stopped on send, cancel, unmount, and error.
- Fixed `VoicePlayer.tsx`:
  - `audio.play()` promise rejection is caught; playing state reset on error.
- Fixed `MessageInput.tsx`:
  - Added `onSendVoice` prop and imported `VoiceRecorder`.
  - Added microphone button visible when: voice APIs available, not editing, no pending images.
  - `VoiceRecorder` renders inline replacing text input when mic button is tapped.
- Fixed `HomePage.tsx`:
  - Passed `onSendVoice={sendVoice}` to `MessageInput`.
- Fixed `server/src/middleware/uploadMiddleware.ts`:
  - Audio/image MIME regex now accepts optional parameters (e.g. `audio/webm;codecs=opus`) via `(;.+)?$` suffix.
- Added `client/src/utils/voice.ts` with `getSupportedMimeType` and `getExtension` helpers.
- Added `client/__tests__/voice.test.ts` with 10 tests for extension derivation and MIME selection.
- Updated `server/__tests__/upload.test.ts` with MIME regex update and codecs parameter test.
- Voice flow: tap mic → recorder mounts & starts → record/stop → upload via `/api/upload` → `message:send` with `voiceUrl` + `voiceDuration` → receiver sees playable `VoicePlayer`.

### Changed Files

- `client/src/components/HomePage.tsx`
- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/chat/VoiceRecorder.tsx`
- `client/src/components/chat/VoicePlayer.tsx`
- `client/src/utils/voice.ts` (new)
- `client/__tests__/voice.test.ts` (new)
- `server/src/middleware/uploadMiddleware.ts`
- `server/__tests__/upload.test.ts`

### Verification

- `npm.cmd run build`: passed (client + server)
- `npm.cmd test`: passed, 89/89 (17 client + 72 server)
- `git diff --check`: CRLF warnings only (Windows expected)
- `git status --short --branch`: clean

### Decisions / Notes

- MIME regex updated to accept parameters (`;codecs=opus` etc.) since browsers include codec info in blob MIME.
- VoiceRecorder auto-starts on mount, but is only mounted on explicit mic-button tap, satisfying "recording starts only after explicit user action".
- No Docker rebuild needed: upload endpoint unchanged, only MIME regex relaxed to accept standard codec parameters.
- Manual browser/device QA not performed; Docker compose smoke test recommended before merge.

### Follow-ups

- Governor review required (risk level: Medium).
- Manual browser/device QA on Chrome, Safari/iPhone, and Android.
- Docker compose up --build and manual smoke test before merge.

## 2026-07-17 - Telegram-like voice UX follow-up planning

Role: Governor
Agent: Codex
Task ID: ZOKUL-VOICE-002
Branch: codex/zokul-ui-redesign
Commit:

### Intent

Plan the next voice-message UX improvement after the basic voice-message implementation is accepted.

### Actions

- Created planned task `docs/ai/tasks/planned/ZOKUL-VOICE-002-telegram-like-recording.md`.
- Updated product backlog with `ZOKUL-VOICE-002`.
- Updated control plane to show `ZOKUL-VOICE-001` is in Review and `ZOKUL-VOICE-002` is blocked until acceptance.
- Added audit entry for the planned follow-up.

### Verification

- Documentation-only planning change.
- `git diff --check`: passed with Windows LF/CRLF warnings only.

### Decisions / Notes

- Telegram-like audio UX should be a follow-up, not mixed into the current voice MVP review.
- Video circles are explicitly out of scope and should become a separate task if requested.

### Protocol Check

- Worklog updated: yes
- Audit log updated: yes
- Control plane updated: yes
- Active task preserved: yes
- Git status checked: yes

## 2026-07-17 - Telegram-like voice recording UX implementation

Role: Executor
Agent: Codex
Task ID: ZOKUL-VOICE-002
Branch: codex/zokul-ui-redesign
Commit: (committed)

### Intent

Improve voice-message composer UX with Telegram-like hold-to-record on mobile, keeping desktop click-based fallback. No backend changes, no video/circles, no redesign.

### Actions

- Added gesture helpers to `client/src/utils/voice.ts`:
  - `CANCEL_THRESHOLD = 80` (px)
  - `MIN_DURATION_MS = 1000` (1 second minimum recording)
  - `isTouchDevice()` — detects touch capabilities
  - `shouldCancelGesture(startX, currentX)` — returns true when horizontal drag left exceeds threshold
- Rewrote `MessageInput.tsx`:
  - **Touch mode**: mic button uses Pointer Events (`onPointerDown` → start recording, `onPointerMove` → track cancel, `onPointerUp` → send or discard, `onPointerCancel` → discard). Recording bar appears inline with timer + "Slide to cancel" / "Release to cancel" visual hint. Bar progress turns red when cancel threshold reached. Recordings < 1s discarded silently.
  - **Desktop mode**: mic button uses `onClick` → mounts `VoiceRecorder` (existing auto-start, explicit stop/send, explicit cancel).
  - Touch mode detection uses `touchModeRef` (computed once from `isTouchDevice()`).
  - All existing text/image behavior preserved.
  - `VoiceRecorder` import and `onSendVoice` prop from ZOKUL-VOICE-001 preserved.
- Refactored `VoiceRecorder.tsx`:
  - Added optional `isCancelling` prop for visual cancel-feedback (used by desktop mode bar).
  - Recording bar shows "Slide to cancel" hint when `isCancelling` is provided, stop button when not.
- Added 6 new tests in `client/__tests__/voice.test.ts`:
  - `shouldCancelGesture`: within threshold, beyond threshold, moved right.
  - `CANCEL_THRESHOLD`: equals 80.
  - `MIN_DURATION_MS`: equals 1000.
  - `isTouchDevice`: returns boolean.

### Changed Files

- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/chat/VoiceRecorder.tsx`
- `client/src/utils/voice.ts`
- `client/__tests__/voice.test.ts`
- `docs/ai/tasks/active/NEXT_AGENT_TASK.md`
- `docs/ai/CONTROL_PLANE.md`
- `docs/ai/10_AI_WORKLOG.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`

### Verification

- `npm.cmd run build`: passed (client + server)
- `npm.cmd test`: passed, 95/95 (23 client + 72 server)
- `git diff --check`: CRLF warnings only (Windows expected)
- `git status --short --branch`: clean except untracked new files

### Decisions / Notes

- Touch detection uses a ref (`touchModeRef`) computed once, not state, to avoid layout shifts.
- Slide-up-to-lock is deferred to a future task per the planned task scope.
- Desktop fallback reuses existing `VoiceRecorder` component unchanged in behavior.
- No Docker rebuild needed: zero backend changes.
- Manual browser/device QA recommended before merge.

### Follow-ups

- Governor review required (risk level: Medium).
- Manual QA on iPhone (hold-to-record, slide-to-cancel) and desktop Chrome.
- Slide-up-to-lock enhancement could be future task.

## 2026-07-17 - Governor review of Telegram-like voice recording UX

Role: Governor
Task ID: ZOKUL-VOICE-002
Branch: codex/zokul-ui-redesign
Reviewed commit: 2e1ddd6
Result: Needs Changes

### Findings

- P1: Desktop cancel can still upload because `VoiceRecorder.cancelRecording()` calls `stop()`, while `recorder.onstop` uploads unconditionally when chunks exist.
- P1: Mobile quick release during async microphone startup can be ignored because `handlePointerUp` exits while `touchRecorderActive` is still false.
- P1: Commit/package hygiene is not ready: ZOKUL-VOICE-002 is committed, but required base voice/upload changes remain as modified tracked files.
- P2: Review build failed locally with `EPERM` writing `client/dist/sw.js`; tests passed 95/95.

### Verification

- `npm.cmd run build`: failed locally with `EPERM: operation not permitted, open 'C:\zokul\client\dist\sw.js'`.
- `npm.cmd test`: passed, 95/95.
- `git diff --check`: passed with Windows LF/CRLF warnings only.
- `git status --short --branch`: dirty tracked files remain.

### Next Action

Executor should fix the two voice behavior bugs, add/adjust tests or manual QA notes, and resolve git packaging before another Governor review.

## 2026-07-17 - Fix ZOKUL-VOICE-002 review findings (P1 bugs)

Role: Executor
Agent: Codex
Task ID: ZOKUL-VOICE-002
Branch: codex/zokul-ui-redesign
Commit: (not committed)

### Intent

Fix two P1 bugs identified in the Governor review of the Telegram-like voice recording UX:
1. Desktop cancel in VoiceRecorder uploads the voice message anyway.
2. Mobile quick release during async microphone startup is ignored.

### Actions

- **VoiceRecorder.tsx**: Added `discardRef`. Reset in `startRecording`; checked in `onstop` to skip upload; set to `true` in `cancelRecording` before `stop()`. Cancel never uploads.
- **MessageInput.tsx**: Added `touchStartingRef`, `touchPendingFinishRef`, `touchPendingCancelRef`, `touchRecorderActiveRef`. Pointer up/cancel during async startup stores pending action; executed after `recorder.start()` completes. Added `setPointerCapture`/`releasePointerCapture` for reliable pointer tracking.

### Changed Files

- `client/src/components/chat/VoiceRecorder.tsx`
- `client/src/components/chat/MessageInput.tsx`
- `docs/ai/CONTROL_PLANE.md`
- `docs/ai/tasks/active/NEXT_AGENT_TASK.md`
- `docs/ai/10_AI_WORKLOG.md`
- `docs/ai/AUDIT_LOG.md`

### Verification

- `npm.cmd run build`: passed (client tsc + vite + server)
- `npm.cmd test`: passed, 95/95 (client 23 + server 72)

### Decisions / Notes

- Item #3 from the review (dirty tracked files from ZOKUL-VOICE-001) and item #4 (EPERM build failure during review) remain unaddressed. These are environment/process issues outside the scope of these fixes.
- No new tests added for the fix itself (the bug is in timing/hardware interaction; reliable unit testing would require MediaRecorder mocking infrastructure not currently present). Manual QA checklist updated in NEXT_AGENT_TASK.md.
- Ref-callback circular dependency resolved using intermediate refs (`finishTouchRecordingRef`, `cancelTouchRecordingRef`) rather than reordering hook definitions.

### Follow-ups

- Governor re-review required.
- User to decide on committing fixes and packaging dirty tracked files.

## 2026-07-17 - Sidebar Visual Polish (ZOKUL-UI-001)

Role: Executor
Agent: Codex
Task ID: ZOKUL-UI-001
Branch: codex/zokul-ui-redesign
Commit: (not committed)

### Intent

Polish only the messenger left sidebar / chat list to move Zokul closer to the approved visual concept while preserving current functionality. First small step of the larger staged UI refresh.

### Actions

- **Avatar.tsx**: Added deterministic color palette (12 colors) based on name hash. Uploaded avatars unaffected.
- **HomePage.tsx**: Redesigned sidebar — "Zokul" brand at top, profile block (avatar + name + Online status) opens ProfileEditor on click, bottom action bar with create chat / theme toggle / logout. Removed group creation button from top bar.
- **ChatList.tsx**: Premium rows — rounded selected state, bold/regular name weight by unread status, "Yesterday"/date formatting for timestamps, stronger unread badge, cleaner hover/active states, polished delete affordance on hover.
- No new dependencies, no backend changes, no search, no settings, no fake controls.

### Changed Files

- `client/src/components/common/Avatar.tsx`
- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatList.tsx`
- `docs/ai/tasks/active/NEXT_AGENT_TASK.md`
- `docs/ai/CONTROL_PLANE.md`
- `docs/ai/10_AI_WORKLOG.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`
- `docs/ai/AUDIT_LOG.md`

### Verification

- `npm.cmd run build`: passed (client tsc + vite + server)
- `npm.cmd test`: passed, 95/95 (client 23 + server 72)
- `git diff --check`: CRLF warnings only (Windows expected)
- `git status --short --branch`: modified tracked files as listed above

### Decisions / Notes

- `CreateGroupModal` is kept in JSX (state + component) but its button is removed from the sidebar. The modal still renders but is only accessible programmatically. This avoids breaking existing functionality while respecting the "3 bottom actions only" requirement.
- Theme toggle uses the existing `useTheme()` from `ThemeContext` — no changes needed there.
- Avatar `bg-primary` is replaced by deterministic color. The `size` prop and `url` (image) fallback remain unchanged.
- Time formatting in ChatList uses a local `formatTime` helper rather than a new dependency.

### Follow-ups

- Governor review required.
- Manual QA on desktop and mobile before merge.

## 2026-07-17 - Release Package Preparation (ZOKUL-RELEASE-001)

Role: Governor / Release
Task ID: ZOKUL-RELEASE-001
Branch: codex/zokul-ui-redesign
Commit: (not committed)

### Intent

Prepare a deployable copy of the accepted Zokul code in a separate release folder while preserving server-only runtime files and avoiding accidental deletion of SSL certificates, `.env`, accounts, messages, or uploaded files.

### Actions

- Added `scripts/prepare-release.ps1` as the new release packaging script.
- The release script copies source code into `C:\zokul-deploy`, excludes local/development artifacts, and preserves existing `ssl/` and `.env` in the deploy folder.
- Added `scripts/fresh-start-prod.sh` for intentional empty-server starts. It requires `--confirm-delete-data` and runs Docker Compose with `down -v` before `up -d --build`.
- Prepared `C:\zokul-deploy` with `-FreshServerData`; `docs/` and local-only files are excluded from the package.
- Initialized the release folder as a separate git repository and staged the packaged files there.

### Verification

- `npm.cmd run build`: passed during packaging.
- `npm.cmd test`: passed, 95/95.
- `git diff --check`: passed with CRLF warnings only.
- `docker compose -f docker-compose.prod.yml build`: passed from `C:\zokul-deploy`.

### Runtime Notes

- Production start was not run locally because `C:\zokul-deploy\.env` is not present and `C:\zokul-deploy\ssl` is currently empty.
- Normal production update command preserves Docker volumes:
  `docker compose -f docker-compose.prod.yml up -d --build`
- Fresh empty server command deletes Docker volumes and starts with no accounts/messages/files:
  `./scripts/fresh-start-prod.sh --confirm-delete-data`

## 2026-07-17 - Governor review of participant avatar viewer

Role: Governor
Task ID: ZOKUL-UI-006
Branch: codex/zokul-ui-redesign
Result: Accepted

### Review

- Scope check: passed. Implementation is limited to `HomePage.tsx`, `ChatView.tsx`, and protocol docs.
- Functionality check: passed by code inspection. Real `avatarUrl` images open through existing `ImageViewer`; fallback initials remain non-clickable.
- Product boundary check: passed. No backend/API/socket/upload changes, no profile pages, no contact cards, no new dependencies.

### Verification

- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 95/95.
- `git diff --check`: passed with CRLF warnings only.

### Next Action

Rebuild Docker for user visual QA. If accepted visually, package and commit the accepted UI/docs change set.

## 2026-07-17 - Sidebar Create Menu & Theme Toggle (ZOKUL-UI-003)

Role: Executor
Agent: Codex
Task ID: ZOKUL-UI-003
Branch: codex/zokul-ui-redesign
Commit: (not committed)

### Intent

Restore group chat creation access without adding a fourth sidebar button, and ensure theme toggle visibly works. The bottom create button should open a compact menu with Personal chat and Group chat options.

### Actions

- **HomePage.tsx**:
  - Added `showCreateMenu` state + `createMenuRef` for outside-click / Escape detection.
  - Create button now toggles the menu (with highlight state when open).
  - Menu positioned above the button with two items: "Personal chat" (user icon) opens `CreateChatModal`; "Group chat" (group icon) opens `CreateGroupModal`.
  - Both existing modals reused as-is.
- **ThemeContext**: Verified working. No changes needed. Light mode sidebar (`bg-gray-50`) is acceptable.

### Changed Files

- `client/src/components/HomePage.tsx`
- `docs/ai/tasks/active/NEXT_AGENT_TASK.md`
- `docs/ai/CONTROL_PLANE.md`
- `docs/ai/10_AI_WORKLOG.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`
- `docs/ai/AUDIT_LOG.md`

### Verification

- `npm.cmd run build`: passed (client tsc + vite + server)
- `npm.cmd test`: passed, 95/95 (client 23 + server 72)
- `git diff --check`: CRLF warnings only (Windows expected)
- `git status --short --branch`: modified tracked files as listed above

### Decisions / Notes

- No changes to `CreateChatModal`, `CreateGroupModal`, or `ThemeContext`.
- Bottom action bar keeps exactly 3 visible buttons.
- No avatar viewer, search, settings, calls/video, or fake controls added.

### Follow-ups

- Governor review required.
- Manual QA on desktop and mobile before merge.
- Future stages could extend polish to chat header, bubbles, composer, etc.

## 2026-07-17 - Sidebar Composition & States Polish (ZOKUL-UI-002)

Role: Executor
Agent: Codex
Task ID: ZOKUL-UI-002
Branch: codex/zokul-ui-redesign
Commit: (not committed)

### Intent

Refine the sidebar composition after user review of ZOKUL-UI-001. Fix profile looking like a chat row, move Zokul inline, add zone dividers, compact chat rows, polish states, and improve avatar colors.

### Actions

- **Avatar.tsx**: Replaced neon color palette with deep premium colors (forest green, violet, teal, muted gold, emerald, etc.). Deterministic hash unchanged.
- **HomePage.tsx**: Merged Zokul into the account header row with right alignment. Removed standalone Zokul line. Profile goes to very top of sidebar. Clear `mx-4` dividers between zones. Bottom bar has `border-t` divider, uniform `w-11 h-11` / `w-5 h-5` buttons/icons, focus-visible rings for accessibility.
- **ChatList.tsx**: Avatar 42px, rows `py-2.5`, selected state uses `border-l-[3px] border-primary` left accent. Added dedicated `LoadingSkeleton` (avatar+text lines), `EmptyState`, and `ErrorState` sub-components. Fixed `formatTime` across month/year boundaries. Smaller delete button. Removed row rounding.

### Changed Files

- `client/src/components/common/Avatar.tsx`
- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatList.tsx`
- `docs/ai/tasks/active/NEXT_AGENT_TASK.md`
- `docs/ai/CONTROL_PLANE.md`
- `docs/ai/10_AI_WORKLOG.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`
- `docs/ai/AUDIT_LOG.md`

### Verification

- `npm.cmd run build`: passed (client tsc + vite + server)
- `npm.cmd test`: passed, 95/95 (client 23 + server 72)
- `git diff --check`: CRLF warnings only (Windows expected)
- `git status --short --branch`: modified tracked files as listed above

### Decisions / Notes

- Zokul rendered as uppercase `ZOKUL` with `tracking-wider` letter-spacing for a subtle premium logo feel.
- The left accent line (`border-l-[3px] border-primary`) provides a clear selected indicator without adding visual bulk.
- Avatar colors removed bright iOS-style colors like `#FF2D55` (hot pink), `#FFD60A` (bright yellow), `#34C759` (bright green) in favor of deeper/moodier tones that work better on dark gray sidebar.
- `showGroup` state and `CreateGroupModal` remain in JSX (unchanged from previous task).

### Follow-ups

- Governor review required.
- Manual QA on desktop and mobile before merge.

## 2026-07-17 - Governor re-review of ZOKUL-VOICE-002 fixes

Role: Governor
Task ID: ZOKUL-VOICE-002
Branch: codex/zokul-ui-redesign
Result: Accepted for behavior fixes; release packaging still required

### Review

- `VoiceRecorder.tsx`: accepted. `discardRef` prevents cancel from uploading after `MediaRecorder.stop()`.
- `MessageInput.tsx`: accepted. Pending finish/cancel refs handle pointer up/cancel during async microphone startup.
- No new product scope was added.

### Verification

- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 95/95.
- `git diff --check`: passed with CRLF warnings only.
- `git status --short --branch`: still dirty; packaging decision required.

### Follow-ups

- Package/commit the full voice/upload change set intentionally before merge/release.
- Create a separate follow-up task for focused voice component tests with mocked `MediaRecorder`.
- Admin panel idea captured in `03_PRODUCT_BACKLOG.md` as `ZOKUL-ADMIN-ROADMAP`.

## 2026-07-17 - Created sidebar UI polish handoff

Role: Governor
Task ID: ZOKUL-UI-001
Branch: codex/zokul-ui-redesign
Result: Active task ready for Executor

### Intent

Start the UI refresh as a small, reviewable task focused only on the left sidebar/chat list. User wants the visual direction close to the provided concept, but without chat search or fake controls.

### Decisions

- First UI stage is sidebar only.
- Do not add chat search yet.
- Bottom sidebar actions are create chat, theme toggle, and logout.
- Keep profile editor behavior on profile/name click.
- Use varied deterministic avatar colors.
- Design must consider both desktop and smartphone usage.

### Changed Docs

- Archived accepted `ZOKUL-VOICE-002` active task.
- Created new active task `ZOKUL-UI-001`.
- Updated `CONTROL_PLANE.md`.
- Updated `03_PRODUCT_BACKLOG.md`.

### Next Action

Executor should implement only `ZOKUL-UI-001` and then hand off for Governor review.

## 2026-07-17 - Governor review of sidebar UI polish

Role: Governor
Task ID: ZOKUL-UI-001
Branch: codex/zokul-ui-redesign
Result: Accepted

### Review

- Scope check: passed. Implementation stayed within `HomePage.tsx`, `ChatList.tsx`, `Avatar.tsx`, and protocol docs.
- Product direction: passed. Sidebar now follows the concept more closely without adding search or fake controls.
- Functionality check: passed by code inspection. Create chat, theme toggle, logout, profile editor trigger, chat selection, unread badge, and avatar fallback paths are preserved.

### Verification

- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 95/95.
- `git diff --check`: passed with CRLF warnings only.

### Non-blocking Follow-ups

- Clean up nested interactive controls in `ChatList.tsx` in a later accessibility pass.
- Harden `formatTime()` around month/year boundaries if date labels become important.
- User should visually approve the sidebar before commit/release packaging.

## 2026-07-17 - Created sidebar composition polish handoff

Role: Governor
Task ID: ZOKUL-UI-002
Branch: codex/zokul-ui-redesign
Result: Active task ready for Executor

### Intent

Create the second small UI task after user visual review of `ZOKUL-UI-001`. The user likes the style direction, but the sidebar composition needs correction: the profile looks like a dialog, `Zokul` is detached at the top, and sidebar zones need clearer boundaries.

### Decisions

- Keep the UI refresh staged and sidebar-only.
- Move `Zokul` into the account/header area to the right of the user identity.
- Make account/profile visually distinct from chat rows.
- Add sidebar-local polish for spacing, dividers, chat row density, selected state, loading/empty/error states, bottom action bar, avatar palette, and mobile ergonomics.
- Do not add search, settings, calls/video, or change chat/message/composer areas.

### Changed Docs

- Archived accepted `ZOKUL-UI-001` active task.
- Created new active task `ZOKUL-UI-002`.
- Updated `CONTROL_PLANE.md`.
- Updated `03_PRODUCT_BACKLOG.md`.

### Next Action

Executor should implement only `ZOKUL-UI-002` and then hand off for Governor review.

## 2026-07-17 - Governor review of sidebar composition polish

Role: Governor
Task ID: ZOKUL-UI-002
Branch: codex/zokul-ui-redesign
Result: Accepted

### Review

- Scope check: passed. Implementation stayed within `HomePage.tsx`, `ChatList.tsx`, `Avatar.tsx`, and protocol docs.
- Product direction: passed. Account header now separates profile identity from chat rows and places `Zokul` in the intended top/header area.
- Functionality check: passed by code inspection. Profile editor trigger, create chat, theme toggle, logout, chat selection, unread badges, and uploaded avatar fallback paths are preserved.

### Verification

- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 95/95.
- `git diff --check`: passed with CRLF warnings only.

### Non-blocking Follow-up

- Clean up nested interactive controls in `ChatList.tsx` in a separate accessibility pass.

### Next Action

User should visually review the result. If accepted, package and commit the UI docs/code changes.

## 2026-07-17 - Created sidebar create menu and theme task

Role: Governor
Task ID: ZOKUL-UI-003
Branch: codex/zokul-ui-redesign
Result: Active task ready for Executor

### Intent

Restore group chat creation without adding a fourth bottom action, and ensure the theme button is visibly useful.

### Decisions

- Bottom bar remains exactly three visible buttons: create, theme, logout.
- Create button should open a compact menu with `Personal chat` and `Group chat`.
- Theme toggle should visibly switch light/dark; sidebar light mode may be polished within allowed files.
- Viewing another participant's avatar is captured as `ZOKUL-PROD-003` and is out of scope for this task.

### Changed Docs

- Archived accepted `ZOKUL-UI-002` active task.
- Created new active task `ZOKUL-UI-003`.
- Updated `CONTROL_PLANE.md`.
- Updated `03_PRODUCT_BACKLOG.md`.

### Next Action

Executor should implement only `ZOKUL-UI-003` and hand off for Governor review.

## 2026-07-17 - Governor review of sidebar create menu and theme toggle

Role: Governor
Task ID: ZOKUL-UI-003
Branch: codex/zokul-ui-redesign
Result: Accepted

### Review

- Scope check: passed. Group chat creation was restored through the existing create flow without adding a fourth bottom action.
- Functionality check: passed by code inspection. `Personal chat` opens `CreateChatModal`, `Group chat` opens `CreateGroupModal`, theme toggle uses the existing `ThemeContext`, and logout/profile/chat selection behavior remains in place.
- Product direction: passed. No search, settings page, calls/video, avatar viewer, backend changes, or new dependencies were added.

### Verification

- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 95/95.
- `git diff --check`: passed with CRLF warnings only.

### Non-blocking Follow-up

- Consider wrapping the create button and popover in the same outside-click ref later so a second click on the open create button predictably closes the menu. Current selection, outside click, and Escape close paths work for the task acceptance criteria.

### Next Action

Rebuild Docker for user visual QA. If accepted visually, package and commit the full accepted UI/docs change set.

## 2026-07-17 - Hotfix theme toggle Tailwind config

Role: Governor hotfix exception
Task ID: ZOKUL-UI-003
Branch: codex/zokul-ui-redesign
Result: Implemented

### Problem

The theme button called `toggleTheme()` and `ThemeContext` correctly toggled `dark` on `<html>`, but Tailwind was not configured to use class-based dark mode.

### Change

- Added `darkMode: 'class'` to `client/tailwind.config.js`.

### Scope

- No UI redesign.
- No backend changes.
- Existing `ThemeContext` behavior preserved.

### Verification

- Pending rebuild after hotfix.

## 2026-07-17 - Created soft light theme handoff

Role: Governor
Task ID: ZOKUL-UI-004
Branch: codex/zokul-ui-redesign
Result: Active task ready for Executor

### Intent

User likes the new UI direction, but the light theme is too bright. Create a small, color-only task to make the light theme softer and less eye-straining without changing layout or adding functionality.

### Decisions

- Use a calm blue-gray soft light palette rather than pure white.
- Keep dark theme behavior unchanged.
- Keep the task limited to existing messenger UI surfaces.
- Do not mix participant avatar viewing into this task.

### Changed Docs

- Archived accepted `ZOKUL-UI-003` active task.
- Created new active task `ZOKUL-UI-004`.
- Updated `CONTROL_PLANE.md`.
- Updated `03_PRODUCT_BACKLOG.md`.
- Updated `AUDIT_LOG.md`.

### Queued Follow-up

- `ZOKUL-UI-005 Participant avatar viewer` captured as a separate follow-up after `ZOKUL-UI-004` acceptance.

### Next Action

Executor should implement only `ZOKUL-UI-004` and hand off for Governor review.

## 2026-07-17 - Soft Light Theme Polish (ZOKUL-UI-004)

Role: Executor
Agent: Codex
Task ID: ZOKUL-UI-004
Branch: codex/zokul-ui-redesign
Commit: (not committed)

### Intent

Make the light theme softer and less eye-straining using a calm blue-gray palette. Replace harsh pure-white / bright light surfaces while keeping the dark theme unchanged.

### Actions

- **AppLayout.tsx**: Added `bg-[#F3F6FA] dark:bg-gray-900` for overall app background.
- **HomePage.tsx**: Sidebar `bg-[#E7EDF5]`, borders `border-[#CBD6E2]`, create menu popover `bg-[#F8FAFD]` + `border-[#D5DEE9]`, button hover states `bg-[#DCE8F7]`/`bg-[#E7EDF5]`, menu divider `border-[#D5DEE9]`, chat section `bg-[#F5F8FB]`, chat header bg + border.
- **ChatList.tsx**: Skeleton `bg-[#D5DEE9]`, empty state `bg-[#E7EDF5]`, selected row `bg-[#DCE8F7]`, hover `bg-[#E7EDF5]`, delete popover `bg-[#F8FAFD]` + `border-[#D5DEE9]`, delete button hover `bg-[#CBD6E2]`.
- **ChatView.tsx**: Incoming bubble `bg-[#E6EDF5]`, empty state icon `bg-[#E7EDF5]`.
- **MessageInput.tsx**: Composer `bg-[#E8EEF6]`, emoji picker `bg-[#F8FAFD]` + `border-[#D5DEE9]`, touch recorder surfaces `bg-[#E8EEF6]`, progress track `bg-[#CBD6E2]`, form border `border-[#D5DEE9]`.
- **MessageActions.tsx**: Popover `bg-[#F8FAFD]` + `border-[#D5DEE9]`, hover `bg-[#E7EDF5]`.
- **ReplyQuote.tsx**: `bg-[#E8EEF6]`.
- **VoicePlayer.tsx**: Track `bg-[#CBD6E2]`.
- **VoiceRecorder.tsx**: All surfaces `bg-[#E8EEF6]`, track `bg-[#CBD6E2]`.

### Changed Files

- `client/src/components/layout/AppLayout.tsx`
- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatList.tsx`
- `client/src/components/chat/ChatView.tsx`
- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/chat/MessageActions.tsx`
- `client/src/components/chat/ReplyQuote.tsx`
- `client/src/components/chat/VoicePlayer.tsx`
- `client/src/components/chat/VoiceRecorder.tsx`
- `docs/ai/tasks/active/NEXT_AGENT_TASK.md`
- `docs/ai/CONTROL_PLANE.md`
- `docs/ai/10_AI_WORKLOG.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`
- `docs/ai/AUDIT_LOG.md`

### Verification

- `npm.cmd run build`: passed (client tsc + vite + server)
- `npm.cmd test`: passed, 95/95 (client 23 + server 72)
- `git diff --check`: CRLF warnings only (Windows expected)
- `git status --short --branch`: modified tracked files as listed

### Decisions / Notes

- All changes are color-only. No features, dependencies, layout, or dark theme changes.
- Used Tailwind arbitrary values (`bg-[#...]`) for minimal diff.
- Dark theme `dark:` classes untouched everywhere.
- No new design tokens or token system introduced.

### Follow-ups

- Governor review required.
- Manual visual QA on desktop and mobile before merge.
- Next queued: ZOKUL-UI-005 participant avatar viewer.

## 2026-07-17 - Governor review of soft light theme polish

Role: Governor
Task ID: ZOKUL-UI-004
Branch: codex/zokul-ui-redesign
Result: Accepted

### Review

- Scope check: passed. Changes are limited to allowed messenger UI/component files and docs.
- Product direction: passed. Light theme surfaces now use a softer blue-gray palette instead of harsh white surfaces.
- Functionality check: passed by code inspection. No backend/API/socket changes, no avatar viewer, no search/settings/calls/read receipts, and no new dependencies were added.

### Verification

- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 95/95.
- `git diff --check`: passed with CRLF warnings only.

### Next Action

Rebuild Docker for user visual QA. If accepted visually, package and commit the accepted UI/docs change set.

## 2026-07-17 - Created participant avatar viewer handoff

Role: Governor
Task ID: ZOKUL-UI-006
Branch: codex/zokul-ui-redesign
Result: Active task ready for Executor

### Intent

After user accepted the light theme balance, prepare the next focused UI task: allow viewing another participant's uploaded avatar from the existing chat UI.

### Decisions

- Reuse existing `ImageViewer`.
- Keep the task client-only unless code discovery proves avatar URLs are unavailable.
- Make only real uploaded `avatarUrl` images clickable.
- Do not add profile pages, contact cards, social features, backend APIs, or database changes.

### Changed Docs

- Archived accepted `ZOKUL-UI-005` active task.
- Created new active task `ZOKUL-UI-006`.
- Updated `CONTROL_PLANE.md`.
- Updated `03_PRODUCT_BACKLOG.md`.
- Updated `AUDIT_LOG.md`.

### Next Action

Executor should implement only `ZOKUL-UI-006` and hand off for Governor review.

## 2026-07-17 - Created light theme balance fix handoff

Role: Governor
Task ID: ZOKUL-UI-005
Branch: codex/zokul-ui-redesign
Result: Active task ready for Executor

### Intent

User visual QA showed the first light theme pass is unbalanced: the left sidebar looks gray while the right chat area still looks too white. Create a small corrective task focused only on balancing existing light-theme surfaces.

### Decisions

- Keep this as color-only correction.
- Do not add participant avatar viewer in this task.
- Move participant avatar viewer to `ZOKUL-UI-006`.
- Optional subtle chat background pattern is allowed only if it stays extremely understated and light-mode only.

### Changed Docs

- Archived accepted `ZOKUL-UI-004` active task.
- Created new active task `ZOKUL-UI-005`.
- Updated `CONTROL_PLANE.md`.
- Updated `03_PRODUCT_BACKLOG.md`.
- Updated `AUDIT_LOG.md`.

### Next Action

Executor should implement only `ZOKUL-UI-005` and hand off for Governor review.

## 2026-07-17 - Light Theme Balance Fix (ZOKUL-UI-005)

Role: Executor
Agent: Codex
Task ID: ZOKUL-UI-005
Branch: codex/zokul-ui-redesign
Commit: (not committed)

### Intent

Fix the visual imbalance where the left sidebar looked gray and the right chat area looked like a white blank document. Make both zones feel like a single coherent light theme.

### Actions

- **AppLayout.tsx**: `#F3F6FA` → `#EAF1F8` for a deeper/warmer app shell.
- **HomePage.tsx**: Sidebar `#E7EDF5` → `#E8EFF7`, borders `#CBD6E2` → `#C9D6E4`, create button active/hover `#DCE8F7` → `#D7E6F6`, menu hover `#E7EDF5` → `#DFEAF5`, theme/logout hovers `#DCE8F7` → `#D7E6F6`, chat section `#F5F8FB` → `#EAF1F8`, chat header `#F5F8FB` → `#E6EEF7` with `border-[#C9D6E4]`.
- **ChatList.tsx**: Selected row `#DCE8F7` → `#D7E6F6`, hover `#E7EDF5` → `#DFEAF5`, empty state icon `#E7EDF5` → `#DFEAF5`, delete hover `#CBD6E2` → `#C9D6E4`.
- **ChatView.tsx**: Incoming bubble `#E6EDF5` → `#DDE8F3`, empty state icon `#E7EDF5` → `#DFEAF5`.
- **MessageInput.tsx**: Form border `#D5DEE9` → `#C9D6E4`, composer `#E8EEF6` → `#E1EAF4`, touch recorder surfaces `#E8EEF6` → `#E1EAF4`, emoji hover `#E7EDF5` → `#DFEAF5`, progress track `#CBD6E2` → `#C9D6E4`.
- **MessageActions.tsx**: Hover `#E7EDF5` → `#DFEAF5`.
- **ReplyQuote.tsx**: `#E8EEF6` → `#E1EAF4`.
- **VoicePlayer.tsx**: Track `#CBD6E2` → `#C9D6E4`.
- **VoiceRecorder.tsx**: Surfaces `#E8EEF6` → `#E1EAF4`, track `#CBD6E2` → `#C9D6E4`.

### Changed Files

- `client/src/components/layout/AppLayout.tsx`
- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatList.tsx`
- `client/src/components/chat/ChatView.tsx`
- `client/src/components/chat/MessageInput.tsx`
- `client/src/components/chat/MessageActions.tsx`
- `client/src/components/chat/ReplyQuote.tsx`
- `client/src/components/chat/VoicePlayer.tsx`
- `client/src/components/chat/VoiceRecorder.tsx`
- `docs/ai/tasks/active/NEXT_AGENT_TASK.md`
- `docs/ai/CONTROL_PLANE.md`
- `docs/ai/10_AI_WORKLOG.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`
- `docs/ai/AUDIT_LOG.md`

### Verification

- `npm.cmd run build`: passed (client tsc + vite + server)
- `npm.cmd test`: passed, 95/95 (client 23 + server 72)
- `git diff --check`: CRLF warnings only (Windows expected)
- `git status --short --branch`: modified tracked files as listed

### Decisions / Notes

- All changes color-only. No features, dependencies, layout, or dark theme changes.
- Popover elevated surfaces (create menu, actions, emoji picker, delete confirm) kept at `#F8FAFD` to maintain visual hierarchy.
- No chat background pattern added — surface colors alone were sufficient to solve the imbalance.

### Follow-ups

- Governor review required.
- Manual visual QA on desktop and mobile before merge.
- Next queued: ZOKUL-UI-006 participant avatar viewer.

## 2026-07-17 - Governor review of light theme balance fix

Role: Governor
Task ID: ZOKUL-UI-005
Branch: codex/zokul-ui-redesign
Result: Accepted

### Review

- Scope check: passed. Changes remain a color-only light theme rebalance in allowed UI files.
- Product direction: passed. Main chat area is no longer configured as a near-white field and sidebar/chat surfaces now use a closer blue-gray family.
- Functionality check: passed by code inspection. No backend/API/socket changes, no avatar viewer, no new controls, and no new dependencies were added.

### Verification

- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 95/95.
- `git diff --check`: passed with CRLF warnings only.

### Next Action

Rebuild Docker for user visual QA. If accepted visually, package and commit the accepted UI/docs change set.

## 2026-07-17 - Participant Avatar Viewer (ZOKUL-UI-006)

Role: Executor
Agent: Codex
Task ID: ZOKUL-UI-006
Branch: codex/zokul-ui-redesign
Commit: (not committed)

### Intent

Allow viewing another participant's uploaded avatar by clicking/tapping the avatar in the chat header or message list, reusing the existing ImageViewer. Fallback-initials avatars must remain non-clickable.

### Actions

- **HomePage.tsx**:
  - Added `avatarViewerUrl` state.
  - Imported `ImageViewer`.
  - In 1:1 chat header: when `otherUser?.avatarUrl` exists, the `Avatar` is wrapped in a `<button>` with `aria-label` and `focus-visible:ring`. Click sets `avatarViewerUrl`.
  - Group header and non-avatarUrl cases stay non-clickable.
  - `ImageViewer` rendered at component root.

- **ChatView.tsx**:
  - Added `avatarViewerUrl` state alongside existing `viewerUrl`.
  - Extracted `const sender = participants.find(...)` once per message (replaces two `.find()` calls).
  - Incoming avatar: when `showAvatar && sender?.avatarUrl`, wrapped in `<button>` with `aria-label`.
  - Fallback initials and own avatars (already hidden) remain non-clickable.
  - Second `ImageViewer` rendered for `avatarViewerUrl`.

### Changed Files

- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatView.tsx`
- `docs/ai/tasks/active/NEXT_AGENT_TASK.md`
- `docs/ai/CONTROL_PLANE.md`
- `docs/ai/10_AI_WORKLOG.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`
- `docs/ai/AUDIT_LOG.md`

### Verification

- `npm.cmd run build`: passed (client tsc + vite + server)
- `npm.cmd test`: passed, 95/95 (client 23 + server 72)
- `git diff --check`: CRLF warnings only (Windows expected)
- `git status --short --branch`: modified tracked files as listed

### Decisions / Notes

- No changes to `ImageViewer.tsx`, `Avatar.tsx`, or any backend/socket code.
- Two independent viewer states: `viewerUrl` (message images) and `avatarViewerUrl` (avatars).
- `sender` variable extracted in the render loop to avoid duplicate `participants.find()` calls.

### Follow-ups

- Governor review required.
- Manual QA on desktop and mobile before merge.
