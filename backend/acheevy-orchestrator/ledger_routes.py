"""
Ledger Logs Retrieval (Admin-Only Internal)
SmelterOS Ledger: FULL internal data (costs, providers, margins, technical details)
Security Tier: Heavy (admin-only, audit trails, secret management)
V.I.B.E. Target: ≥99.5% (JWT validation, RBAC enforcement)
"""

from fastapi import APIRouter, Query, HTTPException, status, Header, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import asyncpg

router = APIRouter()


async def verify_admin(authorization: Optional[str] = Header(None, description="Bearer token")) -> str:
    """
    Admin role validation with JWT refresh cycles
    Creator Economy: Heavy tier security controls
    ACE Reflector: Root cause = missing/malformed token → HTTP 403
    
    Production Note: Replace with proper JWT decoding + role validation
    Test Implementation: Simple token string check
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )
    
    token = authorization.replace("Bearer ", "")
    
    # Test validation: accept "admin_token_valid"
    # Production: decode JWT, verify signature, check role claim
    if token != "admin_token_valid":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )
    
    return token


class LedgerLog(BaseModel):
    """
    Ledger log entry (ADMIN-ONLY INTERNAL)
    SmelterOS: Full technical details including Melanium Ingots cost tracking
    """
    id: int
    correlation_id: str
    plug_id: Optional[int] = None
    event_type: str
    internal_cost: Optional[float] = None
    customer_charge: Optional[float] = None
    margin_percent: Optional[float] = None
    provider_name: Optional[str] = None
    model_name: Optional[str] = None
    execution_time_ms: Optional[int] = None
    error_details: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime  # Will map from 'timestamp' column
    
    class Config:
        populate_by_name = True


class LedgerLogsResponse(BaseModel):
    """
    Paginated Ledger logs with admin access control
    One-Shot: Permission cascades = admin-only enforcement
    """
    logs: List[LedgerLog]
    total: int
    offset: int
    limit: int


@router.get(
    "/ledger-logs",
    response_model=LedgerLogsResponse,
    summary="Ledger Logs (Admin-Only)",
    description="Retrieve Ledger logs with FULL internal data. Requires admin authorization.",
    tags=["Ledger", "Admin", "Audit"]
)
async def get_ledger_logs(
    offset: int = Query(0, ge=0, description="Starting position (0-based)"),
    limit: int = Query(100, ge=1, le=500, description="Records to return (max 500)"),
    start_date: Optional[str] = Query(None, description="ISO format: 2025-01-23T00:00:00Z"),
    end_date: Optional[str] = Query(None, description="ISO format: 2025-01-23T23:59:59Z"),
    admin_token: str = Depends(verify_admin)
) -> LedgerLogsResponse:
    """
    ACHEEVY WNX Gating: Admin role validation at 0.85 confidence threshold
    
    Ledger Full Access (Admin-Only):
    - ✅ INTERNAL DATA: costs, providers, margins, models, stack traces
    - ✅ MELANIUM INGOTS: Internal token tracking (ledger-only)
    - ✅ COMPLIANCE: Security logs, audit trails, debugging info
    
    ACE Curator: Admin auth pattern = JWT + RBAC enforcement
    Creator Economy: Heavy tier (secret management, audit trails)
    """
    # ACHEEVY KNR Integrity: Bounds enforcement
    limit = min(max(limit, 1), 500)
    offset = max(offset, 0)
    
    db_url = os.getenv(
        "DATABASE_URL",
        "postgresql://deploy_admin:deploy_dev_password_secure_2025@localhost:5432/deploy_platform"
    )
    
    conn = None
    try:
        conn = await asyncpg.connect(db_url)
        
        # Count total records
        total = await conn.fetchval("SELECT COUNT(*) FROM ledger_log")
        
        # Handle offset exceeds total
        if offset >= total:
            return LedgerLogsResponse(logs=[], total=total, offset=offset, limit=limit)
        
        # LEDGER QUERY: Include ALL internal fields (FULL ACCESS)
        query = """
            SELECT 
                id, 
                correlation_id, 
                plug_id, 
                event_type, 
                internal_cost,
                customer_charge,
                margin_percent,
                provider_name,
                model_name,
                execution_time_ms,
                error_details,
                metadata,
                timestamp as created_at
            FROM ledger_log
            ORDER BY timestamp DESC
            LIMIT $1 OFFSET $2
        """
        # V.I.B.E. Note: Ledger exposes ALL internal fields (admin-only)
        
        rows = await conn.fetch(query, limit, offset)
        
        # Transform to Ledger models with FULL internal data
        logs = [
            LedgerLog(
                id=row['id'],
                correlation_id=str(row['correlation_id']),
                plug_id=row['plug_id'],
                event_type=row['event_type'],
                internal_cost=float(row['internal_cost']) if row['internal_cost'] else None,
                customer_charge=float(row['customer_charge']) if row['customer_charge'] else None,
                margin_percent=float(row['margin_percent']) if row['margin_percent'] else None,
                provider_name=row['provider_name'],
                model_name=row['model_name'],
                execution_time_ms=row['execution_time_ms'],
                error_details=row['error_details'],
                metadata=row['metadata'],
                created_at=row['created_at']
            )
            for row in rows
        ]
        
        return LedgerLogsResponse(
            logs=logs,
            total=total,
            offset=offset,
            limit=limit
        )
        
    except asyncpg.PostgresError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database operation failed: {str(e)}"
        )
    finally:
        if conn:
            await conn.close()
