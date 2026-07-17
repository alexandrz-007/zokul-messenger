# Risk Matrix

Last reviewed: 2026-07-17
Source commit: 96d5818

| Area | Risk | Impact | Likelihood | Owner | Mitigation | Status |
|---|---|---:|---:|---|---|---|
| Realtime | Socket handlers may lack true integration tests | Medium | Medium | Governor/Executor | Add real Socket.IO integration tests | Open |
| Build hygiene | TypeScript/Vite generated files appear in working tree | Medium | High | Governor/Executor | Decide ignore/remove/tracking policy | Open |
| Database | Runtime migrate function may drift as schema grows | Medium | Medium | Governor | Follow migration policy and plan versioned migrations | Open |
| Uploads | Audio validation is MIME-based only | Medium | Medium | Security Agent | Consider content sniffing or stricter audio handling | Open |
| Media storage | Local uploads do not scale well | Medium | Medium | Governor | Plan S3/R2/MinIO and CDN when usage grows | Planned |
| Deployment | Production branch can be accidentally touched | High | Low | Release Agent | Human approval gate | Controlled |
| Docs | Legacy docs and new `docs/ai` can diverge | Medium | Medium | Documentation Agent | Prefer `docs/ai`; mark legacy docs as source material | Open |
