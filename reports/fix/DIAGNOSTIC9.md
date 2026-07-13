# Диагностика #9: Performance + Code Quality

---

### A. 🟡 Нет Redis adapter для Socket.IO
**Место:** `server/src/socket/index.ts`
**Root cause:** Два инстанса сервера → каждый хранит комнаты в памяти. Участник на server-1 не видит событий от server-2. Решение: `@socket.io/redis-adapter`.

### B. 🟡 Upload без ресайза
**Место:** `server/src/middleware/uploadMiddleware.ts`
**Root cause:** Пользователь загружает 10MB JPEG → сохраняется как есть. Нет ресайза до 1920px, нет конвертации в webp.

### C. 🟢 Code quality
**Место:** 15+ мест в server/src/
**Root cause:** `catch (err: any)`, `(req as any).userId`, `params: any[]`, `row: any` — ослабленные типы.

---

## Severity: 🟡 Major (A, B) + 🟢 Minor (C)
## Тип: Performance + Refactor

## Затронутые файлы
- `server/src/socket/index.ts` — Redis adapter
- `server/src/config/redis.ts` — pub/sub client
- `server/src/middleware/uploadMiddleware.ts` — sharp
- `server/src/index.ts` — подключение adapter
- `server/src/models/Message.ts`, `server/src/models/Chat.ts`, `server/src/models/User.ts` — row types
- `server/src/services/notificationService.ts` — any types
- `server/src/controllers/*.ts` — catch err: any
- `server/src/middleware/*.ts` — any types
- `server/src/services/cleanupService.ts` — catch err: any

## Предварительный план
1. Установить `@socket.io/redis-adapter` и `sharp`
2. Socket.IO Redis adapter в `setupSocket()`
3. Sharp resize в `uploadMiddleware`
4. Замена `any` на `unknown` во всем catch
5. Типизация `AuthRequest` вместо `as any`
6. Тесты
