# Zokul: инструкция для ИИ-агента по внедрению улучшений

## Роль агента

Ты ИИ-агент-разработчик, который внедряет технические улучшения в существующий проект Zokul. Твоя задача - повысить безопасность, надежность и качество тестов без добавления новых пользовательских функций.

## Важные ограничения

- Не добавляй новые продуктовые функции.
- Не меняй UX без необходимости.
- Не трогай ветку `production`.
- Работай от актуального `master` или создай feature-ветку от `master`.
- Не удаляй существующую документацию и отчеты.
- Не коммить `.env`, `uploads`, `dist`, `node_modules`.
- Не оставляй проект в состоянии, где build или tests падают.

## Перед началом работы

Выполни команды:

```powershell
git status --short --branch
git branch --all --verbose
git remote -v
```

Убедись:

- текущая ветка основана на `master`;
- рабочая директория понятна;
- если есть чужие изменения, не перетирай их.

Если нужно создать ветку:

```powershell
git checkout master
git pull origin master
git checkout -b codex/zokul-quality-hardening
```

Если `git pull` или `git push` требуют доступ к сети/правам, запроси разрешение у пользователя.

## Рекомендуемый порядок внедрения

### Шаг 1: стабилизировать тестовый контур

Цель:

- понять текущие failures;
- исправить `server/__tests__/authCookie.test.ts`;
- убрать или минимизировать React `act(...)` warnings.

Команды:

```powershell
npm.cmd test
cd server
npm.cmd test
cd ..\client
npm.cmd test
cd ..
```

Ожидаемый результат:

- тесты проходят или есть точное понимание, какой тест сломан и почему.

### Шаг 2: исправить Socket.IO access control

Файл:

```text
server/src/socket/index.ts
```

Что внедрить:

- helper-функцию для проверки участия в чате, например `getParticipantChat(chatId, userId)`;
- проверку в `chat:join`;
- проверку в `message:typing`;
- проверку/переработку `chat:created`, чтобы участники брались из БД;
- опционально обработчик `chat:leave`, если клиент продолжает его вызывать.

Правило:

Любое socket-событие, принимающее `chatId` от клиента, должно проверять, что текущий пользователь является участником этого чата.

Минимальные тесты:

- participant может join;
- non-participant не может join;
- participant может typing;
- non-participant не может typing;
- `chat:created` не доверяет поддельному `participantIds`.

### Шаг 3: исправить presence для нескольких вкладок

Файл:

```text
server/src/socket/index.ts
```

Что внедрить:

- в `disconnect` сначала удалить `socket.id`;
- если после удаления у пользователя еще есть socket id, не вызывать `setOffline`;
- `presence:update offline` отправлять только после последнего отключения;
- обернуть async presence calls в `try/catch`.

Минимальные тесты:

- два подключения одного пользователя;
- отключение первого не вызывает offline;
- отключение второго вызывает offline.

### Шаг 4: усилить upload validation

Файлы:

```text
server/src/middleware/uploadMiddleware.ts
server/src/middleware/processImage.ts
server/src/middleware/errorMiddleware.ts
server/__tests__/upload.test.ts
server/__tests__/processImage.test.ts
```

Что внедрить:

- whitelist MIME для изображений и аудио;
- не принимать файл только из-за расширения;
- удалять временный файл при invalid image;
- нормализовать ошибки upload.

Минимальные тесты:

- valid image accepted;
- invalid image rejected and removed;
- wrong MIME rejected;
- oversized file returns 413;
- unsupported file returns 400.

### Шаг 5: унифицировать password validation

Файлы:

```text
server/src/services/authService.ts
server/src/middleware/errorMiddleware.ts
server/__tests__/authService.test.ts
```

Что внедрить:

- общую функцию валидации пароля;
- использовать ее в `register` и `changePassword`;
- возвращать validation errors как 400;
- проверить `tokenVersion` в token после register.

Минимальные тесты:

- register rejects short password;
- changePassword rejects short password;
- register token contains expected token version.

### Шаг 6: проверить build artifacts

Проверь:

```powershell
npm.cmd run build
git status --short
```

Если сборка меняет tracked files:

- выясни, являются ли эти файлы generated artifacts;
- если да, предложи удалить их из git index и добавить в `.gitignore`;
- не делай это вместе с security-изменениями, если изменение раздувает scope.

## Обязательные команды перед финалом

В корне проекта:

```powershell
npm.cmd run build
npm.cmd test
git status --short
```

Если нужно проверить отдельно:

```powershell
cd client
npm.cmd test
npm.cmd run build
cd ..\server
npm.cmd test
npm.cmd run build
cd ..
```

## Правила коммита

Перед commit:

```powershell
git diff --stat
git diff --check
git status --short
```

Stage только релевантные файлы:

```powershell
git add server/src/socket/index.ts
git add server/src/middleware/uploadMiddleware.ts
git add server/src/middleware/processImage.ts
git add server/src/middleware/errorMiddleware.ts
git add server/src/services/authService.ts
git add server/__tests__
git add client/__tests__
git add docs
```

Пример commit message:

```text
fix: harden socket auth, presence, uploads, and tests
```

После commit:

```powershell
git status --short --branch
git log --oneline -1
```

Если пользователь просит отправить на GitHub:

```powershell
git push origin <branch-name>
```

Не push в `production`, если пользователь явно не попросил.

## Формат итогового отчета агента

В финальном сообщении укажи:

- какие проблемы исправлены;
- какие файлы изменены;
- какие тесты добавлены/обновлены;
- результаты команд `npm.cmd run build` и `npm.cmd test`;
- имя commit'а и hash;
- остались ли риски или TODO.

Пример:

```markdown
Готово. Усилил Socket.IO проверки, исправил presence для нескольких вкладок, ужесточил upload validation и стабилизировал тесты.

Проверка:
- npm.cmd run build: passed
- npm.cmd test: passed

Commit: abc1234 fix: harden socket auth, presence, uploads, and tests
```
