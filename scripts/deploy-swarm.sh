#!/bin/bash
# Deploy Intelligent Internet Swarm to GCP Cloud Run
# Heavy Swarm: Scales to 0 when idle, activates on demand

set -e

PROJECT_ID="nurds-code-gcp-prod"
REGION="us-central1"
REGISTRY="gcr.io/${PROJECT_ID}"

echo "🚀 Deploying II-Agent Swarm to GCP Cloud Run..."
echo "📍 Project: ${PROJECT_ID}"
echo "📍 Region: ${REGION}"
echo ""

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "❌ Not authenticated with gcloud. Run: gcloud auth login"
    exit 1
fi

# Set project
gcloud config set project ${PROJECT_ID}

echo "📦 Step 1/4: Deploy ACHEEVY Orchestrator (CDM Hub)"
gcloud run deploy acheevy-orchestrator \
  --image ${REGISTRY}/ii-agent:latest \
  --platform managed \
  --region ${REGION} \
  --service-account acheevy-sa@${PROJECT_ID}.iam.gserviceaccount.com \
  --set-env-vars ROLE=ORCHESTRATOR,NAME=ACHEEVY \
  --min-instances 0 \
  --max-instances 10 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300s \
  --allow-unauthenticated \
  --quiet

ACHEEVY_URL=$(gcloud run services describe acheevy-orchestrator --region=${REGION} --format='value(status.url)')
echo "✅ ACHEEVY deployed: ${ACHEEVY_URL}"
echo ""

echo "📦 Step 2/4: Deploy II-Researcher (Research Agent)"
gcloud run deploy ii-researcher \
  --image ${REGISTRY}/ii-researcher:latest \
  --platform managed \
  --region ${REGION} \
  --min-instances 0 \
  --max-instances 5 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300s \
  --allow-unauthenticated \
  --quiet

RESEARCHER_URL=$(gcloud run services describe ii-researcher --region=${REGION} --format='value(status.url)')
echo "✅ II-Researcher deployed: ${RESEARCHER_URL}"
echo ""

echo "📦 Step 3/4: Deploy Codex (Code Execution Agent)"
gcloud run deploy codex-agent \
  --image ${REGISTRY}/codex:latest \
  --platform managed \
  --region ${REGION} \
  --min-instances 0 \
  --max-instances 5 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300s \
  --allow-unauthenticated \
  --quiet

CODEX_URL=$(gcloud run services describe codex-agent --region=${REGION} --format='value(status.url)')
echo "✅ Codex deployed: ${CODEX_URL}"
echo ""

echo "📦 Step 4/4: Deploy CommonGround (Collaboration Hub)"
gcloud run deploy common-ground \
  --image ${REGISTRY}/common-ground:latest \
  --platform managed \
  --region ${REGION} \
  --min-instances 0 \
  --max-instances 3 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300s \
  --allow-unauthenticated \
  --quiet

COMMON_URL=$(gcloud run services describe common-ground --region=${REGION} --format='value(status.url)')
echo "✅ CommonGround deployed: ${COMMON_URL}"
echo ""

echo "═══════════════════════════════════════════════════════"
echo "🎉 Swarm Deployment Complete!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋 Service URLs:"
echo "  ACHEEVY:      ${ACHEEVY_URL}"
echo "  Researcher:   ${RESEARCHER_URL}"
echo "  Codex:        ${CODEX_URL}"
echo "  CommonGround: ${COMMON_URL}"
echo ""
echo "💡 Next Steps:"
echo "  1. Add these URLs to wrangler.toml [vars]"
echo "  2. Run: npx wrangler secret put ACHEEVY_ENDPOINT"
echo "  3. Deploy worker: npx wrangler deploy"
echo ""
echo "💰 Cost Optimization: All services scale to 0 when idle"
echo "🔒 Security: Update to --no-allow-unauthenticated for production"
