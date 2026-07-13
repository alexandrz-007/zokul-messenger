# Fix Log #6: UI + Critical Security + Infra Hardening
# Дата: 2026-07-13
# Severity: 🔴 Critical

## Статус: ✅ Выполнен

---

### Шаг 1: UI — MessageInput — ✅
- **Файлы:** `MessageInput.tsx:197`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳
- **Заметки:** items-end → items-center, py-2 → py-1, rounded-2xl → rounded-3xl

### Шаг 2: 🔴 Socket checkParticipant — ✅
- **Файлы:** `server/src/socket/index.ts:93-102,115-123,132-140`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ✅ (socket.test.ts — 3 теста: participant, non-participant, null chat)
- **Заметки:** Добавлена проверка participantIds.includes(userId) в message:send, message:edit, message:delete

### Шаг 3: express.json() limit 1mb + payloadTooLarge — ✅
- **Файлы:** `server/src/index.ts:30-35`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ (ручная проверка)
- **Заметки:** limit '1mb' + middleware проверяет err.type === 'entity.too.large'

### Шаг 4: Graceful shutdown — cleanup interval — ✅
- **Файлы:** `server/src/services/cleanupService.ts:34-51`, `server/src/index.ts:20,78`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ✅ (cleanupService.test.ts — 2 теста: start/stop)
- **Заметки:** startCleanupScheduler → cleanupTimer, stopCleanupScheduler → clearInterval

### Шаг 5: Parallel image upload — ✅
- **Файлы:** `client/src/components/chat/MessageInput.tsx:68-73`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ (ручная проверка)
- **Заметки:** for...of + await → Promise.all

### Шаг 6: redis.keys() → SCAN — ✅
- **Файлы:** `server/src/services/presenceService.ts:33-43`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ✅ (presenceService.test.ts — 8 тестов: SCAN, setOnline, setOffline, isOnline, getOnlineUsers)
- **Заметки:** Итеративный SCAN с пагинацией (COUNT 100), не блокирует Redis

### Шаг 7: Tests — ✅
- **Файлы:**
  - `server/__tests__/socket.test.ts` (новый, 3 теста — participant check)
  - `server/__tests__/presenceService.test.ts` (новый, 8 тестов — SCAN + presence CRUD)
  - `server/__tests__/cleanupService.test.ts` (дополнено, 2 теста — start/stop scheduler)
- **Результат:** ✅ 33/33 passed (9 suites)

---
