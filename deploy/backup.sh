#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
exec 9>.deploy.lock
flock -n 9 || { echo "A release or backup is already running."; exit 1; }
umask 077
mkdir -p backups
chmod 700 backups
name="website-$(date -u +%Y%m%dT%H%M%SZ).dump"
bash deploy/compose.sh exec -T db pg_dump -U website -d website -Fc > "backups/$name"
# Run with the caller's UID so the private dump remains unreadable to other users.
bash deploy/compose.sh run --rm --no-deps -T --user "$(id -u):$(id -g)" \
    -v "$PWD/backups:/backups:ro" web python -c \
    'import os,sys,boto3; name=sys.argv[1]; boto3.client("s3").upload_file("/backups/"+name,os.environ["BACKUP_BUCKET_NAME"],"database/"+name); print("Uploaded database/"+name)' "$name"
