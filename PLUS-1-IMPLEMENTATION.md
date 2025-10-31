# Plus 1 Team Plan - Complete Implementation Guide

**Status:** ✅ Fully Implemented (Commit: 9aa195e)  
**Date:** 2025-10-31  
**Architecture:** Clerk Auth + Supabase DIFU Ledger + Stripe Payments

---

## 📋 Executive Summary

The **Plus 1 Team Plan** is a rideshare-style collaborative pricing model that enables users to:

- **Host** collaborative coding sessions (base plan: $7 Coffee, $20 Lite, $50 Superior)
- **Add collaborators** for just **$1 per person per day** (like Uber/Lyft splitting)
- **Activate PiP mode** automatically on first payment (split-screen editor + video)
- **Track earnings** with DIFU digital currency ledger
- **Prepay for discounts** (weekly $6 save $1, monthly $20 unlimited)

### Key Innovation
Unlike traditional pricing tiers, Plus 1 allows any user (free tier) to join a paid session for just $1/day. The host pays nothing extra—only the collaborators pay. This dramatically lowers the barrier to team collaboration.

---

## 🏗️ Architecture Overview

### Database Schema (Supabase)

```sql
-- Migrations
0001_init.sql                    -- Base tenants, users, sessions
0002_policies.sql               -- Row-level security (RLS)
0003_collab_rideshare.sql       -- Collaboration sessions & payments
0004_clerk_difu_ledger.sql      -- Clerk sync + DIFU ledger
```

### Key Tables

#### `clerk_user_profiles`
- Syncs Clerk user identity with Supabase
- Stores: clerk_id, email, name, avatar, username
- Used for user attribution and DIFU transfers

#### `difu_accounts`
- Current DIFU balance per user
- Tier system: bronze → silver → gold → platinum → diamond
- Tracks lifetime earned/spent

#### `difu_ledger`
- Complete transaction history (immutable log)
- Transaction types: credit, debit, bonus, transfer, redeem
- Enables complete audit trail

#### `plus_1_subscriptions`
- Active subscription records
- Stores: plan, collaborator count, payment model, dates
- PiP activation flag: `pip_enabled`

#### `plus_1_collaborators`
- Roster of team members in each subscription
- Status: invited → accepted → active → inactive
- Tracks payment per collaborator

#### `collab_payments`
- Payment tracking for each subscription
- Daily vs. prepay options
- Stripe payment references

#### `collab_sessions`
- Active collaboration sessions
- Video room URL, Y.js doc sync
- Participant tracking

---

## 🔌 API Endpoints

### Base URL
```
POST   /api/plus1/subscription/create     - Create subscription
POST   /api/plus1/collaborator/add        - Add team member
POST   /api/plus1/collaborator/accept     - Accept invite
POST   /api/plus1/checkout                - Initiate payment
POST   /api/plus1/payment/webhook         - Stripe webhook
GET    /api/plus1/subscription            - Get current subscription
GET    /api/plus1/collaborators           - List team members
GET    /api/plus1/difu/balance            - Get DIFU balance
POST   /api/plus1/difu/transfer           - Transfer DIFU
```

### Example: Create Subscription

```bash
curl -X POST http://localhost:8787/api/plus1/subscription/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CLERK_TOKEN}" \
  -d '{
    "clerkId": "user_abc123",
    "planName": "lite",
    "paymentModel": "daily",
    "totalDays": 1
  }'
```

**Response:**
```json
{
  "success": true,
  "subscriptionId": "uuid-abc",
  "message": "Plus 1 LITE subscription created"
}
```

### Example: Add Collaborator

```bash
curl -X POST http://localhost:8787/api/plus1/collaborator/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CLERK_TOKEN}" \
  -d '{
    "subscriptionId": "uuid-abc",
    "hostClerkId": "user_abc123",
    "collaboratorEmail": "teammate@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "collaboratorRecordId": "uuid-def",
  "email": "teammate@example.com",
  "message": "Collaborator invite sent (pending acceptance)"
}
```

### Example: Initiate Checkout

```bash
curl -X POST http://localhost:8787/api/plus1/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "clerkId": "user_abc123",
    "subscriptionId": "uuid-abc",
    "collaboratorCount": 2,
    "days": 5,
    "paymentModel": "split"
  }'
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_1234_secret",
  "amount": 10.00,
  "message": "Checkout initiated: $10.00 for 2 collaborators × 5 days"
}
```

---

## 🎯 Pricing Models

### Daily Model
- **Cost:** $1 per collaborator per day
- **Use case:** Short-term collaboration, hourly coding sessions
- **Example:** 2 collabs × 1 day = $2
- **Payment:** Daily checkout, minimal commitment

### Prepay 7 Days
- **Cost:** $6 per collaborator (vs $7 daily)
- **Savings:** $1 per week
- **Use case:** Weekly team syncs
- **Example:** 2 collabs × 7 days = $12 (save $2)

### Prepay 30 Days
- **Cost:** $20 per collaborator (unlimited add/remove)
- **Savings:** $10 per month
- **Use case:** Ongoing team development
- **Example:** 5 collabs × 30 days = $100 (save $50)

---

## 💰 DIFU Digital Currency Ledger

### What is DIFU?

**Digital Instruments of Future Use (DIFU)** is Nurds Code's native digital currency:
- Earned through collaboration activities
- Spent to add teammates
- Transferred between users
- Redeemable to USD or crypto

### DIFU Earning Rules

```javascript
'earn_collaborator'      → 10 DIFU per successful session
'bonus_referral'         → 50 DIFU per referred friend
'bonus_first_collab'     → 25 DIFU on first collaboration
'bonus_collaborator_joined' → 10 DIFU when someone accepts invite
```

### DIFU Spending Rules

```javascript
'spend_plus1_daily'      → 1 DIFU = $1 collaborator cost (optional)
'spend_plus1_prepay'     → Bundle discount (6-20 DIFU)
```

### Tier System

| Tier | Balance | Benefits |
|------|---------|----------|
| 🥉 Bronze | 0-99 | Base features |
| 🥈 Silver | 100-499 | 5% discount on subscriptions |
| 🥇 Gold | 500-999 | 10% discount + priority support |
| 🏅 Platinum | 1000-4999 | 15% discount + custom team rates |
| 💎 Diamond | 5000+ | 20% discount + enterprise features |

---

## 🔑 Clerk Authentication Integration

### User Sync Flow

```
Clerk User Logs In
    ↓
Clerk Webhook: "user.created" or "user.updated"
    ↓
Sync to clerk_user_profiles table
    ↓
Auto-create DIFU account (zero balance)
    ↓
Ready for Plus 1 operations
```

### Clerk Environment Variables

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_FRONTEND_API_URL=https://precise-lamprey-55.clerk.accounts.dev
CLERK_SECRET_KEY=sk_test_... (stored as Worker secret)
```

### Clerk Webhook Setup

In Clerk Dashboard → Webhooks:

```
Event: user.created, user.updated
URL: https://nurdscode-api.workers.dev/api/webhooks/clerk
Sign with: CLERK_WEBHOOK_SECRET
```

---

## 🎯 User Workflows

### Scenario 1: Solo Developer (Free Tier)

1. Logs in with Clerk
2. Sees "Plus 1 Team Plan" button
3. Clicks → selects Coffee plan ($7)
4. Begins coding session (no collaborators)
5. Earns 10 DIFU for 15+ minute session

### Scenario 2: Host + 2 Collaborators (Daily)

1. Host creates subscription (Lite plan)
2. Host adds 2 teammates (emails)
3. Teammates accept invites
4. Host pays $2/day ($1 each)
5. All 3 see split-screen editor (PiP mode)
6. Host earns 20 DIFU (10/collab)
7. Teammates each earn 10 DIFU

### Scenario 3: Team Prepay (Monthly)

1. Team lead creates Superior plan
2. Adds 5 team members
3. Pays $20 upfront (unlimited add/remove for 30 days)
4. Team codes together for 4 weeks
5. After 30 days, can renew or switch plan
6. Team members each earn 30 DIFU (1/day × 30)

### Scenario 4: DIFU Transfer

1. Developer A has 100 DIFU (earned from collaborations)
2. Developer B needs $1 to add a collaborator
3. A transfers 1 DIFU to B (via `/api/plus1/difu/transfer`)
4. B can now spend 1 DIFU instead of paying $1 USD

---

## 🚀 Frontend Integration

### Add Plus 1 to Pricing Page

```jsx
import Plus1TeamManager from '../components/Plus1TeamManager';

// In Pricing.jsx
<Plus1TeamManager />
```

### Integration Points

1. **App.jsx** - Import Plus1TeamManager component
2. **Pricing.jsx** - Add team plan section
3. **Editor.jsx** - Show PiP activation when payment succeeds
4. **Navbar.jsx** - Add "Team" link to Plus 1 dashboard

### Plus 1 Team Manager Component

```jsx
<Plus1TeamManager />
```

Features:
- ✅ Create subscription (Coffee/Lite/Superior)
- ✅ Select payment model (daily/prepay)
- ✅ Add collaborators via email invite
- ✅ View DIFU balance & tier
- ✅ Transfer DIFU to teammates
- ✅ See cost breakdown in real-time

---

## 🔐 Security Considerations

### Authentication
- All endpoints require Clerk JWT token
- Token validated against CLERK_JWKS_URL
- Rate limiting: 60 requests/minute per user

### Authorization (RLS)
- Users can only see their own subscriptions
- Users can only view their collaborators
- DIFU ledger is immutable (no edits, only inserts)
- Collaborators can only access their assigned sessions

### Payment Security
- Stripe handles PCI compliance
- Webhook signatures verified with STRIPE_WEBHOOK_SECRET
- Idempotency keys prevent duplicate charges
- All transactions logged in DIFU ledger

---

## 📊 Metrics & Monitoring

### Key Performance Indicators

```
- Daily Active Teams: # of unique subscriptions per day
- Collaborator Adoption: % of users with 1+ collaborators
- DIFU Circulation: Total DIFU transferred per week
- Payment Success Rate: % of payments completed
- Churn Rate: % of subscriptions not renewed
```

### Monitoring Setup

```javascript
// Log to analytics
analytics.track('plus1_subscription_created', {
  planName: 'lite',
  paymentModel: 'daily',
  collaboratorCount: 2
});

analytics.track('plus1_payment_completed', {
  amount: 2.00,
  collaboratorCount: 2,
  days: 1
});

analytics.track('difu_transfer', {
  amount: 10,
  direction: 'sent'
});
```

---

## 🔧 Deployment Checklist

### Pre-Deployment

- [ ] Supabase migrations applied (0001-0004)
- [ ] Clerk app created + webhook configured
- [ ] Stripe keys added to environment
- [ ] DIFU transaction rules inserted
- [ ] Worker secrets configured

### Deployment

- [ ] Build: `npm run build`
- [ ] Deploy worker: `wrangler deploy`
- [ ] Deploy frontend: Vercel/Netlify
- [ ] Verify API endpoints: `curl http://localhost:8787/api/plus1/...`
- [ ] Test payment webhook: Use Stripe test mode

### Post-Deployment

- [ ] Monitor error logs (Sentry)
- [ ] Test user signup → Plus 1 flow
- [ ] Verify DIFU ledger transactions
- [ ] Monitor Stripe webhook deliveries
- [ ] Check database performance (Supabase Analytics)

---

## 🧪 Testing Scenarios

### Unit Tests

```javascript
// Test DIFU credit
await credit_difu(userId, 10, 'earn_collaboration', 'Test credit');
// Assert: balance increased by 10

// Test subscription creation
const subId = await create_plus_1_subscription(userId, 'lite', 'daily', 1);
// Assert: subscription exists with status='active'

// Test collaborator add
const collabId = await add_plus_1_collaborator(subId, hostId, collabId, 'test@example.com');
// Assert: collaborator status='invited'
```

### Integration Tests

1. **Clerk Sync**
   - User signs up → profile synced
   - Profile has DIFU account created
   - DIFU account balance = 0

2. **Subscription Flow**
   - Create subscription
   - Add 2 collaborators
   - Make payment ($2)
   - Verify PiP enabled in session

3. **DIFU Ledger**
   - Earn 10 DIFU from collaboration
   - Debit 1 DIFU for payment
   - Transfer 5 DIFU to teammate
   - Verify ledger has all 3 transactions

---

## 📚 Related Documentation

- **RIDESHARE-PRICING-MODEL.md** - Pricing architecture & rationale
- **CHATWIDGET-INTEGRATION.md** - Chat integration with Plus 1
- **SMOKE-TEST-CHECKLIST.md** - Frontend testing guide
- **PRD-PLUG-ECOSYSTEM.md** - Product roadmap

---

## 🎉 Success Metrics (30 Days)

- ✅ 100+ subscriptions created
- ✅ 50% users add 1+ collaborator
- ✅ 10,000+ DIFU transactions
- ✅ <2% payment failure rate
- ✅ <1s PiP activation time

---

**Ready to launch?** 🚀

```bash
# Deploy to production
npm run build
wrangler deploy
# Monitor: https://dash.cloudflare.com
```
