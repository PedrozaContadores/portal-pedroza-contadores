const CACHE_VERSION = 'pedroza-portal-v1.7.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DATA_CACHE = `${CACHE_VERSION}-data`;
const ROOT = '/portal-pedroza-contadores/';

const CORE = [
  ROOT,
  `${ROOT}index.html`,
  `${ROOT}assets/css/main.css`,
  `${ROOT}assets/css/performance.css`,
  `${ROOT}assets/js/main.js`,
  `${ROOT}assets/js/performance.js`,
  `${ROOT}assets/images/logo-pedroza-contadores.svg`,
  `${ROOT}pages/noticias/`,
  `${ROOT}pages/empresa/`,
  `${ROOT}pages/empresa/diferenciais.html`,
  `${ROOT}pages/empresa/segmentos-atendidos.html`,
  `${ROOT}assets/css/institutional.css`,
  `${ROOT}assets/css/utilities.css`,
  `${ROOT}assets/js/utilities.js`,
  `${ROOT}pages/utilidades/`,
  `${ROOT}data/noticias.json`,
  `${ROOT}data/utilities.json`
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('pedroza-portal-') && !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || network;
}

async function networkFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (await cache.match(`${ROOT}index.html`));
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(ROOT)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.endsWith('.json') || url.pathname.endsWith('.xml')) {
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
    return;
  }

  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
  }
});
