# Zokul: backlog задач по улучшению качества

## Эпик 1: Socket.IO security hardening

- [ ] 1.1. Добавить серверную проверку участия для `chat:join`
  - Файлы: `server/src/socket/index.ts`, `server/__tests__/socket.test.ts`
  - Что сделать: перед `socket.join("chat:<id>")` получить чат через `chatModel.findChatById(chatId)` и проверить, что `participantIds` содержит текущий `userId`.
  - Результат: неучастник не может присоединиться к комнате.
  - Тесты: добавить unit/integration-тест на отказ join для неучастника.

- [ ] 1.2. Добавить проверку участия для `message:typing`
  - Файлы: `server/src/socket/index.ts`, `server/__tests__/socket.test.ts`
  - Что сделать: перед рассылкой `typing:start` проверить, что пользователь участник чата.
  - Результат: typing-события нельзя отправить в чужой чат.
  - Тесты: покрыть успешный typing и отказ для неучастника.

- [ ] 1.3. Убрать доверие к client payload в `chat:created`
  - Файлы: `server/src/socket/index.ts`, `client/src/components/chat/CreateGroupModal.tsx`, `client/src/components/HomePage.tsx`
  - Что сделать: на сервере принимать только `chatId`, затем получить участников из БД через `findChatById`.
  - Результат: сервер сам определяет, какие сокеты надо добавить в комнату.
  - Тесты: проверить, что поддельный `participantIds` не используется.

- [ ] 1.4. Добавить обработчик `chat:leave` или убрать emit с клиента
  - Файлы: `server/src/socket/index.ts`, `client/src/components/HomePage.tsx`
  - Что сделать: сейчас клиент вызывает `socket.emit("chat:leave", ...)`, но серверный обработчик не найден. Нужно либо реализовать проверенный leave, либо удалить лишний emit.
  - Результат: клиент и сервер используют согласованный socket contract.
  - Тесты: если leave реализован, покрыть выход из комнаты.

## Эпик 2: Presence reliability

- [ ] 2.1. Исправить offline-логику при нескольких подключениях
  - Файлы: `server/src/socket/index.ts`, `server/__tests__/presenceService.test.ts`, `server/__tests__/socket.test.ts`
  - Что сделать: в `disconnect` удалять текущий socket id из `userSockets`; вызывать `presenceService.setOffline(userId)` только если после удаления у пользователя не осталось socket id.
  - Результат: закрытие одной вкладки не переводит пользователя offline, если другая вкладка активна.
  - Тесты: сценарий с двумя сокетами одного пользователя.

- [ ] 2.2. Защитить disconnect от необработанных ошибок
  - Файлы: `server/src/socket/index.ts`
  - Что сделать: обернуть `setOffline` в `try/catch`, логировать ошибку, не ронять обработчик.
  - Результат: временная ошибка Redis/БД не ломает socket lifecycle.
  - Тесты: мок `setOffline` с ошибкой.

## Эпик 3: Upload validation hardening

- [ ] 3.1. Разделить правила image/audio validation
  - Файлы: `server/src/middleware/uploadMiddleware.ts`
  - Что сделать: вместо проверки только расширения использовать whitelist MIME для изображений и аудио. Расширение можно оставить как дополнительный сигнал, но не как источник истины.
  - Результат: файл с неправильным MIME не принимается только из-за расширения.
  - Тесты: `.jpg` с `text/plain` должен отклоняться.

- [ ] 3.2. Удалять невалидные файлы после failed processing
  - Файлы: `server/src/middleware/processImage.ts`, `server/src/index.ts`
  - Что сделать: если `sharp` или validation отклоняет файл, временный файл должен удаляться.
  - Результат: upload-директория не засоряется мусором.
  - Тесты: проверить, что файл удаляется после invalid image.

- [ ] 3.3. Нормализовать upload errors
  - Файлы: `server/src/middleware/errorMiddleware.ts`, `server/__tests__/upload.test.ts`
  - Что сделать: ошибки validation должны возвращать 400, слишком большой файл 413, неожиданная ошибка 500.
  - Результат: API предсказуем для клиента.
  - Тесты: покрыть каждый код ответа.

## Эпик 4: Auth and password validation

- [ ] 4.1. Вынести единую функцию проверки пароля
  - Файлы: `server/src/services/authService.ts`
  - Что сделать: создать маленькую функцию `validatePassword(password)` или аналог в существующем стиле проекта.
  - Результат: регистрация и смена пароля используют одинаковые правила.
  - Тесты: короткий пароль отклоняется при регистрации и смене.

- [ ] 4.2. Возвращать корректный HTTP-код для validation errors
  - Файлы: `server/src/middleware/errorMiddleware.ts`, `server/src/controllers/authController.ts`
  - Что сделать: ошибки валидации пароля должны быть 400, а не 500.
  - Результат: frontend получает понятную ошибку.
  - Тесты: controller/service tests.

- [ ] 4.3. Проверить tokenVersion при регистрации
  - Файлы: `server/src/services/authService.ts`
  - Что сделать: убедиться, что токен после регистрации содержит актуальный `tokenVersion`, как при login.
  - Результат: поведение register/login согласовано.
  - Тесты: token payload содержит `tokenVersion`.

## Эпик 5: Test suite stabilization

- [ ] 5.1. Исправить падающий `authCookie.test.ts`
  - Файлы: `server/__tests__/authCookie.test.ts`
  - Что сделать: разобраться, почему `res.cookie` не вызывается в тесте login. Проверить порядок моков, env `JWT_SECRET`, require/import controller.
  - Результат: серверные тесты проходят полностью.
  - Тесты: `cd server && npm.cmd test`.

- [ ] 5.2. Убрать React `act(...)` warnings
  - Файлы: `client/__tests__/AuthContext.test.tsx`, возможно `client/src/contexts/AuthContext.tsx`
  - Что сделать: обновить тесты так, чтобы async state updates ожидались через `waitFor` или `act`.
  - Результат: клиентские тесты проходят без важных warnings.
  - Тесты: `cd client && npm.cmd test`.

- [ ] 5.3. Проверить, что build не меняет tracked files
  - Файлы: `client/vite.config.js`, `client/tsconfig*.tsbuildinfo`, `.gitignore`, `client/tsconfig*.json`
  - Что сделать: определить, должны ли `*.tsbuildinfo` и generated `vite.config.js` быть в git. Если нет, добавить правила игнорирования и удалить из индекса отдельным осознанным коммитом.
  - Результат: после `npm.cmd run build` `git status --short` не показывает неожиданные изменения.
  - Тесты: `git status --short` после build.

## Эпик 6: Migration governance

- [ ] 6.1. Задокументировать правила изменения схемы БД
  - Файлы: `docs/08_DATABASE_MIGRATION_POLICY.md`
  - Что сделать: описать, как добавлять новые поля, индексы и таблицы до внедрения полноценного migration framework.
  - Результат: будущие изменения схемы не делаются хаотично.
  - Тесты: не требуется, это документация.

- [ ] 6.2. Оценить migration framework отдельной задачей
  - Файлы: `server/package.json`, `server/src/config/db.ts`, новая папка migrations при принятии решения
  - Что сделать: не внедрять framework в этот же пакет, если это раздувает scope. Подготовить отдельный план.
  - Результат: migration framework не смешан с security-fix задачами.
  - Тесты: если внедряется, обязательны build, server tests и smoke migration на пустой БД.

## Definition of Done

- [ ] Все P0 и P1 задачи выполнены.
- [ ] `npm.cmd run build` проходит.
- [ ] `npm.cmd test` проходит.
- [ ] `git status --short` содержит только ожидаемые изменения.
- [ ] Добавлены или обновлены тесты для измененной логики.
- [ ] В итоговом отчете перечислены измененные файлы, команды проверки и результат.
- [ ] Работа зафиксирована commit'ом с понятным сообщением.
