import type { ComponentType } from 'react';

export type ExerciseId = 'parejas' | 'secuencia' | 'numeros' | 'lista';
export const EXERCISE_IDS: ExerciseId[] = ['parejas', 'secuencia', 'numeros', 'lista'];

export type TextSize = 'normal' | 'grande' | 'muy-grande';

export interface Settings {
  textSize: TextSize;
  sound: boolean;
  voice: boolean;
  /** Off by default: exercises wait for the user instead of hiding things on a timer. */
  timer: boolean;
}

export interface Profile {
  name: string;
  ageRange: string;
  createdAt: string;
}

export interface LevelState {
  level: number;
  /** Successful rounds in a row at the current level. */
  streak: number;
}

export interface SessionResult {
  id: string;
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  finishedAt: string;
  exercise: ExerciseId;
  trials: number;
  successes: number;
  /** Average round score, 0–1. */
  accuracy: number;
  startLevel: number;
  endLevel: number;
  /** Largest amount remembered in a successful round (pairs, squares, digits, items). 0 if none. */
  best: number;
  durationSec: number;
}

export interface DailyPlan {
  date: string;
  exercises: ExerciseId[];
  done: ExerciseId[];
}

export interface AppData {
  version: 1;
  profile: Profile | null;
  settings: Settings;
  levels: Record<ExerciseId, LevelState>;
  results: SessionResult[];
  plan: DailyPlan | null;
}

export interface TrialResult {
  success: boolean;
  /** 0–1 */
  score: number;
  /** How much the round asked the user to remember. */
  measure: number;
  /** Optional text shown afterwards with the right answer. */
  reveal?: string;
}

export interface TrialProps {
  level: number;
  settings: Settings;
  onDone: (result: TrialResult) => void;
}

export interface ExerciseDef {
  id: ExerciseId;
  icon: string;
  trials: number;
  maxLevel: number;
  Component: ComponentType<TrialProps>;
}
