import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { randomInt } from '../lib/random';
import { TILE_NOTES, tone } from '../lib/sound';
import type { TrialProps } from '../lib/types';

export const SECUENCIA_MAX_LEVEL = 8;

/** Level 1 → 2 squares to remember on a 2×2 board; the board grows as sequences get longer. */
function setup(level: number) {
  const length = level + 1;
  const tiles = level <= 3 ? 4 : level <= 6 ? 6 : 9;
  return { length, tiles, cols: tiles === 4 ? 'grid-cols-2' : 'grid-cols-3' };
}

function makeSequence(length: number, tiles: number): number[] {
  const seq: number[] = [];
  while (seq.length < length) {
    const n = randomInt(tiles);
    if (n !== seq[seq.length - 1]) seq.push(n); // no immediate repeats: they're hard to see
  }
  return seq;
}

const LIT_MS = 900;
const GAP_MS = 450;

type Phase = 'ready' | 'showing' | 'input';

export function Secuencia({ level, settings, onDone }: TrialProps) {
  const { t } = useTranslation();
  const { length, tiles, cols } = setup(Math.min(level, SECUENCIA_MAX_LEVEL));
  const [sequence] = useState(() => makeSequence(length, tiles));
  const [phase, setPhase] = useState<Phase>('ready');
  const [lit, setLit] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  function play() {
    setPhase('showing');
    sequence.forEach((tile, i) => {
      const at = 600 + i * (LIT_MS + GAP_MS);
      later(() => {
        setLit(tile);
        if (settings.sound) tone(TILE_NOTES[tile], LIT_MS - 100);
      }, at);
      later(() => setLit(null), at + LIT_MS);
    });
    later(() => setPhase('input'), 600 + sequence.length * (LIT_MS + GAP_MS));
  }

  function tap(tile: number) {
    if (phase !== 'input') return;
    setLit(tile);
    if (settings.sound) tone(TILE_NOTES[tile], 250);
    later(() => setLit((l) => (l === tile ? null : l)), 300);

    if (tile !== sequence[step]) {
      setPhase('showing'); // lock the board
      later(
        () =>
          onDone({
            success: false,
            score: step / length,
            measure: length,
            reveal: t('exercises.secuencia.reveal', { count: length }),
          }),
        500,
      );
      return;
    }
    const nextStep = step + 1;
    setStep(nextStep);
    if (nextStep === length) {
      setPhase('showing');
      later(() => onDone({ success: true, score: 1, measure: length }), 600);
    }
  }

  return (
    <div>
      {/* Tall enough for the longest message, so the squares never jump when the phase changes. */}
      <div className="mb-4 min-h-[8rem] text-center text-xl font-bold" aria-live="polite">
        {phase === 'ready' && <p className="text-tinta-suave">{t('exercises.secuencia.watchHelp')}</p>}
        {phase === 'showing' && step === 0 && <p>{t('exercises.secuencia.watching')}</p>}
        {phase === 'input' && (
          <>
            <p>{t('exercises.secuencia.yourTurn')}</p>
            <p className="mt-1 text-tinta-suave">{t('exercises.secuencia.progress', { done: step, total: length })}</p>
          </>
        )}
      </div>

      <div className={`mx-auto grid ${cols} max-w-sm gap-4`}>
        {Array.from({ length: tiles }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tap(i)}
            disabled={phase !== 'input'}
            aria-label={t('exercises.secuencia.tile', { n: i + 1 })}
            className={`aspect-square rounded-2xl border-4 transition-all duration-150 disabled:cursor-default ${
              lit === i
                ? 'scale-105 border-acento bg-yellow-300 shadow-lg'
                : 'border-primario-oscuro/40 bg-primario-claro'
            }`}
          />
        ))}
      </div>

      {phase === 'ready' && (
        <button type="button" className="btn-primary mt-8 w-full" onClick={play}>
          <span aria-hidden>👀</span> {t('exercises.secuencia.watch')}
        </button>
      )}
    </div>
  );
}
