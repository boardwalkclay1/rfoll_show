// /api/login.js — PBKDF2 VERSION (ACCEPTS ok: true)

import { apiJson, verify } from "../users.js";

export default async function login(request, env) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return apiJson(
        { success: false, message: "Missing credentials" },
        400
      );
    }

    const row = await env.DB_roll
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

    const iterations = Number(row.password_iterations) || 100000;

    let verifyResp;
    try {
      verifyResp = await verify(
        password,
        row.password_hash,
        row.password_salt,
        iterations,
        env
      );
    } catch (verifyErr) {
      try {
        console.error("verify() threw an error", {
          message: String(verifyErr),
          ...(verifyErr && typeof verifyErr === "object" ? verifyErr : {})
        });
      } catch {}

      return apiJson(
        {
          success: false,
          message: "Server error",
          detail: "Authentication backend returned an unexpected response"
        },
        500
      );
    }

    // Accept either verified:true OR ok:true
    const valid =
      verifyResp &&
      verifyResp.success === true &&
      (verifyResp.verified === true || verifyResp.ok === true);

    if (!valid) {
      return apiJson(
        { success: false, message: "Invalid credentials" },
        401
      );
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
    try {
      console.error("Login handler error", { err: String(err) });
    } catch {}

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
