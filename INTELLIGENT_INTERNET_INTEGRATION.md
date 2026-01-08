# 19-Repo Intelligent Internet Stack Integration

## Implementation Complete ✅

This document summarizes the integration of the 19-Repo Intelligent Internet Stack with ACHEEVY, implementing a cost-optimized multi-model, multi-agent architecture.

---

## Components Built

### 1. Model Router (`workers/sdk/model-router.js`)
**Purpose**: Multi-model routing with 70-80% cost savings vs GPT-4o

**Cost Comparison**:
| Model | Input (per 1M) | Output (per 1M) | Savings |
|-------|---------------|-----------------|---------|
| GPT-4o | $2.50 | $10.00 | Baseline |
| Gemini 3 Flash | $0.15 | $0.60 | 70% |
| GLM 4.7 | $0.14 | $0.56 | 80% |
| Workers AI | $0.10 | $0.10 | 95% |

**Mode Routing**:
- `brainstorm` → Gemini 3 Flash (reasoning index 71.3)
- `nurd_out` → Gemini 3 Flash (planning & architecture)
- `agent` → GLM 4.7 (code generation)
- `edit` → GLM 4.7 (fast & cheap)

---

### 2. Gemini CLI MCP Adapter (`workers/src/agents/gemini-cli-adapter.js`)
**Purpose**: Wrap Gemini CLI as MCP micro-service

**Tools**:
- `gemini_reasoning` - Analysis frameworks (4-question-lens, SWOT, OKR, six-sigma)
- `gemini_code_analysis` - Code review, complexity, patterns
- `gemini_documentation` - README, API docs, tutorials
- `gemini_architecture` - System design, component diagrams

---

### 3. Google File Manager (`workers/src/integrations/google-file-manager.js`)
**Purpose**: Persistent memory via Google Drive API

**Features**:
- `saveDocument()` / `getDocument()` - File CRUD
- `saveSessionContext()` / `getSessionContext()` - Session persistence
- `appendToSessionLog()` - Flight Recorder pattern
- `logDecision()` - Decision audit trail
- `saveArtifact()` - Code/spec storage
- `searchByTag()` - Tag-based retrieval

**Fallback**: In-memory Map when Google credentials unavailable

---

### 4. Codex LoRA (`workers/src/agents/codex-lora.js`)
**Purpose**: Fine-tuned code generation with Cloudflare Workers AI

**LoRA Registry**:
| ID | Name | Category | Languages |
|----|------|----------|-----------|
| `nurds-react` | NURDS React Patterns | frontend | js, ts, jsx, tsx |
| `nurds-workers` | NURDS Cloudflare Workers | backend | js |
| `nurds-sdk` | NURDS SDK Patterns | sdk | js, ts |
| `nurds-sql` | NURDS D1 SQL | database | sql |

**Generation Methods**:
- `generateCode()` - Generic code with LoRA
- `generateReactComponent()` - React + Tailwind + Framer
- `generateWorkerRoute()` - itty-router endpoints
- `generateMigration()` - D1 SQLite migrations

---

### 5. Open Hands Orchestrator (`workers/src/orchestrator/open-hands.js`)
**Purpose**: Multi-agent co-execution coordinator

**Execution Modes**:
| Mode | Phase | Primary Model | Agents |
|------|-------|---------------|--------|
| BRAINSTORMING | BRAINSTORM | Gemini 3 Flash | gemini-cli, ii-researcher, ii-nlu |
| NURD_OUT | FORMING | Gemini 3 Flash | ii-architect, ii-planner, ii-reasoning |
| AGENT_MODE | AGENT | GLM 4.7 | ii-codegen, codex-lora, ii-deploy, ii-test |
| EDIT_MODE | AGENT | GLM 4.7 | glm-fast, ii-validation, ii-security |

**Strategies**:
- `research-chain` - II-Researcher → Gemini CLI
- `architecture-chain` - II-Architect → Gemini CLI → File Manager
- `code-gen-chain` - II-Codegen → Codex LoRA → II-Test
- `quick-edit` - GLM Fast single-agent

---

### 6. MCP Server Registry (`workers/src/mcp/registry.js`)
**Purpose**: Unified registry for all 19 II-Agents + Local Services

**19 II-Agents**:
1. `ii-nlu` - Natural Language Understanding
2. `ii-researcher` - Web research, fact checking
3. `ii-codegen` - Code generation
4. `ii-architect` - System design
5. `ii-planner` - Task breakdown, OKRs
6. `ii-test` - Test generation
7. `ii-deploy` - Deployment
8. `ii-validation` - Code review
9. `ii-security` - Vulnerability scanning
10. `ii-reasoning` - Logic, problem solving
11. `ii-docs` - Documentation
12. `ii-design` - UI/UX patterns
13. `ii-data` - ETL, analysis
14. `ii-integration` - Third-party APIs
15. `ii-perf` - Performance optimization
16. `ii-database` - Query optimization
17. `ii-debug` - Error analysis
18. `ii-ml` - Model selection
19. `ii-orchestrator` - Workflow coordination

**Local Services**:
- `gemini-cli` - Reasoning adapter
- `codex-lora` - LoRA code generation
- `google-file-manager` - Persistent storage
- `model-router` - Multi-model routing

**Routing Rules**:
- Intent-based (research → ii-researcher)
- Phase-based (BRAINSTORM → gemini-cli)
- Mode-based (agent_mode → ii-codegen)
- Language-based (javascript → codex-lora)

---

## API Endpoints

### Orchestrator Routes (`/api/v1/orchestrator/*`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/session/start` | Start orchestrated session |
| POST | `/session/switch` | Switch execution mode |
| POST | `/execute` | Execute task with multi-agent |
| GET | `/session/:id/summary` | Get execution summary |
| POST | `/route` | Route to optimal model |
| GET | `/models` | List models with cost comparison |
| GET | `/mcp/discover` | MCP discovery |
| GET | `/mcp/health` | MCP health check |
| GET | `/agents` | List all agents |
| POST | `/agents/route` | Route task to agents |
| POST | `/codex/generate` | Generate code with LoRA |
| GET | `/codex/loras` | List LoRA adapters |
| POST | `/gemini/analyze` | Analyze with Gemini |
| GET | `/gemini/tools` | List Gemini tools |
| POST | `/memory/save` | Save to persistent memory |
| GET | `/memory/:sessionId` | Get session context |
| GET | `/modes` | List execution modes |

---

## D1 Migration

**File**: `workers/migrations/0007_orchestrator_tables.sql`

**Tables**:
- `orchestrator_sessions` - Session state
- `orchestrator_executions` - Task log
- `agent_calls` - Agent invocation log
- `model_routing_log` - Model selection log
- `lora_usage_log` - LoRA usage tracking

**Run Migration**:
```bash
npx wrangler d1 execute nurdscode-db --file=workers/migrations/0007_orchestrator_tables.sql --remote
```

---

## Environment Variables Needed

```toml
# wrangler.toml or wrangler secret

# Google Drive (for File Manager)
GOOGLE_DRIVE_FOLDER_ID = "your-folder-id"
GOOGLE_CREDENTIALS = '{"client_email": "...", "private_key": "..."}'

# External Models
GEMINI_API_KEY = "your-gemini-key"
GLM_API_KEY = "your-glm-key"
OPENAI_API_KEY = "your-openai-key"  # Fallback

# II-Agent URLs (GCP Cloud Run)
II_NLU_URL = "https://ii-nlu-worker-xyz.run.app"
II_RESEARCHER_URL = "https://ii-researcher-worker-xyz.run.app"
II_CODEGEN_URL = "https://ii-codegen-worker-xyz.run.app"
# ... (all 19 agents)
II_AGENT_TOKEN = "your-agent-token"
```

---

## Usage Example

```javascript
// Start session in Brainstorming mode
const session = await fetch('/api/v1/orchestrator/session/start', {
  method: 'POST',
  body: JSON.stringify({ mode: 'BRAINSTORMING' })
}).then(r => r.json());

// Execute research task
const result = await fetch('/api/v1/orchestrator/execute', {
  method: 'POST',
  body: JSON.stringify({
    sessionId: session.sessionId,
    task: 'Research best practices for React performance optimization'
  })
}).then(r => r.json());

// Switch to Agent Mode for implementation
await fetch('/api/v1/orchestrator/session/switch', {
  method: 'POST',
  body: JSON.stringify({
    sessionId: session.sessionId,
    mode: 'AGENT_MODE'
  })
});

// Generate code with LoRA
const code = await fetch('/api/v1/orchestrator/codex/generate', {
  method: 'POST',
  body: JSON.stringify({
    prompt: 'Create a React component with virtualized list',
    language: 'jsx',
    loraId: 'nurds-react'
  })
}).then(r => r.json());
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     NURDS Code Frontend                          │
│                  (React + Vite + Tailwind)                       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Cloudflare Workers (Edge API)                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              /api/v1/orchestrator/*                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │ Open Hands   │  │ Model Router │  │ MCP Registry │   │    │
│  │  │ Orchestrator │  │ (Gemini/GLM) │  │ (19 Agents)  │   │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │    │
│  │         │                 │                 │           │    │
│  │         ▼                 ▼                 ▼           │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │    │
│  │  │ Gemini CLI   │  │ Codex LoRA   │  │ Google File  │   │    │
│  │  │ Adapter      │  │ (Workers AI) │  │ Manager      │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                     D1 Database (SQLite)                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Gemini 3 Flash  │ │    GLM 4.7      │ │ GCP Cloud Run   │
│ (Reasoning)     │ │ (Code Gen)      │ │ (19 II-Agents)  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## Next Steps

1. **Deploy Worker**: `npx wrangler deploy`
2. **Run Migration**: `npx wrangler d1 execute nurdscode-db --file=workers/migrations/0007_orchestrator_tables.sql --remote`
3. **Set Secrets**: Add API keys via `npx wrangler secret put`
4. **Deploy II-Agents**: Deploy 19 agents to GCP Cloud Run
5. **Frontend Integration**: Wire up Chat w/ACHEEVY to new endpoints

---

*Implementation completed: 2025*
