
# Security & Secrets Hygiene

**CRITICAL:** Do NOT commit secrets to this repository.

## Secret Management
1. **Cloudflare Workers:** Use `wrangler secret put <KEY_NAME>`
   - `OPENAI_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AGENT_RUNTIME_SHARED_SECRET`
2. **Cloud Run (Agent Runtime):** Use Google Cloud Secret Manager or Environment Variables in the Console.
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AGENT_RUNTIME_SHARED_SECRET`
3. **Supabase:** Managed via Supabase Dashboard.

## Immediate Action Required
If you have pasted any API keys into a Chat context or committed them to git history:
1. **Revoke/Rotate the key immediately** at the provider dashboard (OpenAI, Supabase, etc.).
2. Update the secret in the secure storage (Wrangler/GCP).

## Local Development
- Use `.dev.vars` for local Wrangler development (do not commit).
- Use `cloudrun.env.local` (do not commit) for local Docker testing.
