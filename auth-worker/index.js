// auth-worker/index.js — bcrypt-edge auth worker (tight, minimal, consistent responses)

import { genSaltSync, hashSync, compareSync } from "bcrypt-edge";

// CORS
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://roll-show.pages.dev",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS
    }
  });
}

function normalizeEmail(raw) {
  if (!raw) return "";
  return String(raw).trim().toLowerCase();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const rawPath = (url.pathname || "").replace(/\/+$/, "");
    const method = (request.method || "GET").toUpperCase();

    // CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    try {
      // Health check
      if (method === "GET" && (rawPath === "" || rawPath === "/health")) {
        return jsonResponse({ success: true, message: "Auth worker (bcrypt) online" }, 200);
      }

      async function parseJson(req) {
        try { return await req.json(); } catch { return null; }
      }

      // POST /api/hash
      if (method === "POST" && rawPath === "/api/hash") {
        const body = await parseJson(request);
        if (!body?.password) return jsonResponse({ success: false, error: "Missing password" }, 400);
        const hash = hashSync(String(body.password), genSaltSync(10));
        return jsonResponse({ success: true, hash }, 200);
      }

      // POST /api/verify
      if (method === "POST" && rawPath === "/api/verify") {
        const body = await parseJson(request);
        if (!body?.password || !body?.hash) return jsonResponse({ success: false, error: "Missing fields" }, 400);
        const ok = compareSync(String(body.password), String(body.hash));
        return jsonResponse({ success: true, match: !!ok }, 200);
      }

      // POST /api/signup
      if (method === "POST" && rawPath === "/api/signup") {
        const body = await parseJson(request);
        if (!body) return jsonResponse({ success: false, error: "Invalid JSON" }, 400);

        const email = normalizeEmail(body.email);
        const password = String(body.password || "");
        const role = String(body.role || "user");

        if (!email || !password) return jsonResponse({ success: false, error: "Missing email or password" }, 400);

        const existsQ = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).all();
        if (existsQ?.results?.length) return jsonResponse({ success: false, error: "Email already registered" }, 409);

        const hash = hashSync(password, genSaltSync(10));

        try {
          await env.DB.prepare(
            `INSERT INTO users (email, password_hash, role, created_at)
             VALUES (?, ?, ?, ?)`
          ).bind(email, hash, role, new Date().toISOString()).run();
        } catch (err) {
          const msg = String(err).toLowerCase();
          if (msg.includes("unique") || msg.includes("constraint")) {
            return jsonResponse({ success: false, error: "Email already registered" }, 409);
          }
          return jsonResponse({ success: false, error: "Database error", detail: String(err) }, 500);
        }

        const q = await env.DB.prepare(
          "SELECT id, email, role, created_at FROM users WHERE email = ?"
        ).bind(email).all();

        const user = q?.results?.[0];
        if (!user) return jsonResponse({ success: false, error: "Signup succeeded but user not found" }, 500);

        return jsonResponse({ success: true, user }, 201);
      }

      // POST /api/login
      if (method === "POST" && rawPath === "/api/login") {
        const body = await parseJson(request);
        if (!body) return jsonResponse({ success: false, error: "Invalid JSON" }, 400);

        const email = normalizeEmail(body.email);
        const password = String(body.password || "");

        if (!email || !password) return jsonResponse({ success: false, error: "Missing email or password" }, 400);

        const q = await env.DB.prepare(
          "SELECT id, email, password_hash, role, created_at FROM users WHERE email = ?"
        ).bind(email).all();

        const user = q?.results?.[0];
        if (!user) return jsonResponse({ success: false, error: "Invalid credentials" }, 401);

        if (!compareSync(password, user.password_hash)) {
          return jsonResponse({ success: false, error: "Invalid credentials" }, 401);
        }

        return jsonResponse({ success: true, user }, 200);
      }

      return jsonResponse({ success: false, error: "Not found" }, 404);

    } catch (err) {
      return jsonResponse({ success: false, error: "Server error", detail: String(err) }, 500);
    }
  }
};
