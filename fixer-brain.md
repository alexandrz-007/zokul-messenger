# Fixer Brain: Zokul

> Этот файл — постоянная память скилла project-fixer.
> Содержит контекст проекта, историю изменений и текущие задачи.
> Обновляется вручную project-fixer'ом после каждого цикла.

---

## О ПРОЕКТЕ

- **Название:** Zokul
- **URL:** https://zokul.zhichkin.space
- **Стек:** Node.js/Express/React/TypeScript/PostgreSQL/Redis/Socket.IO/Docker/Nginx
- **Назначение:** Корпоративный мессенджер PWA с real-time обменом сообщениями, изображениями, голосом
- **Текущая фаза:** Support / Maintenance (все фазы завершены)

---

## КЛЮЧЕВЫЕ ФАЙЛЫ И ИХ НАЗНАЧЕНИЕ

| Файл/Папка | Назначение |
|------------|------------|
| `server/src/index.ts` | Entry point сервера (Express + Socket.IO) |
| `server/src/socket/index.ts` | Socket.IO сервер (presence, messaging, typing) |
| `server/src/services/messageService.ts` | Бизнес-логика сообщений (create, edit, delete) |
| `server/src/services/chatService.ts` | Бизнес-логика чатов |
| `server/src/services/groupService.ts` | Бизнес-логика групп |
| `server/src/services/presenceService.ts` | Redis online-статус |
| `server/src/models/Message.ts` | Модель сообщений (raw SQL) |
| `server/src/models/Chat.ts` | Модель чатов (raw SQL) |
| `server/src/config/db.ts` | Миграции БД + Pool |
| `client/src/components/HomePage.tsx` | Главная страница (оркестратор) |
| `client/src/components/chat/ChatView.tsx` | Поток сообщений |
| `client/src/components/chat/ChatList.tsx` | Список чатов |
| `client/src/components/chat/MessageInput.tsx` | Поле ввода сообщения |
| `client/src/components/chat/CreateGroupModal.tsx` | Модалка создания группы |
| `client/src/components/layout/AppLayout.tsx` | Основной лейаут |
| `client/src/contexts/SocketContext.tsx` | Socket.IO контекст |
| `client/src/services/socket.ts` | Socket.IO клиент |
| `client/src/hooks/useChat.ts` | Хуки чатов/сообщений |
| `client/src/index.css` | Tailwind + глобальные стили |
| `client/index.html` | HTML entry point |

---

## ТЕКУЩИЙ СТАТУС

- **Последнее действие:** Исправлены 20 проблем (Fix Cycle #2)
- **Текущая задача:** — (все диагностированные проблемы исправлены)
- **Очередь:** Улучшения (админ панель, clean disk) — отложены

---

## АКТИВНЫЕ ЗАДАЧИ — ВСЕ ВЫПОЛНЕНЫ

Фикс-цикл #2 (20 проблем):
- 🔴 Critical: 3/3 — Error middleware, ErrorBoundary, group delete auth
- 🟠 High: 7/7 — AbortController, debounce cleanup, socket try/catch, AuthSocket, TOCTOU, graceful shutdown
- 🟡 Medium: 7/7 — helmet, crypto.randomUUID, inline errors, stable keys, aria-label, focus trap, query min length
- 🔵 Low: 3/3 — uploadImagesMiddleware removed, closeRedis in shutdown, safe JSON.parse

Подробности — `reports/fix/DIAGNOSTIC2.md` (38 проблем) и `reports/fix/FIX_PLAN2.md` (20 шагов)

| # | Задача | Статус | Severity | Тип |
|---|--------|--------|----------|-----|
| ~~1~~ | ~~Вёрстка сообщений: не по бокам, отступы~~ | ✅ Fixed | 🟡 Major | UX |
| ~~2~~ | ~~SMS не приходят в real-time~~ | ✅ Fixed | 🔴 Critical | Bug |
| ~~3~~ | ~~Групповые чаты не работают~~ | ✅ Fixed | 🔴 Critical | Bug |
| ~~4~~ | ~~Невозможно удалить диалог~~ | ✅ Fixed | 🟡 Major | Feature |
| ~~5~~ | ~~iOS Safari: layout плывёт~~ | ✅ Fixed | 🟡 Major | UX |

---

## ИСТОРИЯ ИЗМЕНЕНИЙ

| Дата | Изменение | Файлы | Статус |
|------|-----------|-------|--------|
| 2026-07-13 | Создан fixer-brain.md для работы project-fixer | `fixer-brain.md` | ✅ |
| 2026-07-13 | **Fix #1:** Расширил max-width для сообщений | `ChatView.tsx` | ✅ |
| 2026-07-13 | **Fix #2:** Добавил chat:join + auto-join в message:send | `socket/index.ts`, `HomePage.tsx` | ✅ |
| 2026-07-13 | **Fix #3:** Починил создание групп + уведомление участников | `CreateGroupModal.tsx`, `socket/index.ts` | ✅ |
| 2026-07-13 | **Fix #4:** REST DELETE + socket chat:delete + UI кнопка | 8 файлов (см. FIX_LOG.md) | ✅ |
| 2026-07-13 | **Fix #5:** iOS Safari safe-area-bottom + text-base 16px | `MessageInput.tsx` | ✅ |
| 2026-07-13 | **Cycle #2: Fix #6:** Error middleware string sync | `errorMiddleware.ts` | ✅ |
| 2026-07-13 | **Cycle #2: Fix #7:** ErrorBoundary | `ErrorBoundary.tsx`, `main.tsx` | ✅ |
| 2026-07-13 | **Cycle #2: Fix #8:** Group delete — creator only | `chatService.ts`, `db.ts`, `types`, `Chat.ts` | ✅ |
| 2026-07-13 | **Cycle #2: Fix #9:** AbortController for message loading | `useChat.ts` | ✅ |
| 2026-07-13 | **Cycle #2: Fix #10:** Debounce cleanup on unmount | `CreateChatModal`, `CreateGroupModal` | ✅ |
| 2026-07-13 | **Cycle #2: Fix #11:** Socket try/catch for presence + chat load | `socket/index.ts` | ✅ |
| 2026-07-13 | **Cycle #2: Fix #12:** AuthSocket type | `socket/index.ts` | ✅ |
| 2026-07-13 | **Cycle #2: Fix #13:** TOCTOU deleteMessage | `messageService.ts` | ✅ |
| 2026-07-13 | **Cycle #2: Fix #14:** graceful shutdown | `index.ts` | ✅ |
| 2026-07-13 | **Cycle #2: Fix #15:** helmet, crypto.randomUUID, dead code, inline errors, aria-labels, focus trap, query min length | Multiple files | ✅ |

---

## ГРАБЛИ (что пошло не так и запомнилось)

1. Socket.IO rooms — комнаты join только при connect; новые чаты не попадают. Решение: client emit `chat:join` после создания + auto-join в `message:send` как fallback.
2. Group participants — при создании группы другие участники не присоединяются к комнате. Решение: userSockets Map + `chat:created` event.
3. npm из PowerShell не работает (ExecutionPolicy) — использовать `cmd /c`.
4. Error middleware — строки ошибок могут рассинхронизироваться (hardcoded string comparison). Решение: enum ошибок или custom error classes с кодом.
5. In-memory socket Map ломается в multi-instance. Решение: Redis-based pub/sub (Socket.IO Redis adapter) для продакшена.
6. setTimeout без cleanup → setState после unmount. Решение: всегда возвращать `clearTimeout` из useEffect.

---

## ЗАМЕЧЕННЫЕ ПРОБЛЕМЫ (не в работе)

Пока нет.
