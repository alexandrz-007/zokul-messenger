# Fix Plan #8: Prod-readiness

## Root Cause
Из DIAGNOSTIC8.md — нет healthcheck, console.log, нет CI.

## Тип: Infra
## Severity: 🟡 Major

## Success Criteria
- [ ] `GET /health` возвращает 200 + `{ status: 'ok', uptime, db: 'connected' }`
- [ ] Docker healthcheck настроен и валидирует сервер
- [ ] Все логи в JSON-формате с level/timestamp/service/message
- [ ] GitHub Actions запускает npm ci → tsc → jest на каждый push
- [ ] Тесты health endpoint проходят

## Шаги реализации

### Шаг 1: Health endpoint + Docker healthcheck
- **Файлы:** `server/src/index.ts`, `server/src/routes/healthRoutes.ts` (новый), `docker-compose.local.yml`
- **Что сделать:**
  - Создать `GET /api/health` — проверяет БД (`SELECT 1`), возвращает `{ status, uptime, db }`
  - Добавить `healthcheck` в server service docker-compose.local.yml: `test: curl -f http://localhost:3001/api/health`
- **Rollback:** `git checkout -- server/src/index.ts docker-compose.local.yml`

### Шаг 2: Pino structured logging
- **Файлы:** `server/src/utils/logger.ts`, все файлы которые импортят logger
- **Что сделать:** Заменить console.log на pino. Сохранить тот же API: `logger(msg, level?)`. Добавить `pino-pretty` для dev.
- **Rollback:** `git checkout -- server/src/utils/logger.ts server/package.json`

### Шаг 3: GitHub Actions CI
- **Файлы:** `.github/workflows/ci.yml` (новый)
- **Что сделать:** workflow на push в master и PR: setup Node → npm ci → tsc → jest
- **Rollback:** `git rm .github/workflows/ci.yml`

### Шаг 4: Тесты
- **Файлы:** `server/__tests__/health.test.ts` (новый)
- **Что сделать:** Тесты health endpoint — проверка ответа 200
- **Rollback:** `git checkout -- server/__tests__/health.test.ts`

## Regression Checklist
- [ ] Сервер стартует без ошибок
- [ ] Все endpoint'ы работают
- [ ] Логи форматированы корректно
