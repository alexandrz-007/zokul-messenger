# NEXT_AGENT_TASK: Participant Avatar Viewer

Task ID: ZOKUL-UI-006
Status: Review
Created by: Governor
Assigned role: Executor
Recommended branch: current working branch `codex/zokul-ui-redesign`
Change type: feature
Risk level: Medium
Confidence: High

## Executive Summary

Add a small, existing-data UI improvement: a user should be able to view another participant's uploaded avatar from the chat interface. Reuse the existing image viewer pattern instead of creating a new profile system.

This task must stay narrow. It should only make real uploaded avatar images viewable. Fallback initials avatars should not pretend to be viewable images.

## User Direction

User requested the ability to view another participant's avatar. This was intentionally deferred until after the light theme tasks. Now `ZOKUL-UI-005` is accepted, so this is the next focused task.

## Must Do

- Allow opening another user's uploaded avatar image from the existing chat UI.
- Reuse existing `ImageViewer` where practical.
- Make the chat header avatar clickable only when a real `avatarUrl` exists.
- Make message-row participant avatars clickable only when a real `avatarUrl` exists.
- Keep fallback initials avatars non-clickable or visually normal.
- Preserve current chat header, message layout, and avatar display.
- Add accessible labels/titles for clickable avatars.
- Keep desktop and mobile behavior usable.

## Must Not Do

- Do not add profile pages.
- Do not add social features, bios, usernames, friend system, or contact cards.
- Do not allow editing another user's avatar.
- Do not add backend/API/database/socket changes unless code discovery proves avatar URLs are unavailable on the client.
- Do not change upload logic.
- Do not change message/image viewer behavior for regular chat images except for safe reuse.
- Do not add dependencies.
- Do not redesign the UI.
- Do not touch auth screens.
- Do not implement read receipts in this task.

## Context

Relevant code discovered:

- `client/src/components/chat/ChatView.tsx` already imports and uses `ImageViewer` for message images.
- `ChatView.tsx` renders participant avatars in the message list using `participants.find(...).avatarUrl`.
- `client/src/components/HomePage.tsx` renders the selected chat header avatar and can access `otherUser?.avatarUrl` for one-to-one chats.
- Group chats currently show a group/fallback avatar and should not require a group avatar viewer in this task.

Expected behavior:

- In a one-to-one chat, clicking/tapping the other user's header avatar opens their uploaded avatar in the existing image viewer.
- In the message list, clicking/tapping another participant's avatar opens that participant's uploaded avatar.
- If there is no uploaded avatar URL, nothing opens and cursor/focus style should not imply it is clickable.

## Required Reading

- `docs/ai/00_README_FOR_AGENTS.md`
- `docs/ai/CONTROL_PLANE.md`
- `docs/ai/12_DEFINITION_OF_DONE.md`
- `docs/ai/gates/frontend-ui.md`
- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatView.tsx`
- `client/src/components/chat/ImageViewer.tsx`
- `client/src/components/common/Avatar.tsx`
- relevant type definitions under `client/src/types/` or `client/src/types.ts` if present

## Scope

Included:

- Click/tap to view existing participant avatar images.
- Minimal state needed to hold the avatar URL being viewed.
- Reuse of existing `ImageViewer`.
- Cursor/focus/title/aria labels only for clickable avatars.
- Small class-only polish for clickable avatar hover/focus state if needed.
- Docs updates required by protocol.

Out of scope:

- Backend/API/database/socket changes.
- Profile pages or contact cards.
- Group avatar upload/viewer.
- Viewing fallback initials as generated images.
- Message image viewer redesign.
- Light/dark theme redesign.
- Read receipts.

## Allowed Files

- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatView.tsx`
- `client/src/components/chat/ImageViewer.tsx` only if a tiny accessibility prop/class improvement is needed
- `client/src/components/common/Avatar.tsx` only if a tiny className/accessibility extension is clearly simpler than wrapping externally
- `docs/ai/10_AI_WORKLOG.md`
- `docs/ai/tasks/active/NEXT_AGENT_TASK.md`
- `docs/ai/CONTROL_PLANE.md`
- `docs/ai/03_PRODUCT_BACKLOG.md`
- `docs/ai/AUDIT_LOG.md`

## Forbidden Files

- Server files
- Docker/deployment files
- Database/migration files
- Auth components
- Upload service/API files
- Package/dependency files
- New component files unless a change request is approved
- Theme/light redesign files outside the allowed files

## Implementation Instructions

1. Inspect `ImageViewer` and reuse it instead of building a new modal.
2. In `HomePage.tsx`, add local state for the viewed header avatar URL if needed.
3. For one-to-one chats, derive `otherUser?.avatarUrl`.
4. Wrap the chat header `Avatar` in a button only when `otherUser?.avatarUrl` exists.
5. Do not make group/fallback header avatars clickable.
6. In `ChatView.tsx`, for `showAvatar` message avatars:
   - find the sender once per rendered message;
   - if `sender.avatarUrl` exists and `sender.id !== currentUserId`, render it as a clickable button that opens `ImageViewer`;
   - otherwise render the existing `Avatar` normally.
7. Ensure clickable avatar controls have:
   - `type="button"`;
   - `aria-label` like `View <name> avatar`;
   - a visible hover/focus state that does not change layout.
8. Keep existing image-message viewer behavior intact.
9. Avoid duplicating expensive `participants.find(...)` calls more than necessary inside the render loop.
10. Update worklog and task execution result with files changed and verification results.

## Tests To Add Or Update

Automated tests are optional. Add focused tests only if the existing test setup makes it simple. Do not add broad snapshots.

Suggested manual QA is required:

- One-to-one chat with uploaded avatar: header avatar opens viewer.
- One-to-one chat without uploaded avatar: header avatar is not clickable.
- Incoming message avatar with uploaded avatar opens viewer.
- Incoming message avatar without uploaded avatar remains normal.
- Own avatar in message list is not made clickable by this task.
- Existing message image click/viewer still works.
- Escape/click close behavior of `ImageViewer` still works.

## Verification Commands

```powershell
npm.cmd run build
npm.cmd test
git diff --check
git status --short --branch
```

## Acceptance Criteria

- [ ] Uploaded avatar of another user can be opened from the one-to-one chat header.
- [ ] Uploaded avatar of another sender can be opened from visible message avatars.
- [ ] Fallback initials avatars are not presented as clickable image viewers.
- [ ] Existing image viewer behavior for message images is not broken.
- [ ] No backend/API/database/dependency changes are made.
- [ ] No new profile/social feature is added.
- [ ] Build/tests/diff checks pass or failures are documented.
- [ ] Worklog and active task execution result are updated.

## Definition Of Done

- Follow `docs/ai/12_DEFINITION_OF_DONE.md`.
- Apply `docs/ai/gates/frontend-ui.md`.
- Governor review required before packaging/commit.

## Execution Result

Status: Implemented — ready for Governor review.

### Changes

**HomePage.tsx** (`client/src/components/HomePage.tsx`):
- Added `avatarViewerUrl` state (`string | null`).
- Imported `ImageViewer` from `./chat/ImageViewer`.
- In 1:1 chat header: when `otherUser?.avatarUrl` exists, the `<Avatar>` is wrapped in a `<button type="button">` with `aria-label="View {name} avatar"` and `focus-visible:ring-2` focus style. Click sets `avatarViewerUrl` and opens `ImageViewer`.
- Group header and avatars without a real `avatarUrl` remain non-clickable.
- `ImageViewer` rendered conditionally at the end of the component tree.

**ChatView.tsx** (`client/src/components/chat/ChatView.tsx`):
- Added `avatarViewerUrl` state alongside existing `viewerUrl`.
- Inside the message render loop: `const sender = participants.find(...)` extracted once per iteration (replaces duplicate `.find()` calls).
- Incoming avatar: when `showAvatar && sender?.avatarUrl`, wrapped in `<button>` with `aria-label`. Fallback initials remain non-clickable.
- Own message avatars are already hidden (`isMine ? 'hidden' : ''`) — untouched.
- `ImageViewer` for `avatarViewerUrl` rendered alongside existing `viewerUrl` ImageViewer — two independent viewers.

### Files Changed
- `client/src/components/HomePage.tsx`
- `client/src/components/chat/ChatView.tsx`

### Verification
- `npm.cmd run build`: passed (client tsc + vite + server)
- `npm.cmd test`: passed, 95/95 (client 23 + server 72)
- `git diff --check`: CRLF warnings only (Windows expected)
- `git status --short --branch`: HomePage.tsx + ChatView.tsx modified

### Manual QA Status
Not performed. Recommended checks:
1. 1:1 chat with uploaded avatar: header avatar opens ImageViewer
2. 1:1 chat without uploaded avatar: header avatar not clickable
3. Incoming message avatar with real URL opens ImageViewer
4. Incoming message avatar without URL: not clickable, shows initials normally
5. Own message avatars in list: not clickable (hidden from view)
6. Group chat header avatar: not clickable
7. Existing message image click/viewer still works
8. Escape/click-close on ImageViewer still works
9. No regression in dark mode

## Change Request Rule

If implementation requires touching files outside Allowed Files, adding backend support, changing upload logic, or creating a profile/contact-card feature, stop and add `docs/ai/CHANGE_REQUESTS.md`.

## Worklog Requirements

Update `docs/ai/10_AI_WORKLOG.md` with:

- task ID and branch;
- changed files;
- implementation summary;
- verification command results;
- manual QA status or not-run reason;
- follow-ups.

## Final Report Format

Report:

- changed files;
- exact behavior added;
- build/test/diff results;
- known risks/TODOs;
- whether Docker rebuild is needed for user verification.

## Governor Review Result

Status: Accepted.

Review date: 2026-07-17

### Findings

- No blocking findings.
- Scope stayed within `ZOKUL-UI-006`: client-only participant avatar viewing using existing `ImageViewer`.
- No out-of-scope profile/social/backend work was added.

### Verification

- `npm.cmd run build`: passed.
- `npm.cmd test`: passed, 95/95.
- `git diff --check`: passed with CRLF warnings only.

### Next Step

Docker rebuild and user visual QA before packaging/commit.
