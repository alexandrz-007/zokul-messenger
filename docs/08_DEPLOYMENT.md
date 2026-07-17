# Deployment

Last reviewed: 2026-07-17
Source commit: 96d5818

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

## Release Rules

- Do not push without explicit user approval.
- Do not deploy without explicit user approval.
- Do not touch `production` without explicit user approval.
- Use `14_RELEASE_PROTOCOL.md` before release.

## Scaling Notes

Current stack can support growth with tuning, but future production scale should consider:

- object storage/CDN for uploads;
- PgBouncer/read replicas/partitioning;
- Redis cluster or alternative event bus;
- background workers for push/media;
- observability stack.
