# Диагностика: Fix Cycle #3 — 4 бага после тестирования

## Вводные
Пользователь протестировал приложение в браузере (localhost) и нашёл 4 новых бага:

1. Push-уведомление → клик открывает список чатов, а не конкретный диалог
2. Групповые чаты не работают — при создании группы показывается как 1-1 чат
3. Сообщения слишком далеко от краёв экрана
4. Загрузка фото не работает + непонятен механизм хранения/очистки

## Симптомы

### Bug #1: Push notification click → chat list, not specific chat
- SW (`sw.ts:37-39`) открывает `/?chat=${chatId}` при клике на нотификацию
- App загружается на `/` → `HomePage` не читает `?chat=` параметр
- Чаты загружаются, но нужный не выбирается

### Bug #2: Group chats display as 1-1
- `ChatList.tsx:67` — `const other = chat.participants.find(p => p.id !== currentUserId)`
- `ChatList.tsx:87` — `{other?.name || 'Unknown'}` — всегда имя первого другого участника
- Для групп (`isGroup: true`) игнорируется `chat.name`
- Online-точка показывается для групп (некорректно)
- В превью нет имени отправителя для групп

### Bug #3: Messages too far from edges
- `ChatView.tsx:191` — `<div className="max-w-4xl mx-auto lg:px-4">`
- `max-w-4xl` = 896px — узкая колонка на широких экранах
- `mx-auto` центрирует, создавая пустые поля по бокам

### Bug #4: Image upload not working
- `uploadMiddleware.ts` → multer diskStorage → `./uploads`
- `express.static` → `path.join(__dirname, '..', 'uploads')`
- В Docker: оба пути ведут к `/app/uploads`, но директория НЕ СУЩЕСТВУЕТ в образе
- multer не создаёт директорию автоматически → ошибка при сохранении

## Root Cause

### Bug #1: HomePage.tsx:25-58
- **Место:** `client/src/components/HomePage.tsx:25`
- **Причина:** `HomePageInner` не читает URL search params при загрузке. Нет `useEffect`, который бы парсил `?chat=` и вызывал `handleSelectChat`.

### Bug #2: ChatList.tsx:67,81,87
- **Место:** `client/src/components/chat/ChatList.tsx:67,81,87`
- **Причина:** Во всех местах используется `other?.name` вместо проверки `chat.isGroup`. Для групп нужно показывать `chat.name`, использовать групповой аватар и скрыть OnlineDot.

### Bug #3: ChatView.tsx:191
- **Место:** `client/src/components/chat/ChatView.tsx:191`
- **Причина:** Контейнер сообщений ограничен `max-w-4xl mx-auto`, что сужает область сообщений на широких экранах.

### Bug #4: server/src/index.ts:54
- **Место:** `server/src/index.ts:54-57`
- **Причина:** При старте сервера не создаётся `uploads/` директория. multer и express.static ожидают её существования.

## Severity: 🟡 Major (все 4)
- Bug #1: 🟡 Major — UX сломан, фича работает частично
- Bug #2: 🟡 Major — группы отображаются как 1-1 чаты
- Bug #3: 🟢 Minor — косметика
- Bug #4: 🟡 Major — фича не работает

## Тип: UX / Bug
- Bug #1: UX — навигация после нажатия
- Bug #2: Bug — некорректное отображение
- Bug #3: UX — вёрстка
- Bug #4: Bug — upload не работает, Infra — storage

## Затронутые файлы
- `client/src/components/HomePage.tsx:25` — нет обработки URL params
- `client/src/components/chat/ChatList.tsx:67,81,87` — группы как 1-1
- `client/src/components/chat/ChatView.tsx:191` — max-w-4xl ограничение
- `server/src/index.ts:54-57` — отсутствует mkdir для uploads

## Предварительный план (2-3 предложения)
1. Добавить в HomePage.tsx useEffect для чтения `?chat=` из URL и auto-select чата
2. Исправить ChatList.tsx: для групп показывать chat.name, групповой аватар, скрыть OnlineDot
3. Убрать max-w-4xl из ChatView.tsx, заменить на px-1 sm:px-2
4. Добавить `fs.mkdirSync(config.uploadDir, { recursive: true })` в старт сервера

## Вопросы к пользователю
- [ ] Утвердить план исправления?
