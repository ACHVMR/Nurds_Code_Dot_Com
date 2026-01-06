-- workers/migrations/0000_init.sql
CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    settings_json TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
