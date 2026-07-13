# Fix Log: Fix Cycle #5 — UI + инфраструктура
# Дата: 2026-07-13
# Severity: 🔴 Critical

## Статус: ✅ Выполнен

---

### Шаг 1: Bug #5 — Input touch area — ✅
- **Файлы:** `MessageInput.tsx:197`
- **Типы:** ⏳ (будет)
- **Тесты:** ⏳ (ручная)
- **Заметки:** onClick → focus

### Шаг 2: Bug #6 — Input position — ✅
- **Файлы:** `MessageInput.tsx:144`
- **Заметки:** safe-area-bottom → pb-2

### Шаг 3: Bug #7 — Upload button — ✅
- **Файлы:** `MessageInput.tsx:173`
- **Заметки:** mb-0.5 → self-center

### Шаг 4: Bug #8 — DaySeparator — ✅
- **Файлы:** `ChatView.tsx:37-46`
- **Заметки:** убраны flex-1 h-px, my-4 → my-2

### Шаг 5: Bug #9 — Cleanup service — ✅
- **Файлы:** `server/src/services/cleanupService.ts` (новый), `server/src/index.ts:12,59`
- **Типы:** ⏳
- **Заметки:** cleanupOldFiles (3 дня) + startCleanupScheduler (каждые 6ч)

### Шаг 6: Bug #10 — Rate limiting — ✅
- **Файлы:** `server/src/middleware/rateLimit.ts` (новый), `server/src/index.ts:11,30,37`
- **Типы:** ✅ tsc --noEmit clean
- **Заметки:** authLimiter + uploadLimiter (100/15мин)

### Шаг 7: Bug #11 — DB Pool max — ✅
- **Файлы:** `server/src/config/db.ts:5`
- **Типы:** ✅ tsc --noEmit clean
- **Заметки:** `max: 20` добавлен

### Шаг 8: Typecheck — ✅
- **Клиент:** ✅ tsc --noEmit clean
- **Сервер:** ✅ tsc --noEmit clean

### Шаг 9: Tests — ✅
- **Файлы:** `server/__tests__/cleanupService.test.ts` (3 теста), `server/__tests__/rateLimit.test.ts` (2 теста)
- **Результат:** ✅ 20/20 passed (7 suites)

### Шаг 10: Docker — ✅
- **Результат:** ✅ 4/4 контейнера up, обе images пересобраны
- **Файлы:** `MessageInput.tsx:197`
- **Типы:** ⏳ (будет проверено в Шаг 8)
- **Тесты:** ⏳ (ручная проверка)
- **Проблемы:** —
- **Заметки:** Добавлен onClick на контейнер → focus input'а

