// =============================================================================
// renderer.js — Resolution-independent canvas scaling for any iPhone screen.
//
// The game world is always 288 design units wide (the original playfield). We:
//   * scale that width to fill the device width (portrait phones), keeping the
//     ground anchored to the bottom and extending sky upward — no black bars;
//   * fall back to fit-by-height with sky side-bars on wide/desktop screens;
//   * render at full devicePixelRatio with image smoothing OFF, so the pixel
//     art stays crisp on Retina displays.
//
// All game code draws in design units in [0..W] x [0..H]; the transform set up
// here maps that to physical device pixels.
// =============================================================================

import { CONFIG } from './config.js';

export const Renderer = {
  canvas: null,
  ctx: null,
  dpr: 1,
  scale: 1,     // design units -> CSS px
  offX: 0,      // CSS px (horizontal letterbox offset in wide mode)
  offY: 0,
  W: CONFIG.BASE_WIDTH,   // visible design width (always 288)
  H: CONFIG.BASE_HEIGHT,  // visible design height (grows on tall screens)

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.resize();
  },

  resize() {
    const cssW = Math.max(1, window.innerWidth);
    const cssH = Math.max(1, window.innerHeight);
    this.dpr = Math.min(window.devicePixelRatio || 1, 3);

    const BASE_W = CONFIG.BASE_WIDTH;
    const BASE_H = CONFIG.BASE_HEIGHT;

    // Portrait if the screen is at least as tall as the game's aspect ratio.
    const tallEnough = cssH * BASE_W >= BASE_H * cssW;
    if (tallEnough) {
      // Fit to width; extend the world's height (more sky at the top).
      this.scale = cssW / BASE_W;
      this.W = BASE_W;
      this.H = cssH / this.scale;
      this.offX = 0;
      this.offY = 0;
    } else {
      // Wide/desktop: fit to height, centre the 288-wide world, sky side-bars.
      this.scale = cssH / BASE_H;
      this.W = BASE_W;
      this.H = BASE_H;
      this.offX = (cssW - BASE_W * this.scale) / 2;
      this.offY = 0;
    }

    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';
    this.canvas.width = Math.round(cssW * this.dpr);
    this.canvas.height = Math.round(cssH * this.dpr);
  },

  // Clear to the sky colour (fills the whole device surface incl. side-bars),
  // then install the design-unit transform for the frame.
  begin(skyColor) {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = skyColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const s = this.scale * this.dpr;
    ctx.setTransform(s, 0, 0, s, this.offX * this.dpr, this.offY * this.dpr);
    ctx.imageSmoothingEnabled = false;
  },

  get groundTop() { return this.H - CONFIG.GROUND_H; },
};
