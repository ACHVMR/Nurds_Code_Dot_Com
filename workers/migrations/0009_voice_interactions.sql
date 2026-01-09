-- Voice Interactions Table for D1
-- Stores voice input/output logs for analytics and debugging

CREATE TABLE IF NOT EXISTS voice_interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  user_id TEXT,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('stt', 'tts')),
  transcript TEXT,
  audio_duration_ms INTEGER,
  language TEXT DEFAULT 'en',
  voice_id TEXT,
  model_used TEXT,
  tokens_used INTEGER DEFAULT 0,
  latency_ms INTEGER,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'timeout')),
  error_message TEXT,
  metadata TEXT, -- JSON blob for additional data
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_voice_interactions_session ON voice_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_interactions_user ON voice_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_interactions_created ON voice_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_voice_interactions_type ON voice_interactions(interaction_type);

-- Trigger to update updated_at on modification
CREATE TRIGGER IF NOT EXISTS voice_interactions_updated_at
AFTER UPDATE ON voice_interactions
BEGIN
  UPDATE voice_interactions SET updated_at = datetime('now') WHERE id = NEW.id;
END;
