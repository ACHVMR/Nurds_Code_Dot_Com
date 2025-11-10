"""
Charter/Ledger Dual-Write Logging System
Sprint 6C: IP Protection - Mission-Critical Security Tier

Separates customer-safe logs (Charter) from internal audit logs (Ledger)
to protect internal costs, margins, provider names, and model information.

CRITICAL: Charter logs NEVER contain forbidden fields:
- internal_cost, margin_percent, provider_name, model_name, error_details
- api_key, secret, token, credential, provider_response

All writes are atomic: both Charter + Ledger or neither.
100% correlation via UUID linking.
"""

import uuid
import asyncpg
from datetime import datetime
from typing import Dict, Any, Optional, List
from decimal import Decimal
import structlog
import json

logger = structlog.get_logger()


class DualWriteLogger:
    """
    Dual-write logger with Charter/Ledger separation.
    
    Charter: Customer-safe logs (progress, results, quality metrics)
    Ledger: Internal audit logs (costs, margins, providers, debugging)
    
    Every Charter entry has exactly one matching Ledger entry via correlation_id.
    """
    
    # Forbidden fields that NEVER appear in Charter logs
    FORBIDDEN_CHARTER_FIELDS = [
        'internal_cost', 'margin_percent', 'provider_name',
        'model_name', 'error_details', 'provider_response',
        'api_key', 'secret', 'token', 'credential',
        'access_token', 'refresh_token', 'api_secret',
        'password', 'private_key', 'webhook_secret'
    ]
    
    # Customer-safe cost display (external pricing only)
    CUSTOMER_SAFE_COSTS = {
        # Voice services (customer-facing prices)
        'voice_stt_per_min': 0.10,      # Customer pays $0.10/min
        'voice_tts_per_min': 0.15,      # Customer pays $0.15/min
        'voice_clone_fee': 25.00,       # Customer pays $25
        
        # NFT services
        'nft_10_avatars': 1.56,         # Customer pays $1.56
        
        # LLM services (aggregated customer pricing)
        'llm_input_per_1k': 0.50,       # Customer pays $0.50/1k tokens
        'llm_output_per_1k': 2.50,      # Customer pays $2.50/1k tokens
    }
    
    def __init__(self, db_pool: asyncpg.Pool):
        """
        Initialize dual-write logger with database connection pool.
        
        Args:
            db_pool: asyncpg connection pool for PostgreSQL
        """
        self.db_pool = db_pool
        self.logger = logger.bind(component="DualWriteLogger")
    
    async def log_dual_write(
        self,
        event_type: str,
        user_id: Optional[int],
        plug_id: Optional[int],
        charter_message: str,
        ledger_data: Dict[str, Any],
        quality_metrics: Optional[Dict[str, Any]] = None,
        phase: Optional[str] = None,
        status: Optional[str] = None,
        charter_metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Atomic dual-write to Charter and Ledger logs.
        
        Args:
            event_type: Event classification (e.g., 'hitl.approval', 'hitl.revision')
            user_id: User ID (optional for system events)
            plug_id: Plug ID (optional for non-plug events)
            charter_message: Customer-safe message
            ledger_data: Full internal data (costs, providers, margins, debugging)
            quality_metrics: V.I.B.E. scores, quality %, execution time (Charter-safe)
            phase: FDH phase (Foster, Develop, Hone)
            status: Status (running, complete, failed, blocked)
            charter_metadata: Additional Charter-safe metadata
        
        Returns:
            correlation_id: UUID linking Charter and Ledger entries
        
        Raises:
            ValueError: If charter_message contains forbidden fields
            asyncpg.PostgresError: If database write fails (both tables rolled back)
        """
        correlation_id = str(uuid.uuid4())
        timestamp = datetime.utcnow()
        
        # Sanitize Charter metadata (remove forbidden fields)
        sanitized_metadata = self._sanitize_metadata(charter_metadata or {})
        
        # Validate Charter message doesn't contain forbidden data
        self._validate_charter_message(charter_message)
        
        # Validate quality metrics are Charter-safe
        if quality_metrics:
            sanitized_quality_metrics = self._sanitize_metadata(quality_metrics)
        else:
            sanitized_quality_metrics = None
        
        try:
            async with self.db_pool.acquire() as conn:
                async with conn.transaction():
                    # Write to Charter log (customer-safe)
                    await conn.execute(
                        """
                        INSERT INTO charter_log (
                            correlation_id, timestamp, user_id, plug_id,
                            event_type, phase, status, message,
                            quality_metrics, metadata
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        """,
                        correlation_id, timestamp, user_id, plug_id,
                        event_type, phase, status, charter_message,
                        json.dumps(sanitized_quality_metrics) if sanitized_quality_metrics else None,
                        json.dumps(sanitized_metadata) if sanitized_metadata else None
                    )
                    
                    # Write to Ledger log (full internal audit)
                    await conn.execute(
                        """
                        INSERT INTO ledger_log (
                            correlation_id, timestamp, user_id, plug_id,
                            event_type, internal_cost, customer_charge,
                            margin_percent, provider_name, model_name,
                            execution_time_ms, error_details, metadata
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                        """,
                        correlation_id, timestamp, user_id, plug_id,
                        event_type,
                        ledger_data.get('internal_cost'),
                        ledger_data.get('customer_charge'),
                        ledger_data.get('margin_percent'),
                        ledger_data.get('provider_name'),
                        ledger_data.get('model_name'),
                        ledger_data.get('execution_time_ms'),
                        ledger_data.get('error_details'),
                        json.dumps(ledger_data.get('metadata', {}))
                    )
            
            self.logger.info(
                "dual_write_success",
                correlation_id=correlation_id,
                event_type=event_type,
                user_id=user_id,
                plug_id=plug_id
            )
            
            return correlation_id
            
        except asyncpg.PostgresError as e:
            self.logger.error(
                "dual_write_failed",
                error=str(e),
                event_type=event_type,
                user_id=user_id,
                plug_id=plug_id
            )
            raise
    
    async def get_charter_logs(
        self,
        user_id: Optional[int] = None,
        plug_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        event_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Retrieve customer-safe Charter logs (no forbidden fields).
        
        Args:
            user_id: Filter by user ID
            plug_id: Filter by plug ID
            start_date: Filter logs after this date
            end_date: Filter logs before this date
            event_type: Filter by event type
            limit: Maximum number of logs (max 500)
            offset: Pagination offset
        
        Returns:
            List of Charter log entries (customer-safe)
        """
        limit = min(limit, 500)  # Cap at 500 for performance
        
        query = """
            SELECT 
                correlation_id, timestamp, user_id, plug_id,
                event_type, phase, status, message,
                quality_metrics, metadata
            FROM charter_log
            WHERE 1=1
        """
        params = []
        param_count = 1
        
        if user_id is not None:
            query += f" AND user_id = ${param_count}"
            params.append(user_id)
            param_count += 1
        
        if plug_id is not None:
            query += f" AND plug_id = ${param_count}"
            params.append(plug_id)
            param_count += 1
        
        if start_date:
            query += f" AND timestamp >= ${param_count}"
            params.append(start_date)
            param_count += 1
        
        if end_date:
            query += f" AND timestamp <= ${param_count}"
            params.append(end_date)
            param_count += 1
        
        if event_type:
            query += f" AND event_type = ${param_count}"
            params.append(event_type)
            param_count += 1
        
        query += f" ORDER BY timestamp DESC LIMIT ${param_count} OFFSET ${param_count + 1}"
        params.extend([limit, offset])
        
        async with self.db_pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
            
            return [
                {
                    'correlation_id': str(row['correlation_id']),
                    'timestamp': row['timestamp'].isoformat(),
                    'user_id': row['user_id'],
                    'plug_id': row['plug_id'],
                    'event_type': row['event_type'],
                    'phase': row['phase'],
                    'status': row['status'],
                    'message': row['message'],
                    'quality_metrics': json.loads(row['quality_metrics']) if row['quality_metrics'] else None,
                    'metadata': json.loads(row['metadata']) if row['metadata'] else None
                }
                for row in rows
            ]
    
    async def get_ledger_logs(
        self,
        user_id: Optional[int] = None,
        plug_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        event_type: Optional[str] = None,
        provider_name: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Retrieve internal Ledger logs (full audit trail).
        
        CRITICAL: Admin-only access. Contains internal costs, margins, providers.
        
        Args:
            user_id: Filter by user ID
            plug_id: Filter by plug ID
            start_date: Filter logs after this date
            end_date: Filter logs before this date
            event_type: Filter by event type
            provider_name: Filter by provider (Deepgram, ElevenLabs, etc.)
            limit: Maximum number of logs (max 500)
            offset: Pagination offset
        
        Returns:
            List of Ledger log entries (full internal data)
        """
        limit = min(limit, 500)
        
        query = """
            SELECT 
                correlation_id, timestamp, user_id, plug_id,
                event_type, internal_cost, customer_charge,
                margin_percent, provider_name, model_name,
                execution_time_ms, error_details, metadata
            FROM ledger_log
            WHERE 1=1
        """
        params = []
        param_count = 1
        
        if user_id is not None:
            query += f" AND user_id = ${param_count}"
            params.append(user_id)
            param_count += 1
        
        if plug_id is not None:
            query += f" AND plug_id = ${param_count}"
            params.append(plug_id)
            param_count += 1
        
        if start_date:
            query += f" AND timestamp >= ${param_count}"
            params.append(start_date)
            param_count += 1
        
        if end_date:
            query += f" AND timestamp <= ${param_count}"
            params.append(end_date)
            param_count += 1
        
        if event_type:
            query += f" AND event_type = ${param_count}"
            params.append(event_type)
            param_count += 1
        
        if provider_name:
            query += f" AND provider_name = ${param_count}"
            params.append(provider_name)
            param_count += 1
        
        query += f" ORDER BY timestamp DESC LIMIT ${param_count} OFFSET ${param_count + 1}"
        params.extend([limit, offset])
        
        async with self.db_pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
            
            return [
                {
                    'correlation_id': str(row['correlation_id']),
                    'timestamp': row['timestamp'].isoformat(),
                    'user_id': row['user_id'],
                    'plug_id': row['plug_id'],
                    'event_type': row['event_type'],
                    'internal_cost': float(row['internal_cost']) if row['internal_cost'] else None,
                    'customer_charge': float(row['customer_charge']) if row['customer_charge'] else None,
                    'margin_percent': float(row['margin_percent']) if row['margin_percent'] else None,
                    'provider_name': row['provider_name'],
                    'model_name': row['model_name'],
                    'execution_time_ms': row['execution_time_ms'],
                    'error_details': row['error_details'],
                    'metadata': json.loads(row['metadata']) if row['metadata'] else None
                }
                for row in rows
            ]
    
    async def get_correlated_logs(
        self,
        correlation_id: str
    ) -> Dict[str, Any]:
        """
        Retrieve both Charter and Ledger logs for a given correlation_id.
        
        Admin-only: Returns full audit trail with customer and internal data.
        
        Args:
            correlation_id: UUID linking Charter and Ledger entries
        
        Returns:
            Dict with 'charter' and 'ledger' keys containing full logs
        """
        async with self.db_pool.acquire() as conn:
            charter_row = await conn.fetchrow(
                """
                SELECT 
                    correlation_id, timestamp, user_id, plug_id,
                    event_type, phase, status, message,
                    quality_metrics, metadata
                FROM charter_log
                WHERE correlation_id = $1
                """,
                correlation_id
            )
            
            ledger_row = await conn.fetchrow(
                """
                SELECT 
                    correlation_id, timestamp, user_id, plug_id,
                    event_type, internal_cost, customer_charge,
                    margin_percent, provider_name, model_name,
                    execution_time_ms, error_details, metadata
                FROM ledger_log
                WHERE correlation_id = $1
                """,
                correlation_id
            )
            
            if not charter_row or not ledger_row:
                return {}
            
            return {
                'charter': {
                    'correlation_id': str(charter_row['correlation_id']),
                    'timestamp': charter_row['timestamp'].isoformat(),
                    'user_id': charter_row['user_id'],
                    'plug_id': charter_row['plug_id'],
                    'event_type': charter_row['event_type'],
                    'phase': charter_row['phase'],
                    'status': charter_row['status'],
                    'message': charter_row['message'],
                    'quality_metrics': json.loads(charter_row['quality_metrics']) if charter_row['quality_metrics'] else None,
                    'metadata': json.loads(charter_row['metadata']) if charter_row['metadata'] else None
                },
                'ledger': {
                    'correlation_id': str(ledger_row['correlation_id']),
                    'timestamp': ledger_row['timestamp'].isoformat(),
                    'user_id': ledger_row['user_id'],
                    'plug_id': ledger_row['plug_id'],
                    'event_type': ledger_row['event_type'],
                    'internal_cost': float(ledger_row['internal_cost']) if ledger_row['internal_cost'] else None,
                    'customer_charge': float(ledger_row['customer_charge']) if ledger_row['customer_charge'] else None,
                    'margin_percent': float(ledger_row['margin_percent']) if ledger_row['margin_percent'] else None,
                    'provider_name': ledger_row['provider_name'],
                    'model_name': ledger_row['model_name'],
                    'execution_time_ms': ledger_row['execution_time_ms'],
                    'error_details': ledger_row['error_details'],
                    'metadata': json.loads(ledger_row['metadata']) if ledger_row['metadata'] else None
                }
            }
    
    def _sanitize_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Recursively remove forbidden fields from metadata.
        
        CRITICAL: Ensures Charter logs never contain internal data.
        
        Args:
            metadata: Dictionary potentially containing forbidden fields
        
        Returns:
            Sanitized dictionary with forbidden fields removed
        """
        if not isinstance(metadata, dict):
            return metadata
        
        sanitized = {}
        for key, value in metadata.items():
            # Check if key is forbidden (case-insensitive)
            if key.lower() in self.FORBIDDEN_CHARTER_FIELDS:
                continue
            
            # Recursively sanitize nested dictionaries
            if isinstance(value, dict):
                sanitized[key] = self._sanitize_metadata(value)
            elif isinstance(value, list):
                sanitized[key] = [
                    self._sanitize_metadata(item) if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                sanitized[key] = value
        
        return sanitized
    
    def _validate_charter_message(self, message: str) -> None:
        """
        Validate Charter message doesn't contain forbidden data patterns.
        
        Args:
            message: Charter message to validate
        
        Raises:
            ValueError: If message contains forbidden patterns
        """
        message_lower = message.lower()
        
        # Check for common forbidden patterns
        forbidden_patterns = [
            '$0.0', 'margin:', 'provider:', 'deepgram', 'elevenlabs',
            'openrouter', 'gpt-4', 'gpt4', 'claude', 'internal cost', 'api_key',
            'api key', 'margin %', 'cost:'
        ]
        
        for pattern in forbidden_patterns:
            if pattern in message_lower:
                raise ValueError(
                    f"Charter message contains forbidden pattern: '{pattern}'. "
                    f"Use customer-safe language only."
                )
    
    async def validate_correlation(self) -> Dict[str, Any]:
        """
        Validate 100% correlation between Charter and Ledger logs.
        
        Returns:
            Dict with validation results:
            - total_charter: Total Charter entries
            - total_ledger: Total Ledger entries
            - orphaned_charter: Charter entries without Ledger match
            - orphaned_ledger: Ledger entries without Charter match
            - correlation_percent: Percentage of matched entries
        """
        async with self.db_pool.acquire() as conn:
            total_charter = await conn.fetchval("SELECT COUNT(*) FROM charter_log")
            total_ledger = await conn.fetchval("SELECT COUNT(*) FROM ledger_log")
            
            orphaned_charter = await conn.fetch(
                """
                SELECT correlation_id FROM charter_log
                WHERE correlation_id NOT IN (SELECT correlation_id FROM ledger_log)
                """
            )
            
            orphaned_ledger = await conn.fetch(
                """
                SELECT correlation_id FROM ledger_log
                WHERE correlation_id NOT IN (SELECT correlation_id FROM charter_log)
                """
            )
            
            correlation_percent = (
                100.0 * (total_charter - len(orphaned_charter)) / total_charter
                if total_charter > 0 else 100.0
            )
            
            return {
                'total_charter': total_charter,
                'total_ledger': total_ledger,
                'orphaned_charter': [str(row['correlation_id']) for row in orphaned_charter],
                'orphaned_ledger': [str(row['correlation_id']) for row in orphaned_ledger],
                'correlation_percent': correlation_percent,
                'is_valid': correlation_percent == 100.0
            }
    
    async def query_logs(
        self,
        correlation_id: Optional[str] = None,
        plug_id: Optional[int] = None,
        event_type: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Query logs across Charter and Ledger with JOIN.
        
        Returns combined view with correlation integrity verification.
        Useful for auditing, debugging, and cross-table analysis.
        
        Args:
            correlation_id: Filter by specific correlation_id
            plug_id: Filter by plug_id
            event_type: Filter by event_type
            limit: Maximum records to return (capped at 500)
        
        Returns:
            List of dicts with both Charter + Ledger data merged
        """
        # Cap limit at 500
        limit = min(limit, 500)
        
        # Build query dynamically
        query = """
            SELECT 
                c.correlation_id,
                c.timestamp,
                c.user_id,
                c.plug_id,
                c.event_type,
                c.phase,
                c.status,
                c.message as charter_message,
                c.quality_metrics,
                c.metadata as charter_metadata,
                l.internal_cost,
                l.customer_charge,
                l.margin_percent,
                l.provider_name,
                l.model_name,
                l.execution_time_ms,
                l.error_details,
                l.metadata as ledger_metadata
            FROM charter_log c
            LEFT JOIN ledger_log l ON c.correlation_id = l.correlation_id
            WHERE 1=1
        """
        
        params = []
        param_count = 1
        
        if correlation_id:
            query += f" AND c.correlation_id = ${param_count}"
            params.append(correlation_id)
            param_count += 1
        
        if plug_id is not None:
            query += f" AND c.plug_id = ${param_count}"
            params.append(plug_id)
            param_count += 1
        
        if event_type:
            query += f" AND c.event_type = ${param_count}"
            params.append(event_type)
            param_count += 1
        
        query += f" ORDER BY c.timestamp DESC LIMIT ${param_count}"
        params.append(limit)
        
        async with self.db_pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
            
            results = []
            for row in rows:
                result = dict(row)
                # Convert UUID to string
                if result.get('correlation_id'):
                    result['correlation_id'] = str(result['correlation_id'])
                results.append(result)
            
            self.logger.info(
                "query_logs_executed",
                correlation_id=correlation_id,
                plug_id=plug_id,
                event_type=event_type,
                results_count=len(results)
            )
            
            return results
    
    async def validate_vibe_integrity(self) -> Dict[str, Any]:
        """
        Validate V.I.B.E. (Verifiable, Idempotent, Bounded, Evident) integrity.
        
        ACHEEVY: Implements NTNTN_Ang quality gate (≥99.7% threshold)
        SmelterOS: Chronicle dual-write verification
        
        Returns:
            Dict with integrity statistics:
            - total_charter: Total Charter entries
            - total_ledger: Total Ledger entries
            - matched_count: Perfectly correlated entries
            - orphaned_charter: Charter without Ledger
            - orphaned_ledger: Ledger without Charter
            - integrity_percent: Percentage of perfect correlation
            - passes_vibe: True if ≥99.7% correlation
        """
        async with self.db_pool.acquire() as conn:
            # Count totals
            total_charter = await conn.fetchval("SELECT COUNT(*) FROM charter_log")
            total_ledger = await conn.fetchval("SELECT COUNT(*) FROM ledger_log")
            
            # Find orphaned Charter entries (no matching Ledger)
            orphaned_charter_rows = await conn.fetch(
                """
                SELECT correlation_id FROM charter_log
                WHERE correlation_id NOT IN (SELECT correlation_id FROM ledger_log)
                """
            )
            
            # Find orphaned Ledger entries (no matching Charter)
            orphaned_ledger_rows = await conn.fetch(
                """
                SELECT correlation_id FROM ledger_log
                WHERE correlation_id NOT IN (SELECT correlation_id FROM charter_log)
                """
            )
            
            orphaned_charter_count = len(orphaned_charter_rows)
            orphaned_ledger_count = len(orphaned_ledger_rows)
            
            # Calculate matched count (perfect correlation)
            matched_count = total_charter - orphaned_charter_count
            
            # Calculate integrity percentage
            if total_charter > 0:
                integrity_percent = (matched_count / total_charter) * 100.0
            else:
                integrity_percent = 100.0  # Empty system is perfectly correlated
            
            # V.I.B.E. threshold: ≥99.7%
            passes_vibe = integrity_percent >= 99.7
            
            result = {
                'total_charter': total_charter,
                'total_ledger': total_ledger,
                'matched_count': matched_count,
                'orphaned_charter': orphaned_charter_count,
                'orphaned_ledger': orphaned_ledger_count,
                'integrity_percent': round(integrity_percent, 2),
                'passes_vibe': passes_vibe,
                'orphaned_charter_ids': [str(row['correlation_id']) for row in orphaned_charter_rows],
                'orphaned_ledger_ids': [str(row['correlation_id']) for row in orphaned_ledger_rows]
            }
            
            self.logger.info(
                "vibe_integrity_validated",
                integrity_percent=result['integrity_percent'],
                passes_vibe=passes_vibe,
                orphaned_total=orphaned_charter_count + orphaned_ledger_count
            )
            
            return result
    
    async def close(self) -> None:
        """
        Close database connection pool gracefully.
        
        ACHEEVY: Implements Bounded principle (resource cleanup)
        SmelterOS: Graceful Foundry Floor shutdown
        
        Ensures all connections are properly released and pool is terminated.
        Call this during application shutdown or test cleanup.
        """
        if self.db_pool:
            await self.db_pool.close()
            self.logger.info("connection_pool_closed", component="DualWriteLogger")
        else:
            self.logger.warning("connection_pool_already_closed", component="DualWriteLogger")
