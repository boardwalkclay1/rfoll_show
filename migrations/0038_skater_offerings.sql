DROP TABLE IF EXISTS skater_offerings;

CREATE TABLE skater_offerings (
  id TEXT PRIMARY KEY,
  skater_id TEXT NOT NULL,

  offering_type TEXT NOT NULL, 
  -- roll_show_in_person | roll_show_virtual | lesson_1on1 | lesson_group |
  -- meet_and_greet | skate_with_me | custom_video | collab | other

  title TEXT NOT NULL,
  description TEXT,
  base_price_cents INTEGER NOT NULL,
  duration_minutes INTEGER,
  is_active INTEGER DEFAULT 1,

  created_at TEXT NOT NULL,

  FOREIGN KEY (skater_id) REFERENCES skater_profiles(id)
);
