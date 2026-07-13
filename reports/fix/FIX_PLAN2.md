# Fix Plan #2: Zokul — Top-20 проблем

**Источник:** `reports/fix/DIAGNOSTIC2.md` (38 проблем)
**Severity:** 🔴3 Critical + 🟠7 High + 🟡10 Medium/Low

## Success Criteria
- [x] Все ошибки 500 превращаются в 400 для клиентских ошибок
- [x] Белый экран при ошибке рендера → показать UI с кнопкой "Reload"
- [x] Удалить группу может только создатель
- [x] Быстрое переключение чатов не вызывает race condition
- [x] Закрытие модалок не триггерит setState на unmounted
- [x] Падение Redis не роняет сокет-соединение
- [x] AuthSocket тип вместо `(socket as any)` в connection
- [x] graceful shutdown (SIGTERM → закрыть http, redis, pg)
- [x] chat:leave при смене чата
- [x] localStorage JSON.parse безопасен

---

## Шаги реализации

---

### 🔴 Шаг 1: Error middleware — синхронизировать строку ошибки

**Файл:** `server/src/middleware/errorMiddleware.ts:14`
**Что сделать:** Заменить `'Message must have text or image'` на `'Message must have text, image, or voice'` чтобы совпадало с messageService.ts
**Тест:** Послать сообщение без контента → получить 400 вместо 500
**Rollback:** `git checkout -- server/src/middleware/errorMiddleware.ts`

---

### 🔴 Шаг 2: ErrorBoundary — защита от белого экрана

**Файлы:** `client/src/components/common/ErrorBoundary.tsx` (новый), `client/src/main.tsx`
**Что сделать:** Создать ErrorBoundary классовый компонент, обернуть `<App />`
**Rollback:** Удалить `<ErrorBoundary>` из main.tsx

---

### 🔴 Шаг 3: Удаление группы — только создатель

**Файлы:** `server/src/models/Chat.ts`, `server/src/services/chatService.ts`, `server/src/socket/index.ts`
**Что сделать:**
- В `chats` таблице уже есть колонка, надо добавить `creator_id`
- `groupService.createGroup` записывает `creator_id`
- `deleteChat` проверяет: если `isGroup && creator_id !== userId` → 403
- `server/src/config/db.ts` — добавить `ALTER TABLE chats ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES users(id)`
**Rollback:** `git checkout -- server/src/services/`

---

### 🟠 Шаг 4: AbortController — race condition загрузки сообщений

**Файл:** `client/src/hooks/useChat.ts:89-97`
**Что сделать:** Добавить AbortController, при смене `chatId` или unmount отменять запрос
**Тест:** Быстро переключать чаты → нет stale ответов
**Rollback:** `git checkout -- client/src/hooks/useChat.ts`

---

### 🟠 Шаг 5: Debounced search — cleanup timeout при unmount

**Файлы:** `client/src/components/chat/CreateChatModal.tsx`, `client/src/components/chat/CreateGroupModal.tsx`
**Что сделать:** Возвращать `() => clearTimeout(ref.current)` из useEffect
**Rollback:** `git checkout -- client/src/components/chat/`

---

### 🟠 Шаг 6: Socket connection — try/catch для presence + chat loading

**Файл:** `server/src/socket/index.ts:43-56`
**Что сделать:** Обернуть `setOnline`, `getAllOnlineUserIds`, `findChatsByUserId` в try/catch. При ошибке — не падать, а логировать.
**Rollback:** `git checkout -- server/src/socket/index.ts`

---

### 🟠 Шаг 7: AuthSocket — убрать `(socket as any)`

**Файл:** `server/src/socket/index.ts`
**Что сделать:** Создать `interface AuthSocket extends Socket { userId: string; userName: string; }` и использовать его вместо `(socket as any)`
**Rollback:** `git checkout -- server/src/socket/index.ts`

---

### 🟠 Шаг 8: TOCTOU race — сделать edit/delete message транзакционными

**Файл:** `server/src/services/messageService.ts`
**Что сделать:** Объединить findById + update в один запрос с `RETURNING`, убрать промежуток между проверкой и действием
**Rollback:** `git checkout -- server/src/services/messageService.ts`

---

### 🟠 Шаг 9: TOCTOU race — deleteChat с проверкой в одном запросе

**Файл:** `server/src/services/chatService.ts`
**Что сделать:** DELETE с проверкой participant в одном запросе: `DELETE FROM chats WHERE id = $1 AND $2 = ANY(SELECT user_id FROM chat_participants WHERE chat_id = $1)`
**Rollback:** `git checkout -- server/src/services/chatService.ts`

---

### 🟡 Шаг 10: graceful shutdown

**Файл:** `server/src/index.ts`
**Что сделать:** Добавить `process.on('SIGTERM', ...)` → закрыть httpServer, Redis pool, PostgreSQL pool
**Rollback:** `git checkout -- server/src/index.ts`

---

### 🟡 Шаг 11: chat:leave при смене чата

**Файл:** `client/src/components/HomePage.tsx`
**Что сделать:** Перед `chat:join` для нового чата — emit `chat:leave` для старого
**Rollback:** `git checkout -- client/src/components/HomePage.tsx`

---

### 🟡 Шаг 12: Безопасный JSON.parse localStorage

**Файл:** `client/src/contexts/AuthContext.tsx:20`
**Что сделать:** Обернуть `JSON.parse(stored)` в try/catch, при ошибке — очистить localStorage
**Rollback:** `git checkout -- client/src/contexts/AuthContext.tsx`

---

### 🟡 Шаг 13: helmet security headers

**Файл:** `server/src/index.ts`
**Что сделать:** `npm install helmet`, `app.use(helmet())`
**Rollback:** `git checkout -- server/src/index.ts; npm uninstall helmet`

---

### 🟡 Шаг 14: crypto.randomUUID для имён файлов

**Файл:** `server/src/middleware/uploadMiddleware.ts:10`
**Что сделать:** `Math.round(Math.random() * 1E9)` → `crypto.randomUUID()`
**Rollback:** `git checkout -- server/src/middleware/uploadMiddleware.ts`

---

### 🟡 Шаг 15: inline errors вместо alert()

**Файл:** `client/src/components/chat/CreateGroupModal.tsx`
**Что сделать:** Добавить `error` state, выводить `<p className="text-red-500 text-xs">` вместо `alert()`
**Rollback:** `git checkout -- client/src/components/chat/CreateGroupModal.tsx`

---

### 🟡 Шаг 16: стабильный key для списка изображений

**Файл:** `client/src/components/chat/MessageInput.tsx:153`
**Что сделать:** `key={idx}` → `key={img.file.name + img.file.size}`
**Rollback:** `git checkout -- client/src/components/chat/MessageInput.tsx`

---

### 🟡 Шаг 17: aria-label на icon-only кнопках

**Файлы:** `client/src/components/HomePage.tsx`, `client/src/components/chat/MessageInput.tsx`
**Что сделать:** Добавить `aria-label` на 6 кнопок
**Rollback:** `git checkout -- client/src/components/`

---

### 🟡 Шаг 18: focus trap в модалках

**Файл:** `client/src/components/common/Modal.tsx`
**Что сделать:** Добавить `role="dialog"`, `aria-modal="true"`, focus trap через tabIndex
**Rollback:** `git checkout -- client/src/components/common/Modal.tsx`

---

### 🔵 Шаг 19: minimal search query length

**Файл:** `server/src/models/User.ts`
**Что сделать:** `if (query.length < 2) return []`
**Rollback:** `git checkout -- server/src/models/User.ts`

---

### 🔵 Шаг 20: closeRedis при shutdown

**Файл:** `server/src/config/redis.ts`, `server/src/index.ts`
**Что сделать:** Импортировать и вызвать `closeRedis()` в graceful shutdown
**Rollback:** `git checkout -- server/src/config/redis.ts server/src/index.ts`

---

## Затрагиваемые модули
- Сервер: socket, errorMiddleware, messageService, chatService, chatController, uploadMiddleware, authService, index.ts, redis.ts, db.ts, models (Chat, User)
- Клиент: ErrorBoundary, useChat, HomePage, CreateChatModal, CreateGroupModal, MessageInput, AuthContext, Modal
