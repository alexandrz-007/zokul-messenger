# Zokul — Universal Messenger PWA

> **URL:** https://zokul.zhichkin.space
> **Статус:** Release v1.0 — проект готов к деплою, production-ветка залита на GitHub
> **Стек:** React + TypeScript + Vite + Tailwind CSS | Node.js + Express + Socket.IO | PostgreSQL + Redis | Docker + Nginx | sharp

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
| token_version | INTEGER | DEFAULT 0 (инкремент при смене пароля) |
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
  creatorId?: string;    // UUID создателя (для групп)
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
| POST | `/api/auth/change-password` | Yes | 10/15мин | `{ oldPassword, newPassword }` | `200 { success }` + сброс токена |

#### Чаты
| Метод | Путь | Auth | Тело | Ответ |
|-------|------|------|------|-------|
| GET | `/api/chats` | Yes | — | `200 Chat[]` |
| GET | `/api/chats/:id` | Yes + участник | — | `200 Chat` |
| POST | `/api/chats` | Yes | `{ participantId }` | `201 Chat` (или existing) |
| DELETE | `/api/chats/:id` | Yes + участник | — | `200 { success: true }` |
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
- **rateLimitMiddleware** — 3/час register, 5/15мин login, 10/15мин API, 100/15мин upload
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
docker compose -f docker-compose.local.yml up -d
# 4 контейнера: postgres, redis, server, client
# upload volume: uploads:/app/uploads
```

### 10.3 Deploy-copy (чистая версия для продакшена)

```bash
# Создать чистую копию без docs/tests/node_modules
powershell scripts/prepare-deploy.ps1

# Deploy-копия в ../zokul-deploy (111 файлов, ~0.8 MB)
# Проверка перед пушем:
cd ../zokul-deploy
docker compose -f docker-compose.prod.yml build
```

### 10.4 Продакшен деплой

```bash
# Первичная настройка SSL (один раз)
./scripts/setup-ssl.sh zokul.zhichkin.space

# Запуск
docker compose -f docker-compose.prod.yml up -d
```

Продакшен композ запускает: postgres + redis (healthcheck) → server (wait) → client (nginx :80/:443)

**Ветвление:** `master` — разработка, `production` — чистая deploy-копия.
**Обновление:** `cd deploy && git pull && docker compose -f docker-compose.prod.yml up -d --build`

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
   - Результат: **44/44 тестов**
- **Клиент:** Vitest — **7/7 тестов** (AuthContext, LoginForm, Avatar)
- **Проверка:** `tsc --noEmit` → clean, `npm run build` → success

---

## 12. ДЕПЛОЙ (PRODUCTION)

- **Ветвление:** `master` — разработка, `production` — deploy-копия
- **Скрипт:** `scripts/prepare-deploy.ps1` / `scripts/prepare-deploy.sh` — создаёт чистую копию (111 файлов, 0.8 MB)
- **Порядок обновления:** `powershell scripts/prepare-deploy.ps1 → cd ../zokul-deploy → git push origin master:production --force`
- **На сервере:** `cd /opt/zokul && git pull && docker compose -f docker-compose.prod.yml up -d --build`
- **Домен:** `https://zokul.zhichkin.space`
- **Инфраструктура:** single-host docker-compose
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
| P5 | Security Hardening #1 | ✅ CLOSED | 8 |
| P6 | Performance & Polish | ✅ CLOSED | 6 |
| P7 | Security Hardening #2 | ✅ CLOSED | 8 |
| P8 | Avatar Fixes + UI Polish | ✅ CLOSED | 8 |

**Метрики:** 44/44 server тестов, 7/7 client тестов, tsc clean, build clean, Docker build + compose ✅.

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
10. **Security** — SameSite Strict, rate limit (10/15мин), sharp MIME-валидация, JWT tokenVersion, helmet
11. **Тесты клиента** — 7/7 тестов (AuthContext, LoginForm, Avatar с fallback onError)
12. **Скрипт деплоя** — `prepare-deploy.ps1`/`.sh` — чистая копия без docs/tests/node_modules для продакшена

### Что уже исправлено (Fix Cycle #1 — 5 багов, 2026-07-13)
1. ✅ Socket.IO — комнаты для новых чатов (`chat:join`, auto-join, `chat:created`)
2. ✅ Групповые чаты — min 1 participant, catch(err), userSockets Map
3. ✅ Вёрстка сообщений — `max-w-2xl` → `max-w-4xl`
4. ✅ Удаление диалога — `DELETE /api/chats/:id`, socket `chat:deleted`
5. ✅ iOS Safari — `text-base` 16px, `safe-area-bottom`

### Что уже исправлено (Fix Cycle #2 — 20 проблем, 2026-07-13)
1. ✅ Error middleware — совпадают строки ошибок (400 вместо 500)
2. ✅ ErrorBoundary — защита от белого экрана
3. ✅ Удаление группы — только создатель (`creator_id`)
4. ✅ Race condition — AbortController для сообщений, debounce cleanup
5. ✅ Socket — try/catch для presence + chat loading
6. ✅ AuthSocket — вместо `(socket as any)`
7. ✅ Graceful shutdown — SIGTERM/SIGINT
8. ✅ Helmet + crypto.randomUUID + inline errors + a11y + focus trap + др.

### Что уже исправлено (Cycle #12 — Security Hardening #2, 2026-07-13)
1. ✅ **SameSite Strict** — `SameSite='strict'` на JWT cookie
2. ✅ **Auth rate limit** — 100 → 10/15мин для `/api/*` (общий лимит)
3. ✅ **Sharp MIME-валидация** — проверка содержимого загружаемых изображений через `sharp.metadata()`
4. ✅ **Change password** — `POST /api/auth/change-password` + инкремент `token_version`, старые токены недействительны
5. ✅ **Redis retry** — бесконечные реконнекты с экспоненциальной задержкой (`maxRetriesPerRequest: null`)
6. ✅ **Chat limit 500 / Group limit 100** — защита от создания тысяч чатов/групп
7. ✅ **Scroll-to-bottom** — автоскролл после отправки сообщения

### Что уже исправлено (Cycle #13 — Avatar Fixes + UI Polish, 2026-07-13)
1. ✅ **Avatar onError fallback** — `imgError` состояние, показ инициалов при ошибке загрузки
2. ✅ **Avatar key={url} reset** — сброс `imgError` при смене URL (переключаем чаты)
3. ✅ **url пропущен во все модалки/компоненты** — ChatList, ChatView, HomePage, CreateChatModal, CreateGroupModal
4. ✅ **Docker upload volume** — named volume `uploads:/app/uploads` + `UPLOAD_DIR` в `docker-compose.local.yml`
5. ✅ **Group avatar — initials** — для групп показываются инициалы, а не фото первого участника
6. ✅ **@Zokul@ heading** — `text-7xl text-primary` на страницах `/login` и `/register`
7. ✅ **Emoji picker 800** — расширен с 48 до ~800 emojis, grid 8→10 cols, max-h 48→72
8. ✅ **Avatar.test.tsx** — 3 теста (renders initials, renders image, fallback on error)

### 16. ПЛАН РАЗВИТИЯ (FUTURE)

См. `docs/FUTURE_PLAN.md` — 7 задач на после-релиз:
- UI смены пароля
- Поиск сообщений
- UI аватара групп
- E2E-тесты
- Мониторинг
- Админ-панель
- Скрипт деплоя (prepare-deploy.sh/ps1)

### Что можно улучшить (актуально)
1. **Типы дублированы** — `client/src/types/index.ts` и `server/src/types/index.ts` — синхронизируются вручную. При расширении можно забыть обновить один из них
2. ~~**Нет WebSocket комнат при создании чата**~~ — ✅ **Исправлено** (Cycle #1)
3. ~~**Нет rate limiting на upload**~~ — ✅ **Добавлен** `uploadLimiter` (100/15мин) + sharp MIME-валидация
4. **Нет пагинации на списке чатов** — если у пользователя 1000 чатов, загрузятся все сразу
5. **Нет логгирования ошибок в файл/сервис** — только `console.log` через `logger.ts`
6. **Нет миграций как отдельных SQL-файлов** — миграции выполняются в `config/db.ts` при старте
7. **Нет CORS на уровне Nginx для разработки** — Vite proxy решает для dev
8. ~~**Нет тестов на клиенте**~~ — ✅ **Исправлено**: 7/7 тестов (AuthContext, LoginForm, Avatar)
9. **Offline-first** — PWA могла бы работать офлайн с IndexedDB для кэша сообщений

### Общая оценка
Zokul — **зрелый, продуманный продукт**, а не pet project. Релиз v1.0 готов к деплою. Качество кода выше среднего. Архитектура позволяет легко добавлять фичи. Выдержан единый стиль и контракты.
