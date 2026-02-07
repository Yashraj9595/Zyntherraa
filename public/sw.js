// Dynamic cache versioning based on timestamp
const CACHE_VERSION = new Date().getTime();
const CACHE_NAME = `zyntherraa-app-v${CACHE_VERSION}`;
const STATIC_CACHE = `zyntherraa-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `zyntherraa-dynamic-v${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo/logo192x192.png',
  '/logo/logo512x512.jpg'
];

// Install event - cache static assets and notify clients
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing new version...');
  
  // Notify all clients about the update
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ 
        type: 'NEW_VERSION_AVAILABLE',
        version: CACHE_VERSION 
      });
    });
  });
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first for API calls, cache first for static assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // Network-first strategy for API calls and dynamic content
  if (url.pathname.startsWith('/api/') || 
      url.pathname.includes('admin') || 
      url.search.includes('timestamp') ||
      event.request.headers.get('cache-control') === 'no-cache') {
    
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        } catch (error) {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.destination === 'document') {
            const offlinePage = await caches.match('/');
            if (offlinePage) {
              return offlinePage;
            }
          }
          return new Response('', { status: 502, statusText: 'Service Unavailable' });
        }
      })()
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    (async () => {
      try {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          const cacheDate = cachedResponse.headers.get('date');
          const isOld = cacheDate && (Date.now() - new Date(cacheDate).getTime()) > 3600000;

          if (isOld && navigator.onLine) {
            fetch(event.request)
              .then((response) => {
                if (response && response.status === 200) {
                  caches.open(STATIC_CACHE)
                    .then((cache) => {
                      cache.put(event.request, response.clone());
                    });
                }
              })
              .catch(() => {});
          }

          return cachedResponse;
        }

        const response = await fetch(event.request);
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(STATIC_CACHE)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      } catch (error) {
        if (event.request.destination === 'document') {
          const offlinePage = await caches.match('/');
          if (offlinePage) {
            return offlinePage;
          }
        }
        return new Response('', { status: 502, statusText: 'Service Unavailable' });
      }
    })()
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Zyntherraa!',
    icon: '/logo/logo192x192.png',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/logo/logo192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Zyntherraa App', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();

  // Handle notification actions
  if (event.action === 'open' || event.action === 'explore') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // If a window is already open, focus it
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  } else if (event.action === 'close') {
    // Just close the notification (already closed above)
    event.notification.close();
  } else {
    // Default: open the app when notification is clicked (no action button)
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations here
      console.log('Service Worker: Performing background sync')
    );
  }
});

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CLEAR_CACHE') {
    // Clear all caches when requested
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Notify main thread that cache is cleared
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'CACHE_CLEARED' });
        });
      });
    });
  }
});
