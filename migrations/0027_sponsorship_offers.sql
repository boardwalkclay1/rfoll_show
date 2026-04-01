CREATE TABLE sponsorship_offers (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  skater_id TEXT NOT NULL,
  status TEXT NOT NULL,             -- pending | accepted | rejected | modified
  terms_json TEXT,
  created_at TEXT NOT NULL,

  FOREIGN KEY (campaign_id) REFERENCES sponsorship_campaigns(id),
  FOREIGN KEY (skater_id) REFERENCES skater_profiles(id)
);
