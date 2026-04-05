/* ============================================================
   LOGIN (FIXED FOR owner-1 COLUMN)
============================================================ */
export async function login(request, env) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return apiJson({ message: "Missing credentials" }, 400);
    }

    const row = await env.DB_users.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).bind(email).first();

    if (!row) {
      return apiJson({ message: "Invalid credentials" }, 401);
    }

    if (!row.password_hash) {
      return apiJson({ message: "User has no password_hash" }, 500);
    }

    const valid = await verify(password, row.password_hash, env);
    if (!valid) {
      return apiJson({ message: "Invalid credentials" }, 401);
    }

    // 🔥 FIX: use the real column name
    const is_owner =
      row.role === "owner" ||
      row["owner-1"] == 1 ||
      row["owner-1"] === true;

    return apiJson({
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        is_owner,
        created_at: row.created_at
      }
    });

  } catch (err) {
    return apiJson(
      { message: "Server error", detail: String(err) },
      500
    );
  }
}
