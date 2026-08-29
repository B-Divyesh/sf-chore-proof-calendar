const VERSION = 'done-here-v8';
const SHELL = ['/', '/app', '/demo', '/privacy', '/terms', '/index.html', '/not-found.html', '/manifest.webmanifest', '/favicon.svg', '/assets/hero-ceramics-960.webp', '/assets/hero-ceramics-1440.webp', '/assets/done-here-og.jpg'];
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    const response = await fetch('/index.html');
    const html = await response.clone().text();
    const buildAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
    const urls = [...new Set([...SHELL, ...buildAssets])];
    await Promise.all(urls.map(async (url) => {
      const fetched = await fetch(url, { cache: 'reload' });
      const headers = new Headers(fetched.headers);
      headers.delete('content-encoding');
      headers.delete('content-length');
      headers.delete('transfer-encoding');
      const body = await fetched.arrayBuffer();
      await cache.put(url, new Response(body, { status: fetched.status, statusText: fetched.statusText, headers }));
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const cached = await caches.match(event.request) || await caches.match('/index.html');
      if (cached) {
        if (self.navigator.onLine) fetch(event.request).then((response) => {
          if (response.ok) caches.open(VERSION).then((cache) => cache.put(event.request, response));
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request);
    })());
    return;
  }
  event.respondWith(caches.open(VERSION).then(async (cache) => {
    const hit = await cache.match(event.request, { ignoreSearch: true });
    if (hit) return hit;
    const response = await fetch(event.request);
    if (response.ok) await cache.put(event.request, response.clone());
    return response;
  }));
});
