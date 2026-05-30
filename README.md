# Flappy Bird

A pixel-perfect recreation of the original **Flappy Bird**, built to be played on an
iPhone in the browser (and installable to the Home Screen as a fullscreen PWA).

Pure vanilla JavaScript + HTML5 Canvas — no frameworks, no build step.

## Play

Open the deployed URL on your phone and tap to flap. On iPhone, tap the **Share →
Add to Home Screen** to play fullscreen like a native app (works offline too).

## What makes it faithful

- **Genuine sprites & sounds** from the original game (3 bird colours, day/night
  skies, green/red pipes, the real SFX).
- **Original physics**, converted from the canonical 30 FPS per-frame constants to a
  framerate-independent fixed-timestep simulation (identical feel on 60 Hz & 120 Hz):
  gravity `900 px/s²`, flap `-270 px/s`, max fall `300 px/s`, pipe speed `120 px/s`,
  gap `100 px`.
- **Full game flow**: Get-Ready splash with a bobbing bird, score, white death flash,
  the bird tumbling to the ground, medals (bronze/silver/gold/platinum), best score,
  and a NEW badge.

## Built for iPhone

- Fullscreen, zoom-locked, no scroll/rubber-band; safe-area aware (notch & home bar).
- Retina-crisp pixel art (devicePixelRatio aware, nearest-neighbor scaling).
- Web Audio with the iOS unlock-on-first-touch pattern.
- Installable PWA: web manifest, service worker (offline), Apple touch icons.

## Project layout

```
index.html          # shell + iOS/PWA meta
css/style.css       # fullscreen, zero-scroll, iOS-hardened
js/                 # config, renderer, input, audio, entities, game, main
assets/sprites      # genuine bird/pipe/background/digit/medal art
assets/audio        # SFX (mp3 for iOS)
assets/icons        # PWA + Apple touch icons
manifest.webmanifest
sw.js               # service worker (cache-first, offline)
```

## Credits

Original game by Dong Nguyen (.Gears). This is a non-commercial, educational
recreation; original artwork/audio remain the property of their creator.
