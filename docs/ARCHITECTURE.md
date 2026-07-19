# Architecture Map

Last reviewed: 2026-07-17
Source commit: 96d5818

FigJam overview board:

```text
https://www.figma.com/board/HxH5zyqL0H0Cxp44gmb7wu?utm_source=other&utm_content=edit_in_figjam&oai_id=v1%2FuRBrGTs3WmdYbmG7LAJCkyWXLGBB3tyr1hVThXwdjfSj65Dgnb7BDq&request_id=445ce9b9-cfac-4bdf-b8e7-4bfb384d84b7
```

Mermaid in this file is the source of truth.

## System Overview

```mermaid
flowchart LR
  User["User in browser"]
  PWA["React PWA client\nclient/src"]
  Nginx["nginx / static hosting\nclient/nginx.conf"]
  API["Express REST API\nserver/src/index.ts"]
  Socket["Socket.IO realtime\nserver/src/socket/index.ts"]
  Postgres["PostgreSQL\nusers, chats, participants, messages, push_subscriptions"]
  Redis["Redis\npresence and Socket.IO adapter"]
  Uploads["Upload storage\nprocessed media files"]
  WebPush["Web Push\nVAPID notifications"]

  User -->|"loads app"| Nginx
  Nginx -->|"serves static PWA"| PWA
  PWA -->|"REST /api with credentials"| API
  PWA -->|"WebSocket events"| Socket
  API -->|"queries/writes"| Postgres
  Socket -->|"queries/writes"| Postgres
  Socket -->|"presence/pub-sub"| Redis
  API -->|"stores media"| Uploads
  PWA -->|"renders media URLs"| Uploads
  API -->|"sends notifications"| WebPush
```

## Client Architecture

```mermaid
flowchart LR
  App["App.tsx"]
  AuthCtx["AuthContext"]
  SocketCtx["SocketContext"]
  ThemeCtx["ThemeContext"]
  Home["HomePage"]
  ChatList["ChatList"]
  ChatView["ChatView"]
  Input["MessageInput"]
  Modals["CreateChatModal\nCreateGroupModal\nProfileEditor"]
  Hooks["Hooks\nuseChats/useMessages/usePresence/useTyping/useDraft"]
  Api["api.ts\nAxios"]
  SocketClient["socket.ts\nSocket.IO client"]

  App --> AuthCtx
  App --> SocketCtx
  App --> ThemeCtx
  App --> Home
  Home --> ChatList
  Home --> ChatView
  Home --> Input
  Home --> Modals
  Home --> Hooks
  Hooks --> Api
  Hooks --> SocketClient
  AuthCtx --> Api
  SocketCtx --> SocketClient
```

## Backend Architecture

```mermaid
flowchart LR
  Index["index.ts\nExpress bootstrap"]
  Middleware["Middleware\nauth, participant, rate limit, upload, errors"]
  Routes["Routes"]
  Controllers["Controllers"]
  Services["Services"]
  Models["Models"]
  DB["PostgreSQL pool\nconfig/db.ts"]
  RedisCfg["Redis config"]
  Socket["Socket.IO setup"]

  Index --> Middleware
  Index --> Routes
  Routes --> Controllers
  Controllers --> Services
  Services --> Models
  Models --> DB
  Index --> Socket
  Socket --> Services
  Socket --> Models
  Socket --> RedisCfg
```

## Message Send Flow

```mermaid
sequenceDiagram
  participant Client as React client
  participant Socket as Socket.IO server
  participant ChatModel as Chat model
  participant MessageService as Message service
  participant DB as PostgreSQL
  participant Push as Push service

  Client->>Socket: message:send { chatId, content }
  Socket->>ChatModel: findChatById(chatId)
  ChatModel->>DB: SELECT chat and participants
  DB-->>ChatModel: chat
  Socket->>Socket: verify sender is participant
  Socket->>MessageService: createMessage(...)
  MessageService->>DB: INSERT message
  MessageService->>Push: notify other participants
  MessageService-->>Socket: message
  Socket-->>Client: message:new
  Socket-->>Client: broadcast message:new to room
```

## Auth Flow

```mermaid
sequenceDiagram
  participant Client as React client
  participant API as Express auth routes
  participant AuthService as Auth service
  participant DB as PostgreSQL

  Client->>API: POST /api/auth/login
  API->>AuthService: login(email, password)
  AuthService->>DB: find user by email
  DB-->>AuthService: user with password hash
  AuthService->>AuthService: bcrypt compare and sign JWT
  AuthService-->>API: user and token
  API-->>Client: httpOnly cookie + user
  Client->>API: GET /api/auth/me
  API->>API: authMiddleware verifies cookie token
  API-->>Client: current user
```

## Realtime And Presence

```mermaid
flowchart LR
  ClientA["Client socket A"]
  ClientB["Client socket B"]
  Socket["Socket.IO instance"]
  Rooms["Chat rooms\nchat:<chatId>"]
  UserSockets["userSockets map\nuserId -> socket ids"]
  Presence["presenceService"]
  Redis["Redis\npresence TTL / pub-sub"]
  Adapter["Socket.IO Redis adapter"]

  ClientA -->|"connect with cookie token"| Socket
  ClientB -->|"connect with cookie token"| Socket
  Socket -->|"join participant rooms"| Rooms
  Socket -->|"track active sockets"| UserSockets
  Socket -->|"set online / heartbeat"| Presence
  Presence --> Redis
  Socket --> Adapter
  Adapter --> Redis
```

## Data Model

```mermaid
erDiagram
  users ||--o{ chat_participants : participates
  chats ||--o{ chat_participants : has
  chats ||--o{ messages : contains
  users ||--o{ messages : sends
  users ||--o{ push_subscriptions : owns
  messages ||--o{ messages : replies_to

  users {
    uuid id PK
    varchar email UK
    varchar password_hash
    varchar name
    varchar avatar_url
    integer token_version
    timestamptz created_at
  }

  chats {
    uuid id PK
    varchar name
    varchar avatar_url
    boolean is_group
    uuid creator_id FK
    timestamptz created_at
  }

  chat_participants {
    uuid chat_id FK
    uuid user_id FK
  }

  messages {
    uuid id PK
    uuid chat_id FK
    uuid sender_id FK
    text text
    varchar image_url
    text_array image_urls
    varchar voice_url
    numeric voice_duration
    uuid reply_to_id FK
    boolean is_edited
    timestamptz edited_at
    timestamptz deleted_at
    tsvector text_search_vector
    timestamptz created_at
  }

  push_subscriptions {
    serial id PK
    uuid user_id FK
    text endpoint
    text p256dh
    text auth
    timestamptz created_at
  }
```

## Security Boundaries

```mermaid
flowchart LR
  Browser["Browser"]
  Cookie["httpOnly JWT cookie"]
  AuthMW["authMiddleware\ntoken + tokenVersion"]
  ParticipantMW["checkParticipant\nREST chat access"]
  SocketAuth["Socket auth\ncookie/auth token"]
  SocketChecks["Socket participant checks\nchatId events"]
  RateLimit["Rate limits\nauth, upload, socket"]
  UploadValidation["Upload validation\nMIME/content/size"]
  DB["PostgreSQL"]

  Browser --> Cookie
  Cookie --> AuthMW
  AuthMW --> ParticipantMW
  Browser --> SocketAuth
  SocketAuth --> SocketChecks
  Browser --> UploadValidation
  ParticipantMW --> DB
  SocketChecks --> DB
  RateLimit --> Browser
```

## Deployment

```mermaid
flowchart LR
  Repo["GitHub repository"]
  CI["GitHub Actions CI"]
  ClientImage["client Docker image\nnginx static app"]
  ServerImage["server Docker image\nNode dist"]
  Compose["docker-compose.prod.yml"]
  Nginx["nginx reverse/static"]
  Server["Node API and Socket.IO"]
  Postgres["PostgreSQL"]
  Redis["Redis"]
  Uploads["uploads volume"]

  Repo --> CI
  Repo --> ClientImage
  Repo --> ServerImage
  ClientImage --> Compose
  ServerImage --> Compose
  Compose --> Nginx
  Compose --> Server
  Server --> Postgres
  Server --> Redis
  Server --> Uploads
```

## Code Structure

### Root

| Path | Purpose |
|---|---|
| `client/` | React/Vite PWA frontend |
| `server/` | Express/Socket.IO backend |
| `docs/` | Project documentation, AI workflow memory, gates, prompts, and task archive |
| `scripts/` | Deployment/backup helper scripts |
| `.github/workflows/ci.yml` | CI for client/server |
| `docker-compose.local.yml` | Local Docker topology |
| `docker-compose.prod.yml` | Production Docker topology |
| `.env.example` | Environment variable example |

### Client

| Path | Purpose |
|---|---|
| `client/src/App.tsx` | App routing/providers entry |
| `client/src/components/` | UI components |
| `client/src/components/auth/` | Login/register forms |
| `client/src/components/chat/` | Chat list, chat view, message input, media, voice |
| `client/src/components/common/` | Reusable Avatar/Button/Modal/ErrorBoundary |
| `client/src/components/layout/` | App shell |
| `client/src/components/profile/` | Profile editor |
| `client/src/contexts/` | Auth, Chat, Socket, Theme contexts |
| `client/src/hooks/` | Chat, presence, typing, draft, pagination, push hooks |
| `client/src/services/` | Axios API and Socket.IO client |
| `client/src/types/` | Shared client types |
| `client/__tests__/` | Vitest component/context tests |

### Server

| Path | Purpose |
|---|---|
| `server/src/index.ts` | Express app, routes, upload endpoints, startup/shutdown |
| `server/src/config/` | App config, DB pool/migrate, Redis |
| `server/src/routes/` | Express route declarations |
| `server/src/controllers/` | HTTP request/response handlers |
| `server/src/services/` | Business logic |
| `server/src/models/` | PostgreSQL access/mapping |
| `server/src/middleware/` | Auth, participant checks, upload, rate limit, error handling |
| `server/src/socket/index.ts` | Socket.IO auth, rooms, realtime events, presence |
| `server/src/utils/` | Logger |
| `server/__tests__/` | Jest tests |

### Critical Files

- `server/src/socket/index.ts`: realtime auth, chat rooms, message events, presence.
- `server/src/middleware/authMiddleware.ts`: token verification and tokenVersion revocation.
- `server/src/middleware/uploadMiddleware.ts`: upload MIME whitelist.
- `server/src/middleware/processImage.ts`: image/avatar processing and cleanup.
- `server/src/config/db.ts`: runtime schema creation/migration.
- `client/src/components/HomePage.tsx`: main messenger shell.
- `client/src/components/chat/ChatView.tsx`: message timeline.
- `client/src/components/chat/MessageInput.tsx`: message composer.

### Generated Or Risky Files

Do not stage without explicit reason:

- `node_modules/`
- `dist/`
- `.env`
- `uploads/`
- `*.log`
- `client/tsconfig*.tsbuildinfo`
- `client/vite.config.js`
- `client/vite.config.d.ts`
- `reports/`
- `server/test-uploads/`
- generated build outputs
