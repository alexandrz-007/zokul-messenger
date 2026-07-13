# Fix Plan #10: Client Hardening

## Root Cause
Из DIAGNOSTIC10.md — 4 проблемы: компрессия, socket rate limit, клиентские тесты, any типы.

## Тип: Performance + Security + Quality
## Severity: 🟡 Major

## Success Criteria
- [ ] `compression` middleware активен на сервере (проверить header `content-encoding`)
- [ ] Socket connection rate limit: max 3 connection/s/user — превышение вызывает disconnect
- [ ] Клиентские тесты (vitest): AuthContext + LoginForm — минимум 3 теста
- [ ] В client/src нет `any` (кроме `window as any` для AudioContext)
- [ ] Все тесты проходят (server + client)
- [ ] tsc --noEmit чистый (server + client)

## Шаги реализации

### Шаг 1: Compression — сервер
- **Файлы:** `server/src/index.ts`, `server/package.json`
- **Что сделать:** Установить `compression`, добавить `app.use(compression())` после `helmet()`
- **Ожидаемый результат:** Все JSON-ответы с `Content-Encoding: gzip`
- **Тесты:** Ручная проверка `curl -H "Accept-Encoding: gzip" -I http://localhost:3001/api/health`
- **Rollback:** `git checkout -- server/src/index.ts server/package.json`

### Шаг 2: Socket connection rate limit
- **Файлы:** `server/src/socket/index.ts`
- **Что сделать:** Добавить Map `connectionCounts: Map<string, number[]>` + `io.use()` middleware, отклоняющий >3 подключений/сек с одного userId
- **Ожидаемый результат:** При 4+ `connect` за секунду — disconnect с ошибкой
- **Тесты:** Интеграционный тест
- **Rollback:** `git checkout -- server/src/socket/index.ts`

### Шаг 3: Клиентские тесты (vitest)
- **Файлы:** `client/src/__tests__/AuthContext.test.tsx` (новый), `client/src/__tests__/LoginForm.test.tsx` (новый)
- **Что сделать:** Написать тесты: AuthContext — login/logout/session restore; LoginForm — рендер, submit
- **Ожидаемый результат:** `vitest run` показывает 3+ проходящих теста
- **Тесты:** `npm test` в client/
- **Rollback:** `git checkout -- client/src/__tests__/`

### Шаг 4: Code quality — any → typed (client)
- **Файлы:** 7 файлов в client/src
- **Что сделать:** Заменить `catch (err: any)` → `catch (err: unknown)`, `msg: any` → `msg: Message`, `params: any` → типизировать
- **Ожидаемый результат:** Ни одного `: any` в client/src
- **Тесты:** `tsc --noEmit` + `vitest run`
- **Rollback:** `git checkout` по каждому файлу

### Шаг 5: Регрессия + Docker
- **Файлы:** —
- **Что сделать:** server tsc + client tsc + server tests + client tests + Docker rebuild
- **Ожидаемый результат:** Всё зелёное

## Regression Checklist
- [ ] Регистрация/логин
- [ ] Отправка сообщения
- [ ] Socket соединение
- [ ] Загрузка изображений
- [ ] Docker 4/4 healthy
