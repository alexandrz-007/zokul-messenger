# Audit Log

| Time | Actor | Event | Task | Branch | Commit | Notes |
|---|---|---|---|---|---|---|
| 2026-07-17 | Executor | Implemented hardening | ZOKUL-SEC-001 | master | 7609f40 | Realtime/upload/auth/test hardening |
| 2026-07-17 | Executor | Implemented follow-up | ZOKUL-SEC-001 | master | 96d5818 | Secured chat:leave and removed unused dependency |
| 2026-07-17 | Governor | Reviewed hardening | ZOKUL-SEC-001 | master | 96d5818 | Build/test passed, 71/71 |
| 2026-07-17 | Governor | Started docs migration | ZOKUL-DOC-001 | master |  | Created `docs` protocol docs |
| 2026-07-17 | Governor | Completed docs migration draft | ZOKUL-DOC-001 | master |  | `docs` ready for review |
| 2026-07-17 | Governor | Created executor task | ZOKUL-UI-001 | master |  | UI redesign ready for executor |
| 2026-07-17 | Executor | Reverted UI redesign | ZOKUL-UI-001 | codex/zokul-ui-redesign | 7fc1392 | User reported UI became worse; client UI restored to master |
| 2026-07-17 | Governor | Restored AI task docs | ZOKUL-DOC-001 | codex/zokul-ui-redesign | 0dcceb7 | Revert had removed three docs files |
| 2026-07-17 | Executor | Hotfixed iPhone photo uploads | ZOKUL-UPLOAD-001 | codex/zokul-ui-redesign | 31a3899 | Protocol docs were updated after user correction |
| 2026-07-17 | Governor | Created executor task | ZOKUL-VOICE-001 | codex/zokul-ui-redesign |  | Voice messages ready for executor |
| 2026-07-17 | Governor | Planned follow-up task | ZOKUL-VOICE-002 | codex/zokul-ui-redesign |  | Telegram-like hold-to-record UX planned after voice MVP acceptance |
| 2026-07-17 | Governor | Reviewed executor work | ZOKUL-VOICE-002 | codex/zokul-ui-redesign | 2e1ddd6 | Needs Changes: cancel uploads risk, async touch release race, dirty package state |
| 2026-07-17 | Executor | Fixed P1 review findings | ZOKUL-VOICE-002 | codex/zokul-ui-redesign | | discardRef + pendingFinishRef/pendingCancelRef; build+test passed 95/95 |
| 2026-07-17 | Executor | Implemented sidebar polish | ZOKUL-UI-001 | codex/zokul-ui-redesign | | Avatar colors, sidebar redesign, premium chat rows; build+test passed 95/95 |
| 2026-07-17 | Executor | Implemented sidebar composition & states polish | ZOKUL-UI-002 | codex/zokul-ui-redesign | | Account header, Zokul inline, zone dividers, compact rows, left accent, fixed formatTime, polished states; build+test passed 95/95 |
| 2026-07-17 | Executor | Implemented create menu & theme toggle | ZOKUL-UI-003 | codex/zokul-ui-redesign | | Create button opens compact menu (Personal/Group), theme toggle verified; build+test passed 95/95 |
| 2026-07-17 | Governor | Accepted behavior fixes | ZOKUL-VOICE-002 | codex/zokul-ui-redesign | | Build/test passed; release packaging still required |
| 2026-07-17 | Governor | Captured product initiative | ZOKUL-ADMIN-ROADMAP | codex/zokul-ui-redesign | | Future admin panel planned as phased secure `/admin` initiative |
| 2026-07-17 | Governor | Created executor task | ZOKUL-UI-001 | codex/zokul-ui-redesign | | Sidebar-only visual polish based on approved concept |
| 2026-07-17 | Governor | Accepted executor work | ZOKUL-UI-001 | codex/zokul-ui-redesign | | Build/test passed; sidebar polish accepted with non-blocking follow-ups |
| 2026-07-17 | Governor | Created executor task | ZOKUL-UI-002 | codex/zokul-ui-redesign | | Sidebar composition and states polish after user visual review |
| 2026-07-17 | Governor | Accepted executor work | ZOKUL-UI-002 | codex/zokul-ui-redesign | | Build/test passed; sidebar composition polish accepted |
| 2026-07-17 | Governor | Created executor task | ZOKUL-UI-003 | codex/zokul-ui-redesign | | Sidebar create menu and theme toggle task |
| 2026-07-17 | Governor | Accepted executor work | ZOKUL-UI-003 | codex/zokul-ui-redesign | | Build/test passed; create menu and theme toggle accepted for Docker visual QA |
| 2026-07-17 | Governor | Hotfixed theme toggle config | ZOKUL-UI-003 | codex/zokul-ui-redesign | | Added Tailwind `darkMode: 'class'` so existing `ThemeContext` class toggle affects UI |
| 2026-07-17 | Governor | Created executor task | ZOKUL-UI-004 | codex/zokul-ui-redesign | | Soft light theme polish prepared as color-only UI task |
| 2026-07-17 | Executor | Implemented soft light theme polish | ZOKUL-UI-004 | codex/zokul-ui-redesign | | Replaced harsh white/light surfaces with calm blue-gray palette across 9 component files; build+test passed 95/95 |
| 2026-07-17 | Governor | Queued future task | ZOKUL-UI-005 | codex/zokul-ui-redesign | | Participant avatar viewer captured as separate follow-up task |
| 2026-07-17 | Governor | Accepted executor work | ZOKUL-UI-004 | codex/zokul-ui-redesign | | Build/test passed; soft light theme accepted for Docker visual QA |
| 2026-07-17 | Governor | Created executor task | ZOKUL-UI-005 | codex/zokul-ui-redesign | | Light theme balance fix prepared after user visual QA screenshot |
| 2026-07-17 | Governor | Renumbered future task | ZOKUL-UI-006 | codex/zokul-ui-redesign | | Participant avatar viewer moved after light theme balance fix |
| 2026-07-17 | Executor | Implemented light theme balance fix | ZOKUL-UI-005 | codex/zokul-ui-redesign | | Rebalanced light theme: deeper chat bg #EAF1F8, denser header/composer, aligned sidebar, unified borders; build+test passed 95/95 |
| 2026-07-17 | Governor | Accepted executor work | ZOKUL-UI-005 | codex/zokul-ui-redesign | | Build/test passed; light theme balance accepted for Docker visual QA |
| 2026-07-17 | Governor | Created executor task | ZOKUL-UI-006 | codex/zokul-ui-redesign | | Participant avatar viewer prepared with strict client-only scope |
| 2026-07-17 | Executor | Implemented participant avatar viewer | ZOKUL-UI-006 | codex/zokul-ui-redesign | | Chat header + message list avatars with real avatarUrl open ImageViewer; fallback initials non-clickable; build+test passed 95/95 |
| 2026-07-17 | Governor | Accepted executor work | ZOKUL-UI-006 | codex/zokul-ui-redesign | | Build/test passed; participant avatar viewer accepted for Docker visual QA |
| 2026-07-17 | Governor | Prepared release package | ZOKUL-RELEASE-001 | codex/zokul-ui-redesign | | `C:\zokul-deploy` prepared; runtime `ssl/` and `.env` preserved; Docker prod build passed; deploy not started |
| 2026-07-17 | Governor | Prepared public repository package | ZOKUL-PUBLIC-001 | master | | README showcase, screenshots, single `docs/` structure, generated/runtime artifacts excluded |
| 2026-07-17 | Governor | Created executor task | ZOKUL-VOICE-003 | master | | Mobile tap-to-record and safe-area polish scoped; backend/deploy forbidden |
| 2026-07-17 | Executor | Implemented mobile voice UX polish | ZOKUL-VOICE-003 | master | | Tap-to-start/tap-to-stop voice recording on touch devices; main-menu bottom safe-area padding; build/test passed |
| 2026-07-17 | Governor | Corrected AI protocol guardrails | ZOKUL-PROTOCOL-001 | master | | Added handoff barrier, execution owner requirement, and ambiguous UI-area clarification rule |
| 2026-07-17 | Release Agent | Fixed release packaging script | ZOKUL-RELEASE-002 | master | | `prepare-release.ps1` now preserves target `.git` metadata during package refresh |
| 2026-07-17 | Governor | Created executor task | ZOKUL-MOBILE-001 | master | | Real-device QA failed ZOKUL-VOICE-003; mobile layout containment and tap voice state-machine fix prepared |
| 2026-07-17 | Executor | Implemented mobile layout + voice state-machine fix | ZOKUL-MOBILE-001 | codex/zokul-ui-redesign | | overflow-x-hidden, safe-area fallbacks, bubble max-width cap, VoicePlayer w-full, voice state machine with onPointerDown; build+test passed 91/91 |
| 2026-07-17 | Governor | Reviewed ZOKUL-MOBILE-001 | ZOKUL-MOBILE-001 | codex/zokul-ui-redesign | | Needs Changes: cancel race during startup, min-h-screen conflict, index.css scope exception, docs inconsistency |
| 2026-07-17 | Executor | Fixed Governor review findings | ZOKUL-MOBILE-001 | codex/zokul-ui-redesign | | startupTokenRef for cancel race, removed min-h-screen, added index.css to Allowed Files + CHANGE_REQUESTS.md, docs alignment; build+test passed 91/91 |
| 2026-07-17 | Governor | Reviewed executor work | ZOKUL-MOBILE-001 | master | | Needs Changes: async cancel race, viewport height risk, scope exception, stale docs, device QA required |
| 2026-07-17 | Governor | Re-reviewed executor work | ZOKUL-MOBILE-001 | master | | Passed for User QA: startup token fix, min-h-screen removal, index.css scope approved; build/test passed |
| 2026-07-17 | Governor | Investigated production/mobile/push incident | ZOKUL-INC-001 | master | | Public bundle confirmed stale versus origin/production; push re-registration defect confirmed after DB reset; executor handoff created |
| 2026-07-17 | Governor | Investigated chat navigation and notification follow-up | ZOKUL-CHAT-UX-001 | master | | Nested chat-row buttons, initial-scroll state coupling, and pagination order defect confirmed; notifications observed working, so push hardening retained as a separate planned task |
| 2026-07-17 | Governor | Corrected ZOKUL-CHAT-UX-001 scope | ZOKUL-CHAT-UX-001 | master | | Removed incorrect requirement about useMessages state clearing per user correction; kept only scroll-to-bottom, nested-button fix, delete-in-header, and pagination-order scope |
| 2026-07-18 | Executor | Implemented chat UX fixes | ZOKUL-CHAT-UX-001 | master | | Nested button removed from ChatList, header actions + delete confirm added, scroll-by-chatId implemented; build+test passed; prepend order preserved per user correction |
| 2026-07-18 | Governor | Detected scroll regression, created executor task | ZOKUL-CHAT-UX-002 | master | | Scroll effect ignores loading prop — chat switch opens at top. Task handoff prepared with 2-line fix in ChatView.tsx |
| 2026-07-18 | Executor | Implemented scroll regression fix | ZOKUL-CHAT-UX-002 | master | | Added loading guard in ChatView.tsx scroll effect. Build+test passed 19/19 |
| 2026-07-19 | Governor | Created task handoff | ZOKUL-CHAT-UX-003 | master | | Scroll-to-bottom on returning to previously opened chat — reset scrolledChatRef on chatId change |
| 2026-07-19 | Auditor | Accepted | ZOKUL-CHAT-UX-003 | master | | Scroll fix verified and accepted |
| 2026-07-19 | Governor | Archived | ZOKUL-CHAT-UX-003 | master | | Task + review archived |
| 2026-07-19 | Governor | Created task handoff | ZOKUL-UX-007 | master | | Instant scroll + real-time 1-on-1 chat notification |
| 2026-07-19 | Auditor | Accepted | ZOKUL-UX-007 | master | | Reviewed by project-auditor, verdict Accepted |
| 2026-07-19 | Governor | Archived | ZOKUL-UX-007 | master | | Task + review archived after QA |
| 2026-07-19 | Governor | Created task handoff | ZOKUL-UX-008 | master | | Only show 1-on-1 chat after first message |

## Architecture Decision Records

### ADR-001 Use A Modular Monolith For Current Stage

Date: 2026-07-17
Status: Accepted

Decision: Keep backend as a modular monolith with routes, controllers, services, models, and socket modules.

Reason: The project is a messenger MVP/early production candidate. A modular monolith is easier to develop and deploy than premature microservices while still allowing future extraction.

Consequences:
- Keep module boundaries clear.
- Avoid adding microservices until metrics or operational needs justify them.

### ADR-002 Use Markdown/Mermaid As Architecture Source Of Truth

Date: 2026-07-17
Status: Accepted

Decision: Keep architecture maps in `ARCHITECTURE.md` using Mermaid.

Reason: Markdown lives in git and can be updated by agents. FigJam is useful for visual review but should not be the canonical source.

Consequences:
- Update Mermaid maps when architecture changes.
- External diagrams may be regenerated from docs.

### ADR-003 Split AI Work Into Governor And Executor Roles

Date: 2026-07-17
Status: Accepted

Decision: Use `project-governor` for planning/review and `project-executor` for scoped implementation.

Reason: This keeps strategic decisions separate from implementation and allows different tools/models to cooperate through `docs`.

Consequences:
- Executor follows `NEXT_AGENT_TASK.md`.
- Governor reviews and accepts work.

### ADR-004 Production Branch Requires Explicit Approval

Date: 2026-07-17
Status: Accepted

Decision: Do not touch `production` unless the user explicitly asks.

Reason: `production` is a deploy/fresh code branch and should not receive documentation or experimental changes by accident.

Consequences:
- Work normally happens on `master` or `codex/*`.
- Release Agent must request approval before production push/deploy.

| 2026-07-19 | Governor | Created hotfix task | ZOKUL-RATE-001 | master | - | Fix rate limit blocking auth endpoints. State: Ready for Execution.
| 2026-07-19 | Auditor | Accepted ZOKUL-RATE-001 | ZOKUL-RATE-001 | master | - | 75/75 tests pass, TypeScript clean, all AC met.
