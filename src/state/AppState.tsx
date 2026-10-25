import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { dayKey } from '../lib/dates';
import { planForDay } from '../lib/plan';
import { defaultData, loadData, saveData } from '../lib/storage';
import type { AppData, DailyPlan, ExerciseId, LevelState, Profile, SessionResult, Settings } from '../lib/types';

interface AppState {
  data: AppData;
  today: string;
  plan: DailyPlan;
  setProfile: (profile: Profile) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  updateName: (name: string) => void;
  /** Saves a finished exercise, its new level, and marks it done in today's plan if it was part of it. */
  recordSession: (result: SessionResult, level: LevelState) => void;
  replaceData: (data: AppData) => void;
  resetAll: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);
  const today = dayKey();
  const plan = planForDay(data, today);

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    document.documentElement.dataset.text = data.settings.textSize;
  }, [data.settings.textSize]);

  const setProfile = useCallback((profile: Profile) => setData((d) => ({ ...d, profile })), []);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
    [],
  );

  const updateName = useCallback(
    (name: string) => setData((d) => (d.profile ? { ...d, profile: { ...d.profile, name } } : d)),
    [],
  );

  const recordSession = useCallback((result: SessionResult, level: LevelState) => {
    setData((d) => {
      const current = planForDay(d, result.date);
      const done: ExerciseId[] =
        current.exercises.includes(result.exercise) && !current.done.includes(result.exercise)
          ? [...current.done, result.exercise]
          : current.done;
      return {
        ...d,
        results: [...d.results, result],
        levels: { ...d.levels, [result.exercise]: level },
        plan: { ...current, done },
      };
    });
  }, []);

  const replaceData = useCallback((next: AppData) => setData(next), []);
  const resetAll = useCallback(() => setData(defaultData()), []);

  const value = useMemo(
    () => ({ data, today, plan, setProfile, updateSettings, updateName, recordSession, replaceData, resetAll }),
    [data, today, plan, setProfile, updateSettings, updateName, recordSession, replaceData, resetAll],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
