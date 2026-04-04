CREATE TABLE IF NOT EXISTS feed_algorithms (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  algorithm TEXT NOT NULL, -- ranking, trending, personalized
  weight REAL DEFAULT 1.0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_feed_algorithms_user ON feed_algorithms(user_id);
