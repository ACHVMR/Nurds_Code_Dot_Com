-- LUC Token Billing & Refund System (Edge Ledger)
-- Stores per-session token usage split across phases (chat vs iteration)
-- and produces receipts + metering events.

CREATE TABLE IF NOT EXISTS luc_sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_phase TEXT NOT NULL DEFAULT 'chat',

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  phase_transition_at TEXT,
  finalized_at TEXT,

  chat_input_tokens INTEGER NOT NULL DEFAULT 0,
  chat_output_tokens INTEGER NOT NULL DEFAULT 0,
  iteration_input_tokens INTEGER NOT NULL DEFAULT 0,
  iteration_output_tokens INTEGER NOT NULL DEFAULT 0,

  chat_cost_cents INTEGER NOT NULL DEFAULT 0,
  iteration_cost_cents INTEGER NOT NULL DEFAULT 0,

  refund_cents INTEGER NOT NULL DEFAULT 0,
  total_charge_cents INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_luc_sessions_user ON luc_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_luc_sessions_status ON luc_sessions(status);

CREATE TABLE IF NOT EXISTS luc_usage_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  phase TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  cost_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (session_id) REFERENCES luc_sessions(session_id)
);

CREATE INDEX IF NOT EXISTS idx_luc_usage_session ON luc_usage_events(session_id);
CREATE INDEX IF NOT EXISTS idx_luc_usage_user ON luc_usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_luc_usage_phase ON luc_usage_events(phase);

CREATE TABLE IF NOT EXISTS luc_meter_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  phase TEXT NOT NULL,
  model TEXT NOT NULL,
  refunded INTEGER NOT NULL DEFAULT 0,
  value_cents INTEGER NOT NULL,
  provider TEXT NOT NULL,
  provider_event_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (session_id) REFERENCES luc_sessions(session_id)
);

CREATE INDEX IF NOT EXISTS idx_luc_meter_session ON luc_meter_events(session_id);
CREATE INDEX IF NOT EXISTS idx_luc_meter_user ON luc_meter_events(user_id);

CREATE TABLE IF NOT EXISTS luc_receipts (
  receipt_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  chat_tokens INTEGER NOT NULL,
  iteration_tokens INTEGER NOT NULL,
  chat_cost_cents INTEGER NOT NULL,
  iteration_cost_cents INTEGER NOT NULL,
  refund_cents INTEGER NOT NULL,
  total_charge_cents INTEGER NOT NULL,

  FOREIGN KEY (session_id) REFERENCES luc_sessions(session_id)
);

CREATE INDEX IF NOT EXISTS idx_luc_receipts_user ON luc_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_luc_receipts_session ON luc_receipts(session_id);

CREATE TABLE IF NOT EXISTS luc_pricing (
  model TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  input_cost_per_million_usd REAL,
  output_cost_per_million_usd REAL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
