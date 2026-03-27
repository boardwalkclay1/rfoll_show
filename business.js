import { json } from "./utils.js";
import { signupBase } from "./users.js";

export async function signupBusiness(request, env) {
  const body = await request.json();
  body.role = "business";

  const base = await signupBase(env, body);
  if (base.error) return json({ success: false, error: base.error }, 400);

  await env.DB_business.prepare(
    `INSERT INTO businesses (id, user_id, company_name, website, verified, created_at)
     VALUES (?, ?, ?, ?, 0, ?)`
  ).bind(
    crypto.randomUUID(),
    base.id,
    body.company_name || body.name || null,
    body.website || null,
    base.created_at
  ).run();

  return json({ success: true, user: base });
}

export async function businessDashboard(request, env, user) {
  const business = await env.DB_business.prepare(
    "SELECT * FROM businesses WHERE user_id = ?"
  ).bind(user.id).first();

  const offers = await env.DB_business.prepare(
    `SELECT * FROM business_offers WHERE business_id = ? ORDER BY created_at DESC`
  ).bind(business.id).all();

  const contracts = await env.DB_business.prepare(
    `SELECT c.*
     FROM business_contracts c
     JOIN business_offers o ON c.offer_id = o.id
     WHERE o.business_id = ?
     ORDER BY c.created_at DESC`
  ).bind(business.id).all();

  return json({
    business,
    offers: offers.results,
    contracts: contracts.results
  });
}

export async function createOffer(request, env, user) {
  const { skaterId, amount, terms } = await request.json();

  const business = await env.DB_business.prepare(
    "SELECT id FROM businesses WHERE user_id = ?"
  ).bind(user.id).first();

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB_business.prepare(
    `INSERT INTO business_offers (id, business_id, skater_id, amount, terms, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`
  ).bind(id, business.id, skaterId, amount, terms, now).run();

  return json({ success: true, offerId: id });
}

export async function listBusinessOffers(request, env, user) {
  const business = await env.DB_business.prepare(
    "SELECT id FROM businesses WHERE user_id = ?"
  ).bind(user.id).first();

  const { results } = await env.DB_business.prepare(
    "SELECT * FROM business_offers WHERE business_id = ? ORDER BY created_at DESC"
  ).bind(business.id).all();

  return json(results);
}

export async function createContract(request, env, user) {
  const { offerId, details } = await request.json();

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB_business.prepare(
    `INSERT INTO business_contracts (id, offer_id, details, status, created_at)
     VALUES (?, ?, ?, 'pending', ?)`
  ).bind(id, offerId, details, now).run();

  return json({ success: true, contractId: id });
}

export async function listContracts(request, env, user) {
  const business = await env.DB_business.prepare(
    "SELECT id FROM businesses WHERE user_id = ?"
  ).bind(user.id).first();

  const { results } = await env.DB_business.prepare(
    `SELECT c.*, o.skater_id, o.business_id
     FROM business_contracts c
     JOIN business_offers o ON c.offer_id = o.id
     WHERE o.business_id = ?
     ORDER BY c.created_at DESC`
  ).bind(business.id).all();

  return json(results);
}
