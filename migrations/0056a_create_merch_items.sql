CREATE TABLE merch_items (
  id TEXT PRIMARY KEY,
  skater_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  image_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
