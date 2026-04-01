CREATE TABLE follows (
  id TEXT PRIMARY KEY,
  follower_user_id TEXT NOT NULL,
  following_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,

  FOREIGN KEY (follower_user_id) REFERENCES users(id),
  FOREIGN KEY (following_user_id) REFERENCES users(id)
);
