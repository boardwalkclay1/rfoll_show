CREATE TABLE weather_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  location TEXT,
  units TEXT DEFAULT 'imperial',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
