// /api/login.js — DEFENSIVE VERSION

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

    if (!row.password_hash) {
      return apiJson(
        { success: false, message: "User has no password_hash" },
        500
      );
    }

    // Defensive verify call: catch and log any upstream/non-JSON errors
    let valid;
    try {
      valid = await verify(password, row.password_hash, env);
    } catch (verifyErr) {
      try {
        console.error("verify() threw an error", {
          message: String(verifyErr),
          // best-effort: include any extra fields the error may carry
          ...(verifyErr && typeof verifyErr === "object" ? verifyErr : {})
        });
      } catch (logErr) {
        console.error("Failed to serialize verify error", String(logErr));
      }

      return apiJson(
        {
          success: false,
          message: "Server error",
          detail: "Authentication backend returned an unexpected response"
        },
        500
      );
    }

    // If verify returned something unexpected, treat as failure
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
    } catch (logErr) {
      // swallow logging errors
    }
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
