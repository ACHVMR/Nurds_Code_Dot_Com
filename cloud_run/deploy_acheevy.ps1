# deploy_acheevy.ps1
# PowerShell Deployment Script for Cloud Run

$PROJECT_ID = "cosmic-tenure-480918-a9"
$REGION = "us-central1"
$SERVICE_ACCOUNT = "acheevy-agent@$PROJECT_ID.iam.gserviceaccount.com"

Write-Host "Deploying ACHEEVY Runtime to $PROJECT_ID..." -ForegroundColor Cyan

# 1. Build and Deploy
gcloud run deploy acheevy-runtime `
  --source ./cloud_run `
  --region $REGION `
  --project $PROJECT_ID `
  --allow-unauthenticated `
  --memory 2Gi `
  --cpu 2 `
  --timeout 300 `
  --max-instances 100 `
  --min-instances 1 `
  --service-account $SERVICE_ACCOUNT `
  --set-env-vars VERTEX_PROJECT_ID=$PROJECT_ID,VERTEX_LOCATION=$REGION `
  --set-secrets "GROQ_API_KEY=projects/$PROJECT_ID/secrets/groq-api-key/versions/latest,ELEVENLABS_API_KEY=projects/$PROJECT_ID/secrets/elevenlabs-api-key/versions/latest,DEEPGRAM_API_KEY=projects/$PROJECT_ID/secrets/deepgram-api-key/versions/latest,OPENROUTER_API_KEY=projects/$PROJECT_ID/secrets/openrouter-api-key/versions/latest"

# 2. Capture URL
$agentUrl = gcloud run services describe acheevy-runtime --project $PROJECT_ID --region $REGION --format='value(status.url)'

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "Agent Runtime URL: $agentUrl" -ForegroundColor Green
Write-Host "👉 Please update AGENT_RUNTIME_URL in your wrangler.toml file." -ForegroundColor Yellow
