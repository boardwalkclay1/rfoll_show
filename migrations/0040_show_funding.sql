DROP TABLE IF EXISTS show_funding;

CREATE TABLE show_funding (
  id TEXT PRIMARY KEY,
  show_id TEXT NOT NULL,
  goal_cents INTEGER NOT NULL,
  current_raised_cents INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'funding',
  -- draft | funding | funded | cancelled

  created_at TEXT NOT NULL,

  FOREIGN KEY (show_id) REFERENCES shows(id)
);
