# Tasks Backlog: Zokul — Фаза 1 (MVP)

Всего задач: 14

---

## Эпик T1: Инфраструктура и настройка

- [x] T1.1. Инициализация репозитория и настройка монорепы
  - Файл: корень проекта
  - Описание: Создать package.json для корня, настроить TypeScript (tsconfig.json) для client и server, ESLint + Prettier, .gitignore
  - Входные данные: docs/01_STRUCTURE.md, docs/02_ARCHITECTURE.md
  - Выходные данные: Базовая структура папок, корневой package.json с скриптами
  - Тесты: —
  - Критерий приёмки: npm run lint проходит, tsc --noEmit проходит в обоих модулях
  - Зависит от: —

- [x] T1.2. Настройка Docker的开发 окружения
  - Файл: docker/Dockerfile.client, docker/Dockerfile.server, docker-compose.yml
  - Описание: Создать Dockerfile для клиента (Nginx static) и сервера (Node), docker-compose.yml с сервисами: client, server, postgres, redis (заглушка)
  - Входные данные: docs/01_STRUCTURE.md
  - Выходные данные: docker-compose up поднимает все сервисы
  - Тесты: —
  - Критерий приёмки: docker-compose up --build без ошибок, сервер отвечает на GET /
  - Зависит от: T1.1

---

## Эпик T2: База данных

- [x] T2.1. Создание миграций БД
  - Файл: server/src/config/db.ts
  - Описание: Настроить подключение к PostgreSQL через pg. Создать SQL-миграцию для таблиц: users, chats, chat_participants, messages
  - Входные данные: docs/02_ARCHITECTURE.md (схемы БД)
  - Выходные данные: Папка migrations/ с SQL файлами, скрипт миграции
  - Тесты: — (проверяется интеграционно)
  - Критерий приёмки: Миграции накатываются без ошибок, таблицы создаются с правильными ограничениями
  - Зависит от: T1.1

---

## Эпик T3: Бэкенд — Auth

- [x] T3.1. Модель User и сервис аутентификации
  - Файл: server/src/models/User.ts, server/src/services/authService.ts
  - Описание: Создать модель User (интерфейс + SQL-запросы). Реализовать authService: register (хэш bcrypt, создание User), login (проверка email + password, генерация JWT)
  - Входные данные: docs/02_ARCHITECTURE.md (типы), T2.1
  - Выходные данные: User.ts, authService.ts
  - Тесты: register создаёт пользователя, login возвращает токен, неверный пароль → ошибка
  - Критерий приёмки: Все тесты проходят, пароли хэшируются, JWT содержит userId
  - Зависит от: T2.1

- [x] T3.2. Auth middleware и контроллер
  - Файл: server/src/middleware/authMiddleware.ts, server/src/controllers/authController.ts, server/src/routes/authRoutes.ts
  - Описание: Создать middleware для проверки JWT, контроллер с handler для /register и /login, подключить маршруты
  - Входные данные: T3.1
  - Выходные данные: authMiddleware.ts, authController.ts, authRoutes.ts
  - Тесты: POST /api/auth/register → 201, POST /api/auth/login → 200, без токена → 401
  - Критерий приёмки: Все тесты проходят, защищённые маршруты возвращают 401
  - Зависит от: T3.1

---

## Эпик T4: Бэкенд — Chat

- [x] T4.1. Модель Chat и сервис чатов
  - Файл: server/src/models/Chat.ts, server/src/services/chatService.ts
  - Описание: Модели Chat и ChatParticipant. Сервис: createChat (проверка дубликатов), getChatsByUserId, getChatById
  - Входные данные: docs/02_ARCHITECTURE.md, T2.1
  - Выходные данные: Chat.ts, chatService.ts
  - Тесты: создание чата между двумя пользователями, список чатов пользователя, попытка создания дубликата
  - Критерий приёмки: Все тесты проходят, дубликаты не создаются
  - Зависит от: T2.1

- [x] T4.2. Chat controller и routes
  - Файл: server/src/controllers/chatController.ts, server/src/routes/chatRoutes.ts
  - Описание: GET /api/chats (список чатов пользователя), POST /api/chats (создание чата)
  - Входные данные: T4.1, T3.2
  - Выходные данные: chatController.ts, chatRoutes.ts
  - Тесты: GET /api/chats → 200 + массив, POST /api/chats → 201 + chat объект
  - Критерий приёмки: Все тесты проходят, авторизация работает
  - Зависит от: T4.1, T3.2

---

## Эпик T5: Бэкенд — Message + Socket.IO

- [x] T5.1. Модель Message и сервис сообщений
  - Файл: server/src/models/Message.ts, server/src/services/messageService.ts
  - Описание: Модель Message. Сервис: createMessage, getMessagesByChatId (с пагинацией offset/limit)
  - Входные данные: docs/02_ARCHITECTURE.md, T2.1
  - Выходные данные: Message.ts, messageService.ts
  - Тесты: создание сообщения, получение сообщений чата с пагинацией, сообщение без text и image → ошибка
  - Критерий приёмки: Все тесты проходят, пагинация работает, CHECK constraint соблюдается
  - Зависит от: T2.1

- [x] T5.2. Socket.IO сервер
  - Файл: server/src/socket/index.ts
  - Описание: Настроить Socket.IO сервер с аутентификацией через JWT. Обработка событий: message:send → сохранение + broadcast message:new, typing:start → broadcast typing:start. Присоединение к комнатам чатов
  - Входные данные: T5.1, T4.1
  - Выходные данные: socket/index.ts
  - Тесты: подключение с валидным токеном, отправка сообщения через socket, получение message:new
  - Критерий приёмки: Сообщения доставляются всем участникам чата, typing события работают
  - Зависит от: T5.1, T4.1

- [x] T5.3. Message controller и routes
  - Файл: server/src/controllers/messageController.ts, server/src/routes/messageRoutes.ts
  - Описание: GET /api/chats/:chatId/messages (с пагинацией), POST /api/chats/:chatId/messages (альтернатива socket)
  - Входные данные: T5.1, T3.2
  - Выходные данные: messageController.ts, messageRoutes.ts
  - Тесты: GET → 200 + массив, POST → 201, доступ только участникам чата
  - Критерий приёмки: Все тесты проходят, проверка членства в чате
  - Зависит от: T5.1, T3.2

- [x] T5.4. Загрузка изображений
  - Файл: server/src/middleware/uploadMiddleware.ts
  - Описание: Multer middleware, загрузка в папку uploads/, возврат URL. Максимум 10MB, только изображения
  - Входные данные: docs/02_ARCHITECTURE.md
  - Выходные данные: uploadMiddleware.ts, создание uploads/ папки
  - Тесты: загрузка изображения → 200 + url, загрузка не-изображения → 400, превышение размера → 413
  - Критерий приёмки: Файлы сохраняются, URL возвращается, валидация работает
  - Зависит от: T1.1

---

## Эпик T6: Фронтенд — Настройка и PWA

- [x] T6.1. Инициализация React + Vite + Tailwind + PWA
  - Файл: client/ (весь проект)
  - Описание: Создать React-проект через Vite. Настроить Tailwind CSS. Настроить vite-plugin-pwa с manifest.json (name: Zokul, display: standalone, theme_color, иконки). Создать иконки PWA для iOS
  - Входные данные: docs/01_STRUCTURE.md
  - Выходные данные: Рабочий Vite + React + PWA проект
  - Тесты: —
  - Критерий приёмки: npm run dev работает, PWA иконки видны в Lighthouse, manifest.json валиден
  - Зависит от: T1.1

- [x] T6.2. API клиент и Socket клиент
  - Файл: client/src/services/api.ts, client/src/services/socket.ts
  - Описание: axios instance с перехватчиком JWT. socket.io-client с авторизацией по токену, reconnect logic
  - Входные данные: docs/02_ARCHITECTURE.md
  - Выходные данные: api.ts, socket.ts
  - Тесты: —
  - Критерий приёмки: api.ts отправляет Authorization header, socket подключается с токеном
  - Зависит от: T3.2

- [x] T6.3. Контексты: AuthContext, SocketContext
  - Файл: client/src/contexts/AuthContext.tsx, client/src/contexts/SocketContext.tsx
  - Описание: AuthContext хранит user + token, предоставляет login/register/logout. SocketContext управляет подключением, предоставляет socket instance
  - Входные данные: T6.2
  - Выходные данные: AuthContext.tsx, SocketContext.tsx
  - Тесты: —
  - Критерий приёмки: После login контекст содержит user, socket подключён
  - Зависит от: T6.2

---

## Эпик T7: Фронтенд — UI

- [x] T7.1. Компоненты авторизации
  - Файл: client/src/components/auth/LoginForm.tsx, client/src/components/auth/RegisterForm.tsx
  - Описание: Формы логина (email + password) и регистрации (name + email + password + confirm). Валидация на стороне клиента. Показывать ошибки с сервера
  - Входные данные: T6.3
  - Выходные данные: LoginForm.tsx, RegisterForm.tsx
  - Тесты: —
  - Критерий приёмки: Формы отправляют данные, ошибки отображаются, после успеха редирект в чаты
  - Зависит от: T6.3

- [x] T7.2. Layout и навигация
  - Файл: client/src/components/layout/AppLayout.tsx, client/src/components/layout/Sidebar.tsx, client/src/components/layout/Header.tsx
  - Описание: Базовый layout: сайдбар (список чатов), хедер (имя пользователя, logout), основная область (текущий чат). iOS-стиль (safe-area, bottom navigation)
  - Входные данные: —
  - Выходные данные: AppLayout.tsx, Sidebar.tsx, Header.tsx
  - Тесты: —
  - Критерий приёмки: Layout рендерится, навигация работает, logout очищает сессию
  - Зависит от: T7.1

- [x] T7.3. ChatList и ChatView
  - Файл: client/src/components/chat/ChatList.tsx, client/src/components/chat/ChatView.tsx, client/src/components/chat/MessageBubble.tsx
  - Описание: ChatList — список чатов с последним сообщением. ChatView — история сообщений + поле ввода + кнопка отправки + кнопка прикрепить изображение. MessageBubble — сообщение с текстом/изображением
  - Входные данные: T6.3, T7.2
  - Выходные данные: ChatList.tsx, ChatView.tsx, MessageBubble.tsx
  - Тесты: —
  - Критерий приёмки: Чаты отображаются, сообщения приходят в real-time, изображения отображаются
  - Зависит от: T7.2, T5.2, T5.4

- [x] T7.4. Common UI компоненты
  - Файл: client/src/components/common/Button.tsx, client/src/components/common/Input.tsx, client/src/components/common/Avatar.tsx, client/src/components/common/Toast.tsx
  - Описание: Переиспользуемые UI компоненты: Button, Input, Avatar (инициалы + изображение), Toast (уведомления об ошибках/успехе)
  - Входные данные: —
  - Выходные данные: Button.tsx, Input.tsx, Avatar.tsx, Toast.tsx
  - Тесты: —
  - Критерий приёмки: Компоненты рендерятся, стили соответствуют iOS-дизайну
  - Зависит от: —

---

## Фаза 2: Core (15 задач)

---

## Эпик P2.1: UI/UX + Tech Debt

- [x] P2.1.1. Typing indicator UI
  - Файл: client/src/components/chat/TypingIndicator.tsx, ChatView.tsx
  - Описание: Создать компонент TypingIndicator, показывающий "Name печатает..." при typing:start событии. Таймаут 4s без нового события — скрыть.
  - Входные данные: SocketContext (уже работает)
  - Выходные данные: Пользователь видит индикатор когда собеседник печатает
  - Тесты: эмуляция typing:start → индикатор появился, 4s ожидания → исчез
  - Критерий приёмки: Два окна: печатать в одном → в другом "Печатает..."
  - Зависит от: Phase 1

- [x] P2.1.2. Last message preview в ChatList
  - Файл: server/src/models/Chat.ts, client/src/components/chat/ChatList.tsx
  - Описание: Включить в GET /api/chats поле lastMessage (подзапрос последнего сообщения). ChatList показывает превью.
  - Входные данные: Phase 1
  - Выходные данные: В списке чатов виден текст последнего сообщения
  - Тесты: проверить lastMessage в ответе /api/chats
  - Критерий приёмки: Отправить сообщение → в ChatList виден текст
  - Зависит от: —

- [x] P2.1.3. Rate limiting на auth
  - Файл: server/src/middleware/rateLimitMiddleware.ts, server/package.json (+ express-rate-limit)
  - Описание: POST /api/auth/login — 5 попыток / 15 мин. POST /api/auth/register — 3 попытки / час.
  - Входные данные: —
  - Выходные данные: После превышения лимита → 429
  - Тесты: 6 неверных логина → 429
  - Критерий приёмки: curl: 5× 401, 6-й → 429
  - Зависит от: —

- [x] P2.1.4. Member check middleware
  - Файл: server/src/middleware/checkParticipantMiddleware.ts
  - Описание: Middleware проверяет что req.userId — участник чата req.params.chatId. Использовать в message routes.
  - Входные данные: chatModel.findChatById
  - Выходные данные: Не-участник не может читать/писать сообщения
  - Тесты: POST /api/chats/чужая-айди/messages → 403
  - Критерий приёмки: curl с чужим chatId → 403
  - Зависит от: —

---

## Эпик P2.2: Online Status (Redis)

- [x] P2.2.1. Redis client + Presence сервис
  - Файл: server/src/config/redis.ts (+ ioredis), server/src/services/presenceService.ts, server/src/socket/index.ts
  - Описание: ioredis client. При connect SET `online:{userId}` TTL 30s + broadcast. При disconnect DEL + broadcast. Heartbeat от клиента раз в 15s продлевает TTL.
  - Входные данные: —
  - Выходные данные: При подключении/отключении пользователя все получают presence:update
  - Тесты: socket connect → Redis key создан. disconnect → удалён
  - Критерий приёмки: Два окна: при подключении второго, первый видит событие
  - Зависит от: —

- [x] P2.2.2. Online dot UI
  - Файл: client/src/hooks/usePresence.ts, client/src/components/chat/OnlineDot.tsx, ChatList.tsx, ChatView.tsx
  - Описание: usePresence хук подписывается на presence:update. OnlineDot — зелёный кружок. В ChatList и ChatView показывать статус.
  - Входные данные: P2.2.1
  - Выходные данные: Зелёные точки у онлайн-пользователей
  - Тесты: — (визуально)
  - Критерий приёмки: В браузере: пользователь онлайн → зелёная точка
  - Зависит от: P2.2.1

---

## Эпик P2.3: Group Chats

- [x] P2.3.1. Group API
  - Файл: server/src/config/db.ts (миграция + name, is_group), server/src/services/groupService.ts, server/src/controllers/groupController.ts, server/src/routes/groupRoutes.ts
  - Описание: Миграция: ALTER TABLE chats ADD COLUMN name, is_group. GroupService: createGroup, addMember, removeMember. Routes: POST /api/chats/group, POST/DELETE /api/chats/:id/members.
  - Входные данные: Phase 1 Chat model
  - Выходные данные: Можно создать групповой чат, управлять участниками
  - Тесты: создание группы с 3 участниками, добавление/удаление
  - Критерий приёмки: curl: группа создана, участники = 3
  - Зависит от: —

- [x] P2.3.2. Group UI
  - Файл: client/src/components/chat/CreateGroupModal.tsx, ChatList.tsx, ChatView.tsx
  - Описание: CreateGroupModal с мульти-выбором. ChatList показывает name группы. ChatView показывает групповой хедер с участниками.
  - Входные данные: P2.3.1
  - Выходные данные: Можно создать группу из UI
  - Тесты: — (визуально)
  - Критерий приёмки: Кнопка "Новая группа" → выбор пользователей → создалась и отображается
  - Зависит от: P2.3.1

---

## Эпик P2.4: Push Notifications

- [x] P2.4.1. Push subscription API
  - Файл: server/src/services/pushService.ts (+ web-push), server/src/controllers/pushController.ts, server/src/routes/pushRoutes.ts, server/src/config/db.ts (таблица push_subscriptions)
  - Описание: POST /api/push/subscribe сохраняет subscription. pushService.send(userId, payload). Интегрировать с messageService.
  - Входные данные: Phase 1
  - Выходные данные: Push-уведомления отправляются
  - Тесты: POST /api/push/subscribe → 201
  - Критерий приёмки: curl: подписка сохраняется
  - Зависит от: —

- [x] P2.4.2. Client push subscription
  - Файл: client/src/services/push.ts
  - Описание: При старте запросить Notification permission. Если granted → SW pushManager.subscribe → отправить на сервер. Обработка push-событий.
  - Входные данные: P2.4.1
  - Выходные данные: PWA получает push-уведомления
  - Критерий приёмки: При фоновом сообщении приходит уведомление
  - Зависит от: P2.4.1

---

## Эпик P2.5: Production & Docker

- [x] P2.5.1. Dockerfile client + server
  - Файл: docker/Dockerfile.client, docker/Dockerfile.server
  - Описание: Client: multistage build (node → nginx). Server: node:22-alpine. Nginx конфиг для SPA + proxy.
  - Входные данные: Phase 1
  - Выходные данные: docker build успешен
  - Тесты: docker build без ошибок
  - Критерий приёмки: Образы собираются
  - Зависит от: —

- [x] P2.5.2. docker-compose.prod.yml + .env.example
  - Файл: docker/docker-compose.prod.yml, docker/nginx.conf, server/.env.example
  - Описание: Полный production стек: nginx → client → server → postgres → redis. Все secrets из .env.
  - Входные данные: P2.5.1
  - Выходные данные: docker compose up поднимает всё
  - Тесты: —
  - Критерий приёмки: Все сервисы стартуют
  - Зависит от: P2.5.1

- [x] P2.5.3. Env validation + JWT secret fix
  - Файл: server/src/config/app.ts
  - Описание: Валидация process.env при старте. Если нет JWT_SECRET, DATABASE_URL — exit с ошибкой. Убрать hardcoded default "dev-secret".
  - Входные данные: Phase 1
  - Выходные данные: Без .env сервер не стартует
  - Тесты: без .env → exit
  - Критерий приёмки: export JWT_SECRET="" → error
  - Зависит от: —

---

## Приоритет выполнения Phase 2

1. **P2.1.1** — Typing indicator (быстрый, видимый)
2. **P2.1.2** — Last message preview
3. **P2.1.3** — Rate limiting
4. **P2.1.4** — Member check
5. **P2.2.1** — Redis + presence
6. **P2.2.2** — Online dot
7. **P2.3.1** — Group API
8. **P2.3.2** — Group UI
9. **P2.4.1 + P2.4.2** — Push
10. **P2.5.1 + P2.5.2 + P2.5.3** — Docker + env
