/* ============================================================
   ROLL SHOW — FULL APP SERVICE WORKER
   - Precaches all known pages
   - HTML → network-first (always updates)
   - Assets → cache-first (fast)
============================================================ */

const CACHE_NAME = "rollshow-full-v1";

const PRECACHE_URLS = [
  /* ROOT */
  "/",
  "/index.html",
  "/favicon.png",
  "/manifest.webmanifest",
  "/service-worker.js",

  /* APP SHELL (if used) */
  "/app/",
  "/app/index.html",

  /* ROOT PAGES (in /pages) */
  "/pages/admin-payouts.html",
  "/pages/auth-login.html",
  "/pages/branding-studio.html",
  "/pages/buyer-profile.html",
  "/pages/contracts.html",
  "/pages/legal.html",
  "/pages/music-library.html",

  /* BUSINESS PAGES */
  "/pages/business/",
  "/pages/business/dashboard.html",
  "/pages/business/offers.html",
  "/pages/business/contracts.html",
  "/pages/business/create-offer.html",
  "/pages/business/offers-inbox.html",
  "/pages/business/branding-studio.html",
  "/pages/business/business-feed.html",
  "/pages/business/apply.html",

  /* BUYER PAGES */
  "/pages/buyer/",
  "/pages/buyer/dashboard.html",
  "/pages/buyer/tickets.html",
  "/pages/buyer/purchase-history.html",
  "/pages/buyer/buyer-feed.html",
  "/pages/buyer/ticket-wallet.html",
  "/pages/buyer/ticket-confirmation.html",
  "/pages/buyer/ticket-view.html",
  "/pages/buyer/buyer-profile.html",

  /* LEGAL PAGES */
  "/pages/legal/",
  "/pages/legal/legal.html",
  "/pages/legal/terms.html",
  "/pages/legal/privacy.html",

  /* MUSICIAN PAGES */
  "/pages/musician/",
  "/pages/musician/dashboard.html",
  "/pages/musician/profile.html",
  "/pages/musician/tracks.html",
  "/pages/musician/licenses.html",
  "/pages/musician/upload-track.html",
  "/pages/musician/musician-feed.html",
  "/pages/musician/branding-studio.html",
  "/pages/musician/music-library.html",

  /* OWNER PAGES */
  "/pages/owner/",
  "/pages/owner/owner-dashboard.html",
  "/pages/owner/owner-users.html",
  "/pages/owner/owner-skaters.html",
  "/pages/owner/owner-businesses.html",
  "/pages/owner/owner-musicians.html",
  "/pages/owner/owner-shows.html",
  "/pages/owner/owner-contracts.html",
  "/pages/owner/owner-music.html",
  "/pages/owner/owner-settings.html",
  "/pages/owner/admin-payouts.html",

  /* SKATER PAGES */
  "/pages/skater/",
  "/pages/skater/dashboard.html",
  "/pages/skater/skater-profile.html",
  "/pages/skater/shows.html",
  "/pages/skater/create-show.html",
  "/pages/skater/lessons.html",
  "/pages/skater/lesson-requests.html",
  "/pages/skater/skater-feed.html",
  "/pages/skater/branding-studio.html",
  "/pages/skater/music-library.html",
  "/pages/skater/businesses.html",

  /* SYSTEM PAGES */
  "/pages/system/",
  "/pages/system/messages.html",
  "/pages/system/notifications.html",
  "/pages/system/search.html",
  "/pages/system/map.html",
  "/pages/system/qr.html",
  "/pages/system/settings.html",

  /* PUBLIC ASSETS (adjust to your real structure) */
  "/public/css/global.css",
  "/public/css/dashboard.css",
  "/public/js/api.js",
  "/public/js/app.js",

  /* BACKGROUNDS (examples) */
  "/public/images/backs/roll-show-gold.jpg",
  "/public/images/backs/Roll-music.jpg",
  "/public/images/backs/Roll-business.jpg",
  "/public/images/backs/Roll-buyer.jpg",
  "/public/images/backs/Roll-owner.jpg",
  "/public/images/bg-artist-dash.jpg",
  "/public/images/bg-buyer-dash.jpg",
  "/public/images/bg-skater-dash.jpg",
  "/public/images/bg-business-dash.jpg",

  /* ICONS */
  "/public/images/favicon.png",
  "/public/images/icons/icon-192.png",
  "/public/images/icons/icon-512.png",

  /* LOGOS */
  "/public/images/logo.png",
  "/public/images/logo-white.png",
  "/public/images/logo-gold.png"
];

/* INSTALL — precache everything listed */
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
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* FETCH — HTML: network-first, assets: cache-first */
self.addEventListener("fetch", event => {
  const req = event.request;
  const accept = req.headers.get("accept") || "";

  // HTML: network-first so updates always show
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

  // Assets: cache-first
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
