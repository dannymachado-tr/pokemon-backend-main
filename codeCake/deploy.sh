#!/bin/sh
set -eu
REPO_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$REPO_ROOT"
command -v docker >/dev/null 2>&1 || { echo "Docker is required for Deploy" >&2; exit 1; }
docker compose version >/dev/null
export POKEMON_NETWORK="${POKEMON_NETWORK:-pokemon-codecake}"
# Shared network only; each repository owns its own Compose service/project.
if ! docker network inspect "$POKEMON_NETWORK" >/dev/null 2>&1; then
  docker network create "$POKEMON_NETWORK" >/dev/null || docker network inspect "$POKEMON_NETWORK" >/dev/null
fi
exec docker compose -p "${COMPOSE_PROJECT_NAME:-pokemon-backend-codecake}" -f "$REPO_ROOT/codeCake/docker-compose.yml" up -d --build --wait --wait-timeout "${DEPLOY_WAIT_SECONDS:-120}" main_app_pokemon-backend
