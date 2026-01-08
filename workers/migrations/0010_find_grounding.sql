-- ============================================
-- 0010_find_grounding.sql
-- FIND (Hybrid) local knowledge store + FTS
-- ============================================

-- Canonical documents table (per-user)
CREATE TABLE IF NOT EXISTS grounding_documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'manual',
  source_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_grounding_documents_user_id ON grounding_documents(user_id);

-- Full-text index over title + content
-- rowid will match grounding_documents.rowid, so we JOIN back to resolve id/title
CREATE VIRTUAL TABLE IF NOT EXISTS grounding_documents_fts USING fts5(
  title,
  content,
  content='grounding_documents',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS grounding_documents_ai AFTER INSERT ON grounding_documents BEGIN
  INSERT INTO grounding_documents_fts(rowid, title, content)
  VALUES (new.rowid, new.title, new.content);
END;

CREATE TRIGGER IF NOT EXISTS grounding_documents_ad AFTER DELETE ON grounding_documents BEGIN
  INSERT INTO grounding_documents_fts(grounding_documents_fts, rowid, title, content)
  VALUES('delete', old.rowid, old.title, old.content);
END;

CREATE TRIGGER IF NOT EXISTS grounding_documents_au AFTER UPDATE ON grounding_documents BEGIN
  INSERT INTO grounding_documents_fts(grounding_documents_fts, rowid, title, content)
  VALUES('delete', old.rowid, old.title, old.content);
  INSERT INTO grounding_documents_fts(rowid, title, content)
  VALUES (new.rowid, new.title, new.content);
END;
