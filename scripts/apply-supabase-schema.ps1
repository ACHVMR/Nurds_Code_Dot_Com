param(
    [string]$ConnectionString
)

# Apply Supabase schema using psql on Windows PowerShell.
# Usage examples:
#   pwsh -File scripts/apply-supabase-schema.ps1 -ConnectionString "postgres://USER:PASSWORD@HOST:5432/postgres"
#   $env:SUPABASE_DB_URL = "postgres://USER:PASSWORD@HOST:5432/postgres"; pwsh -File scripts/apply-supabase-schema.ps1

$ErrorActionPreference = 'Stop'

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Resolve connection string
if (-not $ConnectionString -or $ConnectionString.Trim() -eq '') {
    $ConnectionString = $env:SUPABASE_DB_URL
}

if (-not $ConnectionString -or $ConnectionString.Trim() -eq '') {
    Write-Err "No connection string provided. Set -ConnectionString or $env:SUPABASE_DB_URL."
    exit 1
}

# Check psql availability
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
    Write-Warn "psql not found on PATH. Please install PostgreSQL client or Supabase CLI with psql embedded."
    Write-Warn "Download: https://www.postgresql.org/download/ or https://supabase.com/docs/guides/cli"
    exit 1
}

# Locate schema file
$schemaPath = Join-Path $PSScriptRoot '..' 'supabase_schema.sql' | Resolve-Path
if (-not (Test-Path $schemaPath)) {
    Write-Err "Schema file not found at $schemaPath"
    exit 1
}

Write-Info "Applying schema from: $schemaPath"
Write-Info "Target: $ConnectionString"

# Run migration
& psql "$ConnectionString" -v ON_ERROR_STOP=1 -f "$schemaPath"
if ($LASTEXITCODE -ne 0) {
    Write-Err "psql returned exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Info "Supabase schema applied successfully."
