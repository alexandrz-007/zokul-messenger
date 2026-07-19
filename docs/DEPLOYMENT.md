# Deployment

Last reviewed: 2026-07-19
Source commit: 9f54824

## Local Development

Root:

```powershell
npm.cmd run dev
```

Server expects environment variables from `.env` or shell:

- `DATABASE_URL`
- `JWT_SECRET`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- optional `PORT`
- optional `CORS_ORIGIN`
- optional `REDIS_URL`
- optional `UPLOAD_DIR`

## Production Compose

`docker-compose.prod.yml` defines:

- `postgres` with persistent `pgdata`;
- `redis` with persistent `redisdata`;
- `server` Node API/Socket.IO container;
- `client` nginx/static container exposing 80/443;
- `uploads` volume mounted into server;
- SSL volume mounted into client.

## CI

`.github/workflows/ci.yml`:

- runs on push/PR to `master`;
- server job uses Postgres and Redis services;
- server runs `npm ci`, `npx tsc --noEmit`, and Jest;
- client job runs `npm ci` and `npx tsc --noEmit`.

Note:

- CI currently type-checks client but does not run client Vitest in the workflow.

## Release Protocol

### Release Ready Criteria

- [ ] Active task Accepted by Governor.
- [ ] Working tree clean or only approved files present.
- [ ] Build passed.
- [ ] Tests passed.
- [ ] Health dashboard updated.
- [ ] Release notes prepared if user-facing.
- [ ] No unresolved high-risk change requests.
- [ ] Target branch confirmed.

### Release Steps

1. Read `CONTROL_PLANE.md`.
2. Read `PROJECT_HEALTH.md`.
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

### Approval Gates

Require explicit user approval for:

- pushing to GitHub;
- changing `production`;
- deployment;
- destructive file operations;
- destructive DB migrations;
- force push/reset;
- deleting user data or uploads;
- adding paid/external services.

## Scaling Notes

Current stack can support growth with tuning, but future production scale should consider:

- object storage/CDN for uploads;
- PgBouncer/read replicas/partitioning;
- Redis cluster or alternative event bus;
- background workers for push/media;
- observability stack.

## Production Release Pipeline

The real, currently-used flow (replaces the generic `npm run build && push` sketch above):

1. On `master` (clean, with the accepted task merged), run the release packer:

   ```powershell
   cd D:\zokul
   powershell -ExecutionPolicy Bypass -File scripts/prepare-release.ps1 -SkipChecks
   ```

   - Copies the tree into `D:\zokul-deploy`, preserving `ssl/` and `.env`.
   - `-SkipChecks` is used because `npm.cmd` emits benign stderr that would otherwise
     abort the script's check phase.

2. In the deploy repo, commit and push `master` to the GitHub `production` branch:

   ```powershell
   cd D:\zokul-deploy
   git add -A
   git commit -m "Deploy: <short summary>"
   git push origin master:production
   ```

3. On the server (`~/zokul`), apply and rebuild (safe because `ssl/` and `.env` are
   git-ignored / preserved):

   ```bash
   cd ~/zokul
   git fetch origin
   git reset --hard origin/production
   docker compose -f docker-compose.prod.yml up -d --build
   ```

   - Before `reset --hard`, confirm `ssl`/`.env` are untracked-safe:
     `git check-ignore ssl .env` (both must print).
   - After up: `curl -s https://zokul.zhichkin.space/api/health`.

Approval gates (from Release Protocol above) still apply: pushing to GitHub, changing
`production`, and deployment all require explicit user approval.

## PWA Strategy

- Production default is the **killer** service worker: `client/sw.ts` is `sw.kill.ts`
  (network-only fetch, deletes caches, unregisters). This was deployed as the emergency
  fix for Safari PWA cache/drift issues.
- A proper PWA lives on branch **`feature/pwa-proper`**: `sw.kill.ts` / `sw.pwa.ts`
  split + `scripts/select-sw.mjs` + npm scripts `sw:kill` / `sw:proper` /
  `build:kill` / `build:proper`. It is **NOT merged** to master/production.
- Do **NOT** merge `feature/pwa-proper` until manual Safari/iPhone stability is confirmed.
- Cloudflare tunnel (ZOKUL-NET-001) is **OFF** per user; production uses direct 443
  + killer PWA only.

