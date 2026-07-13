# Фикс-цикл #5 — Итоговый отчёт

## Статус: ✅ Выполнен

## Исправлено (7 проблем)

### UI (4)
| # | Проблема | Решение | Файлы |
|---|----------|---------|-------|
| 5 | Input touch area — не фокусируется при тапе по контейнеру | `onClick → inputRef.current?.focus()` | `MessageInput.tsx:197` |
| 6 | Input position — safe-area-bottom не работает | `safe-area-bottom → pb-2` | `MessageInput.tsx:144` |
| 7 | Upload button — mb-0.5 даёт плохое выравнивание | `mb-0.5 → self-center` | `MessageInput.tsx:173` |
| 8 | DaySeparator — серые линии лишние, слишком много отступов | Убраны flex-1 h-px, `my-4 → my-2` | `ChatView.tsx:37-46` |

### Инфраструктура (3)
| # | Проблема | Решение | Файлы |
|---|----------|---------|-------|
| 9 | Файлы в uploads/ копятся вечно | Новый cleanupService: удаление старее 3 дней, запуск каждые 6ч | `cleanupService.ts`, `index.ts` |
| 10 | Нет rate limiting на /api/auth и /api/upload | express-rate-limit (100 запросов / 15 мин) | `rateLimit.ts`, `index.ts` |
| 11 | DB Pool max по умолчанию (10) | `max: 20` | `db.ts` |

## Новые файлы
- `server/src/services/cleanupService.ts` — очистка uploads/
- `server/src/middleware/rateLimit.ts` — rate limit middleware
- `server/__tests__/cleanupService.test.ts` — 3 теста
- `server/__tests__/rateLimit.test.ts` — 2 теста

## Изменённые файлы
- `client/src/components/chat/MessageInput.tsx` — Bug #5, #6, #7
- `client/src/components/chat/ChatView.tsx` — Bug #8
- `server/src/index.ts` — подключение cleanup + rate limit
- `server/src/config/db.ts` — max: 20

## Проверки
- ✅ Client `tsc --noEmit` — чистый
- ✅ Server `tsc --noEmit` — чистый
- ✅ `npx jest` — 20/20 (7 suites)
- ✅ Docker rebuild — сборка без ошибок
- ✅ Docker up — 4/4 контейнера
