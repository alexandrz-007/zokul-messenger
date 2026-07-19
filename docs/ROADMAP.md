# Roadmap

Last reviewed: 2026-07-19

## Phase 1: MVP Foundation (Current)

- [x] Core messenger: auth, 1-on-1/group chats, text/image/voice messages
- [x] Real-time messaging via Socket.IO with presence
- [x] Push notifications (Web Push / VAPID)
- [x] Image upload with processing
- [x] Voice messages with recording/playback
- [x] Mobile-responsive layout
- [x] Light/dark theme toggle
- [x] CI pipeline (GitHub Actions)
- [x] Docker production deployment
- [x] AI-assisted project workflow (Governor/Executor/Auditor)

## Phase 2: Hardening & Reliability (Next)

- [ ] Real Socket.IO integration tests (`ZOKUL-TEST-002`)
- [ ] Push subscription recovery hardening (`ZOKUL-PUSH-001`)
- [ ] Runtime observability (metrics/logging) (`ZOKUL-OPS-001`)
- [ ] Generated build file policy (`ZOKUL-DX-001`)
- [ ] Database migration governance (`ZOKUL-DB-001`)

## Phase 3: Product Experience

- [ ] Empty states and onboarding copy (`ZOKUL-PROD-001`)
- [ ] Chat list scanability (`ZOKUL-PROD-002`)
- [ ] Participant avatar viewer (`ZOKUL-PROD-003`)
- [ ] Message search
- [ ] Message reactions

## Phase 4: Administration

- [ ] Admin panel phases (`ZOKUL-ADMIN-001` through `ZOKUL-ADMIN-007`)
- [ ] User ban/unban management
- [ ] Uploads/media administration
- [ ] Moderation tools

## Phase 5: Scale

- [ ] Object storage / CDN for uploads
- [ ] PgBouncer / read replicas
- [ ] Redis cluster
- [ ] Background workers for push/media
- [ ] Observability stack
