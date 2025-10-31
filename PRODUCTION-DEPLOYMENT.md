# 🚀 Production Deployment Guide

## Nurds Code - Cloudflare VibeSDK Deployment

**Last Updated:** October 30, 2025  
**Estimated Deployment Time:** 2-3 hours

---

## 📋 Pre-Deployment Checklist

### Required Accounts & Access

- [ ] Cloudflare account with Workers enabled
- [ ] Cloudflare Pages access
- [ ] Stripe account (Live mode keys)
- [ ] Groq API account (for Free/Coffee tiers)
- [ ] OpenRouter account (optional fallback)
- [ ] Domain DNS control (nurdscode.com)

### Local Environment Setup

```powershell
# Clone repository
git clone https://github.com/ACHVMR/Nurds_Code_Dot_Com.git
cd Nurds_Code_Dot_Com

# Install dependencies
npm install

# Copy environment template
Copy-Item .env.example .env
```

---

## 🔧 Configuration Steps

### 1. Cloudflare D1 Database Setup

```powershell
# Create production database
npx wrangler d1 create nurdscode_db

# Output example:
# [[d1_databases]]
# binding = "DB"
# database_name = "nurdscode_db"
# database_id = "abc123-def456-ghi789"
```

**Action:** Copy the `database_id` and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "nurdscode_db"
database_id = "YOUR_ACTUAL_DATABASE_ID_HERE"
```

### 2. Run Database Migration

```powershell
# Execute schema
npx wrangler d1 execute nurdscode_db --file=./schema.sql --remote

# Verify tables created
npx wrangler d1 execute nurdscode_db --command="SELECT name FROM sqlite_master WHERE type='table';" --remote
```

**Expected Output:**
```
users
subscriptions
projects
api_usage
chat_history
```

### 3. Stripe Configuration

#### A. Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy **Publishable Key** (starts with `pk_live_`)
3. Copy **Secret Key** (starts with `sk_live_`)

#### B. Create Webhook Endpoint

1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add Endpoint**
3. Set URL: `https://your-worker-url.workers.dev/api/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy **Signing Secret** (starts with `whsec_`)

#### C. Create Price IDs

```bash
# Free tier (manual assignment)
# No Stripe price needed

# Coffee tier - $5/month
stripe prices create \
  --unit-amount 500 \
  --currency usd \
  --recurring[interval]=month \
  --product_data[name]="Coffee Tier"

# Pro tier - $25/month
stripe prices create \
  --unit-amount 2500 \
  --currency usd \
  --recurring[interval]=month \
  --product_data[name]="Pro Tier"

# Enterprise tier - $99/month
stripe prices create \
  --unit-amount 9900 \
  --currency usd \
  --recurring[interval]=month \
  --product_data[name]="Enterprise Tier"
```

Save these Price IDs for frontend configuration.

### 4. LLM Provider Configuration

#### Groq (Required for Free/Coffee)

1. Sign up at [console.groq.com](https://console.groq.com)
2. Create API key
3. Save for Wrangler secrets

#### Cloudflare AI Gateway (Required for Pro/Enterprise)

1. Go to [Cloudflare Dashboard > AI > AI Gateway](https://dash.cloudflare.com)
2. Create new gateway: `nurdscode-gateway`
3. Add providers:
   - **OpenAI** (for Pro tier)
   - **Anthropic** (for Enterprise tier)
   - **Groq** (fallback)
4. Copy gateway URL format:
   ```
   https://gateway.ai.cloudflare.com/v1/<account_id>/nurdscode-gateway
   ```

#### OpenRouter (Optional Fallback)

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Create API key
3. Save for Wrangler secrets

### 5. Set Wrangler Secrets

```powershell
# Stripe secrets
npx wrangler secret put STRIPE_SECRET_KEY
# Paste: sk_live_...

npx wrangler secret put STRIPE_WEBHOOK_SECRET
# Paste: whsec_...

# JWT secret (generate random 256-bit key)
npx wrangler secret put JWT_SECRET
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# LLM provider keys
npx wrangler secret put GROQ_API_KEY
# Paste: gsk_...

npx wrangler secret put OPENROUTER_API_KEY
# Paste: sk-or-v1-...

# AI Gateway URL
npx wrangler secret put AI_GATEWAY_URL
# Paste: https://gateway.ai.cloudflare.com/v1/<account>/nurdscode-gateway
```

### 6. Update Environment Variables

Edit `wrangler.toml`:

```toml
[vars]
STRIPE_PUBLISHABLE_KEY = "pk_live_YOUR_KEY_HERE"
```

### 7. Frontend Environment Variables

Create `.env.production`:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
VITE_API_URL=https://nurdscode-api.workers.dev
```

---

## 🚢 Deployment Process

### Step 1: Build Frontend

```powershell
# Install dependencies
npm install

# Build production bundle
npm run build

# Output: dist/ folder
```

### Step 2: Deploy Cloudflare Worker

```powershell
# Deploy API Worker
npm run worker:deploy

# Output example:
# Total Upload: 45.67 KiB / gzip: 12.34 KiB
# Uploaded nurdscode-api (1.23 sec)
# Published nurdscode-api (0.45 sec)
# https://nurdscode-api.workers.dev
```

**Save this URL** - you'll need it for:
1. Stripe webhook configuration
2. Frontend API URL
3. Custom domain mapping

### Step 3: Deploy Frontend to Cloudflare Pages

#### Option A: GitHub Integration (Recommended)

1. Go to [Cloudflare Dashboard > Pages](https://dash.cloudflare.com)
2. Click **Create a project**
3. Connect GitHub repository: `ACHVMR/Nurds_Code_Dot_Com`
4. Configure build:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
5. Add environment variables:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   VITE_API_URL=https://nurdscode-api.workers.dev
   ```
6. Click **Save and Deploy**

#### Option B: Manual Deploy

```powershell
# Deploy to Pages
npx wrangler pages deploy dist --project-name=nurdscode

# Output:
# ✨ Success! Uploaded 42 files (3.45 sec)
# ✨ Deployment complete! Take a peek over at https://abc123.nurdscode.pages.dev
```

### Step 4: Configure Custom Domain

#### For Workers (API)

```powershell
# Add custom route
npx wrangler publish --route "api.nurdscode.com/*"
```

Or via Cloudflare Dashboard:
1. Workers & Pages > nurdscode-api > Settings > Triggers
2. Add Custom Domain: `api.nurdscode.com`
3. DNS will be auto-configured

#### For Pages (Frontend)

1. Pages > nurdscode > Custom domains
2. Add domain: `nurdscode.com`
3. Add domain: `www.nurdscode.com`
4. Cloudflare will auto-configure DNS

### Step 5: Update Stripe Webhook URL

1. Go back to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Edit your webhook endpoint
3. Change URL to: `https://api.nurdscode.com/api/webhook`
4. Test endpoint: Send test webhook

---

## ✅ Post-Deployment Verification

### 1. Test Health Endpoints

```powershell
# Test Worker is live
curl https://api.nurdscode.com/api/health

# Test frontend loads
curl -I https://nurdscode.com
```

### 2. Test Subscription Flow

1. Go to `https://nurdscode.com/subscribe`
2. Select **Coffee** tier
3. Enter test email: `test@example.com`
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete checkout
6. Verify redirect to `/success`
7. Check D1 database:
   ```powershell
   npx wrangler d1 execute nurdscode_db --command="SELECT * FROM subscriptions;" --remote
   ```

### 3. Test Vibe Assistant

1. Go to `https://nurdscode.com/editor`
2. Select **Pro** plan from dropdown
3. Type: "How do I deploy a Cloudflare Worker?"
4. Verify assistant responds with relevant guidance
5. Check chat history persisted:
   ```powershell
   npx wrangler d1 execute nurdscode_db --command="SELECT * FROM chat_history ORDER BY created_at DESC LIMIT 5;" --remote
   ```

### 4. Verify Provider Routing

```powershell
# Check Worker logs
npx wrangler tail nurdscode-api

# Trigger chat request and verify log output shows correct provider:
# [CHAT] { plan: 'free', provider: 'groq', model: 'llama3-8b-8192' }
# [CHAT] { plan: 'pro', provider: 'openai', model: 'gpt-4o-mini' }
```

---

## 🔍 Monitoring & Observability

### Cloudflare Analytics

1. **Workers Analytics**
   - Go to: Workers & Pages > nurdscode-api > Metrics
   - Monitor: Requests, Errors, CPU time, Bandwidth

2. **Pages Analytics**
   - Go to: Pages > nurdscode > Analytics
   - Monitor: Visits, Page views, Load time

### Custom Logging

Add to `workers/api.js`:

```javascript
async function logEvent(env, event, data) {
  await env.DB.prepare(
    'INSERT INTO api_usage (user_id, endpoint, requests_count, date) VALUES (?, ?, ?, ?)'
  ).bind(data.userId || 'anonymous', event, 1, new Date().toISOString().split('T')[0]).run();
}

// Use in handlers:
await logEvent(env, '/api/chat', { userId: user.id });
```

### Error Tracking

Integrate Sentry (optional):

```javascript
import * as Sentry from '@sentry/cloudflare';

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: 'production'
});
```

---

## 🐛 Troubleshooting

### Issue: Webhook Failing

**Symptoms:**
- Subscription completes but user not created
- Webhook endpoint returns 400/500

**Solutions:**
1. Check Stripe signing secret matches:
   ```powershell
   npx wrangler secret list
   ```
2. Verify webhook event types selected
3. Test with Stripe CLI:
   ```powershell
   stripe listen --forward-to https://api.nurdscode.com/api/webhook
   stripe trigger checkout.session.completed
   ```

### Issue: Assistant Not Responding

**Symptoms:**
- Loading spinner never stops
- Console error: "Failed to fetch"

**Solutions:**
1. Check CORS headers in worker
2. Verify AI Gateway URL is correct:
   ```powershell
   npx wrangler secret list
   ```
3. Test provider directly:
   ```powershell
   curl -X POST https://api.groq.com/openai/v1/chat/completions \
     -H "Authorization: Bearer $GROQ_API_KEY" \
     -d '{"model":"llama3-8b-8192","messages":[{"role":"user","content":"test"}]}'
   ```

### Issue: Database Connection Failed

**Symptoms:**
- Worker crashes with "DB is not defined"
- 500 error on chat/subscription endpoints

**Solutions:**
1. Verify D1 binding in `wrangler.toml`
2. Check database exists:
   ```powershell
   npx wrangler d1 list
   ```
3. Verify migration ran:
   ```powershell
   npx wrangler d1 execute nurdscode_db --command="SELECT name FROM sqlite_master;" --remote
   ```

---

## 🔄 Rollback Procedure

### If Critical Issue Detected:

#### 1. Rollback Worker

```powershell
# List deployments
npx wrangler deployments list --name=nurdscode-api

# Rollback to previous version
npx wrangler rollback --name=nurdscode-api --version=<previous-version-id>
```

#### 2. Rollback Pages

1. Go to: Pages > nurdscode > Deployments
2. Find previous working deployment
3. Click **⋯** > **Rollback to this deployment**

#### 3. Emergency Database Restore

```powershell
# If you have backup SQL:
npx wrangler d1 execute nurdscode_db --file=./backup.sql --remote
```

---

## 📊 Performance Benchmarks

### Expected Metrics (Production)

| Metric | Target | Acceptable | Red Flag |
|--------|--------|-----------|----------|
| Worker Response Time | < 100ms | < 500ms | > 1s |
| Chat API Response | < 2s | < 5s | > 10s |
| Page Load (FCP) | < 1s | < 2s | > 3s |
| Error Rate | < 0.1% | < 1% | > 5% |
| Worker CPU Time | < 10ms | < 50ms | > 100ms |

### Load Testing

```powershell
# Install k6
choco install k6

# Run load test
k6 run load-test.js
```

**load-test.js:**
```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
};

export default function () {
  const res = http.post('https://api.nurdscode.com/api/chat', JSON.stringify({
    message: 'Test message',
    plan: 'pro',
    history: []
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
}
```

---

## 🎯 Success Criteria

**Deployment is successful when:**

- [x] All secrets configured without errors
- [x] Database migration completed successfully
- [x] Worker deployed and accessible
- [x] Frontend deployed and accessible
- [x] Custom domains configured and SSL active
- [x] Stripe webhook receiving events
- [x] Test subscription completes end-to-end
- [x] Assistant responds correctly for all tiers
- [x] No errors in Worker logs for 1 hour
- [x] Performance metrics within acceptable range

---

## 📞 Support & Escalation

### Internal Team Contacts

- **DevOps Lead:** [Your Name]
- **Backend Engineer:** [Team Contact]
- **On-Call Rotation:** [PagerDuty/Slack Channel]

### Vendor Support

- **Cloudflare Support:** https://support.cloudflare.com
- **Stripe Support:** https://support.stripe.com
- **Groq Support:** support@groq.com

### Emergency Hotline

For production incidents:
1. Check status pages:
   - https://www.cloudflarestatus.com
   - https://status.stripe.com
2. Post in #incidents Slack channel
3. Page on-call engineer

---

## 🔐 Security Checklist

- [ ] All secrets stored in Wrangler, not committed to git
- [ ] JWT secret is 256-bit random value
- [ ] Stripe webhook signature validation enabled
- [ ] CORS restricted to production domain
- [ ] Rate limiting configured on `/api/chat`
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (React auto-escaping)
- [ ] HTTPS enforced on all endpoints
- [ ] Environment variables scoped per environment
- [ ] API keys rotated from test values

---

**Document Owner:** Nurds Code DevOps Team  
**Last Updated:** October 30, 2025  
**Next Review:** November 30, 2025
