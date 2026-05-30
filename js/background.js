// =============================================================================
// background.js — Draws the day/night backdrop, bottom-aligned to the ground.
//
// The 288x512 background is drawn so its internal ground line (y=400) lines up
// with the game's ground, exactly like the original. On tall screens the area
// above the image is filled by the renderer with the sampled sky colour, which
// matches the image's top row — so the extension is seamless.
// =============================================================================

import { CONFIG } from './config.js';

export const Background = {
  // Sample the image's top-left pixel so the renderer can flood-fill matching sky.
  sampleSky(img) {
    try {
      const c = document.createElement('canvas');
      c.width = 1; c.height = 1;
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
      return `rgb(${r},${g},${b})`;
    } catch {
      return '#4ec0ca'; // iconic Flappy day-sky teal as a fallback
    }
  },

  draw(ctx, img, H) {
    // Bottom-align the 512-tall image; the renderer fills sky above it.
    ctx.drawImage(img, 0, H - CONFIG.BASE_HEIGHT, CONFIG.BASE_WIDTH, CONFIG.BASE_HEIGHT);
  },
};
