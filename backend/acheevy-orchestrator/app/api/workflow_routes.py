"""
Workflow API Routes
Exposes PathRouter and CircuitBox functionality via REST endpoints
PRD Section 5: APIs / Contracts
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime

# Import workflow orchestration services
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.path_router import PathRouter, EngagementPath, WorkflowNode
from services.execution_service import CircuitBox, ToolWarehouse, ToolCategory

router = APIRouter(prefix="/api/workflows", tags=["Workflow Orchestration"])

# Initialize services
warehouse = ToolWarehouse()
circuit_box = CircuitBox(warehouse)
path_router = PathRouter()


# ========================================
# REQUEST/RESPONSE MODELS
# ========================================

class EngagementIntakeRequest(BaseModel):
    """POST /engagements - Intake model"""
    channel: str  # "voice", "chat", "api"
    user_id: str
    user_profile: Dict[str, Any]
    intent: Dict[str, Any]  # Must include "prompt", optionally "mode"


class EngagementResponse(BaseModel):
    """Engagement creation response"""
    session_id: str
    path: str
    current_node: str
    status: str
    message: str


class DecisionCommitRequest(BaseModel):
    """POST /engagements/{id}/decisions - Decision recording"""
    node: str  # WorkflowNode enum value
    outcome: str
    data: Dict[str, Any]


class ToolExecutionRequest(BaseModel):
    """POST /tools/execute - Tool invocation"""
    session_id: str
    ang_role: str
    tool_id: str
    payload: Dict[str, Any]


class ToolExecutionResponse(BaseModel):
    """Tool execution result"""
    execution_id: str
    status: str
    duration_ms: Optional[int]
    result: Optional[Dict[str, Any]]
    error: Optional[str]


class WorkflowStatusResponse(BaseModel):
    """GET /workflows/{id}/status"""
    session_id: str
    path: str
    current_node: str
    decision_history: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    created_at: str
    updated_at: str


class PickerAnalysisRequest(BaseModel):
    """POST /tools/picker/analyze - Picker_Ang tool selection"""
    complexity: str  # "template", "simple", "standard", "complex", "enterprise"
    domain: str  # "research", "development", "design", etc.
    requirements: Dict[str, Any]


# ========================================
# ENGAGEMENT ORCHESTRATION ROUTES
# ========================================

@router.post("/engagements", response_model=EngagementResponse)
async def create_engagement(request: EngagementIntakeRequest):
    """
    Entry point: engagement.intake
    PRD Section 3.1: Routes user to appropriate path
    
    Returns session_id and assigned path (Guide Me, Manage It, Prompt It)
    """
    try:
        state = await path_router.route_engagement(
            channel=request.channel,
            user_profile=request.user_profile,
            intent_payload=request.intent
        )
        
        return EngagementResponse(
            session_id=state.session_id,
            path=state.path.value,
            current_node=state.current_node.value,
            status="routed",
            message=f"Engagement routed to {state.path.value} path"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Routing failed: {str(e)}")


@router.get("/engagements/{session_id}/status", response_model=WorkflowStatusResponse)
async def get_engagement_status(session_id: str):
    """
    Get current workflow state
    PRD Section 5: GET /workflows/{id}/status
    """
    status = await path_router.get_workflow_status(session_id)
    
    if not status:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return WorkflowStatusResponse(**status)


@router.post("/engagements/{session_id}/decisions")
async def commit_decision(session_id: str, request: DecisionCommitRequest):
    """
    Record user decision at workflow branch
    PRD Section 5: POST /engagements/{id}/decisions
    """
    try:
        node = WorkflowNode(request.node)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid node: {request.node}")
    
    success = await path_router.commit_decision(
        session_id=session_id,
        node=node,
        outcome=request.outcome,
        data=request.data
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"status": "committed", "session_id": session_id}


@router.post("/engagements/{session_id}/execute")
async def execute_workflow_path(session_id: str):
    """
    Execute assigned workflow path
    PRD Sections 3.2-3.4: Path execution
    
    Delegates to:
    - execute_guide_me() for Path A
    - execute_manage_it() for Path B
    - execute_prompt_it() for Path C
    """
    state_dict = await path_router.get_workflow_status(session_id)
    
    if not state_dict:
        raise HTTPException(status_code=404, detail="Session not found")
    
    state = path_router.active_sessions.get(session_id)
    
    if not state:
        raise HTTPException(status_code=404, detail="Session not in active state")
    
    # Execute appropriate path
    if state.path == EngagementPath.GUIDE_ME:
        result = await path_router.execute_guide_me(state)
    elif state.path == EngagementPath.MANAGE_IT:
        result = await path_router.execute_manage_it(state)
    elif state.path == EngagementPath.PROMPT_IT:
        result = await path_router.execute_prompt_it(state)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown path: {state.path}")
    
    return result


# ========================================
# TOOL WAREHOUSE & CIRCUIT ROUTES
# ========================================

@router.post("/tools/execute", response_model=ToolExecutionResponse)
async def execute_tool(request: ToolExecutionRequest):
    """
    Execute tool invocation through circuit pattern
    PRD Section 7: POST /tools/execute
    
    ACHEEVY → Picker_Ang → CircuitBox → Boomer_Ang → Tool
    """
    try:
        circuit = await circuit_box.execute_circuit(
            session_id=request.session_id,
            ang_role=request.ang_role,
            tool_id=request.tool_id,
            payload=request.payload
        )
        
        return ToolExecutionResponse(
            execution_id=circuit.execution_id,
            status=circuit.status,
            duration_ms=circuit.duration_ms(),
            result=circuit.result,
            error=circuit.error
        )
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")


@router.get("/tools/executions/{execution_id}")
async def get_execution_status(execution_id: str):
    """
    Check circuit execution status
    PRD Section 5: Tool execution monitoring
    """
    status = circuit_box.get_execution_status(execution_id)
    
    if not status:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    return status


@router.get("/tools/catalog")
async def get_tool_catalog(
    category: Optional[str] = None,
    ang_role: Optional[str] = None
):
    """
    Browse 318-Tool Warehouse
    PRD Section 8: Tool Warehouse organization
    
    Filters:
    - category: Filter by shelf (orchestration_ai, research, etc.)
    - ang_role: Filter by Boomer_Ang affinity
    """
    if category:
        try:
            cat_enum = ToolCategory(category)
            tools = warehouse.find_tools_by_category(cat_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    elif ang_role:
        tools = warehouse.find_tools_for_ang(ang_role)
    else:
        tools = list(warehouse.catalog.values())
    
    return {
        "total": len(tools),
        "tools": [
            {
                "tool_id": t.tool_id,
                "name": t.name,
                "category": t.category.value,
                "version": t.version,
                "description": t.description,
                "ang_affinity": t.ang_affinity
            }
            for t in tools
        ]
    }


@router.post("/tools/picker/analyze")
async def picker_ang_analyze(request: PickerAnalysisRequest):
    """
    Picker_Ang tool selection analysis
    PRD Section 8: Intelligent Tool Selection
    
    Analyzes requirements and recommends optimal tools from warehouse
    """
    selected_tools = await circuit_box.picker_ang_select_tools(
        complexity=request.complexity,
        domain=request.domain,
        requirements=request.requirements
    )
    
    return {
        "complexity": request.complexity,
        "domain": request.domain,
        "selected_tools": [
            {
                "tool_id": t.tool_id,
                "name": t.name,
                "category": t.category.value,
                "rationale": f"Selected for {request.complexity} {request.domain} tasks"
            }
            for t in selected_tools
        ],
        "total_selected": len(selected_tools)
    }


# ========================================
# AUDIT & CHRONICLE ROUTES
# ========================================

@router.post("/audit/chronicle")
async def append_chronicle_entry(request: Dict[str, Any]):
    """
    Append to Chronicle dual-write system
    PRD Section 4: Audit layer
    
    Accepts:
    - charter_entry: Customer-safe audit data
    - ledger_entry: Internal audit data (costs, providers, margins)
    """
    # Placeholder - will integrate with Chronicle database
    # PRD Section 4: Charter & Ledger writers
    
    return {
        "status": "appended",
        "correlation_id": f"chronicle_{datetime.utcnow().timestamp()}",
        "charter_hash": "sha256_placeholder",
        "ledger_preserved": True
    }


@router.get("/health")
async def workflow_health():
    """Health check for workflow orchestration services"""
    return {
        "status": "operational",
        "services": {
            "path_router": "ready",
            "circuit_box": "ready",
            "tool_warehouse": "ready",
            "tools_available": len(warehouse.catalog)
        },
        "active_sessions": len(path_router.active_sessions),
        "active_circuits": len(circuit_box.active_circuits),
        "timestamp": datetime.utcnow().isoformat()
    }
