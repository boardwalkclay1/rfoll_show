// users.js — AUTH HELPERS, PBKDF2 VERIFY, ROLE GUARD, SIGNUP BASE
// Updated to be explicit about responsibilities: signupBase creates users row only.
// Profile creation for business must be handled by signupBusiness in business.js
export function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-user-id, x-user-role"
  };
}

export function apiJson(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors() }
  });
}

const AUTH_URL = "https://rollshow-auth.boardwalkclay1.workers.dev";

// PBKDF2 VERIFY — boolean result
export async function verify(password, hashValue, saltValue, iterations, env) {
  try {
    const payload = {
      password,
      hash: hashValue,
      salt: saltValue,
      iterations: Number(iterations) || 100000
    };

    const res = await fetch(`${AUTH_URL}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const contentType = res.headers.get("Content-Type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(`AUTH worker returned non-JSON: ${contentType}`);
    }

    const data = await res.json();
    if (!data || data.success !== true) return false;
    return data.ok === true;
  } catch (err) {
    return false;
  }
}

// ROLE CHECKER (middleware style)
// Expects x-user-id and x-user-role headers to be set by upstream auth/session layer.
export async function requireRole(request, env, roles, handler) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId || !userRole || !roles.includes(userRole)) {
      return apiJson({ success: false, message: "Unauthorized" }, 401);
    }

    const result = await handler(request, env, {
      id: userId,
      role: userRole
    });

    return apiJson(result);
  } catch (err) {
    return apiJson(
      { success: false, message: "Server error", detail: String(err) },
      500
    );
  }
}

// BASE SIGNUP (creates users row only)
// - role is required (string)
// - expects JSON body: { name, email, password }
// - uses AUTH_URL /hash to obtain pbkdf2 hash/salt/iterations
// - inserts into users table (id, name, email, role, password_hash, password_salt, password_iterations, password_algo, created_at)
// - returns { success: true, user: { id, name, email, role, created_at } } on 201
export async function signupBase(request, env, role) {
  try {
    const body = await request.json();
    const { name, email, password } = body || {};

    if (!email || !password) {
      return apiJson({ success: false, message: "Missing fields" }, 400);
    }

    // Normalize email
    const normalizedEmail = String(email).trim().toLowerCase();

    // Get hash from auth worker
    const hashRes = await fetch(`${AUTH_URL}/hash`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!hashRes.ok) {
      return apiJson({ success: false, message: "Hash service error" }, 502);
    }

    const hashData = await hashRes.json();
    if (!hashData || hashData.success !== true) {
      return apiJson({ success: false, message: "Hash failed" }, 500);
    }

    const { hash, salt, iterations } = hashData;
    if (!hash || !salt || !iterations) {
      return apiJson({ success: false, message: "Invalid hash response" }, 500);
    }

    // Generate id server-side
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // Insert user row (D1 / SQLite compatible)
    const insertSql = `
      BEGIN;
      INSERT INTO users (id, name, email, role, password_hash, password_salt, password_iterations, password_algo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pbkdf2', ?);
      COMMIT;
    `;

    try {
      await env.DB_roll.prepare(insertSql)
        .bind(id, name || null, normalizedEmail, role, hash, salt, Number(iterations), createdAt)
        .run();
    } catch (dbErr) {
      const msg = String(dbErr).toLowerCase();
      if (msg.includes("unique") || msg.includes("constraint") || msg.includes("email")) {
        return apiJson({ success: false, message: "Email already in use" }, 409);
      }
      return apiJson({ success: false, message: "Database error", detail: String(dbErr) }, 500);
    }

    // Return created user minimal public info
    return apiJson({ success: true, user: { id, name: name || null, email: normalizedEmail, role, created_at: createdAt } }, 201);
  } catch (err) {
    return apiJson(
      { success: false, message: "Server error", detail: String(err) },
      500
    );
  }
}
