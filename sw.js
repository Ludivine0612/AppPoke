const CACHE_NAME = 'pokezou-cache-v2';
const ASSETS = [
  './',
  './index.html',
  './script.js',
  './style.css',
  './manifest.json'
];

// Installation : Mise en cache des fichiers locaux de base
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activation : Nettoyage des anciennes versions de cache
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
    }).then(() => self.clients.claim())
  );
});

// Stratégie de Fetch Hybride (Réseau + Cache dynamique pour l'API, Cache-First pour le local)
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Si la requête va vers PokeAPI ou les images de sprites GitHub
  if (url.hostname.includes('pokeapi.co') || url.hostname.includes('raw.githubusercontent.com')) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone); // On mémorise le Pokémon visité
          });
          return response;
        })
        .catch(() => caches.match(e.request)) // Secours hors-ligne si déjà visité
    );
  } else {
    // Pour nos fichiers locaux (HTML, CSS, JS) : Performance maximale
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        return cachedResponse || fetch(e.request);
      })
    );
  }
});