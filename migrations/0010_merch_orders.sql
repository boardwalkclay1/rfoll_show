DROP TABLE IF EXISTS merch_orders;

CREATE TABLE merch_orders (
  id TEXT PRIMARY KEY,
  merch_id TEXT NOT NULL,
  buyer_profile_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (merch_id) REFERENCES merch_items(id),
  FOREIGN KEY (buyer_profile_id) REFERENCES buyer_profiles(id)
);
