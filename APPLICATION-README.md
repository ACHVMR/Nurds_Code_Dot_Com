# 🤖 NURDS CODE - Application README
**Version:** 1.0.0-beta (Plus 1 Team Plan)  
**Last Updated:** 2025-10-31  
**Status:** Production-Ready

---

## 📌 Quick Links

- **[Architecture Overview](#architecture-overview)** - System design
- **[Feature Reference](#features)** - What's included
- **[Setup Guide](#getting-started)** - Environment setup
- **[API Documentation](#api-reference)** - Endpoint reference
- **[Plus 1 Team Plan](#plus-1-team-plan)** - New feature details
- **[Troubleshooting](#troubleshooting)** - Common issues
- **[Contributing](#contributing)** - Development guide

---

## 🎯 What is Nurds Code?

**Nurds Code** is an AI-powered collaborative coding platform with:
- 🤖 **ACHEEVY Assistant** - AI-powered code assistant via Cloudflare Workers
- 🎤 **Multi-voice Support** - Whisper/Deepgram/ElevenLabs
- 💬 **Real-time Chat** - Communicate while coding
- 👥 **Team Collaboration** - Work together with the new Plus 1 Team Plan
- 💰 **DIFU Digital Currency** - Earn and spend credits
- 🎯 **PiP Mode** - Picture-in-Picture for multitasking

---

## 🏗️ Architecture Overview

### Stack
```
Frontend:         Vite + React 19
Backend:          Cloudflare Workers + Node.js
Database:         Supabase (PostgreSQL)
Auth:             Clerk (JWT-based)
Payment:          Stripe
Voice:            OpenAI Whisper / Deepgram / ElevenLabs
Video:            Ready for Daily.co or Agora
CDN:              Cloudflare
```

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NURDS CODE APPLICATION                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐        ┌──────────────┐                  │
│  │   Frontend   │◄──────►│   API Layer  │                  │
│  │   (Vite)     │        │  (Workers)   │                  │
│  └──────────────┘        └──────────────┘                  │
│         │                       │                           │
│         │                       │                           │
│  ┌──────┴───────────────────────┴──────┐                  │
│  │                                     │                  │
│  ▼                                     ▼                  │
│ ┌──────────────┐            ┌──────────────────┐         │
│ │   Clerk      │            │    Supabase      │         │
│ │   (Auth)     │            │   (Database)     │         │
│ └──────────────┘            └──────────────────┘         │
│                                     │                     │
│                    ┌────────────────┼────────────────┐    │
│                    │                │                │    │
│                    ▼                ▼                ▼    │
│            ┌──────────────┐ ┌──────────────┐ ┌──────────┐│
│            │ Plus 1 Plans │ │ DIFU Ledger  │ │Collab    ││
│            │              │ │              │ │Sessions  ││
│            └──────────────┘ └──────────────┘ └──────────┘│
│                                                            │
│  ┌───────────────┐    ┌───────────────┐                  │
│  │ Voice Engine  │    │  PiP Manager  │                  │
│  │ (STT/TTS)     │    │  (Video)      │                  │
│  └───────────────┘    └───────────────┘                  │
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication** → Clerk → JWT Token
2. **API Calls** → Cloudflare Worker → Supabase
3. **Subscription** → Stripe → DIFU Credit
4. **Collaboration** → WebSocket → collab_sessions table
5. **Chat/Voice** → OpenAI/Deepgram/ElevenLabs → Response

---

## ✨ Features

### Core Features
- ✅ **ACHEEVY AI Assistant** - Ask coding questions in the Editor
- ✅ **Chat Widget** - Real-time messaging
- ✅ **Voice Control** - Speak to interact
- ✅ **Code Editor** - Syntax-highlighted editor
- ✅ **Admin Dashboard** - Manage users and billing
- ✅ **User Authentication** - Clerk OAuth

### Plus 1 Team Plan Features
- ✅ **Team Subscriptions** - $1/collaborator/day
- ✅ **Clerk User Management** - Auto-sync collaborators
- ✅ **DIFU Digital Currency** - Earn/spend/transfer
- ✅ **Stripe Integration** - Seamless payments
- ✅ **PiP Mode Activation** - Auto-enable video
- ✅ **Audit Trail** - Immutable ledger
- ✅ **Cost Splitting** - Per-collaborator pricing
- ✅ **Tier System** - Bronze→Diamond progression

### Coming Soon (Tasks 6-8)
- ⏳ **Collaboration Service** - WebSocket + Y.js (Task 6)
- ⏳ **Video Integration** - Daily.co/Agora (Task 7)
- ⏳ **Breakaway Rooms** - Sub-session collaboration (Task 8)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account
- Clerk account
- Cloudflare account
- Stripe account (optional, for payments)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/nurds-code.git
cd nurds-code
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Setup
Create `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-key
VITE_OPENAI_API_KEY=your-openai-key
VITE_API_BASE_URL=http://localhost:8787
```

Create `wrangler.toml`:
```toml
[env.development]
vars = { ENVIRONMENT = "development" }

[env.production]
vars = { ENVIRONMENT = "production" }

[[env.development.kv_namespaces]]
binding = "VOICE_CACHE"
id = "your-kv-id"
```

#### 4. Apply Database Migrations
```bash
pwsh scripts/apply-supabase-schema.ps1
```

#### 5. Start Development Servers
```bash
# Terminal 1: Vite frontend
npm run dev

# Terminal 2: Cloudflare Worker
npm run worker:dev
```

Visit: `http://localhost:5173`

---

## 📚 API Reference

### Plus 1 Team Plan Endpoints

#### Create Subscription
```bash
POST /api/plus1/subscription/create
Content-Type: application/json
Authorization: Bearer <clerk-token>

{
  "plan_type": "plus_1",
  "billing_cycle": "monthly",
  "max_collaborators": 3,
  "initial_days": 30
}
```

**Response:**
```json
{
  "subscription_id": "sub_123",
  "status": "active",
  "max_collaborators": 3,
  "renewal_date": "2025-11-30",
  "cost_per_day": 3,
  "difu_credits_allocated": 100
}
```

#### Add Collaborator
```bash
POST /api/plus1/collaborator/add
Content-Type: application/json
Authorization: Bearer <clerk-token>

{
  "collaborator_email": "partner@example.com",
  "role": "editor",
  "cost_split": 0.33
}
```

**Response:**
```json
{
  "invite_id": "inv_456",
  "status": "pending",
  "invited_email": "partner@example.com",
  "expires_at": "2025-11-07"
}
```

#### Accept Collaborator Invite
```bash
POST /api/plus1/collaborator/accept
Content-Type: application/json
Authorization: Bearer <clerk-token>

{
  "invite_id": "inv_456"
}
```

**Response:**
```json
{
  "collaborator_id": "collab_789",
  "status": "active",
  "joined_at": "2025-10-31T15:30:00Z"
}
```

#### Create Checkout Session
```bash
POST /api/plus1/checkout
Content-Type: application/json
Authorization: Bearer <clerk-token>

{
  "plan_type": "plus_1",
  "collaborator_count": 2,
  "days": 30,
  "success_url": "http://localhost:5173/success"
}
```

**Response:**
```json
{
  "session_id": "cs_live_123",
  "checkout_url": "https://checkout.stripe.com/...",
  "expires_at": "2025-11-01T15:30:00Z"
}
```

#### Process Payment Webhook
```bash
POST /api/plus1/payment/webhook
Content-Type: application/json
X-Stripe-Signature: signature

{
  "id": "evt_123",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_123",
      "metadata": {
        "subscription_id": "sub_123",
        "difu_amount": 100
      }
    }
  }
}
```

#### Get Subscription
```bash
GET /api/plus1/subscription
Authorization: Bearer <clerk-token>
```

**Response:**
```json
{
  "subscription_id": "sub_123",
  "plan_type": "plus_1",
  "status": "active",
  "max_collaborators": 3,
  "current_collaborators": 2,
  "renewal_date": "2025-11-30",
  "cost_per_day": 3,
  "difu_balance": 150
}
```

#### Get Collaborators
```bash
GET /api/plus1/collaborators
Authorization: Bearer <clerk-token>
```

**Response:**
```json
{
  "collaborators": [
    {
      "collaborator_id": "collab_789",
      "email": "partner@example.com",
      "role": "editor",
      "cost_split": 0.33,
      "status": "active",
      "joined_at": "2025-10-31T15:30:00Z"
    }
  ]
}
```

#### Get DIFU Balance
```bash
GET /api/plus1/difu/balance
Authorization: Bearer <clerk-token>
```

**Response:**
```json
{
  "balance": 250,
  "tier": "Silver",
  "lifetime_earned": 500,
  "lifetime_spent": 250,
  "tier_progress": 0.75,
  "next_tier": "Gold",
  "next_tier_requirement": 500
}
```

#### Transfer DIFU
```bash
POST /api/plus1/difu/transfer
Content-Type: application/json
Authorization: Bearer <clerk-token>

{
  "recipient_user_id": "user_xyz",
  "amount": 50,
  "memo": "Payment for coding help"
}
```

**Response:**
```json
{
  "transfer_id": "txn_123",
  "amount": 50,
  "recipient": "user_xyz",
  "timestamp": "2025-10-31T15:30:00Z",
  "new_balance": 200
}
```

---

## 💬 Plus 1 Team Plan

### What is Plus 1?

**Plus 1** is a subscription model for collaborative coding:
- Pay **$1 per collaborator per day**
- Host **up to 3 collaborators** per team
- Earn **DIFU credits** with every payment
- Auto-activate **PiP mode** for video calls

### How It Works

#### Step 1: Create Subscription
User opens the Plus 1 manager and selects:
- Plan: "Plus 1 Team"
- Days: 30 (or custom)
- Collaborators: 2 (or more, up to max)
- Cost: $1 × 2 × 30 = $60

#### Step 2: Invite Collaborators
1. Click "Add Collaborator"
2. Enter email
3. Select role (editor, viewer)
4. Set cost split (auto-calculates)
5. Send invite

#### Step 3: Make Payment
1. Click "Proceed to Checkout"
2. Redirected to Stripe
3. Complete payment
4. Auto-activate PiP mode
5. DIFU credits applied

#### Step 4: Collaborators Join
1. Invite emails sent
2. Collaborators accept
3. Joined as active member
4. Can participate in sessions

#### Step 5: Track Usage
- Real-time session logs
- Daily cost breakdown
- DIFU balance tracking
- Tier progression

### DIFU Digital Currency

**DIFU** (Digital Instruments For Use) is a digital currency:

**Earning Rules:**
- $1 payment = 100 DIFU
- First purchase bonus = 25 DIFU
- Referral bonus = 50 DIFU per signup

**Spending Rules:**
- 1 DIFU = $1 for future payments
- Transfers between users (no fees)
- No expiration

**Tier System:**
| Tier | DIFU Range | Benefits |
|------|-----------|----------|
| Bronze | 0-99 | Basic |
| Silver | 100-499 | 5% discount |
| Gold | 500-999 | 10% discount + priority support |
| Platinum | 1000-4999 | 15% discount + early access |
| Diamond | 5000+ | 20% discount + dedicated support |

---

## 🛠️ Troubleshooting

### Common Issues

#### Q: "API connection failed"
**A:** Check environment variables in `.env.local`:
```bash
# Verify URLs are correct
echo $VITE_SUPABASE_URL
echo $VITE_API_BASE_URL
```

#### Q: "Clerk authentication failed"
**A:** Ensure Clerk is configured:
1. Check `VITE_CLERK_PUBLISHABLE_KEY` is set
2. Verify domain whitelist in Clerk dashboard
3. Restart dev server

#### Q: "DIFU balance shows 0"
**A:** Migrations may not be applied:
```bash
pwsh scripts/apply-supabase-schema.ps1
```

#### Q: "Voice control not working"
**A:** Check voice provider:
1. Open Editor page
2. Click voice provider dropdown
3. Select "OpenAI Whisper"
4. Verify `VITE_OPENAI_API_KEY` is set

#### Q: "Collaborators not visible"
**A:** Check subscription status:
```bash
# In browser console
fetch('/api/plus1/subscription', {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json()).then(console.log)
```

### Debug Mode

Enable debug logging:
```javascript
// In App.jsx
localStorage.setItem('DEBUG', 'true')
```

View logs:
```bash
# Terminal
npm run dev -- --debug
```

---

## 📦 Project Structure

```
nurds-code/
├── src/
│   ├── components/
│   │   ├── Plus1TeamManager.jsx    # Main Plus 1 component
│   │   ├── VoiceControl.jsx         # Voice interface
│   │   ├── ChatWidget.jsx           # Chat interface
│   │   ├── CircuitBox.jsx           # Circuit box component
│   │   ├── Navbar.jsx               # Navigation with logo
│   │   └── Footer.jsx               # Footer
│   ├── pages/
│   │   ├── Home.jsx                 # Landing page
│   │   ├── Editor.jsx               # Code editor with AI
│   │   ├── AgentBuilder.jsx         # Custom agent builder
│   │   ├── Admin.jsx                # Admin dashboard
│   │   ├── Auth.jsx                 # Auth pages
│   │   ├── Pricing.jsx              # Pricing page
│   │   ├── Subscribe.jsx            # Subscription page
│   │   └── Success.jsx              # Success page
│   ├── server/
│   │   ├── chat.js                  # Chat API
│   │   ├── llm.js                   # LLM integration
│   │   ├── voice.js                 # Voice interface
│   │   ├── voiceAPI.js              # Voice APIs
│   │   └── supabase.js              # Supabase client
│   ├── utils/
│   │   ├── auth.js                  # Auth helpers
│   │   └── fetchAuthed.js           # Authed fetch
│   ├── worker/
│   │   ├── agent-utils.ts           # Worker utilities
│   │   ├── env.d.ts                 # Type definitions
│   │   └── provision.ts             # Provisioning
│   ├── sdk/
│   │   └── vibesdk.js               # VibeSDK
│   ├── services/
│   │   └── boomerAngNaming.js       # Naming service
│   ├── styles/
│   │   └── index.css                # Global styles
│   ├── App.jsx                      # Main app
│   └── main.jsx                     # Entry point
├── workers/
│   ├── api.js                       # Main API
│   └── plus1-api.js                 # Plus 1 API
├── supabase/
│   ├── config.example.toml          # Config template
│   └── migrations/
│       ├── 0001_init.sql            # Initial schema
│       ├── 0002_policies.sql        # RLS policies
│       ├── 0003_collab_rideshare.sql # Collaboration
│       └── 0004_clerk_difu_ledger.sql # Plus 1 + DIFU
├── public/
│   └── nurd-drip-logo.svg           # NURD logo
├── scripts/
│   ├── apply-supabase-schema.ps1    # Apply migrations
│   ├── setup-secrets.ps1            # Setup secrets
│   └── setup-cloudflare-storage.ps1 # Setup Cloudflare
├── vite.config.js                   # Vite config
├── wrangler.toml                    # Cloudflare config
├── tailwind.config.js               # Tailwind config
├── postcss.config.js                # PostCSS config
├── package.json                     # Dependencies
├── schema.sql                       # Database schema
└── README.md                        # Main README
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Manual Testing Checklist
See `SMOKE-TEST-CHECKLIST.md` for comprehensive testing guide.

### Test Scenarios
1. **Create subscription** - Subscribe to Plus 1
2. **Add collaborator** - Invite team member
3. **Make payment** - Process Stripe payment
4. **Check DIFU** - Verify balance increased
5. **Transfer DIFU** - Send credits to collaborator
6. **Chat flow** - Test messaging
7. **Voice control** - Test STT/TTS

---

## 📈 Metrics & Monitoring

### Key Metrics
- **Active subscriptions**: Track on Admin dashboard
- **DIFU transactions**: Check DIFU ledger
- **Collaboration sessions**: View in collab_sessions table
- **API response time**: Monitor in Cloudflare Analytics
- **Error rate**: Check Worker logs

### Monitoring Setup
```bash
# View Cloudflare logs
wrangler logs --env production

# View Supabase logs
supabase log tail
```

---

## 🔐 Security

### Authentication
- Clerk handles user auth via JWT
- All API calls require valid JWT
- Automatic token refresh

### Authorization
- Row-level security (RLS) on all tables
- Users can only access their own data
- Admins have special privileges

### Data Protection
- DIFU ledger is immutable (insert-only)
- All payments verified with Stripe webhooks
- Sensitive data encrypted at rest

### Best Practices
- Never expose API keys in client code
- Use environment variables
- Validate all inputs on backend
- Rate limit API calls (60 req/min)
- Regularly audit access logs

---

## 🚀 Deployment

### Deploy to Production
```bash
# 1. Ensure all tests pass
npm test

# 2. Build frontend
npm run build

# 3. Deploy to Vercel
vercel deploy --prod

# 4. Deploy Cloudflare Worker
wrangler deploy --env production

# 5. Apply any new migrations
pwsh scripts/apply-supabase-schema.ps1
```

### Environment Variables
Set these in your deployment platform:
```
VITE_SUPABASE_URL=prod-url
VITE_SUPABASE_ANON_KEY=prod-key
VITE_CLERK_PUBLISHABLE_KEY=prod-key
VITE_OPENAI_API_KEY=prod-key
VITE_API_BASE_URL=prod-api-url
STRIPE_SECRET_KEY=prod-key
SUPABASE_SERVICE_ROLE_KEY=prod-key
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Main project overview |
| `SETUP-GUIDE.md` | Detailed setup instructions |
| `PLUS-1-IMPLEMENTATION.md` | Plus 1 architecture |
| `SMOKE-TEST-CHECKLIST.md` | QA testing guide |
| `EXECUTION-REPORT.md` | Architecture diagrams |
| `CONVERSATION-DELTA.md` | Session summary |
| `VERIFICATION-COMPLETE.md` | Final verification |

---

## 🤝 Contributing

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Comment complex logic
- Use meaningful variable names

### Commit Messages
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Restructure code
test: Add tests
```

### Pull Request Process
1. Create feature branch
2. Make changes
3. Run tests
4. Submit PR with description
5. Wait for review
6. Merge when approved

---

## 📝 License

Proprietary - All rights reserved

---

## 💬 Support

### Getting Help
1. Check `TROUBLESHOOTING` section above
2. Review documentation files
3. Check error logs
4. Contact support@nurdscode.com

### Reporting Issues
1. Describe the issue
2. Provide error message/logs
3. Include steps to reproduce
4. Share environment details

---

## 🗺️ Roadmap

### Q4 2025
- [x] Plus 1 Team Plan (Tasks 1-5) ✅
- [ ] Collaboration Service (Task 6)
- [ ] Video Integration (Task 7)
- [ ] Breakaway Rooms (Task 8)

### Q1 2026
- [ ] Advanced analytics dashboard
- [ ] Custom agent templates
- [ ] API rate limiting per tier
- [ ] Offline mode support

### Q2 2026
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] Advanced security features

---

## 🎉 Version History

### v1.0.0 (2025-10-31)
- Initial release with Plus 1 Team Plan
- Clerk authentication
- DIFU digital currency
- 8 API endpoints
- Real-time chat

### v0.9.0 (2025-10-01)
- Beta release with core features

---

**Last Updated:** 2025-10-31  
**Status:** Production-Ready  
**Next Phase:** Task 6 - Collaboration Service
