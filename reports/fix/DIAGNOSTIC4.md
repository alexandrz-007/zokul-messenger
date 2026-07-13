# Диагностика: Fix Cycle #4 — 4 бага (группы, фото, websocket, хедер)

## Вводные
1. Группа не отображается у других участников (чат не приходит)
2. Фото нельзя открыть/скачать (нет просмотрщика)
3. WebSocket отваливается через ~2 мин бездействия
4. В хедере чата в разных чатах одно и то же имя (для групп — имя первого участника вместо названия группы)

---

## Bug #1: Группа не отображается у других участников

### Root Cause
- **Место:** `client/src/` — нет обработчика `chat:new-room`
- **Причина:** Сервер шлёт `chat:new-room` другим участникам при создании группы (`socket/index.ts:150`), но на клиенте никто его не ловит. Чат не добавляется в список, сообщения в него не приходят. Появляется только после F5.

### Severity: 🔴 Critical | Тип: Bug

---

## Bug #2: Фото нельзя открыть/скачать

### Root Cause
- **Место:** `ChatView.tsx:231-237`
- **Причина:** У `<img>` `cursor-pointer` есть, но `onClick` нет. Нет компонента-просмотрщика (lightbox).

### Severity: 🟡 Major | Тип: Feature

---

## Bug #3: WebSocket отваливается через ~2 мин бездействия

### Root Cause
- **Место:** `nginx.local.conf:29-34` — нет `proxy_read_timeout`
- **Причина:** Nginx закрывает WebSocket через 60с (дефолт). Socket.IO переподключается, но `setSocket(s)` с тем же объектом не триггерит re-render React. Дополнительно: клиент не шлёт `heartbeat`, presence протухает за 30с.

### Severity: 🔴 Critical | Тип: Infra (Bug)

---

## Bug #4: В хедере чата для групп — имя участника вместо названия

### Root Cause
- **Место:** `HomePage.tsx:132,206-207,211,213`
- **Причина:** `otherUser = selectedChat?.participants.find(p => p.id !== user?.id)` — для групп находит первого не-self участника. `otherUser.name` показывается без проверки `chat.isGroup`. OnlineDot и "Online/Offline" тоже показываются для групп.

### Severity: 🟡 Major | Тип: Bug

---

## Затронутые файлы
- `server/src/socket/index.ts:140-154` — `chat:created` handler
- `client/src/contexts/SocketContext.tsx` — reconnect handler
- `client/src/components/HomePage.tsx:132,206-213` — chat header (group name)
- `client/src/components/chat/ChatView.tsx:231-237` — image click handler
- `client/nginx.local.conf:29-34` — proxy_read_timeout

## Предварительный план
1. **Bug #1 (группы):** Добавить в `useChats()` хук обработчик `chat:new-room` → `reloadChats()`
2. **Bug #2 (фото):** Добавить ImageViewer модалку, onClick на изображения
3. **Bug #3 (websocket):** `proxy_read_timeout 86400s` в nginx, heartbeat-интервал на клиенте, reconnect с новым объектом сокета
4. **Bug #4 (хедер):** Для групп показывать `chat.name`, скрыть OnlineDot и статус
5. **Тесты:** Написать тесты для groupService.createGroup, upload endpoint, Socket.IO chat:created

## Вопросы к пользователю
- [ ] Утвердить план?
