#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
if [ -z "${RELEASE_TAG:-}" ]; then
    if [ -f .release-tag ]; then
        RELEASE_TAG="$(cat .release-tag)"
    else
        RELEASE_TAG="$(git rev-parse --short=12 HEAD)"
    fi
fi
export RELEASE_TAG
exec docker compose --env-file .env.production -f compose.production.yaml "$@"
