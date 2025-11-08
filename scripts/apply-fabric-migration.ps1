# Apply Fabric + Teams + Zoom Database Migration
# This script applies migration 0004 to Supabase

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Fabric + Teams + Zoom Database Migration" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseCli) {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install it first:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase" -ForegroundColor White
    Write-Host ""
    Write-Host "OR apply the migration manually:" -ForegroundColor Yellow
    Write-Host "  1. Go to your Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "  2. Select your project" -ForegroundColor White
    Write-Host "  3. Navigate to SQL Editor" -ForegroundColor White
    Write-Host "  4. Copy and paste the contents of:" -ForegroundColor White
    Write-Host "     supabase/migrations/0004_fabric_teams_zoom.sql" -ForegroundColor Cyan
    Write-Host "  5. Click 'Run'" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Check if migration file exists
$migrationFile = ".\supabase\migrations\0004_fabric_teams_zoom.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found migration file" -ForegroundColor Green
Write-Host ""

# Check for .env file with Supabase credentials
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. You'll need to provide credentials manually." -ForegroundColor Yellow
    Write-Host ""
}

# Option 1: Use Supabase CLI (local dev)
Write-Host "Choose migration method:" -ForegroundColor Cyan
Write-Host "  1. Apply to LOCAL Supabase (requires Docker)" -ForegroundColor White
Write-Host "  2. Apply to REMOTE Supabase (production)" -ForegroundColor White
Write-Host "  3. Show SQL only (manual copy-paste)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Applying to local Supabase..." -ForegroundColor Cyan
        supabase db reset
        Write-Host ""
        Write-Host "✅ Migration applied to local Supabase!" -ForegroundColor Green
    }
    "2" {
        Write-Host ""
        Write-Host "To apply to remote Supabase:" -ForegroundColor Cyan
        Write-Host "  supabase db push --db-url 'postgresql://user:pass@host:port/database'" -ForegroundColor White
        Write-Host ""
        Write-Host "Or use the Supabase Dashboard SQL Editor (recommended)" -ForegroundColor Yellow
    }
    "3" {
        Write-Host ""
        Write-Host "===============================================" -ForegroundColor Cyan
        Write-Host "SQL MIGRATION CONTENT" -ForegroundColor Cyan
        Write-Host "===============================================" -ForegroundColor Cyan
        Write-Host ""
        Get-Content $migrationFile
        Write-Host ""
        Write-Host "===============================================" -ForegroundColor Cyan
        Write-Host "Copy the SQL above and run it in Supabase Dashboard" -ForegroundColor Yellow
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Migration Instructions Complete" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify migration in Supabase Dashboard" -ForegroundColor White
Write-Host "  2. Test Analytics page: http://localhost:3002/analytics" -ForegroundColor White
Write-Host "  3. Test Meetings page: http://localhost:3002/meetings" -ForegroundColor White
Write-Host "  4. Setup Azure infrastructure (see FABRIC_TEAMS_ZOOM_INTEGRATION.md)" -ForegroundColor White
Write-Host ""
