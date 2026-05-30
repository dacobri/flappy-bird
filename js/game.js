// =============================================================================
// game.js — The game itself: state machine, spawning, scoring, collisions,
// medals, high score, and all rendering composition.
//
// States:  'splash'  Get-Ready screen, bird bobbing, tap to start
//          'play'    pipes scroll, gravity + flapping, scoring
//          'dead'    collision happened; bird tumbles to the ground (no input)
//          'over'    results panel; tap to play again
// =============================================================================

import { CONFIG } from './config.js';
import { Renderer } from './renderer.js';
import { Audio } from './audio.js';
import { Assets, BIRD_COLORS } from './assets.js';
import { Background } from './background.js';
import { Ground } from './ground.js';
import { Bird } from './bird.js';
import { PipePair } from './pipe.js';
import { drawNumber } from './ui.js';
import { drawGameOver, medalFor } from './scoreboard.js';
import { choice, randInt, clamp } from './utils.js';

export class Game {
  constructor() {
    this.r = Renderer;
    this.img = Assets.images;
    this.state = 'splash';
    this.time = 0;
    this.best = this._loadBest();
    this.bird = new Bird('yellow');
    this.pipes = [];
    this.score = 0;
    this.flash = 0;
    this.shakeT = 0;
    this.newRound();
  }

  // ---- persistence ----
  _loadBest() {
    try { return parseInt(localStorage.getItem(CONFIG.STORAGE_KEY), 10) || 0; }
    catch { return 0; }
  }
  _saveBest() {
    try { localStorage.setItem(CONFIG.STORAGE_KEY, String(this.best)); } catch {}
  }

  // ---- round setup ----
  newRound() {
    this.state = 'splash';
    this.score = 0;
    this.pipes = [];
    this.flash = 0;
    this.shakeT = 0;
    this.overTime = 0;
    this.diePlayed = false;
    this.isNew = false;
    this.medal = null;

    // Randomise the look every round, just like the original.
    this.birdColor = choice(BIRD_COLORS);
    this.bgKey = choice(['bg-day', 'bg-night']);
    this.pipeColor = choice(['green', 'red']);
    this.sky = Background.sampleSky(this.img[this.bgKey]);

    const startY = Math.round(this.r.groundTop * 0.45);
    this.bird = new Bird(this.birdColor);
    this.bird.reset(Math.round(this.r.W * CONFIG.BIRD_X_RATIO), startY);
  }

  // ---- input ----
  tap() {
    if (this.state === 'splash') {
      this.state = 'play';
      this.bird.flap();
      Audio.play('wing');
    } else if (this.state === 'play') {
      this.bird.flap();
      Audio.play('wing');
    } else if (this.state === 'over' && this.overTime > 0.7) {
      Audio.play('swoosh');
      this.newRound();
    }
  }

  // ---- simulation ----
  _spawnPipe() {
    const gt = this.r.groundTop;
    let center = gt - randInt(CONFIG.GAP_MIN_ABOVE_GROUND, CONFIG.GAP_MAX_ABOVE_GROUND);
    const minC = CONFIG.GAP_TOP_MARGIN + CONFIG.PIPE_GAP / 2;
    const maxC = gt - CONFIG.PIPE_GAP / 2 - 10;
    center = clamp(center, minC, maxC);
    const last = this.pipes[this.pipes.length - 1];
    const x = last ? last.x + CONFIG.PIPE_SPACING : this.r.W + 60;
    this.pipes.push(new PipePair(x, center));
  }

  _die(byGround) {
    this.state = 'dead';
    this.bird.alive = false;
    this.flash = 1;
    this.shakeT = 0.28;
    Audio.play('hit');
    if (byGround) {
      // Already at the floor — the death sound follows almost immediately.
      this.diePlayed = false;
    }
  }

  _enterOver() {
    this.state = 'over';
    this.overTime = 0;
    if (this.score > this.best) { this.best = this.score; this.isNew = true; this._saveBest(); }
    this.medal = medalFor(this.score);
    Audio.play('swoosh');
  }

  update(dt) {
    this.time += dt;
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt / 0.3);
    if (this.shakeT > 0) this.shakeT = Math.max(0, this.shakeT - dt);

    const gt = this.r.groundTop;

    if (this.state === 'splash') {
      this.bird.update(dt, 'splash', this.time);
      Ground.update(dt);
      return;
    }

    if (this.state === 'play') {
      this.bird.update(dt, 'play');

      // ceiling clamp (no death, like the original)
      if (this.bird.y < 0) { this.bird.y = 0; this.bird.vy = 0; }

      Ground.update(dt);

      // spawn / advance / cull pipes
      const last = this.pipes[this.pipes.length - 1];
      if (!last || last.x <= this.r.W - CONFIG.PIPE_SPACING) this._spawnPipe();
      for (const p of this.pipes) p.update(dt);
      this.pipes = this.pipes.filter((p) => !p.offscreen());

      // scoring
      for (const p of this.pipes) {
        if (!p.scored && this.bird.x > p.x + CONFIG.PIPE_W / 2) {
          p.scored = true;
          this.score++;
          Audio.play('point');
        }
      }

      // collisions
      const box = this.bird.hitbox();
      if (box.y + box.h >= gt) {                 // ground
        this.bird.y = gt - CONFIG.BIRD_H;
        this._die(true);
      } else {
        for (const p of this.pipes) {
          if (p.collides(box, gt)) { this._die(false); break; }
        }
      }
      return;
    }

    if (this.state === 'dead') {
      // Bird tumbles; world is frozen.
      this.bird.update(dt, 'dead');
      if (this.bird.y + CONFIG.BIRD_H >= gt) {
        this.bird.y = gt - CONFIG.BIRD_H;
        this.bird.vy = 0;
        if (!this.diePlayed) { Audio.play('die'); this.diePlayed = true; }
        this._enterOver();
      }
      return;
    }

    if (this.state === 'over') {
      this.overTime += dt;
    }
  }

  // ---- rendering ----
  render() {
    const r = this.r, ctx = r.ctx;
    r.begin(this.sky);

    ctx.save();
    if (this.shakeT > 0) {
      const m = (this.shakeT / 0.28) * 3;
      ctx.translate((Math.random() * 2 - 1) * m, (Math.random() * 2 - 1) * m);
    }

    // world
    Background.draw(ctx, this.img[this.bgKey], r.H);
    const up = this.img[`pipe-${this.pipeColor}-flip`];
    const down = this.img[`pipe-${this.pipeColor}`];
    for (const p of this.pipes) p.draw(ctx, up, down, r.groundTop);
    Ground.draw(ctx, this.img['base'], r.W, r.groundTop);
    this.bird.draw(ctx, this.img);

    // UI
    if (this.state === 'splash') {
      const m = this.img['message'];
      if (m) ctx.drawImage(m, r.W / 2 - m.naturalWidth / 2, r.H * 0.34 - m.naturalHeight / 2,
        m.naturalWidth, m.naturalHeight);
    } else if (this.state === 'play' || this.state === 'dead') {
      drawNumber(ctx, this.img, this.score, r.W / 2, r.H * 0.10, 1, 'center');
    } else if (this.state === 'over') {
      drawGameOver(ctx, {
        images: this.img, score: this.score, best: this.best, isNew: this.isNew,
        medal: this.medal, H: r.H, time: this.time,
        titleT: clamp(this.overTime / 0.3, 0, 1),
        panelT: clamp((this.overTime - 0.25) / 0.35, 0, 1),
        showPrompt: this.overTime > 0.7,
      });
    }

    ctx.restore();

    // white death flash (full device surface, above everything)
    if (this.flash > 0) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = `rgba(255,255,255,${this.flash})`;
      ctx.fillRect(0, 0, r.canvas.width, r.canvas.height);
    }
  }
}
