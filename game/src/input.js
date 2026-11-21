// Keyboard and pointer input. Held keys steer the crosshair; one-shot presses
// (confirm, pause, hint, restart) are queued as bit flags and taken once by the
// loop, so a press between two frames is never lost and never counted twice.
// Clicking a panel marks that spot directly.
import { FIELD, PANEL, PANEL_LEFT, PANEL_RIGHT } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_RESTART = 8;

const LEFT = new Set(['ArrowLeft', 'KeyA']);
const RIGHT = new Set(['ArrowRight', 'KeyD']);
const UP = new Set(['ArrowUp', 'KeyW']);
const DOWN = new Set(['ArrowDown', 'KeyS']);
const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const HINT = new Set(['KeyH']);
const RESTART = new Set(['KeyR']);

export function createInput(canvas) {
  let left = false;
  let right = false;
  let up = false;
  let down = false;
  let actions = 0;
  let click = null;
  let crosshair = { x: FIELD.width / 2, y: 380 };

  window.addEventListener('keydown', (event) => {
    if (LEFT.has(event.code)) left = true;
    else if (RIGHT.has(event.code)) right = true;
    else if (UP.has(event.code)) up = true;
    else if (DOWN.has(event.code)) down = true;
    else if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (HINT.has(event.code)) {
      if (!event.repeat) actions |= ACTION_HINT;
    } else if (RESTART.has(event.code)) {
      if (!event.repeat) actions |= ACTION_RESTART;
    } else return;
    event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    if (LEFT.has(event.code)) left = false;
    else if (RIGHT.has(event.code)) right = false;
    else if (UP.has(event.code)) up = false;
    else if (DOWN.has(event.code)) down = false;
  });
  window.addEventListener('blur', () => {
    left = false;
    right = false;
    up = false;
    down = false;
  });

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * FIELD.width;
    const y = ((event.clientY - rect.top) / rect.height) * FIELD.height;
    click = { x, y };
    crosshair = { x, y };
  });

  return {
    /** -1/0/1 for each axis, from the held arrow or WASD keys. */
    steer() {
      return {
        x: (right ? 1 : 0) - (left ? 1 : 0),
        y: (down ? 1 : 0) - (up ? 1 : 0),
      };
    },
    /** The crosshair the arrow keys move (and a click jumps to). */
    crosshair() {
      return crosshair;
    },
    moveCrosshair(dx, dy) {
      crosshair = {
        x: Math.min(FIELD.width, Math.max(0, crosshair.x + dx)),
        y: Math.min(FIELD.height, Math.max(0, crosshair.y + dy)),
      };
    },
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** The last click in field coordinates, taken once; null when there is none. */
    takeClick() {
      const taken = click;
      click = null;
      return taken;
    },
  };
}

/**
 * Turn a field point into a panel-local point, or null when it is not on a
 * picture at all. Either picture counts — the differences sit in the same
 * places on both.
 */
export function toPanelPoint(x, y) {
  const inPanel = (origin) =>
    x >= origin.x && x < origin.x + PANEL.width && y >= PANEL.y && y < PANEL.y + PANEL.height;
  if (inPanel(PANEL_LEFT)) return { x: x - PANEL_LEFT.x, y: y - PANEL_LEFT.y };
  if (inPanel(PANEL_RIGHT)) return { x: x - PANEL_RIGHT.x, y: y - PANEL_RIGHT.y };
  return null;
}
