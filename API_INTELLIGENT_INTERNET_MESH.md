# API: Nurds Code + Intelligent Internet Mesh

This document describes the current Nurds Code edge API surfaces that relate to the Intelligent Internet “mesh”, plus recommended internal service contracts.

## 1) Current edge endpoints (implemented)

### ACHEEVY
- `POST /api/v1/acheevy/find`
  - Purpose: hybrid search (web + local knowledge, if configured)
  - Input: `{ query, limit?, sources? }`
  - Output: `{ success: true, query, results: [...] }`

- `POST /api/v1/acheevy/scout`
  - Purpose: web search with “capture” behavior (search + main-content scrape)
  - Input: `{ query, limit? }`
  - Output: `{ success: true, query, limit, results: [...] }`

- `POST /api/v1/acheevy/chat`
  - Purpose: conversational call into the ACHEEVY experience.

- `POST /api/v1/acheevy/execute`
  - Purpose: higher-agency execution (multi-step) when available.

Notes:
- Auth is enforced via the Worker auth middleware.
- Token usage/billing (LUC) is server-authoritative when provider usage is available.

## 2) Recommended internal service contracts (for 19-repo mesh)

These contracts are suggested to keep the edge API stable even as services evolve.

### 2.1 Orchestrator (BoomerAng)
- `POST /orchestrate`
  - Input: `{ task, mode, agent_level, circuit_box, context? }`
  - Output: `{ runId, status, artifacts: [], logs: [] }`

### 2.2 Research
- `POST /research`
  - Input: `{ query, constraints?, sources?, maxDepth?, maxParallel? }`
  - Output: `{ reportMarkdown, citations: [], artifacts: [] }`

### 2.3 Knowledge (RAG)
- `POST /index`
  - Input: `{ documents: [{ id, title, content, sourceUrl? }] }`
  - Output: `{ indexed: n }`

- `POST /query`
  - Input: `{ query, topK?, filters? }`
  - Output: `{ matches: [{ id, score, snippet, sourceUrl? }] }`

### 2.4 Presentation (Slides)
- `POST /slides`
  - Input: `{ title, outline?, markdown?, assets? }`
  - Output: `{ fileUrl, format: 'pptx'|'html' }`

## 3) Security + tenancy

- Prefer per-user tenancy keys on internal requests (Worker → internal service).
- Store audit records in an append-only log (Common_Chronicle).
- Avoid passing raw secrets downstream; instead pass scoped tokens.

## 4) Observability

- Emit per-request usage events from the edge (LUC meter events).
- Centralize logs for internal services (litellm-debugger, cloud logging).
