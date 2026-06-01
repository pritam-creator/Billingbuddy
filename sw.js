const CACHE_NAME = "bakerypos-v2"; // Incremented version to clear old cache loop

// Core structural views only. Omit non-existent CSS files to avoid register failures.
const urlsToCache = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/manifest.json"
];

// 1. Install Phase - Fast-cache local workspace layout architecture
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("Core assets successfully mapped to internal memory.");
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Force activation instantly without browser restart
  );
});

// 2. Activate Phase - Purges stale old framework logs automatically
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("Purging deprecated layout engine memory layer:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Immediate control taking of active clients
  );
});

// 3. Fetch Pipeline - Dynamic routing matrix (Network-First Strategy)
self.addEventListener("fetch", event => {
  const requestUrl = new URL(event.request.url);

  // CRITICAL FIX: Bypass firestore logging triggers, cloud connection queries, and internal streams entirely
  if (
    event.request.method !== "GET" || 
    requestUrl.origin.includes("firestore.googleapis.com") || 
    requestUrl.origin.includes("firebasejs")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-First, fallback to local storage logic for UI assets to prevent white screening
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Cache valid updates dynamically for assets on the fly
        if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // Serve cached file layout context instantly if terminal drops connectivity grid
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          
          // Return global entry index if route tracking asset breaks during standalone view execution
          if (event.request.mode === 'navigate') {
            return caches.match('/dashboard.html');
          }
        });
      })
  );
});
