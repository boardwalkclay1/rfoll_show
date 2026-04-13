-- 003_buyer_profiles.sql — CLEAN, D1-SAFE (minimal buyer profile)

DROP TABLE IF EXISTS buyer_profiles;

CREATE TABLE IF NOT EXISTS buyer_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  billing_address TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
