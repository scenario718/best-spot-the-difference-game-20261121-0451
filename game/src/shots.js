// The screenshot scenes behind ?shot=start|play|level2|end. Each one plays the
// real rules forward from a fresh world, marking real differences by their exact
// spots, so the frame is what a short game really looks like and the same seed
// always gives the same frame.
import { mark, nextLevel, startLevel } from './world.js';
import { SCREEN_LEVEL_DONE, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './world.js';

/** Mark the first `count` differences of the current level, as a player would. */
function markFirst(world, count) {
  const diffs = world.scene.diffs.slice(0, count);
  for (const diff of diffs) mark(world, diff.x, diff.y);
}

/**
 * Set `world` to the named scene and return the screen to draw over it and the
 * best score to show. Unknown names stage the title screen.
 */
export function stageShot(name, world) {
  world.best = 1240;
  if (name === 'play') {
    startLevel(world, 0);
    world.levelSeconds = 38;
    markFirst(world, 3);
    return { screen: SCREEN_PLAY, best: world.best };
  }
  if (name === 'level2') {
    startLevel(world, 1);
    world.levelSeconds = 51;
    markFirst(world, 2);
    return { screen: SCREEN_PLAY, best: world.best };
  }
  if (name === 'end') {
    startLevel(world, 2);
    world.levelSeconds = 41;
    markFirst(world, world.scene.diffs.length);
    return { screen: SCREEN_LEVEL_DONE, best: world.best };
  }
  // 'start' and anything else: the title screen over level 1's pictures.
  world.screen = SCREEN_TITLE;
  return { screen: SCREEN_TITLE, best: world.best };
}

// Re-exported so main.js can treat a staged scene like a played one.
export { nextLevel, SCREEN_LEVEL_DONE, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE };
