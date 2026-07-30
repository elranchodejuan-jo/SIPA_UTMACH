const CACHE_VERSION = 'nutricion-animal-v2-theme';
const APP_URL = new URL('./', self.location.href).href;
const OFFLINE_URL = new URL('./offline.html', self.location.href).href;
const STATIC_ASSETS = [
  APP_URL,
  OFFLINE_URL,
  new URL('./favicon.svg', self.location.href).href,
  new URL('./manifest.webmanifest', self.location.href).href,
  new URL('./images/logo-utmach.png', self.location.href).href,
  new URL('./images/hero-desktop.jpg', self.location.href).href,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, external domains, and Google Forms
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.hostname.includes('google') ||
    url.hostname.includes('gstatic')
  ) {
    return;
  }

  // HTML: Network first, fallback to cache, then offline page
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // CSS, JS, SVG, images: Cache first, fallback to network
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        })
    )
  );
});
