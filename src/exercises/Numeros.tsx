import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { randomInt } from '../lib/random';
import type { TrialProps } from '../lib/types';
import { chunkDigits } from './chunk';
import { TimerBar } from './TimerBar';

export const NUMEROS_MAX_LEVEL = 8;

function makeNumber(length: number): string {
  let s = '';
  while (s.length < length) {
    const d = String(randomInt(10));
    if (d !== s[s.length - 1]) s += d;
  }
  return s;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function Numeros({ level, settings, onDone }: TrialProps) {
  const { t } = useTranslation();
  const length = Math.min(level, NUMEROS_MAX_LEVEL) + 2;
  const [target] = useState(() => makeNumber(length));
  const [phase, setPhase] = useState<'memorize' | 'recall'>('memorize');
  const [typed, setTyped] = useState('');
  const showMs = length * 1000 + 2000;

  function press(d: string) {
    setTyped((s) => (s.length < length ? s + d : s));
  }

  function check() {
    const right = [...typed].filter((d, i) => d === target[i]).length;
    const success = typed === target;
    onDone({
      success,
      score: right / length,
      measure: length,
      reveal: success ? undefined : t('exercises.numeros.reveal', { number: chunkDigits(target) }),
    });
  }

  // Physical keyboards work too.
  useEffect(() => {
    if (phase !== 'recall') return;
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') setTyped((s) => s.slice(0, -1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (phase === 'memorize') {
    return (
      <div className="text-center">
        <p className="text-xl font-bold">{t('exercises.numeros.memorize')}</p>
        <p className="my-10 font-mono text-jumbo font-bold tracking-wider text-primario-oscuro" aria-live="polite">
          {chunkDigits(target)}
        </p>
        {settings.timer && <TimerBar ms={showMs} label={t('exercises.numeros.timeLeft')} onEnd={() => setPhase('recall')} />}
        <button type="button" className="btn-primary mt-4 w-full" onClick={() => setPhase('recall')}>
          {t('exercises.numeros.ready')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-center text-xl font-bold">{t('exercises.numeros.typeIt')}</p>
      <div className="my-6 flex flex-wrap justify-center gap-2" aria-live="polite" aria-label={typed}>
        {Array.from({ length }, (_, i) => (
          <span
            key={i}
            className={`flex h-14 w-11 items-center justify-center rounded-xl border-2 font-mono text-3xl font-bold ${
              i === typed.length ? 'border-acento bg-acento-claro' : 'border-borde bg-white'
            }`}
          >
            {typed[i] ?? ''}
          </span>
        ))}
      </div>
      <div className="mx-auto grid max-w-sm grid-cols-3 gap-3">
        {KEYS.map((k) => (
          <button key={k} type="button" className="btn-secondary h-16 text-3xl" onClick={() => press(k)}>
            {k}
          </button>
        ))}
        <button
          type="button"
          className="btn-secondary h-16 flex-col gap-0 px-1 text-base leading-tight"
          onClick={() => setTyped((s) => s.slice(0, -1))}
          disabled={typed.length === 0}
        >
          <span aria-hidden className="text-2xl leading-none">
            ⌫
          </span>
          {t('exercises.numeros.erase')}
        </button>
        <button type="button" className="btn-secondary h-16 text-3xl" onClick={() => press('0')}>
          0
        </button>
        <span />
      </div>
      <button type="button" className="btn-primary mt-6 w-full" onClick={check} disabled={typed.length < length}>
        <span aria-hidden>✓</span> {t('exercises.numeros.check')}
      </button>
    </div>
  );
}
