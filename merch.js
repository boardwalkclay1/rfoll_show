// merch.js
import { apiJson } from "./users.js";

/* ============================================================
   CREATE MERCH ITEM (SKATER)
============================================================ */
export async function createMerchItem(request, env, user) {
  const { title, description, price_cents, image_url } = await request.json();

  // Resolve skater profile
  const skater = await env.DB_users.prepare(
    "SELECT id FROM skater_profiles WHERE user_id = ?"
  ).bind(user.id).first();

  if (!skater) return apiJson({ message: "Only skaters can create merch." }, 403);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB_users.prepare(
    `INSERT INTO merch_items (
       id, skater_id, title, description, price_cents, image_url, created_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      skater.id,
      title,
      description || null,
      price_cents,
      image_url || null,
      now
    )
    .run();

  return apiJson({ merch_id: id });
}

/* ============================================================
   LIST MERCH ITEMS FOR A SKATER
============================================================ */
export async function listMerchForSkater(request, env, user) {
  const skater = await env.DB_users.prepare(
    "SELECT id FROM skater_profiles WHERE user_id = ?"
  ).bind(user.id).first();

  if (!skater) return apiJson({ message: "Skater not found" }, 404);

  const { results } = await env.DB_users.prepare(
    `SELECT *
     FROM merch_items
     WHERE skater_id = ?
     ORDER BY created_at DESC`
  )
    .bind(skater.id)
    .all();

  return apiJson({ merch: results });
}

/* ============================================================
   BUY MERCH (BUYER)
============================================================ */
export async function buyMerch(request, env, user) {
  const { merch_id, quantity } = await request.json();

  if (!merch_id || !quantity) {
    return apiJson({ message: "Missing merch_id or quantity" }, 400);
  }

  // Resolve buyer profile
  const buyer = await env.DB_users.prepare(
    "SELECT id FROM buyer_profiles WHERE user_id = ?"
  ).bind(user.id).first();

  if (!buyer) return apiJson({ message: "Buyer profile not found" }, 404);

  // Fetch merch item
  const merch = await env.DB_users.prepare(
    "SELECT * FROM merch_items WHERE id = ?"
  ).bind(merch_id).first();

  if (!merch) return apiJson({ message: "Merch item not found" }, 404);

  const total_cents = merch.price_cents * quantity;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB_users.prepare(
    `INSERT INTO merch_orders (
       id, merch_id, buyer_profile_id, quantity, total_cents, status, created_at
     )
     VALUES (?, ?, ?, ?, ?, 'paid', ?)`
  )
    .bind(id, merch_id, buyer.id, quantity, total_cents, now)
    .run();

  return apiJson({
    order_id: id,
    total_cents,
    status: "paid"
  });
}

/* ============================================================
   LIST BUYER MERCH ORDERS
============================================================ */
export async function listBuyerMerchOrders(request, env, user) {
  const buyer = await env.DB_users.prepare(
    "SELECT id FROM buyer_profiles WHERE user_id = ?"
  ).bind(user.id).first();

  if (!buyer) return apiJson({ message: "Buyer profile not found" }, 404);

  const { results } = await env.DB_users.prepare(
    `SELECT 
        o.id AS order_id,
        o.quantity,
        o.total_cents,
        o.status,
        o.created_at,
        m.title,
        m.image_url
     FROM merch_orders o
     JOIN merch_items m ON m.id = o.merch_id
     WHERE o.buyer_profile_id = ?
     ORDER BY o.created_at DESC`
  )
    .bind(buyer.id)
    .all();

  return apiJson({ orders: results });
}
