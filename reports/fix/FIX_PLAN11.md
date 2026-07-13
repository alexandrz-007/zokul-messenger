# Fix Plan #11: Production Polish

## Root Cause
Из DIAGNOSTIC11.md — 4 проблемы: поиск сообщений, avatar upload, request tracing, бэкапы.

## Тип: Feature + Infra
## Severity: 🟡 Major

## Success Criteria
- [ ] `GET /api/chats/:chatId/search?q=...` возвращает сообщения (pg full-text)
- [ ] Аватар можно загрузить через ProfileEditor (file → upload → save)
- [ ] Каждый HTTP-запрос в логах имеет `requestId`
- [ ] `scripts/backup-db.sh` делает `pg_dump` в `backups/`
- [ ] Все тесты проходят (server 43 + client 4)
- [ ] tsc --noEmit чистый

## Шаги реализации

### Шаг 1: Message search — миграция + модель + endpoint
- **Файлы:** `server/src/config/db.ts`, `server/src/models/Message.ts`, `server/src/services/messageService.ts`, `server/src/controllers/messageController.ts`, `server/src/routes/messageRoutes.ts`
- **Что сделать:**
  1. Миграция: `text_search_vector tsvector` + GIN index + триггер auto-update
  2. `searchMessages(chatId, query, limit, offset)` в messageService
  3. `searchMessages` в messageController
  4. `GET /:chatId/search` в messageRoutes
- **Тесты:** Интеграционный тест search
- **Rollback:** `git checkout -- server/src/config/db.ts server/src/models/Message.ts server/src/services/messageService.ts server/src/controllers/messageController.ts server/src/routes/messageRoutes.ts`

### Шаг 2: Avatar upload
- **Файлы:** `server/src/index.ts`, `server/src/middleware/processImage.ts`, `client/src/components/profile/ProfileEditor.tsx`
- **Что сделать:**
  1. Server: `POST /api/upload/avatar` — authMiddleware + uploadMiddleware + sharp (256x256, webp) → возвращает `/uploads/{filename}`
  2. Client: ProfileEditor — кнопка "Change Avatar" → file input → upload → patch profile
- **Тесты:** Ручная проверка в браузере
- **Rollback:** `git checkout -- server/src/index.ts client/src/components/profile/ProfileEditor.tsx`

### Шаг 3: Request tracing (correlation ID)
- **Файлы:** `server/src/utils/logger.ts`, `server/src/index.ts`
- **Что сделать:**
  1. Logger: добавить `child({ requestId })` метод для корреляций
  2. Middleware: присваивает `x-request-id` каждому запросу (генерация или проброс из заголовка)
  3. В ответе проставлять `x-request-id`
- **Тесты:** Ручная проверка `curl -v http://localhost:3001/api/health`
- **Rollback:** `git checkout -- server/src/utils/logger.ts server/src/index.ts`

### Шаг 4: Backup скрипт
- **Файлы:** `scripts/backup-db.sh` (новый), `scripts/restore-db.sh` (новый)
- **Что сделать:** `pg_dump` в `backups/` с датой, README-инструкция в начале скрипта
- **Тесты:** Ручной запуск
- **Rollback:** `git rm scripts/`

### Шаг 5: Регрессия + Docker
- **Файлы:** —
- **Что сделать:** server tsc + client tsc + server tests + Docker rebuild

## Regression Checklist
- [ ] Регистрация/логин
- [ ] Отправка/поиск сообщений
- [ ] Обновление профиля + аватар
- [ ] Socket соединение
- [ ] Docker 4/4 healthy
