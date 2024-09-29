#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ENVIRONMENT="development"

if [ "$1" == "--prod" ]; then
  ENVIRONMENT="production"
fi

echo "🔄 Checking for Docker installation..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker could not be found. Please install Docker and try again."
    exit 1
fi

echo "✅ Docker is installed."

echo "🔄 Checking for Docker Compose installation..."

if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
    echo "✅ Docker Compose (standalone) is installed."
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
    echo "✅ Docker Compose (plugin) is installed."
else
    echo "❌ Docker Compose could not be found. Please install Docker Compose and try again."
    exit 1
fi

echo "🔄 Running install.sh..."
bash "$PROJECT_ROOT/bin/install.sh"

echo "NODE_ENV=$ENVIRONMENT" >> "$PROJECT_ROOT/.env"
echo ""
echo "🔄 NODE_ENV set to $ENVIRONMENT in .env file."

echo "🔄 Starting Docker containers in $ENVIRONMENT mode..."
$DOCKER_COMPOSE_CMD up --build
echo "✅ Docker containers started."