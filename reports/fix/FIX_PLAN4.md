# Fix Plan: Fix Cycle #4 — 4 бага + тесты

## Root Cause
См. `reports/fix/DIAGNOSTIC4.md`

## Тип: Bug / Feature / Infra
## Severity: 🔴 Critical (Bug #1, #3) / 🟡 Major (Bug #2, #4)

## Success Criteria
- [x] Bug #1: При создании группы другие участники сразу видят её в списке чатов
- [x] Bug #2: По клику на фото открывается просмотрщик с возможностью закрыть/скачать
- [x] Bug #3: После 5 мин бездействия сообщения продолжают приходить (без F5)
- [x] Bug #4: В хедере группы показывается название группы, а не имя участника
- [x] Тесты: groupService.createGroup, upload endpoint — покрыты

## Шаги реализации

### Шаг 1: Bug #1 — chat:new-room handler
- **Файлы:** `client/src/hooks/useChat.ts`
- **Что сделать:** Добавить в `useChats()` хук обработчик `socket.on('chat:new-room', ...)` → вызывает `load()`. Добавить `chatId` в зависимости.
- **Ожидаемый результат:** При создании группы другие участники сразу получают её в списке
- **Тесты:** Ручная проверка: 2 браузера → создать группу → у второго появляется
- **Rollback:** `git checkout -- client/src/hooks/useChat.ts`

### Шаг 2: Bug #4 — Chat header для групп
- **Файлы:** `client/src/components/HomePage.tsx:132,206-213`
- **Что сделать:**
  - `displayName = selectedChat?.isGroup ? (selectedChat?.name || 'Group') : (otherUser?.name || 'Unknown')`
  - `Avatar name={displayName}`
  - OnlineDot только для !isGroup
  - Вместо "Online/Offline" для групп показать "Group"
- **Ожидаемый результат:** В хедере группы — название группы, без OnlineDot
- **Тесты:** Визуальная проверка
- **Rollback:** `git checkout -- client/src/components/HomePage.tsx`

### Шаг 3: Bug #2 — ImageViewer компонент
- **Файлы:** `client/src/components/chat/ImageViewer.tsx` (новый), `ChatView.tsx:231-237`
- **Что сделать:**
  - Создать ImageViewer modal: full-screen overlay с `<img>` в оригинальном размере, кнопка закрытия, кнопка скачать (через `<a download>`)
  - В ChatView.tsx: onClick на `<img>` → открывать ImageViewer с URL
- **Ожидаемый результат:** Клик на фото открывает просмотрщик, можно закрыть/скачать
- **Тесты:** Визуальная проверка
- **Rollback:** `git checkout -- client/src/components/chat/`

### Шаг 4: Bug #3 — nginx proxy_read_timeout
- **Файлы:** `client/nginx.local.conf:33`
- **Что сделать:** Добавить `proxy_read_timeout 86400s;` после `proxy_set_header`
- **Ожидаемый результат:** WebSocket не рвётся при простое
- **Тесты:** Проверка: подождать 2 мин, отправить сообщение — должно прийти
- **Rollback:** `git checkout -- client/nginx.local.conf`

### Шаг 5: Bug #3 — heartbeat + reconnect
- **Файлы:** `client/src/hooks/usePresence.ts`, `client/src/contexts/SocketContext.tsx`
- **Что сделать:**
  - Добавить heartbeat-интервал (каждые 25с шлём `heartbeat`)
  - В SocketContext: при reconnect форсировать новый стейт: `setSocket({...s})` или `setSocket(Object.create(s))`
- **Ожидаемый результат:** Presence не протухает, reconnect триггерит re-render
- **Тесты:** Ручная проверка
- **Rollback:** `git checkout -- client/src/`

### Шаг 6: Тест groupService.createGroup
- **Файлы:** `server/__tests__/groupService.test.ts` (новый)
- **Что сделать:** Написать тесты:
  - createGroup с валидными данными → возвращает ChatWithUsers с isGroup=true
  - createGroup с creatorId в participantIds → не дублируется
  - createGroup без name → что происходит (ожидаем ошибку? проверить)
- **Ожидаемый результат:** 3 теста, все проходят
- **Тесты:** `npx jest` → groupService tests pass
- **Rollback:** `git checkout -- server/__tests__/groupService.test.ts`

### Шаг 7: Тест upload endpoint
- **Файлы:** `server/__tests__/upload.test.ts` (новый)
- **Что сделать:** Написать тесты:
  - POST /api/upload с изображением → возвращает 200 + { url }
  - POST /api/upload без файла → возвращает 400
  - POST /api/upload с невалидным файлом → возвращает ошибку
- **Ожидаемый результат:** 3 теста, все проходят
- **Тесты:** `npx jest` → upload tests pass
- **Rollback:** `git checkout -- server/__tests__/upload.test.ts`

## Regression Checklist
- [x] Вход/регистрация
- [x] Создание 1-1 чата
- [x] Создание группы
- [x] Отправка текстовых сообщений (все участники)
- [x] Отправка изображений
- [x] Push-уведомления
- [x] Presence (online/offline)
- [x] Docker сборка

## Затрагиваемые модули
- useChat.ts — chat:new-room handler
- HomePage.tsx — header group fix
- ImageViewer.tsx — новый компонент
- ChatView.tsx — image click
- nginx.local.conf — proxy_read_timeout
- usePresence.ts — heartbeat
- SocketContext.tsx — reconnect fix

## Время оценки
- Шаг 1: ~5 мин
- Шаг 2: ~5 мин
- Шаг 3: ~15 мин
- Шаг 4: ~2 мин
- Шаг 5: ~10 мин
- Шаг 6: ~15 мин
- Шаг 7: ~15 мин
