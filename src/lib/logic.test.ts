import { describe, expect, it } from 'vitest';
import { chunkDigits } from '../exercises/chunk';
import { nextLevel } from './levels';
import { planForDay } from './plan';
import { currentStreak, dailySeries, weeklySummary } from './stats';
import { defaultData, parseBackup } from './storage';
import type { ExerciseId, SessionResult } from './types';

function result(date: string, exercise: ExerciseId = 'numeros', best = 4): SessionResult {
  return {
    id: `${date}-${exercise}`,
    date,
    finishedAt: `${date}T10:00:00.000Z`,
    exercise,
    trials: 5,
    successes: 3,
    accuracy: 0.7,
    startLevel: 1,
    endLevel: 2,
    best,
    durationSec: 200,
  };
}

describe('nextLevel', () => {
  it('moves up after three successes in a row', () => {
    let s = { level: 1, streak: 0 };
    s = nextLevel(s, true, 8);
    s = nextLevel(s, true, 8);
    expect(s).toEqual({ level: 1, streak: 2 });
    expect(nextLevel(s, true, 8)).toEqual({ level: 2, streak: 0 });
  });

  it('moves down one level on a miss, never below 1', () => {
    expect(nextLevel({ level: 3, streak: 2 }, false, 8)).toEqual({ level: 2, streak: 0 });
    expect(nextLevel({ level: 1, streak: 0 }, false, 8)).toEqual({ level: 1, streak: 0 });
  });

  it('stays at the top level', () => {
    expect(nextLevel({ level: 8, streak: 2 }, true, 8)).toEqual({ level: 8, streak: 3 });
  });
});

describe('chunkDigits', () => {
  it('groups like a phone number', () => {
    expect(chunkDigits('482')).toBe('482');
    expect(chunkDigits('4821')).toBe('48 21');
    expect(chunkDigits('48219')).toBe('482 19');
    expect(chunkDigits('4821937')).toBe('482 19 37');
    expect(chunkDigits('4821937561')).toBe('482 193 75 61');
  });
});

describe('currentStreak', () => {
  it('counts consecutive days ending today', () => {
    const rs = [result('2026-10-23'), result('2026-10-24'), result('2026-10-25')];
    expect(currentStreak(rs, '2026-10-25')).toBe(3);
  });

  it('keeps yesterday’s streak alive before today’s session', () => {
    expect(currentStreak([result('2026-10-23'), result('2026-10-24')], '2026-10-25')).toBe(2);
  });

  it('breaks on a missed day', () => {
    expect(currentStreak([result('2026-10-22'), result('2026-10-25')], '2026-10-25')).toBe(1);
    expect(currentStreak([result('2026-10-22')], '2026-10-25')).toBe(0);
  });
});

describe('weeklySummary', () => {
  it('compares this week with the week before', () => {
    const rs = [result('2026-10-14', 'numeros', 4), result('2026-10-24', 'numeros', 6), result('2026-10-25', 'lista', 3)];
    const s = weeklySummary(rs, '2026-10-25');
    expect(s.daysTrained).toBe(2);
    expect(s.items.find((i) => i.exercise === 'numeros')).toMatchObject({ plays: 1, bestNow: 6, bestBefore: 4 });
  });
});

describe('dailySeries', () => {
  it('keeps the best result of each day, in date order', () => {
    const rs = [result('2026-10-25', 'numeros', 5), result('2026-10-24', 'numeros', 4), result('2026-10-25', 'numeros', 6)];
    expect(dailySeries(rs, 'numeros', '2026-10-25').map((p) => [p.date, p.best])).toEqual([
      ['2026-10-24', 4],
      ['2026-10-25', 6],
    ]);
  });
});

describe('planForDay', () => {
  it('prefers exercises never played, then the least recent', () => {
    const data = defaultData();
    data.results = [result('2026-10-24', 'parejas'), result('2026-10-23', 'secuencia')];
    const plan = planForDay(data, '2026-10-25');
    expect(plan.exercises).toHaveLength(2);
    expect(plan.exercises.sort()).toEqual(['lista', 'numeros']);
  });

  it('reuses a saved plan for the same day', () => {
    const data = defaultData();
    data.plan = { date: '2026-10-25', exercises: ['parejas', 'lista'], done: ['parejas'] };
    expect(planForDay(data, '2026-10-25')).toBe(data.plan);
  });
});

describe('parseBackup', () => {
  it('repairs damaged levels and drops broken results instead of crashing', () => {
    const damaged = JSON.stringify({
      version: 1,
      profile: { name: 'Ana' },
      levels: { parejas: null, numeros: { level: 3, streak: 'x' }, lista: { level: 0 } },
      results: [null, { exercise: 'nada', date: '2026-10-25' }, result('2026-10-25', 'lista')],
    });
    const data = parseBackup(damaged)!;
    expect(data.levels.parejas).toEqual({ level: 1, streak: 0 });
    expect(data.levels.numeros).toEqual({ level: 3, streak: 0 });
    expect(data.levels.lista).toEqual({ level: 1, streak: 0 });
    expect(data.results).toHaveLength(1);
  });

  it('rejects files that are not backups', () => {
    expect(parseBackup('hola')).toBeNull();
    expect(parseBackup('{"version":2}')).toBeNull();
  });
});
