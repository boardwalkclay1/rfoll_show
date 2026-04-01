/* ============================================================
   ROLL SHOW — CACHE + ALWAYS UPDATE
   - Precache all pages, CSS, JS, images
   - HTML: network-first (updates when you change)
   - Assets: stale-while-revalidate (fast + updates)
============================================================ */

const CACHE_NAME = "rollshow-hybrid-v1";

const PRECACHE_URLS = [
  /* ROOT */
  "/",
  "/index.html",
  "/manifest.webmanifest",

  /* GLOBAL STYLES */
  "/app/styles/styles.css",
  "/app/styles/dashboard.css",

  /* GLOBAL JS */
  "/app/js/app.js",

  /* DASHBOARD JS */
  "/app/js/skater/skater-dashboard.js",
  "/app/js/musician/musician-dashboard.js",
  "/app/js/business/business-dashboard.js",
  "/app/js/buyer/buyer-dashboard.js",
  "/app/js/owner/owner-dashboard.js",

  /* DASHBOARD PAGES */
  "/app/pages/skater-dashboard.html",
  "/app/pages/musician/dashboard.html",
  "/app/pages/business/business-dashboard.html",
  "/app/pages/buyer/dashboard.html",
  "/app/pages/owner/owner-dashboard.html",

  /* BUSINESS PAGES (example) */
  "/app/pages/business/offers.html",
  "/app/pages/business/contracts.html",
  "/app/pages/business/create-offer.html",
  "/app/pages/business/offers-inbox.html",
  "/app/pages/business/branding-studio.html",
  "/app/pages/business/business-feed.html",
  "/app/pages/business/apply.html",

  /* MUSICIAN PAGES (example) */
  "/app/pages/musician/profile.html",
  "/app/pages/musician/tracks.html",
  "/app/pages/musician/licenses.html",
  "/app/pages/musician/upload-track.html",
  "/app/pages/musician/musician-feed.html",
  "/app/pages/musician/branding-studio.html",
  "/app/pages/musician/music-library.html",

  /* BUYER PAGES (example) */
  "/app/pages/buyer/tickets.html",
  "/app/pages/buyer/purchase-history.html",
  "/app/pages/buyer/buyer-feed.html",
  "/app/pages/buyer/ticket-wallet.html",
  "/app/pages/buyer/ticket-confirmation.html",
  "/app/pages/buyer/ticket-view.html",

  /* BACKGROUNDS */
  "/app/images/backs/roll-show-gold.jpg",
  "/app/images/backs/Roll-music.jpg",
  "/app/images/backs/Roll-business.jpg",
  "/app/images/backs/Roll-buyer.jpg",
  "/app/images/backs/Roll-owner.jpg",
  "/app/images/bg-artist-dash.jpg",
  "/app/images/bg-buyer-dash.jpg",
  "/app/images/bg-skater-dash.jpg",
  "/app/images/bg-business-dash.jpg",

  /* ICONS */
  "/app/images/favicon.png",
  "/app/images/icons/icon-192.png",
  "/app/images/icons/icon-512.png",

  /* LOGOS */
  "/app/images/logo.png",
  "/app/images/logo-white.png",
  "/app/images/logo-gold.png"
];

/* INSTALL — precache everything */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

/* ACTIVATE — clean old caches */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* FETCH — HTML: network-first, assets: stale-while-revalidate */
self.addEventListener("fetch", event => {
  const req = event.request;
  const accept = req.headers.get("accept") || "";

  // HTML: always try network first so updates show when you change files
  if (req.mode === "navigate" || accept.includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Assets: stale-while-revalidate
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          return res;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
