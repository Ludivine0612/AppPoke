const CACHE_NAME = 'pokezou-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './script.js',
  './style.css',
  './manifest.json'
];

// Installation : Mise en cache des fichiers de base du jeu
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
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
});

// Stratégie Réseau : On charge depuis internet, et si pas de réseau, on prend le cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});