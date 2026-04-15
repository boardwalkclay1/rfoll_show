// /api/login.js — NEW CLEAN VERSION (FULLY FIXED)
import { cors, apiJson, verify } from "../users.js";

const SESSION_COOKIE_NAME = "rs_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function makeSessionCookieValue(payload) {
  return btoa(JSON.stringify(payload));
}

function makeSetCookieHeader(value) {
  return `${SESSION_COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${SESSION_MAX_AGE}`;
}

export default async function login(request, env) {
  try {
    // ----------------------------------------------------
    // SAFE JSON PARSE (never throws)
    // ----------------------------------------------------
    let body = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }

    // If body is null, not an object, or missing fields → reject
    if (!body || typeof body !== "object") {
      return apiJson({ success: false, message: "Missing credentials" }, 400);
    }

    const emailRaw = (body.email || "").trim();
    const password = body.password || "";

    if (!emailRaw || !password) {
      return apiJson({ success: false, message: "Missing credentials" }, 400);
    }

    const email = emailRaw.toLowerCase();

    // ----------------------------------------------------
    // FETCH USER FROM D1
    // ----------------------------------------------------
    const row = await env.DB_roll
      .prepare("SELECT * FROM users WHERE email = ?")
      .bind(email)
      .first();

    if (!row) {
      return apiJson({ success: false, message: "Invalid credentials" }, 401);
    }

    if (!row.password_hash || !row.password_salt) {
      return apiJson(
        { success: false, message: "User missing PBKDF2 fields" },
        500
      );
    }

    const iterations = Number(row.password_iterations) || 100000;

    // ----------------------------------------------------
    // VERIFY PASSWORD USING AUTH WORKER
    // ----------------------------------------------------
    const isValid = await verify(
      password,
      row.password_hash,
      row.password_salt,
      iterations,
      env
    );

    if (!isValid) {
      return apiJson({ success: false, message: "Invalid credentials" }, 401);
    }

    // ----------------------------------------------------
    // NORMALIZE ROLE + OWNER FLAG
    // ----------------------------------------------------
    const role = row.role || "user";

    const is_owner =
      role === "owner" ||
      row["owner-1"] === 1 ||
      row["is_owner"] === 1 ||
      row["is_owner"] === true;

    const user = {
      id: row.id,
      name: row.name || null,
      email: row.email,
      role,
      is_owner,
      created_at: row.created_at
    };

    // ----------------------------------------------------
    // CREATE SESSION COOKIE
    // ----------------------------------------------------
    const sessionPayload = { id: user.id, role: user.role, ts: Date.now() };
    const cookieValue = makeSessionCookieValue(sessionPayload);
    const setCookie = makeSetCookieHeader(cookieValue);

    // ----------------------------------------------------
    // REDIRECT MAP
    // ----------------------------------------------------
    const redirectMap = {
      owner: "/pages/owner/owner-dashboard.html",
      business: "/pages/business/business-dashboard.html",
      buyer: "/pages/buyer/buyer-dashboard.html",
      skater: "/pages/skater/skater-dashboard.html",
      musician: "/pages/musician/musician-dashboard.html",
      user: "/"
    };

    const redirect = redirectMap[user.role] || "/";

    // ----------------------------------------------------
    // FINAL RESPONSE (CORS + COOKIE)
    // ----------------------------------------------------
    return new Response(
      JSON.stringify({ success: true, user, redirect }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...cors(),
          "Set-Cookie": setCookie,
          "x-user-id": user.id,
          "x-user-role": user.role
        }
      }
    );

  } catch (err) {
    console.error("Login handler error:", String(err));
    return apiJson(
      { success: false, message: "Server error", detail: String(err) },
      500
    );
  }
}
