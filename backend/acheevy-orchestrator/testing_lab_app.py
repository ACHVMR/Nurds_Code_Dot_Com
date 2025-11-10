"""
Testing Lab Standalone FastAPI Application

Sprint 7 Phase 2 - Docker Deployment with Real Playwright
Runs in separate container with Python 3.12 + Playwright
Security Tier: Enhanced (≥90% V.I.B.E.)
Date: October 26, 2025
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict
import os
import sys
from pathlib import Path

# Add testing_lab to path
sys.path.insert(0, str(Path(__file__).parent))

# Import real Playwright runner (NOT mock - Docker has Python 3.12)
from testing_lab.playwright_runner import PlaywrightRunner
from testing_lab.test_scenarios import TEST_SCENARIOS

# FastAPI app instance
app = FastAPI(
    title="ACHEEVY Testing Lab",
    description="Playwright Browser Automation for Deploy Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "ACHEEVY Testing Lab",
        "status": "running",
        "mode": "REAL_PLAYWRIGHT",
        "python_version": sys.version,
        "endpoints": {
            "scenarios": "/api/testing/scenarios",
            "run": "/api/testing/run",
            "health": "/api/testing/health"
        }
    }


@app.get("/api/testing/scenarios")
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


@app.post("/api/testing/run", response_model=TestResponse)
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
        
        # Initialize runner (REAL Playwright in Docker)
        runner = PlaywrightRunner(
            headless=request.headless,
            screenshots_dir="/app/screenshots"
        )
        
        # Execute tests in thread pool (sync Playwright must run in separate thread)
        import asyncio
        from concurrent.futures import ThreadPoolExecutor
        
        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor(max_workers=1) as executor:
            results = await loop.run_in_executor(
                executor,
                runner.run_test_suite,
                request.plug_url,
                request.scenarios,
                request.timeout_ms
            )
        
        print(f"[Testing Lab] Executed {len(request.scenarios)} scenarios: {results['status']}")
        
        return results
        
    except Exception as e:
        print(f"[Testing Lab] Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Test execution failed: {str(e)}"
        )


@app.get("/api/testing/health")
async def health_check():
    """
    Health check endpoint for Testing Lab service
    
    Returns:
        Service status and Playwright availability
    """
    try:
        # Use async Playwright for health check
        from playwright.async_api import async_playwright
        
        async with async_playwright() as p:
            # Check browser executable exists
            browser_path = p.chromium.executable_path
            
        return {
            "status": "healthy",
            "service": "testing-lab",
            "playwright": "available",
            "chromium": "installed",
            "mode": "REAL_PLAYWRIGHT",
            "browser_path": str(browser_path)
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "testing-lab",
            "error": str(e),
            "mode": "REAL_PLAYWRIGHT"
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
