#!/bin/bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <domain> [email]"
  exit 1
fi

DOMAIN="$1"
EMAIL="${2:-admin@$DOMAIN}"
SSL_DIR="$(cd "$(dirname "$0")/.." && pwd)/ssl"

mkdir -p "$SSL_DIR"

echo "=== Initializing SSL for $DOMAIN ==="

sudo certbot certonly --webroot -w /var/www/html -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL"

sudo cp -L "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/"
sudo cp -L "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/"
sudo chmod 644 "$SSL_DIR/fullchain.pem"
sudo chmod 600 "$SSL_DIR/privkey.pem"

echo "=== SSL certificates installed in $SSL_DIR ==="

CRON_JOB="0 3 * * * sudo certbot renew --quiet && sudo cp -L /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/ && sudo cp -L /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/ && cd $(dirname '$SSL_DIR') && docker compose -f docker-compose.prod.yml exec -T client nginx -s reload"

(crontab -l 2>/dev/null | grep -v certbot; echo "$CRON_JOB") | crontab -

echo "=== Auto-renew cron job installed ==="
echo "=== Done! Run 'docker-compose -f docker-compose.prod.yml up -d' ==="
