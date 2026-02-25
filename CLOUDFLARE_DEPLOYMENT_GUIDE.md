# Cloudflare-Only Backend Deployment Guide

## Overview
This guide walks you through deploying the NURDS CODE backend as a pure Cloudflare solution using Workers and D1 database.

**Architecture:**
- ✅ **Cloudflare Workers** - API Gateway & Light compute
- ✅ **Cloudflare D1** - Serverless SQL database
- ✅ **Cloudflare Workers AI** - (Optional) On-demand AI capabilities
- ❌ **GCP Cloud Run** - Disabled for Cloudflare-only deployment

---

## Prerequisites

1. **Cloudflare Account** with Workers subscription
2. **Wrangler CLI** installed: `npm install -g wrangler`
3. **Node.js 20+** installed
4. **Domain** (optional, for custom domain)

---

## Step 1: Authenticate with Cloudflare

```bash
# Login to Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

---

## Step 2: Create D1 Database (If needed)

The database is already configured in `wrangler.toml`:
- **Name:** `nurds-core-db`
- **ID:** `e69e006b-5748-4ed2-b823-943db3cc0759`

If you need to create a new one:

```bash
# Create new D1 database
wrangler d1 create nurds-core-db

# Copy the database_id from output and update wrangler.toml
```

---

## Step 3: Run Database Migrations

Apply the initial schema to create tables:

```bash
# Apply basic tables
wrangler d1 execute nurds-core-db --file=workers/migrations/0000_init.sql --remote

# Apply orchestrator tables
wrangler d1 execute nurds-core-db --file=workers/migrations/0008_orchestrator_v2.sql --remote

# Verify tables were created
wrangler d1 execute nurds-core-db --command="SELECT name FROM sqlite_master WHERE type='table'" --remote
```

**Expected tables:**
- `user_settings`
- `circuit_plugs`
- `agent_tasks_v2`
- `model_usage_v2`
- `workflow_steps_v2`
- `kingmode_context`
- `session_artifacts`

---

## Step 4: Configure Environment Variables

No secrets needed for basic deployment! The current configuration works out of the box.

**Optional:** If you want to add API keys for future AI integration:

```bash
# For Cloudflare AI (built-in, no key needed)
# For external AI providers (optional)
wrangler secret put OPENROUTER_API_KEY
wrangler secret put GROQ_API_KEY
```

---

## Step 5: Deploy the Worker

```bash
# Build and deploy
wrangler deploy

# Expected output:
# Total Upload: XX.XX KiB / gzip: XX.XX KiB
# Uploaded nurds-platform-api (X.XX sec)
# Published nurds-platform-api (X.XX sec)
#   https://nurds-platform-api.<your-subdomain>.workers.dev
```

**Your API will be live at:** `https://nurds-platform-api.<your-subdomain>.workers.dev`

---

## Step 6: Update Frontend Configuration

Update the Flutter app to point to your deployed Worker:

**File:** `frontend/lib/config.dart`

```dart
class Config {
  static const String apiUrl = "https://nurds-platform-api.<your-subdomain>.workers.dev";
  static const String wsUrl = "wss://nurds-platform-api.<your-subdomain>.workers.dev/ws/swarm";
}
```

---

## Step 7: Test the Deployment

### Test API Status
```bash
curl https://nurds-platform-api.<your-subdomain>.workers.dev/api/status
```

**Expected response:**
```json
{
  "status": "ONLINE",
  "version": "1.0.0",
  "edge": "Cloudflare"
}
```

### Test User Settings (POST)
```bash
curl -X POST https://nurds-platform-api.<your-subdomain>.workers.dev/api/user/settings \
  -H "Content-Type: application/json" \
  -d '{"theme": "dark", "notifications": true}'
```

**Expected response:**
```json
{"success": true}
```

### Test User Settings (GET)
```bash
curl https://nurds-platform-api.<your-subdomain>.workers.dev/api/user/settings
```

**Expected response:**
```json
{"theme": "dark", "notifications": true}
```

---

## Step 8: Monitor Your Worker

```bash
# View live logs
wrangler tail

# View deployment info
wrangler deployments list

# View D1 database info
wrangler d1 info nurds-core-db
```

---

## Architecture: What's Running

```
┌─────────────────────────────────────────────────────┐
│              CLOUDFLARE-ONLY BACKEND                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend (Flutter)                                 │
│  └─> https://your-domain.com                        │
│       │                                             │
│       ├──> Cloudflare Workers (API)                 │
│       │    └─> nurds-platform-api.workers.dev      │
│       │         ├─> /api/status                     │
│       │         ├─> /api/user/settings             │
│       │         └─> /api/orchestrate               │
│       │              │                              │
│       │              └─> Cloudflare D1 Database    │
│       │                  └─> nurds-core-db         │
│       │                       ├─> user_settings    │
│       │                       ├─> circuit_plugs    │
│       │                       └─> session_artifacts│
│       │                                             │
│       └──> Cloudflare Pages/CDN (Static Assets)    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Current Limitations (Cloudflare-Only Mode)

The `/api/orchestrate` endpoint currently proxies to an external agent runtime. In Cloudflare-only mode:

1. **Option A:** Orchestrate endpoint returns a placeholder response
2. **Option B:** Use Cloudflare Workers AI for basic AI features
3. **Option C:** Add GCP Cloud Run later for heavy compute

**Recommended:** Start with Option A, then enhance with Cloudflare Workers AI.

---

## Costs (Cloudflare Free/Paid Plans)

| Resource | Free Tier | Paid Plan |
|----------|-----------|-----------|
| Workers Requests | 100,000/day | Unlimited @ $5/mo |
| Workers CPU Time | 10ms/invocation | 50ms/invocation |
| D1 Reads | 5M rows/day | 25B rows/mo @ $0.001/M |
| D1 Writes | 100K rows/day | 50M rows/mo @ $1.00/M |
| D1 Storage | 5 GB | 5 GB (included) |

**Estimated Monthly Cost:** $5-10 for low-medium traffic

---

## Troubleshooting

### "Database not found" error
```bash
# Verify database exists
wrangler d1 list

# If missing, create it
wrangler d1 create nurds-core-db
```

### "Unauthorized" error
```bash
# Re-authenticate
wrangler logout
wrangler login
```

### "Module not found" error
```bash
# Verify main path in wrangler.toml
# Should be: main = "workers/src/index.ts"
```

### CORS issues
The worker includes CORS headers by default. If issues persist, check browser console for specific errors.

---

## Next Steps

After deployment:

1. ✅ **Test all endpoints** - Use the curl commands above
2. ✅ **Update Flutter app** - Point to your Worker URL
3. ✅ **Rebuild Flutter app** - `flutter build web`
4. ✅ **Deploy Flutter frontend** - Use Cloudflare Pages
5. ✅ **Add custom domain** - Configure in Cloudflare dashboard
6. 📊 **Monitor usage** - Check Cloudflare dashboard for metrics
7. 🚀 **Enhance with AI** - Add Cloudflare Workers AI when ready

---

## Adding Cloudflare Workers AI (Future Enhancement)

To add AI capabilities without external services:

```toml
# In wrangler.toml, add:
[ai]
binding = "AI"
```

```typescript
// In workers/src/index.ts, use:
const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
  messages: [{ role: 'user', content: 'Your prompt here' }]
});
```

**Benefits:**
- No API keys needed
- Billed per request
- Multiple models available
- Runs on Cloudflare's edge

---

## Custom Domain Setup

1. **Add domain to Cloudflare**
2. **Go to Workers & Pages** > Your worker
3. **Add custom domain:** `api.nurdscode.com`
4. **Update Flutter config** with custom domain

---

## Support & Resources

- **Cloudflare Workers Docs:** https://developers.cloudflare.com/workers/
- **Cloudflare D1 Docs:** https://developers.cloudflare.com/d1/
- **Wrangler CLI Docs:** https://developers.cloudflare.com/workers/wrangler/

---

## Status Checklist

- [x] wrangler.toml configured for Cloudflare-only
- [x] Worker source code ready
- [x] D1 database migrations prepared
- [ ] Wrangler authenticated
- [ ] D1 migrations applied
- [ ] Worker deployed
- [ ] Frontend config updated
- [ ] End-to-end testing complete

---

**You're ready to deploy! Follow the steps above and you'll have your backend live in minutes.** 🚀
