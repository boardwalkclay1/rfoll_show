import { json, getUserId, hash, verify } from "./utils.js";

/* ============================================================
   BASE SIGNUP (ALL ROLES)
============================================================ */
export async function signupBase(env, { name, email, password, role }) {
  if (!name || !email || !password || !role) {
    return { error: "Missing fields" };
  }

  // Email must be unique
  const exists = await env.DB_users.prepare(
    "SELECT id FROM users WHERE email = ?"
  ).bind(email).first();

  if (exists) {
    return { error: "Email already registered" };
  }

  const id = crypto.randomUUID();
  const created = new Date().toISOString();
  const hashed = await hash(password);

  await env.DB_users.prepare(
    `INSERT INTO users (id, name, email, password_hash, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, name, email, hashed, role, created).run();

  return { id, name, email, role, created_at: created };
}

/* ============================================================
   LOGIN — RETURNS OWNER FLAG
============================================================ */
export async function login(request, env) {
  const { email, password } = await request.json();

  const row = await env.DB_users.prepare(
    "SELECT * FROM users WHERE email = ?"
  ).bind(email).first();

  if (!row) {
    return json({ success: false, error: "Invalid credentials" }, 401);
  }

  const valid = await verify(password, row.password_hash);
  if (!valid) {
    return json({ success: false, error: "Invalid credentials" }, 401);
  }

  // OWNER FLAG
  const is_owner = row.role === "owner" || row.is_owner === 1;

  return json({
    success: true,
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      is_owner,
      created_at: row.created_at
    }
  });
}

/* ============================================================
   ROLE GUARD — OWNER BYPASS
============================================================ */
export async function requireRole(request, env, allowedRoles, handler) {
  const userId = getUserId(request);
  if (!userId) {
    return json({ error: "Unauthorized" }, 401);
  }

  const user = await env.DB_users.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(userId).first();

  if (!user) {
    return json({ error: "Unauthorized" }, 401);
  }

  // OWNER BYPASS — FULL ACCESS
  if (user.role === "owner" || user.is_owner === 1) {
    return handler(request, env, user);
  }

  // Normal role check
  if (!allowedRoles.includes(user.role)) {
    return json({ error: "Forbidden" }, 403);
  }

  return handler(request, env, user);
}
