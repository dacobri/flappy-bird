// =============================================================================
// ground.js — The scrolling base strip, tiled seamlessly across the width.
// =============================================================================

import { CONFIG } from './config.js';

export const Ground = {
  scrollX: 0,

  reset() { this.scrollX = 0; },

  update(dt) {
    this.scrollX += CONFIG.PIPE_SPEED * dt;
  },

  draw(ctx, img, W, groundTop) {
    const tileW = img.naturalWidth || 336;   // base.png is 336 wide
    let x = -((this.scrollX % tileW));
    while (x < W) {
      ctx.drawImage(img, x, groundTop, tileW, CONFIG.GROUND_H);
      x += tileW;
    }
  },
};
