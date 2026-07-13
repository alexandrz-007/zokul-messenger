# Summary: Fix Cycle #4 — 4 бага + тесты

## Статус: ✅ Успешно

## Что сделано
- **Bug #1 (группы):** Добавлен `chat:new-room` handler в `useChats()` — при создании группы другие участники сразу получают её в список
- **Bug #2 (фото):** Создан `ImageViewer` компонент (full-screen overlay + close + download), добавлен `onClick` на все изображения в `ChatView.tsx`
- **Bug #3 (websocket):** Добавлен `proxy_read_timeout 86400s` в `nginx.local.conf` — WebSocket не рвётся при простое
- **Bug #4 (хедер):** В `HomePage.tsx` заголовок чата для групп показывает название группы, скрыт OnlineDot, вместо статуса — "N members"
- **Тесты:**
  - `groupService.test.ts` — 3 теста (создание группы, no duplicate creator, rollback on error)
  - `upload.test.ts` — 2 теста (middleware экспортирован, обработка без content-type)

## Результаты тестов
- Unit: 15/15 passed (+5 новых тестов)
- TypeScript (server): ✅ clean
- TypeScript (client): ✅ clean
- Docker: ✅ обе images закешированы, 4 контейнера up

## Регрессия
- [x] Вход/регистрация
- [x] Создание 1-1 чата
- [x] Создание группы
- [x] Отправка сообщений (все участники)
- [x] Просмотр/скачивание фото
- [x] Docker сборка

## Изменённые файлы
- `client/src/hooks/useChat.ts` — chat:new-room handler
- `client/src/components/HomePage.tsx:132,205-214` — header group fix
- `client/src/components/chat/ImageViewer.tsx` — новый компонент
- `client/src/components/chat/ChatView.tsx:1,52,231,237,278` — image click + viewer
- `client/nginx.local.conf:34` — proxy_read_timeout
- `server/__tests__/groupService.test.ts` — новый (3 теста)
- `server/__tests__/upload.test.ts` — новый (2 теста)

## Обновлена документация
- [x] fixer-brain.md — история, статус, грабли
- [ ] ZOKUL.md — не требуется
- [ ] docs/ — не требуется

## Примечания
- `proxy_read_timeout 86400s` — основное решение проблемы WebSocket disconnect. Heartbeat (каждые 15с) уже был в usePresence.ts.
- ImageViewer — простой overlay без зависимостей, закрытие по Escape/клик вне, скачивание через `<a download>`
