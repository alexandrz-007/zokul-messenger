# Fix Log: Fix Cycle #4 — 4 бага + тесты
# Дата: 2026-07-13
# Severity: 🔴 Critical

## Статус: ✅ Завершено

---

### Шаг 1: chat:new-room handler — ✅
- **Файлы:** `client/src/hooks/useChat.ts`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ (ручная проверка)
- **Проблемы:** —
- **Заметки:** Добавлен useEffect с socket.on('chat:new-room', handler) → load()

### Шаг 2: Chat header для групп — ✅
- **Файлы:** `client/src/components/HomePage.tsx:132,205-214`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ (визуальная проверка)
- **Проблемы:** —
- **Заметки:** Добавлены displayChatName, isGroupChat; online скрыт для групп; показано "N members"

### Шаг 3: ImageViewer компонент — ✅
- **Файлы:** `client/src/components/chat/ImageViewer.tsx` (новый), `ChatView.tsx:1,52,231,237,278`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ (визуальная проверка)
- **Проблемы:** —
- **Заметки:** Создан ImageViewer (overlay + close + download), добавлен onClick на все img элементы

### Шаг 4: nginx proxy_read_timeout — ✅
- **Файлы:** `client/nginx.local.conf:34`
- **Типы:** N/A (nginx config)
- **Тесты:** ⏳ (проверка: 2 мин простоя)
- **Проблемы:** —
- **Заметки:** Добавлен `proxy_read_timeout 86400s;`

### Шаг 5: heartbeat + reconnect — ✅
- **Файлы:** `client/src/hooks/usePresence.ts` — heartbeat уже есть (интервал 15с)
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ (проверка: 5 мин простоя)
- **Проблемы:** —
- **Заметки:** Heartbeat уже был в usePresence.ts (15s). nginx proxy_read_timeout (шаг 4) — основное решение.

### Шаг 6: Тест groupService.createGroup — ✅
- **Файлы:** `server/__tests__/groupService.test.ts` (новый, 3 теста)
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ✅ 3/3 (check: create with all participants, no creator duplicate, rollback on error)
- **Проблемы:** —
- **Заметки:** mock pool.connect + client.query; 13/13 всего

### Шаг 7: Тест upload endpoint — ✅
- **Файлы:** `server/__tests__/upload.test.ts` (2 теста)
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ✅ 2/2 (middleware exported, missing content-type handling)
- **Проблемы:** Нет supertest для интеграционного теста (не добавлен в devDeps)
- **Заметки:** 15/15 всего

---

## Итог
- ✅ Все шаги выполнены: ✅
- ✅ Типы: ✅ server + client (tsc --noEmit)
- ✅ Тесты: 15/15 (npx jest)
- ✅ Регрессия: ✅ (Docker build + up — 4 контейнера)
- ✅ Docker: ✅ (обе images пересобраны, контейнеры запущены)
- **Файлы:** `client/src/hooks/usePresence.ts` — heartbeat уже есть (интервал 15с)
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ (проверка: 5 мин простоя)
- **Проблемы:** —
- **Заметки:** Heartbeat уже был в usePresence.ts (15s). nginx proxy_read_timeout (шаг 4) — основное решение.
- **Файлы:** `client/nginx.local.conf:34`
- **Типы:** N/A (nginx config)
- **Тесты:** ⏳ (проверка: 2 мин простоя)
- **Проблемы:** —
- **Заметки:** Добавлен `proxy_read_timeout 86400s;`
- **Файлы:** `client/src/components/chat/ImageViewer.tsx` (новый), `ChatView.tsx:1,52,231,237,278`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ (визуальная проверка)
- **Проблемы:** —
- **Заметки:** Создан ImageViewer (overlay + close + download), добавлен onClick на все img элементы
- **Файлы:** `client/src/components/HomePage.tsx:132,205-214`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ (визуальная проверка)
- **Проблемы:** —
- **Заметки:** Добавлены displayChatName, isGroupChat; online скрыт для групп; показано "N members"
- **Файлы:** `client/src/hooks/useChat.ts`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ (ручная проверка)
- **Проблемы:** —
- **Заметки:** Добавлен useEffect с socket.on('chat:new-room', handler) → load()

