// =============================================================================
// assets.js — Declares every asset and loads them with progress reporting.
//
// Images are decoded into HTMLImageElements. Audio is fetched as raw
// ArrayBuffers here; the AudioManager decodes them once the AudioContext exists
// (required so decoding works under iOS autoplay restrictions).
// =============================================================================

const SPR = 'assets/sprites/';
const AUD = 'assets/audio/';

// --- Image manifest (key -> path) ---
const IMAGE_PATHS = {
  'bg-day':   SPR + 'background-day.png',
  'bg-night': SPR + 'background-night.png',
  'base':     SPR + 'base.png',

  'pipe-green': SPR + 'pipe-green.png',
  'pipe-red':   SPR + 'pipe-red.png',

  'message':  SPR + 'message.png',
  'gameover': SPR + 'gameover.png',

  'medal-bronze':   SPR + 'medal-bronze.png',
  'medal-silver':   SPR + 'medal-silver.png',
  'medal-gold':     SPR + 'medal-gold.png',
  'medal-platinum': SPR + 'medal-platinum.png',
};

// Bird colours x animation frames.
export const BIRD_COLORS = ['yellow', 'red', 'blue'];
for (const c of BIRD_COLORS) {
  IMAGE_PATHS[`bird-${c}-up`]   = `${SPR}${c}bird-upflap.png`;
  IMAGE_PATHS[`bird-${c}-mid`]  = `${SPR}${c}bird-midflap.png`;
  IMAGE_PATHS[`bird-${c}-down`] = `${SPR}${c}bird-downflap.png`;
}

// Score digits 0-9 (the big in-game font).
for (let i = 0; i <= 9; i++) IMAGE_PATHS[`d${i}`] = `${SPR}${i}.png`;

// --- Audio manifest (key -> path). mp3 is reliable on iOS Safari. ---
export const AUDIO_PATHS = {
  wing:   AUD + 'wing.mp3',
  point:  AUD + 'point.mp3',
  hit:    AUD + 'hit.mp3',
  die:    AUD + 'die.mp3',
  swoosh: AUD + 'swoosh.mp3',
};

// Optional images may be missing without breaking the game (we draw fallbacks).
const OPTIONAL = new Set([
  'medal-bronze', 'medal-silver', 'medal-gold', 'medal-platinum',
]);

export const Assets = {
  images: {},        // key -> HTMLImageElement
  audioBuffers: {},  // key -> ArrayBuffer (decoded later by AudioManager)

  img(key) { return this.images[key]; },

  loadImage(key, path) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { this.images[key] = img; resolve(true); };
      img.onerror = () => {
        if (!OPTIONAL.has(key)) console.warn('Missing image:', path);
        resolve(false);
      };
      img.src = path;
    });
  },

  async loadAudio(key, path) {
    try {
      const res = await fetch(path);
      if (res.ok) this.audioBuffers[key] = await res.arrayBuffer();
    } catch (e) {
      console.warn('Missing audio:', path);
    }
  },

  // Load everything; onProgress(loaded, total) is called as items complete.
  async loadAll(onProgress) {
    const tasks = [];
    for (const [k, p] of Object.entries(IMAGE_PATHS)) tasks.push(() => this.loadImage(k, p));
    for (const [k, p] of Object.entries(AUDIO_PATHS)) tasks.push(() => this.loadAudio(k, p));

    let done = 0;
    const total = tasks.length;
    await Promise.all(tasks.map(async (t) => {
      await t();
      done++;
      if (onProgress) onProgress(done, total);
    }));
  },
};
