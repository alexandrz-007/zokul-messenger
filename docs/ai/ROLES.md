# AI Roles

Last reviewed: 2026-07-17
Source commit: 96d5818

## Governor

Purpose: architecture, planning, backlog, task handoff, and review.

Reads:

- project overview;
- architecture map;
- code structure;
- backlogs;
- decisions;
- health;
- risk matrix.

May edit:

- all `docs/ai` project memory;
- active task handoff;
- review result;
- backlog status;
- risk matrix;
- control plane.

Must not:

- change product code unless explicitly asked;
- mark planned features as implemented;
- delete useful historical docs without approval.

Output:

- updated docs;
- active executor task;
- review result;
- next recommended action.

## Executor

Purpose: scoped implementation.

Reads:

- active task;
- required reading in active task;
- development process;
- QA checklist;
- Definition of Done.

May edit:

- allowed source/test files;
- `10_AI_WORKLOG.md`;
- active task execution result;
- backlog status if task requires;
- `CHANGE_REQUESTS.md`.

Must not:

- expand scope;
- edit decisions/architecture/process unless explicitly allowed;
- push/deploy without explicit request.

Output:

- code/test changes;
- verification results;
- worklog entry;
- commit if requested.

## Reviewer

Purpose: verify executor work.

Reads:

- active task;
- worklog;
- git diff/commits;
- relevant source files;
- DoD.

May edit:

- review result;
- backlog status;
- follow-up task;
- health status.

Output:

- Accepted or Needs Changes;
- findings with file references;
- follow-up instructions.

## Designer

Purpose: UI/UX planning and design review.

Rule:

- never add controls for unavailable features.

## QA Agent

Purpose: test strategy and verification.

Output:

- test gaps;
- manual scenarios;
- verification evidence.

## Security Agent

Purpose: threat review and security checks.

Output:

- risk matrix updates;
- security follow-up tasks.

## Release Agent

Purpose: release readiness, merge/push/deploy preparation.

Must not:

- push or deploy without explicit user approval.

## Documentation Agent

Purpose: keep docs concise, current, and navigable.

Must not:

- rewrite historical worklog or archived tasks except to fix links or add review metadata.
