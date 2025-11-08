# Deploy Connections Migration Script
# Run this to apply the migration to Supabase

param(
    [string]$SupabaseUrl = $env:SUPABASE_URL,
    [string]$ServiceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY
)

Write-Host "🚀 Applying Deploy Connections Migration..." -ForegroundColor Green

# Read the migration file
$migrationPath = Join-Path $PSScriptRoot "..\supabase\migrations\0007_deploy_connections.sql"
$sql = Get-Content $migrationPath -Raw

if ([string]::IsNullOrEmpty($SupabaseUrl) -or [string]::IsNullOrEmpty($ServiceRoleKey)) {
    Write-Host "⚠️  Environment variables not set. Please provide them manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Set environment variables"
    Write-Host "  `$env:SUPABASE_URL = 'https://your-project.supabase.co'"
    Write-Host "  `$env:SUPABASE_SERVICE_ROLE_KEY = 'your-service-role-key'"
    Write-Host ""
    Write-Host "Option 2: Run with parameters"
    Write-Host "  .\apply-deploy-migration.ps1 -SupabaseUrl 'https://...' -ServiceRoleKey 'eyJ...'"
    Write-Host ""
    Write-Host "Option 3: Apply manually in Supabase SQL Editor"
    Write-Host "  Copy and paste the contents of: supabase\migrations\0007_deploy_connections.sql"
    Write-Host ""
    exit 1
}

# Apply migration via REST API
$headers = @{
    "apikey" = $ServiceRoleKey
    "Authorization" = "Bearer $ServiceRoleKey"
    "Content-Type" = "application/json"
}

$body = @{
    query = $sql
} | ConvertTo-Json

try {
    Write-Host "📡 Connecting to Supabase..." -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri "$SupabaseUrl/rest/v1/rpc" -Method Post -Headers $headers -Body $body
    
    Write-Host "✅ Migration applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Table created: deploy_connections" -ForegroundColor Green
    Write-Host "🔒 RLS policies enabled" -ForegroundColor Green
    Write-Host "⚡ Indexes created for performance" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Deploy Repository: https://github.com/ACHVMR/DEPLOY.git" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Try applying manually in Supabase SQL Editor instead" -ForegroundColor Yellow
    exit 1
}
