CREATE TABLE IF NOT EXISTS collab_results (
  id TEXT PRIMARY KEY,
  collab_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collab_id) REFERENCES collabs(id)
);

CREATE INDEX IF NOT EXISTS idx_collab_results_collab ON collab_results(collab_id);
