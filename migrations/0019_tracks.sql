/* ============================
   TRACKS (FULL METADATA)
============================ */
DROP TABLE IF EXISTS tracks;

CREATE TABLE tracks (
  id TEXT PRIMARY KEY,             -- track_id (UUID)
  musician_id TEXT NOT NULL,       -- musician_profiles.id

  title TEXT NOT NULL,
  description TEXT,                -- optional track notes
  genre TEXT,                      -- track-specific genre
  bpm INTEGER,                     -- beats per minute
  duration_seconds INTEGER,        -- full duration

  r2_key TEXT NOT NULL,            -- audio file in R2
  artwork_r2_key TEXT,             -- cover art in R2

  isrc TEXT,                       -- optional unique industry ID
  visibility TEXT DEFAULT 'public',-- public | private | unlisted

  created_at TEXT NOT NULL,

  FOREIGN KEY (musician_id) REFERENCES musician_profiles(id)
);
