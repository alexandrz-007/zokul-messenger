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

- **Последнее действие:** Cycle #7: Security Hardening — httpOnly cookie, requireEnv, socket rate limit, hide email
- **Текущая задача:** — (все диагностированные проблемы исправлены)
- **Очередь:** Улучшения (админ панель, clean disk) — отложены

---

## АКТИВНЫЕ ЗАДАЧИ — ВСЕ ВЫПОЛНЕНЫ

### Фикс-цикл #2 (20 проблем)
- 🔴 Critical: 3/3 • 🟠 High: 7/7 • 🟡 Medium: 7/7 • 🔵 Low: 3/3
- `reports/fix/DIAGNOSTIC2.md` • `reports/fix/FIX_PLAN2.md`

### Фикс-цикл #3 (4 проблемы)
- 🟡 Major: 4/4 — Push notification deep link, group display, padding, uploads dir
- `reports/fix/DIAGNOSTIC3.md` • `reports/fix/FIX_PLAN3.md`

### Фикс-цикл #4 (4 проблемы + 5 тестов)
- 🟡 Major: 4/4 — chat:new-room, ImageViewer, nginx timeout, header group
- `reports/fix/DIAGNOSTIC4.md` • `reports/fix/FIX_PLAN4.md`

### Фикс-цикл #5 (7 проблем + 5 тестов)
- 🟡 UI: 4/4 — input touch, input position, upload button, DaySeparator
- 🟢 Infra: 3/3 — cleanup, rate_limit, pool_max
- `reports/fix/DIAGNOSTIC5.md` • `reports/fix/FIX_PLAN5.md` • `reports/fix/FIX_LOG5.md`

| # | Задача | Статус | Severity | Тип |
|---|--------|--------|----------|-----|
| ~~1~~ | ~~Вёрстка сообщений: не по бокам, отступы~~ | ✅ Fixed | 🟡 Major | UX |
| ~~2~~ | ~~SMS не приходят в real-time~~ | ✅ Fixed | 🔴 Critical | Bug |
| ~~3~~ | ~~Групповые чаты не работают~~ | ✅ Fixed | 🔴 Critical | Bug |
| ~~4~~ | ~~Невозможно удалить диалог~~ | ✅ Fixed | 🟡 Major | Feature |
| ~~5~~ | ~~iOS Safari: layout плывёт~~ | ✅ Fixed | 🟡 Major | UX |
| ~~6~~ | ~~Push notification → не открывает чат~~ | ✅ Fixed | 🟡 Major | UX |
| ~~7~~ | ~~Группы показываются как 1-1 в списке~~ | ✅ Fixed | 🟡 Major | Bug |
| ~~8~~ | ~~Сообщения с большими отступами~~ | ✅ Fixed | 🟢 Minor | UX |
| ~~9~~ | ~~Загрузка фото не работает~~ | ✅ Fixed | 🟡 Major | Bug |
| ~~10~~ | ~~Input touch area~~ | ✅ Fixed | 🟢 Minor | UX |
| ~~11~~ | ~~Input position (safe-area-bottom)~~ | ✅ Fixed | 🟢 Minor | UX |
| ~~12~~ | ~~Upload button alignment~~ | ✅ Fixed | 🟢 Minor | UX |
| ~~13~~ | ~~DaySeparator lines~~ | ✅ Fixed | 🟢 Minor | UX |
| ~~14~~ | ~~Cleanup uploads/~~ | ✅ Fixed | 🟡 Major | Infra |
| ~~15~~ | ~~Rate limiting~~ | ✅ Fixed | 🟡 Major | Infra |
| ~~16~~ | ~~DB Pool max: 20~~ | ✅ Fixed | 🟡 Major | Infra |

### Фикс-цикл #6 (6 проблем + 13 тестов)
- 🔴 Security: 1/1 — Socket checkParticipant
- 🟡 Infra: 3/3 — JSON limit, Graceful shutdown, SCAN
- 🟢 UI/Perf: 2/2 — MessageInput, upload parallel
- `reports/fix/DIAGNOSTIC6.md` • `reports/fix/FIX_PLAN6.md` • `reports/fix/FIX_LOG6.md`

| # | Задача | Статус | Severity | Тип |
|---|--------|--------|----------|-----|
| ~~1~~ | ~~MessageInput центрирование + тоньше + скругление~~ | ✅ Fixed | 🟢 Minor | UX |
| ~~2~~ | ~~Socket checkParticipant (message:send/edit/delete)~~ | ✅ Fixed | 🔴 Critical | Security |
| ~~3~~ | ~~express.json() limit '1mb'~~ | ✅ Fixed | 🟡 Major | Infra |
| ~~4~~ | ~~Graceful shutdown — cleanup interval~~ | ✅ Fixed | 🟡 Major | Bug |
| ~~5~~ | ~~Parallel image upload~~ | ✅ Fixed | 🟢 Minor | Performance |
| ~~6~~ | ~~redis.keys() → SCAN~~ | ✅ Fixed | 🟡 Major | Performance |

### Фикс-цикл #7 (4 проблемы + 5 тестов)
- 🔴 Security: 2/2 — httpOnly cookie, requireEnv
- 🟡 Security: 2/2 — socket rate limit, hide email
- `reports/fix/DIAGNOSTIC7.md` • `reports/fix/FIX_PLAN7.md` • `reports/fix/FIX_LOG7.md`

| # | Задача | Статус | Severity | Тип |
|---|--------|--------|----------|-----|
| ~~1~~ | ~~JWT httpOnly cookie~~ | ✅ Fixed | 🔴 Critical | Security |
| ~~2~~ | ~~Fallback secrets → throw~~ | ✅ Fixed | 🔴 Critical | Security |
| ~~3~~ | ~~Socket rate limiting (5/s)~~ | ✅ Fixed | 🟡 Major | Security |
| ~~4~~ | ~~User search — hide email~~ | ✅ Fixed | 🟡 Major | Security |

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
| 2026-07-13 | **Cycle #3: Bug #1:** Push notification deep link — URL param handler | `HomePage.tsx` | ✅ |
| 2026-07-13 | **Cycle #3: Bug #2:** Group display in ChatList — name, avatar, no online dot | `ChatList.tsx` | ✅ |
| 2026-07-13 | **Cycle #3: Bug #3:** Message padding — removed max-w-4xl | `ChatView.tsx` | ✅ |
| 2026-07-13 | **Cycle #3: Bug #4:** Upload dir auto-create on server start | `server/src/index.ts` | ✅ |
| 2026-07-13 | **Cycle #4: Bug #1:** chat:new-room handler → reload chats | `useChat.ts` | ✅ |
| 2026-07-13 | **Cycle #4: Bug #2:** ImageViewer (full-screen + download) | `ImageViewer.tsx`, `ChatView.tsx` | ✅ |
| 2026-07-13 | **Cycle #4: Bug #3:** nginx proxy_read_timeout 86400s | `nginx.local.conf` | ✅ |
| 2026-07-13 | **Cycle #4: Bug #4:** Chat header — group name, no OnlineDot | `HomePage.tsx` | ✅ |
| 2026-07-13 | **Cycle #4: Tests:** groupService (3 tests) + upload (2 tests) | `__tests__/` | ✅ |
| 2026-07-13 | **Cycle #5: Bug #5:** Input touch area — onClick → focus | `MessageInput.tsx` | ✅ |
| 2026-07-13 | **Cycle #5: Bug #6:** Input position — safe-area-bottom → pb-2 | `MessageInput.tsx` | ✅ |
| 2026-07-13 | **Cycle #5: Bug #7:** Upload button — mb-0.5 → self-center | `MessageInput.tsx` | ✅ |
| 2026-07-13 | **Cycle #5: Bug #8:** DaySeparator — убраны линии, my-4 → my-2 | `ChatView.tsx` | ✅ |
| 2026-07-13 | **Cycle #5: Bug #9:** Cleanup uploads/ — cleanupService | `cleanupService.ts`, `index.ts` | ✅ |
| 2026-07-13 | **Cycle #5: Bug #10:** Rate limiting — express-rate-limit | `rateLimit.ts`, `index.ts` | ✅ |
| 2026-07-13 | **Cycle #5: Bug #11:** DB Pool max: 20 | `db.ts` | ✅ |
| 2026-07-13 | **Cycle #5: Tests:** cleanupService (3) + rateLimit (2) | `__tests__/` | ✅ |
| 2026-07-13 | **Cycle #6: UI:** MessageInput — центр, тоньше, скругление | `MessageInput.tsx:197` | ✅ |
| 2026-07-13 | **Cycle #6: 🔴 Fix:** Socket checkParticipant (message:send/edit/delete) | `socket/index.ts:93-140` | ✅ |
| 2026-07-13 | **Cycle #6: Fix:** express.json() limit '1mb' + payloadTooLarge handler | `index.ts:30-35` | ✅ |
| 2026-07-13 | **Cycle #6: Fix:** Graceful shutdown — cleanup interval | `cleanupService.ts`, `index.ts` | ✅ |
| 2026-07-13 | **Cycle #6: Fix:** Sequential image upload → Promise.all | `MessageInput.tsx:68-73` | ✅ |
| 2026-07-13 | **Cycle #6: Fix:** redis.keys() → SCAN | `presenceService.ts:33-43` | ✅ |
| 2026-07-13 | **Cycle #6: Tests:** socket (3) + presenceService (8) + cleanup (2) | `__tests__/` | ✅ |
| 2026-07-13 | **Cycle #7: 🔴 Fix:** JWT httpOnly cookie — сервер | `index.ts`, `authController.ts`, `authMiddleware.ts`, `socket/index.ts`, `authRoutes.ts` | ✅ |
| 2026-07-13 | **Cycle #7: 🔴 Fix:** JWT httpOnly cookie — клиент | `api.ts`, `AuthContext.tsx`, `socket.ts`, `SocketContext.tsx`, `usePushSubscription.ts`, `ProfileEditor.tsx` | ✅ |
| 2026-07-13 | **Cycle #7: 🔴 Fix:** requireEnv — throw если нет env | `app.ts` | ✅ |
| 2026-07-13 | **Cycle #7: 🟡 Fix:** Socket rate limiting (5/s/user) | `socket/index.ts` | ✅ |
| 2026-07-13 | **Cycle #7: 🟡 Fix:** User search — hide email | `models/User.ts` | ✅ |
| 2026-07-13 | **Cycle #7: Tests:** authCookie (5), jest.setup | `__tests__/authCookie.test.ts`, `jest.setup.ts` | ✅ |

---

## ГРАБЛИ (что пошло не так и запомнилось)

1. Socket.IO rooms — комнаты join только при connect; новые чаты не попадают. Решение: client emit `chat:join` после создания + auto-join в `message:send` как fallback.
2. Group participants — при создании группы другие участники не присоединяются к комнате. Решение: userSockets Map + `chat:created` event.
3. npm из PowerShell не работает (ExecutionPolicy) — использовать `cmd /c`.
4. Error middleware — строки ошибок могут рассинхронизироваться (hardcoded string comparison). Решение: enum ошибок или custom error classes с кодом.
5. In-memory socket Map ломается в multi-instance. Решение: Redis-based pub/sub (Socket.IO Redis adapter) для продакшена.
6. setTimeout без cleanup → setState после unmount. Решение: всегда возвращать `clearTimeout` из useEffect.
7. Нарушение процедуры project-fixer — начал править код до создания DIAGNOSTIC и FIX_PLAN. Решение: всегда проходить Фазы 1→2→3, не пропускать шаги.
8. chat:new-room — сервер шлёт, клиент не ловит → чаты не появляются у других участников. Решение: всегда проверять, что на клиенте есть обработчик для каждого server-emitted события.
9. safe-area-bottom в className — Tailwind не включает safe-area по умолчанию; на desktop/Android это бесполезно. Решение: убрать, использовать стандартный Tailwind (pb-2).
10. express-rate-limit должен быть в production deps, а не devDeps, т.к. используется в рантайме middleware.
11. Socket security — REST-маршруты (messageRoutes) используют `checkParticipant`, а socket-обработчики нет. Любой JWT может писать в любой чат. Решение: всегда дублировать проверку participant в socket handler'ах.
12. redis.keys() — блокирует Redis на время выполнения (O(N)). При 1000+ онлайн — секундная задержка. Решение: заменить на SCAN с пагинацией.
13. Graceful shutdown — setInterval не даёт процессу завершиться, пока не сработает. Решение: сохранять interval reference и чистить в shutdown.
14. Переход с localStorage JWT на httpOnly cookie — сломал session restore. Старый клиент с токеном в localStorage не залогинится. Решение: authMiddleware поддерживает и cookie, и Bearer header для плавной миграции.
15. requireEnv сломал все тесты — модули импортируют config на уровне модуля, а env vars ещё не установлены. Решение: jest.setup.ts с process.env=... загружается до всех тестов через setupFiles.
16. VAPID ключи для тестов должны быть валидного формата (65 bytes base64), иначе web-push библиотека падает. Решение: использовать реальные ключи из docker-compose.local.yml.

---

## ЗАМЕЧЕННЫЕ ПРОБЛЕМЫ (не в работе)

Пока нет.
