// affiliates.js
import { apiJson } from "./users.js";

/* ============================================================
   CREATE AFFILIATE LINK (BUSINESS → SKATER)
============================================================ */
export async function createAffiliateLink(request, env, user) {
  const { skater_id, percent_cut } = await request.json();

  if (!skater_id || !percent_cut) {
    return apiJson({ message: "Missing skater_id or percent_cut" }, 400);
  }

  // Resolve business profile
  const business = await env.DB_roll.prepare(
    "SELECT id FROM business_profiles WHERE user_id = ?"
  ).bind(user.id).first();

  if (!business) return apiJson({ message: "Business profile not found" }, 404);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const link_url = `/a/${id}`; // short redirect link

  await env.DB_roll.prepare(
    `INSERT INTO affiliate_links (
       id, business_id, skater_id, link_url, percent_cut, created_at
     )
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(id, business.id, skater_id, link_url, percent_cut, now)
    .run();

  return apiJson({ affiliate_id: id, link_url });
}

/* ============================================================
   LIST AFFILIATE LINKS FOR BUSINESS
============================================================ */
export async function listAffiliateLinks(request, env, user) {
  const business = await env.DB_roll.prepare(
    "SELECT id FROM business_profiles WHERE user_id = ?"
  ).bind(user.id).first();

  if (!business) return apiJson({ message: "Business profile not found" }, 404);

  const { results } = await env.DB_roll.prepare(
    `SELECT * FROM affiliate_links
     WHERE business_id = ?
     ORDER BY created_at DESC`
  )
    .bind(business.id)
    .all();

  return apiJson({ affiliates: results });
}
