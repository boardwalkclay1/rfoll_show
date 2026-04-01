DROP TABLE IF EXISTS skater_profiles;

CREATE TABLE skater_profiles (
  id TEXT PRIMARY KEY,               -- skater_id (UUID)
  user_id TEXT NOT NULL UNIQUE,      -- links to users.id

  display_name TEXT,
  bio TEXT,

  discipline TEXT,                   -- roller | inline | skateboard | longboard
  subclass TEXT,                     -- rink | outdoor | vert | street | cruiser | dancer | downhill

  avatar_url TEXT,
  city TEXT,
  state TEXT,

  -- OPTIONAL BUT SAFE PROFILE-LEVEL FIELDS
  booking_fee_cents INTEGER DEFAULT 0,   -- base booking fee
  home_rink TEXT,                        -- optional profile field
  profile_weather_snapshot_json TEXT,    -- cached weather for profile location

  created_at TEXT NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id)
);
