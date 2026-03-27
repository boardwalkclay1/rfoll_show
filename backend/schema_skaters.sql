/* ============================
   SKATERS (PROFILE)
============================ */
DROP TABLE IF EXISTS skaters;

CREATE TABLE skaters (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  bio TEXT,
  discipline TEXT,
  profile_image TEXT,
  clip_url TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

/* ============================
   SHOWS (SKATER PERFORMANCES)
============================ */
DROP TABLE IF EXISTS shows;

CREATE TABLE shows (
  id TEXT PRIMARY KEY,
  skater_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  thumbnail TEXT,
  video_url TEXT,
  premiere_date TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (skater_id) REFERENCES skaters(id)
);

/* ============================
   LESSONS (SKATER BUSINESS)
============================ */
DROP TABLE IF EXISTS lessons;

CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  skater_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (skater_id) REFERENCES skaters(id)
);

/* ============================
   LESSON REQUESTS
============================ */
DROP TABLE IF EXISTS lesson_requests;

CREATE TABLE lesson_requests (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  status TEXT NOT NULL,            -- pending | accepted | declined | completed
  created_at TEXT NOT NULL,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id)
);

/* ============================
   PAYOUTS (SKATER EARNINGS)
============================ */
DROP TABLE IF EXISTS payouts;

CREATE TABLE payouts (
  id TEXT PRIMARY KEY,
  skater_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL,            -- pending | paid | failed
  created_at TEXT NOT NULL,
  FOREIGN KEY (skater_id) REFERENCES skaters(id)
);
