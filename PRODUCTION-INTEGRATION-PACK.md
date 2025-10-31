# Nurds Code — Production Integration Pack (Aligned to Status Report)

Date: 2025-10-31

This document reflects your actual, production-ready architecture today. It replaces prior template assumptions (Daytona/Modal runtime, per-user Supabase instances) with your real stack and wiring.

---

## 0) What changed vs prior template

- Removed Daytona/Modal from active paths (kept only in Roadmap; not integrated).
- Confirmed single Supabase project with RLS multi-tenancy (no per-user instances).
- Standardized background to pure black #000 (Nothing-brand).
- Clerk remains the sole auth/paywall.
- Default LLM = Groq for Free/Coffee; higher tiers can route via AI Gateway/OpenRouter later.
- Tutorial flow is deferred; security stack (Semgrep/Snyk/Trivy/PKI) documented as “future”.

---

## 1) Stack overview (current, prod-ready)

```text
Client (React 19 + Vite + Tailwind) ── Cloudflare Pages (static UI)
                 │
                 ▼
Cloudflare Worker (workers/api.js)
  • Auth: Clerk (JWT → JWKS verify) + /api/auth/me
  • DB: Supabase (single project, RLS isolation)
  • LLM: Default Groq (free); optional AI Gateway/OpenRouter in Pro/Enterprise later
  • Voice: OpenAI Whisper (STT/TTS) + optional Deepgram/ElevenLabs
  • ACHEEVY: optional orchestrator bridge via AGENT_CORE_URL
  • Stripe checkout + webhook endpoints

Supabase (Postgres + RLS)
  • tenants, users, plugs, projects, usage_counters, billing_maps, messages, events, api_keys
```

Key files:

- Frontend: `src/App.jsx`, `src/pages/*`, `src/components/*`, `src/styles/index.css`
- Worker: `workers/api.js`
- Voice: `src/server/voice.js`, `src/server/voiceAPI.js`
- Chat/LLM: `src/server/chat.js`, `src/server/llm.js`
- Supabase: `supabase/migrations/*.sql`, `src/server/supabase.js`, `src/worker/provision.ts`

---

## 2) Environment & config

### 2.1 .env (local only; mirror to Wrangler vars/secrets)

```bash
# Runtime
NODE_ENV=development
VITE_API_URL=http://127.0.0.1:8787

# Clerk (frontend + backend)
VITE_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_JWKS_URL=https://<your-subdomain>.clerk.accounts.dev/.well-known/jwks.json
CLERK_FRONTEND_API_URL=https://<your-subdomain>.clerk.accounts.dev
CLERK_BACKEND_API_URL=https://api.clerk.com

# Supabase (single project)
VITE_SUPABASE_URL=https://qwwjmujbfnwbcyvfmfaj.supabase.co
VITE_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...   # keep secret (Worker only)

# LLM / Voice / Payments
GROQ_API_KEY=grq_...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: ACHEEVY / AI Gateway
AGENT_CORE_URL=
AI_GATEWAY_ACCOUNT_ID=
AI_GATEWAY_GATEWAY_NAME=nurdscode-gateway
```

Do not commit real secrets. `.env` is gitignored.

### 2.2 wrangler.toml (dev-friendly; matches current repo)

```toml
name = "nurdscode-api"
main = "workers/api.js"
compatibility_date = "2024-10-30"
workers_dev = true

[vars]
SUPABASE_URL = "https://qwwjmujbfnwbcyvfmfaj.supabase.co"
SUPABASE_ANON_KEY = "<anon>"
VOICE_ENABLED = "true"
VOICE_DEFAULT_PROVIDER = "openai"
OPENAI_VOICE_MODEL = "whisper-1"
OPENAI_TTS_MODEL = "tts-1"
OPENAI_TTS_VOICE = "alloy"
ENABLE_GPT5 = "false"
AGENT_CORE_URL = ""
CLERK_FRONTEND_API_URL = "https://<your-subdomain>.clerk.accounts.dev"
CLERK_BACKEND_API_URL = "https://api.clerk.com"
CLERK_JWKS_URL = "https://<your-subdomain>.clerk.accounts.dev/.well-known/jwks.json"
ADMIN_ALLOWLIST = ""
CLERK_ORG_ID_SUPERADMINS = ""
CLERK_SUPERADMIN_ROLE = "owner"
STRIPE_PUBLISHABLE_KEY = "pk_live_..."
AI_GATEWAY_ACCOUNT_ID = ""
AI_GATEWAY_GATEWAY_NAME = "nurdscode-gateway"
MAX_REQUESTS_PER_MINUTE = "60"
RESPONSE_TIMEOUT_MS = "30000"

[ai]
binding = "AI"

# Dev server
[dev]
port = 8787
local_protocol = "http"

compatibility_flags = [
  "nodejs_compat",
  "transformstream_enable_standard_constructor",
  "streams_enable_constructors"
]

[observability]
enabled = true

[env.production]
name = "nurdscode-api-prod"
route = "api.nurdscode.com/*"
```

> Secrets for production must be set via Wrangler secrets, not vars.

---

## 3) Supabase: multi-tenant schema + RLS

You are using one Supabase project with tenant isolation via RLS. Migrations are present in `supabase/migrations`.

Apply via Supabase Dashboard (easiest):

1) Open SQL editor: Project → SQL → New query
2) Paste and run `supabase/migrations/0001_init.sql`
3) Paste and run `supabase/migrations/0002_policies.sql`

Or via CLI/psql (requires service role):

```powershell
# PowerShell (uses psql) — replace [PASSWORD] with your service role key
pwsh -File scripts/apply-supabase-schema.ps1 -ConnectionString "postgresql://postgres:[PASSWORD]@db.qwwjmujbfnwbcyvfmfaj.supabase.co:5432/postgres"

# Or Supabase CLI
npx supabase db push
```

---

## 4) Worker (API edge): auth, LLM, voice, ACHEEVY

- Auth: Clerk JWKS verification implemented in `workers/api.js` with `/api/auth/me`.
- Chat: `/api/chat` proxies to ACHEEVY (`AGENT_CORE_URL`) when set; otherwise uses local `chatHandler` (`src/server/chat.js`).
- Voice: `/api/voice/*` endpoints — default OpenAI Whisper STT/TTS; Deepgram/ElevenLabs optional.
- Stripe: checkout + webhook endpoints present (set secrets first).

LLM routing today (from `src/server/llm.js`):

- Free/Coffee → Groq (e.g., llama-based)
- Pro → OpenAI (gpt-4o-mini) [can switch to AI Gateway later]
- Enterprise → Anthropic (claude family) [configurable]

---

## 5) UI & theme (Nothing-brand)

Global theme is defined in `src/styles/index.css`:

- Background: `#000000`
- Text: `#F2F7FF` (Frosty white)
- Neon: `#39FF14`
- Gold: `#C9A449`
- Tagline: `#FFC83B` (Neon Honey Gold)
- Fonts: Doto (body, heavier weights enabled), Permanent Marker (tagline)

Pages:

- `/` Home (Nothing-brand tagline)
- `/pricing` 7 tiers (Free → Superior) + $2.99 build fee (cashback 30% platform credit)
- `/subscribe`, `/success` (Stripe)
- `/editor` (AI assistant + VoiceControl)
- `/admin` (superadmin console + Circuit Box)
- `/agents` (Boomer_Angs agent builder)

---

## 6) Dev & prod commands

Development (two terminals):

```powershell
npm run worker:dev      # API on http://127.0.0.1:8787
npm run dev             # UI on http://localhost:3000 (Vite proxies /api → 8787)
```

Production deploy:

```powershell
npm run worker:deploy:prod   # Deploy Worker
# Optionally build & deploy Pages (if used):
npm run build
wrangler pages deploy dist
```

Wrangler secrets (interactive):

```powershell
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put CLERK_SECRET_KEY   # only if using Clerk Management API server-side
```

---

## 7) Validation checklist

- [ ] `.env` populated; secrets mirrored via Wrangler secrets.
- [ ] Supabase migrations applied; admin user row created and mapped to a tenant.
- [ ] Clerk tokens verified at `/api/auth/me` (same-origin cookie or Bearer).
- [ ] `/api/chat` returns Groq-backed reply for free tier.
- [ ] Voice endpoints respond; `/api/voice/voices` returns OpenAI voices.
- [ ] UI shows Permanent Marker tagline on pure black; neon accents visible.

---

## 8) Roadmap (future; not live today)

- Daytona/Modal as optional build orchestrators (documented when integrated).
- Cloudflare AI Gateway routing for Pro/Enterprise tiers (OpenAI/Anthropic via Gateway URLs).
- Security stack (Semgrep, Snyk, Trivy, PKI, blockchain anchoring) as opt-in production hardening.
- Tutorial flow + onboarding chatbot (ACHEEVY-driven) and “plug” deployment pipeline.

---

## 9) Notes on secrets & safety

- Never commit real keys. Rotate any secrets pasted into tracked files.
- Prefer Wrangler secrets for Worker-only keys.
- Keep `.env` purely local and out of version control.

---

This pack is aligned to your current repo and can be handed off as the single source of truth for running and deploying Nurds Code today.
