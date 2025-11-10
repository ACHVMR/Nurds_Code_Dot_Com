"""
Start backend server for Testing Lab development
Disables Charter/Ledger database requirement
"""
import os
import sys
import asyncio
import uvicorn

# Fix for Windows + Python 3.13: Set event loop policy for subprocess support
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

# Disable Charter/Ledger to avoid database dependency
os.environ["CHARTER_LEDGER_ENABLED"] = "false"

print("\n" + "="*60)
print("🚀 ACHEEVY Backend - Testing Lab Mode")
print("="*60)
print("✅ Charter/Ledger: DISABLED (no database required)")
print("✅ Testing Lab API: /api/testing/*")
print("✅ Server URL: http://127.0.0.1:8002")
print("✅ Port 8002: Avoids Docker/WSL conflicts")
print("="*60 + "\n")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        log_level="info"
    )
