# Structure: Zokul

## Текущая фаза: Core (Расширение функциональности)
## Полная версия: Универсальный мессенджер как Telegram — PWA для iPhone, real-time сообщения, изображения, push-уведомления, статус онлайн, группы.

---

## Стек технологий

| Компонент | Технология | Обоснование |
|-----------|------------|-------------|
| Frontend | React + TypeScript + Vite + Tailwind CSS | Vite — быстрая сборка PWA, Tailwind — быстрый UI под iOS-стиль |
| PWA | vite-plugin-pwa + Service Worker | Автоматическая генерация manifest, service worker, иконок под iOS |
| Backend | Node.js + TypeScript + Express | Единый язык с фронтендом, минимальный порог входа |
| Real-time | Socket.IO | Надёжный real-time с fallback на polling (нужен для iOS Safari) |
| База данных | PostgreSQL | Надёжная, ACID, хорошая поддержка JSON |
| Кэш | Redis | Скорость, нужен для онлайн-статуса в будущем |
| Auth | JWT + bcrypt | Бессессионная аутентификация, удобно для PWA |
| Изображения | Multer (загрузка на диск/S3) | Простота на MVP, потом переход на MinIO |
| Контейнеризация | Docker + docker-compose | Единое окружение для dev/prod |
| Тестирование | Vitest (client) + Jest (server) | Современные тулы, быстрые |

---

## КОНТРАКТ СТИЛЯ И ПАТТЕРНОВ (STYLE & PATTERN CONTRACT)

Строитель обязан строго соблюдать следующие правила:

- **Типизация:** Никаких `any`. Все пропсы компонентов, аргументы функций и возвращаемые значения — через строгие TypeScript интерфейсы (interface, не type).
- **Обработка ошибок:** Запрещены пустые catch. Каждая ошибка логируется через Logger. На клиенте — через toast/уведомление пользователю.
- **Асинхронность:** Только async/await. Запрещены `.then()/.catch()`.
- **Разделение ответственности:** Бизнес-логика только в сервисах (`services/`). Контроллеры (`controllers/`) только разбирают запрос и отправляют ответ. Компоненты React не содержат логики API-вызовов — только вызовы хуков.
- **Стиль кода:** ESLint + Prettier. 2 пробела, одинарные кавычки, точка с запятой обязательна.
- **Именование:** Папки — kebab-case, файлы — kebab-case, компоненты — PascalCase, функции/переменные — camelCase.
- **React:** Только функциональные компоненты. Все состояния через хуки (useState, useReducer). Глобальное состояние — через Context (на MVP без Redux).
- **API:** REST API — существительные во множественном числе (`/api/chats`, `/api/messages`). Socket.IO — события в формате `namespace:action` (`chat:send`, `message:new`).

---

## Структура папок (текущая фаза)

```
zokul/
├── client/                          ← React PWA (фаза 1)
│   ├── public/
│   │   └── icons/                  ← PWA иконки для iOS
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/               ← LoginForm, RegisterForm
│   │   │   ├── chat/               ← ChatList, ChatView, MessageBubble
│   │   │   ├── common/             ← Button, Input, Avatar, Toast
│   │   │   └── layout/             ← AppLayout, Sidebar, Header
│   │   ├── contexts/               ← AuthContext, SocketContext
│   │   ├── hooks/                  ← useAuth, useSocket, useChat
│   │   ├── services/               ← api.ts (axios), socket.ts
│   │   ├── types/                  ← index.ts (все интерфейсы)
│   │   ├── utils/                  ← formatDate, cn (classnames)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css               ← Tailwind imports
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
├── server/                          ← Express API (фаза 1)
│   ├── src/
│   │   ├── controllers/            ← authController, chatController, messageController
│   │   ├── middleware/             ← authMiddleware, uploadMiddleware, errorMiddleware
│   │   ├── models/                 ← User, Chat, Message (SQL)
│   │   ├── routes/                 ← authRoutes, chatRoutes, messageRoutes
│   │   ├── services/              ← authService, chatService, messageService
│   │   ├── socket/                ← index.ts (Socket.IO handlers)
│   │   ├── types/                 ← index.ts
│   │   ├── utils/                 ← logger, hash, jwt
│   │   ├── config/               ← db.ts, app.ts, redis.ts (заглушка)
│   │   └── index.ts              ← точка входа
│   ├── tsconfig.json
│   └── package.json
├── docker/
│   ├── Dockerfile.client
│   ├── Dockerfile.server
│   └── nginx.conf                 ← для продакшн сборки
├── docker-compose.yml             ← client + server + db + redis
├── docs/
│   ├── 00_PROJECT_PLAN.md
│   ├── 01_STRUCTURE.md
│   └── PROGRESS.md
├── reports/
└── README.md
```

---

## Модули текущей фазы

### 1. Auth (Аутентификация)
- **Ответственность:** Регистрация, логин, JWT-токены, защита маршрутов
- **Зависимости:** — (базовый модуль)
- **Внешний API:** REST: `POST /api/auth/register`, `POST /api/auth/login`; Socket: `auth:verify`
- **Файлы:** client: `components/auth/*`, `contexts/AuthContext.tsx`, `hooks/useAuth.ts`, `services/api.ts`; server: `controllers/authController.ts`, `services/authService.ts`, `middleware/authMiddleware.ts`, `models/User.ts`

### 2. Chat (Чаты)
- **Ответственность:** Список чатов, создание чата, отображение собеседников
- **Зависимости:** Auth
- **Внешний API:** REST: `GET /api/chats`, `POST /api/chats`; Socket: `chat:created`
- **Файлы:** client: `components/chat/ChatList.tsx`, `hooks/useChat.ts`; server: `controllers/chatController.ts`, `services/chatService.ts`, `models/Chat.ts`

### 3. Message (Сообщения)
- **Ответственность:** Отправка, получение, загрузка изображений, real-time доставка
- **Зависимости:** Auth, Chat
- **Внешний API:** REST: `GET /api/chats/:id/messages`, `POST /api/chats/:id/messages`, `POST /api/upload`; Socket: `message:send`, `message:new`, `message:typing`
- **Файлы:** client: `components/chat/ChatView.tsx`, `components/chat/MessageBubble.tsx`, `hooks/useSocket.ts`, `services/socket.ts`; server: `controllers/messageController.ts`, `services/messageService.ts`, `models/Message.ts`, `socket/index.ts`

### 4. Shared (Общее)
- **Ответственность:** UI-компоненты, утилиты, типы
- **Зависимости:** —
- **Внешний API:** Экспорт компонентов и утилит для всех модулей
- **Файлы:** client: `components/common/*`, `components/layout/*`, `types/*`, `utils/*`; server: `types/*`, `utils/*`, `config/*`

### 5. Online Status (Phase 2)
- **Ответственность:** Отслеживание онлайн/офлайн статуса пользователей, индикаторы в UI
- **Зависимости:** Auth, Redis, Socket
- **Внешний API:** Socket `presence:update`, REST `GET /api/users/:id/online`
- **Файлы:** server: `services/presenceService.ts`, `config/redis.ts`; client: `hooks/usePresence.ts`, `components/chat/OnlineDot.tsx`

### 6. Group Chat (Phase 2)
- **Ответственность:** Создание групповых чатов, управление участниками, отображение
- **Зависимости:** Chat, Message
- **Внешний API:** REST `POST /api/chats/group`, `POST /api/chats/:id/members`
- **Файлы:** server: `controllers/groupController.ts`, `services/groupService.ts`; client: `components/chat/CreateGroupModal.tsx`

### 7. Push Notifications (Phase 2)
- **Ответственность:** Отправка push-уведомлений о новых сообщениях
- **Зависимости:** Auth, Message
- **Внешний API:** REST `POST /api/push/subscribe`, Web Push API
- **Файлы:** server: `services/pushService.ts`, `controllers/pushController.ts`; client: `services/push.ts`

### 8. Production (Phase 2)
- **Ответственность:** Docker-сборка, nginx reverse proxy, HTTPS, rate limiting
- **Зависимости:** Все модули
- **Внешний API:** —
- **Файлы:** `docker/Dockerfile.client`, `docker/Dockerfile.server`, `docker/nginx.conf`, `docker-compose.prod.yml`

---

## Roadmap модулей

| Модуль | Фаза | Описание | Зависит от |
|--------|------|----------|------------|
| Auth | 1 (MVP) | Регистрация, логин, JWT | — |
| Chat | 1 (MVP) | Личные чаты 1-на-1 | Auth |
| Message | 1 (MVP) | Отправка текста и изображений | Auth, Chat |
| Shared | 1 (MVP) | UI-компоненты, утилиты, типы | — |
| Push Notifications | 2 (Core) | Web Push API + service worker | Auth, Message |
| Online Status | 2 (Core) | Redis presence, Socket.IO, UI dots | Auth, Redis |
| Group Chat | 2 (Core) | Групповые чаты, мульти-участники | Chat, Message |
| Production | 2 (Core) | Docker Compose, nginx, HTTPS, rate-limit | — |

---

## Ключевые архитектурные решения

1. **Монолит vs микрофронтенд:** Выбран монолит (client + server) — для MVP важна скорость разработки. Разделение на модули внутри кодовой базы.
2. **Socket.IO + REST:** Используем гибридный подход. REST для CRUD (список чатов, история), Socket.IO для real-time событий (новое сообщение). Это снижает нагрузку и упрощает отладку.
3. **JWT без refresh-токенов:** На MVP токен живёт 24ч, при истечении — редирект на логин. В Core добавим refresh.
4. **Загрузка изображений через REST:** Отдельный endpoint, не через Socket. Multer на диск, в будущем — S3/MinIO.
5. **PostgreSQL + raw SQL (через pg):** На MVP без ORM — контроль над запросами. При усложнении — перейти на Prisma.

---

## Точки расширения

- **Auth → Refresh Tokens:** В `authService.ts` добавить метод `refreshToken()`. В middleware — проверку `refreshToken`.
- **Socket → Presence (онлайн):** В `socket/index.ts` добавить комнату `presence`, интеграция с Redis для хранения статуса.
- **Message → Push Notifications:** В `messageService.ts` после сохранения сообщения добавить вызов `pushService.send()`.
- **Image → S3/MinIO:** В `uploadMiddleware.ts` заменить локальное хранилище на S3-совместимое.
- **Chat → Groups:** В `Chat` модель добавить поле `type: 'personal' | 'group'`. В `chatService` — логику добавления участников.
