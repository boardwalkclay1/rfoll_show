// /api/login.js — REWORKED to match user-first/profile-after flow
// - Verifies PBKDF2 via auth worker (verify())
// - Returns normalized user object
// - Sets a secure, HttpOnly session cookie (simple signed payload) so client can call profile endpoints
// - Does not leak whether an email exists on failure

import { cors, apiJson, verify } from "../users.js";

const SESSION_COOKIE_NAME = "rs_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function makeSessionCookieValue(payload) {
  // Minimal session payload encoding. In production replace with a real signed token.
  try {
    const json = JSON.stringify(payload);
    // btoa is available in Workers runtime
    return globalThis.btoa(json);
  } catch {
    return "";
  }
}

function makeSetCookieHeader(value) {
  // HttpOnly, Secure, SameSite=Strict, Path=/, Max-Age
  // Note: Secure requires HTTPS in browsers.
  return `${SESSION_COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE}`;
}

export default async function login(request, env) {
  try {
    const body = await request.json().catch(() => null);
    const emailRaw = body && body.email ? String(body.email).trim() : "";
    const password = body && body.password ? String(body.password) : "";

    if (!emailRaw || !password) {
      return apiJson({ success: false, message: "Missing credentials" }, 400);
    }

    const email = emailRaw.toLowerCase();

    // Fetch user by email (parameter binding)
    const row = await env.DB_roll
      .prepare("SELECT * FROM users WHERE email = ?")
      .bind(email)
      .first();

    // If no row, respond with generic invalid credentials (do not reveal existence)
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

    let isValid = false;
    try {
      isValid = await verify(
        password,
        row.password_hash,
        row.password_salt,
        iterations,
        env
      );
    } catch (err) {
      console.error("verify() error", String(err));
      return apiJson(
        {
          success: false,
          message: "Server error",
          detail: "Authentication backend returned an unexpected response"
        },
        500
      );
    }

    if (isValid !== true) {
      return apiJson({ success: false, message: "Invalid credentials" }, 401);
    }

    // Normalize role and owner flag
    const role = row.role || "user";
    const is_owner =
      role === "owner" ||
      row["owner-1"] === 1 ||
      row["owner-1"] === "1" ||
      row["is_owner"] === 1 ||
      row["is_owner"] === "true" ||
      row["is_owner"] === true;

    const user = {
      id: row.id,
      name: row.name || null,
      email: row.email || email,
      role,
      is_owner,
      created_at: row.created_at || null
    };

    // Create a minimal session payload and set cookie.
    // IMPORTANT: This is a simple encoded payload for the example.
    // Replace with a signed JWT or server-side session store in production.
    const sessionPayload = { id: user.id, role: user.role, ts: Date.now() };
    const cookieValue = makeSessionCookieValue(sessionPayload);
    const setCookie = makeSetCookieHeader(cookieValue);

    // Provide a role-based redirect hint for the client (optional)
    const redirectMap = {
      owner: "/pages/owner/owner-dashboard.html",
      business: "/pages/business/business-dashboard.html",
      buyer: "/pages/buyer/buyer-dashboard.html",
      skater: "/pages/skater/skater-dashboard.html",
      musician: "/pages/musician/musician-dashboard.html",
      user: "/"
    };
    const redirect = redirectMap[user.role] || "/";

    // Build response with Set-Cookie and CORS headers
    const headers = {
      "Content-Type": "application/json",
      ...cors(),
      "Set-Cookie": setCookie
    };

    return new Response(JSON.stringify({ success: true, user, redirect }), {
      status: 200,
      headers
    });
  } catch (err) {
    console.error("Login handler error", String(err));
    return apiJson(
      { success: false, message: "Server error", detail: String(err) },
      500
    );
  }
}
