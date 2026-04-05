CREATE TABLE qr_scans (
  id TEXT PRIMARY KEY,
  qr_id TEXT NOT NULL,
  scanned_by TEXT,
  scanned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  ip_address TEXT
);
