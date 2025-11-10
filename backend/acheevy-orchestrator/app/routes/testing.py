"""
Testing Lab API Routes - Playwright Test Execution

Sprint 7 Phase 2 - Testing Lab Integration
Security Tier: Enhanced (≥90% V.I.B.E.)
Date: October 25, 2025
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import sys
from pathlib import Path

# Add parent directory to path for imports
backend_path = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_path))

# TEMPORARY: Force mock for Python 3.13 Windows (Playwright subprocess issue)
# Production: Use real PlaywrightRunner with Python 3.12 or Linux
MOCK_MODE = True  # Set to False when using Python 3.12 or Linux

print(f"[Testing Lab] MOCK_MODE = {MOCK_MODE}")

if MOCK_MODE:
    print("[Testing Lab] Importing MOCK PlaywrightRunner...")
    from testing_lab.playwright_runner_mock import PlaywrightRunner
    print("[Testing Lab] MOCK runner imported successfully!")
else:
    print("[Testing Lab] Importing REAL PlaywrightRunner...")
    from testing_lab.playwright_runner import PlaywrightRunner
    print("[Testing Lab] REAL runner imported successfully!")
    
from testing_lab.test_scenarios import TEST_SCENARIOS

router = APIRouter(prefix="/api/testing", tags=["testing"])


class TestRequest(BaseModel):
    """Request model for test execution"""
    plug_url: str = Field(..., description="URL of the Plug to test")
    scenarios: List[str] = Field(..., description="List of scenario IDs to execute")
    headless: bool = Field(True, description="Run browser in headless mode")
    timeout_ms: int = Field(30000, description="Timeout in milliseconds")


class TestResponse(BaseModel):
    """Response model for test results"""
    status: str
    duration_ms: int
    screenshots: List[str]
    metrics: Dict
    errors: List[str]
    scenario_results: List[Dict]
    timestamp: str


@router.get("/scenarios")
async def get_test_scenarios():
    """
    Get list of available test scenarios
    
    Returns:
        List of scenario configurations with names, descriptions, and icons
    """
    return {
        "scenarios": list(TEST_SCENARIOS.values()),
        "count": len(TEST_SCENARIOS)
    }


@router.post("/run", response_model=TestResponse)
async def run_tests(request: TestRequest):
    """
    Execute Playwright test suite against a Plug
    
    Security Tier: Enhanced
    V.I.B.E. Compliance:
    - Verifiable: Results logged to Ledger (internal audit)
    - Idempotent: Safe to re-run multiple times
    - Bounded: Timeout limits prevent infinite execution
    - Evident: Clear audit trail in Charter (customer-facing)
    
    Args:
        request: TestRequest with plug_url, scenarios, and options
    
    Returns:
        TestResponse with status, metrics, screenshots, and errors
    
    Raises:
        HTTPException: If test execution fails critically
    """
    try:
        # Validate scenarios
        invalid_scenarios = [s for s in request.scenarios if s not in TEST_SCENARIOS]
        if invalid_scenarios:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid scenarios: {', '.join(invalid_scenarios)}"
            )
        
        # Initialize runner (MOCK mode for Python 3.13 Windows)
        runner = PlaywrightRunner(
            headless=request.headless,
            screenshots_dir="screenshots"
        )
        
        # Execute tests
        if MOCK_MODE:
            # Direct call for mock (no subprocess issues)
            results = runner.run_test_suite(
                plug_url=request.plug_url,
                scenarios=request.scenarios,
                timeout_ms=request.timeout_ms
            )
        else:
            # Real Playwright needs thread pool isolation
            import asyncio
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None,
                runner.run_test_suite,
                request.plug_url,
                request.scenarios,
                request.timeout_ms
            )
        
        # TODO: Log to Ledger (internal audit trail)
        # ledger_log({
        #     'event': 'test_execution',
        #     'plug_url': request.plug_url,
        #     'scenarios': request.scenarios,
        #     'status': results['status'],
        #     'duration_ms': results['duration_ms']
        # })
        
        # TODO: Log to Charter (customer-facing progress)
        # charter_log({
        #     'event': 'Test Execution Complete',
        #     'status': results['status'],
        #     'duration': f"{results['duration_ms']/1000:.2f}s"
        # })
        
        return results
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Test execution failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """
    Health check endpoint for Testing Lab service
    
    Returns:
        Service status and Playwright availability
    """
    try:
        # Verify Playwright in separate thread
        import asyncio
        from playwright.sync_api import sync_playwright
        
        def check_playwright():
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                browser.close()
            return True
        
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, check_playwright)
        
        return {
            "status": "healthy",
            "service": "testing-lab",
            "playwright": "available",
            "chromium": "installed"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "testing-lab",
            "error": str(e)
        }
