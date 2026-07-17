# Zokul: architecture map source

## Purpose

This file is the version-controlled source for the Zokul architecture map.

Use it as the canonical project-state map. The FigJam/Figma version can be regenerated or manually adjusted from these diagrams when the architecture changes.

## Maintenance rules

- Update this file when project structure, runtime services, data flows, or deployment topology changes.
- Keep diagrams honest: do not show future features as current architecture.
- If a feature is planned but not implemented, mark it as `Planned`, not as an active component.
- Keep diagrams readable. Prefer several focused maps over one huge unreadable graph.
- When a FigJam board is created from this file, paste its URL here.

FigJam board:

```text
https://www.figma.com/board/HxH5zyqL0H0Cxp44gmb7wu?utm_source=other&utm_content=edit_in_figjam&oai_id=v1%2FuRBrGTs3WmdYbmG7LAJCkyWXLGBB3tyr1hVThXwdjfSj65Dgnb7BDq&request_id=445ce9b9-cfac-4bdf-b8e7-4bfb384d84b7
```

## 01. System overview

```mermaid
flowchart LR
  User["User in browser"]
  PWA["React PWA client\nclient/src"]
  Nginx["nginx / static hosting\nclient/nginx.conf"]
  API["Express API server\nserver/src/index.ts"]
  Socket["Socket.IO server\nserver/src/socket/index.ts"]
  Postgres["PostgreSQL\nusers, chats, participants, messages, push_subscriptions"]
  Redis["Redis\presence, Socket.IO adapter, rate-related runtime state"]
  Uploads["Upload storage\nserver uploads directory"]
  WebPush["Web Push service\nVAPID"]

  User -->|"loads app"| Nginx
  Nginx -->|"serves static files"| PWA
  PWA -->|"REST /api, cookies"| API
  PWA -->|"WebSocket events"| Socket
  API -->|"queries and writes"| Postgres
  Socket -->|"queries and writes"| Postgres
  Socket -->|"presence and pub/sub"| Redis
  API -->|"stores processed media"| Uploads
  PWA -->|"reads /uploads URLs"| Uploads
  API -->|"sends notifications"| WebPush
```

## 02. Client architecture

```mermaid
flowchart LR
  App["App.tsx\nrouting and providers"]
  AuthCtx["AuthContext\nlogin, register, me, logout"]
  SocketCtx["SocketContext\nconnect/disconnect socket"]
  ThemeCtx["ThemeContext\ntheme state"]
  Home["HomePage\nmain messenger shell"]
  ChatList["ChatList\nconversation list"]
  ChatView["ChatView\nmessage timeline"]
  Input["MessageInput\ntext/media/voice composer"]
  Modals["CreateChatModal\nCreateGroupModal\nProfileEditor"]
  Hooks["Hooks\nuseChats, useMessages, usePresence, useTyping, useDraft"]
  Api["api.ts\nAxios /api client"]
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

## 03. Backend architecture

```mermaid
flowchart LR
  Index["index.ts\nExpress app bootstrap"]
  Middleware["Middleware\nauth, participant check, rate limit, upload, errors"]
  Routes["Routes\nauth, chats, groups, messages, users, push, health"]
  Controllers["Controllers\nrequest/response mapping"]
  Services["Services\nbusiness logic"]
  Models["Models\nSQL access"]
  DB["PostgreSQL pool\nconfig/db.ts"]
  RedisCfg["Redis config\nconfig/redis.ts"]
  Socket["Socket.IO setup\nsocket/index.ts"]

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

## 04. Message send flow

```mermaid
sequenceDiagram
  participant User as Browser user
  participant Client as React client
  participant Socket as Socket.IO server
  participant ChatModel as Chat model
  participant MessageService as Message service
  participant DB as PostgreSQL
  participant Push as Push service

  User->>Client: Send message
  Client->>Socket: message:send { chatId, content }
  Socket->>ChatModel: findChatById(chatId)
  ChatModel->>DB: SELECT chat and participants
  DB-->>ChatModel: chat with participantIds
  ChatModel-->>Socket: chat
  Socket->>Socket: verify sender is participant
  Socket->>MessageService: createMessage(...)
  MessageService->>DB: INSERT message
  DB-->>MessageService: saved message
  MessageService->>Push: notify other participants
  MessageService-->>Socket: message
  Socket-->>Client: message:new
  Socket-->>Client: broadcast message:new to room
```

## 05. Auth flow

```mermaid
sequenceDiagram
  participant User as Browser user
  participant Client as React client
  participant API as Express auth routes
  participant AuthService as Auth service
  participant DB as PostgreSQL

  User->>Client: Submit email and password
  Client->>API: POST /api/auth/login
  API->>AuthService: login(email, password)
  AuthService->>DB: find user by email
  DB-->>AuthService: user with password hash
  AuthService->>AuthService: bcrypt compare
  AuthService->>AuthService: sign JWT with tokenVersion
  AuthService-->>API: user and token
  API-->>Client: httpOnly cookie + user
  Client->>API: GET /api/auth/me
  API->>API: authMiddleware verifies cookie token
  API-->>Client: current user
```

## 06. Realtime and presence

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

## 07. Data model

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

## 08. Security boundaries

```mermaid
flowchart LR
  Browser["Browser"]
  Cookie["httpOnly JWT cookie"]
  AuthMW["authMiddleware\nverifies token and tokenVersion"]
  ParticipantMW["checkParticipant\nREST chat access"]
  SocketAuth["Socket auth\nverifies token"]
  SocketChecks["Socket event participant checks\nrequired for chatId events"]
  RateLimit["Rate limits\nauth, upload, socket message/connect"]
  UploadValidation["Upload validation\nMIME/content/size"]
  ErrorMW["errorMiddleware\nsafe API errors"]
  DB["PostgreSQL"]

  Browser --> Cookie
  Cookie --> AuthMW
  AuthMW --> ParticipantMW
  AuthMW --> RateLimit
  Browser --> SocketAuth
  SocketAuth --> SocketChecks
  Browser --> UploadValidation
  UploadValidation --> RateLimit
  ParticipantMW --> DB
  SocketChecks --> DB
  ErrorMW --> Browser
```

## 09. Deployment map

```mermaid
flowchart LR
  Repo["GitHub repository"]
  CI["GitHub Actions CI"]
  DockerClient["client Docker image\nnginx static app"]
  DockerServer["server Docker image\nNode dist"]
  Compose["docker-compose.local/prod"]
  Nginx["nginx reverse proxy"]
  Server["Node API and Socket.IO"]
  Postgres["PostgreSQL"]
  Redis["Redis"]
  Uploads["uploads volume"]

  Repo --> CI
  Repo --> DockerClient
  Repo --> DockerServer
  DockerClient --> Compose
  DockerServer --> Compose
  Compose --> Nginx
  Nginx --> Server
  Server --> Postgres
  Server --> Redis
  Server --> Uploads
```

## 10. Current improvement map

```mermaid
flowchart LR
  Current["Current MVP"]
  SocketHardening["P0 Socket.IO access checks"]
  PresenceFix["P0 multi-tab presence fix"]
  UploadHardening["P1 upload validation hardening"]
  TestsGreen["P1 green test suite"]
  PasswordPolicy["P2 shared password policy"]
  MigrationPolicy["P2 migration governance"]
  UIRedesign["UI polish without future-only controls"]
  Ready["More production-ready Zokul"]

  Current --> SocketHardening
  Current --> PresenceFix
  Current --> UploadHardening
  Current --> TestsGreen
  Current --> PasswordPolicy
  Current --> MigrationPolicy
  Current --> UIRedesign
  SocketHardening --> Ready
  PresenceFix --> Ready
  UploadHardening --> Ready
  TestsGreen --> Ready
  PasswordPolicy --> Ready
  MigrationPolicy --> Ready
  UIRedesign --> Ready
```
