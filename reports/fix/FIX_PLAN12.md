# Fix Plan #12: Security Hardening #2

## Root Cause
Из DIAGNOSTIC12.md — 7 проблем: security, infra, баг скролла.

## Тип: Security + Bugfix + Infra
## Severity: 🟡 Major

## Success Criteria
- [ ] Cookie sameSite: 'strict'
- [ ] Auth rate limit: 10 req/15min
- [ ] Upload: sharp проверяет что файл — изображение
- [ ] Change password endpoint + tokenVersion инвалидация
- [ ] Redis retry при старте
- [ ] Max 100 chats/user, max 50 participants/group
- [ ] При открытии чата скролл вниз (багфикс)
- [ ] Все тесты проходят (server 43 + client 4)

## Шаги реализации

### Шаг 1: sameSite strict + auth rate limit 10/15min
- **Файлы:** `server/src/controllers/authController.ts:9`, `server/src/middleware/rateLimit.ts:4`
- **Что сделать:** `'lax'` → `'strict'`, `max: 100` → `max: 10`
- **Rollback:** `git checkout -- server/src/controllers/authController.ts server/src/middleware/rateLimit.ts`

### Шаг 2: Upload MIME-валидация
- **Файлы:** `server/src/middleware/uploadMiddleware.ts`
- **Что сделать:** В fileFilter — после проверки ext/mime, проверить через sharp.metadata() что это изображение. Аудио — через file-type или доверять mimetype.
- **Rollback:** `git checkout -- server/src/middleware/uploadMiddleware.ts`

### Шаг 3: Change password + tokenVersion
- **Файлы:** `server/src/config/db.ts`, `server/src/models/User.ts`, `server/src/services/authService.ts`, `server/src/controllers/authController.ts`, `server/src/middleware/authMiddleware.ts`, `server/src/index.ts`, `client/src/components/profile/ProfileEditor.tsx`
- **Что сделать:**
  1. Миграция: `ALTER TABLE users ADD COLUMN token_version INTEGER DEFAULT 0`
  2. `UserModel.updatePassword(userId, passwordHash)` + `incrementTokenVersion(userId)`
  3. `authService.changePassword(userId, oldPassword, newPassword)`
  4. `authController.changePassword` + `POST /api/auth/change-password`
  5. `generateToken` включает `tokenVersion` в payload
  6. `authMiddleware` проверяет `tokenVersion` из БД
  7. Client: ProfileEditor — форма смены пароля
- **Rollback:** `git checkout -- server/src/`

### Шаг 4: Redis retry + лимиты
- **Файлы:** `server/src/config/redis.ts`, `server/src/services/chatService.ts`, `server/src/services/groupService.ts`
- **Что сделать:**
  1. Redis: retryStrategy с infinite backoff (не null)
  2. chatService: проверять `chats count < 100` перед createChat/createGroup
  3. groupService: проверять `participants.length < 50` перед addMember
- **Rollback:** `git checkout -- server/src/config/redis.ts server/src/services/chatService.ts server/src/services/groupService.ts`

### Шаг 5: Scroll to bottom on chat open (багфикс)
- **Файлы:** `client/src/components/chat/ChatView.tsx`
- **Что сделать:** Добавить `chatId` в key для ре-рендера при смене чата. useEffect: при изменении chatId скроллить вниз после загрузки сообщений через requestAnimationFrame.
- **Rollback:** `git checkout -- client/src/components/chat/ChatView.tsx`

### Шаг 6: Регрессия + Docker
- **Файлы:** —
- **Что сделать:** tsc + tests + Docker rebuild

## Regression Checklist
- [ ] Регистрация/логин
- [ ] Смена пароля
- [ ] Отправка сообщений
- [ ] Загрузка изображений
- [ ] Скролл при открытии чата
- [ ] Docker 4/4 healthy
