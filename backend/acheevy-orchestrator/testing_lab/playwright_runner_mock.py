"""
MOCK Playwright Runner for Python 3.13 Windows Development
Real implementation requires Python 3.12 or Linux

This mock returns realistic test data for UI development and demonstration.
"""
import os
import time
from datetime import datetime
from typing import Dict, List
import random


class PlaywrightRunner:
    """
    MOCK Playwright automation for Testing Lab (Python 3.13 Windows)
    
    Returns realistic fake data for development/demonstration.
    Production deployment requires Python 3.12 or Linux environment.
    """
    
    def __init__(self, headless: bool = True, screenshots_dir: str = "screenshots"):
        self.headless = headless
        self.screenshots_dir = screenshots_dir
        os.makedirs(self.screenshots_dir, exist_ok=True)
    
    def run_test_suite(self, plug_url: str, scenarios: List[str], timeout_ms: int = 30000) -> Dict:
        """
        MOCK: Execute test scenarios (returns fake data)
        """
        start_time = time.time()
        
        # Simulate test execution time
        time.sleep(random.uniform(1.5, 3.5))
        
        results = {
            "status": "passed",
            "duration_ms": 0,
            "screenshots": [],
            "metrics": {
                "load_time": random.randint(800, 2500),
                "dom_ready": random.randint(600, 2000),
                "first_paint": random.randint(300, 800),
                "first_contentful_paint": random.randint(400, 1200),
                "transfer_size": random.randint(50000, 500000),
                "dom_elements": random.randint(50, 300)
            },
            "errors": [],
            "scenario_results": [],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Generate fake scenario results
        for scenario_id in scenarios:
            scenario_result = {
                "scenario_id": scenario_id,
                "name": self._get_scenario_name(scenario_id),
                "status": "passed" if random.random() > 0.1 else "failed",
                "duration_ms": random.randint(500, 2000),
                "screenshots": [f"screenshots/mock_{scenario_id}_{int(time.time())}.png"],
                "errors": [] if random.random() > 0.2 else [f"Mock error in {scenario_id}"]
            }
            results["scenario_results"].append(scenario_result)
            
            if scenario_result["status"] == "failed":
                results["status"] = "partial"
                results["errors"].append(f"{scenario_result['name']}: {scenario_result['errors'][0]}")
        
        results["duration_ms"] = int((time.time() - start_time) * 1000)
        
        return results
    
    def _get_scenario_name(self, scenario_id: str) -> str:
        names = {
            "load_test": "Load Performance Test",
            "click_test": "Interactive Elements Test",
            "form_test": "Form Submission Test",
            "responsive_test": "Responsive Design Test",
            "accessibility_test": "Accessibility Test"
        }
        return names.get(scenario_id, scenario_id)
