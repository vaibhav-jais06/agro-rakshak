const CACHE_VERSION = 'agro-rakshak-v2';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(() => {
        console.log('Could not cache all resources on install');
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // API requests: Network-First
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const responseClone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((response) => {
            return response || new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // Navigation requests (HTML): Network-First
  // This prevents the app from crashing when a new deployment is pushed
  // and the cached index.html references old, deleted JS bundles.
  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((response) => {
            return response || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Static assets: Cache-First
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      });
    }).catch(() => {
      return new Response('Offline', { status: 503 });
    })
  );
});

self.addEventListener('push', (event) => {
  let notification = {
    title: 'Agro Rakshak',
    body: 'New crop recommendation available',
    icon: '/logo192.png',
    badge: '/favicon.ico',
    tag: 'crop-alert',
    requireInteraction: true
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notification = {
        ...notification,
        ...data,
        tag: data.tag || 'crop-alert'
      };
    } catch (e) {
      notification.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notification.title, notification)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});
