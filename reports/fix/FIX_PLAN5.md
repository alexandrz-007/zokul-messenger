# Fix Plan: Fix Cycle #5 — UI + инфраструктура

## Root Cause
См. `reports/fix/DIAGNOSTIC5.md`

## Severity: 🟡 Major / 🔴 Critical
## Тип: Bug / Infra

## Success Criteria
- [x] #5: Клик по padding'ам серого контейнера фокусирует input
- [x] #6: Input не прижат к низу экрана (нет safe-area-bottom на форме)
- [x] #7: Кнопка загрузки на одной линии с инпутом
- [x] #8: DaySeparator без серых линий, только время
- [x] #9: Файлы старше 3 дней удаляются из uploads/
- [x] #10: Rate limiting на /api/auth и /api/upload (100 запросов / 15 мин)
- [x] #11: DB Pool max: 20
- [x] #12: Тесты cleanup + rate limit

## Шаги реализации

### Шаг 1: Bug #5 — Input touch area
- **Файлы:** `MessageInput.tsx:197`
- **Что сделать:** Добавить `onClick` на серый контейнер → `inputRef.current?.focus()`
- **Ожидаемый результат:** Клик по области ввода (включая padding) фокусирует input
- **Тесты:** Ручная проверка
- **Rollback:** `git checkout -- client/src/components/chat/MessageInput.tsx`

### Шаг 2: Bug #6 — Input position
- **Файлы:** `MessageInput.tsx:144`
- **Что сделать:** Заменить `safe-area-bottom` на `pb-2`
- **Ожидаемый результат:** Input не прижат к низу
- **Тесты:** Визуальная проверка
- **Rollback:** `git checkout -- client/src/components/chat/MessageInput.tsx`

### Шаг 3: Bug #7 — Upload button
- **Файлы:** `MessageInput.tsx:173`
- **Что сделать:** `mb-0.5` → `self-center`
- **Ожидаемый результат:** Кнопка на одной линии с инпутом
- **Тесты:** Визуальная проверка
- **Rollback:** `git checkout -- client/src/components/chat/MessageInput.tsx`

### Шаг 4: Bug #8 — DaySeparator
- **Файлы:** `ChatView.tsx:39-45`
- **Что сделать:** Удалить оба `flex-1 h-px`, `my-4` → `my-2`
- **Ожидаемый результат:** Только время, без серых линий
- **Тесты:** Визуальная проверка
- **Rollback:** `git checkout -- client/src/components/chat/ChatView.tsx`

### Шаг 5: Bug #9 — Cleanup uploads/
- **Файлы:** `server/src/services/cleanupService.ts` (новый), `server/src/index.ts`
- **Что сделать:** 
  - Создать cleanupService с функцией удаления файлов старше 3 дней
  - Запускать при старте + setInterval каждые 6ч
- **Ожидаемый результат:** Файлы старше 3 дней удаляются
- **Тесты:** `cleanupService.test.ts`
- **Rollback:** `git checkout -- server/src/services/cleanupService.ts server/src/index.ts`

### Шаг 6: Bug #10 — Rate limiting
- **Файлы:** `server/src/middleware/rateLimit.ts` (новый), `server/src/index.ts`
- **Что сделать:** 
  - Создать middleware с `express-rate-limit` (100 запросов / 15 мин)
  - Применить на /api/auth и /api/upload
- **Ожидаемый результат:** >100 запросов → 429
- **Тесты:** `rateLimit.test.ts`
- **Rollback:** `git checkout -- server/src/`

### Шаг 7: Bug #11 — DB Pool max
- **Файлы:** `server/src/config/db.ts:4`
- **Что сделать:** `new Pool({ connectionString, max: 20 })`
- **Ожидаемый результат:** Pool ограничен 20 соединениями
- **Тесты:** Проверка импорта
- **Rollback:** `git checkout -- server/src/config/db.ts`

### Шаг 8: Bugs #5-8 — typecheck
- **Файлы:** client tsc --noEmit
- **Что сделать:** Проверить типы после всех UI изменений
- **Ожидаемый результат:** clean

### Шаг 9: Bug #12 — Tests
- **Файлы:** `server/__tests__/cleanupService.test.ts`, `server/__tests__/rateLimit.test.ts`
- **Что сделать:** Написать тесты для cleanupService и rateLimit middleware
- **Ожидаемый результат:** Все тесты проходят

### Шаг 10: Regression + Docker
- **Файлы:** Docker compose
- **Что сделать:** rebuild + up, проверить логи
- **Ожидаемый результат:** 4 контейнера up

## Regression Checklist
- [x] Отправка сообщений
- [x] Загрузка изображений
- [x] Создание групп/чатов
- [x] Docker сборка

## Затрагиваемые модули
- MessageInput.tsx — touch area, position, upload button
- ChatView.tsx — DaySeparator
- cleanupService.ts — новый
- rateLimit.ts — новый
- db.ts — pool max
- index.ts — подключение cleanup + rate limit
