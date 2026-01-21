#!/bin/bash
# Cloudflare-Only Backend Deployment Script
# Run this from the project root directory

set -e

echo "🚀 NURDS CODE - Cloudflare Deployment"
echo "======================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check authentication
echo "📋 Step 1: Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  Not logged in to Cloudflare"
    echo "Please run: wrangler login"
    echo ""
    echo "Opening login flow..."
    wrangler login
fi

echo "✅ Authenticated with Cloudflare"
echo ""

# Verify database configuration
echo "📋 Step 2: Verifying D1 database..."
if wrangler d1 info nurds-core-db &> /dev/null; then
    echo "✅ Database 'nurds-core-db' found"
else
    echo "⚠️  Database not found. You may need to:"
    echo "   1. Create it: wrangler d1 create nurds-core-db"
    echo "   2. Update the database_id in wrangler.toml"
    exit 1
fi
echo ""

# Run migrations
echo "📋 Step 3: Running database migrations..."
echo "   → Applying 0000_init.sql..."
wrangler d1 execute nurds-core-db --file=workers/migrations/0000_init.sql --remote

echo "   → Applying 0008_orchestrator_v2.sql..."
wrangler d1 execute nurds-core-db --file=workers/migrations/0008_orchestrator_v2.sql --remote

echo "✅ Migrations applied successfully"
echo ""

# Verify tables
echo "📋 Step 4: Verifying database tables..."
wrangler d1 execute nurds-core-db --command="SELECT name FROM sqlite_master WHERE type='table'" --remote
echo ""

# Deploy worker
echo "📋 Step 5: Deploying Cloudflare Worker..."
wrangler deploy

echo ""
echo "════════════════════════════════════════"
echo "✅ Deployment Complete!"
echo "════════════════════════════════════════"
echo ""
echo "Your API is now live at:"
echo "https://nurds-platform-api.<your-subdomain>.workers.dev"
echo ""
echo "📋 Next Steps:"
echo "   1. Test your API: curl https://your-worker-url/api/status"
echo "   2. Update frontend/lib/config.dart with your Worker URL"
echo "   3. Rebuild and deploy your Flutter frontend"
echo ""
echo "📊 Monitor your deployment:"
echo "   • Live logs: wrangler tail"
echo "   • Dashboard: https://dash.cloudflare.com"
echo ""
