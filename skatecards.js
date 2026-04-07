// skatecards.js
import { apiJson } from "./users.js";

/* ============================================================
   INTERNAL HELPERS
============================================================ */
async function getSkater(env, userId) {
  return await env.DB_users.prepare(
    "SELECT id FROM skater_profiles WHERE user_id = ?"
  ).bind(userId).first();
}

async function getBuyer(env, userId) {
  return await env.DB_users.prepare(
    "SELECT id FROM buyer_profiles WHERE user_id = ?"
  ).bind(userId).first();
}

/* ============================================================
   CREATE SKATE CARD (SKATER)
============================================================ */
export async function createSkateCard(request, env, user) {
  const skater = await getSkater(env, user.id);
  if (!skater) return apiJson({ message: "Skater profile not found" }, 404);

  const {
    title,
    description,
    image_url,
    rarity = "common",
    edition_size = null,
    price_cents = null,
    card_type = "standard"
  } = await request.json();

  if (!title) return apiJson({ message: "Missing title" }, 400);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const qr_code_url = `/qr/skatecard/${id}`;

  await env.DB_users.prepare(
    `INSERT INTO skate_cards (
       id, skater_id, title, description,
       image_url, rarity, edition_size, price_cents,
       card_type, qr_code_url, created_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      skater.id,
      title,
      description || null,
      image_url || null,
      rarity,
      edition_size,
      price_cents,
      card_type,
      qr_code_url,
      now
    )
    .run();

  return apiJson({
    card_id: id,
    qr_code_url,
    status: "created"
  });
}

/* ============================================================
   LIST SKATER'S OWN CARDS
============================================================ */
export async function listSkaterCards(request, env, user) {
  const skater = await getSkater(env, user.id);
  if (!skater) return apiJson({ message: "Skater profile not found" }, 404);

  const { results } = await env.DB_users.prepare(
    `SELECT *
     FROM skate_cards
     WHERE skater_id = ?
     ORDER BY created_at DESC`
  )
    .bind(skater.id)
    .all();

  return apiJson({ cards: results });
}

/* ============================================================
   BUY SKATE CARD (BUYER)
============================================================ */
export async function buySkateCard(request, env, user) {
  const { card_id } = await request.json();
  if (!card_id) return apiJson({ message: "Missing card_id" }, 400);

  const buyer = await getBuyer(env, user.id);
  if (!buyer) return apiJson({ message: "Buyer profile not found" }, 404);

  const card = await env.DB_users.prepare(
    "SELECT * FROM skate_cards WHERE id = ?"
  )
    .bind(card_id)
    .first();

  if (!card) return apiJson({ message: "Card not found" }, 404);
  if (!card.price_cents) {
    return apiJson({ message: "This card is not for sale" }, 400);
  }

  const saleId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Record sale
  await env.DB_users.prepare(
    `INSERT INTO skate_card_sales (
       id, card_id, buyer_id, price_cents, purchased_at
     )
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(saleId, card_id, buyer.id, card.price_cents, now)
    .run();

  // Add to buyer library
  const libraryId = crypto.randomUUID();

  await env.DB_users.prepare(
    `INSERT INTO buyer_skate_card_library (
       id, buyer_id, card_id, acquired_at
     )
     VALUES (?, ?, ?, ?)`
  )
    .bind(libraryId, buyer.id, card_id, now)
    .run();

  return apiJson({
    sale_id: saleId,
    card_id,
    price_cents: card.price_cents,
    status: "purchased"
  });
}

/* ============================================================
   LIST BUYER'S CARD LIBRARY
============================================================ */
export async function listBuyerCardLibrary(request, env, user) {
  const buyer = await getBuyer(env, user.id);
  if (!buyer) return apiJson({ message: "Buyer profile not found" }, 404);

  const { results } = await env.DB_users.prepare(
    `SELECT 
        l.id AS library_id,
        l.acquired_at,
        c.id AS card_id,
        c.title,
        c.description,
        c.image_url,
        c.rarity,
        c.card_type,
        c.qr_code_url
     FROM buyer_skate_card_library l
     JOIN skate_cards c ON c.id = l.card_id
     WHERE l.buyer_id = ?
     ORDER BY l.acquired_at DESC`
  )
    .bind(buyer.id)
    .all();

  return apiJson({ cards: results });
}
