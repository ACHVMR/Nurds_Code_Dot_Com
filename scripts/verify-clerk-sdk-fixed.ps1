# Clerk SDK Verification Script
# Verifies that all Clerk SDK versions are pinned correctly

Write-Host "`n" -NoNewline
Write-Host "CLERK SDK VERIFICATION REPORT" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Gray
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "`n"

# Check package.json for pinned versions
Write-Host "Checking package.json..." -ForegroundColor Yellow
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
        $status = if ($isPinned) { "PINNED" } else { "NOT PINNED" }
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
Write-Host "Checking ClerkProvider configuration..." -ForegroundColor Yellow
$mainJsx = Get-Content "src/main.jsx" -Raw

if ($mainJsx -match 'clerkJSVersion') {
    Write-Host "  clerkJSVersion found in main.jsx" -ForegroundColor Green
    if ($mainJsx -match 'clerkJSVersion="([0-9.]+)"') {
        $jsVersion = $matches[1]
        Write-Host "  Version: $jsVersion" -ForegroundColor White
    }
} else {
    Write-Host "  clerkJSVersion NOT CONFIGURED" -ForegroundColor Red
    $allPinned = $false
}

Write-Host "`n"

# Check if node_modules exists
Write-Host "Checking installed packages..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    $clerkReactPath = "node_modules/@clerk/clerk-react/package.json"
    if (Test-Path $clerkReactPath) {
        $installedPkg = Get-Content $clerkReactPath | ConvertFrom-Json
        Write-Host "  Installed @clerk/clerk-react: " -NoNewline -ForegroundColor Gray
        Write-Host "$($installedPkg.version)" -ForegroundColor White
    } else {
        Write-Host "  @clerk/clerk-react NOT INSTALLED" -ForegroundColor Yellow
    }
} else {
    Write-Host "  node_modules NOT FOUND (run npm install)" -ForegroundColor Yellow
}

Write-Host "`n"

# Calculate days until migration
$today = Get-Date
$deadline = Get-Date "2025-11-10"
$daysRemaining = ($deadline - $today).Days

Write-Host "Migration Timeline" -ForegroundColor Yellow
Write-Host "  Current Date: $(Get-Date -Format 'yyyy-MM-dd')" -ForegroundColor White
Write-Host "  Migration Deadline: 2025-11-10" -ForegroundColor White
Write-Host "  Days Remaining: $daysRemaining days" -ForegroundColor $(if ($daysRemaining -le 3) { "Red" } elseif ($daysRemaining -le 7) { "Yellow" } else { "Green" })

Write-Host "`n"

# Final status
Write-Host "============================================================" -ForegroundColor Gray
if ($allPinned) {
    Write-Host "ALL CHECKS PASSED" -ForegroundColor Green
    Write-Host "Your Clerk SDK is properly configured for the migration" -ForegroundColor Green
} else {
    Write-Host "ACTION REQUIRED" -ForegroundColor Red
    Write-Host "Please fix the issues above before November 10" -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Gray
Write-Host "`n"

# Next steps
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Run: npm run dev" -ForegroundColor White
Write-Host "  2. Test authentication flow" -ForegroundColor White
Write-Host "  3. Review CLERK-MIGRATION-CHECKLIST.md" -ForegroundColor White
Write-Host "`n"
