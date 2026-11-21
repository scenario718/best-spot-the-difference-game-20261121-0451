// Tiny sounds, synthesised with WebAudio — no audio files, no network.
// The context is created on the first user gesture, so it never blocks the page.
let context = null;

function ensureContext() {
  if (context !== null) return context;
  try {
    const AudioContext = window.AudioContext ?? window.webkitAudioContext;
    context = AudioContext ? new AudioContext() : null;
  } catch {
    context = null;
  }
  return context;
}

function tone(frequency, startAt, length, type, volume) {
  const ctx = ensureContext();
  if (ctx === null) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, ctx.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + length);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(ctx.currentTime + startAt);
  oscillator.stop(ctx.currentTime + startAt + length + 0.05);
}

/** Two bright notes when a difference is found. */
export function playFound() {
  tone(660, 0, 0.16, 'sine', 0.16);
  tone(880, 0.09, 0.22, 'sine', 0.16);
}

/** A low buzz when the click lands on nothing. */
export function playMiss() {
  tone(140, 0, 0.2, 'sawtooth', 0.07);
}

/** A short rising arpeggio when a level is complete. */
export function playWin() {
  tone(523, 0, 0.16, 'triangle', 0.15);
  tone(659, 0.12, 0.16, 'triangle', 0.15);
  tone(784, 0.24, 0.26, 'triangle', 0.15);
}

/** A soft tick when a hint is spent. */
export function playHint() {
  tone(980, 0, 0.1, 'sine', 0.1);
}
