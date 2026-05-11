#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/marketplace}"
DB_NAME="${DB_NAME:-marketplace}"
DB_USER="${DB_USER:-marketplace_readonly}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

pg_dump \
  --dbname="$DATABASE_URL" \
  --username="$DB_USER" \
  --no-owner \
  --no-acl \
  --format=plain \
  | gzip > "$FILENAME"

# Remove backups older than retention days
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete

echo "Backup saved: $FILENAME ($(du -h "$FILENAME" | cut -f1))"
