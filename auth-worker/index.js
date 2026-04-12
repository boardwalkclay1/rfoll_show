// /api/login.js — PBKDF2 VERSION (FINAL)

import { apiJson } from "../users.js";

export default async function login(request, env) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return apiJson(
        { success: false, message: "Missing credentials" },
        400
      );
    }

    // Fetch user
    const row = await env.DB_users
      .prepare("SELECT * FROM users WHERE email = ?")
      .bind(email)
      .first();

    if (!row) {
      return apiJson(
        { success: false, message: "Invalid credentials" },
        401
      );
    }

    if (!row.password_hash || !row.password_salt) {
      return apiJson(
        { success: false, message: "User missing PBKDF2 fields" },
        500
      );
    }

    // PBKDF2 VERIFY via AUTH WORKER
    const verifyRes = await fetch(env.AUTH_URL + "/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        hash: row.password_hash,
        salt: row.password_salt
      })
    });

    const { ok } = await verifyRes.json();

    if (!ok) {
      return apiJson(
        { success: false, message: "Invalid credentials" },
        401
      );
    }

    // Owner flag
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
    return apiJson(
      {
        success: false,
        message: "Server error",
        detail: String(err)
      },
      500
    );
  }
}
