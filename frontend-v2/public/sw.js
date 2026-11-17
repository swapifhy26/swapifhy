const CACHE_NAME = 'swapifhy-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/images/features/swapifhy-logo-DPxPDdg-.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Let API requests, Next.js script chunks, and non-GET mutations pass directly through
  if (
    event.request.url.includes('/api/') || 
    event.request.url.includes('/_next/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        return caches.match('/');
      })
  );
});

self.addEventListener('push', function(event) {
  if (event.data) {
    let data = { title: "Swapifhy", body: "You have a new update!" };
    try {
      data = event.data.json();
    } catch(e) {
      data.body = event.data.text();
    }
    
    const options = {
      body: data.body,
      icon: data.icon || '/images/features/swapifhy-logo-DPxPDdg-.png',
      badge: '/images/features/swapifhy-logo-DPxPDdg-.png',
      vibrate: [80, 40, 80],
      data: { url: data.url || '/explore' }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const targetUrl = event.notification.data.url;
      for (let client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
