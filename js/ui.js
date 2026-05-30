// =============================================================================
// ui.js — Number rendering with the genuine bitmap digit sprites (0-9).
//
// The big white digits are used both for the in-game score (full size, centred)
// and, scaled down, for the score/best values on the game-over panel — keeping
// a single consistent font everywhere.
// =============================================================================

const SPACING = 1; // px between digits at scale 1

function digits(value) { return String(Math.max(0, Math.floor(value))).split(''); }

// Total rendered width of a number at a given scale.
export function numberWidth(images, value, scale = 1) {
  const ds = digits(value);
  let w = 0;
  for (const ch of ds) {
    const img = images['d' + ch];
    if (img) w += img.naturalWidth * scale;
  }
  return w + Math.max(0, ds.length - 1) * SPACING * scale;
}

// Draw a number. align: 'center' | 'left' | 'right' relative to (x, y-top).
export function drawNumber(ctx, images, value, x, y, scale = 1, align = 'center') {
  const ds = digits(value);
  const total = numberWidth(images, value, scale);
  let cx = x;
  if (align === 'center') cx = x - total / 2;
  else if (align === 'right') cx = x - total;

  for (const ch of ds) {
    const img = images['d' + ch];
    if (!img) continue;
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, cx, y, w, h);
    cx += w + SPACING * scale;
  }
}
