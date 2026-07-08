const CACHE_NAME = "surjya-bakery-v3";
const STATIC_ASSETS = [
  "./index.html",
  "./dashboard.html",
  "./items.html",
  "./item-details.html",
  "./inventory.html",
  "./orders.html",
  "./cart.html",
  "./invoice.html",
  "./customer_view.html",
  "./client_rates.html",
  "./delivery.html",
  "./livesale.html",
  "./subscriptions.html",
  "./suppliers.html",
  "./ledger.html",
  "./records.html",
  "./history.html",
  "./employees.html",
  "./settings.html",
  "./reset-pin.html",
  "./manifest.json",
  "./animations.css",
  "./animations.js",
  "./pwa-install.js"
];

// Install: cache static files (each file cached independently so one
// failure doesn't block caching of everything else)
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(err => {
          console.warn("SW: failed to cache", url, err);
        }))
      )
    ).then(() => self.skipWaiting())
  );
});

// Activate: delete old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network first, fall back to cache
self.addEventListener("fetch", event => {
  // Skip non-GET and Firebase requests (always need network)
  if (event.request.method !== "GET") return;
  if (event.request.url.includes("firestore.googleapis.com") ||
      event.request.url.includes("firebase")) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response && response.status === 200 && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
