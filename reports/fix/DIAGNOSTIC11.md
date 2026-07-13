# Диагностика #11: Production Polish

---

### A. 🟡 Нет поиска сообщений
**Место:** `server/src/models/Message.ts`, `server/src/services/messageService.ts`
**Root cause:** Нельзя найти сообщение по тексту в чате — нет ни эндпоинта, ни full-text search индекса.
**Что нужно:**
- Добавить `tsvector` колонку + GIN индекс в `messages` (миграция)
- `search(chatId, query, limit, offset)` в Message model
- `GET /api/chats/:chatId/search?q=...` endpoint
- Триггер на UPDATE/INSERT для автообновления tsvector

### B. 🟡 Нет request tracing (correlation ID)
**Место:** `server/src/index.ts`, `server/src/utils/logger.ts`
**Root cause:** В логах нет correlation ID — нельзя связать запросы в цепочку.
**Что нужно:**
- Middleware, назначающий `x-request-id` каждому запросу
- Логгер принимает опциональный requestId
- В ответе заголовок `x-request-id` для клиента

### C. 🟡 Нет загрузки аватара
**Место:** `client/src/components/profile/ProfileEditor.tsx`, `server/src/index.ts`
**Root cause:** Профиль можно обновить только через URL. Нет upload-аватара.
**Что нужно:**
- Client: кнопка "Upload avatar" → file input → upload → save URL
- Server: `POST /api/upload/avatar` — отдельный endpoint с sharp resize 256x256 + webp

### D. 🟢 Нет бэкапов БД
**Место:** Инфраструктура
**Root cause:** Нет скрипта резервного копирования PostgreSQL.
**Что нужно:**
- Shell-скрипт `scripts/backup-db.sh`
- `pg_dump` в `backups/` с таймстемпом

---

## Severity: 🟡 Major (A, B, C) + 🟢 Minor (D)
## Тип: Feature (A, C) + Infra (B, D)

## Затронутые файлы
- `server/src/config/db.ts` — миграция tsvector
- `server/src/models/Message.ts` — search()
- `server/src/services/messageService.ts` — searchMessages()
- `server/src/controllers/messageController.ts` — searchMessages()
- `server/src/routes/messageRoutes.ts` — GET /search
- `server/src/index.ts` — request tracing, avatar upload endpoint
- `server/src/utils/logger.ts` — requestId support
- `client/src/components/profile/ProfileEditor.tsx` — upload button
- `scripts/backup-db.sh` — новый

## Предварительный план
1. Message search — tsvector + search endpoint
2. Avatar upload — server endpoint + client UI
3. Request tracing (correlation ID)
4. Backup скрипт
5. Тесты + регрессия
