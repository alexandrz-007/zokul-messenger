# Summary #11: Production Polish

## Статус: ✅ Успешно

## Что сделано

### 🟡 Message search (pg full-text)
- Миграция: `text_search_vector tsvector` + GIN index + триггер auto-update на INSERT/UPDATE text
- `MessageModel.search(chatId, query, limit, offset)` — ts_query с prefix matching
- `GET /api/chats/:chatId/messages/search?q=...` endpoint (с checkParticipant)
- Результаты сортируются по `ts_rank`

### 🟡 Avatar upload
- Server: `POST /api/upload/avatar` — auth → multer → sharp (256x256, cover, webp 80) → auto-update profile
- Client: ProfileEditor — кнопка "+" на аватаре → file picker → upload → save URL
- Avatar показывается сразу после загрузки

### 🟡 Request tracing
- Middleware: читает/создаёт `x-request-id` (uuid), проставляет в ответ
- Logger: принимает `requestId` как третий параметр, логи через pino содержат `{ requestId }`
- Можно трейсить цепочку запросов

### 🟢 Backup scripts
- `scripts/backup-db.sh` — pg_dump с таймстемпом
- `scripts/restore-db.sh` — восстановление с подтверждением
- Используют `$DATABASE_URL` с fallback на localhost:5433

## Результаты тестов
- **Server: 43/43 passed (12 suites)**
- **Client: 4/4 passed (2 test files)**
- TypeScript: ✅ clean (server + client)

## Docker
- ✅ Server image rebuilt, 4/4 контейнера up + healthy
- ✅ Миграция выполнится при старте (ALTER TABLE + CREATE INDEX + триггер)

## Новые файлы
- `scripts/backup-db.sh`
- `scripts/restore-db.sh`
- `reports/fix/SUMMARY11.md`

## Изменённые файлы
- `server/src/config/db.ts` — tsvector + GIN + триггер
- `server/src/models/Message.ts` — search()
- `server/src/services/messageService.ts` — searchMessages()
- `server/src/controllers/messageController.ts` — searchMessages()
- `server/src/routes/messageRoutes.ts` — GET /search
- `server/src/index.ts` — avatar upload endpoint, request tracing middleware
- `server/src/utils/logger.ts` — requestId support
- `server/src/middleware/processImage.ts` — processAvatar (256x256)
- `client/src/components/profile/ProfileEditor.tsx` — avatar upload UI

## Обновлена документация
- ✅ fixer-brain.md
- ✅ FIX_LOG11.md
- ✅ SUMMARY11.md
