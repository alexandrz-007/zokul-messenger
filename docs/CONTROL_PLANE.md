# Control Plane

Protocol version: 1.0
Mode: standard
State: Ready for Execution
Active task: ZOKUL-NET-001
Active review: None
Owner: project-executor
Last updated: 2026-07-19

## Current Focus

ZOKUL-NET-001: Cloudflare Tunnel as primary ingress (bypass provider block of public IP 151.243.169.150:443). Direct 443 kept as VPN fallback.

## Secondary incident (2026-07-19): SSL cert mismatch on direct IP — RESOLVED

- Symptom: Firefox "potential security risk" / HSTS screen; without VPN browser hung on loading.
- Root cause: `~/zokul/ssl/fullchain.pem` contained a self-signed `CN=localhost` cert (notAfter Jul 20), not the Let's Encrypt cert.
- Resolution: copied `/etc/letsencrypt/live/zokul.zhichkin.space/{fullchain,privkey}.pem` into `~/zokul/ssl/`, restarted `client`. Verified `CN = zokul.zhichkin.space`, notAfter Oct 10 2026.

## Next Required Action

Executor implements ZOKUL-NET-001: add `tunnel` service to docker-compose.prod.yml + DEPLOY_GUIDE tunnel section. User creates tunnel in Cloudflare UI, adds token to server .env, runs `docker compose up -d tunnel`, verifies `curl https://zokul.zhichkin.space` returns 200 without VPN.

## Blockers

- None. Tunnel token requires user action in Cloudflare UI.
