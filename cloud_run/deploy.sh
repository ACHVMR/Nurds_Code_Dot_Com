#!/bin/bash
# cloud_run/deploy.sh

# Build and deploy the implementation to Cloud Run
gcloud run deploy nurds-code-api \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars OPENROUTER_API_KEY=$OPENROUTER_API_KEY \
  --set-env-vars GROQ_API_KEY=$GROQ_API_KEY \
  --set-env-vars ELEVENLABS_API_KEY=$ELEVENLABS_API_KEY \
  --memory 4Gi \
  --cpu 2 \
  --concurrency 100
