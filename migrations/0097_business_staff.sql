CREATE TABLE business_staff (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (business_id) REFERENCES business_profiles(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
