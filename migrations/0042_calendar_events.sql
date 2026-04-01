DROP TABLE IF EXISTS calendar_events;

CREATE TABLE calendar_events (
  id TEXT PRIMARY KEY,
  skater_id TEXT NOT NULL,

  source_type TEXT NOT NULL,
  -- show | booking | class | campaign | personal

  source_id TEXT NOT NULL,
  title TEXT NOT NULL,

  start_time TEXT NOT NULL,
  end_time TEXT,
  notes TEXT,

  created_at TEXT NOT NULL,

  FOREIGN KEY (skater_id) REFERENCES skater_profiles(id)
);
