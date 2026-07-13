# Zokul — Universal Messenger PWA

> **URL:** https://zokul.zhichkin.space
> **Статус:** Все фазы завершены, проект работает на продакшен-сервере
> **Стек:** React + TypeScript + Vite + Tailwind CSS | Node.js + Express + Socket.IO | PostgreSQL + Redis | Docker + Nginx

---

## 1. ОПИСАНИЕ ПРОДУКТА

Zokul — это корпоративный мессенджер с PWA-поддержкой, работающий через браузер (устанавливается на iPhone как приложение). Основная фича — real-time обмен сообщениями с поддержкой текста, изображений (до 4 за раз), голосовых сообщений, реплаев, а также online-статус, группы, push-уведомления, тёмная тема и редактирование/удаление сообщений.

### Целевая аудитория
- Команды и компании, которым нужен быстрый, красивый, PWA-мессенджер без нативной установки
- Пользователи iOS (PWA устанавливается на главный экран)

---

## 2. СТРУКТУРА ПРОЕКТА

```
zokul/
├── .env.example                 # Шаблон переменных окружения
├── .gitignore                   # node_modules, dist, .env, *.log, uploads
├── package.json                 # Корневой package.json (монорепозиторий, concurrently)
├── docker-compose.local.yml     # Docker Compose для локального тестирования
├── docker-compose.prod.yml      # Docker Compose для продакшена
├── ZOKUL.md                     # ← Этот файл (контекст для AI)
│
├── client/                      # React PWA фронтенд
│   ├── index.html               # HTML entry point
│   ├── sw.ts                    # Service Worker (workbox injectManifest)
│   ├── package.json             # React, Vite, Tailwind, Socket.IO client, PWA
│   ├── tsconfig.json            # TypeScript config (target ES2020)
│   ├── vite.config.ts           # Vite + React + PWA plugin + proxy
│   ├── tailwind.config.js       # darkMode: 'class', custom colors, animation
│   ├── postcss.config.js        # Tailwind + Autoprefixer
│   ├── nginx.conf               # Nginx production config (SSL, proxy)
│   ├── nginx.local.conf         # Nginx local config
│   ├── Dockerfile               # Multi-stage build → nginx:1.27-alpine
│   └── src/
│       ├── main.tsx             # React entry point
│       ├── App.tsx              # Root component (BrowserRouter, Auth, Theme, Routing)
│       ├── index.css            # Tailwind directives + dark theme CSS vars
│       ├── components/
│       │   ├── auth/            # LoginForm, RegisterForm
│       │   ├── chat/            # ChatList, ChatView, MessageInput, MessageActions,
│       │   │                    # ReplyQuote, TypingIndicator, OnlineDot,
│       │   │                    # VoiceRecorder, VoicePlayer,
│       │   │                    # CreateChatModal, CreateGroupModal
│       │   ├── common/          # Avatar, Button, Modal
│       │   ├── layout/          # AppLayout
│       │   ├── profile/         # ProfileEditor
│       │   ├── HomePage.tsx     # Main orchestrator page
│       │   └── animations.css   # @keyframes message-appear
│       ├── contexts/
│       │   ├── AuthContext.tsx   # user, token, login/register/logout/updateUser
│       │   ├── SocketContext.tsx # Socket.IO connection lifecycle
│       │   ├── ChatContext.tsx   # replyTo, editingMessage state
│       │   └── ThemeContext.tsx  # dark/light theme + localStorage
│       ├── hooks/
│       │   ├── useChat.ts       # useChats, useMessages, useSearchUsers,
│       │   │                    # useCreateChat, useUnread
│       │   ├── useDraft.ts      # sessionStorage draft per chat
│       │   ├── usePagination.ts # IntersectionObserver + offset fetch
│       │   ├── usePresence.ts   # online/offline status
│       │   ├── useTyping.ts     # typing indicator socket emit
│       │   └── usePushSubscription.ts  # Web Push subscribe/unsubscribe
│       ├── services/
│       │   ├── api.ts           # Axios instance + interceptors
│       │   └── socket.ts        # Socket.IO client connect/disconnect
│       ├── types/
│       │   └── index.ts         # User, Message, Chat, ReplyPreview, AuthResponse
│       └── utils/
│           └── audio.ts         # Notification sound (Web Audio API oscillator)
│
├── server/                      # Express API backend
│   ├── package.json             # Express, Socket.IO, pg, ioredis, JWT, bcrypt, multer, web-push
│   ├── tsconfig.json            # target ES2020, CommonJS, strict
│   ├── Dockerfile               # Multi-stage build → node:22-alpine
│   ├── jest.config.js
│   ├── __tests__/
│   │   ├── authService.test.ts
│   │   ├── chatService.test.ts
│   │   └── messageService.test.ts
│   └── src/
│       ├── index.ts             # Server entry: Express + HTTP + Socket.IO setup
│       ├── config/
│       │   ├── app.ts           # Env config (PORT, DATABASE_URL, JWT_SECRET, etc.)
│       │   ├── db.ts            # PostgreSQL Pool + migrations (raw SQL)
│       │   └── redis.ts         # Redis client (ioredis)
│       ├── types/
│       │   └── index.ts         # All TypeScript interfaces (User, Message, Chat, etc.)
│       ├── utils/
│       │   └── logger.ts        # Simple console logger
│       ├── models/
│       │   ├── User.ts          # findByEmail, findById, search, create, updateProfile
│       │   ├── Chat.ts          # findChatsByUserId, findById, findExistingChat, createChat
│       │   ├── Message.ts       # findByChatId, create, updateMessage, softDelete, findById
│       │   └── PushSubscription.ts
│       ├── services/
│       │   ├── authService.ts       # register, login, generateToken, verifyToken
│       │   ├── chatService.ts       # getUserChats, createChat, getChatById
│       │   ├── messageService.ts    # getMessages, createMessage, editMessage, deleteMessage
│       │   ├── groupService.ts      # createGroup, addMember, removeMember
│       │   ├── presenceService.ts   # Redis-based online/offline (TTL 30s)
│       │   └── notificationService.ts  # Web Push notifications
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── chatController.ts
│       │   ├── messageController.ts
│       │   ├── groupController.ts
│       │   ├── userController.ts
│       │   └── pushController.ts
│       ├── routes/
│       │   ├── authRoutes.ts      # POST /api/auth/register, /login
│       │   ├── chatRoutes.ts      # GET/POST /api/chats
│       │   ├── groupRoutes.ts     # POST /group, /:id/members
│       │   ├── messageRoutes.ts   # GET/POST/PATCH/DELETE /api/chats/:chatId/messages
│       │   ├── userRoutes.ts      # GET /search, /:id, PATCH /profile
│       │   └── pushRoutes.ts      # GET /vapid-key, POST /subscribe, /unsubscribe
│       ├── middleware/
│       │   ├── authMiddleware.ts          # JWT verification → req.userId
│       │   ├── uploadMiddleware.ts        # Multer: 20MB, image/* + audio/* MIME filter
│       │   ├── errorMiddleware.ts         # Centralized error handler
│       │   ├── checkParticipantMiddleware.ts  # User must be chat participant
│       │   ├── ownerMiddleware.ts         # Message ownership check
│       │   └── rateLimitMiddleware.ts     # Login/register/API rate limits
│       └── socket/
│           └── index.ts           # Socket.IO server: presence, messaging, typing
│
├── docs/                         # Project documentation
│   ├── 00_PROJECT_PLAN.md        # Project description, roadmap, constraints
│   ├── 01_STRUCTURE.md           # Stack, style contract, folder structure, modules, key decisions
│   ├── 02_ARCHITECTURE.md        # Detailed architecture, data flows, API, cross-cutting concerns
│   ├── 03_TASKS_BACKLOG.md       # Full task backlog by phase
│   ├── 04_QA_STRATEGY.md         # Testing strategy
│   ├── PROCESS.md                # Development process constitution (4 roles)
│   └── PROGRESS.md               # Progress tracker with bugfixes and test results
│
├── reports/                      # Build reports from development
│   ├── REVIEW.md                 # Code review report
│   └── SUMMARY.md                # Phase summary
│
└── scripts/
    └── setup-ssl.sh              # Certbot SSL setup + auto-renew cron
```

---

## 3. СТЕК ТЕХНОЛОГИЙ

| Компонент | Технология | Детали |
|-----------|-----------|--------|
| Frontend | React 18 + TypeScript 5.3 | Vite 5, JSX, strict mode |
| Сборка | Vite 5 + @vitejs/plugin-react | Fast HMR, ES modules |
| PWA | vite-plugin-pwa (injectManifest) | Service Worker (workbox), manifest, iOS icons |
| CSS | Tailwind CSS 3.4 | darkMode: 'class', кастомные цвета primary |
| Backend | Node.js + Express 4 + TypeScript | tsx для dev, tsc для сборки |
| Database | PostgreSQL 16 (raw SQL, без ORM) | pg 8.11, миграции через CREATE TABLE IF NOT EXISTS |
| Cache | Redis 7 (ioredis) | Онлайн-статус (TTL 30s) |
| Real-time | Socket.IO 4.7 | Server + client, комнаты чатов |
| Auth | JWT (jsonwebtoken) + bcryptjs | 24h expiry, Bearer token |
| Push | Web Push API (web-push 3.6) | VAPID keys, push-уведомления |
| Файлы | Multer (disk storage) | Images + audio, 20MB max |
| HTTP клиент | Axios 1.6 | Interceptors: Bearer token + 401 redirect |
| Routing | React Router DOM 6 | /login, /register, /* protected routes |
| Testing | Jest + ts-jest (server), Vitest (client) | Unit + integration |
| Контейнеры | Docker + docker-compose | Multi-stage builds, healthchecks |
| Веб-сервер | Nginx 1.27 (reverse proxy + SSL) | SSL termination, WebSocket upgrade |
| SSL | Certbot + Let's Encrypt | Автообновление через cron |

---

## 4. АРХИТЕКТУРА

### 4.1 Общая схема

```
Browser (React PWA)
     │
     ├── REST API (axios) ──► Nginx (port 443) ──► Express Server (port 3001) ──► PostgreSQL
     │                            │                     │
     └── WebSocket (Socket.IO) ───┘                     ├── Socket.IO ──► Redis (presence)
                                                        │
                                                        └── Push notifications ──► Browser
```

Nginx выступает как reverse proxy:
- `/api/*` → `http://server:3001`
- `/uploads/*` → `http://server:3001`
- `/socket.io/*` → `http://server:3001` (WebSocket upgrade)

### 4.2 Архитектурные решения

1. **Raw SQL вместо ORM** — простые миграции, прямые запросы через `pg.Pool`, полный контроль над SQL
2. **Client-Server разделение** — Express REST API + React SPA, Socket.IO для real-time
3. **Feature-based grouping** на клиенте — папки по фичам (chat/, auth/, profile/), а не по типам
4. **Owner check в сервисах** — проверка владельца сообщения в `messageService`, не в middleware
5. **Soft-delete сообщений** — DELETE ставит `deleted_at`, очищает `text`, но сохраняет запись
6. **Multi-image** — до 4 изображений, загружаются последовательно через `/api/upload`, хранятся в `TEXT[]`
7. **Draft черновики** — sessionStorage (исчезают при закрытии вкладки), ключ `draft:{chatId}`
8. **Звук уведомления** — Web Audio API осциллятор (без mp3), играет при `document.hidden`
9. **Пагинация** — offset-based (number), IntersectionObserver на sentinel-элементе
10. **PWA-first** — полноценный Service Worker, manifest, установка на iOS Home Screen

---

## 5. БАЗА ДАННЫХ (PostgreSQL)

### 5.1 Таблицы

#### `users`
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| avatar_url | VARCHAR(500) | NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

#### `chats`
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| name | VARCHAR(100) | NULL (только для групп) |
| avatar_url | VARCHAR(500) | NULL |
| is_group | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

#### `chat_participants`
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| chat_id | UUID | FK → chats(id) ON DELETE CASCADE |
| user_id | UUID | FK → users(id) ON DELETE CASCADE |
| | | PRIMARY KEY (chat_id, user_id) |

#### `messages`
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| chat_id | UUID | FK → chats(id) ON DELETE CASCADE, NOT NULL |
| sender_id | UUID | FK → users(id) ON DELETE CASCADE, NOT NULL |
| text | TEXT | NULL |
| image_url | VARCHAR(500) | NULL |
| image_urls | TEXT[] | DEFAULT '{}' |
| voice_url | VARCHAR(500) | NULL |
| voice_duration | NUMERIC(5,1) | NULL |
| reply_to_id | UUID | FK → messages(id) ON DELETE SET NULL |
| is_edited | BOOLEAN | DEFAULT false |
| edited_at | TIMESTAMPTZ | NULL |
| deleted_at | TIMESTAMPTZ | NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**Индексы:** `idx_messages_chat_id`, `idx_messages_created_at`

#### `push_subscriptions`
| Колонка | Тип | Constraints |
|---------|-----|-------------|
| id | SERIAL | PK |
| user_id | UUID | FK → users(id) ON DELETE CASCADE, NOT NULL |
| endpoint | TEXT | NOT NULL |
| p256dh | TEXT | NOT NULL |
| auth | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| | | UNIQUE (user_id, endpoint) |

### 5.2 Модели данных (TypeScript)

```typescript
// server/src/types/index.ts (дублировано на клиенте: client/src/types/index.ts)

interface User {
  id: string;           // UUID
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;    // ISO timestamp
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;
  imageUrl?: string;          // legacy (single image)
  imageUrls?: string[];       // multi-image (до 4)
  voiceUrl?: string;
  voiceDuration?: number;
  replyTo?: ReplyPreview;
  isEdited?: boolean;
  createdAt: string;
}

interface ReplyPreview {
  messageId: string;
  senderId: string;
  senderName: string;
  text?: string;
  imageUrl?: string;
}

interface Chat {
  id: string;
  name?: string;
  isGroup?: boolean;
  participantIds: string[];
  participants: User[];   // только на клиенте / ChatWithUsers на сервере
  lastMessage?: Message;
  createdAt: string;
}

interface AuthResponse {
  token: string;
  user: User;
}
```

**Важно:** Типы дублированы на сервере и клиенте — синхронизировать вручную.

---

## 6. API REFERENCE

### 6.1 REST Endpoints

#### Аутентификация
| Метод | Путь | Auth | Rate Limit | Тело | Ответ |
|-------|------|------|-----------|------|-------|
| POST | `/api/auth/register` | No | 3/час | `{ email, password, name }` | `201 { token, user }` |
| POST | `/api/auth/login` | No | 5/15мин | `{ email, password }` | `200 { token, user }` |

#### Чаты
| Метод | Путь | Auth | Тело | Ответ |
|-------|------|------|------|-------|
| GET | `/api/chats` | Yes | — | `200 Chat[]` |
| GET | `/api/chats/:id` | Yes + участник | — | `200 Chat` |
| POST | `/api/chats` | Yes | `{ participantId }` | `201 Chat` (или existing) |
| POST | `/api/chats/group` | Yes | `{ name, participantIds[] }` | `201 Chat` |
| POST | `/api/chats/:id/members` | Yes + участник | `{ userId }` | `200 Chat` |
| DELETE | `/api/chats/:id/members/:userId` | Yes + участник | — | `200 Chat` |

#### Сообщения
| Метод | Путь | Auth | Query/Тело | Ответ |
|-------|------|------|-----------|-------|
| GET | `/api/chats/:chatId/messages` | Yes + участник | `?offset=0&limit=50` | `200 Message[]` |
| POST | `/api/chats/:chatId/messages` | Yes + участник | `{ text?, imageUrl?, imageUrls?, voiceUrl?, voiceDuration?, replyToId? }` | `201 Message` |
| PATCH | `/api/chats/:chatId/messages/:messageId` | Yes + участник + владелец | `{ text }` | `200 Message` |
| DELETE | `/api/chats/:chatId/messages/:messageId` | Yes + участник + владелец | — | `200 { chatId, messageId }` |

#### Пользователи
| Метод | Путь | Auth | Query | Ответ |
|-------|------|------|-------|-------|
| GET | `/api/users/search` | Yes | `?q=query` | `200 User[]` |
| GET | `/api/users/:id` | Yes | — | `200 User` |
| GET | `/api/users/:id/online` | Yes | — | `200 { online: boolean }` |
| PATCH | `/api/users/profile` | Yes | `{ name?, avatarUrl? }` | `200 User` |

#### Push-уведомления
| Метод | Путь | Auth | Тело | Ответ |
|-------|------|------|------|-------|
| GET | `/api/push/vapid-key` | No | — | `200 { publicKey }` |
| POST | `/api/push/subscribe` | Yes | `{ subscription }` | `200` |
| POST | `/api/push/unsubscribe` | Yes | `{ endpoint }` | `200` |

#### Upload
| Метод | Путь | Auth | Тело | Ответ |
|-------|------|------|------|-------|
| POST | `/api/upload` | Yes (+ Multer) | `multipart file` | `200 { url: "/uploads/filename" }` |

### 6.2 Socket.IO Events

#### Client → Server
| Событие | Данные | Описание |
|---------|--------|----------|
| `message:send` | `{ chatId, text?, imageUrl?, imageUrls?, voiceUrl?, voiceDuration?, replyToId? }` | Отправить сообщение |
| `message:edit` | `{ messageId, text, chatId }` | Редактировать (owner check) |
| `message:delete` | `{ messageId, chatId }` | Удалить (owner check) |
| `message:typing` | `{ chatId }` | Пользователь печатает |
| `heartbeat` | — | Продление online-статуса (каждые 15s) |

#### Server → Client
| Событие | Данные | Описание |
|---------|--------|----------|
| `message:new` | `Message` | Новое сообщение (всем в комнате чата) |
| `message:edited` | `Message` | Сообщение отредактировано |
| `message:deleted` | `{ messageId, chatId }` | Сообщение удалено |
| `typing:start` | `{ chatId, userId, userName }` | Кто-то печатает (4s timeout) |
| `presence:update` | `{ userId, status: 'online'\|'offline' }` | Статус онлайн |
| `error` | `{ message }` | Ошибка от сервера |

#### Аутентификация Socket.IO
Токен передаётся в `socket.handshake.auth.token`. Сервер проверяет JWT в middleware `io.use()`. При успехе — `socket.join()` во все комнаты чатов пользователя.

---

## 7. КЛИЕНТСКАЯ ЧАСТЬ (React PWA)

### 7.1 Компонентная иерархия

```
<App>                             # BrowserRouter
├── <AuthProvider>                # AuthContext (user, token, login, register, logout, updateUser)
│   └── <ThemeProvider>           # ThemeContext (light/dark, localStorage)
│       ├── /login → <LoginForm>
│       ├── /register → <RegisterForm>
│       └── /* → <ProtectedRoute>
│           └── <SocketProvider>  # SocketContext (socket connection via token)
│               └── <ChatProvider> # ChatContext (replyTo, editingMessage)
│                   └── <HomePageInner>
│                       ├── <AppLayout>
│                       │   ├── <aside> (sidebar)
│                       │   │   ├── Header (user name, new chat, new group, logout)
│                       │   │   └── <ChatList>
│                       │   │       ├── <Avatar>
│                       │   │       └── <OnlineDot>
│                       │   └── <section> (main area)
│                       │       ├── Chat Header (back, avatar, name, online status)
│                       │       ├── <ChatView>              # Message list
│                       │       │   ├── <DaySeparator>
│                       │       │   ├── <MessageBubble>
│                       │       │   │   ├── <ReplyQuote>
│                       │       │   │   ├── image grid (1-2 cols)
│                       │       │   │   ├── <VoicePlayer>
│                       │       │   │   └── <MessageActions> # Reply/Edit/Delete
│                       │       │   ├── <TypingIndicator>
│                       │       │   └── <Avatar> + <OnlineDot>
│                       │       └── <MessageInput>
│                       │           ├── <ReplyQuote>
│                       │           ├── Attach button (images)
│                       │           ├── Mic button (voice)
│                       │           └── Emoji/send
│                       ├── <CreateChatModal>
│                       ├── <CreateGroupModal>
│                       └── <ProfileEditor>
```

### 7.2 Три состояния UI

Каждый компонент обрабатывает:
- **Loading** — спиннер/скелетон/пульсация (`animate-pulse`)
- **Error** — красное сообщение об ошибке
- **Empty** — информационное сообщение ("No messages yet", "Select a chat")
- **Success** — нормальный рендер данных

### 7.3 Хуки

| Хук | Назначение |
|-----|-----------|
| `useChats()` | GET /chats, real-time обновление lastMessage |
| `useMessages(chatId)` | GET messages, socket listeners (new/edited/deleted), send/edit/delete |
| `useSearchUsers()` | GET /users/search?q= |
| `useCreateChat()` | POST /chats |
| `useUnread(selectedChatId)` | Счётчик непрочитанных (Map<chatId, number>) |
| `usePagination(chatId)` | Offset-based, IntersectionObserver, hasMore |
| `useDraft(chatId)` | sessionStorage draft:{chatId}, restore/clear on chat switch |
| `usePresence(userId)` | HTTP GET /users/:id/online |
| `useTyping(chatId)` | Socket emit 'message:typing' на onChange |
| `usePushSubscription()` | Web Push subscribe/unsubscribe |

### 7.4 Контексты

| Контекст | Данные | Назначение |
|----------|--------|------------|
| AuthContext | `{ user, token, login, register, logout, updateUser, loading }` | Аутентификация |
| SocketContext | `{ socket }` | Socket.IO соединение |
| ThemeContext | `{ theme, toggleTheme }` | Тёмная/светлая тема |
| ChatContext | `{ replyTo, setReplyTo, editingMessage, setEditingMessage }` | Reply и Edit состояния |

### 7.5 Services

- **api.ts** — Axios instance с `baseURL: '/api'`, interceptor на Bearer token + 401 redirect
- **socket.ts** — `connectSocket(token)` / `disconnectSocket()`, с auth token

---

## 8. СЕРВЕРНАЯ ЧАСТЬ (Express)

### 8.1 Middleware Pipeline

```
Request → cors → express.json() → static /uploads → Routes → Controller → Service → Model → DB
                                                              ↓
                                                      Error Middleware (catch-all)
```

- **authMiddleware** — `Authorization: Bearer <token>` → `req.userId`
- **uploadMiddleware** — Multer: 20MB, MIME: `image/*` + `audio/*`
- **checkParticipantMiddleware** — проверка, что пользователь в чате
- **ownerMiddleware** — проверка, что пользователь — владелец сообщения
- **rateLimitMiddleware** — 3/час register, 5/15мин login, 100/15мин общий
- **errorMiddleware** — централизованный обработчик: `{ error: message }`

### 8.2 Route → Controller → Service → Model

```
authRoutes.ts → authController.ts → authService.ts → User model (PostgreSQL)
chatRoutes.ts → chatController.ts → chatService.ts → Chat model + Chat model
messageRoutes.ts → messageController.ts → messageService.ts → Message model
                                          → notificationService.ts (push)
userRoutes.ts → userController.ts → userService.ts → User model
groupRoutes.ts → groupController.ts → groupService.ts → Chat model
pushRoutes.ts → pushController.ts → pushService.ts → PushSubscription model
```

### 8.3 Сервисы

| Сервис | Методы | Описание |
|--------|--------|----------|
| authService | register, login, generateToken, verifyToken | Регистрация/логин, bcrypt + JWT |
| chatService | getUserChats, createChat, getChatById | CRUD чатов |
| messageService | getMessages, createMessage, editMessage (owner), deleteMessage (owner) | CRUD сообщений + push |
| groupService | createGroup, addMember, removeMember | Управление группами |
| presenceService | setOnline, setOffline, isOnline, getOnlineUsers, getAllOnlineUserIds | Redis TTL 30s |
| notificationService | sendPushNotification | Web Push (best-effort) |

### 8.4 Socket.IO

- Аутентификация через `io.use()` middleware (JWT)
- При коннекте: `setOnline` + broadcast `presence:update` + join chat rooms
- Heartbeat каждые 15s продлевает TTL
- При дисконнекте: `setOffline` + broadcast
- Все `message:*` события проверяют владельца в сервисах

---

## 9. ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

```
PORT=3001
NODE_ENV=development|production
DATABASE_URL=postgresql://zokul:zokul@postgres:5432/zokul
JWT_SECRET=<random-secret>
CORS_ORIGIN=http://localhost:5173|https://zokul.zhichkin.space
REDIS_URL=redis://redis:6379
VAPID_PUBLIC_KEY=<vapid-public-key>
VAPID_PRIVATE_KEY=<vapid-private-key>
```

В production `safeEnv()` кинет ошибку, если переменная не задана. В dev — fallback.

---

## 10. ЗАПУСК ПРОЕКТА

### 10.1 Локальная разработка

```bash
# Инфраструктура (PostgreSQL + Redis)
docker-compose -f docker-compose.local.yml up -d postgres redis

# Установка зависимостей
cd client && npm install
cd server && npm install

# Запуск (из корня)
npm run dev
# → client: Vite на :5173 (proxy на сервер)
# → server: tsx watch на :3001
```

### 10.2 Docker (локальный тестовый)

```bash
docker build -t zokul-server ./server
docker build -t zokul-client ./client
docker-compose -f docker-compose.local.yml up -d
```

### 10.3 Продакшен деплой

```bash
# Первичная настройка SSL (один раз)
./scripts/setup-ssl.sh zokul.zhichkin.space

# Запуск
docker-compose -f docker-compose.prod.yml up -d
```

Продакшен композ запускает: postgres + redis (healthcheck) → server (wait) → client (nginx :80/:443)

### 10.4 Команды

**Корень:**
| Команда | Описание |
|---------|----------|
| `npm run dev` | Параллельно server + client |
| `npm run build` | Сборка client → server |
| `npm test` | Тесты client + server |

**Сервер:**
| Команда | Описание |
|---------|----------|
| `npm run dev` | `tsx watch src/index.ts` |
| `npm run build` | `tsc` |
| `npm start` | `node dist/index.js` |
| `npm test` | `jest --forceExit` |
| `npm run migrate` | `tsx src/config/db.ts` |

**Клиент:**
| Команда | Описание |
|---------|----------|
| `npm run dev` | `vite` (Vite dev server) |
| `npm run build` | `tsc -b && vite build` |
| `npm test` | `vitest run` |
| `npm run preview` | `vite preview` |

---

## 11. ТЕСТИРОВАНИЕ

- **Сервер:** Jest + ts-jest, тесты в `server/__tests__/`
  - `authService.test.ts` — регистрация, логин, дубликат email
  - `chatService.test.ts` — создание чата, существующий чат, сам с собой
  - `messageService.test.ts` — создание, редактирование, удаление, owner check
  - Результат: **10/10 тестов**
- **Клиент:** Vitest (настроен, заглушки)
- **Проверка:** `tsc --noEmit` → clean, `npm run build` → success

---

## 12. ДЕПЛОЙ (PRODUCTION)

- **Домен:** `https://zokul.zhichkin.space`
- **Инфраструктура:** Docker Swarm / single-host docker-compose
- **Nginx:** SSL termination (Let's Encrypt), reverse proxy на сервер
- **SSL:** Certbot + cron auto-renew в `scripts/setup-ssl.sh`
- **Healthchecks:** PostgreSQL (`pg_isready`), Redis (`redis-cli ping`), сервер ждёт их
- **Volumes:** `pgdata` (БД), `redisdata` (кэш), `uploads` (файлы)

---

## 13. KEY DECISIONS & PATTERNS (STYLE CONTRACT)

### Настройки TypeScript
- `strict: true`
- `no any` — строгая типизация везде
- `async/await` — без `.then()/.catch()`
- `interface` вместо `type` для объектов

### Форматирование
- 2 пробела, одинарные кавычки, semicolons required
- `kebab-case` для папок и файлов
- `PascalCase` для React компонентов
- `camelCase` для функций и переменных

### Структура кода
- **Бизнес-логика** только в `services/`
- **Контроллеры** только парсят request и формируют response
- **React компоненты** вызывают хуки, никогда raw API
- **Feature-based grouping** в `components/` (chat/, auth/, profile/)
- **Cross-cutting** (hooks, services, types) — flat

### React Conventions
- Только functional components
- Состояние через hooks (useState, useEffect, useCallback)
- Глобальное состояние через Context (4 контекста, без Redux)
- Три состояния: loading / error / empty / success

### API Convention
- REST plural nouns (`/api/chats`, `/api/users/search`)
- Сокетные события в формате `namespace:action` (`message:send`, `message:new`)
- Ошибки: `{ error: "message" }`

### CSS
- Tailwind utility classes только
- Кастомный CSS только для `@keyframes` анимаций
- Тёмная тема через `dark:` префикс + `class` strategy

### Аудио
- MediaRecorder + Blob → FormData upload (никакого base64)
- Плеер: нативный `<audio>` с кастомными контролами
- Звук уведомления: Web Audio API oscillator (без mp3)

### Пагинация
- Server-driven offset (number) / limit (int)
- Клиент: IntersectionObserver на sentinel-элементе
- Lock (`loadingRef`) для предотвращения двойных загрузок

---

## 14. ЗАВЕРШЁННЫЕ ФАЗЫ

| Фаза | Название | Статус | Задач |
|------|----------|--------|-------|
| P1 | MVP | ✅ CLOSED | 14 |
| P2 | Core | ✅ CLOSED | 15 |
| P3 | Advanced | ✅ CLOSED | 15 |
| Bugfix | 31 fixes | ✅ CLOSED | 31 |
| P4 | Multi-Image | ✅ CLOSED | 1 |

**Метрики:** 10/10 тестов, tsc clean, build clean, все 3 фазы + багфикс-раунд + multi-image.

---

## 15. МОЁ МНЕНИЕ О ПРОДУКТЕ

### Что хорошо
1. **Чистая архитектура** — чёткое разделение на слои (routes → controllers → services → models), feature-based grouping на клиенте
2. **Raw SQL вместо ORM** — проект маленький, ORM был бы overkill, а так полный контроль и минимум зависимостей
3. **PWA-first подход** — реально устанавливается на iPhone, push-уведомления, service worker — сделан с умом для iOS
4. **Три состояния UI** — loading/error/empty везде, это признак зрелого фронтенда
5. **Owner check в сервисах, не в middleware** — правильный подход, потому что сокеты тоже должны проверять права
6. **Soft-delete сообщений** — сохраняет целостность реплаев
7. **Docker healthchecks** — продакшен-решение, а не игрушка
8. **Web Audio API** для звука — без лишних mp3-файлов, просто и эффективно
9. **Документация** — 7 файлов в docs/ с архитектурой, структурой, планом, прогрессом — редкая дисциплина

### Что можно улучшить
1. **Типы дублированы** — `client/src/types/index.ts` и `server/src/types/index.ts` — синхронизируются вручную. При расширении можно забыть обновить один из них
2. **Нет WebSocket комнат при создании чата** — если пользователь создаёт новый чат, старый Socket (который уже подписан на комнаты) не узнает о нём, пока не перезагрузит страницу
3. **Нет rate limiting на upload** — можно заспамить файлами (хотя Multer 20MB ограничивает размер)
4. **Нет пагинации на списке чатов** — если у пользователя 1000 чатов, загрузятся все сразу. Offset не используется. Хотя в MVP это ок
5. **Нет логгирования ошибок в файл/сервис** — только `console.log` через `logger.ts`. Для прода лучше добавить Sentry или подобное
6. **Нет миграций как отдельных SQL-файлов** — миграции выполняются в `config/db.ts` при старте через `CREATE TABLE IF NOT EXISTS`. Это не даёт откатывать миграции
7. **Нет CORS на уровне Nginx для разработки** — Vite proxy решает для dev, но в prod CORS настроен через Express, не через Nginx (хотя с proxy это не проблема)
8. **Нет тестов на клиенте** — настроен Vitest, но тесты не написаны
9. **Offline-first** — PWA могла бы работать офлайн с IndexedDB для кэша сообщений

### Общая оценка
Zokul — **зрелый, продуманный продукт**, а не pet project. Качество кода выше среднего. Архитектура позволяет легко добавлять фичи. Выдержан единый стиль и контракты. Единственное, чего не хватает до enterprise-уровня — это системное логгирование, нормальные миграции и тесты клиента. Но для корпоративного мессенджера, который уже работает в продакшене — это отличная кодовая база.
