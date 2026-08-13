// ─── Ungdomsbedrift Service Worker ───────────────────────────────────────────
// Versjon må oppdateres når du gjør store endringer. Bumping av versjonen
// sletter gamle cacher i activate-steget – ellers vokser DYNAMIC_CACHE i det
// uendelige, siden Vite lager nytt filnavn (hash) for hver eneste bygging.
const CACHE_VERSION = 'ub-v1.1.0';
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
    caches.open(STATIC_CACHE)
      // addAll feiler alt-eller-ingenting: én manglende fil hindrer installasjon.
      // addAll per fil gjør installasjonen robust mot at én ikon-fil mangler.
      .then(cache => Promise.all(
        STATIC_ASSETS.map(url => cache.add(url).catch(() => null))
      ))
      .then(() => self.skipWaiting())
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

// ── Fetch – network first for HTML, cache first for assets ───────────────────
self.addEventListener('fetch', event => {
  const { request } = event;

  // Bare GET kan caches – cache.put() kaster feil på POST/PUT/DELETE
  if (request.method !== 'GET') return;

  let url;
  try { url = new URL(request.url); } catch { return; }

  // Ikke cache API-kall til Supabase – de skal alltid gå til nett
  if (url.hostname.includes('supabase.co')) return;

  // Ikke cache på tvers av opphav (CDN-er o.l.) – gir ugjennomsiktige svar
  if (url.origin !== self.location.origin) return;

  // For navigasjonsforespørsler (HTML) – network first, cache som reserve
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html').then(r => r || Response.error()))
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
        const networkFetch = fetch(request)
          .then(response => {
            // Bare cache vellykkede svar – ellers havner 404-er i cachen
            if (response.ok) {
              const clone = response.clone();
              caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
            }
            return response;
          })
          // Uten catch gir offline-bruk "Uncaught (in promise)" i konsollen
          .catch(() => cached || Response.error());
        return cached || networkFetch;
      })
    );
  }
});

// ── Push-varsler (fremtidig bruk) ─────────────────────────────────────────────
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data?.json() ?? {}; } catch { data = {}; }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Ungdomsbedrift', {
      body: data.body || 'Du har en ny oppdatering',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })
  );
});
