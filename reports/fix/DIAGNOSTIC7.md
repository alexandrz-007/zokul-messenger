# Диагностика #7: Security Hardening

## Вводные
Провести security hardening перед деплоем: JWT storage, секреты в коде, socket rate limit, утечка email.

---

### A. 🔴 JWT в localStorage (XSS-уязвимость)

**Место:** `client/src/services/api.ts:8`, `client/src/contexts/AuthContext.tsx:20,27,32`, `server/src/middleware/authMiddleware.ts:10-15`

**Root cause:** JWT хранится в localStorage, доступном любому JavaScript на странице. XSS-инъекция → угон сессии.

**Текущий флоу:**
1. Сервер отдаёт `{ token, user }` в теле ответа (login/register)
2. Клиент пишет в localStorage (api.ts:8 берёт оттуда)
3. Клиент шлёт через `Authorization: Bearer <token>` (api.ts interceptor)
4. Сервер читает из заголовка (authMiddleware.ts:10-15)
5. Socket — `io({ auth: { token } })` — читает из localStorage (socket.ts:9)
6. Session restore: нет — только из localStorage

**Фикс:** httpOnly cookie (недоступен JS) + cookie-parser + session restore endpoint.

### B. 🔴 Секреты с fallback-значениями в app.ts

**Место:** `server/src/config/app.ts:18,22-23`

**Root cause:** `safeEnv('JWT_SECRET', 'dev-secret...')` и VAPID keys с fallback-значениями. В dev-режиме реальные ключи компилируются в бинарник даже без env-файла.

### C. 🟡 Нет rate limiting на socket-события

**Место:** `server/src/socket/index.ts:92-130`

**Root cause:** `message:send`, `message:edit`, `message:delete` не имеют rate limiting. Можно спамить тысячи сообщений в секунду через WebSocket консоль.

### D. 🟡 User search утекает email

**Место:** `server/src/models/User.ts:30-37`

**Root cause:** `search()` возвращает полный User (включая email). При поиске пользователей для добавления в чат email отображается другим участникам.

---

## Severity: 🔴 Critical (A, B) + 🟡 Major (C, D)
## Тип: Security

## Затронутые файлы
- `server/src/config/app.ts:18,22-23` — 🔴 fallback secrets
- `server/src/services/authService.ts:37-43` — generateToken
- `server/src/controllers/authController.ts:13,27` — возврат token в теле
- `server/src/middleware/authMiddleware.ts:10-15` — чтение из header
- `server/src/routes/authRoutes.ts` — регистрация роутов
- `server/src/socket/index.ts:92-130` — 🟡 rate limit
- `server/src/models/User.ts:30-37` — 🟡 email leak
- `server/src/controllers/userController.ts:6-18` — search
- `client/src/services/api.ts:7-13` — localStorage token
- `client/src/services/socket.ts:9-10` — auth token
- `client/src/contexts/AuthContext.tsx:18-44` — localStorage storage
- `client/src/components/auth/LoginForm.tsx` — login form
- `client/src/components/auth/RegisterForm.tsx` — register form

## Предварительный план
1. Server: cookie-parser + httpOnly cookie вместо Bearer token
2. Server: unsafeEnv() для секретов — throw если нет env
3. Server: in-memory rate limiter для socket message:send/edit/delete
4. Server: sanitized search — убрать email из результата
5. Client: убрать localStorage token, withCredentials: true
6. Client: session restore через GET /api/auth/me
7. Тесты
