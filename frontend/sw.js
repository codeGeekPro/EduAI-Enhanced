// Service Worker pour EduAI Enhanced
self.addEventListener('install', (event) => {
    console.log('Service Worker installé');
    event.waitUntil(
        caches.open('eduai-cache').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/static/icons/icon-192x192.png',
                '/static/icons/icon-512x512.png',
                '/static/css/styles.css',
                '/static/js/main.js'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activé');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== 'eduai-cache') {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
