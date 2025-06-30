/**
 * 🔄 Service Worker personnalisé pour EduAI Enhanced
 * Gestion offline intelligente avec cache stratégique
 */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

// Nettoyage des anciens caches
cleanupOutdatedCaches();

// Précache des ressources statiques
precacheAndRoute(self.__WB_MANIFEST);

// 🎯 Stratégies de cache

// 1. Cache des ressources statiques (JS, CSS, fonts)
registerRoute(
  ({ request }) => request.destination === 'script' || 
                   request.destination === 'style' ||
                   request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 jours
      })
    ]
  })
);

// 2. Cache des images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 7 jours
      })
    ]
  })
);

// 3. Cache des API calls (avec fallback offline)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/courses'),
  new NetworkFirst({
    cacheName: 'courses-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60 // 5 minutes
      })
    ]
  })
);

// 4. Cache des données utilisateur
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/users') || 
               url.pathname.startsWith('/api/analytics'),
  new NetworkFirst({
    cacheName: 'user-data',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 2 * 60 // 2 minutes
      })
    ]
  })
);

// 5. Cache des services IA (avec timeout court)
registerRoute(
  ({ url }) => url.origin === 'http://localhost:8001' || 
               url.pathname.startsWith('/ai-services'),
  new StaleWhileRevalidate({
    cacheName: 'ai-services',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 1 * 60 // 1 minute
      })
    ]
  })
);

// 📡 Gestion des événements

// Sync en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData());
  }
});

// Notifications push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Nouvelle notification EduAI',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('EduAI Enhanced', options)
  );
});

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/dashboard')
    );
  }
});

// 🔄 Fonctions utilitaires

async function syncData() {
  try {
    // Récupérer les données en attente depuis IndexedDB
    const pendingData = await getPendingData();
    
    // Envoyer au serveur
    for (const data of pendingData) {
      try {
        await fetch(data.url, {
          method: data.method,
          headers: data.headers,
          body: data.body
        });
        
        // Supprimer de la queue si succès
        await removePendingData(data.id);
      } catch (error) {
        console.log('Sync failed for:', data.url);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getPendingData() {
  // Implémentation avec IndexedDB
  return [];
}

async function removePendingData(id: string) {
  // Implémentation avec IndexedDB
}

// 📊 Événements de performance
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_MEASURE') {
    // Envoyer les métriques de performance
    console.log('Performance measure:', event.data.measure);
  }
});

// 🔧 Skip waiting pour mise à jour immédiate
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🚀 EduAI Enhanced Service Worker loaded successfully!');
