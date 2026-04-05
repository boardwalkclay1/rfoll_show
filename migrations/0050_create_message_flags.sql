CREATE TABLE message_flags (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  is_starred INTEGER DEFAULT 0,
  is_important INTEGER DEFAULT 0,
  is_hidden INTEGER DEFAULT 0
);
