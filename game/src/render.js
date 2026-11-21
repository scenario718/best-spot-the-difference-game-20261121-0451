// Everything on screen: the two pictures, the counter, the timer, the score,
// and the title, pause, level-complete and game-over overlays. The pictures
// themselves are painted by scene.js; this file only frames them.
import { FIELD, FONT, LEVELS, PALETTE_UI, PANEL, PANEL_LEFT, PANEL_RIGHT } from './config.js';
import { drawPanel } from './scene.js';
import { SCREEN_LEVEL_DONE, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, diffCount, foundCount } from './world.js';

export { SCREEN_LEVEL_DONE, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE };

function formatTime(seconds) {
  const total = Math.floor(seconds);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function fit() {
    const scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
    canvas.width = Math.floor(FIELD.width * scale);
    canvas.height = Math.floor(FIELD.height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }

  function frame() {
    ctx.fillStyle = PALETTE_UI.backdrop;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  }

  function panelFrame(origin, label) {
    ctx.strokeStyle = PALETTE_UI.panelEdge;
    ctx.lineWidth = 3;
    ctx.strokeRect(origin.x - 3, origin.y - 3, PANEL.width + 6, PANEL.height + 6);
    ctx.fillStyle = PALETTE_UI.muted;
    ctx.font = '600 15px ' + FONT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(label, origin.x, origin.y - 10);
  }

  function drawHud(world) {
    ctx.fillStyle = PALETTE_UI.text;
    ctx.font = 'bold 24px ' + FONT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`Lantern Lane — Level ${world.levelIndex + 1}: ${LEVELS[world.levelIndex].name}`, 40, 42);
    ctx.textAlign = 'right';
    ctx.fillText(`Score ${world.score}`, 1240, 42);

    const found = foundCount(world);
    const total = diffCount(world);
    ctx.textAlign = 'center';
    ctx.fillStyle = found === total ? PALETTE_UI.good : PALETTE_UI.accent;
    ctx.font = 'bold 26px ' + FONT;
    ctx.fillText(`Found ${found} / ${total}`, 640, 44);

    ctx.fillStyle = PALETTE_UI.muted;
    ctx.font = '16px ' + FONT;
    ctx.textAlign = 'left';
    ctx.fillText(`⏱ ${formatTime(world.levelSeconds)}`, 40, 84);
    ctx.textAlign = 'center';
    ctx.fillText(`Hints ${world.hintsLeft}  •  Misses ${world.misses}/3`, 640, 84);
    ctx.textAlign = 'right';
    ctx.fillText('H hint  •  P pause  •  R restart', 1240, 84);
  }

  function drawMessage(world) {
    ctx.fillStyle = PALETTE_UI.muted;
    ctx.font = '17px ' + FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(world.lastMessage || 'Click a difference — on either picture.', 640, 688);
  }

  function drawCrosshair(crosshair) {
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(crosshair.x, crosshair.y, 12, 0, Math.PI * 2);
    ctx.moveTo(crosshair.x - 18, crosshair.y);
    ctx.lineTo(crosshair.x - 6, crosshair.y);
    ctx.moveTo(crosshair.x + 6, crosshair.y);
    ctx.lineTo(crosshair.x + 18, crosshair.y);
    ctx.moveTo(crosshair.x, crosshair.y - 18);
    ctx.lineTo(crosshair.x, crosshair.y - 6);
    ctx.moveTo(crosshair.x, crosshair.y + 6);
    ctx.lineTo(crosshair.x, crosshair.y + 18);
    ctx.stroke();
  }

  function overlay(title, lines, accent) {
    ctx.fillStyle = 'rgba(10,8,18,0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = accent;
    ctx.font = 'bold 52px ' + FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(title, 640, 300);
    ctx.fillStyle = PALETTE_UI.text;
    ctx.font = '21px ' + FONT;
    lines.forEach((line, i) => ctx.fillText(line, 640, 350 + i * 34));
  }

  function drawPictures(world, dimmed) {
    const hint = world.hint ? { id: world.hint.id, until: world.hint.until, now: performance.now() } : null;
    drawPanel(ctx, world.scene, PANEL_LEFT.x, PANEL_LEFT.y, 'left', world.found, hint);
    drawPanel(ctx, world.scene, PANEL_RIGHT.x, PANEL_RIGHT.y, 'right', world.found, hint);
    panelFrame(PANEL_LEFT, 'Original');
    panelFrame(PANEL_RIGHT, 'Spot the difference');
    if (dimmed) {
      ctx.fillStyle = 'rgba(10,8,18,0.45)';
      ctx.fillRect(0, PANEL.y, FIELD.width, PANEL.height);
    }
  }

  return {
    fit,
    draw(world, screen, best, crosshair) {
      fit();
      frame();
      if (screen === SCREEN_TITLE) {
        drawPictures(world, true);
        ctx.fillStyle = PALETTE_UI.gold;
        ctx.font = 'bold 64px ' + FONT;
        ctx.textAlign = 'center';
        ctx.fillText('🏮 Lantern Lane', 640, 250);
        ctx.fillStyle = PALETTE_UI.text;
        ctx.font = 'bold 26px ' + FONT;
        ctx.fillText('Spot the Difference', 640, 292);
        ctx.font = '19px ' + FONT;
        ctx.fillStyle = PALETTE_UI.muted;
        ctx.fillText('Two pictures of the same lantern-lit alley — but the right one hides a few changes.', 640, 340);
        ctx.fillText('Click a difference on either picture. Find them all before three misses.', 640, 372);
        ctx.fillText('Arrows move the crosshair, Space marks it, H spends a hint, P pauses.', 640, 404);
        ctx.fillStyle = PALETTE_UI.accent;
        ctx.font = 'bold 22px ' + FONT;
        ctx.fillText('Click or press Space to start — 3 levels, 19 differences in all', 640, 462);
        if (best > 0) {
          ctx.fillStyle = PALETTE_UI.muted;
          ctx.font = '18px ' + FONT;
          ctx.fillText(`Best total: ${best}`, 640, 496);
        }
        return;
      }
      drawHud(world);
      drawPictures(world, false);
      drawMessage(world);
      if (screen === SCREEN_PLAY) {
        drawCrosshair(crosshair);
      } else if (screen === SCREEN_PAUSED) {
        overlay('Paused', ['Press P or Space to keep playing.', 'R restarts the level.'], PALETTE_UI.text);
      } else if (screen === SCREEN_LEVEL_DONE) {
        const last = world.levelIndex + 1 >= LEVELS.length;
        overlay(
          last ? 'Lantern Lane complete!' : 'Level complete!',
          [
            `Found ${foundCount(world)} / ${diffCount(world)} differences in ${formatTime(world.levelSeconds)}.`,
            `Level bonus ${world.levelBonus}  •  Total score ${world.score}`,
            last ? 'Press Space to see your total.' : 'Press Space for the next level.',
          ],
          PALETTE_UI.good,
        );
      } else if (screen === SCREEN_OVER) {
        const won = world.found.size === world.scene.diffs.length && world.misses < 3;
        overlay(
          won ? 'You found them all!' : 'The trail went cold',
          [
            `Total score ${world.score}${best > 0 ? `  •  Best ${best}` : ''}`,
            `Time played ${formatTime(world.totalSeconds)} across ${world.levelIndex + 1} ${world.levelIndex === 0 ? 'level' : 'levels'}.`,
            'Press Space to play again.',
          ],
          won ? PALETTE_UI.good : PALETTE_UI.bad,
        );
      }
    },
  };
}
