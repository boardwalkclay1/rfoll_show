DROP TABLE IF EXISTS skater_bookings;

CREATE TABLE skater_bookings (
  id TEXT PRIMARY KEY,
  offering_id TEXT NOT NULL,
  skater_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending',
  -- pending | accepted | rejected | cancelled | completed

  scheduled_start_time TEXT,
  scheduled_end_time TEXT,

  location_type TEXT, -- virtual | in_person
  location_details TEXT,

  price_cents INTEGER NOT NULL,

  created_at TEXT NOT NULL,

  FOREIGN KEY (offering_id) REFERENCES skater_offerings(id),
  FOREIGN KEY (skater_id) REFERENCES skater_profiles(id),
  FOREIGN KEY (buyer_id) REFERENCES buyer_profiles(id)
);
