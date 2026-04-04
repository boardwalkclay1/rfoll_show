CREATE TABLE IF NOT EXISTS collab_chat (
  id TEXT PRIMARY KEY,
  collab_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collab_id) REFERENCES collabs(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_collab_chat_collab ON collab_chat(collab_id);
