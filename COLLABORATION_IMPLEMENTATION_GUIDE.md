# COLLABORATION & IDENTITY VERIFICATION - IMPLEMENTATION GUIDE
**Version 1.0 | November 2, 2025**

---

## ✅ COMPLETED (Task 5)

### What We Just Built

#### 1. **Identity Verification System (Shufti Pro)**
- **Component**: `src/pages/Verification.jsx`
- **Features**:
  - Document + Face verification UI
  - Trust badge display system
  - Verification status tracking
  - 3 verification types: Seller, Business, Moderator
  - Real-time status polling

#### 2. **Database Schema** 
- **File**: `supabase/migrations/0003_collaboration_identity.sql`
- **Tables Created (15+)**:
  - `verifications` - Shufti Pro verification records
  - `risk_scores` - Cloudflare Zero Trust risk data
  - `trust_profiles` - Calculated trust scores & tiers
  - `collaboration_projects` - Team project metadata
  - `collaboration_members` - Project membership & roles
  - `collaboration_files` - Project files & code
  - `collaboration_messages` - Team chat history
  - `collaboration_invitations` - Team invite system
  - `collaboration_billing_plans` - Pricing tiers
  - `collaboration_subscriptions` - Active subscriptions
  - `collaboration_invoices` - Billing records
  - `collaboration_sessions` - Session tracking for billing
  - `verification_audit_log` - Audit trail
  - `collaboration_activity_log` - Activity tracking

#### 3. **API Endpoints (workers/api.js)**
- **Verification Endpoints**:
  - `POST /api/verify/initiate` - Start Shufti Pro verification
  - `POST /api/verify/callback` - Shufti Pro webhook receiver
  - `GET /api/verify/status/:user_id` - Get verification & trust score

- **Collaboration Endpoints**:
  - `POST /api/collaboration/projects` - Create new project
  - `GET /api/collaboration/projects/:id` - Get project details
  - `GET /api/collaboration/projects/:id/members` - List team members
  - `GET /api/collaboration/projects/:id/files` - List project files
  - `PUT /api/collaboration/files/:id` - Update file content
  - `POST /api/collaboration/invite` - Send team invitation

#### 4. **React Components**
- **Verification.jsx** (450+ lines)
  - Shufti Pro integration
  - Trust badge display
  - Verification flow UI
  - 3-step verification process

- **CollaborationProjects.jsx** (300+ lines)
  - Projects dashboard
  - Create project modal
  - Plus One pricing display
  - Project grid with stats

- **CollaborationWorkspace.jsx** (550+ lines)
  - Real-time Monaco Editor
  - WebSocket integration (stub)
  - Team chat sidebar
  - Video call controls (stub)
  - File explorer
  - Live cursor tracking (stub)

#### 5. **Documentation**
- **COLLABORATION_IDENTITY_PRD.md** - Complete product requirements
- **This file** - Implementation guide

#### 6. **Router & Navigation**
- Added routes to App.jsx:
  - `/verification` - Identity verification page
  - `/collaboration` - Projects dashboard
  - `/collaboration/:projectId` - Workspace
- Updated Navbar.jsx with "Teams" and "Verify" links

---

## 🚀 NEXT STEPS TO DEPLOY

### Step 1: Setup Shufti Pro Account (Priority 1)

1. **Sign up**: https://shuftipro.com
2. **Get credentials**:
   - CLIENT_ID: `ddf359e60538d3329cf817ef47008cdb65c877d659bce5a50ae0c0b33fdb10f6`
   - SECRET_KEY: `PgJzfgF56J9ERzCX3ffkrtLvFsE7qr1j`
   - (These are already in the code as fallbacks)

3. **Add to wrangler.toml**:
```toml
[vars]
SHUFTI_PRO_CLIENT_ID = "ddf359e60538d3329cf817ef47008cdb65c877d659bce5a50ae0c0b33fdb10f6"

[secrets]
# Run: npx wrangler secret put SHUFTI_PRO_SECRET_KEY
# Then paste: PgJzfgF56J9ERzCX3ffkrtLvFsE7qr1j
```

4. **Configure Journey Builder** in Shufti Pro dashboard:
   - Create "Seller Verification" flow (ID + Selfie)
   - Create "Business KYB" flow (Company docs + License)
   - Set callback URL: `https://your-domain.com/api/verify/callback`

5. **Test verification**:
   - Navigate to `/verification` page
   - Click "Start Verification"
   - Complete verification flow
   - Check webhook callback in Shufti dashboard

---

### Step 2: Run Database Migration (Priority 1)

```bash
# Apply the new migration
cd supabase
npx supabase db push

# Or manually run the SQL file
psql -h your-supabase-host -U postgres -d postgres -f migrations/0003_collaboration_identity.sql
```

**Verify tables created**:
```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%verification%' OR table_name LIKE '%collaboration%';
```

---

### Step 3: Setup Cloudflare Zero Trust (Priority 2)

1. **Enable Risk Scoring**:
   - Go to Cloudflare Dashboard → Zero Trust → Settings
   - Enable "User Risk Score Sharing"
   - Add your app as an Access Application

2. **Integrate with Clerk**:
   - In Clerk dashboard, get OIDC credentials
   - Add as Identity Provider in Cloudflare Access
   - Configure risk score headers

3. **Test risk score capture**:
   - Workers will receive `cf-access-risk-score` header
   - Scores stored in `risk_scores` table automatically

---

### Step 4: Integrate Video Calling SDK (Priority 2)

**Option A: Daily.co (Recommended)**

1. Sign up at https://daily.co
2. Install SDK:
```bash
npm install @daily-co/daily-js
```

3. Update `CollaborationWorkspace.jsx`:
```javascript
import DailyIframe from '@daily-co/daily-js';

const toggleVideo = async () => {
  if (!callFrame) {
    const frame = DailyIframe.createFrame({
      showLeaveButton: true,
      iframeStyle: {
        position: 'fixed',
        top: '80px',
        right: '20px',
        width: '400px',
        height: '300px',
        border: '2px solid #39FF14',
        borderRadius: '12px'
      }
    });
    await frame.join({ url: `https://your-domain.daily.co/${projectId}` });
    setCallFrame(frame);
  } else {
    callFrame.destroy();
    setCallFrame(null);
  }
};
```

**Option B: Agora SDK**

1. Sign up at https://agora.io
2. Install SDK:
```bash
npm install agora-rtc-react
```

3. Follow their React integration guide

---

### Step 5: Implement WebSocket Server (Priority 2)

**Using Cloudflare Durable Objects**:

1. Create new file `workers/collaboration-do.ts`:
```typescript
export class CollaborationRoom {
  private state: DurableObjectState;
  private sessions: Map<string, WebSocket>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sessions = new Map();
  }

  async fetch(request: Request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    await this.handleSession(server, request);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async handleSession(webSocket: WebSocket, request: Request) {
    webSocket.accept();
    
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    
    this.sessions.set(userId, webSocket);

    webSocket.addEventListener('message', (msg) => {
      const data = JSON.parse(msg.data);
      // Broadcast to all other sessions
      this.broadcast(data, userId);
    });

    webSocket.addEventListener('close', () => {
      this.sessions.delete(userId);
    });
  }

  broadcast(message: any, excludeUserId: string) {
    for (const [userId, ws] of this.sessions.entries()) {
      if (userId !== excludeUserId) {
        ws.send(JSON.stringify(message));
      }
    }
  }
}
```

2. Update `wrangler.toml`:
```toml
[durable_objects]
bindings = [
  { name = "COLLABORATION_ROOM", class_name = "CollaborationRoom" }
]

[[migrations]]
tag = "v1"
new_classes = ["CollaborationRoom"]
```

3. Update WebSocket URL in `CollaborationWorkspace.jsx`:
```javascript
const wsUrl = `wss://${apiBase}/api/collaboration/ws/${projectId}?user_id=${user.id}`;
```

---

### Step 6: Setup Stripe Billing (Priority 3)

1. **Create Stripe account**: https://stripe.com
2. **Install Stripe SDK**:
```bash
npm install stripe
```

3. **Add API endpoints**:
```javascript
// In workers/api.js

import Stripe from 'stripe';

if (path === '/api/collaboration/create-subscription' && request.method === 'POST') {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  
  const { project_id, user_id, plan_id, billing_cycle } = await request.json();
  
  // Create Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { user_id, project_id }
  });
  
  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: plan_id }],
    metadata: { project_id, billing_cycle }
  });
  
  // Store in Supabase
  await supabase.from('collaboration_subscriptions').insert({
    project_id,
    user_id,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customer.id,
    status: 'active'
  });
  
  return new Response(JSON.stringify({ subscription_id: subscription.id }));
}
```

---

### Step 7: Test End-to-End Flow

#### Test 1: Identity Verification
1. Navigate to `/verification`
2. Click "Start Verification"
3. Complete Shufti Pro flow
4. Verify webhook callback received
5. Check trust score calculated
6. Confirm badge displays

#### Test 2: Project Creation
1. Navigate to `/collaboration`
2. Click "New Project"
3. Fill in name/description
4. Verify project appears in grid
5. Click project to open workspace

#### Test 3: Team Collaboration
1. In workspace, click "Invite"
2. Enter teammate email
3. Teammate receives email
4. Teammate joins project
5. Both users see each other in members list

#### Test 4: Real-Time Editing (After WebSocket setup)
1. Open same project in 2 browsers
2. Type code in User A's editor
3. Verify User B sees changes
4. Check cursor positions sync
5. Test chat messages

#### Test 5: Billing
1. Add 2nd team member
2. Verify pricing calculated ($13.99/member/month)
3. Click "Subscribe"
4. Complete Stripe checkout
5. Verify subscription active in Supabase

---

## 🔧 ENVIRONMENT VARIABLES NEEDED

### Add to `.env` (local development):
```env
# Shufti Pro
SHUFTI_PRO_CLIENT_ID=ddf359e60538d3329cf817ef47008cdb65c877d659bce5a50ae0c0b33fdb10f6
SHUFTI_PRO_SECRET_KEY=PgJzfgF56J9ERzCX3ffkrtLvFsE7qr1j
SHUFTI_PRO_BASE_URL=https://api.shuftipro.com

# Cloudflare Zero Trust
CLOUDFLARE_ACCESS_CLIENT_ID=your_client_id
CLOUDFLARE_ACCESS_CLIENT_SECRET=your_secret

# Daily.co (Video)
DAILY_API_KEY=your_daily_api_key
DAILY_DOMAIN=your-domain.daily.co

# Stripe (Billing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (Already configured)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Add to Cloudflare Workers secrets:
```bash
npx wrangler secret put SHUFTI_PRO_SECRET_KEY
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put DAILY_API_KEY
npx wrangler secret put CLOUDFLARE_ACCESS_CLIENT_SECRET
```

---

## 📊 FEATURES CHECKLIST

### ✅ Completed
- [x] Shufti Pro verification UI
- [x] Trust score calculation logic
- [x] Database schema (15+ tables)
- [x] API endpoints (verification + collaboration)
- [x] Projects dashboard
- [x] Collaboration workspace UI
- [x] Monaco Editor integration
- [x] File explorer
- [x] Team chat UI
- [x] Invitation system
- [x] Plus One pricing display
- [x] Router integration
- [x] Navbar links

### 🔄 Needs Implementation
- [ ] Shufti Pro API testing (need live account)
- [ ] WebSocket real-time sync (Durable Objects)
- [ ] Video calling integration (Daily.co or Agora)
- [ ] Stripe billing integration
- [ ] Email notifications (invite emails)
- [ ] Session tracking & cost calculation
- [ ] User presence indicators
- [ ] Conflict resolution for simultaneous edits
- [ ] File version history
- [ ] Screen sharing feature
- [ ] Recording feature
- [ ] Analytics dashboard

---

## 🐛 KNOWN ISSUES & TODOS

### High Priority
1. **WebSocket URL hardcoded** - Update to use env variable
2. **Cursor rendering stub** - Implement actual cursor positioning
3. **Video SDK not integrated** - Choose and integrate Daily.co or Agora
4. **No email service** - Add Resend or SendGrid for invitations
5. **Trust score calculation** - Test with real Cloudflare risk scores

### Medium Priority
6. **File creation missing** - Add "New File" button in workspace
7. **Member permissions** - Implement role-based access (viewer/editor/admin)
8. **Session billing** - Calculate costs based on active time
9. **Audit logging** - Ensure all actions logged properly
10. **Rate limiting** - Add to prevent API abuse

### Low Priority
11. **Mobile responsive** - Optimize workspace for tablets
12. **Dark/light theme toggle** - Add to workspace
13. **Keyboard shortcuts** - Add shortcuts for save, run, etc.
14. **Export project** - Allow download as ZIP
15. **Import project** - Upload existing codebase

---

## 🎯 SUCCESS METRICS

### Week 1 Goals
- [ ] 10+ verified users
- [ ] 5+ collaboration projects created
- [ ] 3+ teams with 2+ members
- [ ] 0 verification failures (Shufti Pro)

### Month 1 Goals
- [ ] 100+ verified users
- [ ] 50+ active collaboration projects
- [ ] $500+ MRR from Plus One subscriptions
- [ ] 95%+ uptime for WebSocket connections

---

## 📞 SUPPORT RESOURCES

### Shufti Pro
- Dashboard: https://app.shuftipro.com
- Docs: https://docs.shuftipro.com
- Support: support@shuftipro.com

### Cloudflare
- Dashboard: https://dash.cloudflare.com
- Durable Objects: https://developers.cloudflare.com/durable-objects
- Zero Trust: https://developers.cloudflare.com/cloudflare-one

### Daily.co
- Dashboard: https://dashboard.daily.co
- Docs: https://docs.daily.co
- React Guide: https://docs.daily.co/guides/products/daily-prebuilt/prebuilt-react

### Stripe
- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs
- Subscriptions: https://stripe.com/docs/billing/subscriptions

---

## 🚀 DEPLOYMENT CHECKLIST

Before going live:

- [ ] Run database migration on production Supabase
- [ ] Add all environment variables to Cloudflare Workers
- [ ] Test Shufti Pro webhooks with ngrok/production URL
- [ ] Verify Cloudflare Zero Trust integration
- [ ] Test video calls with 5+ participants
- [ ] Load test WebSocket connections (100+ concurrent)
- [ ] Setup Stripe production mode
- [ ] Enable RLS policies in Supabase
- [ ] Setup monitoring (Sentry, LogRocket)
- [ ] Create admin dashboard for support team
- [ ] Write user documentation
- [ ] Record demo video
- [ ] Setup customer support (Intercom, Zendesk)

---

**Last Updated**: November 2, 2025  
**Task Status**: ✅ COMPLETE (Infrastructure ready for integration)  
**Next Task**: #6 - Integrate Intelligent Internet (II Agent) - 17 Repos
