// Service Worker - CACHING DISABLED FOR DEVELOPMENT
// All fetch requests pass through without caching

const CACHE_VERSION = new Date().getTime();
const CACHE_NAME = `zyntherraa-app-v${CACHE_VERSION}`;

// Install event - skip caching
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing (cache disabled)...');
  self.skipWaiting();
});

// Activate event - clean up any old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating (cache disabled)...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Service Worker: Deleting cache', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service Worker: All caches cleared');
      return self.clients.claim();
    })
  );
});

// Fetch event - NO CACHING, just pass through
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // Skip caching for unsupported URL schemes (chrome-extension, etc.)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Always fetch from network, no caching
  event.respondWith(
    fetch(event.request).catch(() => {
      // Return offline page for navigation requests if network fails
      if (event.request.destination === 'document') {
        return new Response('Offline - Please check your connection', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      }
      throw new Error('Network request failed');
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Zyntherraa!',
    icon: '/logo192.png',
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
        icon: '/logo192.png'
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
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    event.notification.close();
  } else {
    event.waitUntil(
      clients.openWindow('/')
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
