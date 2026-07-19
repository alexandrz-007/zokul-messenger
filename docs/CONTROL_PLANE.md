# Control Plane

Protocol version: 1.0
Mode: standard
State: Accepted
Active task: PWA-EMERGENCY-001-REMEDIATION
Active review: None
Owner: project-executor
Last updated: 2026-07-19

## Current Focus

Phase 1: Emergency SW self-destruct — fix "no-response" error on API requests caused by precacheAndRoute race condition. RESOLVED.

## Secondary incident (2026-07-19): SSL cert mismatch on direct IP

- Symptom: Firefox "potential security risk" / HSTS screen; without VPN browser hung on loading.
- Root cause: `~/zokul/ssl/fullchain.pem` contained a self-signed `CN=localhost` cert (notAfter Jul 20), not the Let's Encrypt cert.
- Resolution: copied `/etc/letsencrypt/live/zokul.zhichkin.space/{fullchain,privkey}.pem` into `~/zokul/ssl/`, restarted `client`. Verified `CN = zokul.zhichkin.space`, notAfter Oct 10 2026.
- Note: `ssl/` is NOT tracked by git and `prepare-release.ps1` preserves it, so future redeploys do NOT overwrite it. No repo code change required.

## Next Required Action

User confirms site loads without VPN and without `?v=clean`. Then Phase 2 (proper PWA) can be planned.

## Blockers

- None.
