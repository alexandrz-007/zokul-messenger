# Tasks Backlog: Zokul — All Phases Complete

Всего задач: **46** (14 Phase 1 + 15 Phase 2 + 15 Phase 3 + 31 bugfix + 1 post-release)
Все задачи: ✅ **Completed**

---

## Phase 1: MVP (14 задач)

### T1: Infrastructure & Setup
- [x] T1.1. Project init + TypeScript + ESLint
- [x] T1.2. Docker dev environment

### T2: Database
- [x] T2.1. DB migrations + connection

### T3: Auth
- [x] T3.1. User model + auth service
- [x] T3.2. Auth middleware + controller

### T4: Chat
- [x] T4.1. Chat model + service
- [x] T4.2. Chat controller + routes

### T5: Message + Socket
- [x] T5.1. Message model + service
- [x] T5.2. Socket.IO server
- [x] T5.3. Message controller + routes
- [x] T5.4. Image upload middleware

### T6: Frontend Setup
- [x] T6.1. React + Vite + Tailwind + PWA
- [x] T6.2. API + Socket client
- [x] T6.3. AuthContext + SocketContext

### T7: UI
- [x] T7.1. Auth forms (Login/Register)
- [x] T7.2. Layout + navigation
- [x] T7.3. ChatList + ChatView
- [x] T7.4. Common UI components

---

## Phase 2: Core (15 задач)

### P2.1: UI/UX + Tech Debt
- [x] P2.1.1. Typing indicator UI
- [x] P2.1.2. Last message preview in ChatList
- [x] P2.1.3. Rate limiting on auth
- [x] P2.1.4. Member check middleware

### P2.2: Online Status
- [x] P2.2.1. Redis client + presence service
- [x] P2.2.2. Online dot UI

### P2.3: Group Chats
- [x] P2.3.1. Group API
- [x] P2.3.2. Group UI

### P2.4: Push Notifications
- [x] P2.4.1. Push subscription API
- [x] P2.4.2. Client push subscription

### P2.5: Production & Docker
- [x] P2.5.1. Dockerfile client + server
- [x] P2.5.2. docker-compose.prod.yml + .env.example
- [x] P2.5.3. Env validation + JWT secret fix

---

## Phase 3: Advanced (15 задач)

### P3.1: Voice Messages
- [x] P3.1.1. Voice recorder + upload API
- [x] P3.1.2. Voice player in ChatView

### P3.2: Reply to Message
- [x] P3.2.1. Reply API + server logic
- [x] P3.2.2. Reply UI

### P3.3: Dark Theme
- [x] P3.3.1. ThemeContext + toggle + localStorage persistence

### P3.4: Edit/Delete Messages
- [x] P3.4.1. Edit message API + socket broadcast
- [x] P3.4.2. Delete message API + socket broadcast
- [x] P3.4.3. Message actions UI (Edit/Delete dropdown)

### P3.5: Pagination
- [x] P3.5.1. Scroll-up pagination (IntersectionObserver → offset fetch)

### P3.6: Profile Editing
- [x] P3.6.1. Profile update API
- [x] P3.6.2. Profile editor UI + user info modal

### P3.7: Production Polish
- [x] P3.7.1. HTTPS nginx config (certbot + SSL)
- [x] P3.7.2. Message appear animation (CSS keyframes)
- [x] P3.7.3. Notification sound + draft saving

---

## Bugfix Round (31 fixes)

### Round 1 — Voice (A1-A5 + C1)
- [x] A1. errorMiddleware — stale error message
- [x] A2. VoiceRecorder — stale closure `duration` (useRef)
- [x] A3. VoiceRecorder — missing `onCancel` after send
- [x] A4. VoiceRecorder — missing `clearInterval` in `finally`
- [x] A5+C1. Message model — `voice_duration != null` check (0 preserved)

### Round 2 — Critical (B1-B6)
- [x] B1. checkParticipantMiddleware — no try/catch in async handler
- [x] B2. socket/index — owner check for message:edit, message:delete
- [x] B3. ChatView — scroll jump on pagination (auto-scroll only < 2s)
- [x] B4. ProfileEditor — `window.location.reload()` → `updateUser()`
- [x] B5. usePagination — `offsetRef` as number (not string)
- [x] B6. docker-compose.prod.yml — healthchecks, volumes, NODE_ENV

### Round 3 — Infra (B7-B9 + C3-C4)
- [x] B7-B8. Dockerfiles — verify package-lock.json exists
- [x] B9. setup-ssl.sh — `docker compose exec` instead of `nginx -s reload`
- [x] C3. nginx.conf — add `X-Forwarded-For` headers
- [x] C4. .env.example — complete with all vars

### Round 4 — Improvements
- [x] P3.7.2. Message appear animation — tailwind config + conditional class
- [x] P3.7.3. Notification sound + draft saving — verified working

---

## Post-Release Features

### Multi-Image Upload
- [x] P4.1. Multi-image (до 4) как в Telegram
  - **Server:** `image_urls TEXT[]` column, `uploadImagesMiddleware` (array), `createMessage`/socket/controller accept `imageUrls`
  - **Client:** `<input multiple>`, sequential uploads, `sendImages()` hook, grid render in ChatView
  - **DB:** `ALTER TABLE messages ADD COLUMN image_urls TEXT[] DEFAULT '{}'`
  - **Тесты:** server tsc ✅, client tsc ✅, build ✅, 10/10 tests ✅

#### Invite Code Auth
- [x] T8.1. Server config — добавить `INVITE_CODE` в config/app.ts + .env.example
- [x] T8.2. Server: `registerByInvite` в authService + invite controller + route
- [x] T8.3. Client: `joinByInvite` в AuthContext
- [x] T8.4. Client: создать InviteForm, удалить LoginForm/RegisterForm
- [x] T8.5. Client: App.tsx — /invite вместо /login+/register, api.ts — редирект на /invite
- [x] T8.6. Build & verify — server tsc ✅, client tsc ✅, build ✅, 10/10 tests ✅

### Post-Release Fixes (v2)
- [ ] P5.1. Доделать голосовые сообщения (заменить MediaRecorder на Web Audio API, фикс стриминга)
- [ ] P5.2. Доделать тёмную тему (доделать тёмную тему + доработать стили)
