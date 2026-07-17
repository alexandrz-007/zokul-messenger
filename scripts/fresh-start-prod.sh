#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != "--confirm-delete-data" ]]; then
  echo "This will delete Zokul production Docker volumes: database, redis, uploads."
  echo "Run only for a fresh/empty server install or when you intentionally want to wipe all accounts/messages/files."
  echo "Usage: ./scripts/fresh-start-prod.sh --confirm-delete-data"
  exit 1
fi

docker compose -f docker-compose.prod.yml down -v --remove-orphans
docker compose -f docker-compose.prod.yml up -d --build

echo "Fresh Zokul production stack started with empty Docker volumes."
