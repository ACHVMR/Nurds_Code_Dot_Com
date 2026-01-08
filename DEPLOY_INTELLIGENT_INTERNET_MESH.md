# Deploy: Nurds Code + Intelligent Internet Mesh

This guide covers three practical deployment shapes for the Nurds Code platform and the Intelligent Internet repositories.

## 0) Reality check (what is “real” today)

- The Nurds Code platform runs as **React/Vite frontend** + **Cloudflare Worker edge API**.
- “II repos” in this workspace live under `Nurds_Code_Dot_Com/services/intelligent-internet/` and can be containerized as sidecar services.
- Some repos already ship a Dockerfile in this workspace (for example `ii-agent`, `gemini-cli-mcp-openai-bridge`, `CommonGround`). Others may require adding a Dockerfile/entrypoint.

## 1) Option A — Edge-first (recommended default)

### What runs where
- Cloudflare Pages: frontend
- Cloudflare Workers: edge API gateway
- Cloudflare D1: relational data
- External services (optional): Cloud Run / containers for “heavy agents”

### Steps
1. Ensure Worker secrets are set (Stripe, provider keys, Firecrawl, Clerk/JWT as applicable).
2. Deploy D1 migrations and the Worker.
3. Deploy the frontend.

Reference: see [Nurds_Code_Dot_Com/DEPLOYMENT.md](Nurds_Code_Dot_Com/DEPLOYMENT.md) for Pages/Workers steps.

## 2) Option B — Local mesh (docker-compose)

### Prereqs
- Docker Desktop
- Node 18+ (if developing outside containers)

### Bring up the platform
```bash
docker compose -f docker-compose.nurds.yaml up -d redis nurdscode-worker nurdscode-frontend
```

### Bring up the II core services (if available)
```bash
docker compose -f docker-compose.nurds.yaml --profile ii up -d
```

### Notes
- The compose file is designed to be a single entrypoint for the platform plus II repos.
- Services under `profiles: [stub]` are scaffolds and should be wired to real images/commands once Dockerfiles and ports are finalized.

## 3) Option C — Chained pipeline (Cloud Run for heavy services)

### What runs where
- Cloudflare Workers remains the gateway.
- Heavy agents/services run on Cloud Run (or any container platform).

### Steps (high-level)
1. Build and deploy each agent/service container to Cloud Run.
2. Record service URLs.
3. Configure Worker env vars (for example `II_*_URL`) to point at those URLs.
4. Verify `health` endpoints and make a test request via the Worker gateway.

## 4) Required configuration knobs

### Nurds edge API
- `FIRECRAWL_API_KEY` (for SCOUT/FIND web search)
- Provider keys depending on routing: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY`

### II repos
- Many services expect their own `.env`/config. Start from each repo’s `README.md` under `Nurds_Code_Dot_Com/services/intelligent-internet/`.

## 5) Smoke tests

- Frontend: `http://localhost:5173`
- Worker: `http://localhost:8787`
- ACHEEVY SCOUT: run a SCOUT action in the dashboard and confirm sources render.
