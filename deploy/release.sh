#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
exec 9>.deploy.lock
flock -n 9 || { echo "Another release is running."; exit 1; }
test -f .env.production || { echo "Create .env.production first."; exit 1; }
export RELEASE_TAG="$(git rev-parse --short=12 HEAD)"
compose=(docker compose --env-file .env.production -f compose.production.yaml)
"${compose[@]}" config --quiet
"${compose[@]}" build web
"${compose[@]}" up -d --wait db
mkdir -p backups
chmod 700 backups
# Save a database backup before changing its schema. Copy these off the server
# using a separate private backup bucket and the schedule described in the guide.
backup_file="backups/pre-release-$(date -u +%Y%m%dT%H%M%SZ).dump"
(umask 077; "${compose[@]}" exec -T db pg_dump -U website -d website -Fc > "$backup_file")
"${compose[@]}" run --rm web python manage.py check --deploy --fail-level WARNING
"${compose[@]}" run --rm web python manage.py migrate --noinput
"${compose[@]}" up -d --wait --wait-timeout 180 web
"${compose[@]}" up -d caddy
echo "Released ${RELEASE_TAG}. Backup: ${backup_file}"
echo "Verify HTTPS and /health/ after the domain resolves. Run bootstrap_site only on first setup."
