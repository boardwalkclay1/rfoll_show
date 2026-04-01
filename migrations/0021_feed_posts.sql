CREATE TABLE feed_posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,               -- skater | musician | business | buyer
  profile_id TEXT NOT NULL,         -- skater_id | musician_id | business_id | buyer_id

  content TEXT,
  media_url TEXT,
  media_type TEXT,                  -- image | video | clip | story
  is_story INTEGER DEFAULT 0,       -- 1 = story (skaters only)

  created_at TEXT NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id)
);
