# FIX LOG #12 — Security Hardening #2

**Date:** 2026-07-13

## Changes

### 1. sameSite: 'lax' → 'strict'
- **File:** `server/src/controllers/authController.ts:8`
- Cookie sameSite изменён с `lax` на `strict` — cookie не отправляется на кросс-доменные запросы (защита от CSRF)

### 2. Auth rate limit 100 → 10
- **File:** `server/src/middleware/rateLimit.ts:5`
- `authLimiter` max снижен со 100 до 10 запросов за 15 минут
- `loginLimiter` (5/15min) и `registerLimiter` (3/15min) остались без изменений

### 3. Sharp MIME-валидация загружаемых файлов
- **File:** `server/src/middleware/processImage.ts`
- Добавлен `sharp(file).metadata()` перед обработкой — если файл не является изображением, он удаляется и возвращается ошибка "Invalid image file"
- Валидация добавлена как в `processImage` (для чат-изображений), так и в `processAvatar`

### 4. Change password + tokenVersion
- **File:** `server/src/config/db.ts` — миграция: `ALTER TABLE users ADD COLUMN token_version INTEGER DEFAULT 0`
- **File:** `server/src/types/index.ts` — `UserRow` расширен полем `token_version`
- **File:** `server/src/models/User.ts`
  - `findByEmail` теперь возвращает `tokenVersion`
  - Добавлены `updatePassword` (инкрементит token_version), `getTokenVersion`, `findByIdWithPassword`
- **File:** `server/src/services/authService.ts`
  - `generateToken` принимает `tokenVersion` и добавляет в JWT payload
  - `login` передаёт `tokenVersion` из БД в `generateToken`
  - Добавлен `changePassword` — проверяет старый пароль, хеширует новый, вызывает `updatePassword`
- **File:** `server/src/middleware/authMiddleware.ts`
  - Теперь асинхронный: проверяет `decoded.tokenVersion` против `getTokenVersion(userId)`
  - Если версия устарела → 401 "Token revoked"
- **File:** `server/src/controllers/authController.ts` — добавлен `changePassword` endpoint
- **File:** `server/src/routes/authRoutes.ts` — `POST /change-password` (authMiddleware)

### 5. Redis retry: бесконечный exponential backoff
- **File:** `server/src/config/redis.ts`
  - `maxRetriesPerRequest: 3` → `null` (безлимит)
  - `retryStrategy` больше не возвращает `null` после 3 попыток; использует `Math.exp(times) * 100` ms capped at 30000ms

### 6. Chat/participant limits
- **File:** `server/src/services/chatService.ts` — max 500 чатов на пользователя
- **File:** `server/src/services/groupService.ts` — max 100 участников в группе

### 7. Scroll-to-bottom bugfix
- **File:** `client/src/components/chat/ChatView.tsx`
- При смене `chatId` (открытие нового диалога) — `prevCountRef` сбрасывается в 0
- При первой загрузке сообщений (`prevCountRef === 0`) — `scrollIntoView` с поведением `instant` через `setTimeout(50ms)`
- При новых сообщениях — `scrollIntoView` с `smooth` (как было)

## Test Results
- Server: **44/44** (12 suites)
- Client: **4/4** (2 suites)
- Docker: все 4 контейнера up + healthy
- API: sameSite=Strict, HttpOnly, Secure, tokenVersion в JWT, rate limit headers
