import { parseDay } from './dates';
import { EXERCISE_IDS, type AppData, type DailyPlan, type ExerciseId } from './types';

export const EXERCISES_PER_DAY = 2;

/**
 * Today's plan: the exercises played least recently (never-played first),
 * so the user rotates through every kind of memory over the week.
 */
export function planForDay(data: AppData, today: string): DailyPlan {
  if (data.plan?.date === today) return data.plan;

  const lastPlayed = new Map<ExerciseId, string>();
  for (const r of data.results) {
    const prev = lastPlayed.get(r.exercise);
    if (!prev || r.finishedAt > prev) lastPlayed.set(r.exercise, r.finishedAt);
  }

  // Rotate the tie-break order by day so new users don't always get the same pair.
  const offset = Math.floor(parseDay(today).getTime() / 86_400_000) % EXERCISE_IDS.length;
  const rotated = EXERCISE_IDS.map((_, i) => EXERCISE_IDS[(i + offset) % EXERCISE_IDS.length]);

  const exercises = [...rotated]
    .sort((a, b) => (lastPlayed.get(a) ?? '').localeCompare(lastPlayed.get(b) ?? ''))
    .slice(0, EXERCISES_PER_DAY);

  return { date: today, exercises, done: [] };
}
