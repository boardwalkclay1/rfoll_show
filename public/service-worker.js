// ROLL SHOW — ZERO CACHE, AUTO UPDATE, NO INTERFERENCE (FINAL)

// INSTALL — activate immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// ACTIVATE — wipe ALL old caches + take control
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

// FETCH — network only, no cache, no interception of ANY app JS/HTML
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const path = url.pathname || "/";

  // 1. Never touch API calls
  if (path.startsWith("/api/")) return;

  // 2. Never touch auth worker, login, signup, verify, etc.
  if (
    path.startsWith("/auth") ||
    path.includes("login") ||
    path.includes("signup") ||
    path.includes("verify")
  ) return;

  // 3. Never touch ANY dashboard or owner/skater/business/musician pages
  if (
    path.startsWith("/pages/owner") ||
    path.startsWith("/pages/skater") ||
    path.startsWith("/pages/business") ||
    path.startsWith("/pages/musician") ||
    path.startsWith("/pages/buyer") ||
    path.startsWith("/dashboard") ||
    path.startsWith("/admin")
  ) return;

  // 4. Never touch service worker itself
  if (path.endsWith("service-worker.js")) return;

  // 5. Always fetch from network, no caching
  event.respondWith(fetch(req));
});
