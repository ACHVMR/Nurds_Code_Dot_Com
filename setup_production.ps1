# setup_production.ps1
# Nurds Code: Production GCP Setup Script based on Integration Guide

$ProjectID = "nurds-code-gcp-prod"
$ServiceAccountName = "acheevy-agent"
$Region = "us-central1"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Nurds Code Production Setup (GCP)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Login/Auth Check
Write-Host "[1/6] Checking Authentication..." -ForegroundColor Yellow
$auth = gcloud auth list --filter=status:ACTIVE --format="value(account)"
if (-not $auth) {
    Write-Host "Please login to Google Cloud..." -ForegroundColor Gray
    gcloud auth login
    gcloud auth application-default login
} else {
    Write-Host "✅ Logged in as $auth" -ForegroundColor Green
}

# 2. Project Creation
Write-Host "[2/6] Configuring Project: $ProjectID" -ForegroundColor Yellow
try {
    gcloud config set project $ProjectID
} catch {
    Write-Host "Creating project '$ProjectID'..." -ForegroundColor Gray
    gcloud projects create $ProjectID --name="Nurds Code Production"
    gcloud config set project $ProjectID
}

# 3. Enable APIs
Write-Host "[3/6] Enabling APIs..." -ForegroundColor Yellow
$apis = @(
    "run.googleapis.com", 
    "aiplatform.googleapis.com", 
    "cloudbuild.googleapis.com", 
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com"
)
foreach ($api in $apis) {
    Write-Host "   Enabling $api..." -ForegroundColor Gray
    gcloud services enable $api
}

# 4. Service Account Setup
Write-Host "[4/6] Setting up Service Account ($ServiceAccountName)..." -ForegroundColor Yellow
$saEmail = "$ServiceAccountName@$ProjectID.iam.gserviceaccount.com"

$saExists = gcloud iam service-accounts list --filter="email:$saEmail" --format="value(email)"
if (-not $saExists) {
    gcloud iam service-accounts create $ServiceAccountName --display-name="ACHEEVY Agent Runtime"
}

# Grant Roles
Write-Host "   Granting IAM Roles..." -ForegroundColor Gray
gcloud projects add-iam-policy-binding $ProjectID --member="serviceAccount:$saEmail" --role="roles/aiplatform.user" | Out-Null
gcloud projects add-iam-policy-binding $ProjectID --member="serviceAccount:$saEmail" --role="roles/run.invoker" | Out-Null
gcloud projects add-iam-policy-binding $ProjectID --member="serviceAccount:$saEmail" --role="roles/secretmanager.secretAccessor" | Out-Null

# 5. Secrets Management
Write-Host "[5/6] Uploading Secrets from .env..." -ForegroundColor Yellow
# Function to get env var from .env file or shell
function Get-EnvVar($key) {
    $val = Get-Content .env | Where-Object { $_ -match "^$key=(.*)" } | ForEach-Object { $matches[1] }
    if (-not $val) { $val = [Environment]::GetEnvironmentVariable($key) }
    return $val
}

$secrets = @{
    "groq-api-key"       = "GROQ_API_KEY"
    "elevenlabs-api-key" = "ELEVENLABS_API_KEY"
    "deepgram-api-key"   = "DEEPGRAM_API_KEY"
    "openrouter-api-key" = "OPENROUTER_API_KEY"
}

foreach ($secretName in $secrets.Keys) {
    $envKey = $secrets[$secretName]
    $secretValue = Get-EnvVar $envKey
    
    if ($secretValue) {
        Write-Host "   Updating secret: $secretName" -ForegroundColor Gray
        # Create secret if not exists
        gcloud secrets create $secretName --replication-policy="automatic" 2>$null
        # Add version
        $secretValue | gcloud secrets versions add $secretName --data-file=-
    } else {
        Write-Host "   ⚠️  Missing .env value for $envKey. Skipping secret $secretName." -ForegroundColor Red
    }
}

# 6. Final Steps
Write-Host "[6/6] Configuration Complete!" -ForegroundColor Green
Write-Host "⚠️  REMINDER: Ensure your Billing Account is linked!" -ForegroundColor Red
Write-Host "   Command: gcloud beta billing projects link $ProjectID --billing-account=YOUR_BILLING_ID" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Step: Run './cloud_run/deploy_acheevy.sh' to deploy."
