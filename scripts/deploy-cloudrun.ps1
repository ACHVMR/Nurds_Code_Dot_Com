# ============================================
# Deploy Agent Runtime to Google Cloud Run
# ============================================
# This script deploys the agent-runtime service to Cloud Run
# No local Docker required - Cloud Build handles containerization
# ============================================

param(
    [string]$ProjectId = "cosmic-tenure-480918-a9",
    [string]$Region = "us-central1",
    [string]$ServiceName = "agent-runtime",
    [switch]$Production,
    [switch]$SetSecrets
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Cloud Run Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version 2>&1 | Select-Object -First 1
    Write-Host "[OK] gcloud CLI: $gcloudVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

# Authenticate if needed
Write-Host ""
Write-Host "Checking authentication..." -ForegroundColor Yellow
$authList = gcloud auth list --filter="status:ACTIVE" --format="value(account)" 2>&1
if (-not $authList -or $authList -like "*ERROR*") {
    Write-Host "Not authenticated. Running 'gcloud auth login'..." -ForegroundColor Yellow
    gcloud auth login
}
Write-Host "[OK] Authenticated as: $authList" -ForegroundColor Green

# Set project
Write-Host ""
Write-Host "Setting project to: $ProjectId" -ForegroundColor Yellow
gcloud config set project $ProjectId

# Enable required APIs
Write-Host ""
Write-Host "Enabling required APIs..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com

# Navigate to service directory
$ServicePath = Join-Path $PSScriptRoot "..\Nurds_Code_Dot_Com\services\agent-runtime"
if (-not (Test-Path $ServicePath)) {
    # Try alternate path
    $ServicePath = Join-Path $PSScriptRoot "..\services\agent-runtime"
}

if (-not (Test-Path $ServicePath)) {
    Write-Host "[ERROR] agent-runtime service not found at expected paths" -ForegroundColor Red
    Write-Host "Looked in:" -ForegroundColor Yellow
    Write-Host "  - $PSScriptRoot\..\Nurds_Code_Dot_Com\services\agent-runtime"
    Write-Host "  - $PSScriptRoot\..\services\agent-runtime"
    exit 1
}

Write-Host "[OK] Found service at: $ServicePath" -ForegroundColor Green

# Set secrets if requested
if ($SetSecrets) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   Setting up Secrets" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    # Prompt for secrets
    $sharedSecret = Read-Host "Enter AGENT_RUNTIME_SHARED_SECRET (leave blank to skip)"
    if ($sharedSecret) {
        Write-Host "Creating secret: agent-runtime-shared-secret" -ForegroundColor Yellow
        echo $sharedSecret | gcloud secrets create agent-runtime-shared-secret --data-file=- 2>$null
        if ($LASTEXITCODE -ne 0) {
            echo $sharedSecret | gcloud secrets versions add agent-runtime-shared-secret --data-file=-
        }
    }
    
    $supabaseUrl = Read-Host "Enter SUPABASE_PROJECT_URL (leave blank to skip)"
    if ($supabaseUrl) {
        Write-Host "Creating secret: supabase-project-url" -ForegroundColor Yellow
        echo $supabaseUrl | gcloud secrets create supabase-project-url --data-file=- 2>$null
        if ($LASTEXITCODE -ne 0) {
            echo $supabaseUrl | gcloud secrets versions add supabase-project-url --data-file=-
        }
    }
    
    $supabaseKey = Read-Host "Enter SUPABASE_SERVICE_ROLE_KEY (leave blank to skip)"
    if ($supabaseKey) {
        Write-Host "Creating secret: supabase-service-role-key" -ForegroundColor Yellow
        echo $supabaseKey | gcloud secrets create supabase-service-role-key --data-file=- 2>$null
        if ($LASTEXITCODE -ne 0) {
            echo $supabaseKey | gcloud secrets versions add supabase-service-role-key --data-file=-
        }
    }
}

# Deploy to Cloud Run
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Deploying to Cloud Run" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Service: $ServiceName" -ForegroundColor White
Write-Host "Region: $Region" -ForegroundColor White
Write-Host "Project: $ProjectId" -ForegroundColor White
Write-Host ""

$deployArgs = @(
    "run", "deploy", $ServiceName,
    "--source", $ServicePath,
    "--region", $Region,
    "--port", "8080",
    "--memory", "512Mi",
    "--cpu", "1",
    "--min-instances", "0",
    "--max-instances", "10",
    "--timeout", "300",
    "--set-env-vars", "NODE_ENV=production"
)

# Add secrets if they exist
$secretsList = gcloud secrets list --format="value(name)" 2>$null
if ($secretsList -like "*agent-runtime-shared-secret*") {
    $deployArgs += "--set-secrets"
    $deployArgs += "AGENT_RUNTIME_SHARED_SECRET=agent-runtime-shared-secret:latest"
}
if ($secretsList -like "*supabase-project-url*") {
    $deployArgs += "--update-secrets"
    $deployArgs += "SUPABASE_PROJECT_URL=supabase-project-url:latest"
}
if ($secretsList -like "*supabase-service-role-key*") {
    $deployArgs += "--update-secrets"
    $deployArgs += "SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest"
}

# Production vs development settings
if ($Production) {
    Write-Host "[PRODUCTION MODE] Requiring authentication" -ForegroundColor Magenta
    $deployArgs += "--no-allow-unauthenticated"
} else {
    Write-Host "[DEVELOPMENT MODE] Allowing unauthenticated (for testing)" -ForegroundColor Yellow
    $deployArgs += "--allow-unauthenticated"
}

# Execute deployment
Write-Host ""
Write-Host "Running: gcloud $($deployArgs -join ' ')" -ForegroundColor Gray
Write-Host ""

& gcloud $deployArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   Deployment Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    # Get service URL
    $serviceUrl = gcloud run services describe $ServiceName --region $Region --format="value(status.url)"
    Write-Host ""
    Write-Host "Service URL: $serviceUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Test the health endpoint: curl $serviceUrl/health" -ForegroundColor White
    Write-Host "2. Update wrangler.toml with AGENT_RUNTIME_URL=$serviceUrl" -ForegroundColor White
    Write-Host "3. Set Cloudflare secret: npx wrangler secret put AGENT_RUNTIME_SHARED_SECRET" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "[ERROR] Deployment failed. Check the logs above." -ForegroundColor Red
    exit 1
}
