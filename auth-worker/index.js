export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Accept both direct and forwarded paths
    const isHashRoute =
      method === "POST" &&
      (path === "/hash" || path === "/api/auth/hash");

    const isVerifyRoute =
      method === "POST" &&
      (path === "/verify" || path === "/api/auth/verify");

    // PBKDF2 HASH
    if (isHashRoute) {
      const { password } = await request.json();

      const salt = crypto.getRandomValues(new Uint8Array(16));

      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
      );

      const bits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          hash: "SHA-256",
          salt,
          iterations: 310000
        },
        key,
        256
      );

      return new Response(
        JSON.stringify({
          hash: btoa(String.fromCharCode(...new Uint8Array(bits))),
          salt: btoa(String.fromCharCode(...salt))
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // PBKDF2 VERIFY
    if (isVerifyRoute) {
      const { password, hash, salt } = await request.json();

      const saltBytes = Uint8Array.from(atob(salt), c => c.charCodeAt(0));

      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
      );

      const bits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          hash: "SHA-256",
          salt: saltBytes,
          iterations: 310000
        },
        key,
        256
      );

      const newHash = btoa(String.fromCharCode(...new Uint8Array(bits)));

      return new Response(
        JSON.stringify({ ok: newHash === hash }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response("Auth worker online");
  }
};
