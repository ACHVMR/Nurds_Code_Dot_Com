-- Row Level Security Policies for multi-tenant isolation
-- Ensures users can only access their own data

-- Enable RLS on all tables
alter table users enable row level security;
alter table plugs enable row level security;
alter table builds enable row level security;
alter table usage_logs enable row level security;
alter table subscriptions enable row level security;
alter table agents enable row level security;

-- Users policies
create policy "Users can read own profile"
  on users for select
  using (auth.uid()::uuid = id);

create policy "Users can update own profile"
  on users for update
  using (auth.uid()::uuid = id);

-- Plugs policies
create policy "Users can read own plugs"
  on plugs for select
  using (auth.uid()::uuid = owner);

create policy "Users can create plugs"
  on plugs for insert
  with check (auth.uid()::uuid = owner);

create policy "Users can update own plugs"
  on plugs for update
  using (auth.uid()::uuid = owner);

create policy "Users can delete own plugs"
  on plugs for delete
  using (auth.uid()::uuid = owner);

-- Builds policies
create policy "Users can read own builds"
  on builds for select
  using (auth.uid()::uuid = user_id);

create policy "Users can create builds"
  on builds for insert
  with check (auth.uid()::uuid = user_id);

-- Usage logs policies (read-only for users)
create policy "Users can read own usage"
  on usage_logs for select
  using (auth.uid()::uuid = user_id);

-- Subscriptions policies
create policy "Users can read own subscription"
  on subscriptions for select
  using (auth.uid()::uuid = user_id);

-- Agents policies
create policy "Users can read own agents"
  on agents for select
  using (auth.uid()::uuid = user_id);

create policy "Users can create agents"
  on agents for insert
  with check (auth.uid()::uuid = user_id);

create policy "Users can update own agents"
  on agents for update
  using (auth.uid()::uuid = user_id);

create policy "Users can delete own agents"
  on agents for delete
  using (auth.uid()::uuid = user_id);

-- Helper function: Create isolated schema for each tenant
create or replace function create_user_schema(uid uuid)
returns void language plpgsql security definer as $$
begin
  execute format('create schema if not exists tenant_%s', replace(uid::text, '-', '_'));
end;
$$;

-- Helper function: Get user's current tier
create or replace function get_user_tier(uid uuid)
returns text language plpgsql security definer as $$
declare
  user_tier text;
begin
  select tier into user_tier from users where id = uid;
  return coalesce(user_tier, 'free');
end;
$$;

-- Helper function: Check if user can create more plugs
create or replace function can_create_plug(uid uuid)
returns boolean language plpgsql security definer as $$
declare
  user_tier text;
  plug_count integer;
  tier_limits jsonb;
begin
  select tier into user_tier from users where id = uid;
  select count(*) into plug_count from plugs where owner = uid and status = 'active';
  
  -- Tier limits (plugs per month)
  tier_limits := '{"free": 1, "coffee": 0, "lite": 3, "medium": 8, "heavy": 20, "superior": 100}'::jsonb;
  
  return plug_count < (tier_limits->>user_tier)::integer;
end;
$$;

-- Helper function: Log usage with automatic cost calculation
create or replace function log_usage(
  uid uuid,
  pid uuid,
  service_type text,
  tokens integer default 0,
  metadata_json jsonb default '{}'::jsonb
)
returns uuid language plpgsql security definer as $$
declare
  cost numeric(10,4);
  log_id uuid;
begin
  -- Calculate cost based on service type
  cost := case service_type
    when 'llm' then tokens::numeric * 0.00006 -- $0.06 per 1K tokens
    when 'voice' then tokens::numeric * 0.01 -- $0.01 per minute (tokens as minutes)
    when 'storage' then tokens::numeric * 0.001 -- $0.001 per GB
    else 0
  end;
  
  insert into usage_logs (user_id, plug_id, service, tokens_used, cost_usd, metadata)
  values (uid, pid, service_type, tokens, cost, metadata_json)
  returning id into log_id;
  
  return log_id;
end;
$$;

-- Helper function: Get user's remaining credits
create or replace function get_user_credits(uid uuid)
returns integer language plpgsql security definer as $$
declare
  user_credits integer;
  tier_allocation jsonb;
  user_tier text;
  period_start timestamptz;
  tokens_used integer;
begin
  select tier, credits_remaining into user_tier, user_credits from users where id = uid;
  
  -- Tier allocations (monthly tokens)
  tier_allocation := '{"free": 0, "coffee": 25000, "lite": 200000, "medium": 600000, "heavy": 1500000, "superior": 1500000}'::jsonb;
  
  -- Get current billing period start
  select current_period_start into period_start 
  from subscriptions 
  where user_id = uid and status = 'active'
  order by created_at desc
  limit 1;
  
  -- Calculate tokens used this period
  select coalesce(sum(tokens_used), 0) into tokens_used
  from usage_logs
  where user_id = uid 
    and created_at >= coalesce(period_start, date_trunc('month', now()));
  
  return (tier_allocation->>user_tier)::integer - tokens_used;
end;
$$;

-- Helper function: Initialize circuit breakers from YAML config
create or replace function init_circuit_breakers()
returns void language plpgsql security definer as $$
begin
  -- This will be populated from circuit-box/breakers.yaml via API
  -- Example breakers:
  insert into circuit_breakers (id, name, service, tier, status, health_endpoint)
  values 
    ('breaker-1', 'Cloudflare Workers API', 'workers-api', 'core', 'on', '/api/health'),
    ('breaker-2', 'Clerk Authentication', 'clerk-auth', 'core', 'on', '/api/auth/me'),
    ('breaker-3', 'Supabase Database', 'supabase', 'core', 'on', 'https://qwwjmujbfnwbcyvfmfaj.supabase.co/rest/v1/'),
    ('breaker-5', 'LLM Gateway', 'llm-router', 'ai', 'on', null),
    ('breaker-10', 'Voice Integration', 'voice-orchestrator', 'voice', 'on', null)
  on conflict (id) do nothing;
end;
$$;

-- Initialize circuit breakers
select init_circuit_breakers();
