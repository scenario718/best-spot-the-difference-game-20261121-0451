// Boot and the one loop: input is read every frame, the clock advances in fixed
// 1/60 s steps (several in a slow frame, none in a fast one), and the renderer
// paints what is there. The game moves between title, play, paused, level-done
// and game-over screens.
//
// ?shot=start|play|level2|end stages that scene instead of running the loop,
// paints it twice and sets window.__shotReady for a screenshot.
import { BEST_KEY } from './config.js';
import { createInput, toPanelPoint, ACTION_CONFIRM, ACTION_HINT, ACTION_PAUSE, ACTION_RESTART } from './input.js';
import { createRenderer } from './render.js';
import { createWorld, mark, nextLevel, restart, startLevel, step, useHint } from './world.js';
import { SCREEN_LEVEL_DONE, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './world.js';
import { stageShot } from './shots.js';
import { playFound, playHint, playMiss, playWin } from './audio.js';

const STEP = 1 / 60;
const CROSSHAIR_SPEED = 520;
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld();
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function announce(message) {
  status.textContent = message;
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world, scene.screen, scene.best, { x: 640, y: 380 });
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function startGame() {
    restart(world);
    screen = SCREEN_PLAY;
    announce(world.lastMessage);
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.score > best) {
      best = world.score;
      saveBest(best);
    }
    announce(world.lastMessage);
  }

  // Takes the queued one-shot presses once and handles every screen except
  // marking with Space during play (that lives in handleKeys, same frame).
  // Returns the taken flags so handleKeys can see the confirm press.
  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_RESTART && screen !== SCREEN_TITLE) {
      startLevel(world, world.levelIndex);
      screen = SCREEN_PLAY;
      announce(world.lastMessage);
      return actions;
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      const event = useHint(world);
      if (event) playHint();
      announce(world.lastMessage);
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
      return actions;
    }
    if (!(actions & ACTION_CONFIRM)) return actions;
    if (screen === SCREEN_TITLE) startGame();
    else if (screen === SCREEN_LEVEL_DONE) nextLevel(world);
    else if (screen === SCREEN_OVER) startGame();
    else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
    if (screen === SCREEN_OVER) endGame();
    return actions;
  }

  function handlePointer() {
    const click = input.takeClick();
    if (click === null) return;
    if (screen === SCREEN_TITLE) {
      startGame();
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    const point = toPanelPoint(click.x, click.y);
    if (point === null) {
      announce('Click on a picture to mark a difference.');
      return;
    }
    const before = world.found.size;
    const event = mark(world, point.x, point.y);
    if (world.found.size > before) playFound();
    else if (event) playMiss();
    if (world.screen === SCREEN_LEVEL_DONE) {
      playWin();
      screen = SCREEN_LEVEL_DONE;
    } else if (world.screen === SCREEN_OVER) {
      endGame();
      return;
    }
    announce(world.lastMessage);
  }

  function handleKeys(dt, actions) {
    const steer = input.steer();
    if (steer.x !== 0 || steer.y !== 0) {
      input.moveCrosshair(steer.x * CROSSHAIR_SPEED * dt, steer.y * CROSSHAIR_SPEED * dt);
    }
    if ((actions & ACTION_CONFIRM) && screen === SCREEN_PLAY) {
      const at = input.crosshair();
      const point = toPanelPoint(at.x, at.y);
      if (point !== null) {
        const before = world.found.size;
        const event = mark(world, point.x, point.y);
        if (world.found.size > before) playFound();
        else if (event) playMiss();
        if (world.screen === SCREEN_LEVEL_DONE) {
          playWin();
          screen = SCREEN_LEVEL_DONE;
        } else if (world.screen === SCREEN_OVER) {
          endGame();
          return;
        }
        announce(world.lastMessage);
      }
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    const actions = handleActions();
    handlePointer();
    if (screen === SCREEN_PLAY) {
      handleKeys(dt, actions);
      accumulator += dt;
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        step(world, STEP);
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world, screen, best, input.crosshair());
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Lantern Lane. Click or press Space to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
