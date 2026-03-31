import { apiJson, requireRole } from "../users.js";

/* ============================================================
   OWNER: OVERVIEW
============================================================ */
export async function ownerOverview(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    return apiJson({ message: "Owner overview" });
  });
}

/* ============================================================
   OWNER: USERS
============================================================ */
export async function ownerUsers(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const { results } = await env.DB_users.prepare(
      "SELECT id, email, role, created_at FROM users ORDER BY created_at DESC"
    ).all();
    return apiJson({ users: results || [] });
  });
}

/* ============================================================
   OWNER: SKATERS
============================================================ */
export async function ownerSkaters(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const { results } = await env.DB_skaters.prepare(
      "SELECT * FROM skaters ORDER BY created_at DESC"
    ).all();
    return apiJson({ skaters: results || [] });
  });
}

/* ============================================================
   OWNER: BUSINESSES
============================================================ */
export async function ownerBusinesses(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const { results } = await env.DB_business.prepare(
      "SELECT * FROM businesses ORDER BY submitted_at DESC"
    ).all();
    return apiJson({ businesses: results || [] });
  });
}

/* ============================================================
   OWNER: MUSICIANS
============================================================ */
export async function ownerMusicians(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const { results } = await env.DB_musician.prepare(
      "SELECT * FROM musicians ORDER BY created_at DESC"
    ).all();
    return apiJson({ musicians: results || [] });
  });
}

/* ============================================================
   OWNER: SHOWS
============================================================ */
export async function ownerShows(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const { results } = await env.DB_shows.prepare(
      "SELECT * FROM shows ORDER BY created_at DESC"
    ).all();
    return apiJson({ shows: results || [] });
  });
}

/* ============================================================
   OWNER: CONTRACTS
============================================================ */
export async function ownerContracts(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const { results } = await env.DB_business.prepare(
      "SELECT * FROM contracts ORDER BY created_at DESC"
    ).all();
    return apiJson({ contracts: results || [] });
  });
}

/* ============================================================
   OWNER: MUSIC
============================================================ */
export async function ownerMusic(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const { results } = await env.DB_musician.prepare(
      "SELECT * FROM tracks ORDER BY created_at DESC"
    ).all();
    return apiJson({ tracks: results || [] });
  });
}

/* ============================================================
   OWNER: BRANDING SETTINGS
============================================================ */
export async function ownerSettingsBranding(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    return apiJson({ message: "Branding settings" });
  });
}

/* ============================================================
   OWNER: NOTES SETTINGS
============================================================ */
export async function ownerSettingsNotes(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    return apiJson({ message: "Notes settings" });
  });
}

/* ============================================================
   OWNER: ADS LIST
============================================================ */
export async function ownerAds(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const { results } = await env.DB_business.prepare(
      "SELECT * FROM ads ORDER BY created_at DESC"
    ).all();
    return apiJson({ ads: results || [] });
  });
}

/* ============================================================
   OWNER: UPDATE AD STATUS
============================================================ */
export async function ownerUpdateAdStatus(request, env) {
  return requireRole(request, env, ["owner"], async (req, env) => {
    const body = await req.json().catch(() => ({}));
    const { adId, status } = body;

    await env.DB_business.prepare(
      "UPDATE ads SET status = ? WHERE id = ?"
    ).bind(status, adId).run();

    return apiJson({ adId, status });
  });
}

/* ============================================================
   OWNER: SPONSORSHIPS
============================================================ */
export async function ownerSponsorships(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const { results } = await env.DB_business.prepare(
      "SELECT * FROM sponsorships ORDER BY created_at DESC"
    ).all();
    return apiJson({ sponsorships: results || [] });
  });
}

/* ============================================================
   OWNER: BUSINESS APPLICATIONS (PENDING + NEEDS INFO)
============================================================ */
export async function ownerBusinessApplications(request, env) {
  return requireRole(request, env, ["owner"], async (_req, env) => {
    const { results } = await env.DB_business.prepare(
      `SELECT b.*, u.email AS owner_email, u.name AS owner_name
       FROM businesses b
       JOIN users u ON b.user_id = u.id
       WHERE b.review_status IN ('pending','needs_info')
       ORDER BY b.submitted_at DESC`
    ).all();

    return apiJson({ applications: results || [] });
  });
}

/* ============================================================
   OWNER: UPDATE BUSINESS APPLICATION STATUS
============================================================ */
export async function ownerBusinessUpdateStatus(request, env) {
  return requireRole(request, env, ["owner"], async (req, env) => {
    const body = await req.json().catch(() => ({}));
    const { businessId, action, notes } = body;

    const valid = ["approve", "reject", "needs_info"];
    if (!valid.includes(action)) {
      return apiJson({ message: "Invalid action" }, 400);
    }

    let verified = 0;
    let review_status = action === "approve"
      ? "approved"
      : action === "reject"
      ? "rejected"
      : "needs_info";

    await env.DB_business.prepare(
      `UPDATE businesses
       SET verified = ?, review_status = ?, review_notes = ?
       WHERE id = ?`
    ).bind(
      verified,
      review_status,
      notes || "",
      businessId
    ).run();

    return apiJson({ businessId, review_status, verified });
  });
}
