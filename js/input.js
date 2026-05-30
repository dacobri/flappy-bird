// =============================================================================
// input.js — Unified tap/click/key input, hardened for iOS Safari.
//
// We use Pointer Events (covers touch + mouse in one path), plus keyboard for
// desktop. We aggressively prevent the iOS defaults that ruin a fullscreen
// game: scrolling, pinch-zoom, double-tap-zoom, long-press callout, and the
// elastic overscroll. CSS `touch-action: none` does most of it; these handlers
// cover the rest.
// =============================================================================

export const Input = {
  init(target, onTap) {
    const tap = (e) => {
      // Ignore multi-finger gestures (let the browser handle nothing — we block zoom).
      onTap();
    };

    // Primary input path.
    target.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      tap(e);
    }, { passive: false });

    // Keyboard for desktop play / accessibility.
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        tap(e);
      }
    });

    // --- Block iOS gestures that would break fullscreen play ---
    const block = (e) => e.preventDefault();
    document.addEventListener('touchmove', block, { passive: false });
    document.addEventListener('gesturestart', block, { passive: false });
    document.addEventListener('gesturechange', block, { passive: false });
    document.addEventListener('contextmenu', block);
    // Prevent double-tap-to-zoom by swallowing rapid successive touchends.
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    }, { passive: false });
  },
};
