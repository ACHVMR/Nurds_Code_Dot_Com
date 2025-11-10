# Sprint 2: Modal GPU Workers - Execution Plan

**Date:** October 16, 2025  
**Security Tier:** Enhanced (≥90% V.I.B.E. score)  
**FDH Estimate:** Foster: 1h | Develop: 3h | Hone: 0.5h (parallel)  
**Total Runtime:** 4 hours

---

## Overview

Deploy Boomer_Ang task execution on Modal's GPU infrastructure to enable parallel, high-performance AI workload processing with Charter-Ledger separation and comprehensive cost tracking.

**Key Objective:** Transform Boomer_Ang specialists from database records to active GPU workers that execute AI tasks with sub-second cold starts and automatic scaling.

---

## Technical Architecture

### Modal GPU Configuration

```yaml
gpu_config:
  type: "A10G" # NVIDIA A10G Tensor Core GPU
  count: 1 # Single GPU per worker
  memory: "24GB" # GPU memory
  cpu: 4 # CPU cores
  ram: "16GB" # System RAM
  timeout: 3600 # 1 hour max execution

pricing:
  compute: "$0.0004/second" # $1.44/hour
  cold_start: "< 1 second" # Container already warm
  billing: "Per-second granularity"
```

### Boomer_Ang Worker Types

```yaml
specialist_workers:
  Code_Ang: # Software Development
    gpu: "A10G"
    models: ["gpt-4.1-nano", "claude-3.5-haiku", "deepseek-v3.2"]
    tools: ["git", "docker", "fastapi", "next.js"]

  Scout_Ang: # Research & Intelligence
    gpu: "A10G"
    models: ["gpt-4.1-nano", "ii-researcher"]
    tools: ["tavily", "serpapi", "deerflow"]

  Paint_Ang: # Visual Design
    gpu: "A10G"
    models: ["flux-schnell", "stable-diffusion-xl"]
    tools: ["superdesign-api", "figma-api"]
```

---

## Task Breakdown

### Task 1: Create Sprint 2 Execution Plan ✅ (Current)

**Time:** 15 minutes  
**Deliverable:** This document

**Acceptance Criteria:**

- [ ] Complete Modal architecture diagram
- [ ] All 8 tasks defined with clear acceptance criteria
- [ ] Cost model documented
- [ ] Security tier assigned

---

### Task 2: Install Modal Python SDK

**Time:** 10 minutes  
**Commands:**

```powershell
# Install Modal SDK
cd backend
pip install modal

# Authenticate with Modal
modal token new
```

**Expected Output:**

```
Successfully installed modal-0.63.0
✓ Launched web browser to https://modal.com/token/new
✓ Token stored in ~/.modal.toml
```

**Acceptance Criteria:**

- [ ] Modal SDK installed (version ≥0.63.0)
- [ ] Authentication token stored in ~/.modal.toml
- [ ] `modal token list` shows active token

**Troubleshooting:**

- If browser doesn't open: Visit https://modal.com/token/new manually
- If token fails: Check Modal account status and billing

---

### Task 3: Create Modal GPU Configuration

**Time:** 30 minutes  
**Deliverable:** `backend/modal-workers/modal_config.py`

**Configuration Requirements:**

```python
import modal

# Create Modal app
app = modal.App("deploy-boomer-angs")

# Define GPU image with dependencies
gpu_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install([
        "openai",
        "anthropic",
        "httpx",
        "pydantic",
        "psycopg2-binary",
        "redis"
    ])
)

# Define GPU function with A10G
@app.function(
    image=gpu_image,
    gpu="A10G",
    cpu=4,
    memory=16384,
    timeout=3600,
    secrets=[
        modal.Secret.from_name("openrouter-api-key"),
        modal.Secret.from_name("database-url"),
        modal.Secret.from_name("redis-url")
    ]
)
async def execute_boomer_ang_task(
    boomer_ang_id: str,
    task_type: str,
    task_payload: dict,
    engagement_id: str
):
    """Execute Boomer_Ang task on GPU"""
    pass
```

**Acceptance Criteria:**

- [ ] Modal app defined with name "deploy-boomer-angs"
- [ ] GPU image includes all AI SDK dependencies
- [ ] A10G GPU configured with 4 CPU, 16GB RAM
- [ ] Secrets configured for API keys and database
- [ ] Timeout set to 3600 seconds (1 hour max)

---

### Task 4: Deploy Boomer_Ang Task Executor

**Time:** 90 minutes  
**Deliverable:** `backend/modal-workers/boomer_ang_executor.py`

**Core Implementation:**

```python
import modal
from datetime import datetime
import psycopg2
import json

app = modal.App("deploy-boomer-angs")

@app.function(gpu="A10G", timeout=3600)
async def execute_task(
    boomer_ang_id: str,
    task_type: str,
    task_payload: dict,
    engagement_id: str,
    webhook_url: str
):
    """
    Execute Boomer_Ang task on GPU with Charter-Ledger logging

    Task Types:
    - "code_generation": Generate code with Code_Ang
    - "research": Conduct research with Scout_Ang
    - "design": Create visuals with Paint_Ang
    - "data_analysis": Analyze data with Crunch_Ang
    """

    start_time = datetime.utcnow()

    try:
        # 1. Log task start to Ledger (internal)
        await log_to_ledger(engagement_id, "task_started", {
            "boomer_ang_id": boomer_ang_id,
            "task_type": task_type,
            "gpu_type": "A10G",
            "start_time": start_time.isoformat()
        })

        # 2. Execute task based on type
        result = await execute_by_type(boomer_ang_id, task_type, task_payload)

        # 3. Calculate costs (internal only)
        execution_time = (datetime.utcnow() - start_time).total_seconds()
        gpu_cost = execution_time * 0.0004  # $0.0004/second
        llm_cost = result.get("llm_cost", 0.0)
        total_cost = gpu_cost + llm_cost

        # 4. Log to Charter (customer-facing - NO costs)
        await log_to_charter(engagement_id, "task_completed", {
            "boomer_ang_id": boomer_ang_id,
            "task_type": task_type,
            "status": "success",
            "execution_time": f"{execution_time:.2f}s"
        })

        # 5. Log to Ledger (internal - WITH costs)
        await log_to_ledger(engagement_id, "task_completed", {
            "boomer_ang_id": boomer_ang_id,
            "task_type": task_type,
            "status": "success",
            "execution_time": execution_time,
            "gpu_cost": gpu_cost,
            "llm_cost": llm_cost,
            "total_cost": total_cost,
            "gpu_type": "A10G"
        })

        # 6. Send webhook to ACHEEVY
        await send_webhook(webhook_url, {
            "engagement_id": engagement_id,
            "status": "completed",
            "result": result
        })

        return {
            "status": "success",
            "result": result,
            "execution_time": execution_time
        }

    except Exception as e:
        # Log failure to both Charter and Ledger
        await log_to_charter(engagement_id, "task_failed", {
            "boomer_ang_id": boomer_ang_id,
            "error": str(e)
        })

        await log_to_ledger(engagement_id, "task_failed", {
            "boomer_ang_id": boomer_ang_id,
            "error": str(e),
            "traceback": traceback.format_exc()
        })

        raise
```

**Acceptance Criteria:**

- [ ] Task execution supports 4+ task types
- [ ] Charter logs exclude internal costs (gpu_cost, llm_cost)
- [ ] Ledger logs include ALL cost breakdowns
- [ ] Webhook sent to ACHEEVY on completion
- [ ] Error handling with Charter-Ledger separation
- [ ] GPU utilization tracked and logged

---

### Task 5: Implement Webhook Integration

**Time:** 45 minutes  
**Deliverable:** `backend/acheevy-orchestrator/webhook_receiver.py`

**Webhook Endpoint:**

```python
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel

app = FastAPI()

class ModalWebhook(BaseModel):
    engagement_id: str
    status: str
    result: dict
    execution_time: float

@app.post("/webhooks/modal/task-complete")
async def handle_modal_completion(
    webhook: ModalWebhook,
    background_tasks: BackgroundTasks
):
    """
    Receive task completion from Modal GPU worker
    """

    # 1. Update engagement status in database
    await update_engagement_status(
        webhook.engagement_id,
        "task_completed"
    )

    # 2. Log to Charter (customer-facing)
    await log_charter(webhook.engagement_id, {
        "event": "boomer_ang_completed",
        "status": webhook.status,
        "execution_time": f"{webhook.execution_time:.2f}s"
    })

    # 3. Trigger next task in pipeline (background)
    background_tasks.add_task(
        trigger_next_task,
        webhook.engagement_id
    )

    return {"status": "acknowledged"}
```

**Acceptance Criteria:**

- [ ] Webhook endpoint created at `/webhooks/modal/task-complete`
- [ ] Engagement status updated in PostgreSQL
- [ ] Charter log created (no internal costs)
- [ ] Pipeline continuation triggered in background
- [ ] Error handling for webhook failures

---

### Task 6: Create Testing Suite

**Time:** 30 minutes  
**Deliverable:** `frontend/tests/modal/gpu-workers.spec.ts`

**Test Coverage:**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Modal GPU Workers", () => {
  test("should execute Code_Ang task on A10G GPU", async () => {
    // Test code generation task
    const response = await fetch("http://localhost:8000/api/execute-task", {
      method: "POST",
      body: JSON.stringify({
        boomer_ang_id: "code_ang_001",
        task_type: "code_generation",
        task_payload: { prompt: "Create FastAPI endpoint" },
      }),
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.status).toBe("success");
  });

  test("should log to Charter without costs", async () => {
    // Verify Charter-Ledger separation
    const charterLogs = await getCharterLogs(engagementId);

    for (const log of charterLogs) {
      expect(log.metadata).not.toHaveProperty("gpu_cost");
      expect(log.metadata).not.toHaveProperty("llm_cost");
      expect(log.metadata).not.toHaveProperty("total_cost");
    }
  });

  test("should log to Ledger with full costs", async () => {
    // Verify Ledger contains internal costs
    const ledgerLogs = await getLedgerLogs(engagementId);
    const completionLog = ledgerLogs.find((l) => l.event === "task_completed");

    expect(completionLog.metadata).toHaveProperty("gpu_cost");
    expect(completionLog.metadata).toHaveProperty("llm_cost");
    expect(completionLog.metadata).toHaveProperty("total_cost");
  });
});
```

**Acceptance Criteria:**

- [ ] 10+ tests covering all Boomer_Ang task types
- [ ] Charter-Ledger separation validated
- [ ] GPU cost calculation tested
- [ ] Webhook delivery confirmed
- [ ] Error scenarios handled

---

### Task 7: Deploy to Modal Cloud

**Time:** 15 minutes  
**Commands:**

```powershell
cd backend/modal-workers

# Deploy Modal app
modal deploy boomer_ang_executor.py

# Verify deployment
modal app list
```

**Expected Output:**

```
✓ Created objects.
├── 🔨 Created mount /Users/.../backend/modal-workers
├── 🔨 Created function execute_task
└── 🔨 Created app deploy-boomer-angs

✓ App deployed! 🎉

View app: https://modal.com/apps/ap-xxxxxxxx
```

**Acceptance Criteria:**

- [ ] Modal app deployed successfully
- [ ] Function accessible at Modal dashboard
- [ ] GPU allocation verified (A10G available)
- [ ] Secrets properly configured
- [ ] Cold start < 1 second confirmed

---

### Task 8: Document Sprint 2 Completion

**Time:** 20 minutes  
**Deliverable:** `backend/modal-workers/SPRINT2_COMPLETION_REPORT.md`

**Report Contents:**

- Deployment statistics (functions deployed, GPU type)
- Cost analysis (per-second pricing, total spend)
- Performance benchmarks (cold start, execution time)
- Charter-Ledger validation results
- V.I.B.E. score calculation (target: ≥90%)
- Comparison: Traditional GPU setup vs Modal (time/cost)

**Acceptance Criteria:**

- [ ] All metrics documented
- [ ] V.I.B.E. score ≥90% (Enhanced tier)
- [ ] Cost comparison shows savings
- [ ] Ready for Sprint 3 confirmation

---

## Cost Model

### Modal GPU Pricing

```yaml
compute_costs:
  a10g_gpu: "$0.0004/second" # $1.44/hour
  cpu_4_core: "Included"
  memory_16gb: "Included"

billing:
  granularity: "Per-second"
  minimum: "$0.0004" # 1 second
  cold_start: "Free" # < 1 second

monthly_estimate:
  usage: "100 hours/month"
  cost: "$144/month"
  vs_dedicated: "$2,500/month" # 94.2% savings
```

### LLM Costs (Internal - Ledger Only)

```yaml
llm_costs:
  gpt_4_1_nano:
    input: "$0.25/1M tokens"
    output: "$2.00/1M tokens"

  claude_3_5_haiku:
    input: "$0.25/1M tokens"
    output: "$1.25/1M tokens"

  deepseek_v3_2:
    input: "$0.028/1M tokens"
    output: "$0.10/1M tokens"
```

---

## Security & Compliance

### Secrets Management

```yaml
modal_secrets:
  - name: "openrouter-api-key"
    type: "API_KEY"
    required: true

  - name: "database-url"
    type: "CONNECTION_STRING"
    required: true

  - name: "redis-url"
    type: "CONNECTION_STRING"
    required: true

  - name: "webhook-secret"
    type: "SECRET_KEY"
    required: true
```

### Charter-Ledger Rules

```yaml
charter_logs: # Customer-facing
  allowed_fields:
    - event
    - status
    - execution_time
    - boomer_ang_id
    - task_type

  blocked_fields: # NEVER expose
    - gpu_cost
    - llm_cost
    - total_cost
    - provider
    - model_name

ledger_logs: # Internal audit
  include_all_fields: true
  retention: "7 years"
  encryption: "at rest + in transit"
```

---

## V.I.B.E. Requirements

### Enhanced Tier (≥90%)

- **V**erifiable: Complete audit trail, GPU metrics, cost tracking
- **I**dempotent: Tasks can be safely retried, state management
- **B**ounded: Timeouts (3600s), rate limits, cost caps
- **E**vident: Charter-Ledger separation, webhook confirmations

---

## Success Criteria

| Criterion                 | Target        | Validation            |
| ------------------------- | ------------- | --------------------- |
| Modal SDK installed       | ≥0.63.0       | `modal --version`     |
| GPU workers deployed      | 1+ functions  | Modal dashboard       |
| Cold start time           | < 1 second    | Modal logs            |
| Charter-Ledger separation | 100%          | Playwright tests      |
| V.I.B.E. score            | ≥90%          | Automated calculation |
| Cost tracking             | 100% accurate | Ledger validation     |
| Webhook delivery          | 100% success  | Test suite            |

---

## Timeline

```
Task 1: Execution Plan         [15 min] ✅ COMPLETE
Task 2: Install Modal          [10 min] ⏳ READY
Task 3: GPU Configuration      [30 min] ⏳ PENDING
Task 4: Task Executor          [90 min] ⏳ PENDING
Task 5: Webhook Integration    [45 min] ⏳ PENDING
Task 6: Testing Suite          [30 min] ⏳ PENDING
Task 7: Deploy to Modal        [15 min] ⏳ PENDING
Task 8: Completion Report      [20 min] ⏳ PENDING
─────────────────────────────────────────
TOTAL: 4 hours (Foster: 1h, Develop: 3h, Hone: 0.5h parallel)
```

---

## Next Steps

1. **Immediate:** Install Modal Python SDK (Task 2)
2. **Sequential:** Follow task order 2 → 3 → 4 → 5 → 6 → 7 → 8
3. **Validation:** Run Playwright tests after each major component
4. **Documentation:** Update Charter/Ledger logs throughout

---

**ACHEEVY Assessment:**

> "Sprint 2 enables true AI-native execution with GPU-powered Boomer_Angs. Modal's per-second billing and sub-second cold starts eliminate traditional GPU infrastructure overhead. Charter-Ledger separation ensures customer trust while maintaining comprehensive internal cost tracking."

---

**Ready to execute Task 2: Install Modal Python SDK**
