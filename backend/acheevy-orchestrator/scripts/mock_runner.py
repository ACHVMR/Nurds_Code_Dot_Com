from testing_lab.playwright_runner_mock import PlaywrightRunner

runner = PlaywrightRunner()
result = runner.run_test_suite('http://example.com', ['load_test'], 30000)
print(f'✅ Mock Status: {result["status"]}')
print(f'Load Time: {result["metrics"]["load_time"]}ms')
print(f'DOM Elements: {result["metrics"]["dom_elements"]}')
