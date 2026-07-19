# Next Agent Task: ZOKUL-NET-001 - Cloudflare Tunnel as primary ingress (bypass provider block)

Protocol version: 1.0
Task type: implementation
Execution owner: current agent
Created by: project-governor
State required before execution: Ready for Execution

## Goal

Make `https://zokul.zhichkin.space` reachable WITHOUT VPN via Cloudflare Tunnel, bypassing the provider's block of the public IP `151.243.169.150:443`. Keep the direct 443 ingress as a fallback (works with VPN).

## Current State

- Provider blocks outbound TLS to `151.243.169.150:443` (curl from client without VPN: `Connection was reset` on domain, `Timed out` on raw IP). With VPN the site works. DNS resolves correctly to `151.243.169.150`.
- Let's Encrypt cert is valid (CN=zokul.zhichkin.space, expires 2026-10-10) and served by nginx via `./ssl:/etc/nginx/ssl:ro` mount in the `client` service.
- `cloudflared` is already installed on the server.
- `docker-compose.prod.yml` exists; `client` exposes `80:80`, `443:443`, `8080:8080`.

## Allowed Files

- `docker-compose.prod.yml`
- `docs/DEPLOY_GUIDE.md`
- `docs/CONTROL_PLANE.md`
- `docs/AI_WORKLOG.md`

## Forbidden Files

- `client/sw.ts`
- `client/src/**`
- `server/**`
- `ssl/`
- `.env`

## Must Do

- [ ] Add a `tunnel` service to `docker-compose.prod.yml` using `cloudflare/cloudflared:latest` and the command `tunnel --no-autoupdate run --token ${CF_TUNNEL_TOKEN}`.
- [ ] The tunnel service must `depends_on: client`.
- [ ] Add a Cloudflare Tunnel section to `docs/DEPLOY_GUIDE.md` with exact UI steps (Zero Trust -> Tunnels -> Create, copy token, add Public Hostname `zokul.zhichkin.space` -> `https://localhost:443`, DNS auto-CNAME).
- [ ] Document that the tunnel token is stored in server `.env` as `CF_TUNNEL_TOKEN` (already preserved, never committed).
- [ ] Update `CONTROL_PLANE.md` and `AI_WORKLOG.md`.

## Must Not Do

- [ ] Do not change application code, `sw.ts`, server, or SSL files.
- [ ] Do not remove the direct `443` ingress (keep as VPN fallback).
- [ ] Do not commit `.env` or any tunnel token.

## Acceptance Criteria

- [ ] `docker-compose.prod.yml` contains a `tunnel` service referencing `${CF_TUNNEL_TOKEN}`.
- [ ] After user creates the tunnel in Cloudflare UI and runs `docker compose up -d tunnel` with the token in `.env`, `curl https://zokul.zhichkin.space` from a client WITHOUT VPN returns HTTP 200.
- [ ] Direct `443` ingress still works WITH VPN.
- [ ] `npm run build` and `npm test` are unaffected (no source changes).

## Test Requirements

| Type | Required | Scope |
| --- | --- | --- |
| Manual | yes | User creates tunnel in CF UI, starts service, verifies `curl https://zokul.zhichkin.space` without VPN returns 200 |
| Build | no | No source code changed |
| Unit | no | No source code changed |

## Verification Commands

| Command | Required | Expected |
| --- | --- | --- |
| `docker compose -f docker-compose.prod.yml config` | yes | Valid compose file, `tunnel` service present |
| `curl -s -o /dev/null -w "%{http_code}" https://zokul.zhichkin.space` (user, no VPN) | yes | 200 |

## Documentation Updates Required

- [ ] `docs/DEPLOY_GUIDE.md`
- [ ] `docs/CONTROL_PLANE.md`
- [ ] `docs/AI_WORKLOG.md`
- [ ] Update this task with Execution Result

## Stop Conditions

- Stop if `cloudflared` docker image cannot be pulled in the server network (fallback: systemd `cloudflared service install`).
- Stop if Cloudflare account/domain is unavailable (user must provide).

## Notes

- Tunnel target is `https://localhost:443` on the server (nginx with valid certbot cert). If Cloudflare rejects the cert, add `originRequest: noTLSVerify: true` (local hop only, safe).
- Keep direct 443 open as VPN fallback.

## Execution Result

Status: Not started
