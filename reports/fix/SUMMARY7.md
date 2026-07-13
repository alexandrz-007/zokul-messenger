# Summary #7: Security Hardening

## Статус: ✅ Успешно

## Что сделано

### 🔴 Critical — httpOnly cookie для JWT
- Сервер: `cookie-parser`, login/register устанавливает `httpOnly` cookie `token`
- Сервер: `GET /api/auth/me` — session restore через cookie
- Сервер: `POST /api/auth/logout` — очистка cookie
- Сервер: `authMiddleware` читает token из cookie (с fallback на Bearer header)
- Сервер: Socket.IO — парсинг token из cookie в handshake
- Клиент: `api.ts` — `withCredentials: true`, убран localStorage token
- Клиент: `AuthContext.tsx` — token только в памяти, restore через `/api/auth/me`
- Клиент: `socket.ts` — `withCredentials: true`, убран auth: { token }
- Клиент: `usePushSubscription.ts` — `credentials: 'include'`, убран Bearer header
- Клиент: `SocketContext.tsx` — триггер `user` вместо `token`
- Клиент: `ProfileEditor.tsx` — убран `localStorage.setItem('user')`

### 🔴 Critical — Fallback secrets удалены
- `requireEnv()` кидает ошибку при отсутствии `JWT_SECRET`, `DATABASE_URL`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
- Без `.env` сервер не стартует

### 🟡 Major — Socket rate limiting
- `checkRateLimit()`: max 5 сообщений в секунду на пользователя
- Применён к `message:send`, `message:edit`, `message:delete`

### 🟡 Major — User search не возвращает email
- `UserModel.search()` возвращает только `{ id, name, avatarUrl }`

## Результаты тестов
- **38/38 passed (10 suites)**
- Новые: `authCookie.test.ts` (5 тестов — cookie auth, bearer fallback, invalid token, no token)
- Новый: `jest.setup.ts` (env vars для тестов)
- TypeScript: ✅ clean (client + server)

## Docker
- ✅ Обе images пересобраны, 4/4 контейнера up

## Изменённые файлы
- `server/src/index.ts` — cookie-parser
- `server/src/controllers/authController.ts` — httpOnly cookie, me, logout
- `server/src/middleware/authMiddleware.ts` — cookie fallback
- `server/src/routes/authRoutes.ts` — /me, /logout роуты
- `server/src/socket/index.ts` — cookie auth, rate limiting
- `server/src/config/app.ts` — requireEnv вместо safeEnv
- `server/src/models/User.ts` — search без email
- `server/jest.config.js` — setupFiles
- `server/jest.setup.ts` (новый)
- `server/__tests__/authCookie.test.ts` (новый)
- `client/src/services/api.ts` — withCredentials, убран localStorage
- `client/src/contexts/AuthContext.tsx` — session restore
- `client/src/services/socket.ts` — withCredentials
- `client/src/contexts/SocketContext.tsx` — user вместо token
- `client/src/hooks/usePushSubscription.ts` — credentials: include
- `client/src/components/profile/ProfileEditor.tsx` — убран localStorage

## Обновлена документация
- ✅ fixer-brain.md
- ✅ FIX_LOG7.md
- ✅ SUMMARY7.md
