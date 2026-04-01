DROP TABLE IF EXISTS buyer_profiles;

CREATE TABLE buyer_profiles (
  id TEXT PRIMARY KEY,               -- buyer_id (UUID)
  user_id TEXT NOT NULL UNIQUE,      -- links to users.id

  name TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,

  -- OPTIONAL BUT SAFE PROFILE-LEVEL FIELDS
  default_payment_method TEXT,       -- card | paypal | apple_pay
  preferred_rink TEXT,               -- optional
  profile_weather_snapshot_json TEXT,

  created_at TEXT NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id)
);
