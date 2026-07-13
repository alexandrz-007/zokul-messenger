# Cycle #12 — Security Hardening #2

## What was done

| # | Task | Files | Status |
|---|------|-------|--------|
| 1 | sameSite `lax` → `strict` | authController.ts | ✅ |
| 2 | Auth rate limit 100→10 | rateLimit.ts | ✅ |
| 3 | Sharp MIME-валидация | processImage.ts | ✅ |
| 4 | Change password + tokenVersion | authController/Service/Model, middleware, routes | ✅ |
| 5 | Redis retry ∞ backoff | redis.ts | ✅ |
| 6 | Chat 500 / group 100 limits | chatService.ts, groupService.ts | ✅ |
| 7 | Scroll-to-bottom bugfix | ChatView.tsx | ✅ |

## Test results
- Server: **44/44** (12 suites, +1 test for token revoked)
- Client: **4/4** (2 suites)
- Docker build: ✅
- Docker compose up: ✅ (all 4 containers healthy)
- API smoke test: ✅
  - `SameSite=Strict` cookie
  - JWT payload contains `tokenVersion`
  - Rate limit headers present
  - Helmet security headers present
  - `x-request-id` tracing present
