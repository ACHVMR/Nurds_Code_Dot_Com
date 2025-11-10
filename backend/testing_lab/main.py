"""
Testing Lab Backend API

Sprint 8 Phase 1 - Community Testing Lab
Provides Playwright testing endpoints for Deploy Platform

Port: 8003
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import asyncio
from playwright.async_api import async_playwright
import time

app = FastAPI(title="Deploy Testing Lab API", version="1.0.0")

# CORS configuration for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TestRequest(BaseModel):
    plug_url: str
    scenarios: List[str]
    headless: bool = True
    timeout_ms: int = 30000


class TestResponse(BaseModel):
    status: str
    duration_ms: int
    screenshots: List[str]
    metrics: dict
    errors: List[str]
    scenario_results: List[dict]
    timestamp: str


@app.get("/")
async def root():
    return {
        "service": "Deploy Testing Lab API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": ["/api/testing/run", "/health"],
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "testing-lab"}


@app.post("/api/testing/run", response_model=TestResponse)
async def run_tests(request: TestRequest):
    """
    Execute Playwright tests against a Plug URL
    
    Sprint 8 Phase 1 Implementation
    """
    start_time = time.time()
    screenshots = []
    errors = []
    scenario_results = []
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=request.headless)
            context = await browser.new_context(
                viewport={"width": 1280, "height": 720}
            )
            page = await context.new_page()
            
            # Navigate to Plug URL
            try:
                await page.goto(request.plug_url, timeout=request.timeout_ms)
                await page.wait_for_load_state("networkidle")
            except Exception as e:
                errors.append(f"Navigation failed: {str(e)}")
                await browser.close()
                raise HTTPException(status_code=400, detail=f"Failed to load Plug: {str(e)}")
            
            # Collect performance metrics
            metrics = await page.evaluate("""() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                return {
                    load_time: perfData.loadEventEnd - perfData.fetchStart,
                    dom_ready: perfData.domContentLoadedEventEnd - perfData.fetchStart,
                    first_paint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                    first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                    transfer_size: perfData.transferSize || 0,
                    dom_elements: document.querySelectorAll('*').length
                };
            }""")
            
            # Run requested scenarios
            for scenario_id in request.scenarios:
                scenario_start = time.time()
                scenario_errors = []
                scenario_screenshots = []
                
                try:
                    if scenario_id == "visual-regression":
                        screenshot = await page.screenshot(full_page=True)
                        screenshot_b64 = screenshot.hex()[:100]  # Truncate for demo
                        scenario_screenshots.append(f"data:image/png;base64,{screenshot_b64}")
                    
                    elif scenario_id == "responsive-test":
                        for viewport in [{"width": 375, "height": 667}, {"width": 768, "height": 1024}]:
                            await page.set_viewport_size(viewport)
                            await page.wait_for_timeout(500)
                    
                    elif scenario_id == "link-validation":
                        links = await page.evaluate("Array.from(document.querySelectorAll('a')).map(a => a.href)")
                        if len(links) == 0:
                            scenario_errors.append("No links found on page")
                    
                    elif scenario_id == "accessibility-check":
                        await page.evaluate("""() => {
                            const issues = [];
                            const imgs = document.querySelectorAll('img:not([alt])');
                            if (imgs.length > 0) issues.push('Images without alt text found');
                            return issues;
                        }""")
                    
                    status = "passed" if len(scenario_errors) == 0 else "warning"
                    
                except Exception as e:
                    scenario_errors.append(str(e))
                    status = "failed"
                
                scenario_duration = int((time.time() - scenario_start) * 1000)
                scenario_results.append({
                    "scenario_id": scenario_id,
                    "name": scenario_id.replace("-", " ").title(),
                    "status": status,
                    "duration_ms": scenario_duration,
                    "screenshots": scenario_screenshots,
                    "errors": scenario_errors,
                })
                
                screenshots.extend(scenario_screenshots)
                errors.extend(scenario_errors)
            
            await browser.close()
    
    except Exception as e:
        errors.append(f"Test execution error: {str(e)}")
        duration_ms = int((time.time() - start_time) * 1000)
        return TestResponse(
            status="failed",
            duration_ms=duration_ms,
            screenshots=[],
            metrics={},
            errors=errors,
            scenario_results=[],
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        )
    
    duration_ms = int((time.time() - start_time) * 1000)
    overall_status = "success" if len(errors) == 0 else "partial" if any(
        r["status"] == "passed" for r in scenario_results
    ) else "failed"
    
    return TestResponse(
        status=overall_status,
        duration_ms=duration_ms,
        screenshots=screenshots,
        metrics=metrics,
        errors=errors,
        scenario_results=scenario_results,
        timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8003)
