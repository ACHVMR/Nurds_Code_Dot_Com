#!/bin/bash
# ============================================
# II-Agent Mass Deployment Script
# Builds and deploys all 19 II-Agent workers to GCP Cloud Run
# ============================================

set -e

PROJECT_ID="${GCP_PROJECT_ID:-nurds-code-prod}"
REGION="${GCP_REGION:-us-central1}"
ARTIFACT_REGISTRY="us-central1-docker.pkg.dev/${PROJECT_ID}/nurds-code-containers"

# II-Agent definitions (name:memory:timeout:min:max)
AGENTS=(
  "nlu:512:30:1:8"
  "codegen:2048:120:2:15"
  "research:2048:180:2:10"
  "validation:1024:60:1:5"
  "security:1024:60:1:4"
  "kg:1536:120:1:5"
  "streaming:1024:30:1:6"
  "multimodal:2048:120:1:8"
  "reasoning:2048:180:2:8"
  "deploy:512:180:1:3"
  "observability:512:30:1:2"
  "costopt:512:60:1:2"
  "legal:1024:90:1:3"
  "synthesis:1536:120:1:5"
  "hitl:512:30:1:2"
  "prompt:512:60:1:3"
  "tools:1024:90:2:8"
  "learning:2048:180:1:5"
  "data:1024:90:1:6"
)

echo "=== II-Agent Mass Deployment ==="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Create artifact registry if it doesn't exist
echo "[1/4] Checking Artifact Registry..."
gcloud artifacts repositories describe nurds-code-containers \
  --location=$REGION --project=$PROJECT_ID 2>/dev/null || \
gcloud artifacts repositories create nurds-code-containers \
  --repository-format=docker \
  --location=$REGION \
  --project=$PROJECT_ID

# Build and push each agent
echo "[2/4] Building and pushing agent containers..."
for AGENT_DEF in "${AGENTS[@]}"; do
  IFS=':' read -r NAME MEMORY TIMEOUT MIN MAX <<< "$AGENT_DEF"
  
  IMAGE="${ARTIFACT_REGISTRY}/ii-${NAME}-worker:latest"
  
  echo "  Building ii-${NAME}-worker..."
  
  # Build with agent type as build arg
  docker build \
    --build-arg AGENT_TYPE=$NAME \
    -t $IMAGE \
    -f services/ii-agent-template/Dockerfile \
    services/ii-agent-template/
  
  # Push to Artifact Registry
  docker push $IMAGE
  
  echo "  ✓ ii-${NAME}-worker pushed"
done

# Deploy to Cloud Run
echo "[3/4] Deploying to Cloud Run..."
for AGENT_DEF in "${AGENTS[@]}"; do
  IFS=':' read -r NAME MEMORY TIMEOUT MIN MAX <<< "$AGENT_DEF"
  
  SERVICE="ii-${NAME}-worker"
  IMAGE="${ARTIFACT_REGISTRY}/ii-${NAME}-worker:latest"
  
  echo "  Deploying $SERVICE..."
  
  gcloud run deploy $SERVICE \
    --image=$IMAGE \
    --platform=managed \
    --region=$REGION \
    --project=$PROJECT_ID \
    --memory="${MEMORY}Mi" \
    --timeout="${TIMEOUT}s" \
    --min-instances=$MIN \
    --max-instances=$MAX \
    --concurrency=10 \
    --port=8080 \
    --set-env-vars="AGENT_TYPE=$NAME" \
    --set-env-vars="NODE_ENV=production" \
    --allow-unauthenticated \
    --quiet
  
  echo "  ✓ $SERVICE deployed"
done

# Verify deployments
echo "[4/4] Verifying deployments..."
for AGENT_DEF in "${AGENTS[@]}"; do
  IFS=':' read -r NAME _ _ _ _ <<< "$AGENT_DEF"
  SERVICE="ii-${NAME}-worker"
  
  URL=$(gcloud run services describe $SERVICE \
    --platform=managed \
    --region=$REGION \
    --project=$PROJECT_ID \
    --format="value(status.url)" 2>/dev/null)
  
  if [ -n "$URL" ]; then
    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "${URL}/health" 2>/dev/null || echo "000")
    if [ "$HEALTH" = "200" ]; then
      echo "  ✓ $SERVICE: $URL (healthy)"
    else
      echo "  ⚠ $SERVICE: $URL (status: $HEALTH)"
    fi
  else
    echo "  ✗ $SERVICE: Not found"
  fi
done

echo ""
echo "=== Deployment Complete ==="
echo "Total agents deployed: ${#AGENTS[@]}"
