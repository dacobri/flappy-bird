// =============================================================================
// audio.js — Low-latency SFX via the Web Audio API, with the iOS unlock dance.
//
// iOS Safari starts every AudioContext "suspended" and only allows it to start
// inside a user gesture. We create the context lazily, decode all SFX into
// reusable AudioBuffers, and on the first touch we resume() the context and
// play a silent buffer to fully unlock audio output.
// =============================================================================

import { CONFIG } from './config.js';
import { Assets, AUDIO_PATHS } from './assets.js';

export const Audio = {
  ctx: null,
  master: null,
  buffers: {},      // key -> decoded AudioBuffer
  unlocked: false,
  muted: false,

  init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = CONFIG.SFX_VOLUME;
    this.master.connect(this.ctx.destination);
    // Decode every fetched SFX buffer (decodeAudioData works while suspended).
    for (const key of Object.keys(AUDIO_PATHS)) {
      const raw = Assets.audioBuffers[key];
      if (!raw) continue;
      // Copy the ArrayBuffer because decodeAudioData detaches it.
      this.ctx.decodeAudioData(raw.slice(0)).then(
        (buf) => { this.buffers[key] = buf; },
        () => console.warn('decode failed:', key),
      );
    }
  },

  // Call from within a user-gesture handler (pointerdown).
  unlock() {
    if (!this.ctx || this.unlocked) return;
    const resume = this.ctx.resume ? this.ctx.resume() : Promise.resolve();
    Promise.resolve(resume).then(() => {
      const src = this.ctx.createBufferSource();
      src.buffer = this.ctx.createBuffer(1, 1, 22050);
      src.connect(this.ctx.destination);
      src.start(0);
      this.unlocked = true;
    });
  },

  play(key) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const buf = this.buffers[key];
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.master);
    src.start(0);
  },
};
