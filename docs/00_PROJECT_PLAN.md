# Project Plan: Zokul — Universal Messenger

## Description
Universal messenger PWA for everyone. Real-time messaging, image/voice sharing, push notifications, online status, groups, dark theme, reply, edit/delete, pagination, profile editing.

## Target Audience
Anyone who needs a fast, beautiful messenger installable on iPhone via PWA.

## Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| PWA | vite-plugin-pwa + Service Worker |
| Backend | Node.js + TypeScript + Express |
| Real-time | Socket.IO |
| Database | PostgreSQL |
| Cache / Online status | Redis |
| Auth | JWT + bcrypt |
| File uploads | Multer (disk storage) |
| Audio | MediaRecorder + Web Audio API |
| Infrastructure | Docker + docker-compose |
| SSL | Certbot + Let's Encrypt |

## Roadmap

### Phase 1: MVP ✅ CLOSED
- Project setup (Vite + Express + Docker)
- PWA (manifest, Service Worker, icons)
- Register / Login (JWT)
- 1-on-1 chats (Socket.IO)
- Image uploads
- iOS-style UI

### Phase 2: Core ✅ CLOSED
- Push notifications (Web Push API)
- Online status (Redis presence)
- Group chats
- Typing indicator, last message preview, rate limiting, member check
- Docker production setup
- Env validation

### Phase 3: Advanced ✅ CLOSED
- Voice messages (MediaRecorder → upload → playback)
- Reply to message (quote + send)
- Dark theme (toggle + localStorage)
- Edit/Delete messages (PATCH/DELETE + socket broadcast)
- Pagination (scroll up → cursor-based offset)
- Profile editing (name + avatar)
- HTTPS nginx config (Certbot + auto-renew cron)
- Message appear animation + notification sound + draft save
- **31 bugfixes** across server, client, and infra

## Constraints
- PWA must work on iOS Safari
- HTTPS required for PWA Service Worker and Push
