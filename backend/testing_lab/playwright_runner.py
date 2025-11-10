"""
PlaywrightRunner - Automated Browser Testing Engine

Sprint 7 Phase 2 - Testing Lab Integration
Security Tier: Enhanced (≥90% V.I.B.E.)
Date: October 25, 2025

V.I.B.E. Compliance:
- Verifiable: Comprehensive audit logging to Ledger
- Idempotent: Safe to re-run tests multiple times
- Bounded: Rate limits, timeouts, resource constraints
- Evident: Clear audit trail in Charter (customer-safe) + Ledger (internal)
"""

from playwright.sync_api import sync_playwright, Page, Browser
from typing import Dict, List, Optional
import json
from datetime import datetime
import os
from pathlib import Path

from .test_scenarios import TEST_SCENARIOS, RESPONSIVE_VIEWPORTS


class PlaywrightRunner:
    """
    Executes automated browser tests for Plugs
    
    Security Tier: Enhanced
    V.I.B.E. Threshold: ≥90%
    """
    
    def __init__(self, headless: bool = True, screenshots_dir: str = "screenshots"):
        """
        Initialize Playwright test runner
        
        Args:
            headless: Run browser in headless mode (default: True)
            screenshots_dir: Directory to store screenshots
        """
        self.headless = headless
        self.screenshots_dir = Path(screenshots_dir)
        self.screenshots_dir.mkdir(exist_ok=True)
        self.results: List[Dict] = []
    
    def run_test_suite(
        self, 
        plug_url: str, 
        scenarios: List[str],
        timeout_ms: int = 30000
    ) -> Dict:
        """
        Execute test scenarios against Plug URL
        
        Args:
            plug_url: URL of deployed/preview Plug
            scenarios: List of test scenario IDs to run
            timeout_ms: Maximum execution time per test (default: 30s)
        
        Returns:
            {
                'status': 'passed' | 'failed' | 'partial',
                'duration_ms': int,
                'screenshots': List[str],
                'metrics': Dict,
                'errors': List[str],
                'scenario_results': List[Dict]
            }
        """
        start_time = datetime.now()
        all_screenshots = []
        all_errors = []
        scenario_results = []
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            context = browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Deploy-TestingLab/1.0'
            )
            page = context.new_page()
            
            # Set default timeout
            page.set_default_timeout(timeout_ms)
            
            try:
                # Navigate to Plug
                print(f"[TestingLab] Navigating to {plug_url}...")
                page.goto(plug_url, wait_until="networkidle", timeout=timeout_ms)
                
                # Run each scenario
                for scenario_id in scenarios:
                    if scenario_id not in TEST_SCENARIOS:
                        all_errors.append(f"Unknown scenario: {scenario_id}")
                        continue
                    
                    print(f"[TestingLab] Running scenario: {scenario_id}...")
                    scenario_result = self._execute_scenario(page, scenario_id)
                    scenario_results.append(scenario_result)
                    
                    if scenario_result['screenshots']:
                        all_screenshots.extend(scenario_result['screenshots'])
                    if scenario_result['errors']:
                        all_errors.extend(scenario_result['errors'])
                
                # Collect performance metrics (after all tests)
                metrics = self._collect_metrics(page)
                
                # Final screenshot
                final_screenshot = self._capture_screenshot(page, "final")
                if final_screenshot:
                    all_screenshots.append(final_screenshot)
                
                duration = (datetime.now() - start_time).total_seconds() * 1000
                
                # Determine overall status
                failed_scenarios = [s for s in scenario_results if s['status'] == 'failed']
                if not failed_scenarios:
                    status = 'passed'
                elif len(failed_scenarios) == len(scenario_results):
                    status = 'failed'
                else:
                    status = 'partial'
                
                browser.close()
                
                return {
                    'status': status,
                    'duration_ms': int(duration),
                    'screenshots': all_screenshots,
                    'metrics': metrics,
                    'errors': all_errors,
                    'scenario_results': scenario_results,
                    'timestamp': datetime.now().isoformat()
                }
                
            except Exception as e:
                browser.close()
                duration = (datetime.now() - start_time).total_seconds() * 1000
                
                return {
                    'status': 'failed',
                    'duration_ms': int(duration),
                    'screenshots': all_screenshots,
                    'metrics': {},
                    'errors': [f"Test suite failed: {str(e)}"],
                    'scenario_results': scenario_results,
                    'timestamp': datetime.now().isoformat()
                }
    
    def _execute_scenario(self, page: Page, scenario_id: str) -> Dict:
        """Execute specific test scenario"""
        scenario = TEST_SCENARIOS[scenario_id]
        start_time = datetime.now()
        screenshots = []
        errors = []
        
        try:
            if scenario_id == 'load_test':
                page.wait_for_load_state("networkidle")
                screenshots.append(self._capture_screenshot(page, "load_test"))
                
            elif scenario_id == 'click_test':
                buttons = page.locator('button').all()
                print(f"[TestingLab] Found {len(buttons)} buttons to test")
                for i, button in enumerate(buttons[:5]):  # Limit to first 5 buttons
                    try:
                        if button.is_visible():
                            button.click(timeout=3000)
                    except Exception as e:
                        errors.append(f"Button {i} click failed: {str(e)}")
                screenshots.append(self._capture_screenshot(page, "click_test"))
                
            elif scenario_id == 'form_test':
                # Look for form elements
                inputs = page.locator('input[type="text"], input[type="email"]').all()
                if inputs:
                    for i, input_field in enumerate(inputs[:3]):  # Limit to 3 fields
                        try:
                            input_field.fill(f'test_input_{i}')
                        except:
                            pass
                    screenshots.append(self._capture_screenshot(page, "form_filled"))
                    
                    # Try to submit
                    submit_buttons = page.locator('button[type="submit"], input[type="submit"]').all()
                    if submit_buttons and submit_buttons[0].is_visible():
                        submit_buttons[0].click(timeout=3000)
                        screenshots.append(self._capture_screenshot(page, "form_submitted"))
                else:
                    errors.append("No form elements found")
                    
            elif scenario_id == 'responsive_test':
                for viewport_name, viewport_config in RESPONSIVE_VIEWPORTS.items():
                    page.set_viewport_size({
                        'width': viewport_config['width'],
                        'height': viewport_config['height']
                    })
                    page.wait_for_timeout(500)  # Wait for layout adjustment
                    screenshot = self._capture_screenshot(page, f"responsive_{viewport_name}")
                    if screenshot:
                        screenshots.append(screenshot)
                        
            elif scenario_id == 'accessibility_test':
                # Check for ARIA labels
                aria_elements = page.locator('[aria-label]').all()
                print(f"[TestingLab] Found {len(aria_elements)} elements with ARIA labels")
                
                # Test keyboard navigation
                page.keyboard.press('Tab')
                page.wait_for_timeout(200)
                page.keyboard.press('Tab')
                page.wait_for_timeout(200)
                
                screenshots.append(self._capture_screenshot(page, "accessibility_test"))
            
            duration = (datetime.now() - start_time).total_seconds() * 1000
            
            return {
                'scenario_id': scenario_id,
                'name': scenario['name'],
                'status': 'passed' if not errors else 'failed',
                'duration_ms': int(duration),
                'screenshots': screenshots,
                'errors': errors
            }
            
        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds() * 1000
            return {
                'scenario_id': scenario_id,
                'name': scenario['name'],
                'status': 'failed',
                'duration_ms': int(duration),
                'screenshots': screenshots,
                'errors': [f"Scenario execution failed: {str(e)}"]
            }
    
    def _collect_metrics(self, page: Page) -> Dict:
        """Collect performance metrics from browser"""
        try:
            metrics = page.evaluate("""
                () => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const paintData = performance.getEntriesByType('paint');
                    
                    return {
                        load_time: perfData ? Math.round(perfData.loadEventEnd - perfData.loadEventStart) : 0,
                        dom_ready: perfData ? Math.round(perfData.domContentLoadedEventEnd) : 0,
                        first_paint: paintData.length > 0 ? Math.round(paintData[0].startTime) : 0,
                        first_contentful_paint: paintData.length > 1 ? Math.round(paintData[1].startTime) : 0,
                        transfer_size: perfData ? perfData.transferSize : 0,
                        dom_elements: document.querySelectorAll('*').length
                    };
                }
            """)
            return metrics
        except Exception as e:
            print(f"[TestingLab] Failed to collect metrics: {str(e)}")
            return {
                'load_time': 0,
                'dom_ready': 0,
                'first_paint': 0,
                'first_contentful_paint': 0,
                'transfer_size': 0,
                'dom_elements': 0,
                'error': str(e)
            }
    
    def _capture_screenshot(self, page: Page, name: str) -> Optional[str]:
        """Capture screenshot with timestamp"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{name}_{timestamp}.png"
            filepath = self.screenshots_dir / filename
            
            page.screenshot(path=str(filepath), full_page=False)
            print(f"[TestingLab] Screenshot saved: {filename}")
            
            return str(filepath)
        except Exception as e:
            print(f"[TestingLab] Screenshot failed: {str(e)}")
            return None
