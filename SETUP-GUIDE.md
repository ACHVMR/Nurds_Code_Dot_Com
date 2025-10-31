# 🚀 Nurds Code - Complete Setup Guide

## Production-Grade Deployment with Maximum Cloudflare + Supabase Integration

**Last Updated:** October 30, 2025  
**Deployment Path:** Option B (Production-Grade)  
**Estimated Time:** 2-3 hours

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Cloudflare account with Workers subscription
- [ ] Supabase account (free tier works)
- [ ] Stripe account with live keys
- [ ] API keys for AI providers (see `.env` file)
- [ ] PowerShell 7+ (for Windows scripts)
- [ ] Docker Desktop (optional, for local development)

---

## 🎯 Step 1: Initial Setup

### Clone & Install

```powershell
# Clone repository
git clone https://github.com/ACHVMR/Nurds_Code_Dot_Com.git
cd Nurds_Code_Dot_Com

# Install dependencies
npm install

# Install Supabase CLI (optional for local development)
npm install -g supabase

# Verify installations
node --version
npm --version
npx wrangler --version
```

---

## 🔐 Step 2: Environment Configuration

### A. Copy Environment Template

The `.env` file has already been created with your API keys. Verify all values:

```powershell
# View environment variables
Get-Content .env | Select-String -Pattern "API_KEY|SECRET|URL" | ForEach-Object { $_.Line }
```

### B. Update Cloudflare-Specific Values

Edit `.env` and add:

```bash
# Get your Cloudflare Account ID from: https://dash.cloudflare.com
AI_GATEWAY_ACCOUNT_ID=your_account_id_here

# Update AI Gateway URL
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/nurdscode-gateway
```

---

## ☁️ Step 3: Cloudflare Setup

### A. Configure AI Gateway

1. Go to [Cloudflare Dashboard > AI > AI Gateway](https://dash.cloudflare.com)
2. Click **Create Gateway**
3. Name: `nurdscode-gateway`
4. Add providers:
   - **OpenAI** → Use for Pro tier
   - **Anthropic** → Use for Enterprise tier
   - **Groq** → Use as fallback
5. Copy gateway URL and update `.env`

### B. Create KV Namespaces & R2 Buckets

```powershell
# Run automated setup script
npm run setup:storage

# This creates:
# - KV: CACHE (dev + prod)
# - KV: SESSIONS (dev + prod)
# - R2: nurdscode-assets (dev + prod)
```

**IMPORTANT:** Copy the KV namespace IDs from the script output and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your_cache_namespace_id_here"

[[kv_namespaces]]
binding = "SESSIONS"
id = "your_sessions_namespace_id_here"
```

### C. Set Cloudflare Secrets

```powershell
# Run automated secrets setup
npm run setup:secrets

# This sets all sensitive environment variables as Worker secrets:
# - STRIPE_SECRET_KEY
# - JWT_SECRET
# - SUPABASE_SERVICE_ROLE_KEY
# - GROQ_API_KEY
# - OPENAI_API_KEY
# - ANTHROPIC_API_KEY
# - OPENROUTER_API_KEY
# ... and more
```

---

## 🗄️ Step 4: Supabase Setup

### A. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Name: `nurdscode`
4. Region: Choose closest to your users
5. Database password: Copy from `.env` (`POSTGRES_PASSWORD`)
6. Copy **Project URL** and **Anon Key** to `.env`

### B. Run Database Migration

```powershell
# Option 1: Using Supabase CLI (recommended)
supabase db push

# Option 2: Using psql directly
psql $env:SUPABASE_URL -f supabase_schema.sql

# Option 3: Manually via Supabase Dashboard
# 1. Go to SQL Editor in Supabase Dashboard
# 2. Copy contents of supabase_schema.sql
# 3. Execute in SQL Editor
```

### C. Verify Tables Created

```powershell
# Connect to Supabase and list tables
psql $env:SUPABASE_URL -c "\dt"

# Expected tables:
# - tenants
# - users
# - subscriptions
# - projects
# - chat_history
# - api_usage
# - plugs
```

### D. Enable Realtime

1. Go to **Database > Replication** in Supabase Dashboard
2. Enable replication for:
   - `chat_history` (for live chat updates)
   - `projects` (for collaborative editing)

---

## 💳 Step 5: Stripe Configuration

### A. Get API Keys

1. Go to [Stripe Dashboard > Developers > API Keys](https://dashboard.stripe.com/apikeys)
2. Copy **Publishable Key** → Update `VITE_STRIPE_PUBLISHABLE_KEY` in `.env`
3. Copy **Secret Key** → Already set via secrets script

### B. Create Products & Prices

```powershell
# Install Stripe CLI
choco install stripe-cli

# Login to Stripe
stripe login

# Create products
stripe products create --name="Buy Me a Coffee ☕" --description="Monthly coffee support"
stripe products create --name="Pro" --description="Professional tier with GPT-4o mini"
stripe products create --name="Enterprise" --description="Enterprise tier with Claude 3.5"

# Create recurring prices
stripe prices create --product=prod_COFFEE_ID --unit-amount=700 --currency=usd --recurring[interval]=month
stripe prices create --product=prod_PRO_ID --unit-amount=2900 --currency=usd --recurring[interval]=month
stripe prices create --product=prod_ENTERPRISE_ID --unit-amount=9900 --currency=usd --recurring[interval]=month

# Copy price IDs and update src/pages/Subscribe.jsx:
# price_coffee: "price_xxx"
# price_pro: "price_yyy"
# price_enterprise: "price_zzz"
```

### C. Configure Webhook

1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add Endpoint**
3. URL: `https://YOUR_WORKER_URL.workers.dev/api/webhook`
4. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy **Signing Secret** → Already set via secrets script

---

## 🚀 Step 6: Deploy to Cloudflare

### A. Deploy Worker (Backend)

```powershell
# Development deploy
npm run worker:dev

# Test locally at http://localhost:8787

# Staging deploy
npm run worker:deploy:staging

# Production deploy
npm run worker:deploy:prod

# Verify deployment
curl https://YOUR_WORKER_URL.workers.dev/health
```

### B. Deploy Frontend (Pages)

#### Option 1: GitHub Integration (Recommended)

1. Push code to GitHub:
   ```powershell
   git add .
   git commit -m "feat: production-ready deployment with Supabase"
   git push origin main
   ```

2. Go to [Cloudflare Dashboard > Pages](https://dash.cloudflare.com)
3. Click **Create a project** → **Connect to Git**
4. Select `ACHVMR/Nurds_Code_Dot_Com`
5. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
6. Environment variables:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   VITE_API_URL=https://YOUR_WORKER_URL.workers.dev
   VITE_SUPABASE_URL=https://vmjaqaqeldomfozauhvm.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
7. Click **Save and Deploy**

#### Option 2: Manual Deploy

```powershell
# Build frontend
npm run build

# Deploy to Pages
npx wrangler pages deploy dist --project-name=nurdscode

# Output will show: https://abc123.nurdscode.pages.dev
```

### C. Configure Custom Domains

```powershell
# Add domain to Worker
npx wrangler publish --route "api.nurdscode.com/*"

# Add domain to Pages (via Dashboard)
# 1. Pages > nurdscode > Custom domains
# 2. Add: nurdscode.com
# 3. Add: www.nurdscode.com
```

---

## 🧪 Step 7: Testing & Validation

### A. Health Checks

```powershell
# Test Worker health
curl https://api.nurdscode.com/health

# Test frontend loads
curl -I https://nurdscode.com

# Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" https://vmjaqaqeldomfozauhvm.supabase.co/rest/v1/tenants
```

### B. End-to-End Flow

1. **Subscription Test:**
   - Go to `https://nurdscode.com/subscribe`
   - Select "Buy Me a Coffee ☕" tier
   - Use test card: `4242 4242 4242 4242`
   - Verify redirect to `/success`
   - Check Supabase: `SELECT * FROM subscriptions;`

2. **Assistant Test:**
   - Go to `https://nurdscode.com/editor`
   - Select "Pro" plan
   - Type: "How do I deploy a Cloudflare Worker?"
   - Verify response uses GPT-4o mini
   - Check Supabase: `SELECT * FROM chat_history ORDER BY created_at DESC LIMIT 5;`

3. **Webhook Test:**
   ```powershell
   stripe listen --forward-to https://api.nurdscode.com/api/webhook
   stripe trigger checkout.session.completed
   ```

---

## 🐳 Step 8: Docker Setup (Optional for Local Dev)

### A. Start Docker Environment

```powershell
# Start all services (frontend, worker, Redis, Supabase, monitoring)
npm run docker:up

# View logs
npm run docker:logs

# Services available at:
# - Frontend: http://localhost:5173
# - Worker: http://localhost:8787
# - Redis: localhost:6379
# - Supabase: localhost:5432
# - Grafana: http://localhost:3000
```

### B. Stop Docker Environment

```powershell
npm run docker:down
```

---

## 📊 Step 9: Monitoring & Observability

### A. Cloudflare Analytics

1. Go to **Workers & Pages > nurdscode-api > Metrics**
2. Monitor:
   - Requests per minute
   - Error rate
   - CPU time
   - Bandwidth

### B. Supabase Monitoring

1. Go to **Supabase Dashboard > Reports**
2. Monitor:
   - API requests
   - Database size
   - Active connections

### C. Optional: Grafana Setup

```powershell
# Grafana runs in Docker Compose
# Access at: http://localhost:3000
# Default login: admin / admin

# Add Cloudflare data source
# Add Supabase data source
# Import dashboard from monitoring/grafana-dashboard.json
```

---

## 🔄 Step 10: Open VS Code Workspace

### A. Open Workspace

```powershell
# Open workspace file
code nurdscode.code-workspace
```

### B. Run Dev Servers via Tasks

1. Press `Ctrl+Shift+P`
2. Type: "Run Task"
3. Select: "🚀 Dev Server (Vite)" → Frontend starts at http://localhost:5173
4. Open another task: "🌩 Wrangler Dev (Worker)" → Backend starts at http://localhost:8787

### C. Start Coding

- All extensions auto-install on first launch
- Tailwind IntelliSense active for CSS
- Wrangler CLI integrated in terminal
- ESLint + Prettier auto-format on save

---

## 🧩 Step 11: Integration for Other Use Cases

### A. VS Code Extension

```javascript
import { VibeSDK } from './src/sdk/vibesdk.js';

const sdk = new VibeSDK({
  env: {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AI_GATEWAY_URL: process.env.AI_GATEWAY_URL
  },
  defaultPlan: 'pro'
});

const response = await sdk.sendMessage('How do I deploy a Worker?');
console.log(response.message);
```

### B. Discord Bot

```javascript
import { VibeSDK } from './src/sdk/vibesdk.js';

const botSDK = new VibeSDK({ env: process.env, defaultPlan: 'free' });

client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!ask')) {
    const query = message.content.replace('!ask', '').trim();
    const response = await botSDK.sendMessage(query);
    await message.reply(response.message);
  }
});
```

See `src/sdk/vibesdk.js` for more integration examples (Slack, Electron, etc.)

---

## ✅ Success Criteria

You're **100% production-ready** when:

- [x] All environment variables configured
- [x] Cloudflare Worker deployed and accessible
- [x] Frontend deployed to Pages
- [x] Supabase database migrated with all tables
- [x] Stripe webhooks receiving events
- [x] KV namespaces and R2 buckets created
- [x] Test subscription completes successfully
- [x] Assistant responds correctly for all tiers
- [x] No errors in Worker logs for 1 hour
- [x] Monitoring dashboards showing data

---

## 🆘 Troubleshooting

### Issue: Worker fails to deploy

**Solution:**
```powershell
# Check for syntax errors
npm run build

# Verify secrets are set
npx wrangler secret list

# Deploy with verbose logging
npx wrangler deploy workers/api.js --verbose
```

### Issue: Supabase connection fails

**Solution:**
```powershell
# Verify URL and keys
echo $env:SUPABASE_URL
echo $env:SUPABASE_SERVICE_ROLE_KEY

# Test connection
psql $env:SUPABASE_URL -c "SELECT 1;"
```

### Issue: AI Gateway not routing correctly

**Solution:**
1. Verify account ID in `AI_GATEWAY_URL`
2. Check AI Gateway dashboard for request logs
3. Ensure provider integrations are active

---

## 📞 Support

- **Documentation:** [README.md](./README.md), [PRD.md](./PRD.md)
- **Deployment Guide:** [PRODUCTION-DEPLOYMENT.md](./PRODUCTION-DEPLOYMENT.md)
- **GitHub Issues:** https://github.com/ACHVMR/Nurds_Code_Dot_Com/issues
- **Email:** support@nurdscode.com

---

## 🎉 You're Ready!

Your Nurds Code platform is now:

✅ **Production-Grade** - Supabase multi-tenancy + RLS  
✅ **Maximized Cloudflare** - AI Gateway + KV + R2 + Durable Objects  
✅ **Multi-Use-Case Ready** - VibeSDK for VS Code, Discord, Slack, etc.  
✅ **Fully Monitored** - Analytics + Logging + Alerting  
✅ **Docker-Ready** - Local development environment  
✅ **CI/CD Enabled** - GitHub Actions automated deployments  

**Next:** Start coding, iterate fast, and scale globally! 🚀
