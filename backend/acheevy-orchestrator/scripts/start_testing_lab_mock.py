"""
Fresh start for Testing Lab with forced mock mode
"""
import os
import sys

# Fix Windows asyncio (though we're using mock anyway)
import asyncio
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

# Disable Charter/Ledger
os.environ["CHARTER_LEDGER_ENABLED"] = "false"

# Force clean import by clearing any cached modules
if 'testing_lab.playwright_runner' in sys.modules:
    del sys.modules['testing_lab.playwright_runner']
if 'app.routes.testing' in sys.modules:
    del sys.modules['app.routes.testing']

print("\n" + "="*60)
print("🎭 ACHEEVY Backend - Testing Lab (MOCK MODE)")
print("="*60)
print("✅ Charter/Ledger: DISABLED")
print("✅ Playwright: MOCK (Python 3.13 workaround)")
print("✅ Testing Lab API: /api/testing/*")
print("✅ Server URL: http://127.0.0.1:8002")
print("="*60 + "\n")

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8003,  # Different port to avoid conflicts
        reload=False,  # Disable reload to prevent cache issues
        log_level="info"
    )
