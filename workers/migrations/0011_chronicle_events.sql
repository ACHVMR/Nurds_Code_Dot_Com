-- Common_Chronicle (Proof-of-Benefit) audit trail

CREATE TABLE IF NOT EXISTS chronicle_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  goal TEXT,
  scout_sources_count INTEGER,
  scout_bytes INTEGER,
  chat_messages_count INTEGER,
  stage TEXT,
  model_used TEXT,
  tokens_saved INTEGER,
  metadata TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chronicle_events_user_id ON chronicle_events(user_id);
CREATE INDEX IF NOT EXISTS idx_chronicle_events_event_type ON chronicle_events(event_type);
CREATE INDEX IF NOT EXISTS idx_chronicle_events_created_at ON chronicle_events(created_at);
