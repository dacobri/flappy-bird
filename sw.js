// =============================================================================
// sw.js — Service worker: precache the app shell, cache-first for everything
// else, so the game is installable and fully playable offline.
// Bump CACHE when assets change to invalidate the old cache.
// =============================================================================

const CACHE = 'flappybird-v1';

// App shell (relative paths so it works under any GitHub Pages subpath).
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/main.js',
  './js/config.js',
  './js/utils.js',
  './js/assets.js',
  './js/audio.js',
  './js/input.js',
  './js/renderer.js',
  './js/background.js',
  './js/ground.js',
  './js/bird.js',
  './js/pipe.js',
  './js/ui.js',
  './js/scoreboard.js',
  './js/game.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        // Cache same-origin successful responses for offline use.
        if (res && res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => {
        // Offline navigation fallback.
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    }),
  );
});
