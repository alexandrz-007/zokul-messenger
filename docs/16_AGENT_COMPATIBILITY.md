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

Hard rule:

- when the owner asks to work by protocol, this role prepares the handoff and stops;
- it does not implement the handoff unless the owner explicitly assigns execution to the current agent.

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
- do not execute if the active task is missing `Execution owner: current agent` and the user did not explicitly assign this agent to implement.

## Human Owner

Approves:

- push;
- production;
- deployment;
- destructive actions;
- major architecture direction;
- paid/external service adoption.
