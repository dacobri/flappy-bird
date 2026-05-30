// =============================================================================
// config.js — All gameplay constants for the Flappy Bird clone.
//
// Everything is expressed in "design units" (the original game's pixels, on a
// 288x512 reference stage) so the renderer can scale the whole game to any
// iPhone screen while gameplay stays identical.
//
// The original Flappy Bird simulation ran at 30 FPS with PER-FRAME constants.
// We run a framerate-independent fixed-timestep simulation, so those per-frame
// values are converted to PER-SECOND units (multiply velocity by 30, and
// acceleration by 30^2) to preserve the exact original feel on 60Hz/120Hz:
//
//   gravity   1  px/frame^2  ->  1 * 30^2 =  900  px/s^2
//   flap     -9  px/frame    -> -9 * 30   = -270  px/s   (velocity is SET)
//   maxFall  10  px/frame    -> 10 * 30   =  300  px/s
//   pipeVelX -4  px/frame    -> -4 * 30   = -120  px/s
// =============================================================================

export const CONFIG = {
  // Reference stage (the original portrait playfield).
  BASE_WIDTH: 288,
  BASE_HEIGHT: 512,

  // ---- Physics (per second) ----
  GRAVITY: 900,
  FLAP_VELOCITY: -270,   // velocity is SET to this on each flap (not added)
  MAX_FALL_SPEED: 300,

  // ---- Bird ----
  BIRD_X_RATIO: 0.2,            // bird.x = 0.2 * BASE_WIDTH  (~57)
  BIRD_W: 34,
  BIRD_H: 24,
  BIRD_HITBOX_INSET: 4,        // shrink the collision box slightly (fair, like original)
  BIRD_ANIM_FPS: 9,            // wing-flap animation rate
  BIRD_UP_ANGLE: -25 * Math.PI / 180,
  BIRD_DOWN_ANGLE: 90 * Math.PI / 180,
  BIRD_ROT_SPEED: 540 * Math.PI / 180,  // rad/s the nose tips down while falling
  SPLASH_BOB_AMP: 5,           // idle vertical bob amplitude on the start screen
  SPLASH_BOB_PERIOD: 0.55,     // seconds per bob cycle

  // ---- Pipes ----
  PIPE_W: 52,
  PIPE_H: 320,
  PIPE_GAP: 100,               // vertical opening (canonical FlapPyBird value)
  PIPE_SPEED: 120,
  PIPE_SPACING: 170,           // horizontal distance between successive pipe pairs
  GAP_MIN_ABOVE_GROUND: 110,   // gap-center min distance above the ground line
  GAP_MAX_ABOVE_GROUND: 300,   // gap-center max distance above the ground line
  GAP_TOP_MARGIN: 50,          // never let the gap's top go above this y

  // ---- Ground ----
  GROUND_H: 112,

  // ---- Scoring / medals ----
  // Highest threshold first so we can pick the best earned medal.
  MEDALS: [
    { name: 'platinum', score: 40 },
    { name: 'gold',     score: 30 },
    { name: 'silver',   score: 20 },
    { name: 'bronze',   score: 10 },
  ],

  // ---- Audio ----
  SFX_VOLUME: 0.55,

  // ---- Persistence ----
  STORAGE_KEY: 'flappybird.best',

  // ---- Fixed-timestep loop ----
  SIM_STEP: 1 / 120,           // seconds per physics step (smooth on 60/120Hz)
  MAX_FRAME_DT: 0.25,          // clamp huge frame gaps (tab switch) to avoid spiral
};
