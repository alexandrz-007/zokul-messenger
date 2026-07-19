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

## Проверка Service Worker / PWA после деплоя

Открыть https://zokul.zhichkin.space в обычной вкладке (без `?v=...`):
- Сайт должен загрузиться и работать
- DevTools → Application → Service Workers → статус `activated and is running` (или `deactivated` после unregister)

На iPhone/Safari:
- Открыть https://zokul.zhichkin.space — должно работать без `?v=clean3`
- Закрыть Safari, открыть снова — должно работать
- Если сбросить кэш: Safari → Settings → Safari → Advanced → Website Data → Remove All

**Если сайт не грузится:** открыть `https://zokul.zhichkin.space/login?v=clean` — bypass SW.

## Cloudflare Tunnel — основной вход без VPN (ZOKUL-NET-001)

Провайдер блокирует прямой TLS до публичного IP сервера (`151.243.169.150:443`), поэтому без VPN сайт недоступен. Cloudflare Tunnel делает сайт доступным без VPN: трафик идёт до Cloudflare, а не до публичного IP.

### Шаг А. Создать туннель в Cloudflare (через UI)

1. Зайти в **Cloudflare Zero Trust** → **Networks** → **Tunnels** → **Create a tunnel**.
2. Назвать `zokul`.
3. В шаге установки выбрать **Docker** и скопировать **tunnel token** (строка вида `eyJ...`).
4. Добавить **Public Hostname**:
   - Subdomain: `zokul`, Domain: `zhichkin.space`
   - Type: `HTTPS`, URL: `https://localhost:443`
   - (Cloudflare сам пропишет DNS CNAME `zokul.zhichkin.space → <tunnel-id>.cfargotunnel.com`)
5. Сохранить.

> Если Cloudflare ругается на сертификат локального nginx, в config туннеля добавить `originRequest: noTLSVerify: true` (безопасно — это только локальный хоп до localhost:443, где certbot-сертификат валиден).

### Шаг Б. Запустить туннель на сервере

Токен хранится в `~/zokul/.env` (уже в preserve, не коммитится):

```bash
ssh root@<server>
cd ~/zokul
echo "CF_TUNNEL_TOKEN=<token из шага А>" >> .env
docker compose -f docker-compose.prod.yml up -d tunnel
```

Проверка: `docker logs $(docker compose -f docker-compose.prod.yml ps -q tunnel)` → `Registered tunnel connection`.

### Шаг В. Проверка без VPN

На клиенте **без VPN**:

```powershell
curl.exe -s -o /dev/null -w "%{http_code}" https://zokul.zhichkin.space
# ожидается: 200
```

И в браузере без VPN: `https://zokul.zhichkin.space` загружается, логин/регистрация работают.

Прямой `443` остаётся как fallback (работает с VPN). Закрывать его не нужно.
