// buyers.js — signupBuyer (minimal, user-first then profile) + safe API factory
import { apiJson } from "./users.js";
import { signupBase } from "./users.js"; // ensure this export matches users.js

export async function signupBuyer(request, env) {
  try {
    const body = await request.json().catch(() => ({}));

    // Server-side password confirmation (authoritative)
    const password = body.password || null;
    const password_verify = body.password_verify || body.passwordConfirm || null;
    if (!password || !password_verify || password !== password_verify) {
      return apiJson({ success: false, message: "Passwords do not match" }, 400);
    }

    // Ensure role is buyer for the users row
    const signupReqBody = {
      name: body.name || null,
      email: body.email,
      password: password,
      role: "buyer"
    };

    // Call signupBase and parse its JSON response
    const signupRes = await signupBase(
      new Request(request.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(signupReqBody) }),
      env,
      "buyer"
    );

    // If signupBase returned a Response object, parse it; otherwise assume it's already an object
    let base;
    if (signupRes && typeof signupRes.json === "function") {
      base = await signupRes.json().catch(() => null);
    } else {
      base = signupRes;
    }

    if (!base || base.success !== true || !base.user) {
      // Normalize error message
      const msg = (base && (base.message || (base.error && base.error.message))) || "Signup failed";
      return apiJson({ success: false, message: msg }, base && base.status ? base.status : 400);
    }

    const userId = base.user.id;
    const createdAt = base.user.created_at || new Date().toISOString();

    // Create buyer profile row (idempotency handled by DB constraints if present)
    const profileId = crypto.randomUUID();

    try {
      await env.DB_roll.prepare(
        `INSERT INTO buyer_profiles (
           id, user_id, name, phone, city, state,
           default_payment_method, preferred_rink, profile_weather_snapshot_json,
           created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          profileId,
          userId,
          body.name || null,
          body.phone || null,
          body.city || null,
          body.state || null,
          body.default_payment_method || null,
          body.preferred_rink || null,
          null,
          createdAt
        )
        .run();

      return apiJson({ success: true, user: base.user, buyer_profile_id: profileId }, 201);
    } catch (err) {
      const msg = String(err).toLowerCase();
      // Treat unique/constraint errors as idempotent success if profile exists
      if (msg.includes("unique") || msg.includes("constraint") || /buyer_profiles/.test(msg)) {
        const existing = await env.DB_roll.prepare("SELECT * FROM buyer_profiles WHERE user_id = ?").bind(userId).first();
        if (existing) {
          return apiJson({ success: true, user: base.user, buyer_profile_id: existing.id, profile_exists: true }, 201);
        }
      }

      // Other DB error: return failure so client can retry later
      return apiJson({ success: false, message: "Buyer profile insert failed", detail: String(err) }, 500);
    }
  } catch (err) {
    return apiJson({ success: false, message: "Server error", detail: String(err) }, 500);
  }
}

/* Minimal safe stubs for other buyer handlers expected by worker.js
   Replace these with full implementations as needed */
export async function listTickets(request, env, user) {
  return { success: false, message: "listTickets not implemented" };
}

export async function createTicket(request, env, user) {
  return { success: false, message: "createTicket not implemented" };
}

export async function partnerWebhook(request, env) {
  return { success: false, message: "partnerWebhook not implemented" };
}

export async function checkInTicket(request, env, user) {
  return { success: false, message: "checkInTicket not implemented" };
}

export async function buyerDashboard(request, env, user) {
  return { success: false, message: "buyerDashboard not implemented" };
}

/* Factory expected by worker.js to import buyer handlers without duplicate-export issues */
export function makeBuyersApi() {
  return {
    signupBuyer: typeof signupBuyer === "function" ? signupBuyer : async () => ({ success: false, message: "signupBuyer not implemented" }),
    listTickets: typeof listTickets === "function" ? listTickets : async () => ({ success: false, message: "listTickets not implemented" }),
    createTicket: typeof createTicket === "function" ? createTicket : async () => ({ success: false, message: "createTicket not implemented" }),
    partnerWebhook: typeof partnerWebhook === "function" ? partnerWebhook : async () => ({ success: false, message: "partnerWebhook not implemented" }),
    checkInTicket: typeof checkInTicket === "function" ? checkInTicket : async () => ({ success: false, message: "checkInTicket not implemented" }),
    buyerDashboard: typeof buyerDashboard === "function" ? buyerDashboard : async () => ({ success: false, message: "buyerDashboard not implemented" })
  };
}
