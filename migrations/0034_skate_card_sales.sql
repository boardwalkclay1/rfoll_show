CREATE TABLE skate_card_sales (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  purchased_at TEXT NOT NULL,

  FOREIGN KEY (card_id) REFERENCES skate_cards(id),
  FOREIGN KEY (buyer_id) REFERENCES buyer_profiles(id)
);
