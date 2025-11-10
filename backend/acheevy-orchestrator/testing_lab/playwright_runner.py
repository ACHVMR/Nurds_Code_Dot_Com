"""
Playwright Runner - Browser Automation Engine

Sprint 7 Phase 2 - Core test execution engine
Uses sync API with asyncio.to_thread for FastAPI compatibility
"""

import os
import sys
import time
import asyncio
from datetime import datetime
from typing import Dict, List, Optional
from playwright.sync_api import sync_playwright, Page, Browser
from testing_lab.test_scenarios import TEST_SCENARIOS, RESPONSIVE_VIEWPORTS

# Fix for Windows + Python 3.13: Must set before any Playwright subprocess
if sys.platform == "win32":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    except:
        pass


class PlaywrightRunner:
    """
    Core Playwright automation engine for Testing Lab
    
    Executes browser-based tests against Plugs with:
    - Performance metrics collection
    - Screenshot capture
    - Multi-viewport testing
    - Accessibility validation
    """
    
    def __init__(self, headless: bool = True, screenshots_dir: str = "screenshots"):
        self.headless = headless
        self.screenshots_dir = screenshots_dir
        self.browser: Optional[Browser] = None
        
        # Create screenshots directory if it doesn't exist
        os.makedirs(self.screenshots_dir, exist_ok=True)
    
    def run_test_suite(
        self,
        plug_url: str,
        scenarios: List[str],
        timeout_ms: int = 30000
    ) -> Dict:
        """
        Execute a suite of test scenarios against a Plug
        
        Args:
            plug_url: Target URL to test
            scenarios: List of scenario IDs to execute
            timeout_ms: Maximum time per scenario
            
        Returns:
            Dict with test results, metrics, screenshots, errors
        """
        start_time = time.time()
        results = {
            "status": "passed",
            "duration_ms": 0,
            "screenshots": [],
            "metrics": {},
            "errors": [],
            "scenario_results": [],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        try:
            with sync_playwright() as p:
                # Launch browser
                self.browser = p.chromium.launch(headless=self.headless)
                page = self.browser.new_page()
                page.set_default_timeout(timeout_ms)
                
                # Execute each scenario
                for scenario_id in scenarios:
                    if scenario_id not in TEST_SCENARIOS:
                        results["errors"].append(f"Unknown scenario: {scenario_id}")
                        results["status"] = "partial"
                        continue
                    
                    scenario_result = self._execute_scenario(page, scenario_id, plug_url)
                    results["scenario_results"].append(scenario_result)
                    
                    # Collect screenshots
                    results["screenshots"].extend(scenario_result.get("screenshots", []))
                    
                    # Track errors
                    if scenario_result.get("errors"):
                        results["errors"].extend(scenario_result["errors"])
                        results["status"] = "partial" if results["status"] == "passed" else "failed"
                
                # Collect overall metrics from last page state
                results["metrics"] = self._collect_metrics(page)
                
                # Close browser
                self.browser.close()
        
        except Exception as e:
            import traceback
            error_msg = str(e) if str(e) else f"{type(e).__name__} (no message)"
            stack_trace = traceback.format_exc()
            results["status"] = "failed"
            results["errors"].append(f"Test suite execution failed: {error_msg}")
            results["errors"].append(f"Stack trace: {stack_trace}")
        
        finally:
            results["duration_ms"] = int((time.time() - start_time) * 1000)
        
        return results
    
    def _execute_scenario(self, page: Page, scenario_id: str, plug_url: str) -> Dict:
        """Execute a single test scenario"""
        scenario = TEST_SCENARIOS[scenario_id]
        start_time = time.time()
        
        result = {
            "scenario_id": scenario_id,
            "name": scenario["name"],
            "status": "passed",
            "duration_ms": 0,
            "screenshots": [],
            "errors": []
        }
        
        try:
            if scenario_id == "load_test":
                # Navigate and measure load performance
                page.goto(plug_url, wait_until="networkidle")
                screenshot_path = self._capture_screenshot(page, f"{scenario_id}_main")
                result["screenshots"].append(screenshot_path)
            
            elif scenario_id == "click_test":
                # Test interactive elements
                page.goto(plug_url, wait_until="networkidle")
                buttons = page.locator("button").all()
                if buttons:
                    buttons[0].click()
                    screenshot_path = self._capture_screenshot(page, f"{scenario_id}_clicked")
                    result["screenshots"].append(screenshot_path)
            
            elif scenario_id == "form_test":
                # Test form interactions
                page.goto(plug_url, wait_until="networkidle")
                inputs = page.locator("input[type='text'], input[type='email']").all()
                if inputs:
                    inputs[0].fill("test@example.com")
                    screenshot_path = self._capture_screenshot(page, f"{scenario_id}_filled")
                    result["screenshots"].append(screenshot_path)
            
            elif scenario_id == "responsive_test":
                # Test multiple viewports
                for viewport_name, viewport_size in RESPONSIVE_VIEWPORTS.items():
                    page.set_viewport_size(viewport_size)
                    page.goto(plug_url, wait_until="networkidle")
                    screenshot_path = self._capture_screenshot(page, f"{scenario_id}_{viewport_name}")
                    result["screenshots"].append(screenshot_path)
            
            elif scenario_id == "accessibility_test":
                # Test accessibility features
                page.goto(plug_url, wait_until="networkidle")
                
                # Check for ARIA labels
                aria_elements = page.locator("[aria-label]").count()
                if aria_elements == 0:
                    result["errors"].append("No ARIA labels found")
                
                screenshot_path = self._capture_screenshot(page, f"{scenario_id}_main")
                result["screenshots"].append(screenshot_path)
        
        except Exception as e:
            result["status"] = "failed"
            result["errors"].append(f"Scenario execution failed: {str(e)}")
        
        finally:
            result["duration_ms"] = int((time.time() - start_time) * 1000)
        
        return result
    
    def _collect_metrics(self, page: Page) -> Dict:
        """Collect performance metrics from the page"""
        try:
            metrics = page.evaluate("""
                () => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const paintData = performance.getEntriesByType('paint');
                    
                    return {
                        load_time: perfData ? perfData.loadEventEnd - perfData.fetchStart : 0,
                        dom_ready: perfData ? perfData.domContentLoadedEventEnd - perfData.fetchStart : 0,
                        first_paint: paintData.find(p => p.name === 'first-paint')?.startTime || 0,
                        first_contentful_paint: paintData.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                        transfer_size: perfData ? perfData.transferSize : 0,
                        dom_elements: document.querySelectorAll('*').length
                    };
                }
            """)
            return metrics
        except Exception as e:
            return {
                "load_time": 0,
                "dom_ready": 0,
                "first_paint": 0,
                "first_contentful_paint": 0,
                "transfer_size": 0,
                "dom_elements": 0
            }
    
    def _capture_screenshot(self, page: Page, name: str) -> str:
        """Capture and save a screenshot"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{name}_{timestamp}.png"
        filepath = os.path.join(self.screenshots_dir, filename)
        page.screenshot(path=filepath, full_page=True)
        return filepath
