# Deploy Platform - Circuit Box Wiring Diagram

## Architecture Overview

This document maps how all services in the Deploy Platform connect together, organized like an electrical circuit breaker panel.

## Main Power Flow

```
USER REQUEST
    ↓
[CLOUDFLARE WORKERS API] ← Main Breaker
    ↓
    ├──→ [CLERK AUTH] ← Session validation
    ├──→ [SUPABASE DB] ← Data persistence
    ├──→ [LLM GATEWAY] ← AI processing
    ├──→ [VOICE LAYER] ← Speech processing
    ├──→ [STRIPE] ← Billing
    └──→ [ADMIN CONSOLE] ← Superadmin tools
```

## Service Connections

### Tier 1: Core Infrastructure

**Cloudflare Workers API** (breaker-1)
- Connects to: ALL services (main router)
- Endpoints: `/api/*`
- Health: `/api/health`

**Clerk Authentication** (breaker-2)
- Connects to: Workers API, Admin Console
- JWKS URL: `https://precise-lamprey-55.clerk.accounts.dev/.well-known/jwks.json`
- Validates: JWT tokens, user sessions

**Supabase Database** (breaker-3)
- Connects to: Workers API, Admin Console
- URL: `https://qwwjmujbfnwbcyvfmfaj.supabase.co`
- Provides: PostgreSQL, RLS, Real-time

**Admin Console** (breaker-4)
- Connects to: Workers API (requires superadmin)
- Routes: `/admin`, `/api/admin/*`
- Guarded by: ADMIN_ALLOWLIST + Clerk RBAC

### Tier 2: AI & LLM Services

**LLM Gateway** (breaker-5)
- Connects to: Workers API `/api/chat`
- Providers:
  - OpenAI (GPT-4o, GPT-3.5 Turbo)
  - Anthropic (Claude 3.5 Sonnet)
  - GROQ (Llama 3 70B)
  - OpenRouter (DeepSeek V3, Grok)
- Routing: Based on user tier + feature flags

**GPT-5 Feature Flag** (breaker-6)
- Connects to: LLM Gateway
- Status: OFF (wrangler.toml: ENABLE_GPT5="false")
- When enabled: Routes Superior tier to GPT-5

### Tier 3: Voice Integration

**Voice Orchestrator** (breaker-10)
- Connects to: Workers API `/api/voice/*`
- Default: OpenAI Whisper (STT) + OpenAI TTS
- Optional: Deepgram (STT), ElevenLabs (TTS)
- Endpoints:
  - `/api/voice/transcribe` - Speech-to-text
  - `/api/voice/synthesize` - Text-to-speech
  - `/api/voice/voices` - List available voices
  - `/api/voice/conversation` - Real-time chat

### Tier 4: Agent Frameworks

**Multi-Agent Builder Kit** (breaker-15)
- Connects to: Workers API, Editor UI
- Primary: Boomer_Angs (Custom naming system)
- Optional: CrewAI, Microsoft Agent Framework, OpenAI Agents SDK
- Naming Convention: `[UserPrefix]_Ang`
- Status: Core framework ON, others OFF (available for activation)

### Tier 5: Payments

**Stripe Integration** (breaker-20)
- Connects to: Workers API `/api/stripe/*`
- Webhooks: `/api/stripe/webhook`
- Checkout: `/api/stripe/checkout`
- Tiers: Coffee, Lite, Medium, Heavy, Superior

### Tier 6: Storage

**KV Cache** (breaker-25)
- Binding: `CACHE` + `SESSIONS`
- Use: Session storage, API response caching

**R2 Assets** (breaker-26)
- Binding: `ASSETS`
- Use: File uploads, code artifacts

**Durable Objects** (breaker-27)
- Binding: `CHAT_ROOMS`
- Use: Real-time stateful chat rooms

### Tier 7: Security

**Superadmin RBAC** (breaker-30)
- Enforcement: Workers API middleware
- Methods:
  1. Email allowlist (ADMIN_ALLOWLIST env var)
  2. Clerk org + role (CLERK_ORG_ID_SUPERADMINS + CLERK_SUPERADMIN_ROLE)

**Analytics Engine** (breaker-31)
- Binding: `ANALYTICS`
- Tracks: API usage, performance metrics

**Security Scanner (The_Farmer)** (breaker-32)
- Status: OFF (planned integration)
- Will connect to: Code Editor, Build Pipeline
- Purpose: Autonomous vulnerability detection

### Tier 8: Code Execution

**Code Editor** (breaker-35)
- Routes: `/editor`
- Features:
  - Multi-language support
  - Auto language detection
  - Voice integration
  - AI assistant (connected to LLM Gateway)
- Languages: JavaScript, Python, TypeScript, HTML, CSS, Auto

## Power Dependencies

### Critical Path (Always On)
1. Cloudflare Workers API
2. Clerk Authentication
3. Supabase Database
4. LLM Gateway

### Feature-Gated Services
- GPT-5 Routing: OFF by default
- Deepgram/ElevenLabs: OFF until user enables
- Agent Frameworks (non-Boomer_Angs): OFF until user activates
- Security Scanner: OFF (planned)

## Health Check Cascade

```
Admin Dashboard requests circuit status
    ↓
Queries /api/admin/circuit-box
    ↓
Checks each breaker's health_endpoint
    ↓
Returns aggregate status + individual breaker states
```

## Emergency Shutdown Sequence

If a critical service fails:

1. Admin receives alert in Circuit Box Dashboard
2. Affected breaker shows RED status
3. Admin can toggle breaker OFF to isolate issue
4. Dependent services fall back to degraded mode
5. System remains operational for non-dependent features

## Expansion Strategy

When adding new services:

1. Create new breaker in `circuit-box/breakers.yaml`
2. Assign tier and dependencies
3. Add health endpoint
4. Document in wiring diagram
5. Test isolation and failover
6. Deploy to Circuit Box Dashboard

## Cost Tracking by Breaker

Each breaker can report usage costs:

- **LLM Gateway**: Token usage × model pricing
- **Voice Layer**: Minutes × provider rates
- **Stripe**: Transaction fees
- **Storage**: KV ops + R2 storage + DO requests

Aggregated in Admin Console for transparency.

---

*Last Updated: 2025-10-31*  
*Maintained by: ACHIEVEMOR Deploy Team*
