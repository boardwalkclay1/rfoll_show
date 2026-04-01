DROP TABLE IF EXISTS business_profiles;

CREATE TABLE business_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  company_name TEXT,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  city TEXT,
  state TEXT,
  verified INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
