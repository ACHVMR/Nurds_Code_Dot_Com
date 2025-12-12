# Deploying NurdsCode to Google Cloud Run
# This allows you to access the app from any device including iPad

## Prerequisites
1. Google Cloud SDK (`gcloud`) installed
2. Docker installed
3. A GCP project with billing enabled

## Quick Deploy

### Step 1: Build the production bundle
```powershell
npm run build
```

### Step 2: Create a simple Dockerfile for the frontend
```dockerfile
# This is already created at Dockerfile.frontend
```

### Step 3: Deploy to Cloud Run
```powershell
# Set your project
$env:GCP_PROJECT = "your-project-id"
gcloud config set project $env:GCP_PROJECT

# Enable required services
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Build and push the image
gcloud builds submit --tag gcr.io/$env:GCP_PROJECT/nurdscode-frontend

# Deploy to Cloud Run
gcloud run deploy nurdscode-frontend `
  --image gcr.io/$env:GCP_PROJECT/nurdscode-frontend `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --port 80

# Get the URL
gcloud run services describe nurdscode-frontend --region us-central1 --format="value(status.url)"
```

## Alternative: Use Cloudflare Pages (Simpler)

If you want simpler deployment:

```powershell
# Install Wrangler globally if needed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy the dist folder
wrangler pages deploy dist --project-name=nurdscode
```

This gives you a URL like: https://nurdscode.pages.dev

## Access from iPad

Once deployed, simply open the Cloud Run or Cloudflare Pages URL on your iPad browser:
- Cloud Run: `https://nurdscode-frontend-xxxxx.a.run.app`
- Cloudflare Pages: `https://nurdscode.pages.dev`

Both work great on iPad Safari!
