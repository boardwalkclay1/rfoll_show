-- 004_musician_profiles.sql — CLEAN, D1-SAFE (minimal: linkage + core musician fields)

DROP TABLE IF EXISTS musician_profiles;

CREATE TABLE IF NOT EXISTS musician_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  stage_name TEXT NOT NULL,
  genre TEXT,
  bio TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
