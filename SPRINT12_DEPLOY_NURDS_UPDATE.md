# Deploy → Nurds Integration Update | Nov 11, 2025

## Scope and goals
- Integrate Workbench views, ACHEEVY orchestration endpoints, and Testing Lab into Nurds as modular features while preserving Nurds routing, Clerk auth, and deployment topology.
- Reuse Deploy security and logging primitives (V.I.B.E. validator, Charter/Ledger split) and Nothing Brand surfaces via scoped imports only.
- Enable "Export Plug Code" with a CI path that runs unit/e2e, V.I.B.E., and publishes a preview before merge to main.

## Integration architecture
- **UI layer**: Mount Workbench and Testing Lab as lazy-loaded routes under `/deploy/*` with a local Nothing Brand wrapper to prevent global CSS collisions.
- **Service layer**: Call Deploy Orchestrator (FastAPI) for run/test/export via a thin Node adapter; optionally proxy through Nurds API gateway to localize CORS and preserve stable origins.
- **Data layer**: Read/write shared Testing Lab artifacts (test_results, api_tests) against the existing Supabase project to keep history and RLS intact.
- **CI/CD**: Add a plug-build workflow that triggers V.I.B.E. validation, Playwright suite parity, and preview deploy, mirroring Deploy's pipeline pattern.

## Repository changes (proposed)
- `src/features/deploy-workbench`: Workbench shell, Monaco view, and "Export Plug Code" wired to exporter endpoint; styles wrapped with local Nothing Brand provider.
- `src/features/deploy-testing-lab`: Scenario selector, run panel, and results table; reads from Supabase views and calls the Deploy runner API.
- `src/server/deploy-adapter`: Typed client for Orchestrator routes (run, test, export) with request tracing and retry policy.
- `.github/workflows/plug-build.yml`: V.I.B.E. check, security scan, Playwright, preview publish, and PR notification.

## Environment contract (.env additions)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE` for shared Testing Lab data with RLS; service role restricted to server scope only.
- `DEPLOY_ORCHESTRATOR_URL` and `DEPLOY_ORCHESTRATOR_KEY` for FastAPI run/test/export; keys stored in CI secrets and server runtime only.
- `VIBE_THRESHOLD` default 0.90 to align with Deploy quality guardrails and CI gates.

## UI wiring
- **Routes**: Add `/deploy/workbench` and `/deploy/testing-lab` as dynamic, lazy bundles; use a scoped Nothing Brand provider (black/white/red) to avoid theme bleed.
- **Feature flags**: Wrap with `FeatureFlag deployEnabled` for dark launch per environment or tenant.
- **Export CTA**: Embed Monaco read-only code view and post export to `/api/deploy/export`, then stream pipeline status to a toast.

Example route stub:
```tsx
// src/pages/DeployWorkbench.jsx
import { WorkbenchShell } from '@/features/deploy-workbench/WorkbenchShell';

export default function DeployWorkbench() {
  return <WorkbenchShell onExport={exportPlug} />;
}
```

## Service adapter (Node examples)
- **Adapter**: Implement `src/server/deploy-adapter` with idempotent POST `/run`, `/test`, `/export`, including tracing headers for Charter/Ledger correlation across Nurds and Deploy.
- **Retry**: Use backoff (5 tries, 250–1500 ms jitter) to tolerate long-running Playwright jobs.

Adapter sketch:
```ts
import ky from 'ky';
import type { RunRequest, RunResponse } from './types';

const base = process.env.DEPLOY_ORCHESTRATOR_URL!;
const key = process.env.DEPLOY_ORCHESTRATOR_KEY!;

export async function runTests(payload: RunRequest) {
  const r = await ky.post(`${base}/api/testing/run`, {
    json: payload,
    headers: {
      'x-api-key': key,
      'x-trace-id': crypto.randomUUID()
    },
    retry: {
      limit: 5,
      methods: ['post'],
      backoffLimit: 1500
    }
  }).json<RunResponse>();
  return r;
}
```

## Data link (Supabase)
- **Connection**: Point Nurds to the shared Supabase project; consume views that expose Testing Lab history and API test configs to keep community results unified.
- **RLS**: Client reads via anon; server actions perform writes to ensure policy enforcement server-side.

## CI/CD pipeline
- **Workflow**: `.github/workflows/plug-build.yml` runs vibe_check with VIBE_THRESHOLD, OWASP/security scan, Playwright in a Docker service matching Deploy's Testing Lab stack, then publishes a preview and comments on the PR.

Pipeline sketch:
```yaml
name: plug-build
on:
  pull_request:
    paths:
      - 'src/features/deploy-**'
      - 'src/server/deploy-adapter/**'
      - 'scripts/**'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - name: V.I.B.E. check
        run: python scripts/vibe_check.py --threshold=${{ vars.VIBE_THRESHOLD || 0.90 }}
      - name: Playwright
        run: npm run test:e2e
      - name: Preview deploy
        run: npm run deploy:preview
      - name: PR status
        run: node scripts/notify_bamaram.js
```

## Cloudflare integration touchpoints
- **Workers**: Keep existing avatar Worker and add proxy routes if needed for Orchestrator; retain R2 and KV session caching for speed and cost.
- **Pages**: Host landing and feature routes on Pages where applicable, with API calls routed to Workers to minimize origin hops.
- **AI**: Preserve Workers AI usage patterns where moderation or lightweight classification is required on edge.

## Nothing Brand composition
- **Primitives**: Import Button, Card, Input into a local namespace `@nurds/nb` to avoid global theme overrides; limit use to Deploy routes and modals.
- **Patterns**: Apply diagonal stripe, dot matrix, and glass card patterns only within `/deploy` route boundaries and validate contrast on dark surfaces.

## Security and governance
- **Zero Trust**: Enforce OPA-style policy stubs on Deploy-bound routes at the Nurds API gateway (rate limits, auth scopes), mirroring Deploy's posture.
- **Charter/Ledger**: Charter messages user-facing; Ledger logs include model names, latency, and internal details with [Ledger] prefix, never exposed to users.
- **CI gates**: Fail on vibe_score below threshold, any critical security finding, or Playwright failures; manual override requires HITL approval note on the PR.

## Export Plug Code flow
- **Flow**: Workbench posts metadata and workspace bundle to `/api/deploy/export`; server scaffolds, commits to `plug/{slug}`, opens a PR, and attaches required checks.
- **UX**: On success, show preview URL and a "Run in Testing Lab" button that deep-links to `/deploy/testing-lab` preloaded with the plug.

## Rollout plan
- **Phase 1 (day 0–2)**: Land feature-flagged routes, env contracts, and server adapter behind `deployEnabled OFF`; merge with no user exposure.
- **Phase 2 (day 3–5)**: Enable on staging; wire to staging Supabase and Orchestrator; run 10 sample plugs and capture benchmarks and V.I.B.E. pass rates.
- **Phase 3 (day 6–9)**: Enable for one internal team in production; monitor error rate, PR pass rate, and average minutes to preview.

## Acceptance criteria
- `/deploy/workbench` and `/deploy/testing-lab` load under 2.0s p95 on staging with lazy bundles and prefetch disabled globally for these routes.
- "Export Plug Code" creates a branch, opens a PR, and passes V.I.B.E. + Playwright gates before a preview URL is posted to the PR within 10 minutes p95.
- Supabase queries respect RLS and show shared Testing Lab results identical to Deploy's for the same input URL set.

## Risk and mitigation
- **CSS collisions**: Isolate Nothing Brand styles in a local provider for Deploy routes; add visual regression in CI to catch bleed-through.
- **Long-running tests**: Stream Orchestrator status to UI; apply backoff and cap parallel runs to prevent CI queue starvation.
- **Data privacy**: Keep writes server-side and anon reads to public views; validate RLS in staging with a restricted test user.

## Business alignment
This is an additive module that preserves Nurds' stack while unlocking Deploy velocity and governance, matching the proven performance and cost profile in the current edge setup.

## Owner and timeline
- **Owner**: Nurds code lead with ACHEEVY support; UI pairs with Paint_Ang for styling and accessibility checks on dark surfaces.
- **Timeline**: 5–9 days across three phases with daily checkpoints on build minutes, pass rate, and incident logs in the Charter stream.

---

**Status**: Implementation in progress (Sprint 12)
**Last Updated**: November 11, 2025
