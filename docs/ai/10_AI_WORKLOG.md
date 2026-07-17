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
