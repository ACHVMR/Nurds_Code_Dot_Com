# Intelligent Internet → Nurds Code: Sovereign AI Stack Blueprint

This document maps the Intelligent Internet ecosystem into the Nurds Code platform as an unlockable, modular “Plug OS”.

This is a product-facing blueprint (what users should understand), not an implementation checklist.

## 1) The 5-Layer Architecture (What Users See)

### Layer 1: Sovereign Agents (Active Workforce)
- **ii-agent** → **BoomerAng** (AI orchestrator)
- **ii-researcher** → **Deep Research Engine**
- **codex** → **V.I.B.E. IDE Core**
- **ii-agent-community** → **Persona Library**

### Layer 2: Protocol & Bridge (Cost/Interop Infrastructure)
- **gemini-cli-mcp-openai-bridge** → universal adapter / low-cost routing
- **litellm-debugger** → token + cost observability
- **codex-as-mcp** → universal coding interface

### Layer 3: Orchestration (Team Management)
- **CommonGround** → multi-agent “Team Hub” (PPA)
- **Common_Chronicle** → audit ledger / Proof-of-Benefit groundwork
- **ghost-gcp-storage-adapter** → publishing pipeline

### Layer 4: Knowledge & Training (Intelligence Foundation)
- **II-Commons** → RAG knowledge base / vector layer
- **ii-thought** → reasoning dataset
- **ii_verl** → fine-tuning workflows
- **CoT-Lab-Demo** → reasoning visualization

### Layer 5: Presentation (What Users Consume)
- **PPTist** → slide deck generation
- **Symbioism-Nextra** → documentation portal
- **Reveal.js** → HTML presentations

## 2) UX Flow (Reference)

```text
1) User requests research
2) BoomerAng delegates to Deep Research
3) Research runs parallel searches via the bridge
4) Results recorded in Common_Chronicle
5) User requests slides
6) BoomerAng calls PPTist → generates deck
```

## 3) Deployment Options (Conceptual)

- **À la carte (solo dev):** run the edge stack + a small subset of services.
- **Chained pipeline:** run orchestration + research + knowledge services.
- **Enterprise mesh:** run the full 19-repo ecosystem with multi-cloud routing.

## 4) Notes on Costs

Any cost comparison numbers should be treated as examples. Real costs vary with:
- model/provider pricing
- prompt/response sizes
- tool usage (search/scrape, code execution)
- caching + dedupe
- routing policy

## 5) Where this shows up in the app

The ACHEEVY dashboard loads a user-facing blueprint dynamically from:
- `public/blueprints/intelligent-internet-ecosystem.md`

This keeps the UI simple while allowing the blueprint content to evolve.
