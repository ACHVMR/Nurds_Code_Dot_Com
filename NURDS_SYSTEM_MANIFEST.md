# NURDS SYSTEM MANIFEST v2.0
# Digital Constitution for ACHEEVY + _Ang Workers + V.I.B.E. IDE

## Platform Identity
- **Platform:** NurdsCode (Community-driven, STEAM-powered)
- **Tagline:** "Think It. Prompt It. Build It."
- **Tiers:** Curious Nurd (Free) → Growing Nurd ($29) → Expert Nurd ($99)
- **Operating Model:** Binge Vibe Coding (BVC) — parallel work streams, ship as complete

## Core Actors

### ACHEEVY (Digital CEO / Orchestrator)
- **Role:** Executive director, task decomposer, decision-maker
- **Never:** A worker; always orchestrates other agents
- **Powers:** 
  - Decompose user intent → tasks
  - Select and spawn _Ang workers for execution
  - Query Scholar_Ang (RAG knowledge)
  - Monitor work + enforce quality gates
- **Visual Identity:** Sleek helmet avatar (chat interface), professional office scene (hero image)
- **Powered by:** ii-agent orchestration + Model Garden + Supabase

### _Ang Workers (Agent Roster)

**Standard Naming:** `[ActionOrRole]_Ang`

**Canonical Types:**
- `Coding_Ang` — Code generation, writing, editing
- `Testing_Ang` — Test execution, validation, quality gates
- `Scholar_Ang` — Knowledge retrieval, RAG, documentation
- `Forge_Ang` — Deployment, infrastructure, CI/CD
- `Architect_Ang` — System design, patterns, decisions
- `Designsmith` — Design system, component creation (EXCEPTION)
- `Optimizer_Ang` — Performance profiling, tuning
- `Connector_Ang` — Third-party APIs, integrations
- `Investigation_Ang` — Debugging, diagnostics, root cause
- `Slidemaking_Ang` — Presentation generation
- `Artistic_Ang` — Visual design, creative assets

**Exception Names** (Non-standard, contextual):
- `Picker_Ang` — Tool selection, component evaluation
- `Buildsmith` — App assembly, orchestration of building process

**Rule:** New agents MUST follow `[Action]_Ang` unless explicitly approved as exception.

## 19 Intelligent Internet Repos → Nurds Branding

| Source | Nurds Name | Category | Primary User |
|--------|-----------|----------|--------------|
| ii-agent-core | nurds-orchestrator-core | Orchestration | ACHEEVY, all _Ang workers |
| ii-rag-service | nurds-rag-engine | Knowledge/RAG | Scholar_Ang, ACHEEVY |
| ii-eval-framework | nurds-eval-lab | Testing | Testing_Ang |
| ii-test-runner | nurds-test-runner | Execution | Testing_Ang |
| ii-code-gen | nurds-code-generator | Code Gen | Coding_Ang |
| ii-deployment | nurds-deployment-orchestrator | Deployment | Forge_Ang |
| ii-vector-store | nurds-vector-store | Embeddings | nurds-rag-engine |
| ii-realtime | nurds-realtime-sync | Collaboration | IDE Shell (WebSocket) |
| ii-auth-service | nurds-auth-service | Authentication | API Gateway |
| ii-payment-service | nurds-payment-gateway | Billing | Stripe integration |
| ii-model-router | nurds-model-garden | Model Selection | ACHEEVY, all _Ang workers |
| ii-monitoring | nurds-observability-hub | Logging/Monitoring | Forge_Ang, Optimizer_Ang |
| ii-cache-layer | nurds-cache-engine | Performance | All services |
| ii-security | nurds-security-core | Auth/Encryption | API Gateway |
| ii-api-framework | nurds-api-foundation | API Layer | All services |
| ii-database-orm | nurds-data-access | ORM/Query | All services |
| ii-messaging | nurds-message-queue | Async | All services |
| ii-worker-pool | nurds-agent-runtime | Agent Execution | ACHEEVY runtime |
| ii-telemetry | nurds-telemetry-core | Analytics | All services |

## Model Garden (Abstraction Layer)

**Rule:** Never use provider names in code. Use logical names.

```json
{
  "models": {
    "gpt_4_1": { "provider": "openai", "modality": ["text"], "cost": "high", "speed": "standard" },
    "gemini_2_5_flash": { "provider": "google", "modality": ["text", "image"], "cost": "low", "speed": "fast" },
    "claude_3_5_sonnet": { "provider": "anthropic", "modality": ["text"], "cost": "medium", "speed": "standard" },
    "deepseek_coder": { "provider": "deepseek", "modality": ["text"], "cost": "low", "speed": "fast" },
    "llama_3_1": { "provider": "groq", "modality": ["text"], "cost": "low", "speed": "ultra-fast" }
  },
  "routing": {
    "reasoning": "gpt_4_1",
    "code_gen": "deepseek_coder",
    "fast_chat": "gemini_2_5_flash",
    "complex_tasks": "claude_3_5_sonnet",
    "local_option": "llama_3_1"
  }
}
```

## V.I.B.E. IDE Shell (Training Mode)

### Component Hierarchy (Locked)
```
VibeIdeShell
├─ TopBezel
│  ├─ ACHEEVY Branding + Avatar (chat image)
│  ├─ Global Notifications
│  └─ Platform Loader (select context)
├─ MainContentWindow
│  ├─ Code Editor (Cloudflare Vibe SDK)
│  ├─ Terminal / Output
│  └─ Quick Actions (Upload, Run, Test)
├─ RightMarginRail
│  ├─ Live Preview / AI Output
│  ├─ Collaboration Panel (video, presence)
│  ├─ Test Results (when in testing mode)
│  └─ Context Info (model, tokens, time)
└─ ActionToggleStrip
   ├─ File Upload
   ├─ Model Switcher
   └─ Settings / Theme Toggle
```

### Design System (Locked)
- **Themes:** Matte Black (primary), Frosty White
- **Fonts:** Permanent Marker (titles), Railway/Dot-matrix (UI)
- **Primary Colors:** Neon green (#00FF41), Golden orange (#FFA500), Cyan (#00D9FF)
- **Buttons:** Bright green (primary), Orange (secondary), Cyan (tertiary)
- **Profile Card Border:** Cyan/orange neon frame
- **Footer Logo:** "Made in PLR" tropical badge (right-aligned)
- **Spacing:** 8px grid system
- **Border Radius:** 8px (smooth), 12px (cards)

## API Integration Stack

### Authentication
- GitHub OAuth, Google OAuth, Voice (future)
- Supabase Auth (backend)

### Real-Time
- WebSocket (Supabase Realtime) for code sync, presence, notifications

### Payments
- Stripe (subscription, invoicing, usage-based billing)

### AI Services
- OpenAI (GPT-4.1), Anthropic (Claude 3.5), Google (Gemini), xAI (Grok), GROQ (Llama), DeepSeek

### Database & Storage
- Supabase PostgreSQL (main DB)
- Supabase Vector Store (RAG indexing)
- Cloudflare D1 (edge caching)
- Supabase Storage (file uploads)

### Deployment & Infrastructure
- Cloudflare Workers (serverless functions)
- Cloudflare D1 (edge database)
- Docker (containerization)
- GitHub Actions (CI/CD)

## Golden Rules (AI Coding Editor Must Memorize)

1. **Agent naming is action-first.** `Coding_Ang`, `Testing_Ang`, not `Boomer_Ang.Coder`.
2. **Exceptions exist but are rare.** `Buildsmith`, `Designsmith`, `Picker_Ang` — approved only.
3. **ACHEEVY is CEO.** Never a worker. Always orchestrates.
4. **Models are abstract.** Use logical names (`model.gpt_4_1`), never direct API calls.
5. **19 repos are knowledge-first.** Assume RAG-indexed unless task requires runtime.
6. **Component hierarchy locked.** VibeIdeShell structure is immutable.
7. **Design system mandatory.** Every color, font, spacing from theme. Profile cards use neon border.
8. **Training IDE is P0.** Everything contextual to learning paths.
9. **Tier-aware UI.** Feature access locked to subscription level.
10. **Ship complete.** No TODOs, no stubs, no placeholders.
11. **Supabase is backbone.** Auth, realtime, vectors, DB—use consistently.
12. **BVC Model.** No time-blocking. Work streams complete independently and ship.
13. **Parallel execution.** ACHEEVY coordinates multiple _Ang workers simultaneously.
14. **Visual branding locked.** ACHEEVY avatar (chat), office scene (hero), profile cards (neon border), PLR footer (right-aligned).
