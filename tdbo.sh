#!/usr/bin/env bash
set -euo pipefail

case "${1:-}" in
  install)
    if [ ! -f .env ]; then
      if [ -z "${2:-}" ] || [ -z "${3:-}" ]; then
        echo -e "\nUsage example:\ntdbo install <DB_USER> <DB_PASS>"
        exit 1
      fi

      if [ -f .env.example ]; then
        DB_USER="$2"
        DB_PASS="$3"
        sed -e "s/^DB_USER=.*/DB_USER=${DB_USER}/" \
            -e "s/^DB_PASS=.*/DB_PASS=${DB_PASS}/" \
            .env.example > .env
      fi
    fi
    if [ -d backend/node_modules ]; then
      echo "backend/node_modules is already installed!"
      exit 1
    fi
    if [ ! -d frontend/node_modules ]; then
      npm create vite@latest ./frontend -- --template react-ts --no-interactive --no-immediate
    fi
    npm install --prefix ./backend
    npm install --prefix ./frontend
    docker compose up --build &
    sleep 3
    xdg-open "http://localhost:5173/" >/dev/null 2>&1 &
    ;;
  rebuild)
    docker compose down -v
    sudo rm -rf backend/db
    docker compose up --build
    ;;
  down)
    docker compose down
    ;;
  up)
    if docker compose ps --status=running --quiet | grep -q .; then
      echo "docker compose is already running."
      exit 0
    fi
    docker compose up
    ;;
  pgadmin)
    case "${2:-}" in
      up)
        if [ ! -f .env ] && [ -f .env.example ]; then
          cp .env.example .env
          echo ".env was not set, copying default data from .env.example"
        fi
        NETWORK_NAME="tdbo-be-nw"

        wait_for_healthy() {
          local container_name="$1"
          local timeout="${2:-120}"
          local elapsed=0
          local container_id
          local health

          container_id="$(docker ps -q -f "name=${container_name}")"
          if [ -z "$container_id" ]; then
            echo "Error: container '$container_name' not found." >&2
            return 1
          fi

          echo "Waiting for ${container_name} to become healthy... "

          while [ "$elapsed" -lt "$timeout" ]; do
            health="$(docker inspect -f '{{.State.Health.Status}}' "$container_id" 2>/dev/null || echo "starting")"
            if [ "$health" = "healthy" ]; then
              return 0
            fi
            sleep 2
            elapsed=$((elapsed + 2))
          done

          echo "Error: ${container_name} did not become healthy in time." >&2
          docker inspect --format='{{json .State.Health}}' "$container_id" 2>/dev/null || true
          return 1
        }

        if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
          echo "Error: network '$NETWORK_NAME' not found. Did you run 'docker compose up' first?" >&2
          exit 1
        fi
        if docker ps -q -f "name=tdbo-pgadmin" | grep -q .; then
          echo "pgadmin container already running." >&2
          exit 0
        fi
        ENV_FILE="./.env"
        if [ ! -f "$ENV_FILE" ]; then
          echo "Error: $ENV_FILE not found." >&2
          exit 1
        fi
        set -a
        . "$ENV_FILE"
        set +a

        TEMP_SERVERS="/tmp/pgadmin-servers.json"
        cat > "$TEMP_SERVERS" <<EOF
{
  "Servers": {
    "1": {
      "Name": "tdbo-db",
      "Group": "Servers",
      "Host": "tdbo-db",
      "Port": 5432,
      "MaintenanceDB": "postgres",
      "Username": "${DB_USER}",
      "PasswordExec": "echo '${DB_PASS}'",
      "SSLMode": "prefer"
    }
  }
}
EOF
        echo "Starting pgadmin4 on localhost:8080..."
        docker run \
          -d \
          --name tdbo-pgadmin \
          -p "8080:80" \
          --network "$NETWORK_NAME" \
          -v "$TEMP_SERVERS:/pgadmin4/servers.json:ro" \
          -e "PGADMIN_DEFAULT_EMAIL=admin@tdbo.com" \
          -e "PGADMIN_DEFAULT_PASSWORD=admin" \
          -e "PGADMIN_CONFIG_SERVER_MODE=False" \
          -e "PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED=False" \
          --health-cmd='wget -qO- http://localhost:80/misc/ping >/dev/null || exit 1' \
          --health-interval=5s \
          --health-timeout=3s \
          --health-retries=30 \
          --health-start-period=20s \
          dpage/pgadmin4:latest

        if wait_for_healthy tdbo-pgadmin 180; then
          xdg-open "http://localhost:8080/" >/dev/null 2>&1 &
          echo "pgAdmin4 ready at http://localhost:8080"
        else
          rm -f "$TEMP_SERVERS"
          exit 1
        fi

        rm -f "$TEMP_SERVERS"
        ;;
      down)
        if docker ps -q -f "name=tdbo-pgadmin" | grep -q .; then
          echo "Stopping pgadmin container..."
          docker stop tdbo-pgadmin
          docker rm tdbo-pgadmin >/dev/null
          echo "pgadmin stopped."
        else
          echo "pgadmin is not running."
        fi
        ;;

      *)
        echo -e "\nUsage example: \ntdbo pgadmin { up | down }" >&2
        exit 1
        ;;
    esac
    ;;

  *)
    echo -e "\nUsage example: \ntdbo { install <DB_USER> <DB_PASS> | rebuild | up | down | pgadmin { up | down } }" >&2
    exit 1
    ;;
esac