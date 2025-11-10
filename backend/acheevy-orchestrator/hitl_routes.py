"""
HITL (Human-in-the-Loop) Approval Routes
ICAR Audit: Intent=approve/revise/reject, Context=plug_id, Action=dual_write, Result=correlation_id
Security Tier: Medium (business workflow with audit trail)
V.I.B.E. Target: ≥99.5% (Charter-Ledger separation enforced)
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, validator
from typing import Optional, Literal
from uuid import uuid4
from datetime import datetime, timezone
import re
import os
import asyncpg
import json
from logger_service import DualWriteLogger

router = APIRouter()


def get_dual_logger():
    """
    Get DualWriteLogger from main app's global instance.
    
    Note: This imports from main at runtime to avoid circular imports.
    The main app initializes dual_logger during startup.
    """
    from main import dual_logger
    if dual_logger is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Charter/Ledger system not initialized"
        )
    return dual_logger


class HitlApprovalRequest(BaseModel):
    """
    HITL approval request model
    ACE Generator: Effective strategy = validate tokenCost before database write
    
    Accepts test data from test_logger_service_error_paths.py:
    - plugId, modelId, revisionCount, tokenCost, plugName (optional)
    """
    plugId: int = Field(..., gt=0, description="Plug ID (positive integer)", alias="plugId")
    modelId: str = Field(..., description="Model identifier")
    revisionCount: int = Field(..., ge=0, description="Revision counter")
    tokenCost: str = Field(..., description="Format: '$0.45' or '1.5K tokens ($0.45)'")
    plugName: Optional[str] = Field(None, description="Plug name (optional)")
    commentary: Optional[str] = Field(None, description="User feedback")
    
    class Config:
        populate_by_name = True  # Allow both plugId and plug_id
    
    @validator('tokenCost')
    def validate_token_cost_format(cls, v):
        """
        ACE Reflector: Flexible validation approach
        Accepts two formats:
        1. Simple: "$X.XX" (e.g., "$0.45")
        2. Detailed: "X.X tokens ($X.XX)" (e.g., "1.5K tokens ($0.45)")
        """
        # Pattern 1: Simple format "$X.XX"
        simple_pattern = r'^\$\d+\.\d{2}$'
        # Pattern 2: Detailed format "X.X tokens ($X.XX)"
        detailed_pattern = r'^\d+(\.\d+)?[KM]?\s+tokens\s+\(\$\d+\.\d+\)$'
        
        if re.match(simple_pattern, v) or re.match(detailed_pattern, v):
            return v
        
        raise ValueError(
            f"Invalid tokenCost format. Expected: '$0.45' or '1.5K tokens ($0.45)', got: '{v}'"
        )
        return v


class HitlApprovalResponse(BaseModel):
    """
    HITL approval response matching test expectations
    Returns bamaram_signals ID + ISO 8601 timestamp
    """
    success: bool = Field(..., description="Operation success")
    bamamramId: int = Field(..., description="bamaram_signals primary key")
    timestamp: str = Field(..., description="ISO 8601 timestamp")


@router.post(
    "/hitl/approve",
    response_model=HitlApprovalResponse,
    status_code=status.HTTP_200_OK,  # Changed from 201 to match test expectations
    summary="HITL Approval Workflow",
    description="Human-in-the-Loop approval endpoint writing to bamaram_signals + audit log",
    tags=["HITL", "Workflow"]
)
async def approve_hitl(request: HitlApprovalRequest) -> HitlApprovalResponse:
    """
    ACHEEVY Engagement: Let ACHEEVY Manage It (rapid autonomous)
    DMAIC: Define=HITL decision, Measure=tokenCost, Analyze=validation, 
           Improve=bamaram_write, Control=audit_log
    
    Writes to:
    1. bamaram_signals - Approval completion record
    2. hitl_audit_log - Audit trail for compliance
    
    Security: Medium tier (business workflow, audit required)
    V.I.B.E.: 99.5% (idempotent bamaram_signals insert)
    """
    # ACHEEVY WNX Gating: Validate request before database operations
    try:
        # Get dual_logger instance for Charter/Ledger writes
        logger = get_dual_logger()
        
        # Parse token cost from "$X.XX" format to DECIMAL
        token_cost_str = request.tokenCost.replace("$", "").split()[0]
        token_cost_decimal = float(token_cost_str)
        
        # Create new database connection (avoids event loop conflicts with TestClient)
        # Uses same credentials as logger's pool
        db_url = os.getenv("DATABASE_URL", "postgresql://deploy_test:test_password_2025@localhost:5432/deploy_test")
        conn = await asyncpg.connect(db_url)
        
        try:
            # INSERT bamaram_signals with idempotency
            # Check if plug_id + model_id combination already exists
            existing_id = await conn.fetchval(
                "SELECT id FROM bamaram_signals WHERE plug_id = $1 AND model_id = $2",
                request.plugId, request.modelId
            )
            
            if existing_id:
                # Idempotent: Return existing BAMARAM ID
                bamaram_id = existing_id
            else:
                # Insert new bamaram_signals record
                bamaram_id = await conn.fetchval("""
                    INSERT INTO bamaram_signals (
                        plug_id, model_id, plug_name, final_revision_count,
                        total_token_cost, approved_by, metadata
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id
                """, 
                    request.plugId,
                    request.modelId,
                    request.plugName,
                    request.revisionCount,
                    token_cost_decimal,
                    "user@deploy.com",  # Hardcoded for Sprint 6B (user context in Sprint 9)
                    json.dumps({
                        "commentary": request.commentary,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                )
            
            # INSERT hitl_audit_log (always append, no idempotency)
            request_id = str(uuid4())
            await conn.execute("""
                INSERT INTO hitl_audit_log (plug_id, action, actor, details, request_id)
                VALUES ($1, $2, $3, $4, $5)
            """,
                request.plugId,
                "approve",
                "user@deploy.com",  # Hardcoded for Sprint 6B
                json.dumps({
                    "plugName": request.plugName,
                    "modelId": request.modelId,
                    "revisionCount": request.revisionCount,
                    "tokenCost": request.tokenCost
                }),
                request_id
            )
        finally:
            # Always close the connection
            await conn.close()
        
        # ALSO write to Charter/Ledger for audit trail (test_logger_service_error_paths.py expects this)
        correlation_id = await logger.log_dual_write(
            event_type="hitl.approval",
            user_id=None,  # System event, no user context
            plug_id=request.plugId,
            charter_message=f"HITL Approval: {request.plugName or 'Unnamed'} (Model: {request.modelId})",
            ledger_data={
                "plug_id": request.plugId,
                "model_id": request.modelId,
                "revision_count": request.revisionCount,
                "token_cost": request.tokenCost,  # LEDGER ONLY (Charter forbidden)
                "plug_name": request.plugName,
                "commentary": request.commentary,
                "bamaram_id": bamaram_id,
                "request_id": request_id
            }
        )
        
        # Return success response matching test expectations
        return HitlApprovalResponse(
            success=True,
            bamamramId=bamaram_id,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
    except Exception as e:
        # ACE Reflector: Error handling with structured logging
        import traceback
        import sys
        
        # Log the full traceback for debugging
        tb_str = ''.join(traceback.format_exception(type(e), e, e.__traceback__))
        print(f"[HITL ERROR] {type(e).__name__}: {str(e)}", file=sys.stderr)
        print(f"[HITL TRACEBACK]\n{tb_str}", file=sys.stderr)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database operation failed: {type(e).__name__}: {str(e)}"
        )
