# Deploy Guide — Zokul Production

## 1. Commit changes (в D:\zokul\)

```powershell
git add -A
git commit -m "ZOKUL-XXX - краткое описание"
```

## 2. Проверить локальный билд

```powershell
docker compose -f docker-compose.prod.yml build
# Если ошибки — фиксить до деплоя
```

## 3. Подготовить release-пакет

```powershell
.\scripts\prepare-release.ps1
# Копирует чистый код в D:\zokul-deploy\, сохраняя ssl/ и .env
```

## 4. Залить на GitHub (production ветка)

```powershell
cd D:\zokul-deploy
git add -A
git commit -m "ZOKUL-XXX production"
git remote add origin https://github.com/alexandrz-007/zokul.git  # если ещё не добавлен
git push origin master:production --force
```

## 5. Развернуть на сервере

```bash
ssh root@zokul.zhichkin.space
cd ~/zokul
git fetch origin
git reset --hard origin/production
docker compose -f docker-compose.prod.yml up -d --build
```

## Быстрая проверка после деплоя

```bash
curl -k https://zokul.zhichkin.space/api/health
curl -k -i https://zokul.zhichkin.space/api/auth/me  # ожидается 401 (не 429)
```
