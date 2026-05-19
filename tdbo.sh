#!/usr/bin/env bash
set -euo pipefail

case "${1:-}" in

  install)
    if [ ! -f .env ] && [ -f .env.example ]; then
        cp .env.example .env
    fi
    npm install --prefix ./backend
    npm create vite@latest ./frontend -- --template react-ts --no-interactive --no-immediate
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
    docker compose down -v
    sudo rm -rf backend/db
    ;;
  up)
    if docker compose ps --status=running --quiet | grep -q .; then
      echo "docker compose is already running."
      exit 0
    fi
    docker compose up --build --no-recreate
    ;;

  pgadmin)
    case "${2:-}" in
      up)
        NETWORK_NAME="tdbo-be-nw" 
        if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
          echo "Error: network '$NETWORK_NAME' not found. Did you run 'docker compose up' first?" >&2
          exit 1
        fi
        if docker ps -q -f "name=tdbo-pgadmin" | grep -q .; then
          echo "pgadmin container already running." >&2
          exit 0
        fi
        echo "Starting pgadmin4 on localhost:8080..."
        docker run \
          -d \
          --name tdbo-pgadmin \
          -p "8080:80" \
          --network "$NETWORK_NAME" \
          -e "PGADMIN_DEFAULT_EMAIL=admin@tdbo.com" \
          -e "PGADMIN_DEFAULT_PASSWORD=admin" \
          -e "PGADMIN_CONFIG_SERVER_MODE=False" \
          -e "PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED=False" \
          dpage/pgadmin4:latest
        sleep 5
        xdg-open "http://localhost:8080/" >/dev/null 2>&1 &
        echo "pgAdmin4 ready at http://localhost:8080"
        ;;

      down)
        if docker ps -q -f "name=tdbo-pgadmin" | grep -q .; then
          echo "Stopping pgadmin container..."
          docker stop tdbo-pgadmin
          docker rm tdbo-pgadmin >/dev/null
          echo "pgadmin stopped."
        else
          echo "pgadmin not running."
        fi
        ;;

      *)
        echo "Usage: $0 pgadmin {up|down}" >&2
        exit 1
        ;;
    esac
    ;;

  *)
    echo "Usage: $0 {install|rebuild|down|up|pgadmin {up|down}}" >&2
    exit 1
    ;;
esac