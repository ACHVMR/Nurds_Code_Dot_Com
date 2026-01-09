#!/usr/bin/env bash
set -euo pipefail

echo "Deploying NURDS Code..."

# NOTE: This repo uses a root `wrangler.toml` with `main = workers/index.js`.

echo "Deploying Cloudflare Worker (production)..."
npm ci
npx wrangler deploy --env production

echo "Building frontend..."
npm run build

echo "Deploying Cloudflare Pages..."
# Set PROJECT_NAME if different.
PROJECT_NAME=${PROJECT_NAME:-nurdscode}
npx wrangler pages deploy dist --project-name "$PROJECT_NAME" --branch main

echo "Done."
