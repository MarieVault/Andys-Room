#!/bin/bash
# Andy Dashboard — Deploy Script
# Run from anywhere: ~/nanoclaw/groups/telegram_main/webapp/deploy.sh

set -e

WEBAPP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$WEBAPP_DIR/frontend"
DIST_DIR="$WEBAPP_DIR/dist"
WWW_DIR="/var/www/andy"

echo "🔨 Building frontend..."
cd "$FRONTEND_DIR"
npm run build

echo "🚀 Deploying to $WWW_DIR..."
mkdir -p "$WWW_DIR"
cp -r "$DIST_DIR"/. "$WWW_DIR/"
chmod -R 755 "$WWW_DIR"

echo "✅ Done! http://144.172.107.108:8080"
