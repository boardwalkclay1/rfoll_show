/* ============================
   MUSICIANS (PROFILE)
============================ */
DROP TABLE IF EXISTS musicians;

CREATE TABLE musicians (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  bio TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

/* ============================
   TRACKS (R2 STORAGE METADATA)
============================ */
DROP TABLE IF EXISTS tracks;

CREATE TABLE tracks (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  title TEXT NOT NULL,
  r2_key TEXT NOT NULL,            -- path to R2 file
  artwork_r2_key TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (artist_id) REFERENCES users(id)
);

/* ============================
   TRACK LICENSES
============================ */
DROP TABLE IF EXISTS track_licenses;

CREATE TABLE track_licenses (
  id TEXT PRIMARY KEY,
  track_id TEXT NOT NULL,
  skater_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (track_id) REFERENCES tracks(id),
  FOREIGN KEY (skater_id) REFERENCES users(id)
);
