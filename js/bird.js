// =============================================================================
// bird.js — The player bird: physics, velocity-based rotation, wing animation.
//
// Flap SETS the vertical velocity (it doesn't add) — this is what gives Flappy
// Bird its signature "hop". Rotation snaps nose-up while rising and tips toward
// a 90° nose-dive as the bird falls, matching the original.
// =============================================================================

import { CONFIG } from './config.js';
import { clamp } from './utils.js';

// Wing-flap frame order (up, mid, down, mid) — the canonical 4-step cycle.
const FRAME_CYCLE = ['up', 'mid', 'down', 'mid'];

export class Bird {
  constructor(color) {
    this.color = color;       // 'yellow' | 'red' | 'blue'
    this.x = 0;
    this.y = 0;
    this.baseY = 0;           // splash bob centre
    this.vy = 0;
    this.angle = 0;
    this.animTime = 0;
    this.frame = 'mid';
    this.alive = true;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.vy = 0;
    this.angle = 0;
    this.animTime = 0;
    this.frame = 'mid';
    this.alive = true;
  }

  flap() {
    this.vy = CONFIG.FLAP_VELOCITY;
    this.angle = CONFIG.BIRD_UP_ANGLE;
  }

  // mode: 'splash' | 'play' | 'dead'
  update(dt, mode, t) {
    if (mode === 'splash') {
      // Gentle idle bob; wings keep flapping.
      const bob = Math.sin((t / CONFIG.SPLASH_BOB_PERIOD) * Math.PI * 2);
      this.y = this.baseY + bob * CONFIG.SPLASH_BOB_AMP;
      this.angle = 0;
      this._animate(dt);
      return;
    }

    // Gravity integration (semi-implicit Euler).
    this.vy = clamp(this.vy + CONFIG.GRAVITY * dt, -Infinity, CONFIG.MAX_FALL_SPEED);
    this.y += this.vy * dt;

    // Rotation: nose-up while rising, tip toward nose-dive while falling.
    if (this.vy < 0) {
      this.angle = CONFIG.BIRD_UP_ANGLE;
    } else {
      this.angle = Math.min(CONFIG.BIRD_DOWN_ANGLE, this.angle + CONFIG.BIRD_ROT_SPEED * dt);
    }

    // Wings stop flapping once dead.
    if (mode === 'play') this._animate(dt);
  }

  _animate(dt) {
    this.animTime += dt;
    const i = Math.floor(this.animTime * CONFIG.BIRD_ANIM_FPS) % FRAME_CYCLE.length;
    this.frame = FRAME_CYCLE[i];
  }

  hitbox() {
    const inset = CONFIG.BIRD_HITBOX_INSET;
    return {
      x: this.x + inset,
      y: this.y + inset,
      w: CONFIG.BIRD_W - inset * 2,
      h: CONFIG.BIRD_H - inset * 2,
    };
  }

  draw(ctx, images) {
    const img = images[`bird-${this.color}-${this.frame}`];
    if (!img) return;
    const w = CONFIG.BIRD_W, h = CONFIG.BIRD_H;
    ctx.save();
    ctx.translate(this.x + w / 2, this.y + h / 2);
    ctx.rotate(this.angle);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
}
