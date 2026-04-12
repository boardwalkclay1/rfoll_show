// auth-worker/index.js — PBKDF2, ALWAYS JSON, 100k ITERATIONS

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const isHash =
      method === "POST" &&
      (path === "/hash" || path === "/api/auth/hash");

    const isVerify =
      method === "POST" &&
      (path === "/verify" || path === "/api/auth/verify");

    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { "Content-Type": "application/json" }
      });

    const toB64 = (u8) =>
      btoa(String.fromCharCode(...new Uint8Array(u8)));
    const fromB64 = (s) =>
      Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

    async function derive(password, saltBytes, iterations) {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
      );

      const bits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          hash: "SHA-256",
          salt: saltBytes,
          iterations
        },
        key,
        256
      );

      return new Uint8Array(bits);
    }

    try {
      // CONSTANT, SAFE ITERATION COUNT
      const ITER = 100000;

      if (isHash) {
        let body;
        try {
          body = await request.json();
        } catch {
          return json({ success: false, error: "Invalid JSON" }, 400);
        }

        const password = body.password;
        if (!password) {
          return json({ success: false, error: "Missing password" }, 400);
        }

        const salt = crypto.getRandomValues(new Uint8Array(16));

        try {
          const hashBytes = await derive(password, salt, ITER);
          return json({
            success: true,
            hash: toB64(hashBytes),
            salt: toB64(salt),
            iterations: ITER
          });
        } catch (err) {
          return json(
            { success: false, error: "PBKDF2 failed", detail: String(err) },
            500
          );
        }
      }

      if (isVerify) {
        let body;
        try {
          body = await request.json();
        } catch {
          return json({ success: false, error: "Invalid JSON" }, 400);
        }

        const { password, hash, salt, iterations } = body;
        if (!password || !hash || !salt) {
          return json({ success: false, error: "Missing fields" }, 400);
        }

        const saltBytes = fromB64(salt);
        const iter = Number(iterations) || ITER;

        try {
          const bits = await derive(password, saltBytes, iter);
          const newHash = toB64(bits);
          return json({
            success: true,
            ok: newHash === hash,
            iterations: iter
          });
        } catch (err) {
          return json(
            { success: false, error: "Verify failed", detail: String(err) },
            500
          );
        }
      }

      // Health/default
      return json({ success: true, message: "Auth worker online" });
    } catch (err) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unhandled error",
          detail: String(err)
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }
};
