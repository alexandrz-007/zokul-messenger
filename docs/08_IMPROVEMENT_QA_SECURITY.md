# Zokul: QA и security-план для улучшений

## Цель

Этот документ задает проверочный план для внедрения технических улучшений из `docs/06_IMPROVEMENT_TASKS.md`.

Главная цель: доказать, что изменения не только написаны, но и реально защищают приватность чатов, не ломают presence, upload и auth flow.

## Security checklist

### Socket.IO authorization

- [ ] `message:send` проверяет участие в чате.
- [ ] `message:edit` проверяет участие и авторство сообщения.
- [ ] `message:delete` проверяет участие и авторство сообщения.
- [ ] `chat:delete` проверяет участие и права удаления.
- [ ] `chat:join` проверяет участие.
- [ ] `message:typing` проверяет участие.
- [ ] `chat:created` не доверяет `participantIds` от клиента.
- [ ] Все socket errors возвращают безопасные сообщения без внутренних stack traces.

### Upload security

- [ ] Изображения проходят content validation.
- [ ] Audio uploads ограничены whitelist MIME.
- [ ] Неподдерживаемые файлы возвращают 400.
- [ ] Слишком большие файлы возвращают 413.
- [ ] Временные файлы удаляются после failed validation.
- [ ] Upload URLs не позволяют path traversal.
- [ ] Static `/uploads` не отдает файлы за пределами upload directory.

### Auth security

- [ ] JWT хранится в `httpOnly` cookie.
- [ ] Cookie имеет `sameSite: "strict"`.
- [ ] `secure` включается за HTTPS/proxy.
- [ ] `tokenVersion` проверяется middleware.
- [ ] Register и change password используют одну password policy.
- [ ] Ошибки invalid credentials не раскрывают, существует ли email.

## QA checklist

### Build

Команда:

```powershell
npm.cmd run build
```

Ожидаемый результат:

- client TypeScript build проходит;
- Vite build проходит;
- PWA build проходит;
- server TypeScript build проходит.

### Full test suite

Команда:

```powershell
npm.cmd test
```

Ожидаемый результат:

- все client tests passed;
- все server tests passed;
- нет нового failed suite.

### Server-only tests

Команда:

```powershell
cd server
npm.cmd test
cd ..
```

Обязательно проверить после изменений в:

- `server/src/socket/index.ts`;
- `server/src/services/authService.ts`;
- `server/src/middleware/uploadMiddleware.ts`;
- `server/src/middleware/processImage.ts`;
- `server/src/middleware/errorMiddleware.ts`.

### Client-only tests

Команда:

```powershell
cd client
npm.cmd test
cd ..
```

Обязательно проверить после изменений в:

- `client/src/components/HomePage.tsx`;
- `client/src/components/chat/CreateGroupModal.tsx`;
- `client/__tests__/*`.

## Required test scenarios

### Scenario 1: Socket join authorization

Given:

- user A is authenticated;
- chat X exists;
- user A is not a participant of chat X.

When:

- user A emits `chat:join` with chat X id.

Then:

- socket does not join `chat:X`;
- server emits or records authorization error;
- no messages from chat X can be received by user A.

### Scenario 2: Typing authorization

Given:

- user A is authenticated;
- user A is not a participant of chat X.

When:

- user A emits `message:typing` for chat X.

Then:

- no `typing:start` is broadcast to chat X.

### Scenario 3: Multiple tabs presence

Given:

- user A has two active socket connections.

When:

- first connection disconnects.

Then:

- user A remains online;
- no offline event is broadcast.

When:

- second connection disconnects.

Then:

- user A becomes offline;
- one offline event is broadcast.

### Scenario 4: Invalid upload cleanup

Given:

- authenticated user uploads a file with image extension but invalid content.

When:

- upload endpoint processes the file.

Then:

- response is 400;
- temporary file is deleted;
- no public URL is returned.

### Scenario 5: Password validation

Given:

- new user registration request contains a too short password.

When:

- request reaches auth service.

Then:

- user is not created;
- response status is 400;
- error message is safe and clear.

## Manual smoke testing

If the environment has Postgres and Redis configured, run local services and check:

```powershell
npm.cmd run dev
```

Manual checks:

- register user A;
- register user B;
- create chat A-B;
- send text message;
- send image;
- open second tab for same user;
- close one tab and verify user remains online;
- close last tab and verify offline;
- try uploading unsupported file type;
- logout and verify protected API returns 401.

## Regression risks

| Area | Risk | Mitigation |
|---|---|---|
| Socket.IO | Added DB reads may increase latency | Use small helper, avoid duplicate reads where already loaded |
| Presence | Incorrect socket set handling | Unit tests with two sockets |
| Upload | Valid mobile audio MIME rejected | Include common browser MIME types in whitelist |
| Auth | Error mapping changes existing responses | Add controller/service tests |
| Build artifacts | Build modifies tracked generated files | Check `git status --short` after build |

## Acceptance criteria

- [ ] P0/P1 tasks from backlog complete.
- [ ] Build passes.
- [ ] Full tests pass.
- [ ] Socket authorization tests added.
- [ ] Presence multi-connection test added.
- [ ] Upload validation tests added or updated.
- [ ] Password validation tests added or updated.
- [ ] Final commit contains only intentional project changes.
