# Fix Plan #6: UI + Critical Security + Infra Hardening

## Problems
- **A:** UI — MessageInput: текст не по центру, толстый, скругление
- **B:** 🔴 Socket message:send/edit/delete — нет проверки participant чата
- **C:** express.json() без limit
- **D:** Graceful shutdown не чистит cleanup interval
- **E:** Последовательная загрузка изображений (for...of + await)
- **F:** redis.keys() блокирует Redis при 1000+ users

## Тип: Mixed (Security/Performance/UX/Infra)
## Severity: 🔴 Critical (B) + 🟡 Major (C,D,F) + 🟢 Minor (A,E)

## Success Criteria
- [ ] Текст в MessageInput по центру по Y, py-2 → py-1, rounded-2xl → rounded-3xl
- [ ] Socket message:send/edit/delete проверяют participant чата, иначе 403
- [ ] express.json() с явным limit '1mb' + payloadTooLarge handler
- [ ] Cleanup interval очищается при graceful shutdown
- [ ] Image upload параллельный через Promise.all
- [ ] getAllOnlineUserIds использует SCAN вместо KEYS
- [ ] Все тесты проходят (20 + новые)
- [ ] tsc --noEmit чистый (client + server)

## Шаги реализации

### Шаг 1: UI — MessageInput центрирование + толщина + скругление
- **Файлы:** `client/src/components/chat/MessageInput.tsx:197,204`
- **Что сделать:** `items-end` → `items-center`, `py-2` → `py-1`, `rounded-2xl` → `rounded-3xl`
- **Ожидаемый результат:** Текст по центру, окно тоньше, края более скруглённые
- **Тесты:** `tsc --noEmit` client
- **Rollback:** `git checkout -- client/src/components/chat/MessageInput.tsx`

### Шаг 2: 🔴 Socket — checkParticipant для message:send/edit/delete
- **Файлы:** `server/src/socket/index.ts:92-130`
- **Что сделать:** В каждый обработчик (`message:send`, `message:edit`, `message:delete`) добавить вызов `chatModel.findChatById(data.chatId)` и проверку `chat.participantIds.includes(userId)`. Если не участник — `socket.emit('error', { message: 'Forbidden' })` и return.
- **Ожидаемый результат:** Только участники чата могут писать/редактировать/удалять сообщения через socket
- **Тесты:** `server/__tests__/socket.test.ts` — проверить что не-участник получает 403
- **Rollback:** `git checkout -- server/src/socket/index.ts`

### Шаг 3: express.json() limit + payloadTooLarge
- **Файлы:** `server/src/index.ts:30`
- **Что сделать:** `app.use(express.json({ limit: '1mb' }))` + добавить middleware payloadTooLarge до errorMiddleware
- **Ожидаемый результат:** Запросы >1mb получают 413 Payload Too Large
- **Тесты:** ручная проверка (curl)
- **Rollback:** `git checkout -- server/src/index.ts`

### Шаг 4: Graceful shutdown — cleanup interval
- **Файлы:** `server/src/services/cleanupService.ts:43`, `server/src/index.ts:61,73-86`
- **Что сделать:** `startCleanupScheduler()` возвращает `NodeJS.Timeout`, сохранить в переменную на уровне модуля, очищать в `gracefulShutdown`
- **Ожидаемый результат:** При SIGTERM/SIGINT interval останавливается
- **Тесты:** `server/__tests__/cleanupService.test.ts` — проверить что scheduler возвращает timer
- **Rollback:** `git checkout -- server/src/services/cleanupService.ts server/src/index.ts`

### Шаг 5: Parallel image upload
- **Файлы:** `client/src/components/chat/MessageInput.tsx:68-72`
- **Что сделать:** Заменить `for...of` + `await` на `Promise.all` для загрузки изображений
- **Ожидаемый результат:** Все изображения грузятся параллельно
- **Тесты:** ручная проверка
- **Rollback:** `git checkout -- client/src/components/chat/MessageInput.tsx`

### Шаг 6: redis.keys() → SCAN
- **Файлы:** `server/src/services/presenceService.ts:33-36`
- **Что сделать:** Заменить `redis.keys()` на цикл с `redis.scan()` — итеративный обход без блокировки
- **Ожидаемый результат:** getAllOnlineUserIds не блокирует Redis
- **Тесты:** `server/__tests__/presenceService.test.ts` — проверить что возвращает корректные ID
- **Rollback:** `git checkout -- server/src/services/presenceService.ts`

### Шаг 7: Тесты
- **Файлы:** `server/__tests__/socket.test.ts`, `server/__tests__/presenceService.test.ts`, `server/__tests__/cleanupService.test.ts` (дополнение)
- **Что сделать:**
  - socket.test.ts: проверить что не-участник получает ошибку при message:send
  - presenceService.test.ts: проверить getAllOnlineUserIds (mock redis)
  - cleanupService.test.ts: проверить что startCleanupScheduler возвращает timer
- **Ожидаемый результат:** Все тесты проходят

## Regression Checklist
- [ ] Регистрация и вход
- [ ] Создание чата (1-1 и group)
- [ ] Отправка сообщения (участником)
- [ ] Отправка сообщения (не участником) — ❌ Forbidden
- [ ] Редактирование и удаление сообщения
- [ ] Загрузка изображений (одиночная и множественная)
- [ ] Online/offline статус
- [ ] Graceful shutdown (Ctrl+C)

## Затрагиваемые модули
- `client/components/chat/MessageInput` — UI + upload
- `server/socket/index` — 🔴 checkParticipant
- `server/index` — express limit + graceful shutdown + cleanup
- `server/services/cleanupService` — interval reference
- `server/services/presenceService` — SCAN
