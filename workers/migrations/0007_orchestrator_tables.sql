-- ============================================
-- Migration: 0007_orchestrator_tables.sql
-- Purpose: Tables for Open Hands Orchestrator
-- ============================================

-- Orchestrator Sessions
CREATE TABLE IF NOT EXISTS orchestrator_sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'BRAINSTORMING',
  context TEXT DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT,
  CONSTRAINT valid_mode CHECK (mode IN ('BRAINSTORMING', 'NURD_OUT', 'AGENT_MODE', 'EDIT_MODE')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'completed', 'error'))
);

-- Orchestrator Executions (Task Log)
CREATE TABLE IF NOT EXISTS orchestrator_executions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  task TEXT NOT NULL,
  strategy TEXT,
  agents_used TEXT DEFAULT '[]',
  duration_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  result TEXT,
  error TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES orchestrator_sessions(session_id),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'success', 'failed'))
);

-- Agent Call Log
CREATE TABLE IF NOT EXISTS agent_calls (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  input TEXT,
  output TEXT,
  duration_ms INTEGER,
  success INTEGER DEFAULT 1,
  error TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (execution_id) REFERENCES orchestrator_executions(id),
  CONSTRAINT valid_type CHECK (agent_type IN ('local', 'remote', 'model'))
);

-- Model Routing Log
CREATE TABLE IF NOT EXISTS model_routing_log (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  task_type TEXT NOT NULL,
  selected_model TEXT NOT NULL,
  fallback_used INTEGER DEFAULT 0,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd REAL,
  latency_ms INTEGER,
  created_at TEXT NOT NULL
);

-- LoRA Usage Log
CREATE TABLE IF NOT EXISTS lora_usage_log (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  lora_id TEXT NOT NULL,
  base_model TEXT NOT NULL,
  language TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  success INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orch_sessions_user ON orchestrator_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_orch_sessions_status ON orchestrator_sessions(status);
CREATE INDEX IF NOT EXISTS idx_orch_executions_session ON orchestrator_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_orch_executions_status ON orchestrator_executions(status);
CREATE INDEX IF NOT EXISTS idx_agent_calls_execution ON agent_calls(execution_id);
CREATE INDEX IF NOT EXISTS idx_agent_calls_agent ON agent_calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_model_routing_session ON model_routing_log(session_id);
CREATE INDEX IF NOT EXISTS idx_model_routing_model ON model_routing_log(selected_model);
CREATE INDEX IF NOT EXISTS idx_lora_usage_session ON lora_usage_log(session_id);
CREATE INDEX IF NOT EXISTS idx_lora_usage_lora ON lora_usage_log(lora_id);
