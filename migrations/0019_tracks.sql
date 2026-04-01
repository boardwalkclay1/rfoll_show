DROP TABLE IF EXISTS tracks;

CREATE TABLE tracks (
  id TEXT PRIMARY KEY,                 -- track_id (UUID)
  musician_id TEXT NOT NULL,           -- musician_profiles.id

  title TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  bpm INTEGER,
  duration_seconds INTEGER,

  r2_key TEXT NOT NULL,                -- audio file in R2
  artwork_r2_key TEXT,                 -- cover art in R2

  isrc TEXT,                           -- optional industry ID
  visibility TEXT DEFAULT 'public',    -- public | private | unlisted

  price_cents INTEGER DEFAULT 100,     -- default $1.00
  license_to_rollshow INTEGER DEFAULT 0,
  royalty_split_json TEXT,             -- snapshot of splits

  status TEXT DEFAULT 'active',

  created_at TEXT NOT NULL,

  FOREIGN KEY (musician_id) REFERENCES musician_profiles(id)
);
