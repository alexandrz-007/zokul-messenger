# Fix Plan #7: Security Hardening

## Root Cause
Из DIAGNOSTIC7.md — 4 проблемы: JWT в localStorage, fallback secrets, socket rate limit, email leak.

## Тип: Security
## Severity: 🔴 Critical + 🟡 Major

## Success Criteria
- [ ] JWT хранится только в httpOnly cookie, недоступен JS
- [ ] При отсутствии JWT_SECRET / VAPID keys в env — сервер не стартует
- [ ] Socket message:send/edit/delete — max 5 в секунду, иначе error
- [ ] User search не возвращает email
- [ ] Session restore работает после перезагрузки страницы
- [ ] Все тесты проходят (33+)
- [ ] tsc --noEmit чистый

## Шаги реализации

### Шаг 1: 🔴 httpOnly cookie — сервер
- **Файлы:** `server/src/index.ts`, `server/src/controllers/authController.ts`, `server/src/middleware/authMiddleware.ts`, `server/src/socket/index.ts`
- **Что сделать:**
  - Добавить `cookie-parser` middleware
  - authController: login/register устанавливает httpOnly cookie `token`, возвращает `{ user }` без token
  - Добавить `GET /api/auth/me` — session restore
  - authMiddleware: читать token из `req.cookies.token` (с fallback на Bearer для совместимости)
  - Socket IO: читать token из cookie в handshake
- **Rollback:** `git checkout -- server/src/index.ts server/src/controllers/authController.ts server/src/middleware/authMiddleware.ts server/src/socket/index.ts server/src/routes/authRoutes.ts`

### Шаг 2: 🔴 httpOnly cookie — клиент
- **Файлы:** `client/src/services/api.ts`, `client/src/contexts/AuthContext.tsx`, `client/src/services/socket.ts`
- **Что сделать:**
  - api.ts: убрать localStorage token из interceptor, добавить `withCredentials: true`
  - AuthContext.tsx: убрать localStorage для token, хранить user в памяти/logout очищает cookie
  - socket.ts: убрать auth: { token } (cookie шлётся автоматически через transport=polling)
- **Rollback:** `git checkout -- client/src/services/api.ts client/src/contexts/AuthContext.tsx client/src/services/socket.ts`

### Шаг 3: 🔴 Fallback secrets — throw
- **Файлы:** `server/src/config/app.ts`
- **Что сделать:** `unsafeEnv()` для jwtSecret, vapidPublicKey, vapidPrivateKey — кидать ошибку в любом NODE_ENV если нет env
- **Rollback:** `git checkout -- server/src/config/app.ts`

### Шаг 4: 🟡 Socket rate limiting
- **Файлы:** `server/src/socket/index.ts`
- **Что сделать:** in-memory Map<userId, lastTimestamp[]>. Проверять что не больше 5 сообщений в секунду на message:send/edit/delete
- **Rollback:** `git checkout -- server/src/socket/index.ts`

### Шаг 5: 🟡 User search — hide email
- **Файлы:** `server/src/models/User.ts:30-37`
- **Что сделать:** Новый тип `UserSearchResult` (id, name, avatarUrl). Search возвращает только эти поля.
- **Rollback:** `git checkout -- server/src/models/User.ts`

### Шаг 6: Тесты
- **Файлы:** `server/__tests__/authCookie.test.ts`
- **Что сделать:** Тесты для: cookie-parser middleware, session restore, socket rate limit, hidden email
- **Rollback:** `git checkout -- server/__tests__/authCookie.test.ts`

## Regression Checklist
- [ ] Регистрация нового пользователя
- [ ] Вход существующего пользователя
- [ ] Session restore после F5
- [ ] Logout очищает cookie
- [ ] Socket подключение (с cookie)
- [ ] Отправка сообщения
- [ ] Spam-защита (быстро 6 сообщений → error)
- [ ] Поиск пользователей не показывает email
- [ ] User profile update
