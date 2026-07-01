const CACHE_NAME = "zhishiku-v7";

const PRECACHE_URLS = ["/", "/articles", "/about", "/knowledge"];

const CACHE_PATTERNS = [
  /\.css$/,
  /\.js$/,
  /\.woff2?$/,
  /\.png$/,
  /\.jpg$/,
  /\.svg$/,
  /\.ico$/,
  /\.webp$/,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
];

const NO_CACHE_PATTERNS = [
  /\/api\//,
  /\/admin/,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function shouldCache(url) {
  if (NO_CACHE_PATTERNS.some((p) => p.test(url))) return false;
  return CACHE_PATTERNS.some((p) => p.test(url));
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = event.request.url;

  // Static assets: cache-first
  if (shouldCache(url)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // HTML pages: network-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
