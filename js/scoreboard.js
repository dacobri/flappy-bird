// =============================================================================
// scoreboard.js — The game-over screen: "Game Over" title, results panel,
// medal, score/best, a NEW badge, and a pulsing restart prompt.
//
// The "Game Over" title is the genuine sprite; medals are faithful sprites; the
// panel is drawn to match the original tan results card so its palette lines up
// exactly with the genuine artwork.
// =============================================================================

import { CONFIG } from './config.js';
import { drawNumber, numberWidth } from './ui.js';

const PW = 226, PH = 114;          // panel size (design units)
const PANEL_TAN   = '#ded895';
const PANEL_EDGE  = '#54442f';
const PANEL_INNER = '#f7f7d8';
const LABEL_ORANGE = '#e87b0e';
const SHADOW = 'rgba(0,0,0,0.25)';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Pick the best medal earned, or null.
export function medalFor(score) {
  for (const m of CONFIG.MEDALS) if (score >= m.score) return m.name;
  return null;
}

function label(ctx, text, x, y) {
  ctx.font = '700 9px -apple-system, "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#5a3a1e';
  ctx.fillText(text, x + 0.7, y + 0.7);   // soft shadow
  ctx.fillStyle = LABEL_ORANGE;
  ctx.fillText(text, x, y);
}

function newBadge(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = '#eb5a3a';
  roundRect(ctx, x, y, 22, 10, 2);
  ctx.fill();
  ctx.font = '700 7px -apple-system, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText('NEW', x + 11, y + 5.5);
  ctx.restore();
}

// opts: { images, score, best, isNew, medal, H, time, titleT (0..1), panelT (0..1), showPrompt }
export function drawGameOver(ctx, opts) {
  const { images, score, best, isNew, medal, H, time, titleT, panelT, showPrompt } = opts;
  const cx = CONFIG.BASE_WIDTH / 2;

  // --- "Game Over" title drops in from above ---
  const title = images['gameover'];
  if (title) {
    const tw = title.naturalWidth, th = title.naturalHeight;
    const targetY = H * 0.20;
    const ty = -th + (targetY + th) * easeOut(titleT);
    ctx.drawImage(title, cx - tw / 2, ty, tw, th);
  }

  // --- Results panel slides up from below ---
  const finalY = H * 0.32;
  const py = finalY + (H - finalY) * (1 - easeOut(panelT));
  const px = cx - PW / 2;

  // shadow
  ctx.fillStyle = SHADOW;
  roundRect(ctx, px + 3, py + 4, PW, PH, 9);
  ctx.fill();
  // body + bevel
  ctx.fillStyle = PANEL_EDGE;
  roundRect(ctx, px, py, PW, PH, 9);
  ctx.fill();
  ctx.fillStyle = PANEL_TAN;
  roundRect(ctx, px + 2, py + 2, PW - 4, PH - 4, 8);
  ctx.fill();
  ctx.fillStyle = PANEL_INNER;
  roundRect(ctx, px + 5, py + 5, PW - 10, PH - 10, 6);
  ctx.fill();
  ctx.fillStyle = PANEL_TAN;
  roundRect(ctx, px + 7, py + 7, PW - 14, PH - 14, 5);
  ctx.fill();

  // --- Medal (left) ---
  const mImg = medal ? images['medal-' + medal] : null;
  const medalCx = px + 48, medalCy = py + PH / 2 + 2;
  // medal well
  ctx.fillStyle = 'rgba(0,0,0,0.07)';
  ctx.beginPath();
  ctx.arc(medalCx, medalCy, 25, 0, Math.PI * 2);
  ctx.fill();
  if (mImg) ctx.drawImage(mImg, medalCx - 22, medalCy - 22, 44, 44);

  // --- Score / Best (right) ---
  const rx = px + PW - 18;
  label(ctx, 'SCORE', rx, py + 14);
  drawNumber(ctx, images, score, rx, py + 26, 0.5, 'right');
  label(ctx, 'BEST', rx, py + 60);
  drawNumber(ctx, images, best, rx, py + 72, 0.5, 'right');

  if (isNew) {
    const bw = numberWidth(images, best, 0.5);
    newBadge(ctx, rx - bw - 26, py + 72);
  }

  // --- Restart prompt (pulsing) ---
  if (showPrompt) {
    const a = 0.55 + 0.45 * Math.sin(time * 5);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = '800 13px -apple-system, "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#5a3a1e';
    ctx.fillText('TAP TO PLAY', cx + 1, py + PH + 31);
    ctx.fillStyle = '#fff';
    ctx.fillText('TAP TO PLAY', cx, py + PH + 30);
    ctx.restore();
  }
}

function easeOut(t) { t = Math.min(1, Math.max(0, t)); return 1 - (1 - t) * (1 - t); }
