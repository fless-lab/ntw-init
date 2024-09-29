#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ENV_FILE="$PROJECT_ROOT/.env"

ENV_EXAMPLE_FILE="$PROJECT_ROOT/.env.example"

echo "🔄 Checking for .env file..."

if [ -f "$ENV_FILE" ]; then
    echo "⚠️  .env file already exists. It will be replaced with .env.example."
else
    echo "✅ .env file does not exist. It will be created from .env.example."
fi

if [ -f "$ENV_EXAMPLE_FILE" ]; then
    cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"
    echo "✅ .env file created/replaced from .env.example."
else
    echo "❌ .env.example file not found. Cannot create .env file."
    exit 1
fi

echo "🔄 Installing npm dependencies..."
npm install
echo "✅ npm dependencies installed."
