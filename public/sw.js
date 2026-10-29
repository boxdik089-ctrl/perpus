// Service Worker Perpustakaan Digital SMKN 1 Beringin
const CACHE_NAME = "perpus-beringin-v8-nocache";
const ASSETS_TO_CACHE = [
  "/manifest.json",
  "/assets/logo.png",
  "/assets/logo-kolaborasi.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Bersihkan semua cache lama agar browser langsung memuat bundle terbaru
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.url.startsWith("chrome-extension")) return;
  
  const url = new URL(event.request.url);
  // JANGAN intercept atau cache route /admin, /api, bundle Next.js, atau Server Actions/RSC
  if (
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/login") ||
    url.searchParams.has("_rsc") ||
    event.request.headers.has("RSC") ||
    event.request.headers.has("Next-Action")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
