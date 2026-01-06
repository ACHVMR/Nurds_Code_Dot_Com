# 🚀 AchieveMore Platform: Complete End-to-End Implementation Guide
## Central Development Machine Architecture for 1M+ Concurrent Users

**Document Version:** 2.0  
**Prepared For:** Engineering & DevOps Teams  
**Date:** January 5, 2026  
**Classification:** Internal - Engineering Use  
**Estimated Reading Time:** 90 minutes

---

## TABLE OF CONTENTS

1. **Platform Architecture Overview**
2. **Central Development Machine (CDM) Design**
3. **The Oracle Framework: Efficient Code Generation System**
4. **Terminal Instructions & CLI Toolkit**
5. **End-to-End Request Processing Pipeline**
6. **Multi-Region Sharding & Scalability**
7. **Temporal Workflow Orchestration**
8. **Resource Management & Cost Optimization**
9. **Security & Isolation Layer**
10. **Monitoring, Logging & Observability**
11. **Disaster Recovery & High Availability**
12. **Production Deployment Checklist**

---

## 1. PLATFORM ARCHITECTURE OVERVIEW

### 1.1 System Design Philosophy

Unlike traditional SaaS platforms that build one product for everyone, AchieveMore operates as a **meta-platform**: a central infrastructure that spawns 100+ specialized applications (Spokes), each serving different markets.

This architecture is inspired by:
- **Replit** - Cloud-based development environment with containerized execution
- **Cursor IDE** - AI-powered code generation with codebase context
- **VibeCode Framework** - Enterprise vibe coding with governance guardrails
- **Temporal.io** - Durable execution for reliable agent orchestration

**Key Design Tenets:**

```
┌─────────────────────────────────────────────────────────┐
│  AchieveMore Platform Architecture                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Multi-Region Load Balancer (Global Entry Point) │  │
│  │  US-EAST | EU-WEST | ASIA-PACIFIC | CANADA      │  │
│  └──────────┬───────────────────────────────────────┘  │
│             │                                           │
│  ┌──────────▼───────────────────────────────────────┐  │
│  │  Edge Cache Layer (Cloudflare / Fastly)          │  │
│  │  - Static assets (10ms response)                 │  │
│  │  - API gateway (auth, rate limiting)             │  │
│  │  - Request routing to nearest regional hub       │  │
│  └──────────┬───────────────────────────────────────┘  │
│             │                                           │
│  ┌──────────▼───────────────────────────────────────┐  │
│  │  Regional Hub (GCP / AWS / Azure - pick one)     │  │
│  │  ┌───────────────────────────────────────────┐  │  │
│  │  │  Central Development Machine (CDM)        │  │  │
│  │  │  - Temporal Server (workflow engine)      │  │  │
│  │  │  - 10x ii-agent worker pools              │  │  │
│  │  │  - CommonGround orchestration hub         │  │  │
│  │  │  - Real-time event bus (Kafka)            │  │  │
│  │  │  - Multi-tenant routing                   │  │  │
│  │  └───────────────────────────────────────────┘  │  │
│  │  ┌───────────────────────────────────────────┐  │  │
│  │  │  Data Layer                               │  │  │
│  │  │  - Primary: Postgres (write)              │  │  │
│  │  │  - Replica: Postgres (read)               │  │  │
│  │  │  - Cache: Redis (session, results)        │  │  │
│  │  │  - Vector DB: Supabase pgvector           │  │  │
│  │  │  - Object Storage: Cloud Storage          │  │  │
│  │  └───────────────────────────────────────────┘  │  │
│  │  ┌───────────────────────────────────────────┐  │  │
│  │  │  Spoke Management                         │  │  │
│  │  │  - Deploy 100 independent frontends       │  │  │
│  │  │  - All route to this CDM hub              │  │  │
│  │  │  - Dynamic scaling per spoke              │  │  │
│  │  └───────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│             │                                           │
│  ┌──────────▼───────────────────────────────────────┐  │
│  │  100 Spoke Applications (Independent Frontends)  │  │
│  │  Resume Optimizer | Blog Rewriter | Contract... │  │
│  │  (All deployed to Vercel, using this CDM hub)   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Why Central Development Machine Matters

When you have 1M concurrent users across 100 different applications, centralizing the "brain" (agent orchestration, decision-making, model routing) becomes critical:

| Challenge | Without CDM | With CDM |
|-----------|-----------|---------|
| **Cost of Model Routing** | $0.05 per routing decision × 100 apps × 1M users = $5M/month | $0.001 per decision (shared infrastructure) = $100K/month |
| **Agent Concurrency** | 100 separate agent pools (100 × 5 agents = 500 total) | 1 shared pool (50 agents, 20x more efficient) |
| **Data Consistency** | Each app manages own user profiles, preferences | Single source of truth (global user state) |
| **Development Velocity** | Update 100 spokes independently | Update CDM once, all spokes benefit |
| **Incident Response** | Troubleshoot across 100 systems | Single source to debug, fix, deploy |

---

## 2. CENTRAL DEVELOPMENT MACHINE (CDM) DESIGN

### 2.1 CDM Architecture Layers

```
LAYER 0: ENTRY POINT
┌─────────────────────────────────────────────┐
│ Global Load Balancer                        │
│ - Route based on region (geo-proximity)     │
│ - Route based on app-id (spoke identifier)  │
│ - Health checks (every 5 seconds)           │
└────────────────────────────────────────────┘
                    ↓
LAYER 1: REQUEST GATEWAY
┌─────────────────────────────────────────────┐
│ API Gateway (Kong / Google Cloud Endpoints) │
│ ✓ Authentication (JWT validation)           │
│ ✓ Authorization (RBAC per user + app)       │
│ ✓ Rate limiting (100 req/sec per user)      │
│ ✓ Request validation (schema checking)      │
│ ✓ Request deduplication (idempotency)       │
└────────────────────────────────────────────┘
                    ↓
LAYER 2: WORKFLOW ORCHESTRATION
┌─────────────────────────────────────────────┐
│ Temporal Server                             │
│ ✓ Workflow creation (one per user request)  │
│ ✓ Activity execution (agent invocations)    │
│ ✓ Automatic retries (with exponential backoff) │
│ ✓ Human-in-the-loop support (pause/resume) │
│ ✓ Persistence (survives server restart)     │
│ ✓ Visibility (can query any workflow state) │
└────────────────────────────────────────────┘
                    ↓
LAYER 3: AGENT EXECUTION
┌─────────────────────────────────────────────┐
│ Worker Pools (Temporal Activities)          │
│ ┌────────────────────────────────────────┐ │
│ │ Pool 1: Resume Optimizer               │ │
│ │ ├─ Worker 1                            │ │
│ │ ├─ Worker 2                            │ │
│ │ ├─ Worker 3                            │ │
│ │ └─ Worker 4                            │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ Pool 2: Research Coordinator           │ │
│ │ ├─ Worker 1                            │ │
│ │ ├─ Worker 2                            │ │
│ │ └─ Worker 3                            │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ Pool N: Generic ii-agent               │ │
│ │ ├─ Worker 1-6 (autoscaling 1-20)       │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ FEATURE: Auto-scaling                      │
│ ├─ P50 latency > 500ms? Spawn 2 more     │
│ ├─ CPU > 80%? Scale up container          │
│ ├─ Queue depth > 1000? Activate standby   │
│ └─ Cost optimization: Downscale at 2am UTC│
└────────────────────────────────────────────┘
                    ↓
LAYER 4: MODEL ROUTING
┌─────────────────────────────────────────────┐
│ MCP Router (Model Context Protocol)         │
│ ✓ Evaluate: cost vs quality vs speed        │
│ ✓ Route to cheapest model for task type     │
│ ✓ Fallback handling (primary unavailable)   │
│ ✓ Token counting + budget tracking          │
│ ✓ Cost optimization (use GPT-3.5 if better) │
└────────────────────────────────────────────┘
                    ↓
LAYER 5: LLM INFERENCE
┌─────────────────────────────────────────────┐
│ Model Providers (Parallel Calls)            │
│ - OpenAI (GPT-5, GPT-4-turbo, GPT-3.5)      │
│ - Google (Gemini 3-pro, 3-flash)            │
│ - Anthropic (Claude 4, Claude 3.5-sonnet)   │
│ - Local (Ollama for edge inference)         │
└────────────────────────────────────────────┘
                    ↓
LAYER 6: DATA PERSISTENCE
┌─────────────────────────────────────────────┐
│ Primary Database (Postgres)                 │
│ ├─ User table (1M rows, indexed by user_id) │
│ ├─ Workflow table (active + historical)     │
│ ├─ Audit log table (append-only)            │
│ ├─ Result cache (TTL 7 days)                │
│ └─ Webhook event log (retry until success)  │
│                                            │
│ Read Replica (Postgres)                     │
│ ├─ For analytics queries (non-blocking)     │
│ └─ Geo-replicated for disaster recovery     │
│                                            │
│ Cache (Redis)                               │
│ ├─ User session: {user_id} → token, exp    │
│ ├─ Rate limit: {user_id}:{hour} → count    │
│ ├─ LRU cache: {prompt_hash} → response     │
│ └─ Leaderboard: {leaderboard_key} → scores │
│                                            │
│ Vector DB (Supabase pgvector)               │
│ ├─ Contract embeddings (for legal tool)     │
│ ├─ Resume vectors (for similarity search)   │
│ └─ Query with: SELECT * WHERE vector       │
│                <-> query_vector             │
│                LIMIT 10                     │
│                                            │
│ Object Storage (Cloud Storage)              │
│ ├─ Uploaded PDFs: gs://bucket/user/{uid}/* │
│ ├─ Generated outputs: gs://bucket/out/{id} │
│ └─ Temp files: gs://bucket/tmp/ (7d TTL)   │
└────────────────────────────────────────────┘
```

### 2.2 Request Lifecycle (1M Concurrent Users Example)

**Scenario:** 1 million users, each making 10 requests/day on average = ~115 requests/second sustained

**Timeline of a Single Request:**

```
T+0ms    User submits: "Optimize my resume"
         ↓
T+5ms    Global Load Balancer (Cloudflare)
         ├─ Geolocate user (IP → US-EAST)
         └─ Route to nearest CDM
         
T+10ms   API Gateway
         ├─ Validate JWT token
         ├─ Check rate limit (user: 100 req/sec)
         ├─ Deduplicate (is this same request as 50ms ago?)
         └─ Extract: user_id, app_id, request_params
         
T+15ms   Request Deduplication Check
         ├─ Hash: (user_id + params) → md5
         ├─ Check Redis: "req_dedup:{hash}"
         ├─ If exists (DUPLICATE): return cached response
         └─ If not: proceed (set TTL = 30sec)
         
T+20ms   Temporal Workflow Creation
         ├─ workflow_id = uuid()
         ├─ input = {user_id, app_id, resume_pdf_url, ...}
         ├─ Create: Workflow(
         │    id=workflow_id,
         │    type="resume_optimizer",
         │    input=input,
         │    timeout=300sec  # 5 minutes max
         │  )
         └─ Store workflow state in Postgres
         
T+25ms   Return to Frontend (ASYNC)
         ├─ HTTP 202 Accepted
         ├─ Body: {workflow_id, status: "queued"}
         └─ Frontend polls: GET /workflow/{workflow_id}
         
         ↓↓↓ BACKGROUND PROCESSING ↓↓↓
         
T+30ms   Temporal Activity Dispatch
         ├─ Activity type: "download_resume_pdf"
         ├─ Find available worker in resume_optimizer_pool
         ├─ Assign to Worker #2 (has capacity)
         └─ Execute activity (50% latency for PDF download)
         
T+100ms  Activity Complete (Resume Downloaded)
         ├─ Resume text extracted (OCR if needed)
         ├─ Workflow continues to next Activity
         └─ Status in Postgres: downloading → extracting
         
T+150ms  Next Activity: "extract_resume_content"
         ├─ Call ii-agent
         ├─ Prompt: "Extract this resume content"
         ├─ Model chosen: GPT-3.5-turbo (cheap + fast)
         ├─ Response: {name, skills, experience, education}
         └─ Cache in Redis for 7 days
         
T+400ms  Activity: "generate_optimizations"
         ├─ Call ii-agent with system prompt
         ├─ Prompt: "Given job description [X], improve these points: ..."
         ├─ Model chosen: GPT-4-turbo (higher quality)
         ├─ Response: {improvements, new_bullets, keywords}
         └─ Store in Postgres result cache
         
T+800ms  Activity: "ats_score_calculation"
         ├─ Call ii-agent for scoring
         ├─ Prompt: "Score ATS compatibility (0-100)"
         └─ Response: {ats_score: 87, explanation, ...}
         
T+1200ms Activity: "generate_output_document"
         ├─ Create optimized resume (DOCX)
         ├─ Upload to Cloud Storage
         ├─ Generate signed download URL (24hr expiry)
         └─ Response: {download_url, ats_score, improvements}
         
T+1300ms Workflow Complete
         ├─ Update Postgres: status = "completed"
         ├─ Set Redis result: {workflow_id} → result (7d TTL)
         ├─ Generate webhook event (if customer has webhook)
         ├─ Update user's activity history
         └─ Log to audit table
         
T+1305ms User Polls and Receives Result
         ├─ GET /workflow/{workflow_id}
         ├─ Status: "completed"
         ├─ Result: {download_url, ats_score, improvements}
         └─ Frontend shows "✓ Download Now" button
```

**Concurrency Model at 1M Users:**

```
Queue depth at T+0 to T+1300ms:
├─ Peak queue depth: ~150 requests (115 req/sec × 1.3 sec avg time)
├─ Required workers: 115 req/sec ÷ (1 req / 2-3 sec) = 50-75 concurrent workers
├─ Current pool size: 50 base, scales to 150 during peak
└─ Cost: 50 workers × $2/hour = $100/hour = $730K/month

With optimization:
├─ Use cheaper model for 60% of tasks (save 70% LLM cost)
├─ Cache 40% of requests (reduce 40% agent work)
├─ Result: ~$220K/month (70% reduction)
```

---

## 3. THE ORACLE FRAMEWORK: EFFICIENT CODE GENERATION SYSTEM

### 3.1 What is Oracle?

**Oracle** is a meta-framework that sits between user requests and AI model invocation. It ensures:

1. **Zero hallucination** - Only returns what models are trained to do well
2. **Consistent quality** - Same prompt structure across all 100 spokes
3. **Cost efficiency** - Route to cheapest model that solves the task
4. **Fast execution** - Cached prompts, pre-computed decision trees
5. **Human-in-the-loop** - Integration points for user approval/feedback

### 3.2 Oracle Architecture

```
┌─────────────────────────────────────────────────────────┐
│ ORACLE FRAMEWORK                                        │
│                                                         │
│ PHASE 1: REQUEST CLASSIFICATION                        │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Input: {user_request, app_context, user_profile}   ││
│ │                                                     ││
│ │ Step 1: Extract Intent                             ││
│ │ ├─ Classify: "optimize" vs "analyze" vs "create"   ││
│ │ ├─ Complexity: simple | moderate | complex         ││
│ │ ├─ Task type: text | image | code | data           ││
│ │ └─ Output: INTENT_CLASSIFIER_OUTPUT                ││
│ │                                                     ││
│ │ Step 2: Check Cache (Redis)                         ││
│ │ ├─ Hash: (intent + app_id + user_profile) → md5   ││
│ │ ├─ Key: "oracle:cache:{hash}"                      ││
│ │ ├─ If HIT: return cached routing decision (90% hit) ││
│ │ └─ If MISS: continue to Step 3                     ││
│ │                                                     ││
│ │ Step 3: Load Routing Rules                          ││
│ │ ├─ Location: /oracle/routing/{app_id}.json         ││
│ │ ├─ Structure:                                       ││
│ │ │  {                                                ││
│ │ │    "intent.optimize": {                           ││
│ │ │      "model": "gpt-3.5-turbo",                    ││
│ │ │      "temperature": 0.3,                          ││
│ │ │      "max_tokens": 500,                           ││
│ │ │      "cost_per_run": 0.001                        ││
│ │ │    }                                              ││
│ │ │  }                                                ││
│ │ └─ Load from cache (updated every 6 hours)         ││
│ │                                                     ││
│ └─────────────────────────────────────────────────────┘│
│                     ↓                                   │
│ PHASE 2: TEMPLATE ASSEMBLY                             │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Build the system + user prompts from templates      ││
│ │                                                     ││
│ │ Step 1: Load System Prompt Template                 ││
│ │ ├─ Location: /oracle/prompts/{app_id}/system.md   ││
│ │ ├─ Contains: role, instructions, guardrails        ││
│ │ ├─ Template vars: {app_name}, {tone}, {rules}      ││
│ │ └─ Example:                                         ││
│ │    "You are {app_name} optimizer. Your goal:       ││
│ │     {goal_statement}. Follow these rules:          ││
│ │     {rules_list}. Output format: {format}"        ││
│ │                                                     ││
│ │ Step 2: Load Few-Shot Examples                      ││
│ │ ├─ Location: /oracle/examples/{app_id}/{intent}/   ││
│ │ ├─ Count: 3-5 examples for each intent              ││
│ │ ├─ Selection: Pick diverse examples                 ││
│ │ └─ Purpose: Improve model accuracy                  ││
│ │                                                     ││
│ │ Step 3: Template Substitution                       ││
│ │ ├─ Replace {app_name} → "Resume Optimizer"         ││
│ │ ├─ Replace {goal_statement} → from spec            ││
│ │ ├─ Replace {rules_list} → from spec                ││
│ │ └─ Output: COMPLETE_PROMPT                         ││
│ │                                                     ││
│ └─────────────────────────────────────────────────────┘│
│                     ↓                                   │
│ PHASE 3: COST OPTIMIZATION                             │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Choose cheapest viable model                        ││
│ │                                                     ││
│ │ Algorithm:                                          ││
│ │ 1. Start with cheapest model: gpt-3.5-turbo        ││
│ │ 2. Estimate token count                             ││
│ │ 3. Check: (quality_threshold_required <= 0.7)?     ││
│ │    └─ YES: use cheap model                          ││
│ │    └─ NO: try next tier (GPT-4)                     ││
│ │ 4. Success rate history: use model with >95%       ││
│ │    success rate at lowest cost                      ││
│ │                                                     ││
│ │ Success Rate Tracking (per model, per intent):      ││
│ │ ├─ gpt-3.5-turbo on "optimize": 91%                ││
│ │ ├─ gemini-3-pro on "optimize": 94%                 ││
│ │ ├─ gpt-4-turbo on "optimize": 98%                  ││
│ │ └─ Decision: use gemini-3-pro (best bang/buck)     ││
│ │                                                     ││
│ └─────────────────────────────────────────────────────┘│
│                     ↓                                   │
│ PHASE 4: EXECUTION                                      │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Call LLM with complete prompt                       ││
│ │                                                     ││
│ │ Step 1: Invoke Model                                ││
│ │ ├─ Model: chosen from Phase 2                       ││
│ │ ├─ System prompt: from Phase 3                      ││
│ │ ├─ User prompt: user's original request            ││
│ │ ├─ Temperature: from routing rules                  ││
│ │ ├─ Max tokens: from routing rules                   ││
│ │ └─ Timeout: 30 seconds                              ││
│ │                                                     ││
│ │ Step 2: Parse Output                                ││
│ │ ├─ Expected format: from system prompt              ││
│ │ ├─ If valid JSON: extract fields                    ││
│ │ ├─ If markdown: parse sections                      ││
│ │ ├─ If plain text: use as-is                         ││
│ │ └─ Store raw + parsed in Postgres                   ││
│ │                                                     ││
│ │ Step 3: Validation                                  ││
│ │ ├─ Check: response contains required fields?        ││
│ │ ├─ Check: values in expected range?                 ││
│ │ ├─ Check: no obvious hallucinations?                ││
│ │ └─ If invalid: trigger fallback                     ││
│ │                                                     ││
│ └─────────────────────────────────────────────────────┘│
│                     ↓                                   │
│ PHASE 5: RESULT PROCESSING                             │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Transform and cache result                          ││
│ │                                                     ││
│ │ Step 1: Post-Process                                ││
│ │ ├─ Apply formatting rules                           ││
│ │ ├─ Anonymize PII if needed                          ││
│ │ ├─ Add metadata: timestamp, model, cost            ││
│ │ └─ Enrich with user data                            ││
│ │                                                     ││
│ │ Step 2: Cache                                       ││
│ │ ├─ Redis (7-day TTL): {request_hash} → result     ││
│ │ ├─ Postgres: audit log + result                     ││
│ │ └─ Cloud Storage: if > 100KB                        ││
│ │                                                     ││
│ │ Step 3: Track Success                               ││
│ │ ├─ Increment: success_count[model][intent]         ││
│ │ ├─ Record: latency, tokens, cost                    ││
│ │ ├─ Feed into: Phase 3 decision-making               ││
│ │ └─ Update: routing cache if needed                  ││
│ │                                                     ││
│ └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 3.3 Oracle Implementation (Code)

```python
# /backend/oracle/router.py

from dataclasses import dataclass
from enum import Enum
import hashlib
import redis
import json
from typing import Dict, Any

class TaskComplexity(Enum):
    SIMPLE = "simple"       # GPT-3.5 sufficient
    MODERATE = "moderate"   # GPT-4 often better
    COMPLEX = "complex"     # Claude-4 or GPT-5

@dataclass
class OracleDecision:
    model: str              # "gpt-3.5-turbo" | "gpt-4-turbo" | "claude-4"
    temperature: float      # 0.0 (deterministic) to 1.0 (creative)
    max_tokens: int
    system_prompt: str
    few_shots: list[Dict]
    estimated_cost: float
    success_rate_history: float  # 0-1 (from past runs)

class OracleRouter:
    def __init__(self):
        self.redis = redis.Redis(host='localhost', port=6379, db=0)
        self.routing_rules = self._load_routing_rules()
        self.success_metrics = self._load_success_metrics()
    
    def make_decision(self, 
                     user_request: str, 
                     app_id: str, 
                     user_context: Dict[str, Any]) -> OracleDecision:
        """
        The main Oracle routing function.
        Takes user request → returns model routing decision.
        """
        
        # PHASE 1: REQUEST CLASSIFICATION
        intent = self._classify_intent(user_request)
        complexity = self._estimate_complexity(user_request, intent)
        
        # Check cache first
        cache_key = self._make_cache_key(intent, app_id, user_context)
        cached_decision = self._try_cache(cache_key)
        if cached_decision:
            return cached_decision
        
        # PHASE 2: TEMPLATE ASSEMBLY
        system_prompt = self._build_system_prompt(app_id, intent)
        few_shots = self._load_few_shots(app_id, intent)
        
        # PHASE 3: COST OPTIMIZATION
        decision = self._optimize_model_choice(
            intent=intent,
            complexity=complexity,
            system_prompt=system_prompt,
            app_id=app_id
        )
        
        # Cache the decision
        self.redis.setex(cache_key, 21600, json.dumps(decision.__dict__))  # 6 hour TTL
        
        return decision
    
    def _optimize_model_choice(self, 
                              intent: str, 
                              complexity: TaskComplexity,
                              system_prompt: str,
                              app_id: str) -> OracleDecision:
        """
        Choose model based on:
        1. Success rate history
        2. Cost vs quality tradeoff
        3. Complexity of task
        """
        
        # Get all candidate models and their success rates
        candidates = [
            {
                "model": "gpt-3.5-turbo",
                "cost_per_1k_tokens": 0.001,
                "success_rate": self.success_metrics.get(f"{app_id}:{intent}:gpt-3.5", 0.87),
                "latency_p50": 0.5,  # seconds
            },
            {
                "model": "gemini-3-pro",
                "cost_per_1k_tokens": 0.005,
                "success_rate": self.success_metrics.get(f"{app_id}:{intent}:gemini-3", 0.92),
                "latency_p50": 0.4,
            },
            {
                "model": "gpt-4-turbo",
                "cost_per_1k_tokens": 0.01,
                "success_rate": self.success_metrics.get(f"{app_id}:{intent}:gpt-4", 0.96),
                "latency_p50": 1.2,
            },
            {
                "model": "claude-4",
                "cost_per_1k_tokens": 0.015,
                "success_rate": self.success_metrics.get(f"{app_id}:{intent}:claude", 0.98),
                "latency_p50": 2.0,
            },
        ]
        
        # Estimate tokens needed
        estimated_tokens = self._estimate_tokens(system_prompt)
        
        # Filter by quality threshold based on complexity
        quality_threshold = {
            TaskComplexity.SIMPLE: 0.85,      # 3.5 turbo often enough
            TaskComplexity.MODERATE: 0.90,    # Need good model
            TaskComplexity.COMPLEX: 0.95,     # Need best model
        }[complexity]
        
        viable_candidates = [
            c for c in candidates 
            if c["success_rate"] >= quality_threshold
        ]
        
        if not viable_candidates:
            viable_candidates = [candidates[-1]]  # Fall back to best model
        
        # Choose cheapest viable option
        best = min(viable_candidates, key=lambda x: x["cost_per_1k_tokens"])
        
        return OracleDecision(
            model=best["model"],
            temperature=0.3 if complexity == TaskComplexity.SIMPLE else 0.5,
            max_tokens=min(estimated_tokens * 2, 2000),  # Allow 2x input for output
            system_prompt=system_prompt,
            few_shots=self._load_few_shots(app_id, intent),
            estimated_cost=(estimated_tokens / 1000) * best["cost_per_1k_tokens"],
            success_rate_history=best["success_rate"],
        )
    
    def _classify_intent(self, user_request: str) -> str:
        """Classify what user is trying to do"""
        # In production, use a small classification model (DistilBERT)
        keywords = {
            "optimize": ["improve", "better", "enhance", "optimize"],
            "analyze": ["analyze", "review", "check", "evaluate"],
            "create": ["create", "generate", "write", "build"],
            "extract": ["extract", "find", "list", "show"],
        }
        
        request_lower = user_request.lower()
        for intent, words in keywords.items():
            if any(w in request_lower for w in words):
                return intent
        
        return "general"
    
    def _estimate_complexity(self, request: str, intent: str) -> TaskComplexity:
        """Estimate task complexity"""
        # Simple heuristics; in production use ML model
        request_length = len(request.split())
        
        if request_length < 20 and intent in ["extract", "simple"]:
            return TaskComplexity.SIMPLE
        elif request_length > 100 or intent in ["create", "analyze"]:
            return TaskComplexity.COMPLEX
        else:
            return TaskComplexity.MODERATE
    
    def _build_system_prompt(self, app_id: str, intent: str) -> str:
        """Load and build system prompt from templates"""
        # Template file structure: /templates/{app_id}/{intent}.md
        template_path = f"/oracle/prompts/{app_id}/system.md"
        
        with open(template_path, 'r') as f:
            template = f.read()
        
        # Substitute variables
        context = self._load_app_context(app_id)
        for key, value in context.items():
            template = template.replace(f"{{{key}}}", value)
        
        return template
    
    def _make_cache_key(self, intent: str, app_id: str, context: Dict) -> str:
        """Create cache key for this routing decision"""
        key_str = f"{intent}:{app_id}:{context.get('user_tier', 'free')}"
        return f"oracle:decision:{hashlib.md5(key_str.encode()).hexdigest()}"
    
    def _try_cache(self, cache_key: str) -> OracleDecision | None:
        """Try to get cached decision"""
        cached = self.redis.get(cache_key)
        if cached:
            data = json.loads(cached)
            return OracleDecision(**data)
        return None
    
    def _load_few_shots(self, app_id: str, intent: str) -> list[Dict]:
        """Load examples for few-shot prompting"""
        examples_path = f"/oracle/examples/{app_id}/{intent}/"
        # Load 3-5 JSON examples from this directory
        # Return as list of dicts
        return []  # Simplified
    
    def _load_routing_rules(self) -> Dict:
        """Load routing rules from config"""
        # In production: load from YAML or database
        return {}
    
    def _load_success_metrics(self) -> Dict[str, float]:
        """Load success rates from analytics DB"""
        # Query: SELECT intent, model, success_rate FROM model_performance
        # Return: {"{app_id}:{intent}:{model}": 0.92}
        return {}
    
    def _estimate_tokens(self, text: str) -> int:
        """Rough token estimation (1 token ≈ 4 chars)"""
        return len(text) // 4
    
    def _load_app_context(self, app_id: str) -> Dict[str, str]:
        """Load app-specific context for prompt building"""
        return {
            "app_name": "Resume Optimizer",
            "goal_statement": "Help users improve their resumes for ATS compatibility",
            "tone": "professional and encouraging",
        }
```

---

## 4. TERMINAL INSTRUCTIONS & CLI TOOLKIT

### 4.1 Installation & First-Time Setup

```bash
#!/bin/bash
# /scripts/install-cdm.sh
# Run this on a fresh Ubuntu 22.04 machine to set up entire CDM

set -e  # Exit on error

echo "🚀 Installing AchieveMore Central Development Machine"
echo "=================================================="

# Step 1: System Dependencies
echo "Step 1/12: Installing system packages..."
sudo apt-get update
sudo apt-get install -y \
    curl wget git gcc g++ make \
    postgresql postgresql-contrib \
    redis-server \
    docker.io docker-compose \
    nginx \
    jq htop

# Step 2: Python 3.11+
echo "Step 2/12: Installing Python 3.11..."
sudo apt-get install -y python3.11 python3.11-venv python3-pip
python3.11 --version

# Step 3: Node.js 20+
echo "Step 3/12: Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Step 4: Clone Repositories
echo "Step 4/12: Cloning AchieveMore repositories..."
cd /opt
sudo mkdir -p achievemore
sudo chown $USER:$USER achievemore
cd achievemore

git clone https://github.com/YOUR_ORG/ii-agent.git
git clone https://github.com/YOUR_ORG/CommonGround.git
git clone https://github.com/YOUR_ORG/ii-researcher.git
git clone https://github.com/YOUR_ORG/II-Commons.git
git clone https://github.com/YOUR_ORG/temporal-workflows.git

# Step 5: Python Virtual Environments
echo "Step 5/12: Setting up Python environments..."
cd /opt/achievemore/ii-agent
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --upgrade

cd /opt/achievemore/II-Commons
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --upgrade

# Step 6: PostgreSQL Configuration
echo "Step 6/12: Configuring PostgreSQL..."
sudo systemctl start postgresql
sudo -u postgres psql << EOF
CREATE DATABASE achievemore_db;
CREATE USER achievemore_user WITH PASSWORD '${POSTGRES_PASSWORD}';
ALTER ROLE achievemore_user SET client_encoding TO 'utf8';
ALTER ROLE achievemore_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE achievemore_user SET default_transaction_deferrable TO on;
ALTER ROLE achievemore_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE achievemore_db TO achievemore_user;
EOF

# Step 7: Redis Configuration
echo "Step 7/12: Configuring Redis..."
sudo systemctl start redis-server
sudo systemctl enable redis-server
redis-cli ping  # Test

# Step 8: Temporal Server (Docker)
echo "Step 8/12: Starting Temporal Server..."
docker run -d \
  --name temporal \
  -p 7233:7233 \
  -p 8081:8081 \
  temporaliaofficial/temporal:latest

sleep 5  # Wait for server to start
echo "Temporal Server health check:"
curl -s http://localhost:8081/health || echo "Waiting for server..."

# Step 9: Environment Variables
echo "Step 9/12: Creating .env file..."
cat > /opt/achievemore/.env << EOF
# API Keys
OPENAI_API_KEY=${OPENAI_API_KEY}
GOOGLE_API_KEY=${GOOGLE_API_KEY}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=achievemore_user
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=achievemore_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Temporal
TEMPORAL_HOST=localhost
TEMPORAL_PORT=7233

# GCP
GCP_PROJECT_ID=${GCP_PROJECT_ID}
GCP_REGION=us-central1

# App Configuration
ENVIRONMENT=production
TIMEZONE=UTC
LOG_LEVEL=info
EOF

chmod 600 /opt/achievemore/.env
echo "✓ Created .env (store securely!)"

# Step 10: Database Migrations
echo "Step 10/12: Running database migrations..."
cd /opt/achievemore/CommonGround
source ../II-Commons/venv/bin/activate
npm run db:migrate

# Step 11: Start Services
echo "Step 11/12: Starting services..."
# ii-agent
cd /opt/achievemore/ii-agent
source venv/bin/activate
python -m ii_agent.api --host 0.0.0.0 --port 8000 &
echo "ii-agent starting on port 8000"

# CommonGround
cd /opt/achievemore/CommonGround
npm install
npm run dev --host 0.0.0.0 --port 3000 &
echo "CommonGround starting on port 3000"

# Step 12: Verification
echo "Step 12/12: Verifying installation..."
sleep 3

echo ""
echo "✓ AchieveMore CDM Installation Complete!"
echo ""
echo "Service Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s http://localhost:8000/health && echo "✓ ii-agent (port 8000)" || echo "✗ ii-agent"
curl -s http://localhost:3000/health && echo "✓ CommonGround (port 3000)" || echo "✗ CommonGround"
curl -s http://localhost:8081/health && echo "✓ Temporal (port 8081)" || echo "✗ Temporal"
redis-cli ping > /dev/null && echo "✓ Redis (port 6379)" || echo "✗ Redis"
sudo systemctl is-active --quiet postgresql && echo "✓ PostgreSQL (port 5432)" || echo "✗ PostgreSQL"

echo ""
echo "Next steps:"
echo "1. Deploy with: achievemore deploy"
echo "2. Check dashboard: http://localhost:3000"
echo "3. Monitor: achievemore logs"
echo "4. Scale: achievemore scale --workers 20"
```

### 4.2 Achievemore CLI Toolkit

```bash
#!/bin/bash
# /usr/local/bin/achievemore
# Main CLI tool for managing the AchieveMore platform

set -e

VERSION="1.0.0"
CONFIG_DIR="$HOME/.achievemore"
LOG_DIR="$CONFIG_DIR/logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ensure config directory exists
mkdir -p "$CONFIG_DIR" "$LOG_DIR"

# ============================================
# MAIN FUNCTIONS
# ============================================

cmd_status() {
    echo -e "${BLUE}🔍 AchieveMore Platform Status${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    echo "Service Status:"
    echo "─────────────────────────────────────────"
    
    local services=("ii-agent:8000" "CommonGround:3000" "Temporal:8081" "Redis:6379" "PostgreSQL:5432")
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        
        if [ "$name" = "PostgreSQL" ]; then
            if sudo systemctl is-active --quiet postgresql 2>/dev/null; then
                echo -e "${GREEN}✓${NC} $name (port $port)"
            else
                echo -e "${RED}✗${NC} $name (port $port)"
            fi
        else
            if curl -s http://localhost:$port/health > /dev/null 2>&1; then
                echo -e "${GREEN}✓${NC} $name (port $port)"
            else
                echo -e "${RED}✗${NC} $name (port $port)"
            fi
        fi
    done
    
    echo ""
    echo "Agent Worker Pools:"
    echo "─────────────────────────────────────────"
    
    # Query Temporal for active workflows
    local active_workflows=$(curl -s http://localhost:8081/api/v1/namespaces/default/workflows \
        -H "Content-Type: application/json" 2>/dev/null | jq '.executions | length' || echo "?")
    
    echo "Active workflows: $active_workflows"
    echo "Base workers: 50"
    echo "Max workers: 200"
    
    echo ""
    echo "Database Status:"
    echo "─────────────────────────────────────────"
    
    local db_size=$(sudo -u postgres psql -d achievemore_db -t -c \
        "SELECT pg_size_pretty(pg_database_size('achievemore_db'));" 2>/dev/null || echo "?")
    
    echo "Database size: $db_size"
    
    local workflow_count=$(sudo -u postgres psql -d achievemore_db -t -c \
        "SELECT count(*) FROM workflows;" 2>/dev/null || echo "?")
    
    echo "Total workflows processed: $workflow_count"
}

cmd_deploy() {
    echo -e "${BLUE}🚀 Deploying AchieveMore...${NC}"
    
    local environment="${1:-production}"
    
    echo "Deploying to: $environment"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Step 1: Build Docker images
    echo "Step 1/5: Building Docker images..."
    cd /opt/achievemore
    
    docker build -f ii-agent/Dockerfile -t achievemore/ii-agent:latest ./ii-agent
    docker build -f CommonGround/Dockerfile -t achievemore/commonground:latest ./CommonGround
    
    echo -e "${GREEN}✓ Docker images built${NC}"
    
    # Step 2: Push to registry
    echo "Step 2/5: Pushing to container registry..."
    
    docker tag achievemore/ii-agent:latest gcr.io/$GCP_PROJECT_ID/ii-agent:latest
    docker tag achievemore/commonground:latest gcr.io/$GCP_PROJECT_ID/commonground:latest
    
    docker push gcr.io/$GCP_PROJECT_ID/ii-agent:latest
    docker push gcr.io/$GCP_PROJECT_ID/commonground:latest
    
    echo -e "${GREEN}✓ Images pushed to GCR${NC}"
    
    # Step 3: Deploy to GCP
    echo "Step 3/5: Deploying to Google Cloud Run..."
    
    gcloud run deploy ii-agent \
        --image gcr.io/$GCP_PROJECT_ID/ii-agent:latest \
        --platform managed \
        --region us-central1 \
        --memory 2Gi \
        --allow-unauthenticated \
        --set-env-vars "$(cat /opt/achievemore/.env | tr '\n' ',')"
    
    gcloud run deploy commonground \
        --image gcr.io/$GCP_PROJECT_ID/commonground:latest \
        --platform managed \
        --region us-central1 \
        --memory 4Gi \
        --allow-unauthenticated
    
    echo -e "${GREEN}✓ Deployed to Cloud Run${NC}"
    
    # Step 4: Run database migrations
    echo "Step 4/5: Running database migrations..."
    cd /opt/achievemore/CommonGround
    npm run db:migrate
    echo -e "${GREEN}✓ Database migrated${NC}"
    
    # Step 5: Run smoke tests
    echo "Step 5/5: Running smoke tests..."
    
    local max_retries=10
    local retry=0
    
    while [ $retry -lt $max_retries ]; do
        if curl -s https://ii-agent-$RANDOM.run.app/health > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Smoke tests passed${NC}"
            break
        fi
        
        retry=$((retry + 1))
        sleep 5
    done
    
    if [ $retry -eq $max_retries ]; then
        echo -e "${RED}✗ Smoke tests failed${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${GREEN}✅ Deployment complete!${NC}"
}

cmd_scale() {
    echo -e "${BLUE}📈 Scaling Workers${NC}"
    
    local worker_count="${1:-50}"
    
    echo "Scaling to $worker_count workers..."
    
    # Update Temporal worker pool
    gcloud run update ii-agent \
        --set-env-vars "WORKER_POOL_SIZE=$worker_count" \
        --region us-central1
    
    # Restart workers
    kubectl scale deployment ii-agent-workers \
        --replicas=$worker_count \
        --namespace achievemore 2>/dev/null || echo "Kubernetes not available, manual scaling required"
    
    echo -e "${GREEN}✓ Scaled to $worker_count workers${NC}"
}

cmd_logs() {
    local service="${1:-all}"
    local tail_lines="${2:-100}"
    
    echo -e "${BLUE}📋 Logs${NC}"
    echo "Service: $service | Lines: $tail_lines"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ "$service" = "all" ] || [ "$service" = "ii-agent" ]; then
        echo -e "\n${YELLOW}ii-agent logs:${NC}"
        gcloud logging read "resource.service_name=ii-agent" --limit=$tail_lines --format=json | jq .
    fi
    
    if [ "$service" = "all" ] || [ "$service" = "commonground" ]; then
        echo -e "\n${YELLOW}CommonGround logs:${NC}"
        gcloud logging read "resource.service_name=commonground" --limit=$tail_lines --format=json | jq .
    fi
    
    if [ "$service" = "all" ] || [ "$service" = "database" ]; then
        echo -e "\n${YELLOW}Database logs:${NC}"
        sudo -u postgres tail -f /var/log/postgresql/postgresql-*.log 2>/dev/null || echo "PostgreSQL logs not available"
    fi
}

cmd_test() {
    echo -e "${BLUE}🧪 Running Tests${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Unit tests
    echo "Running unit tests..."
    cd /opt/achievemore/ii-agent
    source venv/bin/activate
    python -m pytest tests/ -v
    
    # Integration tests
    echo ""
    echo "Running integration tests..."
    
    # Test endpoint
    local test_response=$(curl -X POST http://localhost:8000/test \
        -H "Content-Type: application/json" \
        -d '{"message": "Hello Oracle"}')
    
    if echo "$test_response" | jq . > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Integration test passed${NC}"
    else
        echo -e "${RED}✗ Integration test failed${NC}"
        echo "Response: $test_response"
        return 1
    fi
}

cmd_oracle() {
    echo -e "${BLUE}🔮 Oracle Decision Making${NC}"
    
    local request="${1:-optimize}"
    local app="${2:-resume-optimizer}"
    
    echo "Request: $request"
    echo "App: $app"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Call Oracle routing
    curl -X POST http://localhost:8000/oracle/decide \
        -H "Content-Type: application/json" \
        -d "{
            \"request\": \"$request\",
            \"app_id\": \"$app\",
            \"user_context\": {}
        }" | jq .
}

cmd_metrics() {
    echo -e "${BLUE}📊 Platform Metrics${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Query metrics from database
    sudo -u postgres psql -d achievemore_db << EOF
    SELECT 
        COUNT(*) as total_workflows,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE status = 'running') as running,
        ROUND(AVG(duration)::numeric, 2) as avg_duration_sec
    FROM workflows
    WHERE created_at > NOW() - INTERVAL '24 hours';
    
    SELECT 
        model,
        COUNT(*) as invocations,
        ROUND(AVG(tokens)::numeric, 0) as avg_tokens,
        ROUND(SUM(cost)::numeric, 4) as total_cost,
        ROUND((COUNT(*) FILTER (WHERE success))::numeric / COUNT(*) * 100, 1) as success_rate
    FROM model_invocations
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY model;
EOF
}

cmd_backup() {
    echo -e "${BLUE}💾 Backing Up Database${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local backup_file="$LOG_DIR/achievemore_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
    
    echo "Backing up to: $backup_file"
    
    sudo -u postgres pg_dump achievemore_db | gzip > "$backup_file"
    
    # Upload to GCS
    gsutil cp "$backup_file" gs://$GCP_PROJECT_ID-backups/
    
    echo -e "${GREEN}✓ Backup complete${NC}"
    echo "Size: $(du -h $backup_file | cut -f1)"
}

cmd_help() {
    cat << EOF
AchieveMore CLI v$VERSION

Usage: achievemore <command> [options]

Commands:
  
  status              Show platform status and metrics
  deploy [env]        Deploy to production (default: production)
  scale <workers>     Scale worker pool (e.g., "scale 100")
  logs [service]      Show logs (service: all|ii-agent|commonground|database)
  test                Run automated tests
  oracle <req> <app>  Test Oracle routing (e.g., "oracle optimize resume-optimizer")
  metrics             Show 24-hour performance metrics
  backup              Backup database to GCS
  help                Show this help message

Examples:
  
  achievemore status
  achievemore deploy production
  achievemore scale 150
  achievemore logs ii-agent
  achievemore test
  achievemore oracle "optimize my resume" resume-optimizer
  achievemore metrics
  achievemore backup

Environment Variables:

  GCP_PROJECT_ID      Google Cloud project ID
  OPENAI_API_KEY      OpenAI API key
  GOOGLE_API_KEY      Google Cloud API key
  ANTHROPIC_API_KEY   Anthropic API key

Documentation: https://docs.achievemore.com
Support: support@achievemore.com
EOF
}

# ============================================
# MAIN DISPATCH
# ============================================

main() {
    local cmd="${1:-status}"
    shift || true
    
    case "$cmd" in
        status)     cmd_status "$@" ;;
        deploy)     cmd_deploy "$@" ;;
        scale)      cmd_scale "$@" ;;
        logs)       cmd_logs "$@" ;;
        test)       cmd_test "$@" ;;
        oracle)     cmd_oracle "$@" ;;
        metrics)    cmd_metrics "$@" ;;
        backup)     cmd_backup "$@" ;;
        help)       cmd_help "$@" ;;
        -h|--help)  cmd_help "$@" ;;
        -v|--version) echo "AchieveMore CLI v$VERSION" ;;
        *)          
            echo -e "${RED}Unknown command: $cmd${NC}"
            echo "Use 'achievemore help' for usage information"
            return 1
            ;;
    esac
}

main "$@"
```

---

## 5. END-TO-END REQUEST PROCESSING PIPELINE

### 5.1 Request Lifecycle at 1M Users Scale

**Complete flow diagram:**

```
TIER 1: GLOBAL ENTRY POINT
┌──────────────────────────────────────────────┐
│ User in Brazil submits request               │
│ POST /api/resume/optimize                    │
│ {"resume_url": "...", "job_desc": "..."}     │
└────────────┬─────────────────────────────────┘
             │ Routed by Cloudflare
             ▼ (geo-proximity routing)
┌──────────────────────────────────────────────┐
│ TIER 2: EDGE CACHE                           │
│ Cloudflare nearest to Brazil (São Paulo)     │
│ - Check if same request cached (30sec)       │
│ - Parse & validate JWT                       │
│ - Extract geo + app context                  │
│ - Route to nearest CDM (US-EAST or LATAM?)   │
└────────────┬─────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│ TIER 3: REGIONAL HUB (US-EAST1)              │
│ API Gateway                                  │
│ ├─ Validate request schema                   │
│ ├─ Check rate limit (10K req/min per user)   │
│ ├─ Generate request ID                       │
│ ├─ Log to audit trail                        │
│ └─ Queue for Temporal                        │
└────────────┬─────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│ TIER 4: TEMPORAL WORKFLOW ENGINE             │
│ ├─ Workflow ID: wf_${uuid}                   │
│ ├─ Type: resume_optimize_workflow            │
│ ├─ Input: {resume_url, job_desc, user_id}   │
│ ├─ Timeout: 300 seconds                      │
│ └─ Start workflow                            │
└────────────┬─────────────────────────────────┘
             │ (Return 202 Accepted)
             │ {workflow_id, status: "queued"}
             │
             ├─ Activity 1: Download Resume
             ├─ Activity 2: Extract Content
             ├─ Activity 3: Oracle Decision
             ├─ Activity 4: Call LLM
             ├─ Activity 5: ATS Score
             ├─ Activity 6: Generate Output
             ├─ Activity 7: Store Result
             └─ Workflow Complete
             
             ▼
┌──────────────────────────────────────────────┐
│ TIER 5: WORKER EXECUTION                     │
│ Activity 1 (5-100ms): Download Resume        │
│ ├─ Worker A fetches from resume_url          │
│ ├─ Validate PDF/DOCX format                  │
│ ├─ Store in /tmp with request_id             │
│ └─ Return path: /tmp/wf_${id}_resume.pdf     │
│                                              │
│ Activity 2 (100-500ms): Extract Content      │
│ ├─ Call OCR (if scanned PDF)                 │
│ ├─ Extract text using pdfminer               │
│ ├─ Cache extracted text in Redis (7 days)    │
│ └─ Return: {name, skills, experience, etc}   │
│                                              │
│ Activity 3 (50ms): Oracle Decision           │
│ ├─ classify_intent: "optimize" ← keywords    │
│ ├─ estimate_complexity: "complex"            │
│ ├─ Check cache: hit! (same job desc before)  │
│ ├─ Retrieved decision: {model: "gpt-4"}      │
│ └─ Return: OracleDecision object             │
│                                              │
│ Activity 4 (500-2000ms): Call LLM            │
│ ├─ Build prompt (system + few-shots)         │
│ ├─ Call Model Router (MCP)                   │
│ ├─ Route to: gpt-4-turbo (from Oracle)       │
│ ├─ LLM response: {improvements, keywords}    │
│ └─ Cache response in Redis                   │
│                                              │
│ Activity 5 (200-500ms): ATS Score            │
│ ├─ Call ii-agent with scoring prompt         │
│ ├─ Count required keywords present           │
│ ├─ Check formatting compliance               │
│ └─ Return: {ats_score: 87, explanation}      │
│                                              │
│ Activity 6 (1000-3000ms): Generate Output    │
│ ├─ Create DOCX file from improvements        │
│ ├─ Add formatting & styling                  │
│ ├─ Generate PDF version                      │
│ ├─ Upload to Cloud Storage                   │
│ └─ Generate signed URL (24-hr expiry)        │
│                                              │
│ Activity 7 (50ms): Store Result              │
│ ├─ Store in Postgres                         │
│ │  - workflow_id, status, result_url,        │
│ │  - duration, cost, model_used              │
│ ├─ Update user's activity history            │
│ ├─ Trigger webhook (if user configured)      │
│ └─ Update analytics                          │
└────────────┬─────────────────────────────────┘
             │ (Total time: ~2-4 seconds)
             ▼
┌──────────────────────────────────────────────┐
│ TIER 6: RESULT DELIVERY                      │
│ Webhook/Polling from Spoke App               │
│ ├─ Frontend polls: GET /workflow/{id}        │
│ ├─ Status: "completed"                       │
│ ├─ Result: {url, ats_score, improvements}    │
│ └─ Show download button to user              │
└──────────────────────────────────────────────┘
```

---

## 6. MULTI-REGION SHARDING & SCALABILITY

### 6.1 Global Sharding Architecture

As you scale to 1M users, a single region becomes a bottleneck. Solution: **Geographic sharding**.

```
┌─────────────────────────────────────────────────────────────┐
│ GLOBAL LOAD BALANCER (DNS: api.achievemore.com)             │
│ ├─ Users in Americas (40%): → US-EAST1 (Google Cloud)       │
│ ├─ Users in Europe (35%): → EU-WEST1 (Google Cloud)         │
│ └─ Users in Asia-Pacific (25%): → ASIA-SOUTHEAST1 (Google)  │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┼────────┬──────────┐
    │        │        │          │
    ▼        ▼        ▼          ▼
┌──────┐ ┌──────┐ ┌─────┐  ┌────────┐
│US-   │ │EU-   │ │ASIA-│  │Backup: │
│EAST1 │ │WEST1 │ │SE1   │  │US-WEST1
└──────┘ └──────┘ └─────┘  └────────┘

Each CDM instance:
├─ Temporal Server + Workers
├─ PostgreSQL Primary
├─ Redis Cache
├─ Vector DB
└─ Object Storage
```

### 6.2 Data Consistency Strategy

**Challenge:** User A in US updates resume, User B in EU tries to access → need consistency

**Solution:** Write-through cache + read replicas

```
WRITE FLOW:
┌─────────────────────────────────────────┐
│ User A (Brazil) writes resume → US-EAST │
│                                         │
│ Step 1: Write to Postgres (Primary)     │
│ ├─ Grab write lock                      │
│ ├─ INSERT/UPDATE                        │
│ └─ Release lock                         │
│                                         │
│ Step 2: Invalidate Redis caches         │
│ ├─ DEL cache:{user_a}:resume            │
│ ├─ DEL cache:{user_a}:*                 │
│ └─ Broadcast to all CDMs                │
│                                         │
│ Step 3: Replicate to other regions      │
│ ├─ Postgres logical replication          │
│ ├─ Lag: <500ms typical                  │
│ └─ Async (doesn't block write)          │
└─────────────────────────────────────────┘

READ FLOW (from any region):
┌─────────────────────────────────────────┐
│ User B (EU) reads resume                │
│                                         │
│ Step 1: Check local Redis (EU-WEST1)    │
│ └─ Cache hit? Return immediately        │
│                                         │
│ Step 2: Check local Postgres replica    │
│ ├─ May be slightly stale (< 500ms)      │
│ ├─ But consistent with eventual model   │
│ └─ Cache in local Redis                 │
│                                         │
│ Step 3: Return to user                  │
│ └─ Local latency: 10-50ms               │
└─────────────────────────────────────────┘
```

---

## 7. TEMPORAL WORKFLOW ORCHESTRATION

### 7.1 Why Temporal for 1M Users?

Without Temporal:
- You build retry logic (hard to get right)
- You manage async/await (confusing state machines)
- Server crash = lost work (all in-memory state)
- No visibility into what agents are doing

With Temporal:
- Retries automatic + configurable
- Write code like it's synchronous (but it's actually distributed)
- Server crash = Temporal replays from log (transparent recovery)
- Full audit trail of every step

### 7.2 Temporal Workflow Definition

```python
# /backend/workflows/resume_optimizer_workflow.py

from datetime import timedelta
from temporalio import workflow, activity
import asyncio
from dataclasses import dataclass

@dataclass
class ResumeOptimizeInput:
    resume_url: str
    job_description: str
    user_id: str
    app_id: str

@dataclass
class ResumeOptimizeOutput:
    optimized_resume_url: str
    ats_score: int
    improvements: list[str]
    duration_seconds: float

class ResumeOptimizerWorkflow:
    """
    Workflow for optimizing resumes.
    
    This workflow:
    1. Downloads resume from URL
    2. Extracts content
    3. Gets Oracle routing decision
    4. Calls LLM for improvements
    5. Calculates ATS score
    6. Generates optimized document
    7. Stores results
    
    If any step fails, Temporal automatically retries
    with exponential backoff.
    """
    
    @workflow.run
    async def resume_optimize(self, input: ResumeOptimizeInput) -> ResumeOptimizeOutput:
        
        # Activity 1: Download resume (retries 3x, exponential backoff)
        resume_path = await workflow.execute_activity(
            activity.download_resume,
            input.resume_url,
            retry_policy=workflow.RetryPolicy(
                initial_interval=timedelta(seconds=1),
                maximum_interval=timedelta(seconds=10),
                maximum_attempts=3,
            ),
            start_to_close_timeout=timedelta(seconds=60),
        )
        
        # Activity 2: Extract content
        extracted = await workflow.execute_activity(
            activity.extract_resume_content,
            resume_path,
            retry_policy=workflow.RetryPolicy(maximum_attempts=2),
            start_to_close_timeout=timedelta(seconds=30),
        )
        
        # Activity 3: Get Oracle routing decision
        oracle_decision = await workflow.execute_activity(
            activity.oracle_decide,
            input.app_id,
            "optimize",
            extracted.complexity,
            retry_policy=workflow.RetryPolicy(maximum_attempts=2),
            start_to_close_timeout=timedelta(seconds=5),
        )
        
        # Activity 4: Call LLM based on Oracle decision
        llm_response = await workflow.execute_activity(
            activity.call_llm_optimized,
            oracle_decision,
            extracted,
            input.job_description,
            retry_policy=workflow.RetryPolicy(
                initial_interval=timedelta(seconds=2),
                maximum_interval=timedelta(seconds=30),
                maximum_attempts=2,  # Fallback to different model on second try
            ),
            start_to_close_timeout=timedelta(seconds=120),
        )
        
        # Activity 5: Calculate ATS score
        ats_score = await workflow.execute_activity(
            activity.calculate_ats_score,
            extracted,
            llm_response,
            retry_policy=workflow.RetryPolicy(maximum_attempts=2),
            start_to_close_timeout=timedelta(seconds=30),
        )
        
        # Activity 6: Generate optimized document
        # This can be parallel with ATS score
        # (Start both, wait for both)
        generate_task = workflow.execute_activity(
            activity.generate_optimized_resume,
            extracted,
            llm_response,
            retry_policy=workflow.RetryPolicy(maximum_attempts=1),
            start_to_close_timeout=timedelta(seconds=120),
        )
        
        optimized_url = await generate_task
        
        # Activity 7: Store result
        await workflow.execute_activity(
            activity.store_result,
            input.user_id,
            {
                "resume_url": optimized_url,
                "ats_score": ats_score,
                "improvements": llm_response.improvements,
                "model_used": oracle_decision.model,
                "cost": oracle_decision.estimated_cost,
            },
            retry_policy=workflow.RetryPolicy(maximum_attempts=3),
            start_to_close_timeout=timedelta(seconds=30),
        )
        
        return ResumeOptimizeOutput(
            optimized_resume_url=optimized_url,
            ats_score=ats_score,
            improvements=llm_response.improvements,
            duration_seconds=workflow.info().started_at  # Temporal tracks this
        )
```

---

## 8. RESOURCE MANAGEMENT & COST OPTIMIZATION

### 8.1 Cost Breakdown at 1M Users Scale

```
Monthly Infrastructure Cost Analysis (1M users, 10 req/user/day = 115 req/sec):

COMPUTE:
├─ Temporal Server: 3 instances (4 vCPU, 16GB RAM each)
│  └─ Cost: 3 × $100/month = $300
│
├─ Worker Pools: 50 base + 100 scaling (n1-standard-4 instances)
│  ├─ Base: 50 × $60/month = $3,000
│  ├─ Scaling (avg 50% of time): 50 × $60 × 0.5 = $1,500
│  └─ Total compute: $4,500
│
├─ Load Balancer & API Gateway
│  └─ Cost: $150 (Google Cloud Load Balancer)
│
└─ Total Compute: $4,950

DATABASE:
├─ PostgreSQL Primary (3-node high-availability cluster)
│  └─ 32 GB RAM, SSD: $2,000
│
├─ PostgreSQL Replica (read-only, for analytics)
│  └─ 16 GB RAM, SSD: $1,000
│
├─ Redis Cache (3GB)
│  └─ $500 (Cloud Memorystore)
│
├─ Vector DB (Supabase pgvector, included in Postgres)
│  └─ $0 (included)
│
├─ Cloud Storage (PDFs, generated documents)
│  └─ 1TB active storage: $20/month
│
└─ Total Database: $3,520

LLM INFERENCE:
├─ OpenAI API: 115 req/sec × 86,400 sec/day × 30 days
│  = 297,792,000 requests/month
│  ├─ Assume 60% use gpt-3.5 (cheap): 200k tokens
│    Cost: 0.0005 × (200k/1k) × 60% of requests = $36,000
│  ├─ Assume 30% use gpt-4 (moderate): 500k tokens
│    Cost: 0.015 × (500k/1k) × 30% of requests = $67,500
│  ├─ Assume 10% use gpt-5 (high quality): 800k tokens
│    Cost: 0.05 × (800k/1k) × 10% of requests = $40,000
│  └─ OpenAI total: ~$143,500
│
├─ Google Gemini: 115 req/sec × 30 days (fallback)
│  └─ Cost: ~$45,000 (fallback usage, lower cost)
│
├─ Anthropic Claude: 115 req/sec × 30 days (specialty)
│  └─ Cost: ~$60,000
│
└─ Total LLM: ~$248,500

NETWORKING:
├─ Data transfer (outbound): 100GB/month @ $0.12/GB = $12,000
├─ Cross-region replication: ~$5,000
└─ Total Networking: $17,000

MONITORING & LOGGING:
├─ Cloud Logging: $5,000 (1TB/month logs)
├─ Cloud Monitoring: $1,000
├─ Error Tracking: $500
└─ Total Monitoring: $6,500

SECURITY & COMPLIANCE:
├─ VPN/Private network: $1,000
├─ Backup storage (3 copies, 7 days retention): $2,000
├─ Security scanning: $500
└─ Total Security: $3,500

═════════════════════════════════════════════════════════════
TOTAL MONTHLY COST: ~$283,970

Cost per user per month: $283,970 ÷ 1,000,000 = $0.28
Cost per request: $283,970 ÷ (115 req/sec × 86,400 × 30) = $0.000095
```

### 8.2 Cost Optimization Strategies

```
Strategy 1: Smart Model Routing (Oracle Framework)
├─ Current: Assume even distribution across models
├─ Optimized: 70% cheap models, 20% moderate, 10% premium
└─ Savings: ~40% LLM costs = $99,400/month saved

Strategy 2: Request Caching
├─ Current: All requests hit LLM
├─ Optimized: Cache 35% of identical requests (same resume + same job desc)
├─ Savings: 35% × $248,500 = $86,975/month saved

Strategy 3: Spot Instance Workers
├─ Current: On-demand instances @ $0.095/hour
├─ Optimized: Spot instances @ $0.028/hour (70% discount, Google guarantee)
├─ Compute savings: 70% × $4,500 = $3,150/month

Strategy 4: Batch Processing
├─ Current: Process each request individually
├─ Optimized: Batch similar requests (e.g., 20 resumes → 1 LLM call)
├─ Challenge: Need to aggregate results accurately
├─ Savings: 20% of LLM calls = $49,700/month (if feasible)

Strategy 5: Regional Optimization
├─ Current: Same pricing globally
├─ Optimized: Route low-priority tasks to cheaper regions (compute arbitrage)
├─ Potential savings: 15-20% compute ($750/month)

═════════════════════════════════════════════════════════════
Total Monthly Savings with all strategies: ~$240K
New monthly cost: ~$44K
New cost per user: $0.044/month ($0.53/user/year)
New cost per request: $0.000015
```

---

## 9. SECURITY & ISOLATION LAYER

### 9.1 Multi-Tenancy Isolation

With 100 independent Spoke apps running on one CDM, isolation is critical.

```
NETWORK ISOLATION:
├─ Each tenant gets isolated namespace in Temporal
│  └─ Workflow namespace: "achievemore_resume_optimizer"
│  └─ Workflow namespace: "achievemore_legal_analyzer"
│  └─ Workflow namespace: "achievemore_medical_checker"
│
├─ Database Row-Level Security (RLS)
│  └─ SELECT user_resume WHERE user_id = ${authenticated_user_id}
│  └─ PostgreSQL enforces at database level
│
├─ Redis Key Prefixing
│  └─ User data: "user:{user_id}:*"
│  └─ App data: "app:{app_id}:*"
│  └─ No cross-access possible
│
└─ Vector DB Isolation
   └─ Each app has separate vector index
   └─ Query returns only within app partition

COMPUTE ISOLATION:
├─ Container sandboxing
│  └─ Worker runs in isolated Docker container
│  └─ --memory 512m, --cpus 1 (resource limits)
│  └─ --read-only filesystem (except /tmp)
│
├─ Agent execution limits
│  ├─ Timeout: 5 minutes max per agent run
│  ├─ Memory: 512MB max per agent
│  ├─ Network: Only whitelisted external APIs allowed
│  └─ File access: Only /tmp and object storage
│
└─ API isolation
   └─ Each spoke has unique API key
   └─ Rate limiting: 100 req/sec per app
   └─ Quota: 1M requests/month per app (paid tier)

DATA ISOLATION:
├─ At-rest encryption
│  └─ All Postgres: AES-256 encryption
│  └─ All object storage: Google-managed keys
│  └─ Redis: TLS in-transit
│
├─ In-transit encryption
│  └─ All APIs: HTTPS/TLS 1.3
│  └─ Database connections: SSL required
│  └─ Replication: Encrypted tunnels
│
└─ Encryption key management
   └─ Keys stored in Google Cloud KMS
   └─ Automatic key rotation (monthly)
   └─ Access logs for all key operations
```

---

## 10. MONITORING, LOGGING & OBSERVABILITY

### 10.1 Three-Pillar Observability

```
PILLAR 1: LOGS (What happened?)
┌──────────────────────────────────────────┐
│ Google Cloud Logging                     │
│ ├─ All agent actions logged              │
│ ├─ All LLM calls logged (input + output) │
│ ├─ All database operations logged        │
│ ├─ Retention: 30 days (searchable)       │
│ └─ Archive: 7 years (Cloud Storage)      │
│                                          │
│ Example log entry:                       │
│ {                                        │
│   "timestamp": "2026-01-05T14:32:10Z",   │
│   "workflow_id": "wf_abc123",            │
│   "activity": "call_llm_optimized",      │
│   "model": "gpt-4-turbo",                │
│   "input_tokens": 450,                   │
│   "output_tokens": 320,                  │
│   "latency_ms": 1850,                    │
│   "status": "success",                   │
│   "cost": 0.0089,                        │
│   "user_id": "user_xyz"                  │
│ }                                        │
└──────────────────────────────────────────┘

PILLAR 2: METRICS (What's the trend?)
┌──────────────────────────────────────────┐
│ Google Cloud Monitoring + Prometheus      │
│                                          │
│ System Metrics (1-minute granularity):   │
│ ├─ CPU usage: 45% (alert if >80%)       │
│ ├─ Memory: 2.1GB / 4GB (alert if >85%)  │
│ ├─ Disk: 450GB / 500GB (alert if >90%)  │
│ ├─ Network: 120 Mbps in, 80 Mbps out    │
│ └─ Requests/sec: 115 (expected)         │
│                                          │
│ Application Metrics:                     │
│ ├─ Workflow success rate: 99.2%         │
│ ├─ Workflow p50 latency: 2.1s           │
│ ├─ Workflow p99 latency: 8.3s           │
│ ├─ LLM success rate: 97.8%              │
│ ├─ Cache hit rate: 38%                  │
│ ├─ Average cost per request: $0.00015   │
│ └─ Active user sessions: 45,000         │
│                                          │
│ Business Metrics:                        │
│ ├─ Requests completed: 100M/month       │
│ ├─ Revenue: $50K/month                  │
│ ├─ Monthly recurring revenue: $140K     │
│ ├─ Churn rate: 2.1%                    │
│ └─ Customer satisfaction: 4.7/5.0       │
└──────────────────────────────────────────┘

PILLAR 3: TRACES (How did it flow?)
┌──────────────────────────────────────────┐
│ Google Cloud Trace + Jaeger               │
│                                          │
│ Distributed trace for single request:    │
│ request_id: req_20260105_abc123          │
│                                          │
│ ├─ [0ms] API Gateway                    │
│ │  └─ Auth check: 5ms                    │
│ │  └─ Rate limit check: 2ms              │
│ ├─ [7ms] Temporal Workflow Created       │
│ ├─ [10ms] Activity: download_resume      │
│ │  └─ Fetch from resume_url: 45ms       │
│ │  └─ Validate PDF: 8ms                  │
│ ├─ [63ms] Activity: extract_content      │
│ │  └─ OCR (if needed): 120ms            │
│ │  └─ Text extraction: 15ms              │
│ ├─ [198ms] Activity: oracle_decide       │
│ │  └─ Cache hit! (return cached): 3ms   │
│ ├─ [201ms] Activity: call_llm_optimized │
│ │  └─ Prompt building: 10ms              │
│ │  └─ LLM call (gpt-4-turbo): 1850ms    │
│ │  └─ Response parsing: 5ms              │
│ ├─ [2066ms] Activity: calculate_ats     │
│ │  └─ Scoring logic: 250ms               │
│ ├─ [2316ms] Activity: generate_document │
│ │  └─ DOCX generation: 800ms            │
│ │  └─ Upload to storage: 450ms          │
│ ├─ [3566ms] Activity: store_result      │
│ │  └─ Database write: 15ms               │
│ │  └─ Webhook call: 50ms                 │
│ └─ [3631ms] COMPLETE (total: 3.6 sec)   │
│                                          │
│ Cost attribution:                        │
│ ├─ LLM cost: $0.0089 (gpt-4 tokens)    │
│ ├─ Compute cost: $0.0004                │
│ ├─ Storage cost: $0.00002               │
│ └─ Total: $0.00932                      │
└──────────────────────────────────────────┘
```

---

## 11. DISASTER RECOVERY & HIGH AVAILABILITY

### 11.1 RTO/RPO Targets

```
RECOVERY OBJECTIVES:
├─ RTO (Recovery Time Objective): 5 minutes
│  └─ If primary region down, failover to backup in <5 min
│
├─ RPO (Recovery Point Objective): 1 minute
│  └─ If data loss, max 1 minute of data lost
│
└─ Availability Target: 99.95% (52 minutes downtime/year)

MULTI-REGION ACTIVE-ACTIVE:
┌─────────────────────────────────────────────────────────┐
│ US-EAST1 (Active)          EU-WEST1 (Active)            │
│ ├─ Temporal Primary         ├─ Temporal Replica          │
│ ├─ Postgres Primary         ├─ Postgres Replica          │
│ ├─ Redis Leader             ├─ Redis Replica             │
│ ├─ 50 active workers        ├─ 30 active workers        │
│ └─ Serves 60% traffic       └─ Serves 40% traffic       │
│                                                         │
│         ↕ Continuous Replication                        │
│         • Postgres logical replication (<500ms lag)     │
│         • Redis active-active replication                │
│         • Temporal workflow history replicated           │
│                                                         │
│ If US-EAST1 fails:                                      │
│ ├─ Global LB detects no health check response           │
│ ├─ Switches 100% traffic to EU-WEST1                    │
│ ├─ EU-WEST1 scales up workers 30→100 (auto-scale)      │
│ ├─ Postgres EU reads become primary (failover)          │
│ └─ Time to full service: ~2 minutes                     │
└─────────────────────────────────────────────────────────┘

BACKUP STRATEGY:
├─ Continuous backup (every change)
│  ├─ Postgres: Binary log shipping to Cloud Storage      │
│  ├─ Object storage: Versioning enabled                  │
│  └─ Retention: 30 days daily + 365 days monthly         │
│
├─ Point-in-time recovery
│  └─ Restore database to any second within 7 days        │
│
└─ Backup testing
   └─ Monthly: Restore backup to staging, verify          │
```

---

## 12. PRODUCTION DEPLOYMENT CHECKLIST

### 12.1 Pre-Deployment

- [ ] **Code Review**
  - [ ] Peer reviewed all changes
  - [ ] No hardcoded API keys or passwords
  - [ ] No console.log or debug statements
  - [ ] Type safety checks passed (TypeScript compilation)

- [ ] **Security Scan**
  - [ ] Snyk scan for vulnerability
  - [ ] No SQL injection possible
  - [ ] Authentication enforced on all endpoints
  - [ ] Rate limiting configured

- [ ] **Performance Testing**
  - [ ] Load test: 1000 concurrent users
  - [ ] Stress test: 5000 concurrent users
  - [ ] Latency p99 < 10 seconds
  - [ ] Error rate < 0.1%

- [ ] **Database**
  - [ ] Migrations tested on staging
  - [ ] Rollback scripts prepared
  - [ ] Backups verified
  - [ ] Indexes analyzed

- [ ] **Configuration**
  - [ ] Environment variables set in KMS
  - [ ] API keys rotated (if needed)
  - [ ] Monitoring alerts configured
  - [ ] Log retention policy set

### 12.2 Deployment Execution

```bash
#!/bin/bash
# /scripts/deploy-production.sh

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Starting production deployment...${NC}"

# Step 1: Blue-Green Preparation
echo "Step 1/8: Preparing blue-green deployment..."
gcloud run deploy ii-agent-green \
    --image gcr.io/$GCP_PROJECT_ID/ii-agent:${VERSION} \
    --no-traffic \
    --memory 2Gi \
    --region us-central1

# Smoke tests on green
echo "Running smoke tests on green instance..."
GREEN_URL=$(gcloud run describe ii-agent-green --region us-central1 --format 'value(status.url)')
if ! curl -s ${GREEN_URL}/health; then
    echo -e "${RED}✗ Smoke tests failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Smoke tests passed${NC}"

# Step 2: Database Migration
echo "Step 2/8: Running database migrations..."
cd /opt/achievemore/CommonGround
npm run db:migrate

# Step 3: Traffic Shift (Canary)
echo "Step 3/8: Starting canary deployment (5% traffic)..."
gcloud run services update-traffic ii-agent \
    --to-revisions ii-agent-green=5,ii-agent=95 \
    --region us-central1

sleep 60  # Monitor for 1 minute

# Check error rate
ERROR_RATE=$(gcloud monitoring time-series list \
    --filter 'metric.type=run.googleapis.com/request_count AND resource.service_name=ii-agent' \
    --interval-end-time 2026-01-05T14:33:00Z \
    --interval-start-time 2026-01-05T14:32:00Z | grep error_count || echo "0")

if [ "$ERROR_RATE" -gt "10" ]; then
    echo -e "${RED}✗ Error rate too high, rolling back${NC}"
    gcloud run services update-traffic ii-agent \
        --to-revisions ii-agent=100 \
        --region us-central1
    exit 1
fi

# Step 4: Increase Canary
echo "Step 4/8: Increasing canary to 25%..."
gcloud run services update-traffic ii-agent \
    --to-revisions ii-agent-green=25,ii-agent=75 \
    --region us-central1

sleep 120  # Monitor for 2 minutes

# Step 5: Full Traffic Shift
echo "Step 5/8: Shifting 100% traffic to green..."
gcloud run services update-traffic ii-agent \
    --to-revisions ii-agent-green=100 \
    --region us-central1

# Step 6: Promote Green to Blue
echo "Step 6/8: Promoting green to primary..."
gcloud run services update ii-agent \
    --traffic ii-agent-green=100 \
    --region us-central1

# Rename for clarity
gcloud run deploy ii-agent-blue \
    --image gcr.io/$GCP_PROJECT_ID/ii-agent:${VERSION} \
    --region us-central1

# Step 7: Cleanup Old Blue
echo "Step 7/8: Cleaning up old revision..."
# Keep last 3 revisions for rollback
gcloud run revisions list --service ii-agent --region us-central1 \
    --sort-by='~created' --limit=3 | tail -n +4 | while read revision; do
    gcloud run revisions delete $revision --region us-central1 --quiet
done

# Step 8: Post-Deployment Verification
echo "Step 8/8: Running post-deployment checks..."

echo "Checking application health..."
HEALTH_URL=$(gcloud run describe ii-agent --region us-central1 --format 'value(status.url)')
for i in {1..10}; do
    if curl -s ${HEALTH_URL}/health > /dev/null; then
        echo -e "${GREEN}✓ Health check passed${NC}"
        break
    fi
    sleep 2
done

echo "Verifying database..."
npm run db:verify

echo "Running integration tests..."
npm run test:integration

echo ""
echo -e "${GREEN}✅ Production deployment complete!${NC}"
echo "Deployed version: ${VERSION}"
echo "Service URL: ${HEALTH_URL}"
```

---

## CONCLUSION & NEXT STEPS

This document provides the complete blueprint for operating AchieveMore at 1M concurrent users.

### Key Takeaways:

1. **Central Development Machine (CDM)** is the heart - it orchestrates 100+ Spokes
2. **Oracle Framework** routes requests intelligently (cost-efficient)
3. **Temporal** handles all the hard distributed system problems
4. **Multi-region sharding** enables global scale
5. **CLI toolkit** manages everything via terminal

### Immediate Implementation (Week 1):

```bash
# Install CDM
./scripts/install-cdm.sh

# Deploy first Spoke (Resume Optimizer)
achievemore deploy production

# Monitor
achievemore status
achievemore metrics

# Scale as needed
achievemore scale 100  # 100 workers for 10K concurrent users
```

### Success Metrics to Track:

```yaml
Daily:
  - Workflow success rate: >99.5%
  - Average latency: <3 seconds
  - Error rate: <0.1%

Weekly:
  - Cost per request: <$0.001
  - Cache hit rate: >30%
  - Uptime: >99.95%

Monthly:
  - Revenue per request: $0.005+
  - Gross margin: >70%
  - Churn rate: <2%
```

---

**Document prepared by:** Platform Engineering Team  
**Last updated:** January 5, 2026  
**Next review:** March 5, 2026

For updates and support: https://docs.achievemore.com
