# AI Project Documentation Guide

Last reviewed: 2026-07-17
Source commit: 96d5818

This folder is the project memory for AI-assisted work on Zokul. Use it to understand the project, plan changes, execute scoped tasks, and review completed work.

## Start Here

1. Read this file.
2. Read `CONTROL_PLANE.md`.
3. Read `11_PROJECT_HEALTH.md`.
4. Continue with your role-specific reading list.

## Source Of Truth

1. Current code
2. `docs`
3. Active task file
4. Archived task files
5. External diagrams such as FigJam

If docs conflict with code, trust code and update docs.

## Roles

### Governor

Use this role for architecture, planning, backlog, task writing, and review.

Read:

1. `00_PROJECT_OVERVIEW.md`
2. `01_ARCHITECTURE_MAP.md`
3. `02_CODE_STRUCTURE.md`
4. `03_PRODUCT_BACKLOG.md`
5. `04_ENGINEERING_BACKLOG.md`
6. `09_DECISIONS.md`
7. latest entries in `10_AI_WORKLOG.md`
8. `11_PROJECT_HEALTH.md`
9. `CONTROL_PLANE.md`
10. `13_RISK_MATRIX.md`

Output:

- updated docs;
- updated backlog;
- `tasks/active/NEXT_AGENT_TASK.md`;
- review result.

### Executor

Use this role for implementation.

Read:

1. `tasks/active/NEXT_AGENT_TASK.md`
2. files listed in that task's Required Reading
3. `05_DEVELOPMENT_PROCESS.md`
4. `06_QA_CHECKLIST.md`
5. `12_DEFINITION_OF_DONE.md`
6. `CONTROL_PLANE.md`

Do not read archives unless the task asks for them.

Output:

- scoped code changes;
- tests;
- verification results;
- worklog update;
- commit if requested.

### Reviewer

Use this role after executor work.

Read:

1. `tasks/active/NEXT_AGENT_TASK.md`
2. latest `10_AI_WORKLOG.md` entry
3. git diff and commit(s)
4. relevant source files

Output:

- Accepted or Needs Changes;
- findings with file references;
- follow-up task if needed.

### Designer

Use this role for UI/UX planning or redesign.

Read:

1. `00_PROJECT_OVERVIEW.md`
2. `01_ARCHITECTURE_MAP.md`
3. UI-related backlog entries
4. screenshots or design files if provided
5. relevant frontend components

Rule:

- Do not design controls for unavailable features.

### Release Agent

Use this role only when preparing merge, push, or deploy.

Read:

1. `14_RELEASE_PROTOCOL.md`
2. `CONTROL_PLANE.md`
3. `11_PROJECT_HEALTH.md`
4. latest accepted task archive or worklog entry

Rule:

- Do not push or deploy without explicit user approval.

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
