import { EXERCISE_IDS, type AppData, type LevelState } from './types';

const KEY = 'mente-activa:v1';

export function defaultData(): AppData {
  return {
    version: 1,
    profile: null,
    settings: { textSize: 'grande', sound: true, voice: true, timer: false },
    levels: Object.fromEntries(EXERCISE_IDS.map((id) => [id, { level: 1, streak: 0 }])) as Record<
      (typeof EXERCISE_IDS)[number],
      LevelState
    >,
    results: [],
    plan: null,
  };
}

function isLevel(v: unknown): v is LevelState {
  return !!v && typeof v === 'object' && Number.isInteger((v as LevelState).level) && (v as LevelState).level >= 1;
}

/** Fills missing or damaged fields from defaults, so older, partial or hand-edited saves still load. */
function normalize(raw: unknown): AppData {
  const base = defaultData();
  if (!raw || typeof raw !== 'object') return base;
  const d = raw as Partial<AppData>;
  const levels = { ...base.levels };
  for (const id of EXERCISE_IDS) {
    const saved = d.levels?.[id];
    if (isLevel(saved)) levels[id] = { level: saved.level, streak: Number(saved.streak) || 0 };
  }
  return {
    version: 1,
    profile: d.profile && typeof d.profile.name === 'string' ? d.profile : null,
    settings: { ...base.settings, ...d.settings },
    levels,
    results: Array.isArray(d.results)
      ? d.results.filter((r) => r && EXERCISE_IDS.includes(r.exercise) && typeof r.date === 'string')
      : [],
    plan: d.plan ?? null,
  };
}

export function loadData(): AppData {
  try {
    const text = localStorage.getItem(KEY);
    return text ? normalize(JSON.parse(text)) : defaultData();
  } catch {
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked (private mode): keep working in memory.
  }
}

export function backupFileName(today: string) {
  return `mente-activa-copia-${today}.json`;
}

export function downloadBackup(data: AppData, today: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = backupFileName(today);
  a.click();
  URL.revokeObjectURL(url);
}

/** Returns null when the file is not a Mente Activa backup. */
export function parseBackup(text: string): AppData | null {
  try {
    const raw = JSON.parse(text);
    if (!raw || raw.version !== 1 || !Array.isArray(raw.results)) return null;
    return normalize(raw);
  } catch {
    return null;
  }
}
