// =============================================================================
// utils.js — Small math/helpers shared across the game.
// =============================================================================

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

export const lerp = (a, b, t) => a + (b - a) * t;

// Map x from [inMin,inMax] to [outMin,outMax] (unclamped).
export const mapRange = (x, inMin, inMax, outMin, outMax) =>
  outMin + ((x - inMin) * (outMax - outMin)) / (inMax - inMin);

// Random float in [min, max).
export const rand = (min, max) => min + Math.random() * (max - min);

// Random integer in [min, max] inclusive.
export const randInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));

export const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Axis-aligned bounding-box overlap test.
export function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
