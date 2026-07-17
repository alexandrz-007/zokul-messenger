# Decisions

Last reviewed: 2026-07-17
Source commit: 96d5818

## ADR-001 Use A Modular Monolith For Current Stage

Date: 2026-07-17
Status: Accepted

Decision:

Keep backend as a modular monolith with routes, controllers, services, models, and socket modules.

Reason:

The project is a messenger MVP/early production candidate. A modular monolith is easier to develop and deploy than premature microservices while still allowing future extraction.

Consequences:

- Keep module boundaries clear.
- Avoid adding microservices until metrics or operational needs justify them.

## ADR-002 Use Markdown/Mermaid As Architecture Source Of Truth

Date: 2026-07-17
Status: Accepted

Decision:

Keep architecture maps in `docs/ai/01_ARCHITECTURE_MAP.md` using Mermaid.

Reason:

Markdown lives in git and can be updated by agents. FigJam is useful for visual review but should not be the canonical source.

Consequences:

- Update Mermaid maps when architecture changes.
- External diagrams may be regenerated from docs.

## ADR-003 Split AI Work Into Governor And Executor Roles

Date: 2026-07-17
Status: Accepted

Decision:

Use `project-governor` for planning/review and `project-executor` for scoped implementation.

Reason:

This keeps strategic decisions separate from implementation and allows different tools/models to cooperate through `docs/ai`.

Consequences:

- Executor follows `NEXT_AGENT_TASK.md`.
- Governor reviews and accepts work.

## ADR-004 Production Branch Requires Explicit Approval

Date: 2026-07-17
Status: Accepted

Decision:

Do not touch `production` unless the user explicitly asks.

Reason:

`production` is a deploy/fresh code branch and should not receive documentation or experimental changes by accident.

Consequences:

- Work normally happens on `master` or `codex/*`.
- Release Agent must request approval before production push/deploy.
