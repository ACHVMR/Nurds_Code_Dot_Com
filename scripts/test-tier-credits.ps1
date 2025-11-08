#!/usr/bin/env pwsh
# Test /api/tier-credits endpoint verification

Write-Host "`n🧪 TIER CREDITS ENDPOINT VERIFICATION" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Check if dev server is running
Write-Host "`n📡 Checking dev server status..." -ForegroundColor Yellow

$devServerUrl = "http://localhost:5173"
try {
    $response = Invoke-WebRequest -Uri $devServerUrl -Method GET -TimeoutSec 2 -UseBasicParsing
    Write-Host "  ✅ Dev server is running at $devServerUrl" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Dev server is NOT running" -ForegroundColor Red
    Write-Host "     Run: npm run dev" -ForegroundColor Yellow
    Write-Host "`n"
    exit 1
}

Write-Host "`n"

# Check worker API status
Write-Host "🔧 Checking Cloudflare Worker API..." -ForegroundColor Yellow
$workerUrl = "http://localhost:8787"

try {
    $response = Invoke-WebRequest -Uri "$workerUrl/api/auth/me" -Method GET -TimeoutSec 2 -UseBasicParsing
    Write-Host "  ✅ Worker API is running at $workerUrl" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Worker API is NOT running (optional for local dev)" -ForegroundColor Yellow
    Write-Host "     Run: npm run worker:dev (in separate terminal)" -ForegroundColor Gray
}

Write-Host "`n"

# Test instructions
Write-Host "🧪 Manual Testing Instructions:" -ForegroundColor Cyan
Write-Host "`n1. Open browser to: $devServerUrl" -ForegroundColor White
Write-Host "`n2. Sign in with Clerk" -ForegroundColor White
Write-Host "`n3. Open browser DevTools (F12)" -ForegroundColor White
Write-Host "`n4. Check Network tab for:" -ForegroundColor White
Write-Host "   - /api/tier-credits (should return user balance)" -ForegroundColor Gray
Write-Host "   - /api/insights?userId=... (should return insights)" -ForegroundColor Gray
Write-Host "`n5. Visual checks:" -ForegroundColor White
Write-Host "   - Top-right header shows token balance pill" -ForegroundColor Gray
Write-Host "   - 'Push to Talk' mic button visible" -ForegroundColor Gray
Write-Host "   - Daily Insights page loads without errors" -ForegroundColor Gray
Write-Host "   - Voice recorder modal opens when clicking mic" -ForegroundColor Gray

Write-Host "`n"
Write-Host "📊 Expected TokenBalance Component:" -ForegroundColor Cyan
Write-Host "   Format: 'Tier | $X.XX'" -ForegroundColor Gray
Write-Host "   Example: 'Free | $0.00'" -ForegroundColor Gray
Write-Host "   Location: Top-right navbar" -ForegroundColor Gray

Write-Host "`n"
Write-Host "🔍 Expected API Response (/api/tier-credits):" -ForegroundColor Cyan
Write-Host @"
   {
     "tier": "free",
     "balanceCents": 0,
     "totalSpentCents": 0,
     "usageCents": 0
   }
"@ -ForegroundColor Gray

Write-Host "`n"
Write-Host "📝 Troubleshooting:" -ForegroundColor Yellow
Write-Host "   - If 401 Unauthorized: Check Clerk session" -ForegroundColor White
Write-Host "   - If 500 Error: Check Supabase connection" -ForegroundColor White
Write-Host "   - If empty balance: Seed test data in Supabase" -ForegroundColor White
Write-Host "   - If no tier: User not in tier_credits table" -ForegroundColor White

Write-Host "`n"
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "✅ Ready to test!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "`n"
