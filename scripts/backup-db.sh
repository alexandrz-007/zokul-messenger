#!/bin/bash
# Zokul PostgreSQL backup script
# Usage: ./scripts/backup-db.sh [output-dir]
# Default output dir: ./backups/

set -e

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="zokul_backup_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

# Uses same DATABASE_URL as docker-compose
DB_URL="${DATABASE_URL:-postgresql://zokul:zokul@localhost:5433/zokul}"

echo "Backing up to ${BACKUP_DIR}/${FILENAME} ..."
pg_dump "$DB_URL" > "${BACKUP_DIR}/${FILENAME}"

echo "Done: ${BACKUP_DIR}/${FILENAME}"
