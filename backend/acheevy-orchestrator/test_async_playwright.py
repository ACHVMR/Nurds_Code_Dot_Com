"""
Quick test to verify async Playwright works
"""
import asyncio
from playwright.async_api import async_playwright


async def test_playwright():
    """Test basic Playwright async functionality"""
    try:
        print("Starting Playwright test...")
        async with async_playwright() as p:
            print("Launching Chromium...")
            browser = await p.chromium.launch(headless=True)
            print("Creating page...")
            page = await browser.new_page()
            print("Navigating to example.com...")
            await page.goto("https://example.com")
            print("Getting title...")
            title = await page.title()
            print(f"✅ Page title: {title}")
            await browser.close()
            print("✅ Test completed successfully!")
            return True
    except Exception as e:
        print(f"❌ Error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    result = asyncio.run(test_playwright())
    exit(0 if result else 1)
