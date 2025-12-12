
# GCP Cloud Run Hybrid Setup Guide

**Target Project:** `cosmic-tenure-480918-a9`

## 1. Initial Setup
```bash
gcloud auth login
gcloud config set project cosmic-tenure-480918-a9
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

## 2. Deploy Agent Runtime
Navigate to repo root:
```bash
gcloud run deploy agent-runtime \
  --source services/agent-runtime \
  --region us-central1 \
  --port 8080 \
  --allow-unauthenticated # For initial smoke test ONLY.
```

## 3. Production Security
After verifying the deployment:
1. Revoke `allUsers` access if you want strict IAM control, OR rely on the `AGENT_RUNTIME_SHARED_SECRET` mechanism integrated in the server code.
2. Set Environment Variables in Cloud Run Console or via command line:
   - `AGENT_RUNTIME_SHARED_SECRET`: Generate a strong random string.
   - `SUPABASE_PROJECT_URL`: Your Supabase URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: Retrieve from Supabase Dashboard > Project Settings > API.

## 4. Updates for Cloudflare
Once Cloud Run is deployed, copy the Service URL (e.g., `https://agent-runtime-xyz.a.run.app`) and update your Cloudflare configuration:
1. Update `wrangler.toml`: Set `AGENT_RUNTIME_URL`.
2. Push secret: `npx wrangler secret put AGENT_RUNTIME_SHARED_SECRET` (Must match the one in Cloud Run).
