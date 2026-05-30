// =============================================================================
// main.js — Boot: load assets, build derived sprites, wire input, run the
// fixed-timestep loop, register the service worker.
// =============================================================================

import { CONFIG } from './config.js';
import { Renderer } from './renderer.js';
import { Assets } from './assets.js';
import { Audio } from './audio.js';
import { Input } from './input.js';
import { Game } from './game.js';

// Pre-render a vertically-flipped copy of an image (for the top pipe).
function flipVertical(img) {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  x.translate(0, c.height);
  x.scale(1, -1);
  x.drawImage(img, 0, 0);
  return c;
}

async function boot() {
  const canvas = document.getElementById('game');
  Renderer.init(canvas);

  // --- Load every asset with a progress bar ---
  const fill = document.getElementById('bar-fill');
  await Assets.loadAll((done, total) => {
    if (fill) fill.style.width = Math.round((done / total) * 100) + '%';
  });

  // --- Derived sprites: flipped pipes for both colours ---
  for (const color of ['green', 'red']) {
    const base = Assets.images[`pipe-${color}`];
    if (base) Assets.images[`pipe-${color}-flip`] = flipVertical(base);
  }

  // --- Audio (context created now, unlocked on first tap) ---
  Audio.init();

  // --- Game + input ---
  const game = new Game();
  window.__game = game; // expose for debugging / automated playtests
  const demo = new URLSearchParams(location.search).get('demo');
  if (demo) game.enterDemo(demo, new URLSearchParams(location.search));
  Input.init(canvas, () => { Audio.unlock(); game.tap(); });

  // Keep the canvas matched to the screen (rotation, iOS chrome show/hide).
  const onResize = () => {
    Renderer.resize();
    if (game.state === 'splash') {
      const y = Math.round(Renderer.groundTop * 0.45);
      game.bird.reset(Math.round(Renderer.W * CONFIG.BIRD_X_RATIO), y);
    }
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', onResize);

  // --- Hide the loading screen ---
  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.add('hidden');
    setTimeout(() => loading.remove(), 400);
  }

  // --- Fixed-timestep loop (deterministic physics, smooth on 60/120Hz) ---
  let last = 0, acc = 0;
  function frame(now) {
    if (!last) last = now;
    let dt = (now - last) / 1000;
    last = now;
    if (dt > CONFIG.MAX_FRAME_DT) dt = CONFIG.MAX_FRAME_DT;
    acc += dt;
    let steps = 0;
    while (acc >= CONFIG.SIM_STEP && steps < 8) {
      game.update(CONFIG.SIM_STEP);
      acc -= CONFIG.SIM_STEP;
      steps++;
    }
    if (steps === 8) acc = 0; // drop backlog after a long stall
    game.render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Service worker for offline play + installability (needs HTTPS in production).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

boot();
