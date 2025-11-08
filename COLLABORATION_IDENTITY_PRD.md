# NURDSCODE COLLABORATION & IDENTITY VERIFICATION PRD
**Version 1.0 | November 2, 2025**

---

## 🎯 VISION

Enable verified trust across Nurdscode's marketplace and community while preserving anonymity for non-commercial users. Integrate real-time team collaboration with identity verification for sellers and contributors.

**Mantra**: Think It. Prompt It. Let's Build It. (Together, Verified, Secure)

---

## 👥 USER TYPES & VERIFICATION LEVELS

| User Type | Verification Level | Features Unlocked |
|-----------|-------------------|-------------------|
| **Anonymous User** | Basic login only | View content, no commerce |
| **Verified User** | Email + 2FA | Community posting, collaboration invite |
| **Seller/Contributor** | Document + Face (Shufti Pro) | Marketplace listings, paid content |
| **Business Seller** | Full KYB (Business docs) | Enterprise features, bulk listings |
| **Community Moderator** | Identity verified | Moderation powers, privilege access |

---

## 🏗️ SYSTEM ARCHITECTURE

```
User → Cloudflare Access / Gateway
      ↓ (Risk Score)
  Nurdscode App → /api/verify (seller)
      ↓
  Shufti Pro Verification API
      ↓
  Supabase DB → Verification + Risk Tier
      ↓
  Trust Badge Display (UI)
```

### Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS
- **Backend**: Cloudflare Workers + Pages
- **Auth**: Clerk (OAuth/OIDC)
- **Database**: Supabase (PostgreSQL)
- **Verification**: Shufti Pro API
- **Security**: Cloudflare Zero Trust + Risk Intelligence
- **Real-time**: Cloudflare Durable Objects / WebSockets
- **Video**: Daily.co / Agora SDK (Zoom-like)
- **Theme**: Nothing Brand (#000 + #39FF14 neon green)

---

## 💰 PRICING MODEL

### Plus One Collaboration Pricing

| Members | Monthly Price | Daily Rate | Discount |
|---------|--------------|------------|----------|
| 1 member | $17.99/mo | $1.00/day | - |
| 2 members | $13.99/mo per member | $1.00/day | 22% off |
| 4 members | $10.99/mo per member | $1.00/day | 39% off |
| 5+ members | $7.99/mo per member | $1.00/day | 56% off |

**Daily Collaboration**: $1/day per added member (no subscription)

### Verification Costs (Internal)

| Service | Cost | Frequency |
|---------|------|-----------|
| Shufti Pro Document Verify | ~$1.00 | Per seller onboarding |
| Shufti Pro Face Match | ~$0.50 | Per verification |
| Shufti Pro KYB (Business) | ~$3.00 | Per business seller |
| Cloudflare Zero Trust | $7/user/mo | > 50 verified users |

**Offset Strategy**: $5 one-time seller verification fee covers cost + margin

---

## 🔐 IDENTITY VERIFICATION FLOW

### Step 1: User Registration (Clerk)
- Email/password or OAuth (Google, GitHub)
- Basic profile creation
- Role selection: Buyer / Seller / Both

### Step 2: Seller Verification Trigger
```javascript
// User clicks "Become a Seller"
POST /api/verify/initiate
{
  "user_id": "clerk_user_123",
  "verification_type": "seller", // or "business"
  "country": "US"
}

// Response
{
  "reference": "SP-VER-ABCD1234",
  "verification_url": "https://shuftipro.com/verify?ref=...",
  "status": "pending"
}
```

### Step 3: Shufti Pro Verification
- Document upload (Passport, ID Card, Driver's License)
- Face liveness check (video selfie)
- Real-time verification (2-5 minutes)

### Step 4: Webhook Callback
```javascript
// Shufti Pro sends to /api/verify/callback
POST /api/verify/callback
{
  "reference": "user_clerk_123",
  "event": "verification.accepted",
  "verification_result": "verified",
  "document": {
    "name": "John Doe",
    "dob": "1990-01-01",
    "document_number": "AB123456"
  }
}
```

### Step 5: Trust Score Calculation
```javascript
const calculateTrustScore = (verification, riskScore) => {
  const baseScore = verification.verified ? 60 : 0;
  const riskAdjustment = Math.max(0, 40 - riskScore / 2);
  const trustScore = baseScore + riskAdjustment;
  
  return {
    score: trustScore,
    tier: trustScore >= 80 ? 'verified_trusted' :
          trustScore >= 50 ? 'standard_verified' :
          'unverified'
  };
};
```

### Step 6: Badge Display
```jsx
{user.verified && (
  <div className="flex items-center gap-2">
    <span className="text-[#39FF14]">✅</span>
    <span className="text-xs text-gray-400">Verified Seller</span>
    <span className="text-xs text-[#39FF14]">Trust: {user.trust_score}/100</span>
  </div>
)}
```

---

## 🤝 TEAM COLLABORATION FEATURES

### 1. Plus One Invitation System
```javascript
// Invite team member
POST /api/collaboration/invite
{
  "project_id": "proj_123",
  "inviter_user_id": "clerk_user_123",
  "invitee_email": "teammate@example.com",
  "role": "editor", // viewer, editor, admin
  "billing_type": "daily" // or "monthly"
}
```

### 2. Real-Time Code Editor Sync
- **Technology**: Cloudflare Durable Objects + WebSockets
- **Features**:
  - Live cursor positions
  - Real-time code updates
  - Conflict resolution
  - Chat sidebar
  - Voice/video call integration

### 3. Video Collaboration (Zoom-like)
- **SDK**: Daily.co or Agora.io
- **Features**:
  - Screen sharing
  - Audio/video calls
  - Recording (Pro tier)
  - Virtual backgrounds
  - Chat overlay

### 4. Collaborative Whiteboard
- **Technology**: Excalidraw or Tldraw
- **Features**:
  - Draw diagrams
  - Annotate code
  - Sticky notes
  - Export to PNG/SVG

---

## 🗄️ DATABASE SCHEMA

### Supabase Tables

```sql
-- Verifications Table
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  verified BOOLEAN DEFAULT false,
  status TEXT, -- pending, verified, declined
  verification_id TEXT, -- Shufti Pro reference
  document_type TEXT, -- passport, id_card, etc.
  verification_data JSONB, -- Raw Shufti response
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk Scores Table
CREATE TABLE risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  risk_score INT, -- 0-100 (Cloudflare score)
  device_posture TEXT, -- secure, moderate, risky
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_risk_scores_user_id ON risk_scores(user_id);

-- Trust Profiles Table
CREATE TABLE trust_profiles (
  user_id TEXT PRIMARY KEY,
  trust_score INT, -- 0-100 calculated
  tier TEXT, -- verified_trusted, standard_verified, unverified
  badges JSONB, -- Array of earned badges
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Collaboration Projects Table
CREATE TABLE collaboration_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  settings JSONB -- Editor settings, permissions, etc.
);

-- Collaboration Members Table
CREATE TABLE collaboration_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES collaboration_projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT, -- viewer, editor, admin
  invited_by TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  billing_type TEXT, -- daily, monthly
  status TEXT, -- invited, active, removed
  UNIQUE(project_id, user_id)
);

-- Collaboration Sessions Table (for billing)
CREATE TABLE collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES collaboration_projects(id),
  user_id TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INT,
  cost_usd DECIMAL(10, 2)
);
```

---

## 🔌 API ENDPOINTS

### Verification Endpoints

```javascript
// 1. Initiate Verification
POST /api/verify/initiate
Body: { user_id, verification_type, country }
Response: { reference, verification_url, status }

// 2. Webhook Callback (Shufti Pro)
POST /api/verify/callback
Body: Shufti Pro webhook payload
Response: { success: true }

// 3. Get Verification Status
GET /api/verify/status/:user_id
Response: { verified, status, trust_score, tier }

// 4. Get Trust Badge
GET /api/verify/badge/:user_id
Response: { badge_html, trust_score, verified }
```

### Collaboration Endpoints

```javascript
// 1. Create Project
POST /api/collaboration/projects
Body: { name, owner_user_id }
Response: { project_id, invite_link }

// 2. Invite Member
POST /api/collaboration/invite
Body: { project_id, invitee_email, role, billing_type }
Response: { invite_id, status }

// 3. Join Project
POST /api/collaboration/join/:invite_token
Response: { project_id, role }

// 4. Get Project Members
GET /api/collaboration/projects/:project_id/members
Response: [{ user_id, role, trust_score, verified }]

// 5. Start Session (billing)
POST /api/collaboration/sessions/start
Body: { project_id, user_id }
Response: { session_id, started_at }

// 6. End Session
POST /api/collaboration/sessions/end/:session_id
Response: { duration_minutes, cost_usd }

// 7. WebSocket Connect
WS /api/collaboration/ws/:project_id
Messages: { type: "code_change", data: { ... } }
```

---

## 🎨 UI COMPONENTS

### 1. Verification Badge Component
```jsx
<VerificationBadge
  verified={true}
  trustScore={92}
  tier="verified_trusted"
  onClick={() => showVerificationModal()}
/>
```

### 2. Collaboration Invite Modal
```jsx
<CollaborationInviteModal
  projectId="proj_123"
  onInvite={(email, role, billingType) => {
    // Send invite
  }}
  pricingTiers={[
    { members: 1, price: 17.99 },
    { members: 2, price: 13.99 }
  ]}
/>
```

### 3. Live Collaboration Editor
```jsx
<CollaborativeEditor
  projectId="proj_123"
  userId="clerk_user_123"
  initialCode="console.log('Hello');"
  onCodeChange={(code) => syncToOthers(code)}
  members={[
    { id: '1', name: 'John', cursor: { line: 5, col: 10 } },
    { id: '2', name: 'Jane', cursor: { line: 8, col: 3 } }
  ]}
/>
```

### 4. Video Call Widget
```jsx
<VideoCallWidget
  projectId="proj_123"
  participants={[
    { id: '1', name: 'John', video: true, audio: true },
    { id: '2', name: 'Jane', video: true, audio: false }
  ]}
  onScreenShare={() => {}}
  onRecord={() => {}}
/>
```

---

## 🔒 SECURITY & RISK POLICIES

### Cloudflare Zero Trust Integration

```javascript
// Capture risk score from Cloudflare Access
const riskScore = request.headers.get('cf-access-risk-score');
const devicePosture = request.headers.get('cf-access-device-posture');

await supabase.from('risk_scores').insert({
  user_id,
  risk_score: Number(riskScore),
  device_posture: devicePosture,
  timestamp: new Date()
});
```

### Risk-Based Actions

| Risk Score | Action |
|------------|--------|
| < 30 | ✅ Normal – Full access |
| 30-70 | ⚠️ Elevated – Require 2FA |
| > 70 | 🚫 High – Restrict listings, trigger re-verification |

### Trust Score Policy

```javascript
const TRUST_POLICIES = {
  verified_trusted: {
    min_score: 80,
    badge: '✅ Verified Trusted Seller',
    color: '#39FF14',
    permissions: ['marketplace', 'community', 'collaboration', 'premium']
  },
  standard_verified: {
    min_score: 50,
    badge: '✓ Verified User',
    color: '#FFC107',
    permissions: ['marketplace', 'community', 'collaboration']
  },
  unverified: {
    min_score: 0,
    badge: '👤 Unverified',
    color: '#9E9E9E',
    permissions: ['view_only']
  }
};
```

---

## 🚀 IMPLEMENTATION PHASES

### Phase 1: Identity Verification (Week 1-2)
- [ ] Shufti Pro account setup
- [ ] Integrate Shufti Pro SDK
- [ ] Build `/api/verify/*` endpoints
- [ ] Create verification UI flow
- [ ] Design trust badges
- [ ] Test verification flow

### Phase 2: Trust Score System (Week 2-3)
- [ ] Integrate Cloudflare Zero Trust
- [ ] Build risk scoring logic
- [ ] Create trust profile calculation
- [ ] Display badges in UI
- [ ] Policy enforcement

### Phase 3: Collaboration Infrastructure (Week 3-4)
- [ ] Build collaboration database schema
- [ ] Create project management API
- [ ] Implement WebSocket server (Durable Objects)
- [ ] Build invitation system
- [ ] Session tracking & billing

### Phase 4: Real-Time Editor (Week 4-5)
- [ ] Integrate Monaco Editor with WebSocket sync
- [ ] Build cursor tracking
- [ ] Implement conflict resolution
- [ ] Add chat sidebar
- [ ] Test multi-user editing

### Phase 5: Video Collaboration (Week 5-6)
- [ ] Integrate Daily.co or Agora SDK
- [ ] Build video call UI
- [ ] Add screen sharing
- [ ] Implement recording feature
- [ ] Test with multiple participants

### Phase 6: Billing Integration (Week 6-7)
- [ ] Build pricing calculator
- [ ] Integrate Stripe for payments
- [ ] Implement daily vs monthly billing
- [ ] Session-based cost tracking
- [ ] Invoice generation

---

## 📊 SUCCESS METRICS

| Metric | Target | Current |
|--------|--------|---------|
| Verification Completion Rate | > 85% | TBD |
| Average Trust Score | > 70 | TBD |
| Collaboration Adoption | > 40% of users | TBD |
| Daily Active Collaborators | 1,000+ | TBD |
| Revenue from Collaboration | $10k/mo | TBD |

---

## 🎯 BRANDING (Nothing UI Theme)

### Colors
- **Background**: #000000 (Pure Black)
- **Primary**: #39FF14 (Neon Green)
- **Secondary**: #D946EF (Magenta)
- **Text**: #FFFFFF (White)
- **Border**: #2a2a2a (Dark Gray)

### Typography
- **Headings**: Permanent Marker
- **Body**: Doto (sans-serif)
- **Code**: Fira Code

### Badge Design
```css
.trust-badge {
  background: linear-gradient(135deg, #39FF14 0%, #2FCC0A 100%);
  border: 2px solid #39FF14;
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.3);
  animation: pulse 2s infinite;
}
```

---

## 🔐 SHUFTI PRO CONFIGURATION

### API Credentials
```env
SHUFTI_PRO_CLIENT_ID=ddf359e60538d3329cf817ef47008cdb65c877d659bce5a50ae0c0b33fdb10f6
SHUFTI_PRO_SECRET_KEY=PgJzfgF56J9ERzCX3ffkrtLvFsE7qr1j
SHUFTI_PRO_BASE_URL=https://api.shuftipro.com
```

### Verification Payload
```javascript
const verificationPayload = {
  reference: user_id,
  country: "US",
  language: "en",
  email: user.email,
  callback_url: "https://nurdscode.com/api/verify/callback",
  redirect_url: "https://nurdscode.com/verification-complete",
  verification_mode: "image_only",
  show_consent: 1,
  show_results: 1,
  face: { proof: "video" },
  document: {
    supported_types: ["passport", "id_card", "driving_license"],
    name: true,
    dob: true,
    expiry_date: true
  }
};
```

---

## 📝 NEXT STEPS

1. **Setup Shufti Pro Account** (Priority 1)
2. **Build Verification API** (Priority 1)
3. **Create Trust Badge UI** (Priority 2)
4. **Implement Collaboration Schema** (Priority 2)
5. **Integrate Real-Time Sync** (Priority 3)
6. **Add Video Calls** (Priority 3)
7. **Launch Beta** (Week 8)

---

**Document Version**: 1.0  
**Last Updated**: November 2, 2025  
**Owner**: ACHEEVY Platform Team  
**Status**: Ready for Implementation ✅
