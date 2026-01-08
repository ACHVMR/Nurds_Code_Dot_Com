# Intelligent Internet → Nurds Code: Sovereign AI Stack (User-Facing Blueprint)

This section is the user-facing, dynamic breakdown that maps the Intelligent Internet ecosystem into Nurds Code’s unlockable Plug platform.

## The 5-Layer Architecture (What Users See)

### Layer 1: Sovereign Agents (Active Workforce)
- **ii-agent** → **BoomerAng** (orchestrator, Level 1)
- **ii-researcher** → **Deep Research Engine** (Level 2)
- **codex** → **V.I.B.E. IDE Core** (code generation, Level 2)
- **ii-agent-community** → **Persona Library** (pre-built agents)

### Layer 2: Protocol & Bridge (Cost/Interop Infrastructure)
- **gemini-cli-mcp-openai-bridge** → universal adapter (routes “simple” calls to cheaper models)
- **litellm-debugger** → token & cost observability dashboard
- **codex-as-mcp** → universal coding interface

### Layer 3: Orchestration (Team Management)
- **CommonGround** → multi-agent “Team Hub” (PPA architecture)
- **Common_Chronicle** → immutable audit ledger (Proof-of-Benefit groundwork)
- **ghost-gcp-storage-adapter** → artifact publishing pipeline

### Layer 4: Knowledge & Training (Intelligence Foundation)
- **II-Commons** → vector knowledge base (RAG foundation)
- **ii-thought** → reasoning dataset for training
- **ii_verl** → fine-tuning workflows
- **CoT-Lab-Demo** → model reasoning visualization

### Layer 5: Presentation (What Users Consume)
- **PPTist** → slides from agent outputs
- **Symbioism-Nextra** → documentation portal
- **Reveal.js** → HTML presentations

## Example Cost Model (Illustrative)

The following example is illustrative. Actual cost depends on provider pricing, prompt sizes, tool usage, caching, and routing policy.

```text
WITHOUT Intelligent Internet routing (single premium model):
1,000 generations × premium price = higher cost

WITH ORACLE routing (example split):
- most “simple” tasks → cheaper model
- some “complex” tasks → premium model
- some “validation” tasks → fast/cheap model
```

## Example User Flow

```text
1) User requests research
2) BoomerAng delegates to Deep Research
3) Research runs parallel searches via the bridge
4) Results recorded in Common_Chronicle
5) User requests slides
6) BoomerAng calls PPTist → generates deck
```

---

# Architectural Blueprint for the Intelligent Internet Ecosystem: A Modular Containerization Protocol for Nurds Code Integration

## 1. Executive Introduction: The Third Path of Sovereign Intelligence

The contemporary landscape of artificial intelligence is defined by a dichotomy often described as the "Great Decoupling." On one side lies the centralized aggregation of cognitive power, where proprietary models reside behind opaque APIs, renting intelligence to users while retaining sovereignty over the cognitive process. On the other side is the fragmented landscape of open-source tools, often lacking the cohesive orchestration required to compete with verticalized monoliths. The "Intelligent Internet" (II) initiative proposes a "Third Path": a decentralized, user-sovereign ecosystem designed to function as a public utility for AI. For the Nurds Code development initiative, this ecosystem represents more than a collection of repositories; it is a foundational architecture for building a sovereign cognitive infrastructure.

The core philosophy driving this ecosystem is "Symbioism," which envisions a symbiotic relationship between human intent and machine execution, anchored by a "Proof-of-Benefit" (PoB) consensus mechanism that rewards verifiable public utility. This report provides an exhaustive, meticulous analysis of the nineteen core repositories that constitute this ecosystem. Our objective is to deconstruct these components from their theoretical underpinnings down to their deployment artifacts, ensuring that the Nurds Code team can deploy each element individually ("à la carte") or as a synchronized, chained fleet.

The architecture is analyzed across five functional strata:

- The Sovereign Agent Layer: The autonomous workforce capable of complex execution (ii-agent, ii-researcher, codex, ii-agent-community).
- The Protocol and Bridge Layer: The connective tissue ensuring interoperability (gemini-cli-mcp-openai-bridge, codex-as-mcp, gemini-cli, litellm-debugger).
- The Orchestration Layer: The management systems for multi-agent collaboration (CommonGround, Common_Chronicle, ghost-gcp-storage-adapter).
- The Knowledge and Training Layer: The foundation of verifiable truth (II-Commons, ii-thought, ii_verl, CoT-Lab-Demo).
- The Cultural and Presentation Layer: The interfaces for dissemination (Symbioism-TLE, Symbioism-Nextra, PPTist, reveal.js).

This report details the containerization strategy for each, ensuring that the Nurds Code deployment is robust, scalable, and meticulously aligned with the principles of the Intelligent Internet.

## 2. The Sovereign Agent Layer: Autonomous Cognitive Workers

The Agent Layer is the operational vanguard of the ecosystem. These repositories contain the logic for "Sovereign AI agents"—software entities that do not merely respond to prompts but actively plan, execute tools, and reflect on their outputs to achieve high-level goals.

### 2.1 II-Agent: The Generalist Sovereign Assistant

The flagship repository, ii-agent, represents the realization of the "personal AI" concept. It is designed not as a chatbot, but as a comprehensive framework for productivity, capable of full-stack software development, browser automation, and intricate problem-solving.

#### 2.1.1 Architectural Analysis and Code Structure

The ii-agent repository is structured as a dual-stack application, necessitating a sophisticated containerization strategy that separates the cognitive backend from the interactive frontend.

- The Backend Core: Located in src/ii_agent/, the backend is constructed in Python. It operates on a sophisticated "Agent Loop" that utilizes a function-calling paradigm. This loop orchestrates Large Language Models (LLMs)—supporting Anthropic Claude, Google Vertex AI, and OpenAI GPT models—to act as the reasoning engine. The backend manages a workspace (file system) and integrates with a robust suite of tools located in src/ii_agent/tools/. These tools include file manipulation, PDF text extraction, and crucially, browser automation via Playwright.
- The Frontend Interface: Hosted in the frontend/ directory, this is a React-based application interacting with the backend via WebSockets (ws_server.py). This decoupling allows the agent to run headless in a server environment or attached to a web interface.
- Sandboxing: A critical feature for the Nurds Code deployment is the integration with E2B sandboxes. This ensures that when the agent executes code (e.g., "write a snake game"), it does so in an isolated environment, protecting the host container from potentially destructive operations.

#### 2.1.2 Meticulous Building and Containerization

To deploy ii-agent for Nurds Code, we cannot rely on a monolithic container. We must architect a composition of services.

Service A: The Cognitive Backend (ii-agent-backend)

- Base Image Selection: We utilize python:3.12-bookworm. The bookworm (Debian 12) variant is strictly preferred over alpine because the Playwright browser binaries rely on glibc and specific system libraries (GTK, NSS, ALSA) that are difficult to provision on Alpine Linux.
- Dependency Management: The project utilizes uv, a modern, high-performance Python package manager. The Dockerfile must explicitly install uv and use it to synchronize dependencies from pyproject.toml and uv.lock.
- Browser Provisioning: The container build must include a step to RUN playwright install --with-deps chromium. This ensures that the agent's "browse the web" capability functions immediately upon deployment without runtime installation delays.

Service B: The User Interface (ii-agent-frontend)

- Build Stage: A multi-stage build using node:20 is required. The build process involves installing dependencies (npm ci) and compiling the React application (npm run build).
- Runtime Stage: The compiled static assets are served via nginx:alpine. A custom nginx.conf is critical here to reverse-proxy the WebSocket connections (/ws) to the backend container, ensuring seamless real-time communication between the user and the agent.

Nurds Code Configuration Profile:

- Environment Variables:
  - WORKSPACE_ROOT: Mounted to a persistent Docker volume to save agent outputs.
  - E2B_API_KEY: Injected at runtime for sandboxing.
  - LLM_PROVIDER: Configured to point to the gemini-bridge (discussed in Section 3) to allow local/free inference.
- Deployment Command:
  - docker-compose -f compose.ii-agent.yaml up -d

### 2.2 II-Researcher: The Deep Inquiry Pipeline

While ii-agent is a generalist, ii-researcher is a specialized system designed for "Deep Research"—the autonomous, recursive traversal of information graphs to generate comprehensive reports.

#### 2.2.1 Operational Mechanics and Algorithms

The ii-researcher repository implements a "Plan-and-Execute" architecture, often visualizing the research process as a Directed Acyclic Graph (DAG).

- Recursive Inquiry: The system analyzes a user's high-level query (e.g., "The future of solid-state batteries") and decomposes it into sub-questions. It then executes parallel search operations using providers like Tavily or SerpAPI.
- Context Compression: A pivotal innovation in this repository is "Embedding-Based Filtering". Instead of feeding raw HTML to the LLM—which would quickly exhaust context windows and inflate costs—the system chunks the retrieved text and embeds it using text-embedding-3-large. It then filters these chunks for semantic relevance to the specific sub-query, ensuring that only high-signal information reaches the synthesis stage.
- Synthesis and Critique: The pipeline includes a reflection step where the agent critiques its own draft, identifies missing data points, and triggers a new search iteration.

#### 2.2.2 Containerization Strategy

- Docker Specification: The container must include the litellm library, which ii-researcher uses as an abstraction layer for model calls.
- Volume Architecture: Reports are generated as Markdown files with citations. A volume mounted to /app/outputs is essential to persist these artifacts.
- API Exposure: Unlike the CLI-first ii-agent, ii-researcher is best deployed as an API service (using FastAPI). The container entry point should be uvicorn app.main:app --host 0.0.0.0 --port 8000.

### 2.3 Codex and Codex-as-MCP: The Coding Specialists

The repositories codex and codex-as-mcp represent the specialized coding capabilities within the ecosystem.

- Codex: A specialist agent tuned for code generation, refactoring, and test suite creation.
- Codex-as-MCP: An interface layer exposing codex capabilities via MCP.

### 2.4 II-Agent-Community: The Collective Intelligence

The ii-agent-community repository serves as a hub for shared agent configurations, prompts, and specialized workflows.

- Integration: Best mounted as a content/data volume (e.g., /shared/community_agents) into runtime containers.

## 3. The Protocol and Bridge Layer: Universal Interoperability

The "Intelligent Internet" relies heavily on MCP to solve the "N+1" integration problem.

### 3.1 Gemini-CLI-MCP-OpenAI-Bridge: The Universal Adapter

- OpenAI Bridge: Mimics the OpenAI API (/v1/chat/completions), translating requests to Gemini CLI.
- MCP Server: Exposes Gemini internal tools (search, files) as MCP tools.
- Security Modes: read-only / edit / yolo.

### 3.2 Gemini-CLI: The Underlying Engine

- Containerizing gemini-cli enables sidecar usage for automation.

### 3.3 LiteLLM-Debugger: Observability in the Mesh

- Provides visibility into proxy traffic: requests, token usage, latency.

## 4. The Orchestration Layer: Managing the Swarm

### 4.1 CommonGround: The Collaboration Operating System

- PPA hierarchy: Partner (Human) → Principal (Agent) → Associates (Specialists)
- Submodules: Requires git submodule update --init --recursive in builds.
- Handover Protocols: Externalize YAML protocols into mounted volumes.

### 4.2 Common_Chronicle: The Immutable Ledger of Work

- Structured logging and flight recorder, precursor to Proof-of-Benefit.

### 4.3 Ghost-GCP-Storage-Adapter: Persistence of Artifacts

- Offloads assets to GCS; custom Ghost image.

## 5. The Knowledge and Training Layer: Grounding and Evolution

### 5.1 II-Commons: The Knowledge Reactor

- Uses VectorChord / RaBitQ style indexing; custom Postgres build.
- Requires ingestion worker containers.

### 5.2 II-Thought and II-Verl: The Reasoning Loop

- II-Thought: verifiable reasoning dataset.
- II-Verl: GRPO training for reasoning; CUDA container for HPC.

### 5.3 CoT-Lab-Demo: Visualizing Thought

- Streamlit/Gradio app to render chain-of-thought.

## 6. The Cultural and Presentation Layer: Interface and Dissemination

- PPTist and Reveal.js for slide/presentation generation.
- Symbioism-Nextra and Symbioism-TLE for docs/book publishing.

## 7. Nurds Code Integration: The Mesh Strategy

- Compose/Kubernetes mesh with Traefik.
- Example services: ii-agent-backend, ii-agent-frontend, ii-researcher, common-ground, gemini-bridge, ii-commons-db, pptist.

## 8. Conclusion

These repositories constitute a sovereign cognitive architecture. By meticulously containerizing each component, Nurds Code can deploy resilient, verifiable, deeply integrated services enabling users to reclaim agency over digital intelligence.
