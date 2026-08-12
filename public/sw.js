/*
 * Offline shell for the PWA.
 *
 * The learning data is already offline-capable — Firestore keeps it in
 * IndexedDB — so this worker only has to make sure the app itself opens
 * without a connection: the HTML of the pages you have visited and the hashed
 * assets they need.
 *
 * Bump VERSION to retire the old caches on the next visit.
 */

const VERSION = "v1";
const PAGE_CACHE = `pages-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;
const CURRENT_CACHES = [PAGE_CACHE, ASSET_CACHE];

/** Every route of the app, so a fresh install works offline right away. */
const PRECACHED_PAGES = ["/", "/review", "/plan", "/phrases", "/login"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGE_CACHE);
      // One failed page must not fail the whole install, hence the per-page
      // catch instead of cache.addAll.
      await Promise.all(
        PRECACHED_PAGES.map((page) => cache.add(page).catch(() => {})),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => !CURRENT_CACHES.includes(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

/** Only store responses we actually served ourselves, and only if they are OK. */
function isCacheable(response) {
  return response && response.ok && response.type === "basic";
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);

    if (isCacheable(response)) {
      const cache = await caches.open(PAGE_CACHE);
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Any page is better than the browser's error page; the app shell knows
    // how to say "brak połączenia" on its own.
    const fallback = await caches.match("/");
    if (fallback) return fallback;

    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);

  if (isCacheable(response)) {
    const cache = await caches.open(ASSET_CACHE);
    await cache.put(request, response.clone());
  }

  return response;
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fresh = fetch(request)
    .then(async (response) => {
      if (isCacheable(response)) {
        const cache = await caches.open(ASSET_CACHE);
        await cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => cached);

  return cached ?? fresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Firestore, Auth and Google fonts are cross-origin: never our business to
  // cache, and Firestore has its own offline store anyway.
  if (url.origin !== self.location.origin) return;

  // React Server Component payloads are versioned with the build. Serving a
  // stale one breaks client-side navigation; letting it fail offline makes the
  // router fall back to a full page load, which this worker can answer.
  if (url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Hashed build output — the URL changes whenever the content does.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
