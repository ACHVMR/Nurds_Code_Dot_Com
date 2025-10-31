-- Initial multi-tenant schema for Nurds Code platform
-- This creates the core tenant/user/plug structure with UUID support

create extension if not exists "uuid-ossp";

-- Tenants table: Each tenant represents an isolated customer environment
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

-- Users table: Links Clerk users to tenants with tier information
create table users (
  id uuid primary key, -- Matches Clerk user ID
  tenant_id uuid references tenants(id) on delete cascade,
  email text not null,
  tier text default 'free' check (tier in ('free','coffee','lite','medium','heavy','superior')),
  credits_remaining integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_login timestamptz,
  metadata jsonb default '{}'::jsonb
);

-- Plugs table: User-created applications/projects
create table plugs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) on delete cascade,
  owner uuid references users(id) on delete cascade,
  name text not null,
  description text,
  tier text check (tier in ('free','coffee','lite','medium','heavy','superior')),
  status text default 'active' check (status in ('active','paused','archived')),
  agent_name text, -- Boomer_Angs naming: [UserPrefix]_Ang
  framework text, -- crewai, microsoft, openai, deerflow, boomer_angs
  config jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deployed_at timestamptz
);

-- Build history table: Track all plug builds
create table builds (
  id uuid primary key default uuid_generate_v4(),
  plug_id uuid references plugs(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  status text default 'pending' check (status in ('pending','building','success','failed')),
  build_time_seconds integer,
  tokens_used integer,
  cost_usd numeric(10,2),
  error_message text,
  logs jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Usage tracking table: Token and API usage per user
create table usage_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  plug_id uuid references plugs(id) on delete set null,
  service text not null, -- 'llm', 'voice', 'storage', 'compute'
  tokens_used integer default 0,
  cost_usd numeric(10,4) default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Subscriptions table: Track Stripe subscriptions
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  tier text not null,
  status text default 'active' check (status in ('active','canceled','past_due','trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Agents table: Boomer_Angs agent instances
create table agents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null, -- [UserPrefix]_Ang format
  framework text not null, -- crewai, microsoft, openai, deerflow, boomer_angs
  type text check (type in ('simple','workflow','custom')),
  config jsonb default '{}'::jsonb,
  status text default 'active' check (status in ('active','paused','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Circuit breakers table: Service health monitoring
create table circuit_breakers (
  id text primary key,
  name text not null,
  service text not null,
  tier text not null,
  status text default 'on' check (status in ('on','off','error')),
  health_endpoint text,
  last_check timestamptz,
  error_count integer default 0,
  metadata jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Create indexes for performance
create index idx_users_tenant on users(tenant_id);
create index idx_users_email on users(email);
create index idx_plugs_owner on plugs(owner);
create index idx_plugs_tenant on plugs(tenant_id);
create index idx_builds_plug on builds(plug_id);
create index idx_builds_user on builds(user_id);
create index idx_usage_user on usage_logs(user_id);
create index idx_usage_created on usage_logs(created_at);
create index idx_subscriptions_user on subscriptions(user_id);
create index idx_agents_user on agents(user_id);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger update_tenants_updated_at before update on tenants
  for each row execute function update_updated_at_column();

create trigger update_users_updated_at before update on users
  for each row execute function update_updated_at_column();

create trigger update_plugs_updated_at before update on plugs
  for each row execute function update_updated_at_column();

create trigger update_subscriptions_updated_at before update on subscriptions
  for each row execute function update_updated_at_column();

create trigger update_agents_updated_at before update on agents
  for each row execute function update_updated_at_column();
