/* SAAJ by MF — PWA Service Worker
 * Strategy:
 *   - App shell (HTML/JS/CSS): Cache-first, fallback to network
 *   - Images: Cache-first with 30-day expiry
 *   - Public API (products, collections, banners, settings): Stale-while-revalidate
 *   - Auth API: Network-only
 *   - Offline: serve cached data or offline fallback
 */

const CACHE_VERSION = "saaj-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;

const OFFLINE_URL = "/";

/* Public API paths that can be served stale */
const CACHEABLE_APIS = [
  "/api/products",
  "/api/collections",
  "/api/banners",
  "/api/settings/public",
];

/* ─── Install ─────────────────────────────────────────────── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([OFFLINE_URL]).catch(() => {});
    })
  );
  self.skipWaiting();
});

/* ─── Activate ─────────────────────────────────────────────── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("saaj-") && !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ─── Fetch ─────────────────────────────────────────────────── */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* Skip non-GET, chrome-extension, and cross-origin requests (except fonts/images) */
  if (request.method !== "GET") return;
  if (url.protocol !== "https:" && url.protocol !== "http:") return;

  /* Auth APIs — always network-only */
  if (url.pathname.startsWith("/api/auth")) {
    return;
  }

  /* Public API — stale-while-revalidate */
  if (
    url.origin === self.location.origin &&
    CACHEABLE_APIS.some((p) => url.pathname.startsWith(p))
  ) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  /* Admin API — network-only */
  if (url.pathname.startsWith("/api/admin") || url.pathname.startsWith("/api/")) {
    return;
  }

  /* Images (any origin) — cache-first with 30-day expiry */
  const isImage =
    request.destination === "image" ||
    /\.(png|jpe?g|gif|webp|svg|ico|avif)(\?.*)?$/i.test(url.pathname);
  if (isImage) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 30));
    return;
  }

  /* Google Fonts — cache-first */
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE, 365));
    return;
  }

  /* Same-origin navigation — network first, fall back to cache then offline */
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }
});

/* ─── Strategies ─────────────────────────────────────────── */

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || (await fetchPromise) || new Response(JSON.stringify([]), {
    headers: { "Content-Type": "application/json" },
  });
}

async function cacheFirst(request, cacheName, maxAgeDays = 30) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    /* Refresh stale entries in the background */
    const dateHeader = cached.headers.get("date");
    const ageMs = dateHeader ? Date.now() - new Date(dateHeader).getTime() : 0;
    if (ageMs > maxAgeDays * 86400 * 1000) {
      fetch(request)
        .then((r) => r.ok && cache.put(request, r))
        .catch(() => {});
    }
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 503 });
  }
}

async function networkFirstWithOfflineFallback(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    /* For navigation requests fall back to app shell */
    if (request.mode === "navigate") {
      const shell = await cache.match(OFFLINE_URL);
      if (shell) return shell;
    }
    return new Response("Offline", { status: 503 });
  }
}
