# DEPLOY Platform: AI Builder Wiring Instructions
## Agent OS + Builder OS Implementation for Modular, Lightweight Architecture

**Version:** 2.0  
**Date:** January 3, 2026  
**Status:** Active Build Direction  
**Target:** Eliminate Engagement Stage Wiring Issues

---

## Executive Direction: No Tunnel Vision

**The goal is NOT:**
- Just fixing Cloud Run wiring
- Just connecting Chat to Orchestrator
- Just getting Firebase working

**The goal IS:**
- Build DEPLOY as a **Plugs Delivery Platform**
- Full-stack smart apps (Plugs) as the **atomic unit of value**
- Architecture must support **modular, ephemeral, isolated execution**
- Infrastructure is **lightweight but bulletproof**
- Only spin up what you need, only when you need it

---

## Part 1: Understand the Architecture Gap

### Current State (What's Working)
```
User → Frontend (Next.js) → Orchestrator (Express.js, Port 3001) → Firestore
        ✅ Works              ✅ Monolithic            ✅ Persists
```

### Problem
- **Orchestrator is monolithic** - Handles ALL engagements in one process
- **No isolation** - One user's large build blocks others
- **No modular execution** - FDH phases (Foster/Develop/Hone) are sequential promises, not containers
- **Wiring chaos** - ACHEEVY, Firestore, message routing all tangled together
- **Not aligned with Agent OS** - No clear context layers (Standards/Product/Specs)
- **Not aligned with Builder OS** - No clear separation of Design (Guide Me) vs Build (Manage It)

### Target State (What We're Building)
```
User → Frontend → Router (Orchestrator) → Decides → Creates Sandbox (Cloud Run Job)
                        ↓
                    Firestore (Persistent Context)
                        ↑
                    Sandbox Container (Ephemeral Workspace)
                    • Loads engagement context
                    • Executes FDH phases
                    • Saves artifacts
                    • Terminates when done
```

---

## Part 2: The Three-Layer Architecture (Agent OS)

### Layer 1: STANDARDS (Immutable Rules)
**File:** `standards/` folder in Orchestrator Service

```typescript
// standards/guide-me-standard.ts
export const GUIDE_ME_STANDARD = {
  mode: "GUIDE_ME",
  phases: ["DISCOVER", "CLARIFY", "STRUCTURE", "PRESENT"],
  timelineEstimate: "2-8 hours human time",
  outputs: ["Specification", "Architecture Diagram", "Q&A Document"],
  rules: {
    noCodeGeneration: true,
    focusOnRequirements: true,
    userApprovalNeeded: true,
  },
};

// standards/manage-it-standard.ts
export const MANAGE_IT_STANDARD = {
  mode: "MANAGE_IT",
  phases: ["BUILD", "TEST", "DEPLOY", "HANDOFF"],
  timelineEstimate: "4-48 hours autonomous",
  outputs: ["Complete Codebase", "Deployed Service", "Documentation"],
  rules: {
    fullAutonomy: true,
    modularDeployment: true,
    eachServiceIndependent: true,
  },
};

// standards/modular-service-standard.ts
export const MODULAR_SERVICE_STANDARD = {
  pattern: "Microservice in Cloud Run Container",
  constraints: {
    maxConcurrency: 1, // One engagement per container
    timeout: 3600, // 1 hour max per phase
    memory: "2Gi",
    cpu: "1",
  },
  initialization: [
    "Load engagement context from Firestore",
    "Initialize standards/product/specs from Agent OS",
    "Set up isolated workspace",
  ],
  cleanup: [
    "Upload artifacts to Firestore",
    "Update engagement status",
    "Terminate container",
  ],
};
```

### Layer 2: PRODUCT (Your Business Logic)
**File:** `product/` folder in Orchestrator Service

```typescript
// product/plugs-definition.ts
export interface PlugDefinition {
  // Example: "Build me a REST API with authentication"
  id: string; // DEPLOY-PLG-timestamp-checksum
  title: string;
  description: string;
  requiredServices: Service[]; // Cloud Run, Firestore, etc.
  estimatedCost: number; // In $ or tokens
  complexity: "simple" | "moderate" | "complex";
}

// product/bamaram-lifecycle.ts
export const BAMARAM_LIFECYCLE = {
  B: { step: 0, name: "Brief", substeps: 1, description: "User uploads RFP" },
  A: { step: 1, name: "Analyze", substeps: 3, description: "ACHEEVY extracts requirements" },
  M: { step: 2, name: "Model", substeps: 2, description: "Architecture proposed" },
  A2: { step: 3, name: "Approve", substeps: 1, description: "User reviews and accepts" },
  R: { step: 4, name: "Refine", substeps: 5, description: "Build with iterations" },
  A3: { step: 5, name: "Apply", substeps: 1, description: "Final QA and sign-off" },
  M2: { step: 6, name: "Manage", substeps: 3, description: "Handoff and docs" },
};

// product/engagement-modes.ts
export enum EngagementMode {
  GUIDE_ME = "GUIDE_ME", // Consultative, 2-8 hours human time
  MANAGE_IT = "MANAGE_IT", // Autonomous, 4-48 hours
}

export const ENGAGEMENT_CONTEXT = {
  GUIDE_ME: {
    userRole: "Approver",
    assistantBehavior: "Ask clarifying questions, propose options",
    decisionFrequency: "Every 2-3 messages",
  },
  MANAGE_IT: {
    userRole: "Reviewer",
    assistantBehavior: "Execute autonomously, report progress",
    decisionFrequency: "At key milestones",
  },
};
```

### Layer 3: SPECS (Tactical Implementation)
**File:** `specs/` folder in Sandbox Container

```typescript
// specs/foster-phase-spec.ts
/**
 * Foster Phase (Discover, Clarify, Design)
 * Duration: 0-2 hours
 * Executor: ACHEEVY (Gemini 2.0)
 */
export const FOSTER_PHASE = {
  inputs: ["RFP text", "User context", "Standards", "Product mission"],
  steps: {
    1: "Parse RFP for scope, timeline, constraints",
    2: "Ask clarifying questions (GUIDE_ME only)",
    3: "Generate initial architecture",
    4: "Estimate effort and cost",
  },
  outputs: {
    scopeSummary: "What we're building",
    assumptions: "What we're assuming",
    deliverables: "What you'll receive",
    timeline: "Rough timeline",
    acceptanceCriteria: "How we measure success",
  },
};

// specs/develop-phase-spec.ts
/**
 * Develop Phase (Build)
 * Duration: 0-30 hours
 * Executor: Cloud Run Sandbox (spawns sub-containers per service)
 */
export const DEVELOP_PHASE = {
  inputs: ["Specification", "Architecture", "Standards"],
  pattern: "Modular service generation",
  execution: [
    "For each microservice in the architecture:",
    "  - Create Dockerfile",
    "  - Generate source code",
    "  - Create tests",
    "  - Build container image",
    "  - Push to Artifact Registry",
  ],
  outputs: ["Multiple Cloud Run services", "Docker images", "IaC (Terraform)"],
};

// specs/hone-phase-spec.ts
/**
 * Hone Phase (Test, Optimize, Deploy)
 * Duration: 0-20 hours
 * Executor: Cloud Run Sandbox (runs in parallel with Develop)
 */
export const HONE_PHASE = {
  inputs: ["Built services", "Tests", "Docs"],
  pattern: "Parallel testing and deployment",
  execution: [
    "As services are built, test them immediately",
    "Run security scans (ClamAV, Semgrep)",
    "Deploy to staging environment",
    "Run e2e tests",
    "Deploy to production",
  ],
  outputs: ["Live services", "Test reports", "Documentation"],
};
```

---

## Part 3: Builder Methods Wiring (Design OS → Build OS)

### Design OS: Guide Me Mode

**Purpose:** Capture requirements and create context layers

```typescript
// services/orchestrator/src/handlers/guide-me.ts

export async function guideMeEngagement(
  rfpText: string,
  engagementId: string,
  tenantId: string
) {
  /**
   * STEP 1: Load Agent OS Context
   * This is the STANDARDS + PRODUCT + SPECS for this engagement
   */
  const standardsContext = loadStandards();
  const productContext = loadProductContext(engagementId);
  const specsContext = loadSpecsForMode("GUIDE_ME");

  /**
   * STEP 2: Initialize Firestore Collections for Persistent Context
   */
  await firestore
    .collection("engagements")
    .doc(engagementId)
    .set({
      tenantId,
      mode: "GUIDE_ME",
      status: "DISCOVERING",
      standardsVersion: standardsContext.version,
      productVersion: productContext.version,
      createdAt: now,
    });

  /**
   * STEP 3: Dispatch to ACHEEVY (Gemini) with Full Context
   * ACHEEVY now has institutional memory via Agent OS
   */
  const proposal = await acheevy.analyzeRFP(rfpText, {
    context: {
      standards: standardsContext,
      product: productContext,
      specs: specsContext,
    },
    mode: "GUIDE_ME",
    requestApproval: true,
  });

  /**
   * STEP 4: Store Proposal in Firestore (Persistent)
   */
  await firestore
    .collection("engagements")
    .doc(engagementId)
    .collection("proposals")
    .add({
      scopeSummary: proposal.scope,
      assumptions: proposal.assumptions,
      timeline: proposal.timeline,
      estimatedCost: proposal.cost,
      createdAt: now,
      status: "PENDING_APPROVAL",
    });

  /**
   * STEP 5: Return to Frontend (Real-time via Firestore listener)
   */
  return {
    engagementId,
    proposal,
    nextStep: "USER_APPROVAL",
  };
}

/**
 * Chat Loop for Guide Me
 * Happens in the Frontend via Firestore real-time listeners
 * No polling, no direct container communication
 */
export async function guideMeChat(
  engagementId: string,
  message: string
) {
  // Store message in Firestore
  await firestore
    .collection("engagements")
    .doc(engagementId)
    .collection("messages")
    .add({
      role: "user",
      content: message,
      timestamp: now,
    });

  // Dispatch to ACHEEVY with full engagement context
  const achievyResponse = await acheevy.respond(message, {
    engagementId,
    // ACHEEVY loads all context from Firestore + Agent OS standards
    context: await loadEngagementContext(engagementId),
  });

  // Store response
  await firestore
    .collection("engagements")
    .doc(engagementId)
    .collection("messages")
    .add({
      role: "assistant",
      content: achievyResponse.message,
      timestamp: now,
    });

  return achievyResponse;
}
```

### Build OS: Manage It Mode

**Purpose:** Execute autonomous build with modular, isolated containers

```typescript
// services/sandbox-runtime/src/orchestrator.ts
/**
 * Cloud Run Job that executes per engagement
 * Spawned by the main orchestrator after user accepts proposal
 */

import { FOSTER_PHASE, DEVELOP_PHASE, HONE_PHASE } from "../specs";

export class SandboxOrchestrator {
  constructor(
    private engagementId: string,
    private tenantId: string,
    private mode: "GUIDE_ME" | "MANAGE_IT"
  ) {}

  /**
   * PHASE 1: Foster (Understand)
   * Input: Specification from Guide Me
   * Output: Architecture + Detailed Plan
   */
  async foster() {
    const specification = await this.loadFromFirestore(
      `engagements/${this.engagementId}/specification`
    );

    const architecture = await this.generateArchitecture(specification);
    const plan = await this.createDetailedPlan(architecture);

    // Save to Firestore
    await this.saveToFirestore(
      `engagements/${this.engagementId}/architecture`,
      architecture
    );
    await this.saveToFirestore(
      `engagements/${this.engagementId}/plan`,
      plan
    );

    // Update status
    await this.updateStatus("FOSTER_COMPLETE");
  }

  /**
   * PHASE 2: Develop (Build)
   * For each service in the architecture:
   *   - Generate code
   *   - Create Dockerfile
   *   - Build image
   *   - Push to registry
   *
   * This is the KEY: Spawn sub-containers for EACH service
   */
  async develop() {
    const architecture = await this.loadFromFirestore(
      `engagements/${this.engagementId}/architecture`
    );

    const services = architecture.services; // [API, Frontend, DB, etc.]

    // FOR EACH SERVICE: Create isolated build environment
    for (const service of services) {
      const subContainerId = await this.spawnBuildContainer(service);

      // The sub-container:
      // 1. Loads context from Firestore (engagement, standards, specs)
      // 2. Generates code based on standards
      // 3. Builds Docker image
      // 4. Runs tests
      // 5. Pushes to Artifact Registry
      // 6. Reports back to parent container via Firestore
      // 7. Terminates itself

      await this.monitorSubContainer(subContainerId, service);
    }

    await this.updateStatus("DEVELOP_COMPLETE");
  }

  /**
   * PHASE 3: Hone (Test & Deploy)
   * Parallel to Develop: As services complete, test and deploy them
   */
  async hone() {
    const artifacts = await this.loadFromFirestore(
      `engagements/${this.engagementId}/artifacts`
    );

    for (const artifact of artifacts) {
      // Test
      await this.runTests(artifact);

      // Deploy
      await this.deploy(artifact);

      // Verify
      await this.verify(artifact);
    }

    // Final: Create receipt with KMS signature
    const receipt = await this.createReceipt();

    await this.updateStatus("COMPLETE");
    return receipt;
  }

  /**
   * Key Principle: Orchestration via Firestore
   * NOT direct container-to-container communication
   *
   * Parent → Firestore ← Sub-container
   * Parent → Firestore ← Frontend
   */
  private async spawnBuildContainer(service: Service) {
    // Cloud Run Job API
    const jobName = `build-${this.engagementId}-${service.name}`;

    const response = await cloudRun.jobs.run({
      name: jobName,
      overrides: {
        taskCount: 1,
        timeout: "3600s",
        containerOverrides: [
          {
            env: [
              { name: "ENGAGEMENT_ID", value: this.engagementId },
              { name: "SERVICE_NAME", value: service.name },
              { name: "TENANT_ID", value: this.tenantId },
              { name: "PHASE", value: "DEVELOP" },
            ],
          },
        ],
      },
    });

    return response.name;
  }

  /**
   * Instead of waiting for container response,
   * parent monitors via Firestore listener
   */
  private async monitorSubContainer(jobId: string, service: Service) {
    return new Promise((resolve) => {
      const unsubscribe = firestore
        .collection("engagements")
        .doc(this.engagementId)
        .collection("services")
        .doc(service.name)
        .onSnapshot((snapshot) => {
          const data = snapshot.data();

          if (data?.status === "COMPLETE") {
            unsubscribe();
            resolve(data);
          }

          if (data?.status === "ERROR") {
            unsubscribe();
            throw new Error(data.error);
          }
        });
    });
  }
}
```

---

## Part 4: Modular, Lightweight Architecture

### Service Decomposition

**NO** one monolithic orchestrator doing everything

**YES** lightweight router + modular handlers

```typescript
// services/orchestrator/src/index.ts
/**
 * Router: Lightweight entry point
 * Routing logic based on engagement mode and current step
 */

import express from "express";
import { guideMeHandler } from "./handlers/guide-me";
import { manageItHandler } from "./handlers/manage-it";
import { messageHandler } from "./handlers/messages";

const app = express();

/**
 * KEY ROUTE: Create Engagement
 * Decision point: Guide Me or Manage It?
 */
app.post("/api/engagements", async (req, res) => {
  const { mode, rfpText } = req.body;

  if (mode === "GUIDE_ME") {
    // Route to Guide Me handler (ACHEEVY, no containers yet)
    return guideMeHandler(rfpText, req.user.uid);
  }

  if (mode === "MANAGE_IT") {
    // Accept proposal → Spawn sandbox
    return manageItHandler(rfpText, req.user.uid);
  }

  res.status(400).json({ error: "Invalid mode" });
});

/**
 * KEY ROUTE: Chat Message
 * Either:
 * a) Guide Me: Calls ACHEEVY directly (no container)
 * b) Manage It: Relays to sandbox via Firestore
 */
app.post("/api/engagements/:id/messages", async (req, res) => {
  const engagement = await firestore
    .collection("engagements")
    .doc(req.params.id)
    .get();

  if (engagement.data().mode === "GUIDE_ME") {
    return messageHandler.guideMe(req.params.id, req.body.message);
  }

  if (engagement.data().mode === "MANAGE_IT") {
    // Sandbox reads from Firestore, no need to reply to router
    return messageHandler.manageIt(req.params.id, req.body.message);
  }
});

/**
 * KEY ROUTE: Accept Proposal
 * Trigger: Spawn Cloud Run Job for sandbox
 */
app.post("/api/engagements/:id/accept", async (req, res) => {
  const jobName = `sandbox-${req.params.id}`;

  const job = await cloudRun.jobs.run({
    name: jobName,
    // See SandboxOrchestrator above - this runs FDH phases
  });

  // Return immediately - don't wait for job
  res.json({ jobId: job.name, status: "spawned" });

  // Frontend polls Firestore for status updates
});

app.listen(3001, () => console.log("Router listening on 3001"));
```

### Service Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│                                                               │
│  Landing → Create Engagement → Chat → Accept → Status Page  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
           ┌─────────────────────────────┐
           │   Orchestrator (Port 3001)  │ ← LIGHTWEIGHT ROUTER
           │   POST /api/engagements     │
           │   POST /api/messages        │
           │   POST /api/accept          │
           └──────────────┬──────────────┘
                         │
         ┌───────────────┼───────────────┐
         ↓               ↓               ↓
    GUIDE_ME        MANAGE_IT       FIRESTORE
    ACHEEVY         Cloud Run Job   (Persistent)
    (Direct)        (Container)
    
    ┌────────────────────────────────┐
    │   Cloud Run Job: sandbox-xyz    │
    │                                 │
    │  Phase 1: Foster               │
    │    ├─ Load context from FS     │
    │    └─ Generate architecture    │
    │                                 │
    │  Phase 2: Develop              │
    │    ├─ For each service:        │
    │    │  ├─ Generate code         │
    │    │  ├─ Build image           │
    │    │  └─ Push to registry      │
    │    └─ Report to Firestore      │
    │                                 │
    │  Phase 3: Hone                 │
    │    ├─ Test services            │
    │    ├─ Deploy to production     │
    │    └─ Create receipt           │
    │                                 │
    │  ↓ Firestore Updates            │
    │  engagement.status → COMPLETE   │
    │  engagement.receipt → [signed]  │
    └────────────────────────────────┘
```

---

## Part 5: Firestore as the Integration Hub

### Collections Structure
```
project/
├─ engagements/{id}/
│  ├─ metadata (mode, status, timeline)
│  ├─ standards/ (Copy of standards for this engagement)
│  ├─ product/ (Copy of product context)
│  ├─ specification/ (Generated during Foster)
│  ├─ architecture/ (Generated during Foster)
│  ├─ plan/ (Detailed build plan)
│  ├─ messages/ (Chat history, can be queried)
│  ├─ services/ (Each sub-service build status)
│  │  ├─ backend/
│  │  │  ├─ status: "BUILDING" → "BUILT" → "TESTED" → "DEPLOYED"
│  │  │  ├─ dockerfile: (Generated code)
│  │  │  ├─ sourceCode: (Generated code)
│  │  │  └─ artifacts: { imageUri: "...", ...}
│  │  └─ frontend/
│  │     └─ ...
│  ├─ artifacts/ (Final deliverables)
│  └─ receipt/ (KMS-signed completion proof)
```

### Real-Time Listeners in Frontend
```typescript
// apps/web/hooks/useEngagement.ts

export function useEngagement(engagementId: string) {
  const [engagement, setEngagement] = useState(null);

  useEffect(() => {
    // Listen to engagement metadata
    const unsubscribe = firestore
      .collection("engagements")
      .doc(engagementId)
      .onSnapshot((snapshot) => {
        setEngagement(snapshot.data());
      });

    return unsubscribe;
  }, [engagementId]);

  return engagement;
}

// apps/web/app/status/[id]/page.tsx
export default function StatusPage({ params }: { params: { id: string } }) {
  const engagement = useEngagement(params.id);

  if (!engagement) return <Loading />;

  return (
    <div>
      <h1>{engagement.title}</h1>

      {/* Timeline showing all phases */}
      <Timeline steps={BAMARAM_LIFECYCLE} current={engagement.currentStep} />

      {/* Service status cards - updated in real-time */}
      {engagement.services?.map((service) => (
        <ServiceCard
          key={service.name}
          status={service.status}
          progress={service.progress}
        />
      ))}

      {/* If complete, show receipt */}
      {engagement.status === "COMPLETE" && (
        <Receipt data={engagement.receipt} />
      )}
    </div>
  );
}
```

---

## Part 6: Implementation Checklist

### Phase A: Architecture Alignment (Today - 4 hours)
- [ ] Create `standards/`, `product/`, `specs/` folders in orchestrator
- [ ] Move existing BAMARAM/engagement logic into these folders
- [ ] Update orchestrator router to dispatch based on mode (Guide Me vs Manage It)
- [ ] Verify Firestore schema matches collections structure above

### Phase B: Guide Me Wiring (Tomorrow - 6 hours)
- [ ] Wire ACHEEVY to receive Agent OS context (standards + product + specs)
- [ ] Implement chat message handler for Guide Me
- [ ] Add Firestore listeners in frontend for real-time proposal updates
- [ ] Test: User submits RFP → ACHEEVY generates proposal → Status updates in real-time

### Phase C: Manage It Wiring (Day 3 - 8 hours)
- [ ] Create `services/sandbox-runtime/` service
- [ ] Implement SandboxOrchestrator class (FDH phases)
- [ ] Implement sub-container spawning for each service
- [ ] Implement Firestore-based progress reporting

### Phase D: End-to-End Test (Day 4 - 4 hours)
- [ ] Test full flow: RFP → Proposal → Accept → Build → Complete
- [ ] Verify real-time updates on status page
- [ ] Verify receipt generation and signing

---

## Part 7: Key Wiring Patterns for AI Agent

### Pattern 1: Load Agent OS Context
```typescript
// Whenever dispatching work, include full context
const context = {
  standards: loadStandards(),
  product: loadProductContext(engagementId),
  specs: loadSpecsForMode(mode),
};

// Pass to ACHEEVY or Container
acheevy.process(input, { context });
```

### Pattern 2: Persistent Context via Firestore
```typescript
// Store context in Firestore so containers can load it
await firestore
  .collection("engagements")
  .doc(engagementId)
  .update({
    standards: context.standards,
    product: context.product,
    specs: context.specs,
  });

// In container, load it back
const savedContext = await firestore
  .collection("engagements")
  .doc(engagementId)
  .get()
  .data();
```

### Pattern 3: No Direct Container Communication
```typescript
// WRONG: Router waiting for container response
const response = await containerRequest(jobId, input);

// RIGHT: Router stores in Firestore, container reads when ready
await firestore.collection("jobs").doc(jobId).set({ input });
// Container polls or listens via Firestore listener
```

### Pattern 4: Modular Phase Separation
```typescript
// WRONG: All FDH in one container
async function execute() {
  await foster();
  await develop();
  await hone();
}

// RIGHT: Each phase potentially spawns sub-containers
async function develop() {
  for (const service of architecture.services) {
    const jobId = await spawnContainer({ phase: "DEVELOP", service });
    // Monitor via Firestore
  }
}
```

---

## Part 8: The Instruction Set for Your AI Agent

When your AI agent (via Copilot/Claude) is building out the remaining wiring:

### Always Do
1. ✅ Check if logic belongs in standards/product/specs layers
2. ✅ Store context in Firestore, not in-memory
3. ✅ Use Firestore listeners, not polling
4. ✅ Spawn containers for isolated work, not add to orchestrator
5. ✅ Load Agent OS context before any decision
6. ✅ Report status back via Firestore collection updates
7. ✅ Separate Guide Me (ACHEEVY direct) from Manage It (sandbox containers)

### Never Do
1. ❌ Add more logic to the orchestrator router
2. ❌ Store context in environment variables only
3. ❌ Poll Firestore on intervals
4. ❌ Have router wait for container responses
5. ❌ Mix Guide Me and Manage It logic in same function
6. ❌ Have direct HTTP calls between containers
7. ❌ Assume container will reply to router immediately

### When Stuck
- Check: "What layer does this belong in? Standards? Product? Specs?"
- Check: "Is this engagement-specific context? Store in Firestore."
- Check: "Does this need isolation? Spawn a container."
- Check: "Does this need immediate response? Use ACHEEVY (Guide Me). Need autonomous work? Use sandbox (Manage It)."

---

## Conclusion

You now have the roadmap to:
1. **Fix the engagement wiring** using proper separation of concerns (Standards/Product/Specs)
2. **Eliminate monolithic orchestrator** by routing based on mode (Guide Me direct, Manage It sandbox)
3. **Keep it lightweight** with thin router + Firestore as the coordination hub
4. **Enable modular execution** where each service build is isolated in its own container
5. **Maintain security** with proper context isolation via tenantId and Firestore security rules
6. **Scale easily** by spawning containers on-demand, not spinning up massive infrastructure

The DEPLOY platform is now architected to support Plugs delivery as intended: modular, ephemeral, isolated, and secure.

---

**Document Version:** 2.0  
**Last Updated:** January 3, 2026  
**Status:** Ready for Implementation  
**Next Step:** Have your AI agent (Copilot) use this as context for all wiring decisions
