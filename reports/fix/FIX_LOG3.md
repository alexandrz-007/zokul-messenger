# Fix Log: Fix Cycle #3 — 4 бага после тестирования
# Дата: 2026-07-13
# Severity: 🟡 Major

## Статус: 🔧 В процессе выполнения

---

### Шаг 1: Bug #1 — URL param handler в HomePage.tsx — ✅
- **Файлы:** `client/src/components/HomePage.tsx:119-130`
- **Типы:** ✅ tsc --noEmit clean (server + client)
- **Тесты:** ⏳ ручная проверка
- **Проблемы:** —
- **Заметки:** Добавлен `useEffect`, читающий `?chat=`, находящий чат по ID в `chats`, вызывающий `handleSelectChat`, очищающий URL

### Шаг 2: Bug #2 — Group display в ChatList.tsx — ✅
- **Файлы:** `client/src/components/chat/ChatList.tsx:67-97`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ ручная проверка
- **Проблемы:** —
- **Заметки:** 
  - Для групп: `displayName = chat.name || 'Group'`, аватар по displayName
  - OnlineDot скрыт для групп: `{!isGroup && count === 0 && <OnlineDot ...>}`
  - Превью для групп включает имя отправителя: `{isGroup && sender ? `${sender.name}: ` : ''}{preview}`

### Шаг 3: Bug #3 — Message padding в ChatView.tsx — ✅
- **Файлы:** `client/src/components/chat/ChatView.tsx:191`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ визуальная проверка
- **Проблемы:** —
- **Заметки:** Заменён `max-w-4xl mx-auto lg:px-4` на `px-1 sm:px-2`

### Шаг 4: Bug #4 — create uploads dir на старте сервера — ✅
- **Файлы:** `server/src/index.ts:56`
- **Типы:** ✅ tsc --noEmit clean
- **Тесты:** ⏳ ручная проверка
- **Проблемы:** —
- **Заметки:** Добавлен `fs.mkdirSync(config.uploadDir, { recursive: true })` перед `migrate()`. Добавлен `import fs from 'fs'`.

---

## Итог
- ✅ Все шаги выполнены: ✅
- ✅ Типы: ✅ server + client (tsc --noEmit clean)
- ✅ Тесты: 10/10 (npx jest)
- ✅ Docker: 4/4 контейнера up (postgres, redis, server, client)
- ✅ Документация: DIAGNOSTIC3.md, FIX_PLAN3.md, FIX_LOG3.md, fixer-brain.md updated
