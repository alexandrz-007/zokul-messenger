# Structure: Zokul — Full Release

## Current phase: All 3 phases complete

---

## Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Frontend | React + TypeScript + Vite + Tailwind CSS | Fast PWA builds, iOS-style UI via Tailwind |
| PWA | vite-plugin-pwa + Service Worker | Auto manifest, SW, iOS icons |
| Backend | Node.js + TypeScript + Express | Same language as frontend |
| Real-time | Socket.IO | Reliable with polling fallback (iOS Safari) |
| Database | PostgreSQL | ACID, JSON support |
| Cache | Redis | Speed, presence, voice temp metadata |
| Auth | JWT + bcrypt | Sessionless, PWA-friendly |
| Media | Multer (disk storage) | Images + voice messages |
| Audio | MediaRecorder + Web Audio API | Client-side recording + playback |
| Containers | Docker + docker-compose | Unified dev/prod env |
| Testing | Jest (server) | Unit + integration |
| SSL | Certbot + Let's Encrypt | HTTPS for PWA + Push |

---

## Style & Pattern Contract

- **Typing:** No `any`. All props, args, returns — strict TypeScript `interface` (not `type`).
- **Error handling:** No empty `catch`. Every error logged via Logger. Client shows toast/notification.
- **Async:** `async/await` only. No `.then()/.catch()`.
- **Separation of concerns:** Business logic only in `services/`. Controllers parse requests and respond. React components call hooks, never raw API.
- **Code style:** 2 spaces, single quotes, semicolons required.
- **Naming:** Folders — kebab-case, files — kebab-case, components — PascalCase, functions/vars — camelCase.
- **React:** Functional components only. State via hooks. Global state via Context (no Redux).
- **API:** REST plural nouns (`/api/chats`). Socket events `namespace:action` (`message:send`).
- **File organization:** Feature-based grouping inside `components/` (e.g. `components/voice/`, `components/profile/`). Cross-cutting concerns (hooks, services, types) stay flat.
- **CSS:** Tailwind utility classes only. Custom CSS only for animation keyframes. Dark theme via `dark:` prefix + `class` strategy.
- **Audio:** MediaRecorder + Blob → FormData upload. Never base64 inline. Player uses native `<audio>` with custom controls.
- **Multi-image:** `<input type="file" multiple>` uploads each image sequentially via `POST /api/upload`, sends as `imageUrls: string[]` in `message:send`. Rendered in 1-2 column grid.
- **Pagination:** Server-driven offset/limit (int). Client uses IntersectionObserver on a sentinel element. No infinite scroll libraries.
- **Draft save:** `sessionStorage` (per-chat draft survives page reload but not session). Key: `draft:{chatId}`.
- **Notification sound:** Web Audio API oscillator (no mp3 file). Plays on `message:new` for non-active chat.
- **Owner check:** Done at service layer (`messageService.editMessage`, `messageService.deleteMessage`), not middleware.

---

## Folder Structure

```
zokul/
├── client/                          ← React PWA
│   ├── public/
│   │   └── icons/                  ← PWA icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/               ← LoginForm, RegisterForm
│   │   │   ├── chat/
│   │   │   │   ├── ChatList.tsx
│   │   │   │   ├── ChatView.tsx    ← Props: currentUserName, participants
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── MessageInput.tsx
│   │   │   │   ├── MessageActions.tsx ← Edit/Delete dropdown
│   │   │   │   ├── ReplyQuote.tsx  ← Reply preview
│   │   │   │   ├── VoiceRecorder.tsx ← Record/stop/send
│   │   │   │   ├── VoicePlayer.tsx ← Play/pause/seek
│   │   │   │   ├── TypingIndicator.tsx
│   │   │   │   └── OnlineDot.tsx
│   │   │   ├── common/             ← Avatar, Modal, Toast
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   └── ThemeToggle.tsx ← Dark/light switch
│   │   │   └── profile/
│   │   │       └── ProfileEditor.tsx ← Edit name + avatar
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx      ← user, token, login, register, updateUser
│   │   │   ├── SocketContext.tsx
│   │   │   ├── ThemeContext.tsx     ← Dark theme state + localStorage
│   │   │   └── ChatContext.tsx     ← replyTo state
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   ├── usePagination.ts    ← IntersectionObserver + offset fetch (number)
│   │   │   ├── useDraft.ts         ← sessionStorage draft save/restore
│   │   │   ├── usePresence.ts
│   │   │   ├── useTyping.ts
│   │   │   └── usePushSubscription.ts
│   │   ├── services/
│   │   │   ├── api.ts              ← axios instance
│   │   │   ├── socket.ts
│   │   │   └── push.ts
│   │   ├── types/
│   │   │   └── index.ts            ← All interfaces
│   │   ├── utils/
│   │   │   ├── audio.ts            ← playNotificationSound (Web Audio API)
│   │   │   └── cn.ts               ← classnames helper
│   │   ├── components/
│   │   │   └── animations.css      ← @keyframes message-appear
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css               ← Tailwind imports + dark theme vars
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js           ← darkMode: 'class', extend animation
│   └── package.json
├── server/                          ← Express API
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── chatController.ts
│   │   │   ├── messageController.ts ← PATCH, DELETE with userId
│   │   │   ├── userController.ts    ← Profile update
│   │   │   ├── uploadController.ts
│   │   │   └── pushController.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts
│   │   │   ├── uploadMiddleware.ts  ← 20MB, audio/* + image/* MIME filter
│   │   │   ├── errorMiddleware.ts  ← 'Only image and audio files are allowed'
│   │   │   ├── checkParticipantMiddleware.ts ← try/catch async handler
│   │   │   └── rateLimitMiddleware.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Chat.ts
│   │   │   ├── Message.ts          ← reply_to, voice_url, is_edited, deleted_at
│   │   │   └── PushSubscription.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── chatRoutes.ts
│   │   │   ├── messageRoutes.ts    ← PATCH DELETE routes
│   │   │   ├── userRoutes.ts       ← Profile routes
│   │   │   └── pushRoutes.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── chatService.ts
│   │   │   ├── messageService.ts   ← editMessage/deleteMessage with owner check
│   │   │   ├── userService.ts
│   │   │   ├── presenceService.ts
│   │   │   ├── groupService.ts
│   │   │   └── pushService.ts
│   │   ├── socket/
│   │   │   └── index.ts            ← owner check for message:edit, message:delete
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── hash.ts
│   │   │   └── jwt.ts
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   ├── app.ts
│   │   │   └── redis.ts
│   │   └── index.ts
│   ├── migrations/
│   │   └── 003_phase3.sql
│   ├── __tests__/
│   │   ├── authService.test.ts
│   │   ├── chatService.test.ts
│   │   └── messageService.test.ts
│   ├── .env.example                 ← Full vars: PORT, NODE_ENV, DATABASE_URL, etc.
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
├── scripts/
│   └── setup-ssl.sh                ← Certbot init + docker compose exec reload
├── docker-compose.yml               ← Dev
├── docker-compose.prod.yml          ← Prod: + healthchecks, volumes (redis, uploads), NODE_ENV
├── docs/
│   ├── 00_PROJECT_PLAN.md
│   ├── 01_STRUCTURE.md
│   ├── 02_ARCHITECTURE.md
│   ├── 03_TASKS_BACKLOG.md
│   ├── 04_QA_STRATEGY.md
│   ├── PROCESS.md
│   └── PROGRESS.md
└── reports/
```

---

## Modules

### Phase 1 — MVP

| Module | Files | Depends on |
|--------|-------|------------|
| Auth | models/User, services/authService, middleware/authMiddleware, controllers/authController, routes/authRoutes | DB |
| Chat | models/Chat, services/chatService, controllers/chatController, routes/chatRoutes | Auth |
| Message | models/Message, services/messageService, controllers/messageController, routes/messageRoutes | Auth, Chat |
| Upload | middleware/uploadMiddleware | — |
| Frontend | All client components | All server modules |

### Phase 2 — Core

| Module | Files | Depends on |
|--------|-------|------------|
| Typing indicator | TypingIndicator.tsx, ChatView.tsx | Socket |
| Last message preview | models/Chat, ChatList.tsx | Chat |
| Rate limiting | middleware/rateLimitMiddleware | — |
| Member check | middleware/checkParticipantMiddleware | Chat |
| Online status | config/redis, services/presenceService, socket, usePresence, OnlineDot | Redis |
| Group chats | services/groupService, controllers/groupController, CreateGroupModal | Chat |
| Push notifications | services/pushService, pushController, push.ts, usePushSubscription | Auth, Message |
| Docker prod | Dockerfile.client, Dockerfile.server, docker-compose.prod.yml, nginx.conf | — |

### Phase 3 — Advanced

| Module | Files | Depends on |
|--------|-------|------------|
| Voice Messages | VoiceRecorder.tsx, VoicePlayer.tsx, utils/audio.ts | Auth, Chat, Message |
| Reply | ReplyQuote.tsx, ChatContext (replyTo), MessageInput | Chat, Message |
| Dark Theme | ThemeContext, ThemeToggle, tailwind.config.js | — |
| Edit/Delete | MessageActions.tsx, messageController (PATCH/DELETE), messageService | Auth, Message |
| Pagination | usePagination.ts, ChatView (sentinel) | Message |
| Profile Editing | ProfileEditor.tsx, userController, authContext (updateUser) | Auth |
| SSL + Polish | nginx.conf, setup-ssl.sh, animations.css, useDraft, audio.ts | — |

---

## Key Decisions

1. **Voice messages as regular file uploads** — reuse POST /api/upload + message:send. MediaRecorder → Blob → FormData → server file → voiceUrl in Message. Player uses `<audio>` with custom controls.
2. **Reply via `replyTo` FK** on messages table. Server resolves sender name + text for quote preview.
3. **Delete = soft-delete** — set `deleted_at`, clear `text`. Show "Message deleted" placeholder.
4. **Pagination = cursor-based offset** (number, int). Client tracks offset in `useRef(0)`.
5. **Dark theme = Tailwind `class` strategy** — `ThemeContext` reads localStorage, sets class on `<html>`.
6. **Draft = sessionStorage** — keyed by `draft:{chatId}`. Restored on chat switch, cleared on send.
7. **Notification sound** = Web Audio API oscillator (no mp3). Plays on `message:new` for non-active + `document.hidden`.
8. **Owner check** — at service layer (messageService), not middleware. `editMessage` and `deleteMessage` accept `userId` param.
9. **Duration ref** for VoiceRecorder — `useRef` (not state) to avoid stale closure in `onstop` handler.
10. **Multi-image messages** — DB column `image_urls TEXT[]`. Client uploads up to 4 images sequentially, sends as `imageUrls: string[]` via socket. Rendered in CSS grid (1 = full, 2-4 = 2 cols). Backward-compatible: single `imageUrl` still supported.

---

## Extension Points

- Voice → Voice-to-text STT API
- Reply → Threads (thread_id + thread_ts)
- Dark → System preference listener
- Edit → Edit history (message_edits table)
- Delete → Recall for all (hard-delete within 5 min)
- Pagination → Virtual list (react-window)
- Profile → Cover photo
- Draft → Cloud sync
- Sound → Per-chat mute
- SSL → Multi-domain
- Multi-image → Image carousel/gallery view on tap
