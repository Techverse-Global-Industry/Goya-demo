/* No account pages, API responses, or checkout data are stored in the cache. */
const VERSION = 'maison-goya-v2';
const OFFLINE = '/offline.html';
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll([OFFLINE, '/icons/icon-192.png'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('maison-goya-') && key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE)));
    return;
  }
  if (!url.pathname.startsWith('/icons/') && !url.pathname.startsWith('/images/')) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    const response = await fetch(event.request);
    if (response.ok) {
      const cache = await caches.open(VERSION);
      await cache.put(event.request, response.clone());
      const keys = await cache.keys();
      if (keys.length > 40) await cache.delete(keys.find((request) => new URL(request.url).pathname.startsWith('/images/')) || keys[0]);
    }
    return response;
  })());
});
self.addEventListener('push', (event) => {
  let data = { title: 'Maison Goya', body: 'An update from your Maison.', url: '/app/updates' };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch { /* readable fallback */ }
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', tag: data.tag || 'maison-update', data: { url: data.url } }));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let url = new URL(event.notification.data?.url || '/app/updates', self.location.origin);
  if (url.origin !== self.location.origin) url = new URL('/app/updates', self.location.origin);
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clients) => {
    const client = clients.find((client) => new URL(client.url).origin === self.location.origin);
    if (client) { await client.navigate(url.href); return client.focus(); }
    return self.clients.openWindow(url.href);
  }));
});
