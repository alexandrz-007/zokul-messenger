# Architecture: Zokul — Full Release

## Overview
Phase 3 adds 7 modules on top of Phase 1 (MVP) and Phase 2 (Core): Voice Messages, Reply, Dark Theme, Edit/Delete, Pagination, Profile Editing, Production Polish. All implemented and bugfixed.

---

## Multi-Image Messages

Images can now be sent in groups of up to 4, stored as `image_urls TEXT[]` in the `messages` table.

### Data Flow

1. User taps attach → file picker opens with `multiple` attribute
2. User selects 1-4 images
3. Client uploads each image sequentially via `POST /api/upload` (reuses existing endpoint)
4. All URLs collected into `string[]`
5. If 1 image → emits `message:send { imageUrl }` (backward-compatible)
6. If 2-4 images → emits `message:send { imageUrls }`
7. Server stores in `image_urls` column
8. Client renders grid: 1 = full width, 2-4 = 2-column grid

### DB Schema

| Column | Type | Constraints |
|--------|------|-------------|
| image_urls | TEXT[] | DEFAULT '{}' |

### API

| Method | Path | Body | Response | Errors |
|--------|------|------|----------|--------|
| POST | /api/upload | multipart files[] (max 4) | 200 { url } per file | 400 no file, 413 > 20MB |

### Error States

- > 4 files selected → Toast "Maximum 4 images"
- Upload fails → Toast "Failed to upload images"
- Backward-compatible: old messages with single `imageUrl` render normally

---

## Updated Interfaces

```typescript
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  imageUrls?: string[];
  voiceUrl?: string;
  voiceDuration?: number;
  replyTo?: ReplyPreview;
  isEdited: boolean;
  createdAt: string;
}

interface ReplyPreview {
  messageId: string;
  senderId: string;
  senderName: string;
  text?: string;
  imageUrl?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}
```

---

## 1. Voice Messages (P3.1)

### Data Flow

1. User taps mic → `VoiceRecorder` requests `getUserMedia({ audio: true })`
2. `MediaRecorder` wraps stream, records chunks, produces Blob (opus/webm)
3. On stop: `Blob` → `FormData` → `POST /api/upload`
4. Server saves via Multer (20MB limit, MIME filter `audio/*` + `image/*`) → `{ url }`
5. Client sends `message:send { chatId, voiceUrl, voiceDuration }` via socket
6. Server creates Message with `voice_url`, `voice_duration`
7. Receiver renders `<VoicePlayer>` with play/pause/seek

### API

| Method | Path | Body | Response | Errors |
|--------|------|------|----------|--------|
| POST | /api/upload | multipart file | 200 { url } | 400 no file, 413 > 20MB |

### Key Bugfixes

- `durationRef` via `useRef` (not state) — stale closure fixed
- `onCancel()` called after successful voice send
- `clearInterval` in `finally` block
- `errorMiddleware.ts` error message updated: `'Only image and audio files are allowed'`
- `Message.ts` model: `voice_duration != null ? Number(...) : undefined` (0 duration preserved)
- `VoicePlayer` falls back to `audio.duration` metadata when `voiceDuration` is 0/undefined

### Error States

- Microphone denied → VoiceRecorder shows error + X button → `onCancel()`
- Upload fails → "Upload failed" + X button → returns to text input
- File too large → 413 from server
- MediaRecorder not supported → mic button hidden

---

## 2. Reply to Message (P3.2)

### Data Flow

1. User taps own message → MessageActions → "Reply"
2. Resolves `senderName` from `participants` prop → sets `replyTo` in ChatContext
3. `<ReplyQuote>` bar renders above MessageInput
4. Client sends `message:send { chatId, text, replyTo: originalMessageId }`
5. Server resolves original message by UUID, saves `reply_to_id`
6. Emits `message:new` with `replyTo` object

### DB Schema

| Column | Type | Constraints |
|--------|------|-------------|
| reply_to_id | UUID | FK → messages.id ON DELETE SET NULL |

---

## 3. Dark Theme (P3.3)

### Architecture (purely client-side)

- `ThemeContext` at App root, provides `{ theme, toggleTheme }`
- Init: read `localStorage('zokul-theme')` → fallback `prefers-color-scheme`
- Apply: `document.documentElement.classList.toggle('dark', theme === 'dark')`
- Tailwind `darkMode: 'class'`, all components use `dark:` prefix
- `<ThemeToggle>` button (sun/moon SVG) in Header

---

## 4. Edit/Delete Messages (P3.4)

### API

| Method | Path | Body | Response | Errors |
|--------|------|------|----------|--------|
| PATCH | /api/chats/:chatId/messages/:messageId | { text } | 200 Message | 400, 403, 404 |
| DELETE | /api/chats/:chatId/messages/:messageId | — | 200 { chatId, messageId } | 403, 404 |

### Socket Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| message:edit | client → server | { messageId, chatId, text } | Request edit |
| message:edited | server → client | { messageId, chatId, text, editedAt } | Broadcast edit |
| message:delete | client → server | { messageId, chatId } | Request delete |
| message:deleted | server → client | { messageId, chatId } | Broadcast delete |

### DB Schema

| Column | Type | Constraints |
|--------|------|-------------|
| is_edited | BOOLEAN | NOT NULL DEFAULT false |
| edited_at | TIMESTAMPTZ | NULL |
| deleted_at | TIMESTAMPTZ | NULL |

### Owner Check

Owner check implemented in **service layer** (`messageService.ts`), not middleware:

```typescript
// message:edit handler
const existing = await MessageModel.findById(messageId);
if (existing.senderId !== userId) throw new Error('Not authorized');

// message:delete handler
const msg = await MessageModel.findById(messageId);
if (msg.senderId !== userId) throw new Error('Not authorized');
```

Both `messageService.editMessage()` and `messageService.deleteMessage()` accept `userId` param.

---

## 5. Pagination (P3.5)

### Architecture

- Cursor-based: `GET /api/chats/:chatId/messages?offset=<number>&limit=30`
- Client tracks `offsetRef` (number, `useRef(0)`) — **not** string
- IntersectionObserver on sentinel `<div>` at top of message list
- Lock `loadingRef` to prevent duplicate fetches
- If response length < limit → `hasMore = false`, disconnect observer
- Auto-scroll to bottom only for messages < 2 seconds old (no jump on pagination)

### Key Bugfix

`usePagination.ts`: `offsetRef` changed from `string | null` to `number` (`useRef(0)`). Sends int to API, no string-to-int conversion.

---

## 6. Profile Editing (P3.6)

### API

| Method | Path | Body | Response | Errors |
|--------|------|------|----------|--------|
| PATCH | /api/users/profile | { name?, avatarUrl? } | 200 User | 400, 401 |

### Data Flow

1. User clicks name/avatar in Header → ProfileEditor modal opens
2. Edits name → clicks "Save"
3. Client sends `PATCH /api/users/profile { name }`
4. Server validates, updates `users` row → returns updated User
5. Client calls `updateUser(res.data)` on AuthContext (no `window.location.reload()`)

### Key Bugfix

`ProfileEditor.tsx`: `window.location.reload()` replaced with `updateUser()` from AuthContext — **no page reload**.

---

## 7. Production SSL & Polish (P3.7)

### HTTPS

```
nginx:
- Port 443 SSL with ssl_certificate
- HTTP 80 → 301 redirect
- X-Forwarded-For header in all proxy locations

setup-ssl.sh:
- certbot certonly → copy to ./ssl/
- cron: docker compose exec -T client nginx -s reload

docker-compose.prod.yml:
- Healthchecks for postgres + redis
- NODE_ENV=production
- Volumes: pgdata, redisdata, uploads
```

### Animations

```css
@keyframes message-appear {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Applied as `animate-message-appear` on message bubbles < 10 seconds old (new messages only).

### Notification Sound

```typescript
// utils/audio.ts — Web Audio API oscillator (no mp3)
function playNotificationSound() {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  // 520Hz sine, 350ms, gentle volume
  oscillator.connect(ctx.destination);
  oscillator.start(); oscillator.stop(ctx.currentTime + 0.35);
}
```

Called when `message:new` received for non-active chat + `document.hidden` is true.

### Draft Save

- `useDraft` hook: sessionStorage key `draft:{chatId}`
- Save on input change, restore on chat switch, clear on send
- Props: `draft={draft} onDraftChange={saveDraft}` on `<MessageInput>`

---

## Migration SQL

```sql
ALTER TABLE messages ADD COLUMN reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN voice_url VARCHAR(500);
ALTER TABLE messages ADD COLUMN voice_duration INTEGER;
ALTER TABLE messages ADD COLUMN is_edited BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE messages ADD COLUMN edited_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_check;
ALTER TABLE messages ADD CONSTRAINT messages_check
  CHECK (text IS NOT NULL OR image_url IS NOT NULL OR voice_url IS NOT NULL);
```

---

## Cross-Cutting Concerns

### Error Response Format
```json
{ "error": "Human-readable message" }
```

### Authentication
JWT via `Authorization: Bearer <token>`, enforced by `authMiddleware`.

### Upload MIME Filter
- Images: `jpg|jpeg|png|gif|webp`
- Audio: `audio/*` (webm, ogg, wav, mp4)
- Max size: 20 MB (voice), 10 MB (images), 5 MB (avatar)

### Error Messages
- File filter rejects → `400 "Only image and audio files are allowed"`

### WebSocket Room Model
All `message:*` events scoped to chat rooms. Server emits `message:edited`/`message:deleted` to the room.

### Docker Production
- `depends_on: condition: service_healthy` for postgres + redis
- `NODE_ENV: production` set
- Uploads persisted via named volume `uploads`
