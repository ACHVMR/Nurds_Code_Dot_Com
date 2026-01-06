#!/bin/bash
# cloud_run/deploy_acheevy.sh

PROJECT_ID="nurds-code-gcp-prod"
REGION="us-central1"
SERVICE_ACCOUNT="acheevy-agent@$PROJECT_ID.iam.gserviceaccount.com"

echo "Deploying ACHEEVY Runtime to $PROJECT_ID..."

# Get Secrets from Secret Manager (Environment Variable references)
# We map the Cloud Run env vars to the Secrets
# Syntax: ENV_VAR=projects/PROJECT_ID/secrets/SECRET_NAME/versions/latest

GROQ_REF="GROQ_API_KEY=projects/$PROJECT_ID/secrets/groq-api-key/versions/latest"
ELEVEN_REF="ELEVENLABS_API_KEY=projects/$PROJECT_ID/secrets/elevenlabs-api-key/versions/latest"
DEEPGRAM_REF="DEEPGRAM_API_KEY=projects/$PROJECT_ID/secrets/deepgram-api-key/versions/latest"
OPENROUTER_REF="OPENROUTER_API_KEY=projects/$PROJECT_ID/secrets/openrouter-api-key/versions/latest"

gcloud run deploy acheevy-runtime \
  --source ./cloud_run \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 100 \
  --min-instances 1 \
  --service-account $SERVICE_ACCOUNT \
  --set-env-vars VERTEX_PROJECT_ID=$PROJECT_ID,VERTEX_LOCATION=$REGION \
  --set-secrets "$GROQ_REF,$ELEVEN_REF,$DEEPGRAM_REF,$OPENROUTER_REF"

# Get the Service URL
AGENT_URL=$(gcloud run services describe acheevy-runtime --project $PROJECT_ID --region $REGION --format='value(status.url)')

echo ""
echo "✅ Deployment Complete!"
echo "Agent Runtime URL: $AGENT_URL"
echo "👉 Update this URL in your wrangler.toml [vars] section."
