// ─── Ungdomsbedrift Service Worker ───────────────────────────────────────────
// Versjon må oppdateres når du gjør store endringer (tvinger ny cache)
const CACHE_VERSION = 'ub-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Filer som alltid skal caches ved installasjon
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate – slett gamle cacher ────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch – network first, fall back to cache ─────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ikke cache API-kall til Supabase – de skal alltid gå til nett
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // For navigasjonsforespørsler (HTML) – network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For statiske assets – cache first, oppdater i bakgrunnen
  if (
    url.pathname.match(/\.(js|css|png|svg|ico|woff2?)$/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request).then(response => {
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, response.clone()));
          return response;
        });
        return cached || networkFetch;
      })
    );
    return;
  }
});

// ── Push-varsler (fremtidig bruk) ─────────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Ungdomsbedrift', {
      body: data.body || 'Du har en ny oppdatering',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })
  );
});
