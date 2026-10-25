# Mente Activa

Ejercicios cortos y amables para entrenar la memoria, pensados para personas de 60 años o más.
A Spanish-language memory-training web app (installable PWA). Phase 1 MVP.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # logic tests (levels, streaks, weekly summary, daily plan)
npm run build    # production build in dist/ (static files, host anywhere)
```

## What's in Phase 1

- **Onboarding:** name, age range, text size.
- **Daily session ("Entrenamiento de hoy"):** 2 exercises (~4 min each), rotated so the least recently played come first.
- **Exercises:** `Parejas` (visual), `Secuencia` (Corsi blocks / spatial), `Números` (digit span + chunking),
  `Lista de compras` (word recall by recognition + story method).
- **Adaptive levels:** 3 correct rounds in a row → level up; 1 miss → level down (min 1). Optional practice round.
- **Progress ("Mi progreso"):** streak, monthly calendar, plain-language weekly summary, personal bests, one chart per exercise.
- **Settings ("Ajustes"):** name, text size (20/23/26 px base), sounds, read-aloud, optional time limit, backup/restore file, reset.
- No time limits by default, large touch targets, Atkinson Hyperlegible font, works offline once loaded.

Data lives only in the browser (`localStorage`, key `mente-activa:v1`). Accounts and sync are planned for Phase 3.

## Where things are

| Path | What |
|---|---|
| `src/locales/es.json` | **All UI text** (neutral Latin American Spanish, *tú*) |
| `src/exercises/` | One component per exercise + `registry.ts` (rounds per session, max level) |
| `src/components/ExerciseRunner.tsx` | Intro → practice → rounds → feedback → results, level updates |
| `src/lib/` | Levels, stats, daily plan, storage/backup, sound, speech |
| `src/pages/` | Home, Train (daily session), ExercisePage (free play), Progress, Settings, Onboarding |
