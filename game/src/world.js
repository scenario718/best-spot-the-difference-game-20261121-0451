// The game's state: which screen is up, which level is being played, what has
// been found, the score and the clock. No drawing lives here.
import {
  HINT_COST,
  HINT_SECONDS,
  HIT_RADIUS,
  LEVELS,
  MAX_MISSES,
  MISS_COST,
  POINTS_PER_DIFF,
  TIME_BONUS_CAP_SECONDS,
  TIME_BONUS_PER_SECOND,
} from './config.js';
import { buildScene } from './scene.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_DONE = 'level-done';
export const SCREEN_OVER = 'over';

export const EVENT_NONE = 0;
export const EVENT_FOUND = 1;
export const EVENT_MISS = 2;
export const EVENT_LEVEL_DONE = 4;
export const EVENT_GAME_OVER = 8;
export const EVENT_HINT = 16;

/** A fresh game, on the title screen of level 1. */
export function createWorld() {
  const world = {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    scene: buildScene(0),
    found: new Set(),
    misses: 0,
    hintsLeft: 3,
    hint: null,
    score: 0,
    levelScore: 0,
    levelSeconds: 0,
    totalSeconds: 0,
    best: 0,
    levelBonus: 0,
    lastMessage: '',
  };
  return world;
}

/** Start (or restart) a level from scratch. */
export function startLevel(world, levelIndex) {
  world.levelIndex = levelIndex;
  world.scene = buildScene(levelIndex);
  world.found = new Set();
  world.misses = 0;
  world.hintsLeft = 3;
  world.hint = null;
  world.levelScore = 0;
  world.levelSeconds = 0;
  world.levelBonus = 0;
  world.screen = SCREEN_PLAY;
  world.lastMessage = `Level ${levelIndex + 1}: ${LEVELS[levelIndex].name} — find ${world.scene.diffs.length} differences.`;
}

/** Advance the clock; the title screen idles and the play screen counts up. */
export function step(world, dtSeconds) {
  if (world.screen !== SCREEN_PLAY) return;
  world.levelSeconds += dtSeconds;
  world.totalSeconds += dtSeconds;
  if (world.hint && world.hint.until <= performance.now()) world.hint = null;
}

/**
 * Mark the spot (x, y) in panel-local coordinates. Either panel counts: the
 * pictures are the same size and the differences sit in the same places.
 * Returns an event flag, and writes a message for the status line.
 */
export function mark(world, x, y) {
  if (world.screen !== SCREEN_PLAY) return EVENT_NONE;
  let nearest = null;
  let nearestDist = Infinity;
  for (const diff of world.scene.diffs) {
    if (world.found.has(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = diff;
    }
  }
  if (nearest !== null && nearestDist <= HIT_RADIUS) {
    world.found.add(nearest.id);
    world.levelScore += POINTS_PER_DIFF;
    world.score += POINTS_PER_DIFF;
    const left = world.scene.diffs.length - world.found.size;
    if (left === 0) {
      world.levelBonus = Math.max(0, TIME_BONUS_CAP_SECONDS - Math.floor(world.levelSeconds)) * TIME_BONUS_PER_SECOND;
      world.score += world.levelBonus;
      world.screen = SCREEN_LEVEL_DONE;
      world.lastMessage =
        world.levelIndex + 1 >= LEVELS.length
          ? `All differences found! Level bonus ${world.levelBonus}.`
          : `Level complete! Bonus ${world.levelBonus} — press Space for the next level.`;
      return EVENT_FOUND | EVENT_LEVEL_DONE;
    }
    world.lastMessage = `Found ${nearest.label}! ${left} to go.`;
    return EVENT_FOUND;
  }
  world.misses += 1;
  world.score = Math.max(0, world.score - MISS_COST);
  if (world.misses >= MAX_MISSES) {
    world.screen = SCREEN_OVER;
    world.lastMessage = `Three misses — the trail went cold. Score ${world.score}. Press Space to try again.`;
    return EVENT_MISS | EVENT_GAME_OVER;
  }
  world.lastMessage = `Not a difference. ${MAX_MISSES - world.misses} ${MAX_MISSES - world.misses === 1 ? 'miss' : 'misses'} left.`;
  return EVENT_MISS;
}

/** Spend a hint: briefly ring one difference that is still unfound. */
export function useHint(world) {
  if (world.screen !== SCREEN_PLAY) return EVENT_NONE;
  if (world.hintsLeft <= 0) {
    world.lastMessage = 'No hints left.';
    return EVENT_NONE;
  }
  const remaining = world.scene.diffs.filter((d) => !world.found.has(d.id));
  if (remaining.length === 0) return EVENT_NONE;
  const diff = remaining[Math.floor(Math.random() * remaining.length)];
  world.hintsLeft -= 1;
  world.score = Math.max(0, world.score - HINT_COST);
  world.hint = { id: diff.id, until: performance.now() + HINT_SECONDS * 1000, now: performance.now() };
  world.lastMessage = `Hint: look near ${diff.label}.`;
  return EVENT_HINT;
}

/** Move to the next level, or to the game-over screen after the last one. */
export function nextLevel(world) {
  if (world.levelIndex + 1 >= LEVELS.length) {
    world.screen = SCREEN_OVER;
    world.lastMessage = `You found every difference in Lantern Lane! Total score ${world.score}.`;
    return;
  }
  startLevel(world, world.levelIndex + 1);
}

/** Restart the whole game from level 1. */
export function restart(world) {
  world.score = 0;
  world.totalSeconds = 0;
  startLevel(world, 0);
}

export function foundCount(world) {
  return world.found.size;
}

export function diffCount(world) {
  return world.scene.diffs.length;
}
