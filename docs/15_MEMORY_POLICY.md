# AI Memory Policy

Last reviewed: 2026-07-17
Source commit: 96d5818

## Active Memory

Keep active docs concise and current.

Active docs include:

- `00_README_FOR_AGENTS.md`
- `CONTROL_PLANE.md`
- `11_PROJECT_HEALTH.md`
- current backlogs
- active task

## Archive Memory

Archive completed reviewed tasks in:

```text
docs/tasks/archive/
```

Do not read archives by default.

## Documentation Layout

Use one canonical documentation tree:

```text
docs/
```

Do not recreate a nested `docs/ai` folder. Agent protocol files, gates, prompts, active tasks, and archived tasks all live directly under `docs/`.

## Staleness

Important docs include:

```text
Last reviewed:
Source commit:
```

If `Source commit` is far behind current `HEAD`, Governor should check for drift.

## Architecture Drift

Governor should periodically verify:

- documented services exist;
- diagrams match actual data flows;
- planned features are marked `Planned`;
- deleted files are not referenced as active source;
- generated files are not treated as canonical source.

## Superseded Content

Do not rewrite history. Mark old decisions as `Superseded` and add a new decision.
