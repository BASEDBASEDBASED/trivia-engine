/** web Audio context must be triggered by user gesture */
export function createAudioCtx() {
  try {
    return new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return null;
  }
}

/** tone gene */
function playTone(ctx, freq, type, duration, gain = 0.3) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g);
  g.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** Ascending 3-note chime played on a correct answer */
export function playCorrect(ctx) {
  if (!ctx) return;
  playTone(ctx, 523, "sine", 0.12, 0.25);
  setTimeout(() => playTone(ctx, 659, "sine", 0.12, 0.25), 100);
  setTimeout(() => playTone(ctx, 784, "sine", 0.20, 0.30), 200);
}

/** Low descending buzz played on a wrong answer or timeout */
export function playWrong(ctx) {
  if (!ctx) return;
  playTone(ctx, 220, "sawtooth", 0.15, 0.3);
  setTimeout(() => playTone(ctx, 180, "sawtooth", 0.25, 0.3), 120);
}

/** Short click played each second when timer is ≤ 4 */
export function playTick(ctx) {
  if (!ctx) return;
  playTone(ctx, 1000, "square", 0.03, 0.06);
}
