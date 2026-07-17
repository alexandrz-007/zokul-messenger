# Release Protocol

Last reviewed: 2026-07-17
Source commit: 96d5818

## Release Ready Criteria

- [ ] Active task Accepted by Governor.
- [ ] Working tree clean or only approved files present.
- [ ] Build passed.
- [ ] Tests passed.
- [ ] Health dashboard updated.
- [ ] Release notes prepared if user-facing.
- [ ] No unresolved high-risk change requests.
- [ ] Target branch confirmed.

## Release Steps

1. Read `CONTROL_PLANE.md`.
2. Read `11_PROJECT_HEALTH.md`.
3. Verify latest accepted task/worklog entry.
4. Run:

```powershell
npm.cmd run build
npm.cmd test
git status --short --branch
```

5. Confirm target branch with user.
6. Push only with explicit user approval.
7. Production deploy requires explicit user approval.

## Approval Gates

Require explicit user approval for:

- pushing to GitHub;
- changing `production`;
- deployment;
- destructive file operations;
- destructive DB migrations;
- force push/reset;
- deleting user data or uploads;
- adding paid/external services.
