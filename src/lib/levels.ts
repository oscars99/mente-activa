import type { LevelState } from './types';

/** Successful rounds in a row needed to move up a level. */
export const UP_AFTER = 3;

/**
 * Gentle staircase: three successes in a row move up one level,
 * one miss moves down one level (never below 1).
 */
export function nextLevel(state: LevelState, success: boolean, maxLevel: number): LevelState {
  if (!success) return { level: Math.max(1, state.level - 1), streak: 0 };
  const streak = state.streak + 1;
  if (streak >= UP_AFTER && state.level < maxLevel) return { level: state.level + 1, streak: 0 };
  return { level: state.level, streak: Math.min(streak, UP_AFTER) };
}
