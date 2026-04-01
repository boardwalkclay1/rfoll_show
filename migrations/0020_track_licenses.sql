/* ============================
   TRACK LICENSES (SYNC RIGHTS)
============================ */
DROP TABLE IF EXISTS track_licenses;

CREATE TABLE track_licenses (
  id TEXT PRIMARY KEY,                 -- license_id (UUID)

  track_id TEXT NOT NULL,              -- tracks.id
  musician_id TEXT NOT NULL,           -- musician_profiles.id

  granted_to_role TEXT NOT NULL,       -- skater | business | rollshow
  granted_to_profile_id TEXT NOT NULL, -- skater_id | business_id | owner

  license_type TEXT NOT NULL,          -- sync | performance | promo | full
  amount_cents INTEGER NOT NULL,       -- price paid or owed

  terms_json TEXT,                     -- full legal terms snapshot
  approved_by_owner INTEGER DEFAULT 0, -- 0 = pending, 1 = approved

  created_at TEXT NOT NULL,

  FOREIGN KEY (track_id) REFERENCES tracks(id),
  FOREIGN KEY (musician_id) REFERENCES musician_profiles(id)
);
