// The picture itself: one lantern-lit alley, drawn twice. The left picture is the
// reference; the right picture is the same drawing with a few elements changed.
// A difference is an element that renders differently in the right picture, and its
// position is where a player must click. Everything is drawn from code — no images.
import { LEVELS, PANEL } from './config.js';
import { createRandom, pickSome } from './random.js';

/** Every difference the game can hide, with its spot in the picture (panel-local). */
export const DIFF_POOL = [
  { id: 'moon', x: 455, y: 68, r: 34, label: 'the moon' },
  { id: 'cat', x: 415, y: 318, r: 26, label: 'the cat on the stall' },
  { id: 'lantern', x: 250, y: 215, r: 30, label: 'the middle lantern' },
  { id: 'sign', x: 280, y: 311, r: 26, label: 'the stall sign' },
  { id: 'window', x: 90, y: 412, r: 34, label: 'the lit window' },
  { id: 'bird', x: 310, y: 140, r: 20, label: 'the bird on the wire' },
  { id: 'crates', x: 497, y: 462, r: 34, label: 'the crate stack' },
  { id: 'bulb', x: 368, y: 152, r: 20, label: 'the fourth string bulb' },
  { id: 'smoke', x: 495, y: 262, r: 26, label: 'the chimney smoke' },
  { id: 'barrel', x: 82, y: 490, r: 28, label: 'the barrel' },
];

/**
 * Build one level's picture: its palette, its stars, and which differences the
 * right picture hides. Seeded, so the same level always draws the same picture.
 */
export function buildScene(levelIndex) {
  const level = LEVELS[levelIndex];
  const random = createRandom(level.seed);
  const stars = [];
  for (let i = 0; i < 30; i += 1) {
    stars.push({
      x: 12 + random() * (PANEL.width - 24),
      y: 10 + random() * 170,
      r: 1 + random() * 1.8,
      twinkle: random() * Math.PI * 2,
    });
  }
  const diffs = pickSome(random, DIFF_POOL, level.diffCount);
  return { levelIndex, level, stars, diffs };
}

/** True when this difference is one the level hides (so the right picture differs). */
export function isHidden(scene, id) {
  return scene.diffs.some((d) => d.id === id);
}

/** The wire sags a little between its two ends. */
function wireY(x) {
  const t = (x - 15) / 530;
  return 150 - t * 22 + 16 * Math.sin(Math.PI * t);
}

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

/** A four-point sparkle star. */
function sparkle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** A paper lantern: a glowing ribbed oval with tassels, hanging from a string. */
function lantern(ctx, x, y, r, colour, glow) {
  ctx.strokeStyle = '#241a2e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - r - 26);
  ctx.lineTo(x, y - r);
  ctx.stroke();
  const grad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.6);
  grad.addColorStop(0, glow);
  grad.addColorStop(1, 'rgba(255,180,80,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.72, r, 0, 0, Math.PI * 2);
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.72 * Math.abs(Math.cos((i * Math.PI) / 6)), r, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  rect(ctx, x - 8, y - r - 4, 16, 6, '#d8a24a');
  rect(ctx, x - 8, y + r - 2, 16, 6, '#d8a24a');
  ctx.strokeStyle = '#f2c94c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 4, y + r + 4);
  ctx.lineTo(x - 4, y + r + 16);
  ctx.moveTo(x + 4, y + r + 4);
  ctx.lineTo(x + 4, y + r + 16);
  ctx.stroke();
}

/** A cat sitting in profile, tail curled around its paws. */
function cat(ctx, x, y, s) {
  ctx.fillStyle = '#1c1626';
  ctx.beginPath();
  ctx.ellipse(x, y, 16 * s, 11 * s, 0, 0, Math.PI * 2); // body
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 11 * s, y - 12 * s, 8 * s, 0, Math.PI * 2); // head
  ctx.fill();
  ctx.beginPath(); // ears
  ctx.moveTo(x + 5 * s, y - 18 * s);
  ctx.lineTo(x + 7 * s, y - 26 * s);
  ctx.lineTo(x + 11 * s, y - 18 * s);
  ctx.moveTo(x + 12 * s, y - 18 * s);
  ctx.lineTo(x + 15 * s, y - 26 * s);
  ctx.lineTo(x + 18 * s, y - 18 * s);
  ctx.fill();
  ctx.beginPath(); // tail
  ctx.arc(x - 12 * s, y + 2 * s, 9 * s, Math.PI * 0.1, Math.PI * 1.1);
  ctx.strokeStyle = '#1c1626';
  ctx.lineWidth = 4 * s;
  ctx.stroke();
}

/** A wooden crate with cross planks. */
function crate(ctx, x, y, s) {
  rect(ctx, x, y, 44 * s, 44 * s, '#7a5a38');
  ctx.strokeStyle = '#4a3520';
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1, y + 1, 44 * s - 2, 44 * s - 2);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 44 * s, y + 44 * s);
  ctx.moveTo(x + 44 * s, y);
  ctx.lineTo(x, y + 44 * s);
  ctx.stroke();
}

/** A barrel with two hoops. */
function barrel(ctx, x, y, s) {
  ctx.fillStyle = '#6e4f30';
  ctx.beginPath();
  ctx.moveTo(x - 20 * s, y);
  ctx.quadraticCurveTo(x - 26 * s, y + 26 * s, x - 20 * s, y + 52 * s);
  ctx.lineTo(x + 20 * s, y + 52 * s);
  ctx.quadraticCurveTo(x + 26 * s, y + 26 * s, x + 20 * s, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 23 * s, y + 12 * s);
  ctx.lineTo(x + 23 * s, y + 12 * s);
  ctx.moveTo(x - 24 * s, y + 40 * s);
  ctx.lineTo(x + 24 * s, y + 40 * s);
  ctx.stroke();
}

/** A puff of chimney smoke, three soft circles rising. */
function smoke(ctx, x, y) {
  circle(ctx, x, y, 9, 'rgba(220,215,235,0.55)');
  circle(ctx, x + 8, y - 14, 12, 'rgba(220,215,235,0.4)');
  circle(ctx, x + 2, y - 30, 15, 'rgba(220,215,235,0.28)');
}

/**
 * Draw one picture of the alley at panel origin (ox, oy). `variant` is 'left'
 * (the reference) or 'right' (with the level's differences applied). `found` is
 * the set of difference ids already found, drawn as green rings on both pictures.
 * `hint` is an optional { id, until, now } that draws a pulsing gold ring.
 */
export function drawPanel(ctx, scene, ox, oy, variant, found, hint) {
  const p = scene.level.palette;
  const right = variant === 'right';
  ctx.save();
  ctx.translate(ox, oy);

  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, PANEL.height);
  sky.addColorStop(0, p.skyTop);
  sky.addColorStop(0.55, p.skyMid);
  sky.addColorStop(1, p.skyBottom);
  rect(ctx, 0, 0, PANEL.width, PANEL.height, sky);

  // Stars.
  for (const star of scene.stars) {
    sparkle(ctx, star.x, star.y, star.r, 'rgba(255,250,230,0.85)');
  }

  // Moon: full on the left, a crescent on the right.
  const moonGlow = ctx.createRadialGradient(455, 68, 10, 455, 68, 70);
  moonGlow.addColorStop(0, 'rgba(255,240,200,0.5)');
  moonGlow.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(455, 68, 70, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, 455, 68, 32, '#ffeec2');
  if (right && isHidden(scene, 'moon')) {
    circle(ctx, 468, 60, 28, p.skyTop);
  }

  // Far rooftops with chimneys.
  ctx.fillStyle = p.roofFar;
  ctx.beginPath();
  ctx.moveTo(0, 360);
  ctx.lineTo(0, 310);
  ctx.lineTo(70, 310);
  ctx.lineTo(110, 285);
  ctx.lineTo(150, 310);
  ctx.lineTo(230, 310);
  ctx.lineTo(230, 295);
  ctx.lineTo(260, 295);
  ctx.lineTo(260, 310);
  ctx.lineTo(330, 310);
  ctx.lineTo(380, 280);
  ctx.lineTo(430, 310);
  ctx.lineTo(560, 310);
  ctx.lineTo(560, 360);
  ctx.closePath();
  ctx.fill();
  rect(ctx, 488, 258, 16, 40, p.roofFar);
  if (!(right && isHidden(scene, 'smoke'))) smoke(ctx, 496, 246);

  // The wire and its string lights.
  ctx.strokeStyle = '#191224';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(15, 150);
  for (let x = 15; x <= 545; x += 10) ctx.lineTo(x, wireY(x));
  ctx.stroke();
  for (let i = 0; i < 7; i += 1) {
    const x = 45 + i * 76;
    const y = wireY(x) + 14;
    const dark = right && isHidden(scene, 'bulb') && i === 4;
    ctx.strokeStyle = '#191224';
    ctx.beginPath();
    ctx.moveTo(x, wireY(x));
    ctx.lineTo(x, y - 5);
    ctx.stroke();
    if (!dark) {
      const glow = ctx.createRadialGradient(x, y, 1, x, y, 16);
      glow.addColorStop(0, 'rgba(255,210,120,0.8)');
      glow.addColorStop(1, 'rgba(255,210,120,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    circle(ctx, x, y, 6, dark ? '#3a3348' : '#ffd97a');
  }

  // A bird on the wire.
  if (!(right && isHidden(scene, 'bird'))) {
    ctx.fillStyle = '#191224';
    ctx.beginPath();
    ctx.ellipse(310, 138, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(318, 133, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(303, 136);
    ctx.lineTo(296, 130);
    ctx.lineTo(304, 140);
    ctx.closePath();
    ctx.fill();
  }

  // Three hanging paper lanterns; the middle one changes colour on the right.
  lantern(ctx, 110, 208, 20, '#e85d3d', p.lanternGlow);
  lantern(ctx, 250, 218, 24, right && isHidden(scene, 'lantern') ? '#2fa8a0' : '#e85d3d', p.lanternGlow);
  lantern(ctx, 430, 205, 19, '#f2a541', p.lanternGlow);

  // The market stall: a wooden counter, a striped awning, a sign board.
  rect(ctx, 150, 362, 260, 83, '#7a5238');
  ctx.strokeStyle = '#5a3a26';
  ctx.lineWidth = 2;
  for (let y = 388; y < 445; y += 18) {
    ctx.beginPath();
    ctx.moveTo(150, y);
    ctx.lineTo(410, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#8a6244';
  ctx.fillRect(150, 362, 260, 6);
  for (let i = 0; i < 8; i += 1) {
    rect(ctx, 150 + i * 32.5, 330, 16.25, 34, i % 2 === 0 ? p.awningA : p.awningB);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(150, 360, 260, 4);
  rect(ctx, 190, 296, 180, 30, p.sign);
  ctx.fillStyle = '#3a2a18';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(right && isHidden(scene, 'sign') ? 'No. 3' : 'No. 7', 280, 312);
  // Goods on the counter: fruit and jars.
  circle(ctx, 200, 372, 8, '#e85d3d');
  circle(ctx, 222, 374, 8, '#f2a541');
  circle(ctx, 244, 372, 8, '#7ddc8a');
  rect(ctx, 320, 358, 18, 18, '#c9b18a');
  rect(ctx, 348, 358, 18, 18, '#8a6fb0');

  // The cat on the stall roof.
  if (!(right && isHidden(scene, 'cat'))) cat(ctx, 415, 318, 1);

  // The lit window on the left house.
  const lit = !(right && isHidden(scene, 'window'));
  rect(ctx, 55, 375, 70, 75, lit ? p.windowLit : p.windowDark);
  ctx.strokeStyle = '#241a2e';
  ctx.lineWidth = 3;
  ctx.strokeRect(55, 375, 70, 75);
  ctx.beginPath();
  ctx.moveTo(90, 375);
  ctx.lineTo(90, 450);
  ctx.moveTo(55, 412);
  ctx.lineTo(125, 412);
  ctx.stroke();
  if (lit) {
    const glow = ctx.createRadialGradient(90, 412, 5, 90, 412, 60);
    glow.addColorStop(0, 'rgba(255,220,130,0.35)');
    glow.addColorStop(1, 'rgba(255,220,130,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(90, 412, 60, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground and cobbles.
  rect(ctx, 0, 445, PANEL.width, 75, p.ground);
  ctx.strokeStyle = p.groundLine;
  ctx.lineWidth = 2;
  for (let y = 462; y < 520; y += 18) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(PANEL.width, y);
    ctx.stroke();
  }
  // A puddle catching the moonlight.
  ellipse(ctx, 280, 495, 88, 11, 'rgba(255,240,200,0.18)');

  // Crates: three on the left, two on the right when that difference is hidden.
  crate(ctx, 455, 470, 1);
  crate(ctx, 503, 470, 1);
  if (!(right && isHidden(scene, 'crates'))) crate(ctx, 479, 424, 1);

  // The barrel by the window.
  if (!(right && isHidden(scene, 'barrel'))) barrel(ctx, 82, 464, 1);

  // Found differences: a green ring on both pictures, with a tick.
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const diff of scene.diffs) {
    if (!found.has(diff.id)) continue;
    ctx.strokeStyle = '#7ddc8a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, diff.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#7ddc8a';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('✓', diff.x, diff.y + 1);
  }

  // A hint pulses a gold dashed ring around one unfound difference.
  if (hint && hint.until > hint.now) {
    const diff = scene.diffs.find((d) => d.id === hint.id);
    if (diff) {
      const pulse = 1 + 0.12 * Math.sin(hint.now / 120);
      ctx.strokeStyle = '#f2c94c';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, diff.r * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  ctx.restore();
}
