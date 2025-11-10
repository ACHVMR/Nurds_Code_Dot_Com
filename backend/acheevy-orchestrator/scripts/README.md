# Scripts Directory

**Purpose**: Helper scripts, mock runners, and utilities that are NOT unit tests.

## Guidelines

- ✅ **DO** place one-off helpers, data generators, and demo scripts here
- ✅ **DO** name files descriptively (e.g., `mock_runner.py`, `seed_database.py`)
- ❌ **DON'T** start filenames with `test_` (reserved for real pytest tests)
- ❌ **DON'T** place actual unit tests here (use `/tests` directory instead)

## Current Scripts

- `mock_runner.py` - Demonstration script for PlaywrightRunner mock interface
- `start_testing_lab_mock.py` - Mock version of testing lab startup

## Pytest Configuration

This directory is excluded from pytest collection via `norecursedirs` in `pytest.ini`.
No files here will be collected as tests, preventing collection errors.

## Adding New Scripts

1. Create file with descriptive name (avoid `test_` prefix)
2. No need to update pytest config - directory is already excluded
3. Document purpose in this README if it's a key utility

---

**Sprint 8 Phase 2**: Permanent solution to prevent non-test files from breaking CI/CD.
