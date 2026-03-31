-- 009_rollshow_core.sql
-- Roll Show Core Economy Tables
-- Tracks, Albums, Purchases, Collabs, Solo Shows, Social Profiles, Observers

/* ===========================
   TRACKS (Indie Artist uploads)
   =========================== */
CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY,
    musician_id TEXT NOT NULL,
    title TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    price REAL DEFAULT 1.00,
    license_to_roll_show INTEGER DEFAULT 0, -- 0=false, 1=true
    royalty_split_json TEXT, -- JSON for splits
    status TEXT DEFAULT 'active',
    created_at INTEGER NOT NULL
);

/* ===========================
   ALBUMS (Optional, up to $30)
   =========================== */
CREATE TABLE IF NOT EXISTS albums (
    id TEXT PRIMARY KEY,
    musician_id TEXT NOT NULL,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    cover_url TEXT,
    created_at INTEGER NOT NULL
);

/* ===========================
   PURCHASES (Tracks + Albums)
   =========================== */
CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    buyer_id TEXT NOT NULL,
    track_id TEXT,
    album_id TEXT,
    price_paid REAL NOT NULL,
    split_artist REAL NOT NULL,
    split_rollshow REAL NOT NULL,
    created_at INTEGER NOT NULL
);

/* ===========================
   COLLABS (Skater ↔ Musician)
   =========================== */
CREATE TABLE IF NOT EXISTS collabs (
    id TEXT PRIMARY KEY,
    track_id TEXT NOT NULL,
    skater_id TEXT NOT NULL,
    musician_id TEXT NOT NULL,
    split_skater REAL NOT NULL,
    split_musician REAL NOT NULL,
    split_rollshow REAL NOT NULL,
    created_at INTEGER NOT NULL
);

/* ===========================
   SOLO SHOWS (Non‑ticketed uploads)
   =========================== */
CREATE TABLE IF NOT EXISTS solo_shows (
    id TEXT PRIMARY KEY,
    skater_id TEXT NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    track_id TEXT, -- optional music
    created_at INTEGER NOT NULL
);

/* ===========================
   SOCIAL PROFILES (TikTok, IG, YT, FB, Threads)
   =========================== */
CREATE TABLE IF NOT EXISTS social_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL, -- tiktok, instagram, youtube, facebook, threads
    handle TEXT NOT NULL,
    profile_url TEXT NOT NULL,
    followers_count INTEGER DEFAULT 0,
    verified_on_platform INTEGER DEFAULT 0,
    last_synced_at INTEGER
);

/* ===========================
   OBSERVERS (Role‑based following)
   =========================== */
CREATE TABLE IF NOT EXISTS observers (
    id TEXT PRIMARY KEY,
    observer_user_id TEXT NOT NULL,
    target_user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

/* ===========================
   INDEXES FOR SPEED
   =========================== */
CREATE INDEX IF NOT EXISTS idx_tracks_musician ON tracks(musician_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_track ON purchases(track_id);
CREATE INDEX IF NOT EXISTS idx_collabs_skater ON collabs(skater_id);
CREATE INDEX IF NOT EXISTS idx_solo_shows_skater ON solo_shows(skater_id);
CREATE INDEX IF NOT EXISTS idx_social_profiles_user ON social_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_observers_observer ON observers(observer_user_id);
CREATE INDEX IF NOT EXISTS idx_observers_target ON observers(target_user_id);
