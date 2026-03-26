const CACHE_NAME = "rollshow-cache-v2";

const ASSETS = [
  "/",                         // root
  "/index.html",               // landing page

  // AUTH
  "/pages/auth-login.html",
  "/pages/auth-signup.html",

  // BUYER
  "/pages/buyer-profile.html",
  "/pages/ticket-wallet.html",
  "/pages/purchase-history.html",
  "/pages/ticket-confirmation.html",
  "/pages/ticket.view.html",

  // SKATER
  "/pages/skater-dashboard.html",
  "/pages/create-show.html",
  "/pages/video-studio.html",
  "/pages/branding-studio.html",

  // PUBLIC
  "/pages/show.html",
  "/pages/skaters-feed.html",

  // LEGAL
  "/pages/terms.html",
  "/pages/privacy.html",
  "/pages/legal.html",

  // STYLES + JS
  "/app/styles/styles.css",
  "/app/js/app.js",

  // IMAGES
  "/app/images/roll-index.jpg",
  "/app/images/jammin.jpg",
  "/app/images/icons/icon-192.png",
  "/app/images/icons/icon-512.png",

  // MANIFEST
  "/manifest.webmanifest"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request).catch(() => caches.match("/index.html"))
      );
    })
  );
});
