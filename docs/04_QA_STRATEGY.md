# QA Strategy: Zokul — Фаза 1 (MVP)

## Технологии тестирования

| Уровень | Инструмент | Где |
|---------|-----------|-----|
| Unit (server) | Jest + ts-jest | server/__tests__/ |
| Unit (client) | Vitest + React Testing Library | client/src/__tests__/ |
| E2E | — | Фаза 2 |

---

## Тест-кейсы

### TC1: Регистрация пользователя
- **Связанная задача:** T3.1, T3.2
- **Предусловия:** БД пуста
- **Шаги:**
  1. POST /api/auth/register с { email: "test@test.com", password: "Pass123!", name: "Test" }
  2. Проверить: 201 + тело содержит { token: string, user: { id, email, name } }
  3. POST /api/auth/register с тем же email
- **Ожидаемый результат:** 409 Conflict
- **Граничные случаи:**
  - email без @ → 400
  - password < 6 символов → 400
  - name пустой → 400

### TC2: Логин пользователя
- **Связанная задача:** T3.2
- **Предусловия:** Пользователь зарегистрирован
- **Шаги:**
  1. POST /api/auth/login с { email: "test@test.com", password: "Pass123!" }
  2. Проверить: 200 + token + user
  3. POST /api/auth/login с неверным паролем
- **Ожидаемый результат:** 401 Unauthorized
- **Граничные случаи:**
  - Несуществующий email → 401 (не 404 — security)
  - Пустое тело → 400

### TC3: JWT middleware
- **Связанная задача:** T3.2
- **Шаги:**
  1. GET /api/chats без Authorization header
- **Ожидаемый результат:** 401
  2. GET /api/chats с invalid token
- **Ожидаемый результат:** 401
  3. GET /api/chats с валидным токеном
- **Ожидаемый результат:** 200

### TC4: Создание чата
- **Связанная задача:** T4.2
- **Предусловия:** 2 пользователя (A, B) зарегистрированы
- **Шаги:**
  1. POST /api/chats как пользователь A с { participantId: B.id }
  2. Проверить: 201 + chat с participantIds = [A.id, B.id]
  3. POST /api/chats как A с тем же B.id
- **Ожидаемый результат:** 200 (возврат существующего чата) или 409
- **Граничные случаи:**
  - participantId = self → 400
  - participantId не существует → 404

### TC5: Получение списка чатов
- **Связанная задача:** T4.2
- **Предусловия:** У пользователя A есть чат с B
- **Шаги:**
  1. GET /api/chats как A
- **Ожидаемый результат:** 200 + массив с 1 чатом, participants включают B

### TC6: Отправка сообщения
- **Связанная задача:** T5.2, T5.3
- **Предусловия:** Чат существует между A и B
- **Шаги:**
  1. POST /api/chats/:chatId/messages как A с { text: "Hello" }
  2. Проверить: 201 + message с text = "Hello", senderId = A.id
  3. GET /api/chats/:chatId/messages
- **Ожидаемый результат:** 200 + массив, содержащий сообщение
- **Граничные случаи:**
  - Пустой text → 400
  - text + image_url → 200 (оба заполнены)
  - B отправляет → 201, A видит message:new через socket

### TC7: Socket.IO real-time
- **Связанная задача:** T5.2
- **Предусловия:** A и B в одном чате, оба подключены к socket
- **Шаги:**
  1. A отправляет message:send { chatId, text: "Hi" }
  2. B получает message:new
- **Ожидаемый результат:** B получил событие message:new с правильным сообщением
- **Граничные случаи:**
  - Не участник чата не получает сообщение
  - При reconnect — повторное присоединение к комнатам чатов

### TC8: Загрузка изображений
- **Связанная задача:** T5.4
- **Шаги:**
  1. POST /api/upload с файлом image.jpg (multipart)
  2. Проверить: 200 + { url: "/uploads/..." }
  3. GET /uploads/... — файл доступен
- **Ожидаемый результат:** Файл загружен, URL возвращён
- **Граничные случаи:**
  - Файл > 10MB → 413
  - Не изображение (pdf) → 400
  - Без файла → 400

### TC9: Frontend — Регистрация/Логин
- **Связанная задача:** T7.1
- **Шаги:**
  1. Перейти на /register
  2. Заполнить форму, submit
  3. Проверить: редирект на /chats
  4. Logout
  5. Перейти на /login
  6. Ввести email + password
  7. Проверить: редирект на /chats

### TC10: Frontend — Чаты и сообщения
- **Связанная задача:** T7.3
- **Шаги:**
  1. Войти как A
  2. Открыть чат с B
  3. Ввести текст, отправить
- **Ожидаемый результат:** Сообщение появляется в чате
  4. Войти как B (другое окно)
- **Ожидаемый результат:** Сообщение от A видно в real-time
   5. A отправляет изображение
- **Ожидаемый результат:** Изображение отображается в чате у обоих

---

# Phase 2 QA Strategy

## Unit тесты (server)

| Категория | Кол-во тестов |
|-----------|--------------|
| Rate limiting middleware | 3 |
| Presence service (Redis mock) | 4 |
| Group chat service | 5 |
| Push subscription | 2 |
| Member check middleware | 3 |

## API E2E тесты (Phase 2)

### TC-P2.1: Rate limiting
1. POST /api/auth/login 6 раз с неверным паролем
2. 5 раз → 401, 6-й → 429
3. Подождать 15 минут (или сбросить rate limit для теста) → снова 401

### TC-P2.2: Online status
1. Подключить socket A → A.online = true
2. Подключить socket B → B получает presence:update { userId: A.id, status: 'online' }
3. Disconnect A → B получает presence:update { userId: A.id, status: 'offline' }
4. GET /api/users/A.id/online → { online: false }

### TC-P2.3: Group chat
1. POST /api/chats/group с 3 participantIds → 201, chat.isGroup = true
2. GET /api/chats → группа в списке, name = "Group Name"
3. POST /api/chats/:id/members { userId: 4й } → 200
4. DELETE /api/chats/:id/members/:userId → 200, участников стало на 1 меньше
5. DELETE /api/chats/:id/members/:creatorId → 400 (нельзя удалить создателя)

### TC-P2.4: Push notifications
1. POST /api/push/subscribe с валидным subscription → 201
2. POST /api/push/subscribe с невалидным → 400

### TC-P2.5: Member check
1. Пользователь A создаёт чат с B
2. Пользователь C (не участник) пытается GET /api/chats/AB/messages → 403
3. Пользователь C пытается POST /api/chats/AB/messages → 403

## Browser E2E (Phase 2)

| Шаг | Действие | Ожидаемый результат |
|-----|----------|---------------------|
| 1 | Открыть /login | Форма логина |
| 2 | Залогиниться A | Главная с чатами |
| 3 | Открыть чат, начать печатать | В окне B видно "A печатает..." |
| 4 | Создать группу (кнопка "Группа") | Модалка с выбором пользователей |
| 5 | Выбрать B и C, задать имя | Группа создана, видна всем трём |
| 6 | A отправляет сообщение в группу | B и C видят сообщение |
| 7 | Закрыть вкладку A | B видит A офлайн (нет зелёной точки) |
| 8 | Переключить тему | Тёмная/светлая тема работает |
| 9 | Проверить loading states | Скелетоны при загрузке списка/сообщений |
| 10 | Проверить error states | Отключить сервер → сообщение об ошибке |
