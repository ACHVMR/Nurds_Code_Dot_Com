"""
Pre-built test scenarios for common Plug testing patterns

Sprint 7 Phase 2 - Testing Lab Integration
Date: October 25, 2025
"""

TEST_SCENARIOS = {
    'load_test': {
        'id': 'load_test',
        'name': 'Load Performance Test',
        'description': 'Measure page load time and First Contentful Paint',
        'icon': '⚡',
        'steps': [
            'navigate_to_url',
            'wait_for_networkidle',
            'collect_performance_metrics'
        ],
        'expected_duration_ms': 3000
    },
    'click_test': {
        'id': 'click_test',
        'name': 'Interactive Elements Test',
        'description': 'Verify buttons and links are clickable',
        'icon': '🖱️',
        'steps': [
            'find_all_buttons',
            'click_each_button',
            'verify_no_errors'
        ],
        'expected_duration_ms': 5000
    },
    'form_test': {
        'id': 'form_test',
        'name': 'Form Submission Test',
        'description': 'Test form input and submission handling',
        'icon': '📝',
        'steps': [
            'fill_form_fields',
            'submit_form',
            'verify_success_message'
        ],
        'expected_duration_ms': 4000
    },
    'responsive_test': {
        'id': 'responsive_test',
        'name': 'Responsive Design Test',
        'description': 'Test layout across mobile/tablet/desktop',
        'icon': '📱',
        'steps': [
            'set_viewport_mobile',
            'capture_screenshot',
            'set_viewport_tablet',
            'capture_screenshot',
            'set_viewport_desktop',
            'capture_screenshot'
        ],
        'expected_duration_ms': 6000
    },
    'accessibility_test': {
        'id': 'accessibility_test',
        'name': 'Accessibility Test',
        'description': 'Check ARIA labels and keyboard navigation',
        'icon': '♿',
        'steps': [
            'scan_for_aria_labels',
            'test_keyboard_navigation',
            'verify_contrast_ratios'
        ],
        'expected_duration_ms': 5000
    }
}

# Viewport configurations for responsive testing
RESPONSIVE_VIEWPORTS = {
    'mobile': {'width': 375, 'height': 667, 'name': 'Mobile (iPhone SE)'},
    'tablet': {'width': 768, 'height': 1024, 'name': 'Tablet (iPad)'},
    'desktop': {'width': 1920, 'height': 1080, 'name': 'Desktop (FHD)'}
}

# Accessibility criteria
ACCESSIBILITY_CHECKS = {
    'aria_labels': 'Verify all interactive elements have ARIA labels',
    'keyboard_navigation': 'Ensure tab navigation works correctly',
    'contrast_ratios': 'Check color contrast meets WCAG AA standards',
    'alt_text': 'Validate all images have alt text'
}
