// =============================================================================
// pipe.js — A pipe pair (top + bottom) with a gap the bird flies through.
//
// Pipes are drawn from genuine 52x320 sprites. Because a phone screen can be
// taller than the sprite, we extend each pipe's body to the screen edge by
// stretching a 1px slice of the sprite's far end — so the green body (with its
// shaded edges) reaches the top/bottom cleanly at any height.
// =============================================================================

import { CONFIG } from './config.js';
import { aabb } from './utils.js';

export class PipePair {
  constructor(x, gapCenter) {
    this.x = x;
    this.gapCenter = gapCenter;
    this.scored = false;
  }

  get gapTop()    { return this.gapCenter - CONFIG.PIPE_GAP / 2; }
  get gapBottom() { return this.gapCenter + CONFIG.PIPE_GAP / 2; }

  update(dt) { this.x -= CONFIG.PIPE_SPEED * dt; }

  offscreen() { return this.x + CONFIG.PIPE_W < 0; }

  // upImg = vertically-flipped sprite (lip at bottom), downImg = normal (lip at top).
  draw(ctx, upImg, downImg, groundTop) {
    const W = CONFIG.PIPE_W, PH = CONFIG.PIPE_H;
    const gt = this.gapTop, gb = this.gapBottom;

    // Source pixel size (works for both <img> and the flipped <canvas>).
    const upW = upImg.naturalWidth || upImg.width;
    const dnW = downImg.naturalWidth || downImg.width;
    const dnH = downImg.naturalHeight || downImg.height;

    // --- Top pipe: lip sits at gapTop, body extends up to the screen top. ---
    const topY = gt - PH;
    ctx.drawImage(upImg, this.x, topY, W, PH);
    if (topY > 0) {
      // Stretch the sprite's top row (pure body cross-section) up to y=0.
      ctx.drawImage(upImg, 0, 0, upW, 1, this.x, 0, W, topY);
    }

    // --- Bottom pipe: lip sits at gapBottom, body extends down to the ground. ---
    ctx.drawImage(downImg, this.x, gb, W, PH);
    const bottomEnd = gb + PH;
    if (bottomEnd < groundTop) {
      ctx.drawImage(downImg, 0, dnH - 1, dnW, 1, this.x, bottomEnd, W, groundTop - bottomEnd);
    }
  }

  collides(box, groundTop) {
    const W = CONFIG.PIPE_W;
    // Top pipe rect (from above the screen down to the gap top).
    if (aabb(box.x, box.y, box.w, box.h, this.x, -1000, W, this.gapTop + 1000)) return true;
    // Bottom pipe rect (from gap bottom down to the ground).
    if (aabb(box.x, box.y, box.w, box.h, this.x, this.gapBottom, W, groundTop - this.gapBottom)) return true;
    return false;
  }
}
