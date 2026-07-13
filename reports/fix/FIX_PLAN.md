# Fix Plan: Zokul — 5 багов

## Root Cause
См. `reports/fix/DIAGNOSTIC.md` — 5 проблем с разными root cause.

## Типы: Bug (3) + UX (1) + Feature (1)
## Severity: 🔴 Critical (2) + 🟡 Major (3)

## Success Criteria
- [x] Критерий #1: Сообщения растягиваются на разумную ширину — max-w-4xl (896px) вместо max-w-2xl (672px)
- [x] Критерий #2: Новые сообщения приходят без перезагрузки — chat:join handler + auto-join в message:send
- [x] Критерий #3: Групповые чаты создаются с валидацией — catch(err) + min 1 participant + chat:created event
- [x] Критерий #4: Чат можно удалить — REST DELETE + socket chat:delete + hover confirm UI
- [x] Критерий #5: iOS Safari — safe-area-bottom + text-base 16px (нет зума)

---

## Шаги реализации

---

### ✅ 🔴 Шаг 1: Починить Socket.IO — присоединение к комнатам новых чатов

**Файлы:** `server/src/socket/index.ts`, `client/src/contexts/SocketContext.tsx`, `client/src/components/HomePage.tsx`

**Что сделать:**

**1.1** На сервере добавить обработчик `chat:join`, чтобы клиент мог динамически присоединяться к комнате:
```typescript
socket.on('chat:join', (chatId: string) => {
  socket.join(`chat:${chatId}`);
  logger(`Socket ${socket.id} joined chat room ${chatId}`);
});
```

**1.2** В `message:send` автоматически присоединять сокет к комнате (на случай если join не успел):
```typescript
socket.on('message:send', async (data) => {
  socket.join(`chat:${data.chatId}`);  // <-- добавить эту строку
  // ... остальной код
});
```

**1.3** На клиенте, после создания чата (в `HomePage.tsx`, `handleChatCreated`), добавить вызов `socket.emit('chat:join', chat.id)`.

**Ожидаемый результат:** После создания нового чата/группы socket присоединяется к комнате, сообщения приходят в real-time.

**Тесты:** Ручная проверка: 1) создать новый чат 2) отправить сообщение 3) открыть второй браузер — должно прийти.

**Rollback:** `git checkout -- server/src/socket/index.ts client/src/components/HomePage.tsx`

---

### 🔴 Шаг 2: Починить групповые чаты

**Файлы:** `client/src/components/chat/CreateGroupModal.tsx`, `client/src/components/chat/CreateGroupModal.tsx`

**Что сделать:**

**2.1** Исправить silent catch — показывать ошибку пользователю:
```typescript
// Заменить:
catch {
  // silently fail
}
// На:
catch (err: any) {
  const msg = err.response?.data?.error || 'Failed to create group';
  alert(msg);  // или toast
}
```

**2.2** Уменьшить минимальное количество участников с 2 до 1:
```typescript
// Заменить:
if (selected.length < 2 || !groupName.trim()) return;
// На:
if (selected.length < 1 || !groupName.trim()) return;
```
Это позволит создавать группу из 2 человек (создатель + 1).

**2.3** Обновить текст кнопки и хинты, чтобы отражали новую логику.

**Ожидаемый результат:** Группа создаётся из 2+ человек, ошибки отображаются, сообщения приходят.

**Тесты:** Создать группу с 1 участником (2 человека всего) → должно работать.

**Rollback:** `git checkout -- client/src/components/chat/CreateGroupModal.tsx`

---

### 🟡 Шаг 3: Исправить вёрстку сообщений

**Файл:** `client/src/components/chat/ChatView.tsx`

**Что сделать:**

**3.1** Заменить `max-w-2xl mx-auto` на `max-w-4xl mx-auto` (расширить с 672px до ~896px), но только на десктопе.

**Вариант:** Убрать `max-w-2xl mx-auto` полностью, заменить на `px-4 md:px-8 lg:px-16`, чтобы сообщения растягивались на всю ширину с разумными отступами.

Итоговое изменение:
```typescript
// Было (строка 191):
<div className="max-w-2xl mx-auto">
// Стало:
<div className="max-w-5xl mx-auto px-4">
```

**3.2** `max-w-[75%]` на бабблах оставить — это стандарт мессенджеров.

**Ожидаемый результат:** На широком экране сообщения занимают больше места, нет гигантских пустых полей.

**Тесты:** Открыть на 1920x1080, проверить что бабблы выглядят естественно.

**Rollback:** `git checkout -- client/src/components/chat/ChatView.tsx`

---

### 🟡 Шаг 4: Добавить удаление диалога

**Файлы:** `server/src/routes/chatRoutes.ts`, `server/src/controllers/chatController.ts`, `server/src/services/chatService.ts`, `server/src/models/Chat.ts`, `server/src/socket/index.ts`, `client/src/components/chat/ChatList.tsx`, `client/src/types/index.ts`, `client/src/hooks/useChat.ts`

**Что сделать:**

**4.1** Сервер: добавить метод `deleteChat` в `chatService.ts`:
```typescript
export async function deleteChat(chatId: string, userId: string): Promise<void> {
  const chat = await ChatModel.findChatById(chatId);
  if (!chat) throw new Error('Chat not found');
  if (!chat.participantIds.includes(userId)) throw new Error('Not a participant');
  await ChatModel.removeChat(chatId);  // каскадно удалит participants + messages
}
```

**4.2** Сервер: добавить метод `removeChat` в `Chat.ts` model:
```typescript
export async function removeChat(chatId: string): Promise<void> {
  await pool.query('DELETE FROM chats WHERE id = $1', [chatId]);
}
```

**4.3** Сервер: добавить контроллер `deleteChat` в `chatController.ts`.

**4.4** Сервер: добавить роут `DELETE /:id` в `chatRoutes.ts`.

**4.5** Сервер: в `socket/index.ts` добавить событие `chat:deleted`:
```typescript
// В обработчике message:send, добавить отправку chat:deleted
// ИЛИ отдельный socket.on('chat:delete', ...) эндпоинт
socket.on('chat:delete', async (data: { chatId: string }) => {
  await chatService.deleteChat(data.chatId, userId);
  socket.to(`chat:${data.chatId}`).emit('chat:deleted', { chatId: data.chatId });
  socket.emit('chat:deleted', { chatId: data.chatId });
  socket.leave(`chat:${data.chatId}`);
});
```

**4.6** Клиент: в `ChatList.tsx` добавить кнопку удаления (через долгое нажатие или меню):
- При долгом нажатии на чат → показать "Delete chat"
- Подтверждение: "Are you sure?"
- Вызов `api.delete('/chats/' + chatId)`

**4.7** Клиент: в `useChat.ts` добавить обработчик socket `chat:deleted`, удаляющий чат из списка.

**4.8** Клиент: добавить тип `ChatDeleted` в `client/src/types/index.ts`.

**Ожидаемый результат:** Чат удаляется из БД, все участники видят его исчезновение.

**Тесты:** Создать чат → удалить → проверить что исчез из списка. Открыть второй браузер — чат тоже исчез.

**Rollback:** `git checkout -- server/src/ client/src/` (проверить конкретные файлы)

---

### 🟡 Шаг 5: Починить iOS Safari

**Файлы:** `client/src/components/chat/MessageInput.tsx`, `client/src/index.css`

**Что сделать:**

**5.1** В `MessageInput.tsx:203` — изменить размер шрифта на `text-base` (16px), чтобы iOS не зуммировал:
```typescript
// Было:
className="flex-1 bg-transparent focus:outline-none text-sm leading-5 py-0.5"
// Стало:
className="flex-1 bg-transparent focus:outline-none text-base leading-5 py-0.5"
```

**5.2** В `MessageInput.tsx:144` — добавить `safe-area-bottom` на форму:
```typescript
// Было:
<form onSubmit={handleSubmit} className="relative flex flex-col border-t ...">
// Стало:
<form onSubmit={handleSubmit} className="relative flex flex-col border-t ... safe-area-bottom">
```

**5.3** В `index.css` — `.safe-area-bottom` уже есть (строки 9-11), используется `env(safe-area-inset-bottom)`. Проверить что он корректно применяется.

**Ожидаемый результат:** На iOS Safari при фокусе на вводе не зуммирует, поле ввода не уходит под домашнюю линию iPhone.

**Тесты:** Открыть на iPhone (реальном или DevTools), нажать на ввод — страница не зумится, поле ввода видно.

**Rollback:** `git checkout -- client/src/components/chat/MessageInput.tsx client/src/index.css`

---

## Regression Checklist (ручная проверка на сервере)
- [ ] Bug #1: Регистрация нового пользователя — не затрагивалось
- [ ] Bug #2: Вход существующего пользователя — не затрагивалось
- [ ] Bug #3: 1-1 чат создаётся и сообщения отправляются — улучшено (socket join)
- [ ] Bug #4: Сообщения приходят в real-time (два браузера) — исправлено
- [ ] Bug #5: Изображения загружаются и отображаются — не затрагивалось
- [ ] Bug #6: Голосовые сообщения работают — не затрагивалось
- [ ] Bug #7: Реплаи работают — не затрагивалось
- [ ] Bug #8: Редактирование/удаление сообщений работает — не затрагивалось
- [ ] Bug #9: Online-статус работает — не затрагивалось
- [ ] Bug #10: Push-уведомления приходят — не затрагивалось
- [ ] Bug #11: Тёмная тема не сломана — не затрагивалось

## Влияние на документацию
- ✅ `fixer-brain.md` обновлён (история изменений, грабли, статус задач)
- ⏳ `ZOKUL.md` — нужно добавить метод `DELETE /api/chats/:id` в секцию API

## Затрагиваемые модули
- Сервер: socket, chatService, chatController, chatRoutes, Chat model
- Клиент: ChatView, ChatList, CreateGroupModal, MessageInput, HomePage, useChat, socket
- Стили: index.css
