# Definition Of Done

Last reviewed: 2026-07-17
Source commit: 96d5818

## Universal DoD

- [ ] Scope matches active task.
- [ ] Must Do items are complete.
- [ ] Must Not Do items were avoided.
- [ ] No forbidden files included.
- [ ] Relevant tests added or updated.
- [ ] Required verification commands passed or failure is documented.
- [ ] Worklog updated.
- [ ] Active task execution result updated.
- [ ] Backlog status updated if required.
- [ ] No unrelated refactor.
- [ ] Change requests are resolved or reported as blockers.

## Change Types

### security

- [ ] Permission/auth boundaries reviewed.
- [ ] Negative tests included where practical.
- [ ] Secrets not exposed.

### bugfix

- [ ] Regression test added where practical.
- [ ] Existing behavior preserved outside bug scope.

### feature

- [ ] Existing UX/API contracts preserved unless task says otherwise.
- [ ] Manual smoke path documented.

### design

- [ ] No UI controls for unavailable features.
- [ ] Desktop and mobile checked when possible.
- [ ] No text overlap/clipping.

### docs

- [ ] Links and source-of-truth order remain correct.
- [ ] Docs describe actual code or mark planned work clearly.

### infra

- [ ] Rollback/deploy impact documented.
- [ ] Approval gates checked.

## Risk Levels

Low:

- Task-specific verification is enough.

Medium:

- Build/test or equivalent verification passes.
- Relevant tests exist.
- Governor review required.

High:

- Rollback notes exist.
- Manual QA or explicit "not run" reason recorded.
- No push/deploy without explicit approval.

## Acceptance Rule

Executor may mark work as `Implemented`.

Only Governor may mark work as `Accepted`.
