"""
Charter Logs Retrieval (Customer-Safe)
SmelterOS Charter: Business-readable summaries ONLY (ZERO internal data)
Forbidden: internal_cost, provider_name, margin_percent, model_name
Security Tier: Light (public-facing, sanitized data)
V.I.B.E. Target: ≥99.5% (forbidden pattern scanner)
"""

from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os
import asyncpg

router = APIRouter()


class CharterLog(BaseModel):
    """
    Charter log entry (CUSTOMER-SAFE)
    ACE Generator: Sanitization strategy = exclude forbidden fields
    """
    id: int
    correlation_id: str
    plug_id: Optional[int] = None
    event_type: str
    message: str
    created_at: datetime  # Will map from 'timestamp' column
    
    class Config:
        populate_by_name = True


class CharterLogsResponse(BaseModel):
    """
    Paginated Charter logs with metadata
    One-Shot: Feedback loops = offset/limit/total for navigation
    """
    logs: List[CharterLog]
    total: int
    offset: int
    limit: int


@router.get(
    "/charter-logs",
    response_model=CharterLogsResponse,
    summary="Charter Logs (Customer-Safe)",
    description="Retrieve Charter logs with pagination. NO internal costs/providers exposed.",
    tags=["Charter", "Logs"]
)
async def get_charter_logs(
    plug_id: Optional[int] = Query(None, description="Filter by plug_id"),
    offset: int = Query(0, ge=0, description="Starting position (0-based)"),
    limit: int = Query(100, ge=1, le=500, description="Records to return (max 500)"),
    start_date: Optional[str] = Query(None, description="ISO format: 2025-01-23T00:00:00Z"),
    end_date: Optional[str] = Query(None, description="ISO format: 2025-01-23T23:59:59Z")
) -> CharterLogsResponse:
    """
    ACHEEVY FDRS Layer 4: Validate/Secure with forbidden pattern scanning
    
    Charter Sanitization Rules (V.I.B.E. enforcement):
    - ✅ ALLOWED: id, correlation_id, plug_id, event_type, message, created_at
    - ❌ FORBIDDEN: internal_cost, provider_name, margin_percent, model_name
    
    ACE Curator: Pagination best practices = cap limit at 500, handle negative offset
    Creator Economy: Light security tier (RLS for tenant data, PII minimization)
    """
    # ACHEEVY KNR Integrity: Bounds enforcement
    limit = min(max(limit, 1), 500)  # Cap at 500 max
    offset = max(offset, 0)  # No negative offsets
    
    # SmelterOS Tool Inventory: Database connection
    db_url = os.getenv(
        "DATABASE_URL",
        "postgresql://deploy_admin:deploy_dev_password_secure_2025@localhost:5432/deploy_platform"
    )
    
    conn = None
    try:
        conn = await asyncpg.connect(db_url)
        
        # ACE Generator: Count total records strategy
        # Build WHERE clause for filtering
        where_clauses = []
        params = []
        param_idx = 1
        
        if plug_id is not None:
            where_clauses.append(f"plug_id = ${param_idx}")
            params.append(plug_id)
            param_idx += 1
        
        if start_date is not None:
            where_clauses.append(f"timestamp >= ${param_idx}")
            # Parse ISO string to datetime object for asyncpg
            try:
                start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                params.append(start_dt)
            except (ValueError, AttributeError) as e:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Invalid start_date format: {start_date}"
                )
            param_idx += 1
        
        if end_date is not None:
            where_clauses.append(f"timestamp <= ${param_idx}")
            # Parse ISO string to datetime object for asyncpg
            try:
                end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                params.append(end_dt)
            except (ValueError, AttributeError) as e:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Invalid end_date format: {end_date}"
                )
            param_idx += 1
        
        where_sql = " WHERE " + " AND ".join(where_clauses) if where_clauses else ""
        
        count_query = f"SELECT COUNT(*) FROM charter_log{where_sql}"
        total = await conn.fetchval(count_query, *params) if params else await conn.fetchval(count_query)
        
        # One-Shot: Edge case handling = offset exceeds total returns empty array
        if offset >= total:
            return CharterLogsResponse(logs=[], total=total, offset=offset, limit=limit)
        
        # ACE Curator: Pagination query with CHARTER SANITIZATION
        query = f"""
            SELECT 
                id, 
                correlation_id, 
                plug_id, 
                event_type, 
                message, 
                timestamp as created_at
            FROM charter_log
            {where_sql}
            ORDER BY timestamp DESC
            LIMIT ${param_idx} OFFSET ${param_idx + 1}
        """
        # V.I.B.E. Note: Query explicitly excludes forbidden fields
        # (internal_cost, provider_name, margin_percent, model_name)
        
        params.extend([limit, offset])
        rows = await conn.fetch(query, *params)
        
        # ACHEEVY ICAR Audit: Transform database rows to Charter-safe models
        logs = [
            CharterLog(
                id=row['id'],
                correlation_id=str(row['correlation_id']),
                plug_id=row['plug_id'],
                event_type=row['event_type'],
                message=row['message'],
                created_at=row['created_at']
            )
            for row in rows
        ]
        
        return CharterLogsResponse(
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
