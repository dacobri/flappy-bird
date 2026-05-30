// =============================================================================
// sw.js — Service worker: precache the ENTIRE game (shell + sprites + audio +
// icons) so it installs once and plays fully offline, and updates cleanly.
//
// Strategy: cache-first against a single versioned cache that holds every file
// for this build. Bumping VERSION makes install fetch a fresh complete set and
// activate delete the old cache — an atomic update with no stale file mixing.
// =============================================================================

const VERSION = 'v2';
const CACHE = `flappybird-${VERSION}`;

const SPR = './assets/sprites/';
const AUD = './assets/audio/';
const IC = './assets/icons/';

const PRECACHE = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  // scripts
  './js/main.js', './js/config.js', './js/utils.js', './js/assets.js',
  './js/audio.js', './js/input.js', './js/renderer.js', './js/background.js',
  './js/ground.js', './js/bird.js', './js/pipe.js', './js/ui.js',
  './js/scoreboard.js', './js/game.js',
  // environment + ui sprites
  SPR + 'background-day.png', SPR + 'background-night.png', SPR + 'base.png',
  SPR + 'message.png', SPR + 'gameover.png', SPR + 'pipe-green.png', SPR + 'pipe-red.png',
  SPR + 'medal-bronze.png', SPR + 'medal-silver.png', SPR + 'medal-gold.png', SPR + 'medal-platinum.png',
  // audio
  AUD + 'wing.mp3', AUD + 'point.mp3', AUD + 'hit.mp3', AUD + 'die.mp3', AUD + 'swoosh.mp3',
  // icons
  IC + 'icon-192.png', IC + 'icon-512.png', IC + 'icon-maskable-512.png', IC + 'apple-touch-icon.png',
];
for (let i = 0; i <= 9; i++) PRECACHE.push(SPR + i + '.png');
for (const c of ['yellow', 'red', 'blue'])
  for (const f of ['upflap', 'midflap', 'downflap']) PRECACHE.push(SPR + c + 'bird-' + f + '.png');

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // Tolerate a missing optional file rather than failing the whole install.
    await Promise.allSettled(PRECACHE.map((u) => c.add(u)));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      return await fetch(req);
    } catch {
      if (req.mode === 'navigate') return caches.match('./index.html');
      throw new Error('offline and uncached');
    }
  })());
});
