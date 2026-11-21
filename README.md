# 🏮 Lantern Lane — Spot the Difference

[![make.fun bounty](https://img.shields.io/badge/make.fun-bounty-blue)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An original spot-the-difference game for the [make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451): two pictures of the same lantern-lit alley, side by side — but the right one hides a few changes. Click a difference on either picture to ring it, find them all before three misses, and clear all three levels (Dusk Market, Lantern Night, Harbour Dawn — 19 differences in all).

## How to play

- **Mouse:** click a difference on either picture.
- **Keyboard:** arrow keys / WASD move the crosshair, Space marks it, `H` spends a hint, `P` pauses, `R` restarts the level.
- **Scoring:** 200 points per difference, a speed bonus at the end of each level, −50 per miss, −100 per hint. Best total is kept in the browser.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests, no assets — the whole alley (sky, moon, string lights, lanterns, stall, cat, crates) is drawn from code, so every picture is generated, never borrowed.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `game/index.html` — the page; `game/src/` — the game: `config.js` (tuning + levels), `scene.js` (the procedural alley and its differences), `world.js` (state + rules), `input.js` (mouse + keyboard), `render.js` (screens + HUD), `shots.js` (staged screenshot scenes), `audio.js` (synthesised sounds), `main.js` (boot + loop).
- `screenshots/` — real renders of the game's own code (`?shot=` scenes).
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
