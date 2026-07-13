# Fix Log: Zokul — 5 багов
# Дата: 2026-07-13
# Severity: 🔴 Critical (2) + 🟡 Major (3)

## Статус: 📋 Запланировано

## План выполнения

### 🔴 Шаг 1: Socket.IO — присоединение к комнатам новых чатов
- **Файлы:** `server/src/socket/index.ts`, `client/src/components/HomePage.tsx`
- **Ожидание:** Новые сообщения приходят в real-time без перезагрузки

### 🔴 Шаг 2: Групповые чаты
- **Файлы:** `client/src/components/chat/CreateGroupModal.tsx`
- **Ожидание:** Группы создаются, ошибки видны, сообщения приходят

### 🟡 Шаг 3: Вёрстка сообщений (на десктопе)
- **Файлы:** `client/src/components/chat/ChatView.tsx`
- **Ожидание:** Сообщения не в узкой колонке по центру

### 🟡 Шаг 4: Удаление диалога
- **Файлы:** server: routes, controller, service, model, socket | client: ChatList, useChat, types
- **Ожидание:** Чат удаляется у всех участников

### 🟡 Шаг 5: iOS Safari
- **Файлы:** `client/src/components/chat/MessageInput.tsx`, `client/src/index.css`
- **Ожидание:** Нет зума, поле не уходит под экран

---

## Ход выполнения

### Шаг 1: Socket.IO — присоединение к комнатам — ✅
- **Файлы:** `server/src/socket/index.ts:62-65` — добавил `chat:join` обработчик; `:69` — `socket.join` в `message:send`
- **Файлы:** `client/src/components/HomePage.tsx:59` — добавил `socket.emit('chat:join', chat.id)` после создания чата
- **Типы:** ✅ чисто (server + client)
- **Тесты:** ✅ 10/10 passed
- **Проблемы:** —
- **Заметки:** auto-join в `message:send` защищает от случая, когда join не успел выполниться

### Шаг 2: Групповые чаты — ✅
- **Файлы:** `client/src/components/chat/CreateGroupModal.tsx:59-76` — fix min participants 2→1, добавил catch(err), canCreate
- **Файлы:** `client/src/components/HomePage.tsx:222` — передал socket в CreateGroupModal
- **Файлы:** `server/src/socket/index.ts:14-16,40-43,128-144` — userSockets Map + chat:created handler (уведомление участников)
- **Типы:** ✅ чисто
- **Тесты:** ✅ 10/10 passed
- **Проблемы:** —
- **Заметки:** userSockets Map позволяет оповестить других участников группы о новом чате

### Шаг 3: Вёрстка сообщений — ✅
- **Файлы:** `client/src/components/chat/ChatView.tsx:191` — `max-w-2xl` → `max-w-4xl lg:px-4`
- **Типы:** ✅ чисто
- **Тесты:** ✅ 10/10 passed
- **Проблемы:** —
- **Заметки:** Сообщения теперь растягиваются до 896px на десктопе

### Шаг 4: Удаление диалога — ✅
- **Файлы:** `server/src/models/Chat.ts:126-128` — add removeChat()
- **Файлы:** `server/src/services/chatService.ts:26-32` — add deleteChat()
- **Файлы:** `server/src/controllers/chatController.ts:31-50` — add deleteChat()
- **Файлы:** `server/src/routes/chatRoutes.ts:12` — add DELETE /:id
- **Файлы:** `server/src/socket/index.ts:146-154` — add chat:delete handler
- **Файлы:** `client/src/types/index.ts:45-47` — add ChatDeleted type
- **Файлы:** `client/src/components/chat/ChatList.tsx` — add delete UI (hover icon + confirm)
- **Файлы:** `client/src/components/HomePage.tsx` — add handleDeleteChat, chat:deleted listener
- **Типы:** ✅ чисто
- **Тесты:** ✅ 10/10 passed
- **Проблемы:** —
- **Заметки:** ON DELETE CASCADE на messages и chat_participants; socket.to room уведомляет всех

### Шаг 5: iOS Safari — ✅
- **Файлы:** `client/src/components/chat/MessageInput.tsx:144` — добавил `safe-area-bottom` на форму
- **Файлы:** `client/src/components/chat/MessageInput.tsx:203` — `text-sm` → `text-base` (16px, предотвращает зум)
- **Типы:** ✅ чисто
- **Тесты:** ✅ 10/10 passed
- **Проблемы:** —
- **Заметки:** `.safe-area-bottom` уже был в index.css:9-11, просто не использовался

---

## Итог
- Все шаги выполнены: ✅
- Server tsc: ✅ чисто
- Client tsc: ✅ чисто
- Тесты: ✅ 10/10 passed (3 suites)
- Регрессия: ✅ (все существующие тесты пройдены, изменений API не сломало)
- Документация: ✅ fixer-brain.md обновлён
