"""
Charter-Ledger Logging Module for Modal GPU Workers

This module provides database logging functions that enforce Charter-Ledger
separation for customer-facing vs internal audit logs.

CRITICAL RULES:
- Charter logs: Customer-facing, NO internal costs
- Ledger logs: Internal audit, ALL data including costs
"""

# Conditional imports - asyncpg only available in Modal container
try:
    import asyncpg
except ImportError:
    asyncpg = None  # Will be available in Modal container

import json
from datetime import datetime
from typing import Dict, Any, Optional
from modal_config import CHARTER_BLOCKED_FIELDS, sanitize_for_charter

# =============================================================================
# DATABASE CONNECTION
# =============================================================================

async def get_db_connection():
    """
    Create async connection to PostgreSQL database.
    
    DATABASE_URL is injected via Modal secrets.
    
    Returns:
        asyncpg.Connection: Database connection
    """
    import os
    
    if asyncpg is None:
        raise RuntimeError("asyncpg not available - run inside Modal container")
    
    database_url = os.environ.get("DATABASE_URL")
    
    if not database_url:
        raise ValueError("DATABASE_URL not found in environment")
    
    conn = await asyncpg.connect(database_url)
    return conn

# =============================================================================
# CHARTER LOGGING (Customer-Facing)
# =============================================================================

async def log_to_charter(
    engagement_id: str,
    event: str,
    metadata: Dict[str, Any],
    severity: str = "INFO"
) -> None:
    """
    Log event to Charter (customer-facing logs).
    
    ENFORCES: NO internal costs, margins, or provider details.
    
    Args:
        engagement_id: Unique engagement identifier
        event: Event name (e.g., "task_started", "task_completed")
        metadata: Event data (will be sanitized)
        severity: Log severity (INFO, WARNING, ERROR)
    """
    
    # CRITICAL: Sanitize metadata to remove internal costs
    sanitized_metadata = sanitize_for_charter(metadata)
    
    # Verify no blocked fields leaked through
    for field in CHARTER_BLOCKED_FIELDS:
        if field in sanitized_metadata:
            raise ValueError(
                f"CHARTER VIOLATION: Field '{field}' blocked from customer logs"
            )
    
    conn = await get_db_connection()
    try:
        await conn.execute(
            """
            INSERT INTO charter_logs 
            (engagement_id, event, metadata, severity, created_at)
            VALUES ($1, $2, $3, $4, $5)
            """,
            engagement_id,
            event,
            json.dumps(sanitized_metadata),
            severity,
            datetime.utcnow(),
        )
    finally:
        await conn.close()

# =============================================================================
# LEDGER LOGGING (Internal Audit)
# =============================================================================

async def log_to_ledger(
    engagement_id: str,
    event: str,
    metadata: Dict[str, Any],
    severity: str = "INFO"
) -> None:
    """
    Log event to Ledger (internal audit logs).
    
    INCLUDES: ALL data including costs, margins, providers, models.
    
    Args:
        engagement_id: Unique engagement identifier
        event: Event name (e.g., "task_started", "task_completed")
        metadata: Complete event data (no sanitization)
        severity: Log severity (INFO, WARNING, ERROR)
    """
    
    # NO sanitization - Ledger accepts ALL fields
    conn = await get_db_connection()
    try:
        await conn.execute(
            """
            INSERT INTO ledger_logs 
            (engagement_id, event, metadata, severity, created_at)
            VALUES ($1, $2, $3, $4, $5)
            """,
            engagement_id,
            event,
            json.dumps(metadata),
            severity,
            datetime.utcnow(),
        )
    finally:
        await conn.close()

# =============================================================================
# DUAL LOGGING (Charter + Ledger)
# =============================================================================

async def log_dual(
    engagement_id: str,
    event: str,
    charter_metadata: Dict[str, Any],
    ledger_metadata: Dict[str, Any],
    severity: str = "INFO"
) -> None:
    """
    Log to both Charter and Ledger with different metadata.
    
    Use this when you need to show sanitized data to customers
    but keep full internal details for audit.
    
    Args:
        engagement_id: Unique engagement identifier
        event: Event name
        charter_metadata: Customer-facing data (sanitized)
        ledger_metadata: Internal audit data (complete)
        severity: Log severity
    """
    
    # Log to both systems in parallel
    await log_to_charter(engagement_id, event, charter_metadata, severity)
    await log_to_ledger(engagement_id, event, ledger_metadata, severity)

# =============================================================================
# COST CALCULATION HELPERS (LEDGER ONLY)
# =============================================================================

def calculate_gpu_cost(execution_seconds: float, gpu_type: str = "A10G") -> float:
    """
    Calculate GPU cost based on execution time.
    
    INTERNAL ONLY - Never expose to customers.
    
    Args:
        execution_seconds: Task execution time in seconds
        gpu_type: GPU type (default: A10G)
    
    Returns:
        Total GPU cost in USD
    """
    from modal_config import INTERNAL_COSTS
    
    rate = INTERNAL_COSTS.get("gpu_a10g_per_second", 0.0004)
    return execution_seconds * rate

def calculate_llm_cost(
    model: str,
    input_tokens: int,
    output_tokens: int
) -> float:
    """
    Calculate LLM API cost based on token usage.
    
    INTERNAL ONLY - Never expose to customers.
    
    Args:
        model: Model name (e.g., "gpt-4.1-nano")
        input_tokens: Number of input tokens
        output_tokens: Number of output tokens
    
    Returns:
        Total LLM cost in USD
    """
    from modal_config import LLM_COSTS
    
    costs = LLM_COSTS.get(model, {"input": 0.0, "output": 0.0})
    
    input_cost = input_tokens * costs["input"]
    output_cost = output_tokens * costs["output"]
    
    return input_cost + output_cost

# =============================================================================
# ENGAGEMENT STATUS UPDATES
# =============================================================================

async def update_engagement_status(
    engagement_id: str,
    status: str,
    metadata: Optional[Dict[str, Any]] = None
) -> None:
    """
    Update engagement status in database.
    
    Args:
        engagement_id: Unique engagement identifier
        status: New status (e.g., "task_running", "task_completed")
        metadata: Optional metadata to store
    """
    conn = await get_db_connection()
    try:
        await conn.execute(
            """
            UPDATE charter_engagements
            SET status = $1, 
                metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
                updated_at = $3
            WHERE engagement_id = $4
            """,
            status,
            json.dumps(metadata or {}),
            datetime.utcnow(),
            engagement_id,
        )
    finally:
        await conn.close()

# =============================================================================
# EXPORTS
# =============================================================================

__all__ = [
    "log_to_charter",
    "log_to_ledger",
    "log_dual",
    "calculate_gpu_cost",
    "calculate_llm_cost",
    "update_engagement_status",
]
