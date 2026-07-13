# Future Plan — Post-Release Features

## 1. Change Password UI
- **Client:** добавить форму «Сменить пароль» в ProfileEditor
- **API:** `POST /api/auth/change-password` (уже есть)
- После смены — logout + login заново (токен с новым tokenVersion)

## 2. Message Search UI
- **Client:** строка поиска + результаты в модалке/сайдбаре
- **API:** `GET /api/messages/search?q=...` (уже есть)
- Подсветка совпадений в результатах

## 3. Group Avatar UI
- Загрузка аватара группы через `PATCH /api/groups/:id/avatar`
- Показывать group avatar в ChatList + HomePage header
- Поле `chat.avatar_url` в БД уже есть, нужно:
  - Добавить `avatarUrl` в `Chat` и `ChatWithUsers` типы на сервере
  - Селектить `c.avatar_url` в SQL запросе Chat.ts
  - Добавить `avatarUrl` в `Chat` тип на клиенте
  - Рендерить `url={chat.avatarUrl}` для групп в ChatList и HomePage

## 4. E2E Tests
- **Playwright** или **Cypress**
- Сценарии: регистрация, логин, отправка сообщения, создание группы, загрузка аватара
- Запуск через Docker Compose + test container

## 5. Production Monitoring
- **Sentry** — ошибки фронта и бэка
- **Prometheus + Grafana** — метрики (RPS, latency, RAM/CPU)
- Health endpoint уже есть (`/api/health`)
- Алерты в Telegram/Slack

## 6. Admin Panel
- Просмотр пользователей, чатов, сообщений
- Модерация (удаление сообщений, блокировка)
- Базовая статистика

## 7. Verification — порядок деплоя
1. Выкатить текущую версию на сервер
2. Убедиться что всё работает (health, login, send message)
3. Добавлять фичи по одной, начиная с самых нужных
4. После каждой фичи — деплой на сервер
