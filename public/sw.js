/**
 * Project Ultimatum — Service Worker
 * Plain vanilla JS service worker. No build tools, no Serwist, no Turbopack issues.
 * Guaranteed to work.
 */

const CACHE_VERSION = "v7";
const SHELL_CACHE = "ultimatum-shell-" + CACHE_VERSION;
const PAGES_CACHE = "ultimatum-pages-" + CACHE_VERSION;
const ASSETS_CACHE = "ultimatum-assets-" + CACHE_VERSION;

// App shell — these are cached on SW install
// These are the core pages of the app
const PRECACHE_URLS = [
  "/",
  "/campaign",
  "/campaign/track",
  "/arena",
  "/diet",
  "/settings",
  "/auth",
  "/offline",
];

// ─── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => {
        console.log("[SW] Precaching app shell...");
        // Use individual adds so one failure doesn't block all
        return Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            cache.add(new Request(url, { cache: "reload" })).catch((err) => {
              console.warn("[SW] Failed to precache:", url, err);
            })
          )
        );
      })
      .then(() => {
        console.log("[SW] Install complete");
        return self.skipWaiting();
      })
  );
});

// ─── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) =>
                name.startsWith("ultimatum-") &&
                name !== SHELL_CACHE &&
                name !== PAGES_CACHE &&
                name !== ASSETS_CACHE
            )
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ─── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Next.js internal routes and API routes
  if (
    url.pathname.startsWith("/_next/webpack-hmr") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // ── Next.js static assets: Cache First (they are content-hashed, safe forever)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, ASSETS_CACHE));
    return;
  }

  // ── Images: Cache First
  if (
    request.destination === "image" ||
    url.pathname.match(/\.(jpg|jpeg|png|webp|gif|svg|ico)$/)
  ) {
    event.respondWith(cacheFirst(request, ASSETS_CACHE));
    return;
  }

  // ── Navigation requests (HTML pages): Network First with cache fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigate(request));
    return;
  }

  // ── Everything else: Network First
  event.respondWith(networkFirst(request, PAGES_CACHE));
});

// ─── STRATEGIES ──────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return new Response("Asset unavailable offline", { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response("Unavailable offline", { status: 503 });
  }
}

async function networkFirstNavigate(request) {
  const url = new URL(request.url);

  try {
    // Try the network with a 5s timeout
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 5000)
      ),
    ]);

    if (networkResponse.ok) {
      // Cache this page for offline use
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error("Network response not ok");
  } catch (err) {
    // Network failed — try the pages cache first (ignore query params)
    const pagesCache = await caches.open(PAGES_CACHE);
    const cached = await pagesCache.match(request, { ignoreSearch: true });
    if (cached) {
      console.log("[SW] Serving from pages cache:", url.pathname);
      return cached;
    }

    // Try the shell cache (precached pages) (ignore query params)
    const shellCache = await caches.open(SHELL_CACHE);
    
    // Check if the exact pathname was precached
    // We create a new request with just the pathname so we don't need to worry about origin/search matching issues
    const pathnameRequest = new Request(url.pathname);
    const shellExact = await shellCache.match(pathnameRequest, { ignoreSearch: true });
    
    if (shellExact) {
      console.log("[SW] Serving from shell cache:", url.pathname);
      return shellExact;
    }

    // Last resort: offline page
    const offlineResponse = await shellCache.match("/offline", { ignoreSearch: true });
    if (offlineResponse) return offlineResponse;

    // Absolute fallback
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Project Ultimatum — Offline</title>
<style>
  body { background: #000; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; padding: 2rem; }
  img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 1.5rem; }
  h1 { font-size: 1.25rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 0.5rem; }
  p { color: #666; font-size: 0.875rem; }
  button { margin-top: 2rem; background: #fff; color: #000; border: none; padding: 0.75rem 2rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; border-radius: 9999px; cursor: pointer; font-size: 0.75rem; }
</style>
</head>
<body>
  <img src="/icon-192.jpg" alt="Ultimatum" />
  <h1>You&apos;re Offline</h1>
  <p>Connect to the internet to access Project Ultimatum.</p>
  <button onclick="window.location.reload()">Try Again</button>
</body>
</html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
