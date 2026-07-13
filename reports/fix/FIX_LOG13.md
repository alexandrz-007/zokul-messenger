# FIX LOG #13 — Avatar fixes + UI polish

**Date:** 2026-07-13

## Changes

### 1. Avatar `onError` fallback
- **File:** `client/src/components/common/Avatar.tsx`
- `onError={() => setImgError(true)}` — при ошибке загрузки изображения `<img>` заменяется на инициалы
- Предотвращает битую иконку, если файл avatar удалён (очищен контейнер, перезапущен volume и т.д.)

### 2. Avatar URL во всех компонентах
- **File:** `client/src/components/chat/ChatList.tsx` — `url={other?.avatarUrl}` в списке диалогов
- **File:** `client/src/components/chat/ChatView.tsx` — `url` из participant для аватарок сообщений и typing indicator
- **File:** `client/src/components/HomePage.tsx` — `url` собеседника в хедере чата
- **File:** `client/src/components/chat/CreateChatModal.tsx` — `url={user.avatarUrl}`
- **File:** `client/src/components/chat/CreateGroupModal.tsx` — `url={user.avatarUrl}`

### 3. Volume для uploads в docker-compose.local.yml
- **File:** `docker-compose.local.yml`
- Добавлен named volume `uploads:/app/uploads` — файлы avatar сохраняются при перезапуске контейнера
- Добавлен `UPLOAD_DIR: /app/uploads`

### 4. Сброс `imgError` при смене URL
- **File:** `client/src/components/common/Avatar.tsx`
- `useEffect(() => setImgError(false), [url])` — сбрасывает ошибку при смене `url` (после загрузки нового avatar)
- `key={url}` на `<img>` — создаёт свежий DOM-элемент при новом URL, избегая залипания onError

### 5. Zokul heading на странице входа/регистрации
- **File:** `client/src/App.tsx` — `AuthLayout` содержит `text-7xl font-extrabold text-primary` с `animate-pulse-slow`
- **File:** `client/src/components/animations.css` — `animate-pulse-slow` (3s pulse opacity)
- Убран gradient, оставлен сплошной `primary` цвет (как буква Z)

### 6. Group chat avatar — показывать инициалы, не фото участника
- **File:** `client/src/components/chat/ChatList.tsx`
- Для групп `url` передаётся как `undefined` → Avatar показывает инициалы названия группы
- Раньше показывалось фото первого попавшегося участника (создателя)

### 7. Расширение emoji picker
- **File:** `client/src/components/chat/MessageInput.tsx`
- `EMOJIS` массив расширен с 48 до ~800 символов
- Сетка увеличена с `grid-cols-8` до `grid-cols-10`, высота с `max-h-48` до `max-h-72`
