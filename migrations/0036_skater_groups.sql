DROP TABLE IF EXISTS skater_groups;

CREATE TABLE skater_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  visibility TEXT DEFAULT 'public', -- public | private
  created_by_skater_id TEXT NOT NULL,
  created_at TEXT NOT NULL,

  FOREIGN KEY (created_by_skater_id) REFERENCES skater_profiles(id)
);
