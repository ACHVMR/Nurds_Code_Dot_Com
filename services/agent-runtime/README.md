
# Agent Runtime Service

This service acts as the "muscle" for the Nurds Code platform, executing build tasks, file operations, and tests in a containerized environment (Cloud Run).

## Purpose
- Execute code generation jobs.
- Run test suites (nurds-test-runner).
- Handle file system operations that need isolation.

## Required Environment Variables
These variables must be set in the Cloud Run environment configuration. DO NOT commit values here.

- `PORT` (default: 8080)
- `SUPABASE_PROJECT_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (Server-side only)
- `AGENT_RUNTIME_SHARED_SECRET` (Shared secret for authenticating requests from Cloudflare)

## Optional Environment Variables
- `MODAL_API_KEY`
- `OPENAI_API_KEY` (if direct access needed, though usually routed via Cloudflare)
