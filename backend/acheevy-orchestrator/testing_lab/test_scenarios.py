"""
Test Scenarios Configuration - Testing Lab

Sprint 7 Phase 2 - Pre-built test templates
"""

TEST_SCENARIOS = {
    "load_test": {
        "id": "load_test",
        "name": "Load Performance Test",
        "description": "Measure page load time and First Contentful Paint",
        "icon": "⚡",
        "steps": [
            "Navigate to target URL",
            "Wait for page load",
            "Collect performance metrics",
            "Capture screenshot"
        ],
        "expected_duration_ms": 3000
    },
    "click_test": {
        "id": "click_test",
        "name": "Interactive Elements Test",
        "description": "Verify buttons and links are clickable",
        "icon": "🖱️",
        "steps": [
            "Navigate to target URL",
            "Find all clickable elements",
            "Test click interactions",
            "Verify responses"
        ],
        "expected_duration_ms": 5000
    },
    "form_test": {
        "id": "form_test",
        "name": "Form Submission Test",
        "description": "Test form input and submission handling",
        "icon": "📝",
        "steps": [
            "Navigate to target URL",
            "Locate form elements",
            "Fill form fields",
            "Submit and verify"
        ],
        "expected_duration_ms": 4000
    },
    "responsive_test": {
        "id": "responsive_test",
        "name": "Responsive Design Test",
        "description": "Test layout across mobile/tablet/desktop",
        "icon": "📱",
        "steps": [
            "Test mobile viewport (375px)",
            "Test tablet viewport (768px)",
            "Test desktop viewport (1920px)",
            "Capture screenshots"
        ],
        "expected_duration_ms": 8000
    },
    "accessibility_test": {
        "id": "accessibility_test",
        "name": "Accessibility Test",
        "description": "Check ARIA labels and keyboard navigation",
        "icon": "♿",
        "steps": [
            "Navigate to target URL",
            "Check ARIA labels",
            "Test keyboard navigation",
            "Verify contrast ratios"
        ],
        "expected_duration_ms": 6000
    }
}

RESPONSIVE_VIEWPORTS = {
    "mobile": {"width": 375, "height": 667},
    "tablet": {"width": 768, "height": 1024},
    "desktop": {"width": 1920, "height": 1080}
}

ACCESSIBILITY_CHECKS = {
    "aria_labels": True,
    "keyboard_navigation": True,
    "contrast_ratios": True,
    "alt_text": True
}
