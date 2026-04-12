// /api/login.js — FULL REBUILD (PBKDF2, BOOLEAN VERIFY)

import { apiJson, verify } from "../users.js";

export default async function login(request, env) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return apiJson({ success: false, message: "Missing credentials" }, 400);
    }

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

    let isValid;
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

    const is_owner =
      row.role === "owner" ||
      row["owner-1"] == 1 ||
      row["owner-1"] === true;

    return apiJson({
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
  } catch (err) {
    console.error("Login handler error", String(err));
    return apiJson(
      { success: false, message: "Server error", detail: String(err) },
      500
    );
  }
}
