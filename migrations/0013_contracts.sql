DROP TABLE IF EXISTS contracts;

CREATE TABLE contracts (
  id TEXT PRIMARY KEY,
  template_slug TEXT NOT NULL,
  role TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  status TEXT NOT NULL,
  signed_at TEXT,
  terms_json TEXT,
  created_at TEXT NOT NULL
);
