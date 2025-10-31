# Deploy Platform - Supabase Multi-Tenant Setup Guide

## 🎯 Overview

This guide walks through setting up the Supabase multi-tenant database for the Nurds Code Deploy platform. The architecture supports:

- **Multi-tenant isolation** with RLS policies
- **Clerk authentication** integration  
- **Boomer_Angs agent naming** system
- **Circuit breaker** service monitoring
- **Usage tracking** and billing

## 📦 Prerequisites

- Supabase account and project
- PostgreSQL 15+ (comes with Supabase)
- Supabase CLI installed: `npm install -g supabase`

## 🚀 Quick Start

### Step 1: Set up Supabase project

```bash
# Login to Supabase
npx supabase login

# Link to your existing project (or create new)
npx supabase link --project-ref <your-project-ref>

# Or initialize new project
npx supabase init
```

### Step 2: Run migrations

```bash
# Apply all migrations in order
npx supabase db push

# Or apply individually
psql $SUPABASE_URL -f supabase/migrations/0001_init.sql
psql $SUPABASE_URL -f supabase/migrations/0002_policies.sql
```

### Step 3: Configure environment variables

Update your `.env` file:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Update `wrangler.toml`:

```toml
[vars]
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_ANON_KEY = "your-anon-key"

# Set service role key as secret
# wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

### Step 4: Test provisioning

```bash
# Start worker locally
npm run worker:dev

# Test user provisioning
curl -X POST http://localhost:8787/api/provision \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user_2abc123xyz",
    "email": "test@example.com",
    "tier": "lite"
  }'
```

## 📊 Database Schema Overview

### Tables Created

1. **tenants** - Tenant/organization isolation
2. **users** - User accounts linked to Clerk
3. **plugs** - User-created applications/projects
4. **builds** - Build history and tracking
5. **usage_logs** - Token and API usage
6. **subscriptions** - Stripe subscription records
7. **agents** - Boomer_Angs agent instances
8. **circuit_breakers** - Service health monitoring

### Key Features

**Multi-Tenant Isolation:**
```sql
-- Each user gets isolated schema
select create_user_schema('user_uuid');
-- Creates schema: tenant_user_uuid
```

**Row Level Security (RLS):**
- Users can only access their own data
- Automatic enforcement via PostgreSQL RLS
- No application-level filtering needed

**Usage Tracking:**
```sql
-- Log usage automatically calculates cost
select log_usage(
  uid := 'user_uuid',
  pid := 'plug_uuid', 
  service_type := 'llm',
  tokens := 15000,
  metadata_json := '{"model": "gpt-4"}'::jsonb
);
```

**Tier Management:**
```sql
-- Get user's tier
select get_user_tier('user_uuid');

-- Check if user can create more plugs
select can_create_plug('user_uuid');

-- Get remaining credits
select get_user_credits('user_uuid');
```

## 🔐 Security Configuration

### Service Role Key (Required)

The service role key bypasses RLS for admin operations:

```bash
# Set in Wrangler for production
wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# Or set locally in .env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ CRITICAL:** Never expose service role key in client code!

- Frontend uses **ANON_KEY** (public, RLS-protected)
- Workers use **SERVICE_ROLE_KEY** (private, bypasses RLS)

### RLS Policy Examples

```sql
-- Users can only read their own profile
create policy "Users can read own profile"
  on users for select
  using (auth.uid()::uuid = id);

-- Users can only manage their own plugs
create policy "Users can manage own plugs"
  on plugs for all
  using (auth.uid()::uuid = owner);
```

## 🎨 Boomer_Angs Naming Convention

Every agent follows the `[UserPrefix]_Ang` naming pattern:

```typescript
import { BoomerAngNamingCeremony } from './src/worker/agent-utils';

// Generate agent name
const agentName = BoomerAngNamingCeremony.generateName('CustomerSupport');
// Result: "CustomerSupport_Ang"

// Validate format
BoomerAngNamingCeremony.isValid('InvoiceBot_Ang'); // true
BoomerAngNamingCeremony.isValid('invoice-bot'); // false

// Extract prefix
BoomerAngNamingCeremony.extractPrefix('SalesAssistant_Ang');
// Result: "SalesAssistant"
```

### Creating Agents

```bash
curl -X POST http://localhost:8787/api/agents/create \
  -H "Authorization: Bearer $CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "userPrefix": "DataAnalyzer",
    "type": "workflow",
    "framework": "auto"
  }'
```

Response:
```json
{
  "id": "uuid",
  "agentName": "DataAnalyzer_Ang",
  "framework": "crewai",
  "status": "active",
  "certificate": "..."
}
```

## ⚡ Circuit Breaker System

Monitor and control all platform services:

### Viewing Circuit Status

```bash
# Admin endpoint (requires superadmin)
curl http://localhost:8787/api/admin/circuit-box \
  -H "Authorization: Bearer $ADMIN_JWT"
```

### Toggling Services

```bash
# Turn service OFF
curl -X PATCH http://localhost:8787/api/admin/circuit-box/breaker-6 \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"status": "off"}'

# Turn service ON
curl -X PATCH http://localhost:8787/api/admin/circuit-box/breaker-6 \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"status": "on"}'
```

### Available Breakers

- **breaker-1**: Cloudflare Workers API
- **breaker-2**: Clerk Authentication
- **breaker-3**: Supabase Database
- **breaker-5**: LLM Gateway
- **breaker-6**: GPT-5 Feature Flag
- **breaker-10**: Voice Integration
- **breaker-15**: Multi-Agent Builder Kit
- **breaker-20**: Stripe Integration
- **breaker-30**: Superadmin RBAC
- **breaker-35**: Code Editor

## 📈 Usage Tracking & Billing

### Automatic Cost Calculation

```typescript
// Log LLM usage
await supabase.rpc('log_usage', {
  uid: 'user_uuid',
  pid: 'plug_uuid',
  service_type: 'llm',
  tokens: 15000,
  metadata_json: { model: 'gpt-4', prompt_tokens: 10000, completion_tokens: 5000 }
});

// Cost automatically calculated:
// 15,000 tokens × $0.00006 = $0.90
```

### Tier Allocations

| Tier | Monthly Tokens | Monthly Cost | Build Capacity |
|------|----------------|--------------|----------------|
| Free | 0 | $0 | 0 plugs |
| Coffee | 25,000 | $7 | 0.3 plugs |
| Lite | 200,000 | $19.99 | 3 plugs |
| Medium | 600,000 | $79.99 | 8 plugs |
| Heavy | 1,500,000 | $149.99 | 20 plugs |
| Superior | 1,500,000 | $299.99 | 20+ plugs |

### Checking Remaining Credits

```sql
select get_user_credits('user_uuid');
-- Returns: 185000 (remaining tokens)
```

## 🔄 User Provisioning Flow

### Automatic Provisioning (Recommended)

Set up Clerk webhook to call `/api/provision` on signup:

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://api.nurdscode.com/api/provision`
3. Subscribe to: `user.created`
4. Clerk will automatically provision on signup

### Manual Provisioning

```typescript
import { provisionUser } from './src/worker/provision';

const result = await provisionUser(
  { id: 'user_uuid', email: 'user@example.com', tier: 'lite' },
  env
);

// Returns:
// - tenant: Isolated tenant record
// - user: User account with tier
// - plug: Welcome plug (auto-generated)
```

## 🧪 Testing & Validation

### Test Migrations

```bash
# Check migration status
npx supabase db diff

# Test locally
npx supabase start
psql postgresql://postgres:postgres@localhost:54322/postgres \
  -f supabase/migrations/0001_init.sql
```

### Verify RLS Policies

```sql
-- Test as user (should only see own data)
set role authenticated;
set request.jwt.claim.sub to 'user_uuid';
select * from plugs; -- Only returns user's plugs

-- Reset
reset role;
```

### Test Functions

```sql
-- Test naming ceremony
select * from agents where name like '%_Ang';

-- Test usage logging
select log_usage(
  'test_user'::uuid,
  'test_plug'::uuid,
  'llm',
  10000,
  '{}'::jsonb
);

select * from usage_logs where user_id = 'test_user'::uuid;
```

## 🚨 Troubleshooting

### Migration Errors

**Error:** `relation "tenants" already exists`
```bash
# Reset and reapply
npx supabase db reset
npx supabase db push
```

**Error:** `permission denied for schema public`
```sql
-- Grant permissions
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
```

### RLS Issues

**Error:** `row-level security policy violation`
```sql
-- Check policies
select * from pg_policies where tablename = 'plugs';

-- Verify user context
select auth.uid();
```

### Connection Issues

```bash
# Test connection
psql $SUPABASE_URL

# Check credentials
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

## 📚 Additional Resources

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Clerk + Supabase Integration](https://clerk.com/docs/integrations/databases/supabase)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Circuit Box Documentation](./circuit-box/wiring-diagram.md)

## 🆘 Support

Issues? Questions?
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide
- Review [PRD.md](./PRD.md) for architecture overview
- Open GitHub issue for bugs

---

*Last Updated: October 31, 2025*  
*Deploy Platform v4.0 - Circuit Box Edition*
