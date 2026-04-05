CREATE TABLE weather_cache (
  id TEXT PRIMARY KEY,
  location TEXT NOT NULL,
  data TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
