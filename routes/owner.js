import { json } from "../utils.js";
import { requireRole } from "../users.js";

/* ============================================================
   OWNER OVERVIEW (DASHBOARD CARDS)
============================================================ */
export async function ownerOverview(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const total_users = await env.DB_users
      .prepare("SELECT COUNT(*) AS c FROM users")
      .first();

    const total_skaters = await env.DB_users
      .prepare("SELECT COUNT(*) AS c FROM users WHERE role='skater'")
      .first();

    const total_businesses = await env.DB_users
      .prepare("SELECT COUNT(*) AS c FROM users WHERE role='business'")
      .first();

    const total_musicians = await env.DB_users
      .prepare("SELECT COUNT(*) AS c FROM users WHERE role='musician'")
      .first();

    const total_shows = await env.DB_shows
      .prepare("SELECT COUNT(*) AS c FROM shows")
      .first();

    const total_tickets = await env.DB_shows
      .prepare("SELECT COALESCE(SUM(tickets_sold),0) AS c FROM shows")
      .first();

    const total_purchases = await env.DB_purchases
      .prepare("SELECT COUNT(*) AS c FROM purchases")
      .first();

    const total_revenue = await env.DB_purchases
      .prepare("SELECT COALESCE(SUM(amount),0) AS c FROM purchases")
      .first();

    return json({
      total_users: total_users.c,
      total_skaters: total_skaters.c,
      total_businesses: total_businesses.c,
      total_musicians: total_musicians.c,
      total_shows: total_shows.c,
      total_tickets: total_tickets.c,
      total_purchases: total_purchases.c,
      total_revenue: total_revenue.c
    });
  });
}

/* ============================================================
   OWNER USERS LIST
============================================================ */
export async function ownerUsers(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const rows = await env.DB_users
      .prepare("SELECT id, email, role, created_at FROM users ORDER BY created_at DESC")
      .all();
    return json({ users: rows.results || [] });
  });
}

/* ============================================================
   OWNER SKATERS LIST
============================================================ */
export async function ownerSkaters(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const rows = await env.DB_users
      .prepare("SELECT id, email, created_at FROM users WHERE role='skater' ORDER BY created_at DESC")
      .all();
    return json({ skaters: rows.results || [] });
  });
}

/* ============================================================
   OWNER BUSINESSES LIST
============================================================ */
export async function ownerBusinesses(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const rows = await env.DB_users
      .prepare("SELECT id, email, created_at FROM users WHERE role='business' ORDER BY created_at DESC")
      .all();
    return json({ businesses: rows.results || [] });
  });
}

/* ============================================================
   OWNER MUSICIANS LIST
============================================================ */
export async function ownerMusicians(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const rows = await env.DB_users
      .prepare("SELECT id, email, created_at FROM users WHERE role='musician' ORDER BY created_at DESC")
      .all();
    return json({ musicians: rows.results || [] });
  });
}

/* ============================================================
   OWNER SHOWS LIST
============================================================ */
export async function ownerShows(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const rows = await env.DB_shows
      .prepare("SELECT id, title, date, location FROM shows ORDER BY date DESC")
      .all();
    return json({ shows: rows.results || [] });
  });
}

/* ============================================================
   OWNER CONTRACTS LIST
============================================================ */
export async function ownerContracts(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const rows = await env.DB_contracts
      .prepare("SELECT id, skater_id, business_id, status, created_at FROM contracts ORDER BY created_at DESC")
      .all();
    return json({ contracts: rows.results || [] });
  });
}

/* ============================================================
   OWNER MUSIC LIBRARY
============================================================ */
export async function ownerMusic(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const rows = await env.DB_music
      .prepare("SELECT id, title, artist_id, created_at FROM tracks ORDER BY created_at DESC")
      .all();
    return json({ tracks: rows.results || [] });
  });
}

/* ============================================================
   OWNER SETTINGS: BRANDING
============================================================ */
export async function ownerSettingsBranding(request, env) {
  return requireRole(request, env, ["owner"], async (req, env) => {
    const body = await req.json().catch(() => ({}));
    const { primary_color, accent_color, logo_url } = body;

    await env.DB_settings
      .prepare(
        `INSERT INTO branding (id, primary_color, accent_color, logo_url)
         VALUES (1, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           primary_color=excluded.primary_color,
           accent_color=excluded.accent_color,
           logo_url=excluded.logo_url`
      )
      .bind(primary_color || null, accent_color || null, logo_url || null)
      .run();

    return json({ ok: true });
  });
}

/* ============================================================
   OWNER SETTINGS: NOTES
============================================================ */
export async function ownerSettingsNotes(request, env) {
  return requireRole(request, env, ["owner"], async (req, env) => {
    const body = await req.json().catch(() => ({}));
    const { notes } = body;

    await env.DB_settings
      .prepare(
        `INSERT INTO owner_notes (id, notes)
         VALUES (1, ?)
         ON CONFLICT(id) DO UPDATE SET notes=excluded.notes`
      )
      .bind(notes || "")
      .run();

    return json({ ok: true });
  });
}
