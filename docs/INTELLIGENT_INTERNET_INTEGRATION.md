# Intelligent Internet Integration

NurdsCode integrates with all 19 repositories from the [Intelligent-Internet](https://github.com/Intelligent-Internet) organization to power its AI agent capabilities.

## Installed Repositories

| Repository | Purpose | Status |
|------------|---------|--------|
| **ii-agent** | Core autonomous agent framework | ✅ Installed |
| **ii-researcher** | Deep research agent with web search | ✅ Installed |
| **CommonGround** | Multi-agent collaboration | ✅ Installed |
| **litellm-debugger** | LLM debugging and tracing | ✅ Installed |
| **gemini-cli** | Gemini CLI interface | ✅ Installed |
| **gemini-cli-mcp-openai-bridge** | MCP to OpenAI bridge | ✅ Installed |
| **II-Commons** | Shared utilities | ✅ Installed |
| **ii-agent-community** | Community extensions | ✅ Installed |
| **ii-thought** | Chain-of-thought reasoning | ✅ Installed |
| **codex** | OpenAI Codex integration | ✅ Installed |
| **codex-as-mcp** | Codex as MCP server | ✅ Installed |
| **PPTist** | AI presentation generation | ✅ Installed |
| **Common_Chronicle** | Event logging | ✅ Installed |
| **Symbioism-Nextra** | Documentation | ✅ Installed |
| **Symbioism-TLE** | Temporal logic engine | ✅ Installed |
| **reveal.js** | Interactive presentations | ✅ Installed |
| **ghost-gcp-storage-adapter** | GCP storage bridge | ✅ Installed |
| **ii_verl** | Verification & RL | ✅ Installed |
| **CoT-Lab-Demo** | CoT demonstrations | ✅ Installed |

## Quick Start

### 1. Configure Environment

Copy the environment template and fill in your API keys:

```powershell
Copy-Item docker/env.docker.example .env
# Edit .env with your values
```

### 2. Start Docker Stack

```powershell
./scripts/run_stack.ps1 -Build
```

This starts:
- **PostgreSQL** - Database for agents and user data
- **Redis** - Caching and job queue
- **II-Agent Backend** - Core agent runtime
- **II-Sandbox Server** - Code execution sandbox
- **II-Tool Server** - Tool execution server
- **NurdsCode Frontend** - React UI
- **API Gateway** - Cloudflare Worker (local mode)

### 3. Access Services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:80 |
| API Gateway | http://localhost:8787 |
| II-Agent Backend | http://localhost:8000 |
| Sandbox Server | http://localhost:8100 |
| Tool Server | http://localhost:1236 |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     NurdsCode Frontend                       │
│                    (React + Vite + CSS)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Cloudflare Workers API                      │
│              (Edge Gateway + Auth + Routing)                 │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  II-Agent       │ │  II-Sandbox     │ │  II-Tool        │
│  Backend        │ │  Server         │ │  Server         │
│  (Agent Core)   │ │  (Code Exec)    │ │  (Tool Exec)    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL + Redis                            │
│            (State, Jobs, Caching)                            │
└─────────────────────────────────────────────────────────────┘
```

## Using the Integration

### Execute Agent Task

```javascript
import { executeAgentTask } from './services/ii-integration';

const result = await executeAgentTask(
  'Research the latest developments in AI agents and create a summary',
  {
    model: 'claude-3-5-sonnet',
    tools: ['web_search', 'code_execution'],
    timeout: 120000
  }
);
```

### Execute Research

```javascript
import { executeResearch } from './services/ii-integration';

const research = await executeResearch(
  'What are the best practices for building autonomous AI agents?',
  {
    depth: 'deep',
    sources: ['web', 'arxiv', 'github']
  }
);
```

### Check Stack Health

```javascript
import { checkStackHealth } from './services/ii-integration';

const health = await checkStackHealth();
// { backend: 'healthy', sandbox: 'healthy', tools: 'healthy' }
```

## Required Environment Variables

### LLM Providers (at least one required)

- `ANTHROPIC_API_KEY` - Claude models
- `OPENAI_API_KEY` - GPT models
- `GOOGLE_AI_API_KEY` - Gemini models

### Search Providers

- `TAVILY_API_KEY` - Primary web search
- `SERP_API_KEY` - Google search fallback
- `FIRECRAWL_API_KEY` - Web scraping

### Infrastructure

- `POSTGRES_*` - Database configuration
- `REDIS_PORT` - Redis cache
- `E2B_API_KEY` - Sandbox provider

## Troubleshooting

### Services not starting

```powershell
# View logs
./scripts/run_stack.ps1 -Logs

# View specific service logs
docker compose logs ii-agent-backend
```

### Database connection issues

```powershell
# Ensure PostgreSQL is healthy
docker compose ps postgres
docker compose logs postgres
```

### Reset everything

```powershell
./scripts/run_stack.ps1 -Down
docker volume rm nurdscode_postgres_data nurdscode_redis_data
./scripts/run_stack.ps1 -Build
```

## Remote Access (iPad)

For iPad access, enable ngrok tunnel:

```powershell
./scripts/run_stack.ps1 -Build -Tunnel
```

Then access via the ngrok URL at http://localhost:4040
