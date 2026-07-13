# Диагностика: Fix Cycle #5 — UI + инфраструктура

## Вводные
- Input не полностью тач-сенсорный
- Окно ввода слишком низко
- Кнопка загрузки файлов низко
- Серая полоса над input под именем (DaySeparator)
- Нужна очистка uploads/ через 3 дня
- Нет rate limiting
- Нет max connection pool

## Root Cause
См. каждый баг ниже

## Bug #5: Input touch area
- **Место:** `MessageInput.tsx:197`
- **Причина:** `<input>` внутри flex-контейнера с padding. Клик по padding'ам контейнера не фокусирует input.

## Bug #6: Input too low
- **Место:** `MessageInput.tsx:144`
- **Причина:** `safe-area-bottom` на `<form>` — излишний padding снизу.

## Bug #7: Upload button position
- **Место:** `MessageInput.tsx:173`
- **Причина:** `mb-0.5` недостаточен для выравнивания.

## Bug #8: DaySeparator lines
- **Место:** `ChatView.tsx:39-45`
- **Причина:** `<div className="flex-1 h-px bg-gray-200"/>` по бокам от времени.

## Bug #9: No upload cleanup
- **Место:** Нет сервиса очистки
- **Причина:** Файлы в uploads/ никогда не удаляются.

## Bug #10: No rate limiting
- **Место:** `server/src/index.ts`
- **Причина:** Нет `express-rate-limit` на чувствительных эндпоинтах.

## Bug #11: No pool max
- **Место:** `server/src/config/db.ts:4`
- **Причина:** `new Pool({...})` без `max` — может исчерпать соединения.

## Severity: 🟡 Major (UI) / 🔴 Critical (cleanup, rate limit)
## Тип: Bug / Infra
