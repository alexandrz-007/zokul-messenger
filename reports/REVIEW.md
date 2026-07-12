# Phase 1 Review — Tech Debt & Recommendations

**Дата:** 2026-07-12  
**Оценка качества:** (10/10 функциональность + 9/10 код + 8/10 UI/UX + 8/10 безопасность + 10/10 E2E) / 5 = **9.0/10**

---

## 🔴 Критично (исправить до Phase 2)

1. **Нет HTTPS** — PWA требует HTTPS для Service Worker и Push-уведомлений
2. **JWT секрет в коде** — `dev-secret-change-in-production` в config/app.ts
3. **Uploads папка без ограничений** — нет очистки старых файлов, нет антивирусной проверки

## 🟡 Важно (Phase 2)

1. **Typing indicator** — socket эмит есть (`message:typing`), UI нет (нет индикатора "печатает..." в ChatView)
2. **Чат без последнего сообщения** — ChatList показывает только имя/email, нет preview последнего сообщения
3. **Нет пагинации на клиенте** — сообщения грузятся все сразу (limit 50, нет кнопки "Load more")
4. **Отсутствует `check-participant` middleware** — можно отправить сообщение в чат, где пользователь не участник (socket проверяет, REST — нет)
5. **Нет rate limiting** — на auth endpoints (brute force)

## 🟢 Улучшения (когда будет время)

1. **Тёмная тема** — Tailwind dark классы есть, но нет переключателя
2. **Toast-уведомления** — нет компонента для всплывающих уведомлений
3. **Анимации** — сообщения появляются без анимации
4. **Звук уведомления** — нет звука при новом сообщении
5. **autoScroll вниз** — есть, но не учитывает загрузку старых сообщений (scroll upwards)
6. **MessageInput не сохраняет draft** — при переключении чата текст теряется

---

## Рекомендации на Phase 2

1. **Push-уведомления** — использовать Web Push API + VAPID, PWA уже настроен
2. **Online статус** — Redis pub/sub + Socket.IO presence, индикатор в ChatList
3. **Групповые чаты** — расширить модель Chat (name, avatarUrl, isGroup), создать эндпоинты addMember/removeMember
4. **Middleware проверки членства в чате** — вынести в отдельный middleware, использовать во всех chat/message endpoints
