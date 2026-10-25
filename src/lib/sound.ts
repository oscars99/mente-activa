let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** A soft sine tone with a fade in/out, so nothing clicks or startles. */
export function tone(freq: number, ms = 300, delayMs = 0, volume = 0.18): void {
  const ac = audio();
  if (!ac) return;
  const start = ac.currentTime + delayMs / 1000;
  const end = start + ms / 1000;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.03);
  gain.gain.linearRampToValueAtTime(0, end);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(end + 0.05);
}

/** One note per square of the sequence game (C major pentatonic, easy on the ear). */
export const TILE_NOTES = [262, 294, 330, 392, 440, 523, 587, 659, 784];

export function chimeSuccess() {
  tone(523, 180);
  tone(659, 180, 150);
  tone(784, 320, 300);
}

export function chimeSoft() {
  tone(392, 220);
  tone(330, 320, 180);
}
