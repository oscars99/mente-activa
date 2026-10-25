import { addDays } from './dates';
import type { ExerciseId, SessionResult } from './types';

export function trainedDays(results: SessionResult[]): Set<string> {
  return new Set(results.map((r) => r.date));
}

/** Consecutive training days ending today (or yesterday, so the streak isn't "lost" before today's session). */
export function currentStreak(results: SessionResult[], today: string): number {
  const days = trainedDays(results);
  let cursor = days.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (days.has(cursor)) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function personalBest(results: SessionResult[], exercise: ExerciseId): number {
  return results.filter((r) => r.exercise === exercise).reduce((max, r) => Math.max(max, r.best), 0);
}

function inRange(r: SessionResult, from: string, to: string) {
  return r.date >= from && r.date <= to;
}

export interface WeeklyItem {
  exercise: ExerciseId;
  plays: number;
  bestNow: number;
  bestBefore: number;
}

export interface WeeklySummary {
  daysTrained: number;
  items: WeeklyItem[];
}

/** Last 7 days (including today) compared with the 7 days before. */
export function weeklySummary(results: SessionResult[], today: string): WeeklySummary {
  const weekStart = addDays(today, -6);
  const prevStart = addDays(today, -13);
  const prevEnd = addDays(today, -7);
  const thisWeek = results.filter((r) => inRange(r, weekStart, today));
  const lastWeek = results.filter((r) => inRange(r, prevStart, prevEnd));

  const exercises = [...new Set(thisWeek.map((r) => r.exercise))];
  const items = exercises.map((exercise) => {
    const now = thisWeek.filter((r) => r.exercise === exercise);
    const before = lastWeek.filter((r) => r.exercise === exercise);
    return {
      exercise,
      plays: now.length,
      bestNow: Math.max(0, ...now.map((r) => r.best)),
      bestBefore: Math.max(0, ...before.map((r) => r.best)),
    };
  });

  return { daysTrained: trainedDays(thisWeek).size, items };
}

export interface ChartPoint {
  date: string;
  best: number;
  level: number;
}

/** One point per day for the last `days` days that have results: the day's best and final level. */
export function dailySeries(results: SessionResult[], exercise: ExerciseId, today: string, days = 30): ChartPoint[] {
  const from = addDays(today, -(days - 1));
  const byDay = new Map<string, ChartPoint>();
  for (const r of results) {
    if (r.exercise !== exercise || !inRange(r, from, today)) continue;
    const prev = byDay.get(r.date);
    byDay.set(r.date, {
      date: r.date,
      best: Math.max(prev?.best ?? 0, r.best),
      level: r.endLevel,
    });
  }
  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}
