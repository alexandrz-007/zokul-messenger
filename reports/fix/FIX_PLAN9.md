# Fix Plan #9: Performance + Code Quality

## Root Cause
Из DIAGNOSTIC9.md — Redis adapter, sharp, code quality.

## Тип: Performance + Refactor
## Severity: 🟡 Major

## Success Criteria
- [ ] Socket.IO использует Redis pub/sub для cross-instance коммуникации
- [ ] Загруженные изображения ресайзятся до 1920px и конвертируются в webp
- [ ] Нет `catch (err: any)` в server/src/ — везде `err: unknown`
- [ ] Нет `(req as any)` в server/src/ — везде типизированный AuthRequest
- [ ] Все тесты проходят

## Шаги реализации

### Шаг 1: Redis adapter для Socket.IO
- **Файлы:** `server/src/socket/index.ts`, `server/src/config/redis.ts`, `server/src/index.ts`
- **Что сделать:** Создать второй Redis client для pub/sub (createRedisPubSubClient). Подключить `createAdapter` в `setupSocket`.
- **Rollback:** `git checkout -- server/src/socket/index.ts server/src/config/redis.ts server/src/index.ts`

### Шаг 2: Sharp — resize uploads
- **Файлы:** `server/src/middleware/uploadMiddleware.ts`
- **Что сделать:** После multer, перед сохранением — пропустить через sharp: resize 1920px max, toFormat('webp'). Audio файлы не трогать.
- **Rollback:** `git checkout -- server/src/middleware/uploadMiddleware.ts`

### Шаг 3: Code quality — catch(err: any) → unknown
- **Файлы:** Все .ts файлы в server/src/ где есть `catch (err: any)` или `catch (err:`
- **Что сделать:** Заменить на `catch (err: unknown)` + `(err as Error).message` при необходимости
- **Rollback:** `git checkout -- server/src/socket/index.ts server/src/services/cleanupService.ts server/src/index.ts server/src/controllers/*.ts`

### Шаг 4: Code quality — (req as any).userId → AuthRequest
- **Файлы:** `server/src/controllers/chatController.ts`, `server/src/controllers/pushController.ts`, `server/src/middleware/checkParticipantMiddleware.ts`
- **Что сделать:** Заменить `(req as any).userId` на `req.userId!` (req уже типизирован как AuthRequest)
- **Rollback:** `git checkout -- server/src/controllers/chatController.ts server/src/controllers/pushController.ts server/src/middleware/checkParticipantMiddleware.ts`

### Шаг 5: Tests
- **Файлы:** `server/__tests__/uploadMiddleware.test.ts` (новый)
- **Что сделать:** Тесты sharp resize + Redis adapter smoke test
- **Rollback:** `git checkout -- server/__tests__/uploadMiddleware.test.ts`

## Regression Checklist
- [ ] Отправка сообщения (текст, изображение, голос)
- [ ] Online/offline статус
- [ ] Socket соединение
- [ ] Upload файлов
