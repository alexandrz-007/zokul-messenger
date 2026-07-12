# QA Strategy: Zokul — Full Release

## Технологии тестирования

| Level | Tool | Location |
|-------|------|----------|
| Unit (server) | Jest + ts-jest | server/__tests__/ |

---

## Тест-кейсы Phase 1

### TC1: Register
- POST /api/auth/register → 201 + { token, user }
- Duplicate email → 409
- Invalid email → 400, short password → 400, empty name → 400

### TC2: Login
- POST /api/auth/login → 200 + token + user
- Wrong password → 401
- Non-existent email → 401 (not 404)
- Empty body → 400

### TC3: JWT Middleware
- No token → 401, invalid token → 401, valid token → 200

### TC4: Create Chat
- POST /api/chats → 201 + chat with 2 participants
- Same participant twice → 200 (existing) or 409
- Self-participant → 400, non-existent → 404

### TC5: List Chats
- GET /api/chats → 200 + array with participants

### TC6: Send Message
- POST /api/chats/:id/messages → 201 + message
- Empty text → 400
- text + image_url → 200

### TC7: Socket.IO
- A sends message:send → B receives message:new
- Non-participant doesn't receive
- Reconnect → rejoin rooms

### TC8: Image Upload
- POST /api/upload with image → 200 + { url }
- File > 10MB → 413
- Non-image → 400 (in Phase 1 message: `'Only image files are allowed'`)
- No file → 400

### TC9-TC10: Frontend
- Register/Login flow → redirect to chats
- Send message → appears in chat
- Image upload → displays in chat

---

## Тест-кейсы Phase 2

### TC-P2.1: Rate Limiting
- 5 failed logins → 401, 6th → 429

### TC-P2.2: Online Status
- Socket connect → Redis key created, presence:update broadcast
- Disconnect → key deleted, status offline
- Heartbeat extends TTL

### TC-P2.3: Group Chat
- Create group → 201, isGroup = true
- Add/remove members
- Can't remove creator

### TC-P2.4: Push
- POST /api/push/subscribe → 201
- Invalid subscription → 400

### TC-P2.5: Member Check
- Non-participant GET/POST → 403

---

## Тест-кейсы Phase 3

### TC-P4.1: Multi-Image Upload
- Select 1 image → sent as single `imageUrl` (backward-compat)
- Select 2 images → sent as `imageUrls` array, rendered in 2-col grid
- Select 3 images → all uploaded, rendered in 2-col grid (2+1)
- Select 4 images → all uploaded, rendered in 2x2 grid
- Select >4 images → Toast "Maximum 4 images", nothing uploaded
- Old messages with only `imageUrl` → render normally (no grid, full width)
- Upload failure → Toast "Failed to upload images"

### TC-P3.1: Voice Messages
- POST /api/upload with audio/webm → 200 + { url }
- POST message with voiceUrl → 201, voice_url saved
- GET messages → voiceUrl, voiceDuration in response
- File > 20MB → 413
- No file → 400
- .exe file → **400 `'Only image and audio files are allowed'`** (updated message)
- **Server error message check:** `errorMiddleware.ts` returns correct 400 message

### TC-P3.2: Reply
- POST message with replyTo → 201, reply_to_id set
- replyTo deleted message → 200 (graceful, preview = unavailable)
- replyTo non-existent UUID → 400
- replyTo from different chat → 400

### TC-P3.3: Dark Theme
- localStorage empty → light by default
- toggle → class `dark` on `<html>`
- localStorage saved on toggle
- Page reload → theme restored
- prefers-color-scheme fallback

### TC-P3.4: Edit/Delete
- PATCH own message → 200, is_edited = true
- PATCH someone else's → 403
- PATCH non-existent → 404
- PATCH empty text → 400
- DELETE own → 200 (soft-delete)
- DELETE someone else's → 403
- DELETE already deleted → 200 (idempotent)
- Socket: message:edited broadcast to all participants
- Socket: message:deleted broadcast to all participants
- Client shows "edited" badge
- Client shows "Message deleted" placeholder

### TC-P3.5: Pagination
- GET ?offset=0&limit=30 → array ≤ 30
- offset after last message → empty array
- offset without limit → default 50
- **Client: scroll up → prepend, no duplicate loads (loadingRef)**
- **Client: new message auto-scrolls, pagination doesn't jump (scroll < 2s heuristic)**

### TC-P3.6: Profile
- PATCH /api/users/profile { name } → 200, name updated
- PATCH { avatarUrl } → 200
- Empty body → 400
- Empty name → 400
- Name > 100 chars → 400
- No auth → 401
- **Client: no page reload on save (updateUser via AuthContext)**

### TC-P3.7: Production Polish
- HTTPS → 200, HTTP → 301 redirect
- Certificate valid (openssl)
- Message appear animation (opacity + translateY, < 10s old)
- Notification sound via Web Audio API (oscillator, no mp3)
- Sound on message:new for non-active chat + `document.hidden`
- **No sound on message:new for active chat**
- Draft: type in chat A → switch to B → back to A → text restored
- Draft: send → cleared
- Draft: tab close → not restored (sessionStorage)

---

## E2E Browser Checklist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Register + Login | Redirect to chats |
| 2 | Create chat with another user | Chat list shows new chat |
| 3 | Send text message | Appears in real-time for recipient |
| 4 | Send image | Image displays in chat for both |
| 5 | Long-press own message | Menu: Reply, Edit, Delete |
| 6 | Edit → Save | Message updated, "edited" badge |
| 7 | Delete → Confirm | "Message deleted" placeholder |
| 8 | Long-press other's message | Only "Reply" |
| 9 | Reply → Send | Quote in chat |
| 10 | Mic button → record → stop | Voice message sent |
| 11 | Play voice message | Audio plays, progress bar moves |
| 12 | Scroll up in chat | Older messages load |
| 13 | Click name in Header | Profile modal opens |
| 14 | Change name → Save | Name updates everywhere (no reload) |
| 15 | Theme toggle | Dark/Light switch, persisted on reload |
| 16 | Type in chat A → switch to B → back | Draft restored |
| 17 | New message in background chat | Notification sound heard |
| 18 | Open on iOS Safari | PWA loads, responsive layout |

---

## Performance Considerations

| Epic | Constraint | Limit |
|------|-----------|-------|
| Voice upload | Max size | 20 MB |
| Voice upload rate | Rate limit | 10 / min per user |
| Pagination | Page size | 30 messages |
| Edit text length | Max | 4096 chars |
| Avatar upload | Max size | 5 MB |
| Image upload | Max size | 10 MB |

## Mobile Notes

| Issue | Platform | Notes |
|-------|----------|-------|
| Voice recording | iOS Safari | getUserMedia needs HTTPS + user gesture. Fallback: wav/mp4 if webm unsupported |
| Voice permissions | iOS | Deny → hide mic button + Toast |
| Voice playback | iOS Safari | `<audio>` play() must be inside user gesture handler |
| Long press | iOS Safari | touchstart + setTimeout(500ms), `user-select: none` |
| Notification sound | iOS PWA | Audio autoplay blocked. Push notifications as fallback |
| Keyboard | iOS | visualViewport API for proper MessageInput positioning |
| Memory | Mobile | Audio elements lazy-loaded (load only on play click) |
