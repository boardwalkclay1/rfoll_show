// users.js — AUTH HELPERS, PBKDF2 VERIFY, ROLE GUARD, SIGNUP BASE + signupBusiness
// Responsibilities:
// - signupBase: creates users row only (used by skater and others when appropriate)
// - signupBusiness: creates users row first, then attempts to create business_profiles row
//   If profile creation fails, the user row remains (client will retry profile creation).
//   signupBusiness returns a clear flag `profile_created` so client knows whether to call profile endpoint.

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

// ============================================================
// BUSINESS SIGNUP (user-first, then profile)
// Behavior:
// 1) Accepts JSON body containing users fields and optionally the profile fields.
//    Expected body shape:
//    { name, email, password, role, company_name, contact_name, contact_email, country }
// 2) Creates the users row first (using the same PBKDF2 hash flow).
// 3) Only if user creation succeeds, attempts to create a business_profiles row
//    with exactly the four allowed columns: company_name, contact_name, contact_email, country.
// 4) If profile creation succeeds, returns success:true and profile_created:true.
//    If profile creation fails, returns success:true (user created) and profile_created:false
//    plus a profile_error message so the client can retry profile creation separately.
// Notes:
// - The server never accepts user_id from the client; user_id is derived server-side.
// - This implements the "create user first; only then attempt profile" policy.
// - The client can rely on the response shape to decide whether to call the profile endpoint.
export async function signupBusiness(request, env) {
  try {
    const body = await request.json();
    const { name, email, password } = body || {};

    // Validate required user fields
    if (!email || !password) {
      return apiJson({ success: false, message: "Missing user fields" }, 400);
    }

    // Normalize email
    const normalizedEmail = String(email).trim().toLowerCase();

    // 1) Get hash from auth worker
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

    // 2) Create users row
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const insertUserSql = `
      BEGIN;
      INSERT INTO users (id, name, email, role, password_hash, password_salt, password_iterations, password_algo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pbkdf2', ?);
      COMMIT;
    `;

    try {
      await env.DB_roll.prepare(insertUserSql)
        .bind(id, name || null, normalizedEmail, "business", hash, salt, Number(iterations), createdAt)
        .run();
    } catch (dbErr) {
      const msg = String(dbErr).toLowerCase();
      if (msg.includes("unique") || msg.includes("constraint") || msg.includes("email")) {
        return apiJson({ success: false, message: "Email already in use" }, 409);
      }
      return apiJson({ success: false, message: "Database error", detail: String(dbErr) }, 500);
    }

    // Build minimal user object to return
    const userObj = { id, name: name || null, email: normalizedEmail, role: "business", created_at: createdAt };

    // 3) Attempt to create business_profiles row only if profile fields are present
    // Accept only the four allowed fields from the request body
    const company_name = body.company_name ? String(body.company_name).trim() : null;
    const contact_name = body.contact_name ? String(body.contact_name).trim() : null;
    const contact_email = body.contact_email ? String(body.contact_email).trim() : null;
    const country = body.country ? String(body.country).trim() : null;

    // If no profile fields provided, return success with profile_created:false so client can call profile endpoint
    if (!company_name && !contact_name && !contact_email && !country) {
      return apiJson({ success: true, user: userObj, profile_created: false }, 201);
    }

    // Validate required profile fields server-side before attempting insert
    if (!company_name || !contact_name || !contact_email || !country) {
      // Profile incomplete — return user created but profile not created
      return apiJson({
        success: true,
        user: userObj,
        profile_created: false,
        profile_error: "Incomplete profile fields"
      }, 201);
    }

    // Insert profile row (user_id derived from created user)
    const insertProfileSql = `
      BEGIN;
      INSERT INTO business_profiles (id, user_id, company_name, contact_name, contact_email, country, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?);
      COMMIT;
    `;

    const profileId = crypto.randomUUID();
    const profileCreatedAt = new Date().toISOString();

    try {
      await env.DB_roll.prepare(insertProfileSql)
        .bind(profileId, id, company_name, contact_name, contact_email, country, profileCreatedAt)
        .run();

      // success: both user and profile created
      return apiJson({
        success: true,
        user: userObj,
        profile_created: true,
        profile: { id: profileId, user_id: id, company_name, contact_name, contact_email, country, created_at: profileCreatedAt }
      }, 201);
    } catch (profileErr) {
      // If profile insert fails (e.g., unique constraint on user_id), keep the user and return profile_created:false
      const msg = String(profileErr).toLowerCase();
      if (msg.includes("unique") || msg.includes("constraint") || /business_profiles/.test(msg)) {
        // Profile already exists for this user — treat as success (idempotent)
        return apiJson({
          success: true,
          user: userObj,
          profile_created: true,
          profile_exists: true
        }, 201);
      }

      // Other profile error: keep user and return profile_failed info so client can retry profile creation
      return apiJson({
        success: true,
        user: userObj,
        profile_created: false,
        profile_error: String(profileErr)
      }, 201);
    }
  } catch (err) {
    return apiJson(
      { success: false, message: "Server error", detail: String(err) },
      500
    );
  }
}
