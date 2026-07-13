#!/bin/bash
# Zokul PostgreSQL restore script
# Usage: ./scripts/restore-db.sh <backup-file>
# Example: ./scripts/restore-db.sh backups/zokul_backup_20240713_120000.sql

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup-file>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: file not found: $BACKUP_FILE"
  exit 1
fi

DB_URL="${DATABASE_URL:-postgresql://zokul:zokul@localhost:5433/zokul}"

echo "Restoring from ${BACKUP_FILE} ..."
echo "WARNING: This will overwrite the current database!"
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

psql "$DB_URL" < "$BACKUP_FILE"

echo "Restore complete."
