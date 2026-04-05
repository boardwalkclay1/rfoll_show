CREATE TABLE events (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  latitude REAL,
  longitude REAL,
  start_time TEXT,
  end_time TEXT,
  category TEXT,
  image_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
