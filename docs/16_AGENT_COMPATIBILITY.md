# Agent Compatibility

Last reviewed: 2026-07-17
Source commit: 96d5818

## ChatGPT / Codex Governor

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

## OpenCode / Executor Agent

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

## Human Owner

Approves:

- push;
- production;
- deployment;
- destructive actions;
- major architecture direction;
- paid/external service adoption.
