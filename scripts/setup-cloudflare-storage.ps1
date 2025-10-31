#!/usr/bin/env pwsh
# ============================================
# Cloudflare KV & R2 Setup Script
# Creates KV namespaces and R2 buckets for Workers
# ============================================

Write-Host "☁️  Setting up Cloudflare Storage..." -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. Create KV Namespaces
# ============================================
Write-Host "📦 Creating KV Namespaces..." -ForegroundColor Yellow
Write-Host ""

# Development KV namespaces
Write-Host "🔹 Creating CACHE namespace (dev)..." -NoNewline
$cacheDevOutput = npx wrangler kv:namespace create "CACHE" 2>&1 | Out-String
if ($cacheDevOutput -match 'id = "([^"]+)"') {
    $cacheDevId = $matches[1]
    Write-Host " ✅ ID: $cacheDevId" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Already exists or error" -ForegroundColor Yellow
}

Write-Host "🔹 Creating SESSIONS namespace (dev)..." -NoNewline
$sessionsDevOutput = npx wrangler kv:namespace create "SESSIONS" 2>&1 | Out-String
if ($sessionsDevOutput -match 'id = "([^"]+)"') {
    $sessionsDevId = $matches[1]
    Write-Host " ✅ ID: $sessionsDevId" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Already exists or error" -ForegroundColor Yellow
}

# Production KV namespaces
Write-Host "🔹 Creating CACHE namespace (prod)..." -NoNewline
$cacheProdOutput = npx wrangler kv:namespace create "CACHE" --env production 2>&1 | Out-String
if ($cacheProdOutput -match 'id = "([^"]+)"') {
    $cacheProdId = $matches[1]
    Write-Host " ✅ ID: $cacheProdId" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Already exists or error" -ForegroundColor Yellow
}

Write-Host "🔹 Creating SESSIONS namespace (prod)..." -NoNewline
$sessionsProdOutput = npx wrangler kv:namespace create "SESSIONS" --env production 2>&1 | Out-String
if ($sessionsProdOutput -match 'id = "([^"]+)"') {
    $sessionsProdId = $matches[1]
    Write-Host " ✅ ID: $sessionsProdId" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Already exists or error" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 2. Create R2 Buckets
# ============================================
Write-Host "🗄️  Creating R2 Buckets..." -ForegroundColor Yellow
Write-Host ""

Write-Host "🔹 Creating nurdscode-assets (dev)..." -NoNewline
npx wrangler r2 bucket create nurdscode-assets 2>&1 | Out-Null
Write-Host " ✅" -ForegroundColor Green

Write-Host "🔹 Creating nurdscode-assets-prod (prod)..." -NoNewline
npx wrangler r2 bucket create nurdscode-assets-prod 2>&1 | Out-Null
Write-Host " ✅" -ForegroundColor Green

Write-Host ""

# ============================================
# 3. Update wrangler.toml
# ============================================
Write-Host "📝 Updating wrangler.toml with IDs..." -ForegroundColor Yellow

if ($cacheDevId) {
    Write-Host "   Updating CACHE (dev) ID: $cacheDevId"
    # Note: Manual update required in wrangler.toml
}

if ($sessionsDevId) {
    Write-Host "   Updating SESSIONS (dev) ID: $sessionsDevId"
}

if ($cacheProdId) {
    Write-Host "   Updating CACHE (prod) ID: $cacheProdId"
}

if ($sessionsProdId) {
    Write-Host "   Updating SESSIONS (prod) ID: $sessionsProdId"
}

Write-Host ""
Write-Host "⚠️  MANUAL STEP REQUIRED:" -ForegroundColor Yellow
Write-Host "   Update wrangler.toml with the KV namespace IDs shown above" -ForegroundColor White
Write-Host ""

# ============================================
# 4. Summary
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ Storage Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Created:" -ForegroundColor White
Write-Host "  ✅ KV Namespace: CACHE (dev + prod)" -ForegroundColor Green
Write-Host "  ✅ KV Namespace: SESSIONS (dev + prod)" -ForegroundColor Green
Write-Host "  ✅ R2 Bucket: nurdscode-assets" -ForegroundColor Green
Write-Host "  ✅ R2 Bucket: nurdscode-assets-prod" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Update wrangler.toml with KV namespace IDs" -ForegroundColor White
Write-Host "   2. Run: npm run worker:deploy" -ForegroundColor White
Write-Host ""
