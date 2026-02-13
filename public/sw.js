// VetBuddy Service Worker
// Versione: 1.0.0

const CACHE_NAME = 'vetbuddy-v1';
const STATIC_CACHE = 'vetbuddy-static-v1';
const DYNAMIC_CACHE = 'vetbuddy-dynamic-v1';

// Risorse statiche da pre-cachare
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.svg',
  '/favicon.ico'
];

// Risorse API da cachare per offline
const API_CACHE_PATTERNS = [
  '/api/pets',
  '/api/appointments',
  '/api/documents',
  '/api/messages'
];

// Install event - pre-cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service Worker installed');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((err) => {
        console.error('[SW] Pre-cache failed:', err);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Handle static assets with cache-first strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Handle page requests with stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Cache-first strategy (for static assets)
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Cache-first fetch failed:', error);
    return new Response('Offline - Contenuto non disponibile', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network-first strategy (for API requests)
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful API responses
    if (response.ok && shouldCacheApi(request.url)) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Returning cached API response');
      return cached;
    }
    
    // Return offline JSON for API requests
    return new Response(JSON.stringify({
      error: 'offline',
      message: 'Sei offline. I dati mostrati potrebbero non essere aggiornati.',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale-while-revalidate (for pages)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => {
      return cached || offlineFallback();
    });
  
  return cached || fetchPromise;
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/i.test(pathname);
}

// Check if API should be cached
function shouldCacheApi(url) {
  return API_CACHE_PATTERNS.some(pattern => url.includes(pattern));
}

// Offline fallback page
function offlineFallback() {
  return new Response(`
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VetBuddy - Offline</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #FFF5F5, #FFE5E5);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          max-width: 400px;
          box-shadow: 0 10px 40px rgba(255, 107, 107, 0.1);
        }
        .icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
        }
        h1 { color: #FF6B6B; margin-bottom: 15px; }
        p { color: #666; margin-bottom: 20px; line-height: 1.6; }
        .btn {
          background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 25px;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .btn:hover { transform: scale(1.05); }
      </style>
    </head>
    <body>
      <div class="container">
        <svg class="icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="62" rx="18" ry="16" fill="#FF6B6B"/>
          <ellipse cx="28" cy="38" rx="10" ry="12" fill="#FF6B6B"/>
          <ellipse cx="50" cy="28" rx="10" ry="12" fill="#FF6B6B"/>
          <ellipse cx="72" cy="38" rx="10" ry="12" fill="#FF6B6B"/>
        </svg>
        <h1>Sei Offline</h1>
        <p>
          Non sei connesso a Internet. 
          Alcune funzionalità potrebbero non essere disponibili.
        </p>
        <button class="btn" onclick="location.reload()">
          Riprova
        </button>
      </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('[SW] Background sync triggered');
    // Implementazione futura per sincronizzare dati offline
  }
});

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('[SW] Push notification received:', data);
    
    const options = {
      body: data.body || 'Nuova notifica da VetBuddy',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' },
      actions: [
        { action: 'open', title: 'Apri' },
        { action: 'close', title: 'Chiudi' }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'VetBuddy', options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') return;
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if there's already an open window
      for (const client of windowClients) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if no existing one
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

console.log('[SW] Service Worker script loaded');
