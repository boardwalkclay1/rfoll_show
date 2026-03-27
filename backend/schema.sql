/* ============================
   USERS (ALL ROLES)
============================ */
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,              -- buyer | skater | business | musician | owner
  verified INTEGER DEFAULT 0,      -- business verification
  phone TEXT,
  city TEXT,
  state TEXT,
  created_at TEXT NOT NULL
);

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
   TICKETS
============================ */
DROP TABLE IF EXISTS tickets;

CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  show_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  qr_code TEXT NOT NULL,
  stamp TEXT,
  status TEXT NOT NULL,            -- pending | paid | canceled
  created_at TEXT NOT NULL,
  FOREIGN KEY (show_id) REFERENCES shows(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id)
);

/* ============================
   PURCHASES (AFTER PAYMENT)
============================ */
DROP TABLE IF EXISTS purchases;

CREATE TABLE purchases (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL,
  ticket_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  partner_transaction_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id)
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

/* ============================
   BUSINESS / COLLAB REQUESTS
============================ */
DROP TABLE IF EXISTS business_requests;

CREATE TABLE business_requests (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  created_at TEXT NOT NULL
);

/* ============================
   OFFERS (COLLAB → SKATER)
============================ */
DROP TABLE IF EXISTS offers;

CREATE TABLE offers (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  skater_id TEXT NOT NULL,
  amount INTEGER,
  terms TEXT,
  status TEXT NOT NULL,            -- pending | accepted | rejected
  created_at TEXT NOT NULL,
  FOREIGN KEY (business_id) REFERENCES users(id),
  FOREIGN KEY (skater_id) REFERENCES users(id)
);

/* ============================
   CONTRACTS
============================ */
DROP TABLE IF EXISTS contracts;

CREATE TABLE contracts (
  id TEXT PRIMARY KEY,
  offer_id TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL,            -- pending | signed | declined
  created_at TEXT NOT NULL,
  FOREIGN KEY (offer_id) REFERENCES offers(id)
);

/* ============================
   MUSIC (ARTIST UPLOADS)
============================ */
DROP TABLE IF EXISTS music;

CREATE TABLE music (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (artist_id) REFERENCES users(id)
);

/* ============================
   MUSIC LICENSES (SKATER USE)
============================ */
DROP TABLE IF EXISTS music_licenses;

CREATE TABLE music_licenses (
  id TEXT PRIMARY KEY,
  track_id TEXT NOT NULL,
  skater_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,   -- $10 = 1000 cents
  created_at TEXT NOT NULL,
  FOREIGN KEY (track_id) REFERENCES music(id),
  FOREIGN KEY (skater_id) REFERENCES users(id)
);
