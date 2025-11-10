"""
Direct test of PlaywrightRunner without FastAPI
"""
import sys
sys.path.insert(0, r"C:\Users\moham\Documents\GitHub\DEPLOY\backend\acheevy-orchestrator")

from testing_lab.playwright_runner import PlaywrightRunner

if __name__ == "__main__":
    print("Testing PlaywrightRunner directly...")
    
    runner = PlaywrightRunner(headless=True, screenshots_dir="test_screenshots")
    
    results = runner.run_test_suite(
        plug_url="https://example.com",
        scenarios=["load_test"],
        timeout_ms=30000
    )
    
    print(f"\nStatus: {results['status']}")
    print(f"Duration: {results['duration_ms']}ms")
    print(f"Screenshots: {len(results['screenshots'])}")
    print(f"Errors: {results['errors']}")
    
    if results['metrics']:
        print(f"Load Time: {results['metrics'].get('load_time', 0)}ms")
        print(f"DOM Elements: {results['metrics'].get('dom_elements', 0)}")
    
    exit(0 if results['status'] == 'passed' else 1)
