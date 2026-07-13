# Диагностика #8: Prod-readiness

## Вводные
Подготовить проект к продакшену: healthcheck, логи, CI.

---

### A. 🟡 Нет health endpoint и Docker healthcheck
**Место:** `docker-compose.local.yml`, `server/src/index.ts`
**Root cause:** Docker не знает жив ли сервер (только что порт открыт). Нет `GET /health`, нет `healthcheck` в compose.

### B. 🟡 Console.log как логгер
**Место:** `server/src/utils/logger.ts`
**Root cause:** `console.log` без структуры — нельзя фильтровать, парсить, агрегировать. В проде нужен JSON-logging (level, timestamp, service, message, metadata).

### C. 🟢 Нет CI
**Место:** `.github/workflows/`
**Root cause:** Нет автоматической проверки при пуше. Каждый коммит может сломать сборку/тесты.

---

## Severity: 🟡 Major (A, B) + 🟢 Minor (C)
## Тип: Infra

## Затронутые файлы
- `server/src/index.ts` — health endpoint
- `server/src/routes/healthRoutes.ts` (новый)
- `docker-compose.local.yml` — healthcheck
- `docker-compose.prod.yml` — healthcheck (если используется)
- `server/src/utils/logger.ts` — pino
- `server/__tests__/health.test.ts` (новый)
- `.github/workflows/ci.yml` (новый)

## Предварительный план
1. `GET /health` — проверка БД ping + uptime
2. Docker healthcheck — `curl -f http://localhost:3001/health` 
3. Pino — замена console.log, JSON-логи
4. GitHub Actions — CI: npm ci → tsc → test
5. Тесты health endpoint
