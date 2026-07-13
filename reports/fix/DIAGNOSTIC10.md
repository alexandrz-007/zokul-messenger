# Диагностика #10: Client Hardening

---

### A. 🟢 Нет тестов на клиенте
**Место:** `client/src/__tests__/` (пустая директория)
**Root cause:** Vitest + Testing Library настроены, но тестов нет. Любой рефакторинг на клиенте — вслепую.

### B. 🟢 `any` типы в client/src (8 мест)
**Место:**
- `components/HomePage.tsx:98` — `msg: any` → `Message` (из типов)
- `components/auth/LoginForm.tsx:16` — `catch (err: any)` → `unknown`
- `components/auth/RegisterForm.tsx:21` — `catch (err: any)` → `unknown`
- `components/profile/ProfileEditor.tsx:30` — `catch (err: any)` → `unknown`
- `components/chat/CreateGroupModal.tsx:75` — `catch (err: any)` → `unknown`
- `components/chat/VoiceRecorder.tsx:54` — `catch (err: any)` → `unknown`
- `hooks/usePagination.ts:16` — `params: any` → типизировать
- `utils/audio.ts:3` — `(window as any)` → ок, но можно через `AudioContext`

### C. 🟡 Нет компрессии на сервере
**Место:** `server/src/index.ts` — нет `compression` middleware
**Root cause:** JSON-ответы (списки чатов, сообщений) не сжимаются — лишние ~70% трафика.

### D. 🟡 Нет rate limiting на socket connect
**Место:** `server/src/socket/index.ts` — есть rate limit на `message:send`, но нет на `connection`
**Root cause:** Злоумышленник может открыть тысячи WebSocket-соединений и исчерпать память/файловые дескрипторы.

---

## Severity: 🟡 Major (C, D) + 🟢 Minor (A, B)
## Тип: Performance + Security + Quality

## Затронутые файлы
- `client/src/__tests__/` — новые тесты
- `client/src/components/HomePage.tsx` — msg: any → Message
- `client/src/components/auth/LoginForm.tsx` — catch err: any → unknown
- `client/src/components/auth/RegisterForm.tsx` — catch err: any → unknown
- `client/src/components/profile/ProfileEditor.tsx` — catch err: any → unknown
- `client/src/components/chat/CreateGroupModal.tsx` — catch err: any → unknown
- `client/src/components/chat/VoiceRecorder.tsx` — catch err: any → unknown
- `client/src/hooks/usePagination.ts` — params: any → typed
- `client/src/utils/audio.ts` — window as any → typed
- `server/src/index.ts` — express compression
- `server/src/socket/index.ts` — connection rate limit
- `server/package.json` — compression dependency

## Предварительный план
1. Установить `compression` на сервер
2. Добавить socket connection rate limiting
3. Написать клиентские тесты (AuthContext, useAuth, LoginForm)
4. Заменить `any` на типы в client/src
