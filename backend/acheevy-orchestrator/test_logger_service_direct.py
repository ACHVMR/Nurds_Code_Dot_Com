"""
Sprint 7 Phase 6D: Direct DualWriteLogger Unit Tests
Target: Increase logger_service.py coverage from 33% → 60%+

Test Coverage Focus:
- get_charter_logs() method (4 tests)
- get_ledger_logs() method (2 tests)
- Error handling edge cases (2 tests)

ACHEEVY Orchestration: Direct class method testing (not via API endpoints)
SmelterOS Integration: V.I.B.E. validation ≥99.7%
ACE Framework: Generator/Reflector/Curator patterns verified

Phase 6D-Part1: 8 core tests for existing methods
Phase 6D-Part2 (Future): Add tests for query_logs(), validate_vibe_integrity(), close()
"""

import pytest
import pytest_asyncio
import asyncpg
from datetime import datetime, timezone, timedelta
from uuid import uuid4
import os
from logger_service import DualWriteLogger


@pytest_asyncio.fixture
async def db_pool():
    """Create test database connection pool"""
    db_url = os.getenv(
        "DATABASE_URL",
        "postgresql://deploy_admin:deploy_dev_password_secure_2025@localhost:5432/deploy_platform"
    )
    pool = await asyncpg.create_pool(db_url, min_size=1, max_size=3)
    yield pool
    await pool.close()


@pytest_asyncio.fixture
async def dual_logger(db_pool):
    """Create DualWriteLogger instance for testing"""
    logger = DualWriteLogger(db_pool)
    yield logger
    # Cleanup happens via clean_test_data fixture


@pytest_asyncio.fixture
async def clean_test_data(db_pool):
    """Clean test data before and after each test"""
    async with db_pool.acquire() as conn:
        await conn.execute("DELETE FROM charter_log WHERE plug_id >= 90000")
        await conn.execute("DELETE FROM ledger_log WHERE plug_id >= 90000")
    
    yield
    
    async with db_pool.acquire() as conn:
        await conn.execute("DELETE FROM charter_log WHERE plug_id >= 90000")
        await conn.execute("DELETE FROM ledger_log WHERE plug_id >= 90000")


@pytest.fixture
def test_plug_id_generator():
    """Generate unique plug IDs for test isolation"""
    current_id = 90000
    def generator():
        nonlocal current_id
        current_id += 1
        return current_id
    return generator


# ============================================================================
# TEST SUITE 1: get_charter_logs() - Customer-Safe Log Retrieval (4 tests)
# ============================================================================

@pytest.mark.asyncio
async def test_get_charter_logs_basic_retrieval(dual_logger, clean_test_data, test_plug_id_generator):
    """Test basic retrieval of charter logs."""
    # Create test data
    plug_id = test_plug_id_generator()
    
    returned_corr_id = await dual_logger.log_dual_write(
        event_type="test.event",
        user_id=None,  # System event, no user context
        plug_id=plug_id,
        charter_message="Test charter entry",
        ledger_data={
            "internal_cost": 0.50,
            "customer_charge": 1.00,
            "margin_percent": 100.0,
            "provider_name": "TestProvider",
            "model_name": "test-model",
            "execution_time_ms": 120
        },
        quality_metrics={"score": 95},
        phase="foster",
        status="approved"
    )
    
    # Retrieve via get_charter_logs()
    logs = await dual_logger.get_charter_logs(plug_id=plug_id)
    
    assert len(logs) == 1
    assert logs[0]['correlation_id'] == returned_corr_id
    assert logs[0]['message'] == "Test charter entry"
    assert logs[0]['event_type'] == "test.event"
    assert logs[0]['phase'] == "foster"
    assert logs[0]['status'] == "approved"
    
    # CHARTER FORBIDDEN FIELDS: Verify NO internal costs/providers
    assert 'internal_cost' not in logs[0]
    assert 'provider_name' not in logs[0]
    assert 'model_name' not in logs[0]
    assert 'margin_percent' not in logs[0]


@pytest.mark.asyncio
async def test_get_charter_logs_date_filtering(dual_logger, clean_test_data, test_plug_id_generator):
    """
    Test Charter logs date range filtering
    
    ACHEEVY: Validate temporal boundaries for customer analytics
    """
    plug_id = test_plug_id_generator()
    base_time = datetime.now(timezone.utc)
    
    # Create 3 logs at different times (simulated via event_type)
    for i in range(3):
        await dual_logger.log_dual_write(
            event_type=f"test.date.{i}",
            user_id=None,
            plug_id=plug_id,
            charter_message=f"Date test {i}",
            ledger_data={
                "internal_cost": 0.10,
                "customer_charge": 0.20,
                "margin_percent": 100.0,
                "provider_name": "TestProvider",
                "model_name": "test-model",
                "execution_time_ms": 50
            },
            quality_metrics={"index": i},
            phase="develop",
            status="completed"
        )
    
    # Test 1: Filter with future start_date (should return 0)
    future_date = base_time + timedelta(days=1)
    logs = await dual_logger.get_charter_logs(
        plug_id=plug_id,
        start_date=future_date
    )
    assert len(logs) == 0, "Future start_date should return no results"
    
    # Test 2: Filter with past end_date (should return 0)
    past_date = base_time - timedelta(days=1)
    logs = await dual_logger.get_charter_logs(
        plug_id=plug_id,
        end_date=past_date
    )
    assert len(logs) == 0, "Past end_date should return no results"
    
    # Test 3: Wide range (should return all 3)
    logs = await dual_logger.get_charter_logs(
        plug_id=plug_id,
        start_date=past_date,
        end_date=future_date
    )
    assert len(logs) == 3, f"Expected 3 logs, got {len(logs)}"


@pytest.mark.asyncio
async def test_get_charter_logs_pagination(dual_logger, clean_test_data, test_plug_id_generator):
    """
    Test Charter logs pagination
    
    ACHEEVY: Validate bounded execution (max 500 records)
    SmelterOS: Prevent resource exhaustion
    """
    plug_id = test_plug_id_generator()
    
    # Create 10 test logs
    for i in range(10):
        await dual_logger.log_dual_write(
            event_type=f"test.page.{i}",
            user_id=None,
            plug_id=plug_id,
            charter_message=f"Pagination test {i}",
            ledger_data={
                "internal_cost": 0.05,
                "customer_charge": 0.15,
                "margin_percent": 200.0,
                "provider_name": "TestProvider",
                "model_name": "test-model",
                "execution_time_ms": 50
            },
            quality_metrics={"index": i},
            phase="develop",
            status="completed"
        )
    
    # Test 1: First page (limit=5, offset=0)
    logs_page1 = await dual_logger.get_charter_logs(plug_id=plug_id, limit=5, offset=0)
    assert len(logs_page1) == 5
    
    # Test 2: Second page (limit=5, offset=5)
    logs_page2 = await dual_logger.get_charter_logs(plug_id=plug_id, limit=5, offset=5)
    assert len(logs_page2) == 5
    
    # Test 3: Verify no overlap
    page1_ids = {log['correlation_id'] for log in logs_page1}
    page2_ids = {log['correlation_id'] for log in logs_page2}
    assert len(page1_ids & page2_ids) == 0, "Pages should not overlap"


@pytest.mark.asyncio
async def test_get_charter_logs_event_type_filter(dual_logger, clean_test_data, test_plug_id_generator):
    """
    Test Charter logs filtering by event_type
    
    ACHEEVY: Validate event categorization for customer insights
    """
    plug_id = test_plug_id_generator()
    
    # Create logs with different event types
    await dual_logger.log_dual_write(
        event_type="hitl.approval",
        user_id=None,
        plug_id=plug_id,
        charter_message="HITL approval granted",
        ledger_data={
            "internal_cost": 0.00,
            "customer_charge": 0.00,
            "margin_percent": 0.0,
            "provider_name": "Manual",
            "model_name": "human-review",
            "execution_time_ms": 5000
        },
        quality_metrics={"approved": True},
        phase="hone",
        status="approved"
    )
    
    await dual_logger.log_dual_write(
        event_type="build.complete",
        user_id=None,
        plug_id=plug_id,
        charter_message="Build completed successfully",
        ledger_data={
            "internal_cost": 1.25,
            "customer_charge": 3.75,
            "margin_percent": 200.0,
            "provider_name": "GPT",
            "model_name": "gpt-4.1-nano",
            "execution_time_ms": 15000
        },
        quality_metrics={"success": True},
        phase="develop",
        status="completed"
    )
    
    # Filter by event_type
    approval_logs = await dual_logger.get_charter_logs(plug_id=plug_id, event_type="hitl.approval")
    assert len(approval_logs) == 1
    assert approval_logs[0]['event_type'] == "hitl.approval"
    
    build_logs = await dual_logger.get_charter_logs(plug_id=plug_id, event_type="build.complete")
    assert len(build_logs) == 1
    assert build_logs[0]['event_type'] == "build.complete"


# ============================================================================
# TEST SUITE 2: get_ledger_logs() - Internal Audit Trail (2 tests)
# ============================================================================

@pytest.mark.asyncio
async def test_get_ledger_logs_full_internal_data(dual_logger, clean_test_data, test_plug_id_generator):
    """
    Test Ledger logs contain ALL internal data
    
    ACHEEVY: Validate complete audit trail with costs, providers, margins
    CRITICAL: This is IP protection verification - Ledger MUST contain what Charter hides
    """
    plug_id = test_plug_id_generator()
    
    returned_corr_id = await dual_logger.log_dual_write(
        event_type="audit.test",
        user_id=None,
        plug_id=plug_id,
        charter_message="Ledger internal data test",
        ledger_data={
            "internal_cost": 0.75,
            "customer_charge": 2.25,
            "margin_percent": 200.0,
            "provider_name": "DeepSeek",
            "model_name": "deepseek-v3.2-exp",
            "execution_time_ms": 250
        },
        quality_metrics={"audit": True},
        phase="foster",
        status="approved"
    )
    
    # Retrieve via get_ledger_logs()
    logs = await dual_logger.get_ledger_logs(plug_id=plug_id)
    
    assert len(logs) == 1
    assert logs[0]['correlation_id'] == returned_corr_id
    
    # LEDGER INTERNAL DATA: Verify ALL sensitive data present
    assert logs[0]['internal_cost'] == 0.75
    assert logs[0]['customer_charge'] == 2.25
    assert logs[0]['margin_percent'] == 200.0
    assert logs[0]['provider_name'] == "DeepSeek"
    assert logs[0]['model_name'] == "deepseek-v3.2-exp"
    assert logs[0]['execution_time_ms'] == 250


@pytest.mark.asyncio
async def test_get_ledger_logs_pagination(dual_logger, clean_test_data, test_plug_id_generator):
    """
    Test Ledger logs pagination
    
    ACHEEVY: Validate bounded execution (max 500 records)
    """
    plug_id = test_plug_id_generator()
    
    # Create 8 test logs
    for i in range(8):
        await dual_logger.log_dual_write(
            event_type=f"ledger.page.{i}",
            user_id=None,
            plug_id=plug_id,
            charter_message=f"Ledger pagination {i}",
            ledger_data={
                "internal_cost": 0.05 * i,
                "customer_charge": 0.15 * i,
                "margin_percent": 200.0,
                "provider_name": "TestProvider",
                "model_name": "test-model",
                "execution_time_ms": 30 + i
            },
            quality_metrics={"index": i},
            phase="develop",
            status="completed"
        )
    
    # Test pagination
    logs_page1 = await dual_logger.get_ledger_logs(plug_id=plug_id, limit=4, offset=0)
    assert len(logs_page1) == 4
    
    logs_page2 = await dual_logger.get_ledger_logs(plug_id=plug_id, limit=4, offset=4)
    assert len(logs_page2) == 4
    
    # Verify no overlap
    page1_ids = {log['correlation_id'] for log in logs_page1}
    page2_ids = {log['correlation_id'] for log in logs_page2}
    assert len(page1_ids & page2_ids) == 0


# ============================================================================
# TEST SUITE 3: Error Handling & Edge Cases (2 tests)
# ============================================================================

@pytest.mark.asyncio
async def test_get_charter_logs_empty_result(dual_logger, clean_test_data, test_plug_id_generator):
    """
    Test Charter logs with non-existent plug_id returns empty list
    
    ACHEEVY: Validate graceful handling of missing data
    """
    non_existent_plug = 99999
    
    logs = await dual_logger.get_charter_logs(plug_id=non_existent_plug)
    assert logs == []


@pytest.mark.asyncio
async def test_get_ledger_logs_limit_cap_500(dual_logger, clean_test_data, test_plug_id_generator):
    """
    Test Ledger logs respects 500-record limit cap
    
    ACHEEVY: Validate bounded execution prevents resource exhaustion
    SmelterOS: Critical for Foundry Floor stability
    """
    plug_id = test_plug_id_generator()
    
    # Create 10 logs (simulating larger dataset)
    for i in range(10):
        await dual_logger.log_dual_write(
            event_type=f"limit.test.{i}",
            user_id=None,
            plug_id=plug_id,
            charter_message=f"Limit test {i}",
            ledger_data={
                "internal_cost": 0.01,
                "customer_charge": 0.03,
                "margin_percent": 200.0,
                "provider_name": "TestProvider",
                "model_name": "test-model",
                "execution_time_ms": 10
            },
            quality_metrics={},
            phase="test",
            status="testing"
        )
    
    # Request with limit > 500 (should cap at 500)
    logs = await dual_logger.get_ledger_logs(plug_id=plug_id, limit=1000)
    assert len(logs) <= 500, "Limit should be capped at 500"
    assert len(logs) == 10, "With only 10 records, should return all 10"


# ============================================================================
# TEST SUITE 4: query_logs() - Cross-Table JOIN Queries (3 tests)
# ============================================================================

@pytest.mark.asyncio
async def test_query_logs_correlation_id(dual_logger, clean_test_data, test_plug_id_generator):
    """
    Test query_logs() by correlation_id
    
    ACHEEVY: Validate cross-table correlation integrity
    """
    plug_id = test_plug_id_generator()
    
    returned_corr_id = await dual_logger.log_dual_write(
        event_type="query.test",
        user_id=None,
        plug_id=plug_id,
        charter_message="Query test",
        ledger_data={
            "internal_cost": 0.25,
            "customer_charge": 0.75,
            "margin_percent": 200.0,
            "provider_name": "TestProvider",
            "model_name": "test-model",
            "execution_time_ms": 100
        },
        quality_metrics={"test": True},
        phase="foster",
        status="approved"
    )
    
    # Query by correlation_id (returns merged Charter + Ledger data)
    results = await dual_logger.query_logs(correlation_id=returned_corr_id)
    
    assert len(results) == 1
    result = results[0]
    
    # Verify Charter data present
    assert result['correlation_id'] == returned_corr_id
    assert result['charter_message'] == "Query test"
    assert result['event_type'] == "query.test"
    
    # Verify Ledger data present (JOIN succeeded)
    assert result['internal_cost'] == 0.25
    assert result['customer_charge'] == 0.75
    assert result['provider_name'] == "TestProvider"


@pytest.mark.asyncio
async def test_query_logs_plug_id(dual_logger, clean_test_data, test_plug_id_generator):
    """
    Test query_logs() by plug_id
    
    ACHEEVY: Validate plug-scoped dual-write retrieval
    """
    plug_id = test_plug_id_generator()
    
    # Create 2 logs for same plug
    for i in range(2):
        await dual_logger.log_dual_write(
            event_type=f"plug.query.{i}",
            user_id=None,
            plug_id=plug_id,
            charter_message=f"Plug query {i}",
            ledger_data={
                "internal_cost": 0.10,
                "customer_charge": 0.30,
                "margin_percent": 200.0,
                "provider_name": "TestProvider",
                "model_name": "test-model",
                "execution_time_ms": 50
            },
            quality_metrics={},
            phase="develop",
            status="completed"
        )
    
    # Query by plug_id
    results = await dual_logger.query_logs(plug_id=plug_id)
    
    assert len(results) == 2
    # Verify both have merged Charter + Ledger data
    for result in results:
        assert 'charter_message' in result  # Charter field
        assert 'internal_cost' in result    # Ledger field
        assert result['plug_id'] == plug_id


@pytest.mark.asyncio
async def test_query_logs_event_type(dual_logger, clean_test_data, test_plug_id_generator):
    """
    Test query_logs() by event_type
    
    ACHEEVY: Validate event type filtering across both tables
    """
    plug_id = test_plug_id_generator()
    
    # Create logs with specific event_type
    await dual_logger.log_dual_write(
        event_type="specific.event.type",
        user_id=None,
        plug_id=plug_id,
        charter_message="Specific event",
        ledger_data={
            "internal_cost": 0.15,
            "customer_charge": 0.45,
            "margin_percent": 200.0,
            "provider_name": "TestProvider",
            "model_name": "test-model",
            "execution_time_ms": 75
        },
        quality_metrics={},
        phase="hone",
        status="validated"
    )
    
    # Query by event_type
    results = await dual_logger.query_logs(event_type="specific.event.type")
    
    assert len(results) >= 1
    # Find our test event
    test_result = next(r for r in results if r['charter_message'] == "Specific event")
    assert test_result['event_type'] == "specific.event.type"
    assert float(test_result['internal_cost']) == 0.15  # Ledger data present (convert Decimal to float)


# ============================================================================
# TEST SUITE 5: validate_vibe_integrity() - V.I.B.E. Quality Gates (2 tests)
# ============================================================================

@pytest.mark.asyncio
async def test_validate_vibe_integrity_perfect_match(dual_logger, clean_test_data, test_plug_id_generator):
    """
    Test V.I.B.E. integrity validation with 100% correlation match
    
    ACHEEVY: Validate NTNTN_Ang quality gates (≥99.7% threshold)
    SmelterOS: Verify Chronicle dual-write integrity
    """
    plug_id = test_plug_id_generator()
    
    # Create 5 dual-write entries (100% correlation)
    for i in range(5):
        await dual_logger.log_dual_write(
            event_type=f"vibe.test.{i}",
            user_id=None,
            plug_id=plug_id,
            charter_message=f"V.I.B.E. test {i}",
            ledger_data={
                "internal_cost": 0.10,
                "customer_charge": 0.30,
                "margin_percent": 200.0,
                "provider_name": "TestProvider",
                "model_name": "test-model",
                "execution_time_ms": 50
            },
            quality_metrics={"vibe_index": i},
            phase="foster",
            status="approved"
        )
    
    # Validate integrity
    integrity = await dual_logger.validate_vibe_integrity()
    
    # With perfect dual-writes, should have 100% correlation
    assert integrity['matched_count'] >= 5, "Should have at least 5 matched entries"
    assert integrity['orphaned_charter'] == 0, "No orphaned Charter entries"
    assert integrity['orphaned_ledger'] == 0, "No orphaned Ledger entries"
    assert integrity['integrity_percent'] >= 99.7, "Should pass V.I.B.E. threshold"
    assert integrity['passes_vibe'] is True, "Should pass V.I.B.E. quality gate"


@pytest.mark.asyncio
async def test_validate_vibe_integrity_orphaned_detection(dual_logger, clean_test_data, test_plug_id_generator, db_pool):
    """
    Test V.I.B.E. integrity with orphaned records
    
    ACHEEVY: Validate orphaned record detection
    ACE Reflector: Error handling for data inconsistencies
    """
    plug_id = test_plug_id_generator()
    
    # Create normal dual-write
    await dual_logger.log_dual_write(
        event_type="normal.event",
        user_id=None,
        plug_id=plug_id,
        charter_message="Normal event",
        ledger_data={
            "internal_cost": 0.10,
            "customer_charge": 0.30,
            "margin_percent": 200.0,
            "provider_name": "TestProvider",
            "model_name": "test-model",
            "execution_time_ms": 50
        },
        quality_metrics={},
        phase="develop",
        status="completed"
    )
    
    # Manually create orphaned Charter entry (no corresponding Ledger)
    orphaned_correlation = str(uuid4())
    async with db_pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO charter_log (
                correlation_id, timestamp, user_id, plug_id,
                event_type, phase, status, message, quality_metrics, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """, orphaned_correlation, datetime.now(timezone.utc), None, plug_id,
            "orphaned.event", "test", "orphaned", "Orphaned charter entry", "{}", "{}")
    
    # Validate integrity (should detect orphan)
    integrity = await dual_logger.validate_vibe_integrity()
    
    assert integrity['orphaned_charter'] >= 1, "Should detect orphaned Charter entry"
    assert orphaned_correlation in integrity['orphaned_charter_ids'], "Should report orphaned correlation_id"
    assert integrity['integrity_percent'] < 100.0, "Integrity should be less than 100%"


# ============================================================================
# TEST SUITE 6: close() - Connection Pool Lifecycle (1 test)
# ============================================================================

@pytest.mark.asyncio
async def test_close_connection_pool(clean_test_data):
    """
    Test connection pool lifecycle management
    
    ACHEEVY: Validate resource cleanup (Bounded principle)
    SmelterOS: Verify graceful shutdown
    """
    db_url = os.getenv(
        "DATABASE_URL",
        "postgresql://deploy_admin:deploy_dev_password_secure_2025@localhost:5432/deploy_platform"
    )
    
    # Create pool and logger
    pool = await asyncpg.create_pool(db_url, min_size=1, max_size=2)
    logger = DualWriteLogger(pool)
    
    # Verify pool is operational
    plug_id = 90999
    await logger.log_dual_write(
        event_type="close.test",
        user_id=None,
        plug_id=plug_id,
        charter_message="Close test",
        ledger_data={
            "internal_cost": 0.01,
            "customer_charge": 0.03,
            "margin_percent": 200.0,
            "provider_name": "TestProvider",
            "model_name": "test-model",
            "execution_time_ms": 10
        },
        quality_metrics={},
        phase="test",
        status="testing"
    )
    
    # Close pool
    await logger.close()
    
    # Verify pool is closed (attempting operation should fail)
    with pytest.raises(Exception):  # asyncpg will raise error on closed pool
        await logger.log_dual_write(
            event_type="should.fail",
            user_id=None,
            plug_id=plug_id,
            charter_message="Should fail",
            ledger_data={},
            quality_metrics={},
            phase="test",
            status="testing"
        )
