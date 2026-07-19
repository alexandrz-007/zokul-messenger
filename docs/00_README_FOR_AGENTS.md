# AI Project Documentation Guide

Last reviewed: 2026-07-17
Source commit: 96d5818

This folder is the project memory for AI-assisted work on Zokul. Use it to understand the project, plan changes, execute scoped tasks, and review completed work.

## Start Here

1. Read this file.
2. Read `CONTROL_PLANE.md`.
3. Read `PROJECT_HEALTH.md`.
4. Continue with your role-specific reading list.

## Source Of Truth

1. Current code
2. `docs`
3. Active task file
4. Archived task files
5. External diagrams such as FigJam

If docs conflict with code, trust code and update docs.

## Protocol Mode Barrier

When the user says `по протоколу`, `по скиллу`, `создай задачу`, `дай задачу агенту`, `подготовь для другого агента`, or otherwise frames the work as AI-managed planning, the default mode is **Governor handoff only**.

In that mode:

- do not edit product code;
- create or update `tasks/active/NEXT_AGENT_TASK.md`;
- update `CONTROL_PLANE.md`, backlog, worklog, and audit as needed;
- stop after the handoff and ask for explicit execution approval.

The current agent may become Executor only after an explicit user phrase such as `реализуй сам`, `можешь кодить`, `вноси изменения в код`, or `исполняй эту задачу сам`.

If the task is an urgent narrow hotfix, the agent must explicitly label it as a hotfix exception before editing code and still update docs in the same turn.

### Governor

Purpose: architecture, planning, backlog, task handoff, and review.

Read:

1. `PROJECT_BRIEF.md`
2. `ARCHITECTURE.md`
3. `BACKLOG.md`
4. `AUDIT_LOG.md` (latest entries)
5. `PROJECT_HEALTH.md`
6. `CONTROL_PLANE.md`

Output:

- updated docs;
- updated backlog;
- `tasks/active/NEXT_AGENT_TASK.md`;
- review result.

May edit:

- all `docs` project memory;
- active task handoff;
- review result;
- backlog status;
- control plane.

Must not:

- change product code unless explicitly asked;
- mark planned features as implemented;
- delete useful historical docs without approval.

Hard stop:

- after creating an executor handoff, stop unless the user explicitly authorizes this same agent to implement it.

### Executor

Purpose: scoped implementation.

Read:

1. `tasks/active/NEXT_AGENT_TASK.md`
2. files listed in that task's Required Reading
3. `DEFINITION_OF_DONE.md`
4. `CONTROL_PLANE.md`

Required precondition:

- `CONTROL_PLANE.md` state is `Ready for Execution` or `In Execution`;
- active task has `Execution owner: current agent` or the user explicitly asked this agent to implement.

Do not read archives unless the task asks for them.

May edit:

- allowed source/test files;
- `AI_WORKLOG.md`;
- active task execution result;
- backlog status if task requires;
- `CHANGE_REQUESTS.md`.

Must not:

- expand scope;
- edit decisions/architecture/process unless explicitly allowed;
- push/deploy without explicit request.

Output:

- scoped code changes;
- tests;
- verification results;
- worklog update;
- commit if requested.

### Reviewer

Purpose: verify executor work.

Read:

1. `tasks/active/NEXT_AGENT_TASK.md`
2. latest `AI_WORKLOG.md` entry
3. git diff and commit(s)
4. relevant source files

May edit:

- review result (`reviews/active/NEXT_REVIEW.md`);
- backlog status;
- follow-up task;
- health status.

Output:

- Accepted or Needs Changes;
- findings with file references;
- follow-up task if needed.

### Designer

Purpose: UI/UX planning and design review.

Read:

1. `PROJECT_BRIEF.md`
2. `ARCHITECTURE.md`
3. UI-related backlog entries
4. screenshots or design files if provided
5. relevant frontend components

Rule:

- never add controls for unavailable features.

### QA Agent

Purpose: test strategy and verification.

Read:

1. `tasks/active/NEXT_AGENT_TASK.md`
2. affected source files
3. existing test suite

Output:

- test gaps;
- manual scenarios;
- verification evidence.

### Security Agent

Purpose: threat review and security checks.

Output:

- risk matrix updates;
- security follow-up tasks.

### Release Agent

Purpose: release readiness, merge/push/deploy preparation.

Read:

1. `DEPLOYMENT.md`
2. `CONTROL_PLANE.md`
3. `PROJECT_HEALTH.md`
4. latest accepted task archive or worklog entry

Must not:

- push or deploy without explicit user approval.

### Documentation Agent

Purpose: keep docs concise, current, and navigable.

Must not:

- rewrite historical worklog or archived tasks except to fix links or add review metadata.

## Task Files

Active task:

```text
tasks/active/NEXT_AGENT_TASK.md
```

Archive completed reviewed tasks:

```text
tasks/archive/YYYY-MM-DD-NNN-task-slug.md
```

## Reading Discipline

- Read only what your role needs.
- Prefer active task over archived tasks.
- Prefer concise current docs over old plans.
- Mark future ideas as `Planned`.
- Update this guide when docs structure changes.

## Editing Permissions

Governor may update project memory, backlogs, decisions, task handoffs, and review results.

Executor may update only the active task execution result, worklog, relevant backlog status, `CHANGE_REQUESTS.md`, and files allowed by the task.

Reviewer may update review result, worklog, backlog status, and follow-up tasks.

Release Agent may prepare release notes and checks, but must not push/deploy without explicit user approval.

If unsure whether a document may be changed, ask Governor or the user.

## Development Process

### Branch Policy

- `master`: integration branch with full code and documentation.
- `production`: deploy branch; do not touch without explicit user approval.
- `codex/*`: preferred AI feature/fix branches.

Current exception:

- hardening commits `7609f40` and `96d5818` were committed directly on local `master`.
- before pushing, verify working tree and user intent.

### Before Work

Run:

```powershell
git status --short --branch
git branch --all --verbose
git log --oneline --decorate -5
```

Then:

- read this file;
- read `CONTROL_PLANE.md`;
- identify current role;
- read active task if executing;
- do not overwrite unrelated changes.

### During Work

- Keep changes scoped to the active task.
- Use existing project patterns.
- Add/update tests for behavior changes.
- Do not mix UI, security, docs, and infra changes unless task explicitly says so.
- Create `CHANGE_REQUESTS.md` entry if scope must change.

### Handoff Barrier

If the user asks to work `по протоколу`, `по скиллу`, or asks to prepare work for another agent, the current agent must default to Governor mode:

1. create/update `docs/tasks/active/NEXT_AGENT_TASK.md`;
2. set `CONTROL_PLANE.md` to `Ready for Execution`;
3. update backlog/worklog/audit if needed;
4. stop and ask for execution approval.

Do not edit product code in Governor mode.

The same agent may implement only when one of these is true:

- user explicitly says `реализуй сам`, `можешь кодить`, `вноси изменения в код`, or equivalent;
- active task says `Execution owner: current agent`;
- the agent explicitly declares a narrow hotfix exception before code edits.

If the area is ambiguous, especially UI wording such as "нижние кнопки", "панель", "меню", or "зона", map it to exact component/file names before editing. Ask a clarification question if the mapping is not obvious.

### Before Final

Run task-specific checks and, when applicable:

```powershell
npm.cmd run build
npm.cmd test
git diff --check
git status --short
```

### Commit Rules

- Stage only intentional files.
- Do not stage `.env`, secrets, uploads, `node_modules`, `dist`, generated build cache, or unrelated docs.
- Use concise conventional commits:
  - `fix: ...`
  - `feat: ...`
  - `docs: ...`
  - `test: ...`
  - `style: ...`
  - `refactor: ...`

### Push / Deploy Rules

- Do not push without explicit user approval.
- Do not push to `production` without explicit user approval.
- Do not deploy without explicit user approval.

### Generated Files Policy

Known files to review before staging:

- `client/tsconfig.node.tsbuildinfo`
- `client/tsconfig.tsbuildinfo`
- `client/vite.config.js`

If these are generated by build, either ignore/remove from tracking in a dedicated task or keep them intentionally with a documented reason.

## Memory Policy

### Active Memory

Keep active docs concise and current.

Active docs include:

- this file
- `CONTROL_PLANE.md`
- `PROJECT_HEALTH.md`
- current backlogs
- active task

### Archive Memory

Archive completed reviewed tasks in:

```text
docs/tasks/archive/
```

Do not read archives by default.

### Documentation Layout

Use one canonical documentation tree:

```text
docs/
```

Do not recreate a nested `docs/ai` folder. Agent protocol files, gates, prompts, active tasks, and archived tasks all live directly under `docs/`.

### Staleness

Important docs include:

```text
Last reviewed:
Source commit:
```

If `Source commit` is far behind current `HEAD`, Governor should check for drift.

### Architecture Drift

Governor should periodically verify:

- documented services exist;
- diagrams match actual data flows;
- planned features are marked `Planned`;
- deleted files are not referenced as active source;
- generated files are not treated as canonical source.

### Superseded Content

Do not rewrite history. Mark old decisions as `Superseded` and add a new decision.

## Agent Compatibility

### ChatGPT / Codex Governor

Best for:

- architecture;
- planning;
- project docs;
- task handoff;
- code review;
- risk analysis.

Expected output:

- updated `docs`;
- active executor task;
- review result.

Hard rule:

- when the owner asks to work by protocol, this role prepares the handoff and stops;
- it does not implement the handoff unless the owner explicitly assigns execution to the current agent.

### OpenCode / Executor Agent

Best for:

- scoped code edits;
- tests;
- build/test verification;
- commits.

Expected input:

```text
docs/tasks/active/NEXT_AGENT_TASK.md
```

Rules:

- do not expand scope;
- update worklog;
- create change request if blocked.
- do not execute if the active task is missing `Execution owner: current agent` and the user did not explicitly assign this agent to implement.

### Human Owner

Approves:

- push;
- production;
- deployment;
- destructive actions;
- major architecture direction;
- paid/external service adoption.
