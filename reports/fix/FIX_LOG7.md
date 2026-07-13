# Fix Log #7: Security Hardening
# Дата: 2026-07-13
# Severity: 🔴 Critical

## Статус: ✅ Выполнен

---

### Шаг 1: 🔴 httpOnly cookie — сервер — ✅
- **Файлы:** `server/src/index.ts`, `server/src/controllers/authController.ts`, `server/src/middleware/authMiddleware.ts`, `server/src/socket/index.ts`, `server/src/routes/authRoutes.ts`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ✅ (authCookie.test.ts — 5 тестов)
- **Заметки:** cookie-parser + login/register/set cookie + authMiddleware: cookie fallback + socket: cookie parse

### Шаг 2: 🔴 httpOnly cookie — клиент — ✅
- **Файлы:** `client/src/services/api.ts`, `client/src/contexts/AuthContext.tsx`, `client/src/services/socket.ts`, `client/src/contexts/SocketContext.tsx`, `client/src/hooks/usePushSubscription.ts`, `client/src/components/profile/ProfileEditor.tsx`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ (ручная проверка)
- **Заметки:** withCredentials + session restore + убран localStorage

### Шаг 7: 🔴 Hotfix — 401 interceptor убивал session restore — ✅
- **Файлы:** `client/src/services/api.ts`
- **Типы:** ✅ tsc --noEmit clean
- **Проблема:** api.ts interceptor: 401 → `window.location.href='/login'` → полный reload → рекурсия
- **Фикс:** убран весь response interceptor. ProtectedRoute + AuthContext корректно обрабатывают 401 через React Router Navigate без full reload

### Шаг 3: 🔴 Fallback secrets — throw — ✅
- **Файлы:** `server/src/config/app.ts`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ (jest.setup.ts обеспечивает env vars)
- **Заметки:** requireEnv() кидает ошибку при отсутствии обязательных vars

### Шаг 4: 🟡 Socket rate limiting — ✅
- **Файлы:** `server/src/socket/index.ts`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ (ручная проверка)
- **Заметки:** checkRateLimit — 5/s/user на message:send/edit/delete

### Шаг 5: 🟡 User search — hide email — ✅
- **Файлы:** `server/src/models/User.ts`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳
- **Заметки:** search возвращает только id, name, avatarUrl

### Шаг 6: Tests — ✅
- **Файлы:** `server/__tests__/authCookie.test.ts` (новый, 5 тестов), `server/jest.setup.ts` (новый)
- **Результат:** ✅ 38/38 passed (10 suites)

---
