import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EXERCISES } from '../exercises/registry';
import { nextLevel } from '../lib/levels';
import { newId } from '../lib/random';
import { chimeSoft, chimeSuccess } from '../lib/sound';
import { personalBest } from '../lib/stats';
import type { ExerciseId, LevelState, SessionResult, TrialResult } from '../lib/types';
import { useAppState } from '../state/AppState';
import { ConfirmDialog } from './ConfirmDialog';
import { SpeakButton } from './SpeakButton';

type Phase =
  | { name: 'intro' }
  | { name: 'practice' }
  | { name: 'practiceFeedback'; result: TrialResult }
  | { name: 'trial' }
  | { name: 'feedback'; result: TrialResult }
  | { name: 'results'; session: SessionResult; previousBest: number };

interface Props {
  exercise: ExerciseId;
  /** e.g. "Ejercicio 1 de 2" during the daily session. */
  subtitle?: string;
  onFinish: () => void;
  onExit: () => void;
}

function pick(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)];
}

export function ExerciseRunner({ exercise, subtitle, onFinish, onExit }: Props) {
  const { t } = useTranslation();
  const { data, today, recordSession } = useAppState();
  const def = EXERCISES[exercise];
  const name = t(`exercises.${exercise}.name`);
  const firstTime = !data.results.some((r) => r.exercise === exercise);

  const startLevel = useRef<LevelState>(data.levels[exercise]);
  const [level, setLevel] = useState<LevelState>(data.levels[exercise]);
  const [phase, setPhase] = useState<Phase>({ name: 'intro' });
  const [trialResults, setTrialResults] = useState<TrialResult[]>([]);
  const [confirmExit, setConfirmExit] = useState(false);
  const startedAt = useRef(Date.now());
  const feedbackText = useRef('');

  const playing = phase.name !== 'intro' && phase.name !== 'results';
  const Trial = def.Component;

  function startTrials() {
    startedAt.current = Date.now();
    setPhase({ name: 'trial' });
  }

  function handlePractice(result: TrialResult) {
    feedbackText.current = result.success ? pick(t('runner.good', { returnObjects: true }) as string[]) : '';
    if (data.settings.sound) (result.success ? chimeSuccess : chimeSoft)();
    setPhase({ name: 'practiceFeedback', result });
  }

  function handleTrial(result: TrialResult) {
    feedbackText.current = pick(t(result.success ? 'runner.good' : 'runner.soft', { returnObjects: true }) as string[]);
    if (data.settings.sound) (result.success ? chimeSuccess : chimeSoft)();
    setTrialResults((r) => [...r, result]);
    setLevel((l) => nextLevel(l, result.success, def.maxLevel));
    setPhase({ name: 'feedback', result });
  }

  function afterFeedback() {
    if (trialResults.length < def.trials) {
      setPhase({ name: 'trial' });
      return;
    }
    const successes = trialResults.filter((r) => r.success);
    const session: SessionResult = {
      id: newId(),
      date: today,
      finishedAt: new Date().toISOString(),
      exercise,
      trials: trialResults.length,
      successes: successes.length,
      accuracy: trialResults.reduce((sum, r) => sum + r.score, 0) / trialResults.length,
      startLevel: startLevel.current.level,
      endLevel: level.level,
      best: Math.max(0, ...successes.map((r) => r.measure)),
      durationSec: Math.round((Date.now() - startedAt.current) / 1000),
    };
    const previousBest = personalBest(data.results, exercise);
    recordSession(session, level);
    setPhase({ name: 'results', session, previousBest });
  }

  const header = (
    <header className="mb-5 flex items-center justify-between gap-3">
      <div>
        {subtitle && <p className="text-base font-bold text-tinta-suave">{subtitle}</p>}
        <h1 className="text-2xl font-bold">
          <span aria-hidden>{def.icon}</span> {name}
        </h1>
      </div>
      {phase.name !== 'results' && (
        <button
          type="button"
          className="btn-quiet border-2 border-borde"
          onClick={() => (playing ? setConfirmExit(true) : onExit())}
        >
          <span aria-hidden>✕</span> {t('common.exit')}
        </button>
      )}
    </header>
  );

  const roundInfo =
    phase.name === 'trial' || phase.name === 'feedback' ? (
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-primario-claro px-4 py-2 text-lg font-bold">
        <span>
          {t('runner.round', {
            n: phase.name === 'trial' ? trialResults.length + 1 : trialResults.length,
            total: def.trials,
          })}
        </span>
        <span>{t('common.level', { level: level.level })}</span>
      </div>
    ) : null;

  return (
    <div>
      {header}
      {roundInfo}

      {phase.name === 'intro' && (
        <div className="space-y-4">
          <section className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold">{t('runner.howTo')}</h2>
              <SpeakButton text={`${t(`exercises.${exercise}.howTo`)} ${t(`exercises.${exercise}.technique`)}`} />
            </div>
            <p className="mt-2 text-lg">{t(`exercises.${exercise}.howTo`)}</p>
          </section>
          <section className="card border-acento/40 bg-acento-claro">
            <h2 className="text-xl font-bold">
              <span aria-hidden>💡</span> {t('runner.technique')}
            </h2>
            <p className="mt-2 text-lg">{t(`exercises.${exercise}.technique`)}</p>
          </section>
          <p className="text-center text-lg font-bold text-tinta-suave">{t('common.level', { level: level.level })}</p>
          <div className="flex flex-col gap-3">
            {firstTime ? (
              <>
                <button type="button" className="btn-primary" onClick={() => setPhase({ name: 'practice' })}>
                  {t('runner.practiceFirst')}
                </button>
                <button type="button" className="btn-secondary" onClick={startTrials}>
                  {t('runner.skipPractice')}
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn-primary" onClick={startTrials}>
                  {t('common.start')}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setPhase({ name: 'practice' })}>
                  {t('runner.practiceFirst')}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {phase.name === 'practice' && (
        <>
          <p className="mb-4 rounded-2xl border-2 border-dashed border-acento bg-acento-claro px-4 py-2 text-lg">
            <strong>{t('runner.practiceLabel')}:</strong> {t('runner.practiceNote')}
          </p>
          <Trial level={Math.max(1, level.level - 1)} settings={data.settings} onDone={handlePractice} />
        </>
      )}

      {phase.name === 'trial' && (
        <Trial key={trialResults.length} level={level.level} settings={data.settings} onDone={handleTrial} />
      )}

      {(phase.name === 'feedback' || phase.name === 'practiceFeedback') && (
        <div className="card mt-2 text-center" role="status">
          <p className="text-6xl" aria-hidden>
            {phase.result.success ? '🌟' : '🙂'}
          </p>
          {feedbackText.current && <p className="mt-3 text-3xl font-bold">{feedbackText.current}</p>}
          {phase.result.reveal && <p className="mt-3 text-lg">{phase.result.reveal}</p>}
          {phase.name === 'practiceFeedback' && <p className="mt-3 text-xl">{t('runner.practiceDone')}</p>}
          <button
            type="button"
            className="btn-primary mt-6 w-full"
            onClick={phase.name === 'feedback' ? afterFeedback : startTrials}
            autoFocus
          >
            {phase.name === 'practiceFeedback' ? t('runner.startReal') : t('common.continue')}
          </button>
        </div>
      )}

      {phase.name === 'results' && <Results {...phase} onFinish={onFinish} />}

      <ConfirmDialog
        open={confirmExit}
        title={t('runner.exitTitle')}
        body={t('runner.exitBody')}
        confirmLabel={t('runner.exitConfirm')}
        cancelLabel={t('runner.exitStay')}
        onConfirm={onExit}
        onCancel={() => setConfirmExit(false)}
      />
    </div>
  );
}

function Results({ session, previousBest, onFinish }: { session: SessionResult; previousBest: number; onFinish: () => void }) {
  const { t } = useTranslation();
  const { startLevel, endLevel } = session;
  const levelMessage =
    endLevel > startLevel
      ? t('runner.levelUp', { level: endLevel })
      : endLevel < startLevel
        ? t('runner.levelDown', { level: endLevel })
        : t('runner.levelSame', { level: endLevel });

  return (
    <div className="card text-center" role="status">
      <h2 className="text-2xl font-bold">{t('runner.resultsTitle')}</h2>
      <p className="mt-4 text-5xl" aria-hidden>
        {endLevel > startLevel ? '🏆' : '✅'}
      </p>
      <p className="mt-4 text-2xl font-bold">
        {t('runner.resultsCorrect', { count: session.successes, total: session.trials })}
      </p>
      <p className="mt-2 text-xl">{levelMessage}</p>
      {session.best > 0 && (
        <p className="mt-2 text-xl">
          {t('runner.bestToday', { value: t(`exercises.${session.exercise}.unit`, { count: session.best }) })}
        </p>
      )}
      {session.best > previousBest && previousBest > 0 && (
        <p className="mt-3 rounded-2xl bg-exito-claro px-4 py-2 text-xl font-bold text-exito">
          <span aria-hidden>⭐</span> {t('runner.newRecord')}
        </p>
      )}
      <button type="button" className="btn-primary mt-6 w-full" onClick={onFinish} autoFocus>
        {t('common.continue')}
      </button>
    </div>
  );
}
