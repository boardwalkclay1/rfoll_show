CREATE TABLE affiliate_links (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  skater_id TEXT NOT NULL,
  link_url TEXT NOT NULL,
  percent_cut INTEGER NOT NULL,
  created_at TEXT NOT NULL,

  FOREIGN KEY (business_id) REFERENCES business_profiles(id),
  FOREIGN KEY (skater_id) REFERENCES skater_profiles(id)
);
