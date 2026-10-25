import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shuffle } from '../lib/random';
import type { TrialProps } from '../lib/types';
import { SpeakButton } from '../components/SpeakButton';
import { TimerBar } from './TimerBar';

const ITEMS = [
  ['pan', '🍞'], ['leche', '🥛'], ['huevos', '🥚'], ['manzanas', '🍎'], ['platanos', '🍌'], ['queso', '🧀'],
  ['arroz', '🍚'], ['tomates', '🍅'], ['cafe', '☕'], ['jabon', '🧼'], ['papel', '🧻'], ['zanahorias', '🥕'],
  ['pollo', '🍗'], ['pescado', '🐟'], ['uvas', '🍇'], ['naranjas', '🍊'], ['cebollas', '🧅'], ['papas', '🥔'],
  ['galletas', '🍪'], ['mantequilla', '🧈'], ['jugo', '🧃'], ['aguacates', '🥑'], ['limones', '🍋'], ['fresas', '🍓'],
  ['maiz', '🌽'], ['miel', '🍯'], ['pasta', '🍝'], ['sal', '🧂'], ['te', '🍵'], ['carne', '🥩'],
  ['brocoli', '🥦'], ['lechuga', '🥬'], ['pepinos', '🥒'], ['cereal', '🥣'], ['chocolate', '🍫'], ['pimientos', '🫑'],
] as const;

type ItemId = (typeof ITEMS)[number][0];
const EMOJI = Object.fromEntries(ITEMS) as Record<ItemId, string>;

export const LISTA_MAX_LEVEL = 8;

export function Lista({ level, settings, onDone }: TrialProps) {
  const { t } = useTranslation();
  const count = Math.min(level, LISTA_MAX_LEVEL) + 2;
  const [{ list, options }] = useState(() => {
    const pool = shuffle(ITEMS.map(([id]) => id));
    const list = pool.slice(0, count);
    // Recognition instead of typing: the list plus as many distractors.
    return { list, options: shuffle(pool.slice(0, count * 2)) };
  });
  const [phase, setPhase] = useState<'study' | 'recall'>('study');
  const [picked, setPicked] = useState<ItemId[]>([]);

  const name = (id: ItemId) => t(`exercises.lista.items.${id}`);
  const listText = list.map(name).join(', ');

  function toggle(id: ItemId) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  function check() {
    const hits = picked.filter((id) => list.includes(id)).length;
    const wrong = picked.length - hits;
    const success = hits === count && wrong === 0;
    onDone({
      success,
      score: Math.max(0, hits - wrong) / count,
      measure: count,
      reveal: success ? undefined : t('exercises.lista.reveal', { items: list.map((id) => `${EMOJI[id]} ${name(id)}`).join(', ') }),
    });
  }

  if (phase === 'study') {
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xl font-bold">{t('exercises.lista.study')}</p>
          <SpeakButton text={listText} />
        </div>
        <ul className="my-5 space-y-3">
          {list.map((id) => (
            <li key={id} className="flex items-center gap-4 rounded-2xl border-2 border-borde bg-white px-4 py-3 text-2xl font-bold">
              <span aria-hidden className="text-4xl">
                {EMOJI[id]}
              </span>
              {name(id)}
            </li>
          ))}
        </ul>
        {settings.timer && (
          <TimerBar ms={count * 3000 + 3000} label={t('exercises.lista.timeLeft')} onEnd={() => setPhase('recall')} />
        )}
        <button type="button" className="btn-primary mt-2 w-full" onClick={() => setPhase('recall')}>
          {t('exercises.lista.ready')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xl font-bold">{t('exercises.lista.choose')}</p>
      <p className="mt-1 text-lg text-tinta-suave" aria-live="polite">
        {t('exercises.lista.selected', { count: picked.length, total: count })}
      </p>
      <div className="my-5 grid grid-cols-2 gap-3">
        {options.map((id) => {
          const on = picked.includes(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(id)}
              className={`relative flex min-h-[6rem] flex-col items-center justify-center gap-1 rounded-2xl border-4 p-2 text-center text-lg font-bold leading-tight ${
                on ? 'border-primario bg-primario-claro' : 'border-borde bg-white'
              }`}
            >
              <span aria-hidden className="text-4xl">
                {EMOJI[id]}
              </span>
              <span className="break-words">{name(id)}</span>
              {on && (
                <span aria-hidden className="absolute right-2 top-1 text-2xl text-primario">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button type="button" className="btn-primary w-full" onClick={check} disabled={picked.length === 0}>
        <span aria-hidden>✓</span> {t('exercises.lista.check')}
      </button>
    </div>
  );
}
