"""
Path Router Service
Orchestrates user engagement flows through decision trees
Integrates ii-agent framework, ii-commons, and 318-Tool Warehouse

ACHEEVY + Picker_Ang Circuit Pattern Implementation
"""

from typing import Dict, Optional, List, Any
from enum import Enum
from dataclasses import dataclass
from datetime import datetime
import structlog

logger = structlog.get_logger()


class EngagementPath(Enum):
    """Primary engagement paths (PRD Section 3.2-3.4)"""
    GUIDE_ME = "guide_me"  # Consultative with 4-Question Lens
    MANAGE_IT = "manage_it"  # Hands-off automation
    PROMPT_IT = "prompt_it"  # Real-time execution


class WorkflowNode(Enum):
    """Decision graph nodes (PRD Section 4)"""
    # Entry
    INTAKE = "engagement.intake"
    PATH_SELECTOR = "path.selector"
    
    # Path A: Guide Me
    DISCOVERY_ORCHESTRATOR = "discovery.orchestrator"
    CLARIFY_LOOP = "clarify.loop"
    ADVISORY_PLAN_GENERATE = "advisory.plan.generate"
    EXECUTION_QUEUE = "execution.queue"
    
    # Path B: Manage It
    AUTONOMY_VALIDATOR = "autonomy.validator"
    BUILDSMITH_SCHEDULER = "buildsmith.scheduler"
    CRUCIBLES_FOSTER = "crucibles.foster"
    CRUCIBLES_DEVELOP = "crucibles.develop"
    CRUCIBLES_HONE = "crucibles.hone"
    
    # Path C: Prompt It
    REALTIME_COMMANDER = "realtime.commander"
    INSTANT_DEPLOY = "instant.deploy"
    INLINE_TOOL_CALLS = "inline.tool_calls"
    
    # Shared
    FDH_PIPELINE = "fdh.pipeline"
    PLUG_REGISTRY_RECORD = "plug_registry.record"
    CHARTER_DELIVERY = "charter.delivery"
    NTNTN_ESCALATION = "ntntn.escalation"


@dataclass
class WorkflowState:
    """Tracks current position in decision graph"""
    session_id: str
    user_id: str
    path: EngagementPath
    current_node: WorkflowNode
    decision_history: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    def record_decision(self, node: WorkflowNode, outcome: str, data: Dict[str, Any]):
        """Append decision to audit trail"""
        self.decision_history.append({
            "node": node.value,
            "outcome": outcome,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        })
        self.updated_at = datetime.utcnow()


@dataclass
class ToolInvocation:
    """Circuit pattern for Boomer_Ang tool execution (PRD Section 7)"""
    session_id: str
    ang_role: str  # e.g., "Code_Ang", "Scout_Ang", "Guard_Ang"
    tool_ref: str  # From 318-Tool Warehouse
    payload: Dict[str, Any]
    status: str = "pending"
    result: Optional[Dict[str, Any]] = None
    invoked_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class PathRouter:
    """
    Central orchestrator for Deploy Platform workflows
    Implements PRD Section 4: Workflow Orchestration Engine
    
    Integration points:
    - ii-agent: Primary agent framework (replaces CrewAI per .github instructions)
    - ii-commons: Shared utilities (upgrade to v3)
    - ii-researcher: Scout_Ang intelligence gathering
    - CrewAI: Multi-agent coordination (enabled but not primary)
    - Deerflow: Advanced agent workflows
    """
    
    def __init__(self):
        self.active_sessions: Dict[str, WorkflowState] = {}
        self.vibe_threshold = 0.993  # Mission-Critical tier (99.3%)
        
    async def route_engagement(
        self,
        channel: str,  # "voice", "chat", "api"
        user_profile: Dict[str, Any],
        intent_payload: Dict[str, Any]
    ) -> WorkflowState:
        """
        Entry node: engagement.intake
        PRD Section 3.1
        
        Returns initialized WorkflowState with assigned path
        """
        session_id = f"session_{datetime.utcnow().timestamp()}"
        
        logger.info("[PathRouter] Engagement intake",
                   session_id=session_id,
                   channel=channel,
                   user_id=user_profile.get("user_id"))
        
        # Path selection logic
        path = await self._select_path(intent_payload, user_profile)
        
        # Initialize workflow state
        state = WorkflowState(
            session_id=session_id,
            user_id=user_profile.get("user_id"),
            path=path,
            current_node=WorkflowNode.PATH_SELECTOR,
            decision_history=[],
            metadata={
                "channel": channel,
                "intent": intent_payload,
                "user_profile": user_profile
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Record initial decision
        state.record_decision(
            WorkflowNode.PATH_SELECTOR,
            f"assigned_{path.value}",
            {"confidence": 0.95}
        )
        
        self.active_sessions[session_id] = state
        
        logger.info("[Charter] Engagement routed",
                   session_id=session_id,
                   path=path.value)
        
        return state
    
    async def _select_path(
        self,
        intent: Dict[str, Any],
        profile: Dict[str, Any]
    ) -> EngagementPath:
        """
        Decision logic for path assignment
        PRD Section 3.1: Entry Node routing
        
        If/Then rules:
        - Has explicit mode → use that
        - Template match + low complexity → Prompt It
        - Insufficient data + consultation needed → Guide Me
        - Clear requirements + high confidence → Manage It
        """
        explicit_mode = intent.get("mode")
        
        if explicit_mode == "guide_me":
            return EngagementPath.GUIDE_ME
        elif explicit_mode == "manage_it":
            return EngagementPath.MANAGE_IT
        elif explicit_mode == "prompt_it":
            return EngagementPath.PROMPT_IT
        
        # Analyze complexity
        complexity = await self._analyze_complexity(intent)
        
        if complexity == "template":
            return EngagementPath.PROMPT_IT
        elif complexity in ["simple", "standard"]:
            has_sufficient_context = await self._validate_prerequisites(intent)
            return EngagementPath.MANAGE_IT if has_sufficient_context else EngagementPath.GUIDE_ME
        else:  # complex, enterprise
            return EngagementPath.GUIDE_ME
    
    async def _analyze_complexity(self, intent: Dict[str, Any]) -> str:
        """
        Complexity scoring for routing decisions
        Returns: "template", "simple", "standard", "complex", "enterprise"
        
        Integrated with Picker_Ang for tool warehouse assessment
        """
        prompt_length = len(intent.get("prompt", ""))
        
        # Template detection (INSTANT deploy candidates)
        template_keywords = ["contact form", "landing page", "dashboard", "CRUD"]
        if any(kw in intent.get("prompt", "").lower() for kw in template_keywords):
            return "template"
        
        # Simple (30-60 min builds)
        if prompt_length < 100:
            return "simple"
        
        # Standard (1-3 hour builds)
        if prompt_length < 500:
            return "standard"
        
        # Complex (3-6 hour builds)
        if prompt_length < 1000:
            return "complex"
        
        # Enterprise (6-8 hour max)
        return "enterprise"
    
    async def _validate_prerequisites(self, intent: Dict[str, Any]) -> bool:
        """
        Check if requirements are sufficient for Manage It path
        PRD Section 3.3: Path B prerequisite validation
        """
        required_fields = ["prompt", "mode"]
        return all(intent.get(field) for field in required_fields)
    
    async def execute_guide_me(self, state: WorkflowState) -> Dict[str, Any]:
        """
        Path A: Guide Me (Consultative)
        PRD Section 3.2
        
        Flow:
        1. discovery.orchestrator
        2. If requirements sufficient → advisory.plan.generate
        3. Else → clarify.loop (Voice_Ang, Scout_Ang)
        4. Approval check → execution.queue OR revise.intent
        """
        state.current_node = WorkflowNode.DISCOVERY_ORCHESTRATOR
        
        logger.info("[PathRouter] Executing Guide Me path",
                   session_id=state.session_id)
        
        # Tool invocations for discovery
        scout_task = ToolInvocation(
            session_id=state.session_id,
            ang_role="Scout_Ang",
            tool_ref="ii-researcher",  # Intelligent Internet integration
            payload={"query": state.metadata["intent"].get("prompt")}
        )
        
        plan_task = ToolInvocation(
            session_id=state.session_id,
            ang_role="Plan_Ang",
            tool_ref="gemini-cli-mcp-bridge",
            payload={"context": state.decision_history}
        )
        
        # Simulate discovery (will connect to actual Boomer_Ang services)
        requirements_sufficient = True  # Placeholder
        
        if requirements_sufficient:
            state.current_node = WorkflowNode.ADVISORY_PLAN_GENERATE
            state.record_decision(
                WorkflowNode.ADVISORY_PLAN_GENERATE,
                "plan_generated",
                {"boomer_angs": ["Plan_Ang", "Tech_Ang"]}
            )
        else:
            state.current_node = WorkflowNode.CLARIFY_LOOP
            state.record_decision(
                WorkflowNode.CLARIFY_LOOP,
                "clarification_needed",
                {"missing_fields": ["technical_requirements"]}
            )
        
        return {"status": "awaiting_approval", "state": state}
    
    async def execute_manage_it(self, state: WorkflowState) -> Dict[str, Any]:
        """
        Path B: Manage It (Hands-off automation)
        PRD Section 3.3
        
        Flow:
        1. autonomy.validator
        2. If prereqs missing → escalate to Guide Me
        3. If V.I.B.E. < 99.3% → NTNTN escalation
        4. Approved → buildsmith.scheduler
        5. Crucibles: Foster → Develop → Hone
        6. plug_registry.record + charter.delivery
        """
        state.current_node = WorkflowNode.AUTONOMY_VALIDATOR
        
        logger.info("[PathRouter] Executing Manage It path",
                   session_id=state.session_id)
        
        # Prerequisite validation
        prereqs_met = await self._validate_prerequisites(state.metadata["intent"])
        
        if not prereqs_met:
            logger.warning("[PathRouter] Prerequisites missing, escalating to Guide Me",
                          session_id=state.session_id)
            state.path = EngagementPath.GUIDE_ME
            return await self.execute_guide_me(state)
        
        # V.I.B.E. projection (NTNTN_Ang validation)
        vibe_score = 0.995  # Placeholder - actual calculation needed
        
        if vibe_score < self.vibe_threshold:
            state.current_node = WorkflowNode.NTNTN_ESCALATION
            state.record_decision(
                WorkflowNode.NTNTN_ESCALATION,
                "vibe_below_threshold",
                {"vibe_score": vibe_score, "threshold": self.vibe_threshold}
            )
            return {"status": "escalated_to_ntntn", "state": state}
        
        # Buildsmith scheduling
        state.current_node = WorkflowNode.BUILDSMITH_SCHEDULER
        
        # Tool warehouse circuit activation (Picker_Ang)
        picker_task = ToolInvocation(
            session_id=state.session_id,
            ang_role="Picker_Ang",
            tool_ref="circuit_analyzer",
            payload={
                "complexity": await self._analyze_complexity(state.metadata["intent"]),
                "domain": state.metadata["intent"].get("domain", "general")
            }
        )
        
        # FDH Pipeline execution
        fdh_result = await self._execute_fdh_pipeline(state)
        
        state.current_node = WorkflowNode.PLUG_REGISTRY_RECORD
        state.record_decision(
            WorkflowNode.PLUG_REGISTRY_RECORD,
            "plug_created",
            {"plug_id": fdh_result.get("plug_id")}
        )
        
        return {"status": "completed", "plug": fdh_result, "state": state}
    
    async def execute_prompt_it(self, state: WorkflowState) -> Dict[str, Any]:
        """
        Path C: Prompt It (Real-time execution)
        PRD Section 3.4
        
        Flow:
        1. realtime.commander
        2. If template match → instant.deploy (<10s)
        3. Else if complexity > threshold → escalate to Manage It
        4. Tool calls triggered inline
        5. Outputs streamed, audit events emitted
        """
        state.current_node = WorkflowNode.REALTIME_COMMANDER
        
        logger.info("[PathRouter] Executing Prompt It path",
                   session_id=state.session_id)
        
        complexity = await self._analyze_complexity(state.metadata["intent"])
        
        if complexity == "template":
            state.current_node = WorkflowNode.INSTANT_DEPLOY
            state.record_decision(
                WorkflowNode.INSTANT_DEPLOY,
                "template_deployed",
                {"deployment_time_ms": 8500}
            )
            return {"status": "instant_deployed", "state": state}
        
        if complexity in ["complex", "enterprise"]:
            logger.info("[PathRouter] Complexity exceeds Prompt It threshold, escalating",
                       session_id=state.session_id,
                       complexity=complexity)
            state.path = EngagementPath.MANAGE_IT
            return await self.execute_manage_it(state)
        
        # Inline tool execution
        state.current_node = WorkflowNode.INLINE_TOOL_CALLS
        
        # Circuit activation for real-time tools
        tool_tasks = [
            ToolInvocation(
                session_id=state.session_id,
                ang_role="Voice_Ang",
                tool_ref="vapi_js_sdk",
                payload={"stream": True}
            ),
            ToolInvocation(
                session_id=state.session_id,
                ang_role="Buildsmith_Ang",
                tool_ref="daytona_sandbox",
                payload={"quick_deploy": True}
            )
        ]
        
        state.record_decision(
            WorkflowNode.INLINE_TOOL_CALLS,
            "tools_executed",
            {"tool_count": len(tool_tasks)}
        )
        
        return {"status": "real_time_executed", "state": state}
    
    async def _execute_fdh_pipeline(self, state: WorkflowState) -> Dict[str, Any]:
        """
        Foster → Develop → Hone pipeline execution
        PRD Section 3.3: Crucibles orchestration
        
        Integrates:
        - ii-agent framework for agent coordination
        - ii-commons utilities (v3)
        - CrewAI for multi-agent tasks
        - Deerflow for advanced workflows
        """
        logger.info("[PathRouter] Starting FDH pipeline",
                   session_id=state.session_id)
        
        # Foster Phase (context ingestion)
        state.current_node = WorkflowNode.CRUCIBLES_FOSTER
        foster_tasks = [
            ToolInvocation(
                session_id=state.session_id,
                ang_role="Scout_Ang",
                tool_ref="ii-researcher",
                payload={"phase": "context_gathering"}
            ),
            ToolInvocation(
                session_id=state.session_id,
                ang_role="Plan_Ang",
                tool_ref="plandex_cli",
                payload={"phase": "task_decomposition"}
            )
        ]
        
        # Develop Phase (code generation)
        state.current_node = WorkflowNode.CRUCIBLES_DEVELOP
        develop_tasks = [
            ToolInvocation(
                session_id=state.session_id,
                ang_role="Code_Ang",
                tool_ref="claude_3.5_sonnet",
                payload={"phase": "implementation"}
            ),
            ToolInvocation(
                session_id=state.session_id,
                ang_role="Ops_Ang",
                tool_ref="docker_kubernetes",
                payload={"phase": "infrastructure"}
            )
        ]
        
        # Hone Phase (QA/security - parallel)
        state.current_node = WorkflowNode.CRUCIBLES_HONE
        hone_tasks = [
            ToolInvocation(
                session_id=state.session_id,
                ang_role="Test_Ang",
                tool_ref="pytest_playwright",
                payload={"phase": "quality_assurance"}
            ),
            ToolInvocation(
                session_id=state.session_id,
                ang_role="Guard_Ang",
                tool_ref="snyk_trivy_owasp",
                payload={"phase": "security_validation"}
            )
        ]
        
        # Placeholder result (actual execution will call Boomer_Ang services)
        plug_id = f"plug_{state.session_id}"
        
        logger.info("[Charter] FDH pipeline completed",
                   session_id=state.session_id,
                   plug_id=plug_id)
        
        logger.info("[Ledger] FDH execution details",
                   session_id=state.session_id,
                   foster_tasks=len(foster_tasks),
                   develop_tasks=len(develop_tasks),
                   hone_tasks=len(hone_tasks),
                   total_runtime_hours=6.5)
        
        return {
            "plug_id": plug_id,
            "fdh_runtime": {
                "foster": 0.5,
                "develop": 5.5,
                "hone": 1.0  # Parallel
            },
            "vibe_score": 0.996,
            "boomer_angs_used": [
                "Scout_Ang", "Plan_Ang", "Code_Ang", 
                "Ops_Ang", "Test_Ang", "Guard_Ang"
            ]
        }
    
    async def get_workflow_status(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve current workflow state
        PRD Section 5: APIs / Contracts
        """
        state = self.active_sessions.get(session_id)
        
        if not state:
            return None
        
        return {
            "session_id": state.session_id,
            "path": state.path.value,
            "current_node": state.current_node.value,
            "decision_history": state.decision_history,
            "metadata": state.metadata,
            "created_at": state.created_at.isoformat(),
            "updated_at": state.updated_at.isoformat()
        }
    
    async def commit_decision(
        self,
        session_id: str,
        node: WorkflowNode,
        outcome: str,
        data: Dict[str, Any]
    ) -> bool:
        """
        Record user decision at workflow branch point
        PRD Section 5: POST /engagements/{id}/decisions
        """
        state = self.active_sessions.get(session_id)
        
        if not state:
            logger.error("[PathRouter] Session not found",
                        session_id=session_id)
            return False
        
        state.record_decision(node, outcome, data)
        
        logger.info("[Charter] Decision committed",
                   session_id=session_id,
                   node=node.value,
                   outcome=outcome)
        
        return True
