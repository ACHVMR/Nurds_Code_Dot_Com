"""
Playwright worker process - runs in separate process to avoid asyncio conflicts
"""
import sys
sys.path.insert(0, r"C:\Users\moham\Documents\GitHub\DEPLOY\backend\acheevy-orchestrator")

from testing_lab.playwright_runner import PlaywrightRunner
import json


def run_tests(plug_url: str, scenarios: list, headless: bool, timeout_ms: int) -> dict:
    """Run tests in isolated process"""
    runner = PlaywrightRunner(headless=headless, screenshots_dir="screenshots")
    return runner.run_test_suite(plug_url, scenarios, timeout_ms)


if __name__ == "__main__":
    # Read args from stdin
    import_data = json.loads(sys.stdin.read())
    
    result = run_tests(
        plug_url=import_data["plug_url"],
        scenarios=import_data["scenarios"],
        headless=import_data["headless"],
        timeout_ms=import_data["timeout_ms"]
    )
    
    # Write result to stdout
    print(json.dumps(result))
