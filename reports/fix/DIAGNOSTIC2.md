# Диагностика (цикл #2): Zokul — скрытые проблемы

**Дата:** 2026-07-13
**Метод:** Полный аудит кода (40+ файлов) — серверная и клиентская части

---

## Сводка

| Severity | Кол-во | Категории |
|----------|--------|-----------|
| 🔴 Critical | 3 | Ошибка обработки ошибок, отсутствие ErrorBoundary, безопасность групп |
| 🟠 High | 7 | Race conditions, утечки памяти, отсутствие graceful shutdown, многопоточность |
| 🟡 Medium | 16 | TypeScript any, отсутствие валидации, silent catch, unsafe JSON.parse, a11y |
| 🔵 Low | 12 | Мёртвый код, CSS, незначительные улучшения |

**Всего: 38 проблем**

---

## 🔴 Critical (3)

### C1. Error middleware — несовпадение строки ошибки (Server)
**Файл:** `server/src/middleware/errorMiddleware.ts:14` vs `server/src/services/messageService.ts:27`
**Root cause:** В errorMiddleware проверка `err.message === 'Message must have text or image'`, но messageService кидает `'Message must have text, image, or voice'`. Несовпадение → клиент получает 500 вместо 400.
**Воспроизведение:** Отправить сообщение без текста, изображения и голоса → сервер ответит 500 Internal Server Error.
**Fix:** Синхронизировать строку в errorMiddleware или ввести enum ошибок.

### C2. Нет Error Boundary (Client)
**Файл:** `client/src/App.tsx`, `client/src/main.tsx`
**Root cause:** Любая ошибка в рендере React → белый экран. Нет перехвата.
**Fix:** Обернуть `<App />` в `<ErrorBoundary>`.

### C3. Любой участник может удалить групповой чат (Server)
**Файл:** `server/src/services/chatService.ts:26-30`
**Root cause:** `deleteChat` проверяет только `participantIds.includes(userId)`. Любой участник может удалить всю группу (каскадно удаляются все сообщения).
**Fix:** Добавить проверку роли (создатель/админ) для групповых чатов.

---

## 🟠 High (7)

### H1. Race condition — загрузка сообщений без abort (Client)
**Файл:** `client/src/hooks/useChat.ts:89-97`
**Root cause:** useEffect без AbortController. При быстром переключении чатов старый ответ может перезаписать новый.
**Fix:** Добавить AbortController, отменять запрос при смене chatId.

### H2. Race condition TOCTOU — editMessage (Server)
**Файл:** `server/src/services/messageService.ts:56-59`
**Root cause:** findById → updateMessage между ними другой запрос может удалить сообщение.

### H3. Race condition TOCTOU — deleteMessage (Server)
**Файл:** `server/src/services/messageService.ts:68-71`
**Root cause:** findById → softDelete. Если сообщение уже удалено — возвращает success со stale данными.

### H4. Race condition TOCTOU — deleteChat (Server)
**Файл:** `server/src/services/chatService.ts:27-31`
**Root cause:** findChatById → removeChat. Между ними чат может быть удалён другим запросом.

### H5. Unhandled promise rejections в socket connection (Server)
**Файл:** `server/src/socket/index.ts:43,46,53`
**Root cause:** presenceService.setOnline(), getAllOnlineUserIds(), findChatsByUserId() без try/catch. Падение Redis или PostgreSQL → необработанная ошибка.

### H6. userSockets Map не работает в multi-instance (Server)
**Файл:** `server/src/socket/index.ts:13,122-135`
**Root cause:** In-memory Map. В multi-instance деплое (Docker scaling) users на других инстансах не получат уведомления.

### H7. Debounced search не чистит timeout при unmount (Client)
**Файл:** `client/src/components/chat/CreateChatModal.tsx:26-30`, `client/src/components/chat/CreateGroupModal.tsx:34-49`
**Root cause:** setTimeout не очищается при закрытии модалки. setState происходит на unmounted компонент.
**Fix:** Возвращать cleanup из useEffect: `() => clearTimeout(debounceRef.current)`.

---

## 🟡 Medium (16)

### M1. Нет helmet/security headers (Server)
**Файл:** `server/src/index.ts:22-25`
**Fix:** Добавить `helmet` middleware.

### M2. Нет валидации email/пароля при регистрации (Server)
**Файл:** `server/src/controllers/authController.ts:7-11`
**Fix:** Проверять email regex, min length пароля, max length имени.

### M3. Нет UUID валидации на route параметрах (Server)
**Файл:** Multiple controllers
**Fix:** Добавить middleware или валидацию UUID формата.

### M4. Math.random() для имён файлов (Server)
**Файл:** `server/src/middleware/uploadMiddleware.ts:10`
**Fix:** Использовать `crypto.randomUUID()`.

### M5. chat:created — нет защиты от undefined userSockets.get() (Server)
**Файл:** `server/src/socket/index.ts:122-135`
**Fix:** Проверить `if (userSockets.has(pid))` и `if (s)`.

### M6. Нет graceful shutdown (Server)
**Файл:** `server/src/index.ts`
**Fix:** Добавить `process.on('SIGTERM', ...)`.

### M7. apiLimiter определён, но не используется (Server)
**Файл:** `server/src/middleware/rateLimitMiddleware.ts`
**Fix:** Применить к роутам.

### M8. Только `text` для отправки, нет `text: 500mb+` ограничений (Server)
...

### M9. `(socket as any)` — потеря type safety (Server)
**Файл:** `server/src/socket/index.ts:32,33,41,42`
**Fix:** Создать `interface AuthSocket extends Socket { userId: string; userName: string; }`.

### M10. `(req as any).userId` в pushController (Server)
**Файл:** `server/src/controllers/pushController.ts:8,22`
**Fix:** Использовать `AuthRequest`.

### M11. Unsafe JSON.parse localStorage (Client)
**Файл:** `client/src/contexts/AuthContext.tsx:20`
**Fix:** Обернуть в try/catch.

### M12. Missing aria-label на icon-only кнопках (Client)
**Файл:** HomePage.tsx, MessageInput.tsx — 6 кнопок
**Fix:** Добавить `aria-label`.

### M13. Нет focus trapping в модалках (Client)
**Файл:** `Modal.tsx`, `CreateChatModal`, `CreateGroupModal`
**Fix:** Добавить focus trap + `aria-modal`.

### M14. `alert()` для ошибок группы (Client)
**Файл:** `client/src/components/chat/CreateGroupModal.tsx:74`
**Fix:** Показывать ошибку инлайн.

### M15. Array index as key для removable images (Client)
**Файл:** `client/src/components/chat/MessageInput.tsx:153`
**Fix:** Использовать `file.name + file.size` или UUID.

### M16. No chat:leave при смене чата (Client)
**Файл:** `client/src/components/HomePage.tsx:59`
**Fix:** Сначала emit `chat:leave` для старого chatId, потом `chat:join` для нового.

---

## 🔵 Low (12)

### L1. `uploadImagesMiddleware` не используется (Server)
### L2. `closeRedis()` не вызывается (Server)
### L3. `require.main === module` — dead code в ES модулях (Server)
### L4. `mapMessage(row: any)` — вместо типизированной строки (Server)
### L5. `(row: any)` в notificationService (Server)
### L6. `params: any[]` в Chat.ts (Server)
### L7. `_req: any` в uploadMiddleware (Server)
### L8. `(err as any).code` вместо typed error (Server)
### L9. Нет минимальной длины поискового запроса (Server)
### L10. Missing `imageUrls` в `ReplyPreview` (Server)
### L11. Dead socket listeners в ChatView (Client)
### L12. Нет loading progress для загрузки изображений (Client)

---

## Классификация

| Категория | Кол-во |
|-----------|--------|
| Bug | 14 (C1, C3, H1-H7, M5, M9-M10, M16) |
| Security | 5 (C3, M1, M2, M4, M11) |
| Performance | 2 (H1, H6) |
| UX | 5 (M12-M15, L12) |
| Code Quality | 12 (M3, M6-M8, L1-L11) |

---

## Стоп-факторы (для выполнения сейчас)

1. ⚠️ Docker не установлен локально — тестирование только через `tsc --noEmit` и `npx jest`
2. ⚠️ npm заблокирован PowerShell — workaround через `cmd /c`
3. ⚠️ CI/CD не настроен — ручная проверка
4. ⚠️ Нет staging окружения — все изменения применяются напрямую

---

## Дальнейшие шаги

Если ты хочешь исправить эти проблемы, скажи **"план"** — я составлю FIX_PLAN2.md с приоритезацией и детальными шагами для Top-10 проблем (Critical + High).
