# Диагностика #12: Security Hardening #2

---

### A. 🟡 sameSite: 'lax' → 'strict'
**Место:** `server/src/controllers/authController.ts:9`
**Root cause:** Cookie `sameSite: 'lax'` — CSRF-атака возможна через GET-формы. Нужно `strict`.

### B. 🟡 Auth rate limit слишком мягкий
**Место:** `server/src/middleware/rateLimit.ts:4`
**Root cause:** 100 запросов за 15 минут на /api/auth — можно брутфорсить пароли (6 попыток/мин).
**Нужно:** 10 попыток за 15 минут.

### C. 🟡 Upload MIME-валидация обходится
**Место:** `server/src/middleware/uploadMiddleware.ts:20-26`
**Root cause:** Фильтр проверяет только extension и mimetype (из заголовка). Злоумышленник может подсунуть .exe с переименованным .png и mimetype image/png.
**Нужно:** После multer — проверять через sharp, что файл реально изображение.

### D. 🟡 Нет смены пароля + инвалидации сессий
**Место:** server/src (нет эндпоинта)
**Root cause:** Пользователь не может сменить пароль. Даже если бы мог — старые токены остаются валидными.
**Нужно:** `POST /api/auth/change-password` + `tokenVersion` в users + проверка в authMiddleware.

### E. 🟢 Нет retry при старте (Redis)
**Место:** `server/src/config/redis.ts`
**Root cause:** Если Redis недоступен при старте — сервер падает. Нужно retry с exponential backoff.

### F. 🟢 Нет лимитов на количество чатов/участников

### G. 🐛 Диалог открывается в середине, а не в конце
**Место:** `client/src/components/chat/ChatView.tsx:57-66`
**Root cause:** useEffect scroll-логика скроллит вниз только если новое сообщение пришло <2 сек назад. При открытии чата сообщения старые → isRecent=false → скролл не срабатывает.
**Фикс:** Начальная загрузка — всегда скроллить вниз. Новые сообщения — скроллить как сейчас.
**Место:** `server/src/services/chatService.ts`, `server/src/services/groupService.ts`
**Root cause:** Можно создать неограниченное количество чатов. В группу можно добавить неограниченно участников.

---

## Severity: 🟡 Major (A-D) + 🟢 Minor (E, F)
## Тип: Security (A-D) + Infra (E) + Feature (F)

## Затронутые файлы
- `server/src/controllers/authController.ts` — sameSite strict, change-password
- `server/src/middleware/authMiddleware.ts` — tokenVersion check
- `server/src/middleware/rateLimit.ts` — auth: 10/15min
- `server/src/middleware/uploadMiddleware.ts` — sharp MIME check
- `server/src/services/authService.ts` — changePassword, generateToken v2
- `server/src/models/User.ts` — token_version column
- `server/src/config/db.ts` — token_version migration
- `server/src/config/redis.ts` — retry on start
- `server/src/services/chatService.ts` — max chats limit
- `server/src/services/groupService.ts` — max participants limit
- `server/src/index.ts` — change-password route
- `client/src/components/profile/ProfileEditor.tsx` — change password UI

## Предварительный план
1. sameSite strict + auth rate limit tighten
2. Upload MIME-валидация (sharp)
3. Change password + token version
4. Redis retry + chat/participant limits
5. Тесты + регрессия
