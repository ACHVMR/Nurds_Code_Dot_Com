# NURDS CODE: Deployment Guide
## Light Core + Heavy Swarm Architecture

**Architecture Summary**:
- **Light Core** (Cloudflare): Handles 95% of traffic, instant load times
- **Heavy Swarm** (GCP Cloud Run): Activates on-demand for complex tasks, scales to 0
- **Circuit Box**: Plug manager for specialized tools (Higgsfield, 12Labs, SAM, ElevenLabs)

---

## Phase 1: Deploy Light Core (Cloudflare Worker)

### Step 1: Run D1 Migration

```powershell
# Apply orchestrator tables
npx wrangler d1 execute nurds-core-db --file=workers/migrations/0008_orchestrator_v2.sql --remote

# Verify tables
npx wrangler d1 execute nurds-core-db --command="SELECT name FROM sqlite_master WHERE type='table'" --remote
```

**Expected output**: You should see tables like `circuit_plugs`, `agent_tasks_v2`, `model_usage_v2`, etc.

---

### Step 2: Add Secrets

```powershell
# Gemini API Key (for brainstorm/edit modes)
npx wrangler secret put GEMINI_API_KEY
# Paste: YOUR_GEMINI_API_KEY

# GLM API Key (for nurdout mode with visual understanding)
npx wrangler secret put GLM_API_KEY
# Paste: YOUR_GLM_API_KEY

# Google Service Account Credentials (for GCP Cloud Run)
npx wrangler secret put GOOGLE_CREDENTIALS
# Paste: {"type":"service_account","project_id":"nurds-code-gcp-prod",...}

# GROQ API Key (for Whisper voice transcription)
npx wrangler secret put GROQ_API_KEY
# Paste: YOUR_GROQ_API_KEY

# ElevenLabs API Key (for text-to-speech)
npx wrangler secret put ELEVENLABS_API_KEY
# Paste: YOUR_ELEVENLABS_API_KEY
```

---

### Step 3: Deploy Worker

```powershell
# Deploy to Cloudflare
npx wrangler deploy

# Test locally first (optional)
npx wrangler dev
```

**Expected output**: Worker deployed to `nurds-platform-api.YOUR_SUBDOMAIN.workers.dev`

---

## Phase 2: Deploy Heavy Swarm (GCP Cloud Run)

### Step 1: Authenticate with GCP

```bash
# Login to GCP
gcloud auth login

# Set project
gcloud config set project nurds-code-gcp-prod

# Verify
gcloud config get-value project
```

---

### Step 2: Build Docker Images

You'll need Docker images for each agent. Example for ACHEEVY:

```bash
# Build ACHEEVY orchestrator
cd ii-agent-repos/ii-agent
docker build -t gcr.io/nurds-code-gcp-prod/ii-agent:latest .

# Push to Google Container Registry
docker push gcr.io/nurds-code-gcp-prod/ii-agent:latest

# Repeat for other agents:
# - ii-researcher
# - codex
# - common-ground
# - symbioism
```

**Note**: See `ii-agent-dockerfile-template.md` in docs for Dockerfile examples.

---

### Step 3: Deploy Swarm

```bash
# Make script executable
chmod +x scripts/deploy-swarm.sh

# Deploy all agents
./scripts/deploy-swarm.sh
```

**Expected output**: Service URLs for each agent.

---

### Step 4: Update wrangler.toml with Service URLs

After deployment, copy the URLs and update `wrangler.toml`:

```toml
ACHEEVY_ENDPOINT = "https://acheevy-orchestrator-abc123.run.app"
II_RESEARCHER_ENDPOINT = "https://ii-researcher-abc123.run.app"
CODEX_ENDPOINT = "https://codex-agent-abc123.run.app"
COMMON_GROUND_ENDPOINT = "https://common-ground-abc123.run.app"
```

Then redeploy:

```powershell
npx wrangler deploy
```

---

## Phase 3: Wire Up Frontend

### Landing Page Integration

Update `src/pages/LandingPage.jsx` CTA buttons to call orchestrator endpoints:

```jsx
import { useState } from 'react';

function LandingPage() {
  const [loading, setLoading] = useState(false);

  const handleStartBrainstorm = async () => {
    setLoading(true);
    try {
      // Create session
      const sessionRes = await fetch('/api/v1/orchestrator/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-123', // Replace with actual user ID from Clerk
          mode: 'brainstorm',
          prompt: 'Help me build a podcast assistant app'
        })
      });
      const { sessionId } = await sessionRes.json();

      // Execute
      const execRes = await fetch('/api/v1/orchestrator/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          mode: 'brainstorm',
          input: { prompt: 'Help me build a podcast assistant app' }
        })
      });
      const result = await execRes.json();
      console.log('Brainstorm result:', result);
      
      // Navigate to result page or show in modal
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleStartBrainstorm} disabled={loading}>
        {loading ? 'Loading...' : 'Start Brainstorming'}
      </button>
      {/* Add more CTA buttons for nurdout, agent, edit modes */}
    </div>
  );
}
```

---

## Phase 4: Circuit Box Integration

### Enable/Disable Plugs

Add a settings panel where users can toggle Circuit Box plugs:

```jsx
function CircuitBoxPanel({ userId }) {
  const [plugs, setPlugs] = useState({
    higgsfield: false,
    twelve_labs: false,
    sam: false,
    elevenlabs: false
  });

  const togglePlug = async (plugName, enabled) => {
    await fetch('/api/v1/circuit-box/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plugName, enabled })
    });
    setPlugs({ ...plugs, [plugName]: enabled });
  };

  return (
    <div className="circuit-box">
      <h3>Circuit Box</h3>
      {Object.entries(plugs).map(([name, enabled]) => (
        <label key={name}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => togglePlug(name, e.target.checked)}
          />
          {name}
        </label>
      ))}
    </div>
  );
}
```

---

## Testing

### Local Testing

```powershell
# Start worker dev server
npx wrangler dev

# In another terminal, start frontend
npm run dev

# Test endpoint
curl http://localhost:8787/api/v1/orchestrator/session \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","mode":"brainstorm","prompt":"test"}'
```

---

## Monitoring

### Cloudflare Dashboard
- View worker logs: `npx wrangler tail`
- D1 analytics: [Cloudflare Dashboard](https://dash.cloudflare.com)

### GCP Cloud Run
```bash
# View logs
gcloud run services logs read acheevy-orchestrator --region=us-central1

# Check metrics
gcloud run services describe acheevy-orchestrator --region=us-central1
```

---

## Cost Optimization

**Light Core (Cloudflare)**:
- Workers: $5/mo (10M requests included)
- D1: Free tier (100K reads/day)
- R2: $0.015/GB/month

**Heavy Swarm (GCP Cloud Run)**:
- Scales to 0: **$0 when idle**
- Active: ~$0.24/hour per instance
- Expected cost: **$20-50/month** (with proper scaling)

**Total estimated cost**: **$25-60/month** for MVP

---

## Troubleshooting

### Issue: "Database not found"
**Solution**: Verify D1 database ID in `wrangler.toml` matches actual database:
```powershell
npx wrangler d1 list
```

### Issue: "GCP Cloud Run not responding"
**Solution**: Check service is deployed:
```bash
gcloud run services list --region=us-central1
```

### Issue: "Circuit plug not activating"
**Solution**: Check plug is enabled:
```bash
curl "http://localhost:8787/api/v1/circuit-box/status?userId=test&plugName=higgsfield"
```

---

## Next Steps

1. ✅ Migration created
2. ✅ Deployment script ready
3. ✅ wrangler.toml configured
4. ⏳ **Run migration** (Phase 1, Step 1)
5. ⏳ **Deploy worker** (Phase 1, Step 3)
6. ⏳ **Deploy swarm** (Phase 2, Step 3)
7. ⏳ **Wire frontend** (Phase 3)

**Ready to execute?** Start with:
```powershell
npx wrangler d1 execute nurds-core-db --file=workers/migrations/0008_orchestrator_v2.sql --remote
```
