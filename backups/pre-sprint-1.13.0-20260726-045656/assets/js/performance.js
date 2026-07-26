const ROOT = '/portal-pedroza-contadores/';

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${ROOT}service-worker.js`, { scope: ROOT })
      .catch((error) => console.warn('Service Worker indisponivel:', error));
  }, { once: true });
}

function optimizeImages() {
  const images = [...document.images];
  images.forEach((image, index) => {
    image.decoding ||= 'async';
    if (index > 0 && !image.hasAttribute('loading')) image.loading = 'lazy';
  });

  const mainImage = document.querySelector('main img');
  if (mainImage) {
    mainImage.loading = 'eager';
    mainImage.fetchPriority = 'high';
  }
}

function prefetchInternalLinks() {
  const seen = new Set();
  const prefetch = (anchor) => {
    if (!anchor || seen.has(anchor.href)) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith(ROOT)) return;
    seen.add(anchor.href);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = anchor.href;
    document.head.appendChild(link);
  };

  document.addEventListener('pointerover', (event) => prefetch(event.target.closest('a[href]')), { passive: true });
  document.addEventListener('focusin', (event) => prefetch(event.target.closest('a[href]')));
}

function runWhenIdle(callback) {
  if ('requestIdleCallback' in window) requestIdleCallback(callback, { timeout: 2000 });
  else setTimeout(callback, 800);
}

registerServiceWorker();
optimizeImages();
runWhenIdle(prefetchInternalLinks);
