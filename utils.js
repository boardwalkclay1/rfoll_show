/* ============================================================
   CORS HEADERS
============================================================ */
export function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, x-user-id, x-buyer-id, x-skater-id, x-business-id, x-musician-id, x-owner-id"
  };
}

/* ============================================================
   JSON RESPONSE WRAPPER
============================================================ */
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors() }
  });
}

/* ============================================================
   UNIFIED USER ID EXTRACTION
============================================================ */
export function getUserId(request) {
  return (
    request.headers.get("x-user-id") ||
    request.headers.get("x-buyer-id") ||
    request.headers.get("x-skater-id") ||
    request.headers.get("x-business-id") ||
    request.headers.get("x-musician-id") ||
    request.headers.get("x-owner-id")
  );
}

/* ============================================================
   PASSWORD HASHING (AUTH WORKER)
============================================================ */
export async function hash(str, env) {
  const res = await env.AUTH.fetch("https://auth/hash", {
    method: "POST",
    body: JSON.stringify({ password: str })
  });
  const data = await res.json();
  return data.hashed;
}

/* ============================================================
   PASSWORD VERIFY (AUTH WORKER)
============================================================ */
export async function verify(str, hashed, env) {
  const res = await env.AUTH.fetch("https://auth/verify", {
    method: "POST",
    body: JSON.stringify({ password: str, hash: hashed })
  });
  const data = await res.json();
  return data.ok;
}
