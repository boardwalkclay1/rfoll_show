/* ============================================================
   ROLL SHOW — FULL PRECACHE SERVICE WORKER
   EXACTLY LIKE YOU ASKED — EVERY PAGE, EVERY IMAGE, EVERYTHING
============================================================ */

const CACHE_NAME = "rollshow-full-v1";

/* ============================================================
   INSTALL — Precache EVERYTHING
============================================================ */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await cache.addAll([

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
        "/app/pages/musician-dashboard.html",
        "/app/pages/business-dashboard.html",
        "/app/pages/buyer-dashboard.html",
        "/app/pages/owner-dashboard.html",

        /* BACKGROUNDS */
        "/app/images/backs/roll-show-gold.jpg",
        "/app/images/backs/Roll-music.jpg",
        "/app/images/backs/Roll-business.jpg",
        "/app/images/backs/Roll-buyer.jpg",
        "/app/images/backs/Roll-owner.jpg",

        /* ALT BACKGROUNDS (if used) */
        "/app/images/bg-artist-dash.jpg",
        "/app/images/bg-buyer-dash.jpg",
        "/app/images/bg-skater-dash.jpg",
        "/app/images/bg-business-dash.jpg",

        /* ICONS */
        "/app/images/favicon.png",
        "/app/images/icons/icon-192.png",
        "/app/images/icons/icon-512.png",

        /* ANY OTHER STATIC ASSETS */
        "/app/images/logo.png",
        "/app/images/logo-white.png",
        "/app/images/logo-gold.png"
      ]);
    })
  );

  self.skipWaiting();
});

/* ============================================================
   ACTIVATE — Clear old caches
============================================================ */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ============================================================
   FETCH — Cache-first for EVERYTHING
============================================================ */
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        })
      );
    })
  );
});
