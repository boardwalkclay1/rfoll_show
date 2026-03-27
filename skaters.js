import { json } from "./utils.js";
import { signupBase } from "./users.js";

export async function signupSkater(request, env) {
  const body = await request.json();
  body.role = "skater";

  const base = await signupBase(env, body);
  if (base.error) return json({ success: false, error: base.error }, 400);

  await env.DB_skaters.prepare(
    `INSERT INTO skaters (id, user_id, bio, discipline, profile_image, clip_url, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    crypto.randomUUID(),
    base.id,
    body.bio || null,
    body.discipline || null,
    body.profile_image || null,
    body.clip_url || null,
    base.created_at
  ).run();

  return json({ success: true, user: base });
}

export async function listShows(env) {
  const { results } = await env.DB_skaters.prepare(
    `SELECT s.*, sk.discipline, sk.bio
     FROM shows s
     JOIN skaters sk ON s.skater_id = sk.id
     ORDER BY s.created_at DESC`
  ).all();

  return json(results);
}

export async function getShow(env, id) {
  const row = await env.DB_skaters.prepare(
    `SELECT s.*, sk.discipline, sk.bio
     FROM shows s
     JOIN skaters sk ON s.skater_id = sk.id
     WHERE s.id = ?`
  ).bind(id).first();

  if (!row) return json({ error: "Show not found" }, 404);

  return json(row);
}

export async function skaterDashboard(request, env, user) {
  const skater = await env.DB_skaters.prepare(
    "SELECT * FROM skaters WHERE user_id = ?"
  ).bind(user.id).first();

  const shows = await env.DB_skaters.prepare(
    "SELECT * FROM shows WHERE skater_id = ? ORDER BY created_at DESC"
  ).bind(skater.id).all();

  return json({
    skater,
    shows: shows.results
  });
}

export async function listSkaterShows(request, env, user) {
  const skater = await env.DB_skaters.prepare(
    "SELECT id FROM skaters WHERE user_id = ?"
  ).bind(user.id).first();

  const { results } = await env.DB_skaters.prepare(
    "SELECT * FROM shows WHERE skater_id = ? ORDER BY created_at DESC"
  ).bind(skater.id).all();

  return json(results);
}

export async function createShow(request, env, user) {
  const { title, description, premiere_date, price_cents, thumbnail, video_url } =
    await request.json();

  if (!title) return json({ error: "Missing title" }, 400);

  const skater = await env.DB_skaters.prepare(
    "SELECT id FROM skaters WHERE user_id = ?"
  ).bind(user.id).first();

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB_skaters.prepare(
    `INSERT INTO shows (id, skater_id, title, description, price_cents, thumbnail, video_url, premiere_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, skater.id, title, description, price_cents, thumbnail, video_url, premiere_date, now).run();

  return json({ success: true, showId: id });
}

export async function updateSkaterProfile(request, env, user) {
  const { discipline, bio, profile_image, clip_url } = await request.json();

  const skater = await env.DB_skaters.prepare(
    "SELECT id FROM skaters WHERE user_id = ?"
  ).bind(user.id).first();

  await env.DB_skaters.prepare(
    `UPDATE skaters SET discipline = ?, bio = ?, profile_image = ?, clip_url = ?
     WHERE id = ?`
  ).bind(discipline, bio, profile_image, clip_url, skater.id).run();

  return json({ success: true });
}
