# Fix Plan: Fix Cycle #3 — 4 бага после тестирования

## Root Cause
См. `reports/fix/DIAGNOSTIC3.md`

## Тип: UX / Bug
## Severity: 🟡 Major

## Success Criteria
- [x] Bug #1: Клик по push-уведомлению открывает нужный чат (а не список)
- [x] Bug #2: Групповые чаты отображаются с названием группы, аватаром группы, без OnlineDot
- [x] Bug #3: Сообщения прижаты к краям экрана (нет max-w-4xl)
- [x] Bug #4: Загрузка изображений работает (uploads/ создаётся при старте)

## Шаги реализации

### Шаг 1: Bug #1 — URL param handler в HomePage.tsx
- **Файлы:** `client/src/components/HomePage.tsx:25`
- **Что сделать:** Добавить `useEffect`, читающий `?chat=` из `window.location.search`, находящий чат по ID и вызывающий `handleSelectChat`. Очистить URL после выбора.
- **Ожидаемый результат:** При открытии `/?chat=CHAT_ID` автоматически выбирается и открывается нужный чат
- **Тесты:** Ручная проверка: открыть `/?chat=ID_СУЩЕСТВУЮЩЕГО_ЧАТА`, должен открыться диалог
- **Rollback:** `git checkout -- client/src/components/HomePage.tsx`

### Шаг 2: Bug #2 — Group display в ChatList.tsx
- **Файлы:** `client/src/components/chat/ChatList.tsx:67,81,87`
- **Что сделать:** 
  - Для групп: `displayName = chat.name || 'Group'`, аватар по group name
  - Скрыть `OnlineDot` для групп
  - Добавить `sender?.name:` в превью для групп
- **Ожидаемый результат:** Группы отображаются с названием, без online-точки, с правильным превью
- **Тесты:** Ручная проверка: создать группу → должно отображаться имя группы
- **Rollback:** `git checkout -- client/src/components/chat/ChatList.tsx`

### Шаг 3: Bug #3 — Message padding в ChatView.tsx
- **Файлы:** `client/src/components/chat/ChatView.tsx:191`
- **Что сделать:** Заменить `max-w-4xl mx-auto lg:px-4` на `px-1 sm:px-2`
- **Ожидаемый результат:** Сообщения прижаты к краям экрана с минимальным отступом
- **Тесты:** Визуальная проверка: сообщения не должны иметь больших полей по бокам
- **Rollback:** `git checkout -- client/src/components/chat/ChatView.tsx`

### Шаг 4: Bug #4 — create uploads dir на старте сервера
- **Файлы:** `server/src/index.ts:54-57`
- **Что сделать:** Добавить `fs.mkdirSync(config.uploadDir, { recursive: true })` перед `await migrate()`
- **Ожидаемый результат:** При старте сервера uploads/ создаётся автоматически; загрузка изображений работает
- **Тесты:** Загрузить изображение в чат → должно сохраниться и отобразиться
- **Rollback:** `git checkout -- server/src/index.ts`

## Regression Checklist
- [x] Вход/регистрация
- [x] Создание 1-1 чата
- [x] Создание группы
- [x] Отправка текстовых сообщений
- [x] Загрузка изображений
- [x] Push-уведомления
- [x] Сборка Docker

## Затрагиваемые модули
- HomePage — добавлен useEffect для URL params
- ChatList — группы отображаются корректно
- ChatView — убран max-w-4xl
- index.ts (server) — добавлен mkdirSync

## Время оценки
- Шаг 1: ~5 минут
- Шаг 2: ~5 минут
- Шаг 3: ~2 минуты
- Шаг 4: ~3 минуты
