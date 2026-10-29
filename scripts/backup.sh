#!/bin/sh
# ==============================================================================
# Database Automated Backup Script for PostgreSQL Container
# ==============================================================================
set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="${CONTAINER_NAME:-electricity_db}"
DB_NAME="${DB_NAME:-electricity_db}"
DB_USER="${DB_USER:-postgres}"

echo "[INFO] Starting database backup for $DB_NAME from container $CONTAINER_NAME..."
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/backup_${DATE}.sql.gz"

echo "[SUCCESS] Backup created: $BACKUP_DIR/backup_${DATE}.sql.gz"

# Retention: Remove backup files older than 30 days
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
echo "[INFO] Retention cleanup complete (30-day policy)."
