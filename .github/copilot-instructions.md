# NURDS Code - Copilot Instructions

## Architecture Overview

**Hybrid Edge + Cloud Platform** with Cloudflare Workers as edge API gateway, React/Vite frontend, and GCP Cloud Run for II-Agents.

```
Frontend (src/)          → Vite + React 18 + Tailwind
Edge API (workers/)      → Cloudflare Workers + D1 (SQLite)
Backend Services         → GCP Cloud Run (II-Agents)
Auth                     → Clerk (JWT verification in workers/middleware/auth.js)
Payments                 → Stripe (live keys, meter billing)
```

## Critical Concepts

### KingMode Three-Phase Workflow
All complex tasks follow **BRAINSTORM → FORMING → AGENT** phases defined in `src/sdk/kingmode.js`:
- **BRAINSTORM**: Information gathering, skill assessment
- **FORMING**: Planning, OKRs, architecture decisions
- **AGENT**: Execution using STANDARD (1 agent) / SWARM (6) / KING (7+) strategies

### II-Agents (19 Specialized Workers)
Configurations in `services/ii-agent-template/agent-configs.js`. Each agent has:
- Dedicated model assignment (Claude/GPT/Gemini/Groq)
- Memory/timeout limits
- System prompts
Key agents: `nlu`, `codegen`, `research`, `validation`, `security`, `reasoning`, `deploy`

### Boomer_Ang Identity System
AI agents use KYB (Know Your Bot) identity from `src/sdk/kyb.js`:
- **BOOMER_ANG_REGISTRY**: Predefined agent definitions
- Public Passport → Flight Recorder → Anchor Chain (three-tier trust)
- Exposed at `/.well-known/kyb` endpoint

### Plus 1 Team Plan & DIFU Credits
Rideshare-style billing in `workers/plus1-api.js`:
- **Pricing**: Base plan + $1/collaborator/day
- **DIFU**: Internal credit system (balance, transfer between users)
- **Routes**: `/api/plus1/subscription/*`, `/api/plus1/difu/*`, `/api/plus1/collaborator/*`

### Stripe Metered Billing
Usage-based billing via `STRIPE_METER_ID` (mk_1SmnFUHW9f80DXRWMWHZ4VRQ):
```javascript
// Report usage event to Stripe
const stripe = new Stripe(env.STRIPE_SECRET_KEY);
await stripe.billing.meterEvents.create({
  event_name: 'api_requests',
  payload: { stripe_customer_id: customerId, value: tokenCount },
});
```
Meter events tracked per API call; billed monthly.

### Cloud Run Jobs (II-Agents)
ACHEEVY Hub (`services/acheevy-hub/`) orchestrates 19 agents on GCP Cloud Run:
- **Project**: `nurds-code-prod`, **Region**: `us-central1`
- Agent URLs set via env: `II_CODEGEN_URL`, `II_NLU_URL`, etc.
- Deploy agents: `gcloud run deploy ii-{agent}-worker --image gcr.io/nurds-code-prod/ii-agent:{agent}`
- Hub routes tasks through KingMode phases, calls agents via HTTP

## Key File Patterns

| Pattern | Location | Purpose |
|---------|----------|---------|
| Worker Routes | `workers/routes/*.js` | Edge API endpoints (itty-router) |
| Worker Middleware | `workers/middleware/*.js` | Auth, CORS, module access |
| D1 Migrations | `workers/migrations/*.sql` | Schema changes (run with wrangler) |
| React Pages | `src/pages/*.jsx` | Route components |
| SDKs | `src/sdk/*.js` | KingMode, KYB, VibeSDK |
| Module Manifests | `src/config/moduleManifests.js` | Feature flag definitions |

## Developer Commands

```bash
# Frontend dev (port 3002, proxies /api to 8787)
npm run dev

# Worker local dev (port 8787)
npm run worker:dev

# Deploy worker to Cloudflare
npx wrangler deploy

# Run D1 migration
npx wrangler d1 execute nurdscode-db --file=workers/migrations/0001_modules_registry.sql --remote
```

## API Request Pattern

Frontend uses `fetchAuthed` wrapper from `src/utils/fetchAuthed.js`:
```javascript
import { fetchAuthed } from '../utils/fetchAuthed';
const res = await fetchAuthed('/api/v1/chat', { method: 'POST', body: JSON.stringify(data) });
```
This auto-injects Clerk JWT token. Worker validates in `workers/middleware/auth.js`.

## Adding New Worker Routes

1. Create `workers/routes/myfeature.js` exporting an itty-router
2. Import and mount in `workers/index.js`:
   ```javascript
   import { myfeatureRouter } from './routes/myfeature.js';
   router.all('/api/v1/myfeature/*', myfeatureRouter.handle);
   ```
3. Deploy: `npx wrangler deploy`

## Environment & Secrets

- **wrangler.toml**: Non-secret vars (STRIPE_PUBLISHABLE_KEY, ACHEEVY_HUB_URL)
- **wrangler secret**: Sensitive values (run `npx wrangler secret put SECRET_NAME`)
- **D1 Database**: Binding name `DB`, database `nurdscode-db`
- **AI Binding**: `AI` for Cloudflare Workers AI (OCR, embeddings)

## ACHEEVY UI Components

Located in `src/components/acheevy/`:
- `ACHEEVYDashboard.jsx` - Agent fleet grid, configuration panel
- `AgentOrchestrator.jsx` - Visual workflow builder
- `AgentMonitor.jsx` - Real-time metrics and logs

Dashboard accessible at `/acheevy-dashboard` (protected route).

## Conventions

- Use `framer-motion` for animations in React components
- All worker responses via `jsonResponse()` from `workers/utils/responses.js`
- D1 queries use prepared statements: `env.DB.prepare(sql).bind(...args).run()`
- Agent model selection routed through ORACLE (`workers/services/oracle.js`)
- Module access gated by D1 `user_modules` table (see `withModuleAccess` middleware)
