DROP TABLE IF EXISTS shows;

CREATE TABLE shows (
  id TEXT PRIMARY KEY,                     -- show_id (UUID)

  host_type TEXT NOT NULL,                 -- skater | group
  host_id TEXT NOT NULL,                   -- skater_profiles.id or skater_groups.id

  title TEXT NOT NULL,
  description TEXT,

  show_type TEXT NOT NULL,                 -- public | private | virtual | premier | roll_show | meet_and_greet | skate_with_me | one_on_one

  -- LOCATION
  location_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  latitude REAL,
  longitude REAL,

  -- VIRTUAL
  virtual_link TEXT,                       -- for private virtual Roll Shows

  -- SCHEDULING
  start_time TEXT NOT NULL,
  end_time TEXT,

  -- ECONOMY
  base_price_cents INTEGER DEFAULT 0,
  booking_fee_cents INTEGER DEFAULT 0,     -- skater’s booking fee override
  funding_goal_cents INTEGER DEFAULT 0,    -- preticket funding goal
  funding_status TEXT DEFAULT 'none',      -- none | funding | funded | failed

  -- WEATHER SNAPSHOT
  weather_snapshot_json TEXT,              -- cached weather for show location/time

  -- QR
  qr_code_url TEXT,                        -- QR to show page/tickets

  status TEXT DEFAULT 'active',            -- active | cancelled | completed

  created_at TEXT NOT NULL,

  FOREIGN KEY (host_id) REFERENCES skater_profiles(id)
    ON DELETE CASCADE
);
