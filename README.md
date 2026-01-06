# Nurds Code Platform - Production Architecture

**Stack:** Cloudflare Edge + Cloud Run Hybrid

## 🏗️ Architecture Overview

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React + Vite | Modern UI (located in `src/`) |
| **Edge API** | Cloudflare Workers | Fast API Gateway, Auth, Subscriptions |
| **Database** | Cloudflare D1 | Relational SQL Data |
| **Storage** | Cloudflare R2 | Asset & Audio Storage (`acheevy-voice-audio`) |
| **AI (Fast)** | Groq / Workers AI | Sub-second inference |
| **AI (Heavy)**| Cloud Run + Vertex AI | "ACHEEVY" Agent Swarm, Deep Reasoning |

## 🚀 Setup Guide

### 1. Production GCP Setup
Initialize the Google Cloud environment for the Agent Runtime:
```powershell
./setup_production.ps1
```

### 2. Deploy Agent Runtime (Cloud Run)
Deploy the heavy-lifting agents to a scalable serverless container:
```powershell
./cloud_run/deploy_acheevy.sh
```
*Note the URL output! You will need it for the next step.*

### 3. Configure Edge API
Update `wrangler.toml` (or `.env`) with the Agent Runtime URL:
```toml
[vars]
AGENT_RUNTIME_URL = "https://your-cloud-run-url.run.app"
```

### 4. Deploy Edge stack
Deploy the API and Database migration:
```powershell
npx wrangler d1 migrations apply nurds-core-db --remote
npx wrangler deploy
```

## 📂 Project Structure
- `src/` - React Frontend Application
- `workers/` - Cloudflare Workers API Logic
- `cloud_run/` - ACHEEVY Agent Runtime (Express/TypeScript)
- `wrangler.toml` - Infrastructure config
- `cloud_run/deploy_acheevy.sh` - Agent deployment script
