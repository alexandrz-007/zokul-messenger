# Architecture: Zokul — Фаза 1 (MVP)

## Обзор
Документ детализирует архитектуру MVP корпоративного мессенджера Zokul: модули, интерфейсы, типы, API, схему БД и потоки данных.

---

## 1. Модуль Auth (Аутентификация)

### Типы

```typescript
// client/src/types/index.ts & server/src/types/index.ts

interface User {
  id: string;          // UUID
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;   // ISO 8601
}

interface AuthResponse {
  token: string;
  user: User;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}
```

### API endpoints

| Метод | Путь | Тело запроса | Ответ | Ошибки |
|-------|------|-------------|-------|--------|
| POST | /api/auth/register | RegisterRequest | 201 AuthResponse | 400 validation, 409 email exists |
| POST | /api/auth/login | LoginRequest | 200 AuthResponse | 401 invalid credentials |

### Схема БД: users

| Колонка | Тип | Ограничения |
|---------|-----|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| avatar_url | VARCHAR(500) | NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### Поток данных (Login)
1. Client → POST /api/auth/login { email, password }
2. server/controllers/authController → валидация тела
3. server/services/authService → поиск User по email (model)
4. bcrypt.compare(password, user.passwordHash)
5. jwt.sign({ userId: user.id }) → token
6. Response: { token, user }

---

## 2. Модуль Chat (Чаты)

### Типы

```typescript
interface Chat {
  id: string;
  participantIds: string[];
  participants: User[];
  lastMessage?: Message;
  createdAt: string;
}

interface CreateChatRequest {
  participantId: string; // ID собеседника
}
```

### API endpoints

| Метод | Путь | Ответ | Ошибки |
|-------|------|-------|--------|
| GET | /api/chats | 200 Chat[] | 401 |
| POST | /api/chats | 201 Chat | 400, 404 user not found |

### Схема БД: chats

| Колонка | Тип | Ограничения |
|---------|-----|-------------|
| id | UUID | PK |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### Схема БД: chat_participants

| Колонка | Тип | Ограничения |
|---------|-----|-------------|
| chat_id | UUID | FK → chats.id, PK |
| user_id | UUID | FK → users.id, PK |

### Поток данных (создание чата)
1. Client → POST /api/chats { participantId }
2. Проверка: не создавать дубликат (чат с тем же пользователем уже есть)
3. INSERT INTO chats + INSERT INTO chat_participants (x2)
4. Socket: emit chat:created → обоим участникам

---

## 3. Модуль Message (Сообщения)

### Типы

```typescript
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender: User;
  text?: string;
  imageUrl?: string;
  createdAt: string;
}

interface SendMessageRequest {
  chatId: string;
  text?: string;       // если нет изображения
}
```

### API endpoints

| Метод | Путь | Тело/Параметры | Ответ | Ошибки |
|-------|------|---------------|-------|--------|
| GET | /api/chats/:chatId/messages | query: offset, limit | 200 Message[] | 401, 403 |
| POST | /api/chats/:chatId/messages | SendMessageRequest | 201 Message | 400, 403 |
| POST | /api/upload | multipart/form-data (file) | 200 { url: string } | 400, 413 |

### Socket.IO события

| Событие (client → server) | Данные | Действие |
|---------------------------|--------|----------|
| message:send | { chatId, text? } | Сохранить + emit message:new |
| message:typing | { chatId } | emit typing:start → участникам |

| Событие (server → client) | Данные | Описание |
|---------------------------|--------|----------|
| message:new | Message | Новое сообщение |
| chat:created | Chat | Новый чат |
| typing:start | { chatId, userId } | Собеседник печатает |

### Схема БД: messages

| Колонка | Тип | Ограничения |
|---------|-----|-------------|
| id | UUID | PK |
| chat_id | UUID | FK → chats.id, NOT NULL, INDEX |
| sender_id | UUID | FK → users.id, NOT NULL |
| text | TEXT | NULL |
| image_url | VARCHAR(500) | NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW(), INDEX |

CHECK: text IS NOT NULL OR image_url IS NOT NULL

### Поток данных (отправка сообщения)
1. Client → message:send { chatId, text }
2. server/socket → auth check → chat membership check
3. server/services/messageService.createMessage()
4. INSERT INTO messages
5. server/socket → emit message:new → всем участникам чата (кроме отправителя)
6. Server → emit message:new → отправителю (подтверждение)

---

## 4. Модуль Shared (Общее)

### API клиент (services/api.ts)
- axios instance с baseURL /api
- interceptor: добавляет Authorization: Bearer token
- interceptor: на 401 очищает token и redirect на /login

### Socket клиент (services/socket.ts)
- socket.io-client instance
- Подключается после аутентификации с auth: { token }
- Обработка reconnect, error

### Middleware (server)

| Middleware | Путь | Описание |
|------------|------|----------|
| authMiddleware | Все /api/* кроме /auth/* | Проверка JWT, req.user = decoded |
| uploadMiddleware | /api/upload | Multer, single file, max 10MB |
| errorMiddleware | Глобальный | Логирование + ответ { error: string } |

---

## 5. Модуль Online Status (Phase 2)

### Redis схема

| Key | Value | TTL |
|-----|-------|-----|
| `online:{userId}` | `"true"` | 30s (обновляется heartbeat) |

### Socket.IO события

| Событие | Direction | Данные |
|---------|-----------|--------|
| presence:update | server → client | { userId, status: 'online' \| 'offline' } |
| heartbeat | client → server | — (каждые 15s) |

### API endpoints

| Метод | Путь | Ответ |
|-------|------|-------|
| GET | /api/users/:id/online | { online: boolean, lastSeen?: string } |

## 6. Модуль Group Chat (Phase 2)

### Типы

```typescript
interface GroupChat {
  id: string;
  name: string;
  avatarUrl?: string;
  isGroup: true;
  participants: User[];
  createdAt: string;
}

interface CreateGroupRequest {
  name: string;
  participantIds: string[];
}
```

### Изменения схемы БД: chats

| Колонка | Тип | Ограничения |
|---------|-----|-------------|
| name | VARCHAR(100) | NULL (для групп — NOT NULL) |
| avatar_url | VARCHAR(500) | NULL |
| is_group | BOOLEAN | DEFAULT false |

### API endpoints

| Метод | Путь | Тело | Ответ |
|-------|------|------|-------|
| POST | /api/chats/group | CreateGroupRequest | 201 Chat |
| POST | /api/chats/:id/members | { userId } | 200 |
| DELETE | /api/chats/:id/members/:userId | — | 200 |

## 7. Модуль Push Notifications (Phase 2)

### VAPID Keys

Генерируются через `npx web-push generate-vapid-keys`. Хранятся в .env:
```
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_MAILTO=mailto:admin@zokul.app
```

### API endpoints

| Метод | Путь | Тело | Ответ |
|-------|------|------|-------|
| POST | /api/push/subscribe | PushSubscriptionJSON | 201 |

### Поток данных

1. Пользователь открывает PWA → запрос разрешения на уведомления
2. Service Worker подписывается → subscription отправляется на POST /api/push/subscribe
3. При новом сообщении → messageService вызывает pushService.send(userId, message)
4. pushService шлёт Web Push → браузер показывает уведомление

## 8. Production & Docker (Phase 2)

### docker-compose.prod.yml

```yaml
services:
  nginx:
    image: nginx:alpine
    ports: [443:443, 80:80]
    volumes: [./docker/nginx.conf:/etc/nginx/nginx.conf, ./ssl:/etc/nginx/ssl]
  client:
    build: ./client
  server:
    build: ./server
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=postgresql://zokul:zokul@db:5432/zokul
  db:
    image: postgres:16-alpine
  redis:
    image: redis:7-alpine
```

### Переменные окружения (production)

```
# Server
PORT=3001
DATABASE_URL=postgresql://zokul:zokul@db:5432/zokul
JWT_SECRET=<generate-random-64-char>
UPLOAD_DIR=./uploads
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_MAILTO=mailto:admin@zokul.app
REDIS_URL=redis://redis:6379
CORS_ORIGIN=https://yourdomain.com
```

---

## 9. Конфигурация (обновлённая)

### Переменные окружения (dev)

```
# Server
PORT=3001
DATABASE_URL=postgresql://zokul:zokul@localhost:5433/zokul
JWT_SECRET=dev-secret-change-in-production
UPLOAD_DIR=./uploads
REDIS_URL=redis://localhost:6379
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```
