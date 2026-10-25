import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { chimeSuccess, tone } from '../lib/sound';
import { shuffle } from '../lib/random';
import type { TrialProps } from '../lib/types';

const PICTURES = [
  { emoji: '🍎', name: 'manzana' },
  { emoji: '🍌', name: 'plátano' },
  { emoji: '🍇', name: 'uvas' },
  { emoji: '🍓', name: 'fresa' },
  { emoji: '🍊', name: 'naranja' },
  { emoji: '🐶', name: 'perro' },
  { emoji: '🐱', name: 'gato' },
  { emoji: '🐦', name: 'pájaro' },
  { emoji: '🐟', name: 'pez' },
  { emoji: '🌻', name: 'girasol' },
  { emoji: '🌳', name: 'árbol' },
  { emoji: '🏠', name: 'casa' },
];

const PAIRS_BY_LEVEL = [3, 4, 5, 6, 8, 10, 12];
export const PAREJAS_MAX_LEVEL = PAIRS_BY_LEVEL.length;

/** Waiting time before two different cards turn back over. Generous on purpose. */
const FLIP_BACK_MS = 1400;

interface Card {
  key: number;
  emoji: string;
  name: string;
  matched: boolean;
}

function dealCards(pairs: number): Card[] {
  const chosen = shuffle(PICTURES).slice(0, pairs);
  return shuffle([...chosen, ...chosen]).map((p, key) => ({ ...p, key, matched: false }));
}

export function Parejas({ level, settings, onDone }: TrialProps) {
  const { t } = useTranslation();
  const pairs = PAIRS_BY_LEVEL[Math.min(level, PAREJAS_MAX_LEVEL) - 1];
  const [cards, setCards] = useState(() => dealCards(pairs));
  const [open, setOpen] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const found = cards.filter((c) => c.matched).length / 2;
  const cols = pairs <= 3 ? 'grid-cols-3' : 'grid-cols-4';

  function flip(index: number) {
    const card = cards[index];
    if (open.length === 2 || card.matched || open.includes(index)) return;
    const next = [...open, index];
    setOpen(next);
    if (next.length < 2) return;

    const tries = attempts + 1;
    setAttempts(tries);
    const [a, b] = next.map((i) => cards[i]);
    if (a.emoji === b.emoji) {
      const updated = cards.map((c, i) => (next.includes(i) ? { ...c, matched: true } : c));
      setCards(updated);
      setOpen([]);
      const allFound = updated.every((c) => c.matched);
      if (settings.sound) (allFound ? chimeSuccess : () => tone(660, 200))();
      if (allFound) {
        // Perfect play needs `pairs` tries; allow double that before it counts as a miss.
        const success = tries <= pairs * 2;
        timer.current = window.setTimeout(
          () => onDone({ success, score: Math.min(1, pairs / tries), measure: pairs }),
          900,
        );
      }
    } else {
      timer.current = window.setTimeout(() => setOpen([]), FLIP_BACK_MS);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-between text-lg font-bold" aria-live="polite">
        <span>{t('exercises.parejas.found', { found, total: pairs })}</span>
        <span className="text-tinta-suave">{t('exercises.parejas.attempts', { count: attempts })}</span>
      </div>
      <div className={`grid ${cols} gap-3`}>
        {cards.map((card, i) => {
          const visible = card.matched || open.includes(i);
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => flip(i)}
              aria-label={visible ? t('exercises.parejas.cardShown', { name: card.name }) : t('exercises.parejas.cardHidden')}
              className={`flex aspect-square items-center justify-center rounded-2xl border-4 text-[2.4rem] transition-colors ${
                card.matched
                  ? 'border-exito bg-exito-claro'
                  : visible
                    ? 'border-primario bg-white'
                    : 'border-primario-oscuro bg-primario text-white hover:bg-primario-oscuro'
              }`}
            >
              {visible ? <span aria-hidden>{card.emoji}</span> : <span aria-hidden className="text-3xl font-bold">?</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
