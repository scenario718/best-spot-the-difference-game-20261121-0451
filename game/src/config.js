// Every tuning number in one place. The playfield is a fixed 1280x720 logical area;
// the renderer scales it to the window, so no rule below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };

// The two picture panels, side by side. Both are 560 wide and 520 tall.
export const PANEL = { width: 560, height: 520, y: 110 };
export const PANEL_LEFT = { x: 40, y: PANEL.y };
export const PANEL_RIGHT = { x: 680, y: PANEL.y };

/** A click counts as a hit when it lands within this many pixels of a difference. */
export const HIT_RADIUS = 34;

/** Wrong clicks allowed before the level ends in a stumble (score keeps running). */
export const MAX_MISSES = 3;

/** Seconds a hint circle stays on screen, and its score cost. */
export const HINT_SECONDS = 2.5;
export const HINT_COST = 100;

/** Points for each difference found, plus a speed bonus at the end of a level. */
export const POINTS_PER_DIFF = 200;
export const TIME_BONUS_PER_SECOND = 10;
export const TIME_BONUS_CAP_SECONDS = 60;

/** A wrong click costs this many points (never below zero). */
export const MISS_COST = 50;

/**
 * The three levels. Each has its own dusk palette, its own seed (so the stars and
 * small props land differently) and how many differences its right picture hides.
 * Level 1 is a gentle warm dusk, level 2 a deep lantern night, level 3 a cold dawn.
 */
export const LEVELS = [
  {
    name: 'Dusk Market',
    seed: 11,
    diffCount: 5,
    palette: {
      skyTop: '#2b2a55', skyMid: '#7a4a6e', skyBottom: '#e08a4c',
      roof: '#241f38', roofFar: '#322b4d', ground: '#3a2f45', groundLine: '#4a3d55',
      stall: '#8a4b3a', awningA: '#e8b64c', awningB: '#c94f43', sign: '#f2d492',
      windowLit: '#ffd97a', windowDark: '#2c2740', lanternGlow: '#ffb347',
    },
  },
  {
    name: 'Lantern Night',
    seed: 29,
    diffCount: 7,
    palette: {
      skyTop: '#0d1530', skyMid: '#1d2f5e', skyBottom: '#3f5f8a',
      roof: '#131a2e', roofFar: '#1e2947', ground: '#232c40', groundLine: '#323e58',
      stall: '#5e3a52', awningA: '#7fd1c0', awningB: '#2f6f6a', sign: '#cfe8d8',
      windowLit: '#ffe9a3', windowDark: '#1a2138', lanternGlow: '#ff9d5c',
    },
  },
  {
    name: 'Harbour Dawn',
    seed: 47,
    diffCount: 7,
    palette: {
      skyTop: '#3a2a5e', skyMid: '#8a5578', skyBottom: '#e8a87c',
      roof: '#2a2140', roofFar: '#3a2f58', ground: '#403448', groundLine: '#52455c',
      stall: '#4a5e7a', awningA: '#f2e3c9', awningB: '#c96f4a', sign: '#ffe9b8',
      windowLit: '#fff3c4', windowDark: '#2a2340', lanternGlow: '#ffc46b',
    },
  },
];

/** Where the best total is kept between visits (this browser only). */
export const BEST_KEY = 'lantern-lane.best';

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export const PALETTE_UI = {
  backdrop: '#14101d',
  panel: '#1d1830',
  panelEdge: '#3a3355',
  text: '#f4efe6',
  muted: '#b8aec9',
  accent: '#ffb347',
  good: '#7ddc8a',
  bad: '#ff6b6b',
  gold: '#f2c94c',
};
