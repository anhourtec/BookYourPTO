#!/usr/bin/env bash

set -e

PROJECT_NAME="bookyourpto"

echo "========================================"
echo "  BookYourPTO CLEAN BUILD & DEPLOY"
echo "========================================"

echo ""
echo "▶ Step 1: Stopping existing containers for this project..."
docker compose -p $PROJECT_NAME down

echo ""
echo "▶ Step 2: Removing old images for THIS project only..."
docker images --format "{{.Repository}} {{.ID}}" \
  | grep "$PROJECT_NAME" \
  | awk '{print $2}' \
  | xargs -r docker rmi -f

echo ""
echo "▶ Step 3: Building images from scratch (NO CACHE)..."
docker compose -p $PROJECT_NAME build --no-cache

echo ""
echo "▶ Step 4: Starting services..."
docker compose -p $PROJECT_NAME up -d

echo ""
echo "Deployment complete!"
echo "➡ App running at http://localhost:3000"
