#!/usr/bin/env pwsh
# Clerk SDK Verification Script
# Verifies that all Clerk SDK versions are pinned correctly

Write-Host "`n🔍 CLERK SDK VERIFICATION REPORT" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "`n"

# Check package.json for pinned versions
Write-Host "📦 Checking package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json

$clerkPackages = @(
    "@clerk/clerk-react",
    "@clerk/backend",
    "@clerk/types"
)

$allPinned = $true

foreach ($pkg in $clerkPackages) {
    $version = $packageJson.dependencies.$pkg
    if ($version) {
        $isPinned = -not ($version -match '[\^~]')
        $status = if ($isPinned) { "✅ PINNED" } else { "❌ NOT PINNED" }
        $color = if ($isPinned) { "Green" } else { "Red" }
        
        Write-Host "  $pkg" -NoNewline
        Write-Host " = " -NoNewline -ForegroundColor Gray
        Write-Host "$version " -NoNewline -ForegroundColor White
        Write-Host "$status" -ForegroundColor $color
        
        if (-not $isPinned) {
            $allPinned = $false
        }
    } else {
        Write-Host "  $pkg" -NoNewline
        Write-Host " = " -NoNewline -ForegroundColor Gray
        Write-Host "NOT FOUND" -ForegroundColor Red
        $allPinned = $false
    }
}

Write-Host "`n"

# Check main.jsx for clerkJSVersion
Write-Host "🔒 Checking ClerkProvider configuration..." -ForegroundColor Yellow
$mainJsx = Get-Content "src/main.jsx" -Raw

if ($mainJsx -match 'clerkJSVersion="([^"]+)"') {
    $jsVersion = $matches[1]
    Write-Host "  clerkJSVersion = " -NoNewline -ForegroundColor Gray
    Write-Host "$jsVersion " -NoNewline -ForegroundColor White
    Write-Host "✅ CONFIGURED" -ForegroundColor Green
} else {
    Write-Host "  clerkJSVersion = " -NoNewline -ForegroundColor Gray
    Write-Host "❌ NOT CONFIGURED" -ForegroundColor Red
    $allPinned = $false
}

Write-Host "`n"

# Check if node_modules exists
Write-Host "📁 Checking installed packages..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    $clerkReactPath = "node_modules/@clerk/clerk-react/package.json"
    if (Test-Path $clerkReactPath) {
        $installedPkg = Get-Content $clerkReactPath | ConvertFrom-Json
        Write-Host "  Installed @clerk/clerk-react: " -NoNewline -ForegroundColor Gray
        Write-Host "$($installedPkg.version)" -ForegroundColor White
    } else {
        Write-Host "  @clerk/clerk-react: " -NoNewline -ForegroundColor Gray
        Write-Host "NOT INSTALLED" -ForegroundColor Yellow
    }
} else {
    Write-Host "  node_modules: " -NoNewline -ForegroundColor Gray
    Write-Host "NOT FOUND (run npm install)" -ForegroundColor Yellow
}

Write-Host "`n"

# Calculate days until migration
$today = Get-Date
$deadline = Get-Date "2025-11-10"
$daysRemaining = ($deadline - $today).Days

Write-Host "⏰ Migration Timeline" -ForegroundColor Yellow
Write-Host "  Current Date: " -NoNewline -ForegroundColor Gray
Write-Host "$(Get-Date -Format 'yyyy-MM-dd')" -ForegroundColor White
Write-Host "  Migration Deadline: " -NoNewline -ForegroundColor Gray
Write-Host "2025-11-10" -ForegroundColor White
Write-Host "  Days Remaining: " -NoNewline -ForegroundColor Gray

if ($daysRemaining -le 3) {
    Write-Host "$daysRemaining days" -ForegroundColor Red
    Write-Host "  ⚠️  URGENT: Migration is very close!" -ForegroundColor Red
} elseif ($daysRemaining -le 7) {
    Write-Host "$daysRemaining days" -ForegroundColor Yellow
    Write-Host "  ⚡ Action needed soon" -ForegroundColor Yellow
} else {
    Write-Host "$daysRemaining days" -ForegroundColor Green
    Write-Host "  ✓ On schedule" -ForegroundColor Green
}

Write-Host "`n"

# Final status
Write-Host "=" * 60 -ForegroundColor Gray
if ($allPinned) {
    Write-Host "✅ ALL CHECKS PASSED" -ForegroundColor Green
    Write-Host "   Your Clerk SDK is properly configured for the migration" -ForegroundColor Green
} else {
    Write-Host "❌ ACTION REQUIRED" -ForegroundColor Red
    Write-Host "   Please fix the issues above before November 10" -ForegroundColor Red
}
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "`n"

# Next steps
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Complete npm install" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor White
Write-Host "  3. Test authentication flow" -ForegroundColor White
Write-Host "  4. Review CLERK-MIGRATION-CHECKLIST.md" -ForegroundColor White
Write-Host "`n"
