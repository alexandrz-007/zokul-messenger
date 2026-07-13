# Диагностика #6: UI улучшения + Critical safety gap + Infra hardening

## Вводные
Пользователь:
1. Поднять текст в MessageInput по центру по Y, сделать окно тоньше, увеличить скругление
2. Спросил что ещё может завалить сервер, что критическое осталось

## Проблемы

### A. UI — MessageInput
- **Текст:** `items-end` — прижат к низу коробки → визуально ниже центра
- **Толщина:** `py-2` (16px сверху/снизу) — можно тоньше
- **Скругление:** `rounded-2xl` (16px) — можно чуть больше

### B. 🔴 Socket message events — нет проверки участника чата
- **Место:** `server/src/socket/index.ts:92-130`
- **Root cause:** Socket-обработчики `message:send`, `message:edit`, `message:delete` не вызывают `checkParticipant` перед выполнением. REST-эндпоинты проверяют, сокет — нет. Любой авторизованный пользователь может писать/редактировать/удалять сообщения в любом чате.
- **Severity:** 🔴 Critical
- **Тип:** Security

### C. 🟡 express.json() без limit
- **Место:** `server/src/index.ts:30`
- **Root cause:** `express.json()` использует дефолтный лимит 100kb, без явной конфигурации и без обработчика ошибки `payload too large`.
- **Severity:** 🟡 Major
- **Тип:** Infra

### D. 🟡 Graceful shutdown не очищает cleanup scheduler
- **Место:** `server/src/index.ts:73-86`
- **Root cause:** `setInterval` в `cleanupService.ts` не сохраняет ссылку и не очищается при graceful shutdown → процесс не завершится, пока interval не сработает.
- **Severity:** 🟡 Major
- **Тип:** Bug

### E. 🟡 Последовательная загрузка изображений
- **Место:** `client/src/components/chat/MessageInput.tsx:68-72`
- **Root cause:** Цикл `for...of` с `await` — изображения грузятся по одному, а не параллельно.
- **Severity:** 🟢 Minor
- **Тип:** Performance

### F. 🟡 redis.keys() блокирует Redis
- **Место:** `server/src/services/presenceService.ts:35`
- **Root cause:** `redis.keys('online:*')` — O(N), блокирует Redis при 1000+ users. Нужен SCAN.
- **Severity:** 🟡 Major
- **Тип:** Performance

## Затронутые файлы
- `client/src/components/chat/MessageInput.tsx:197,204` — UI центрирование + толщина + скругление
- `server/src/socket/index.ts:92-130` — 🔴 checkParticipant
- `server/src/index.ts:30` — express.json limit
- `server/src/index.ts:73-86` — graceful shutdown cleanup interval
- `server/src/services/cleanupService.ts:43` — interval reference
- `server/src/services/presenceService.ts:35` — SCAN вместо KEYS
- `server/__tests__/socket.test.ts` (новый) — тесты checkParticipant
- `server/__tests__/presenceService.test.ts` (новый) — тесты SCAN

## Предварительный план
1. UI: `items-end` → `items-center`, `py-2` → `py-1`, `rounded-2xl` → `rounded-3xl` в MessageInput.tsx:197
2. Socket: добавить проверку participant в `message:send`, `message:edit`, `message:delete`
3. express.json: добавить `{ limit: '1mb' }` и `payloadTooLarge` handler
4. Graceful shutdown: сохранить interval reference из cleanupService, очищать в shutdown
5. Upload: `for...of` → `Promise.all`
6. presenceService: `redis.keys()` → `SCAN`
7. Тесты для каждого фикса
