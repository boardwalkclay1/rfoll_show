CREATE TABLE sponsorship_campaigns (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget_cents INTEGER NOT NULL,
  coupon_code TEXT,
  coupon_percent INTEGER,
  duration_days INTEGER,
  created_at TEXT NOT NULL,

  FOREIGN KEY (business_id) REFERENCES business_profiles(id)
);
