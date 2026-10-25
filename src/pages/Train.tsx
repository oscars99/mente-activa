import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ExerciseRunner } from '../components/ExerciseRunner';
import { FocusLayout } from '../components/Layout';
import { EXERCISES } from '../exercises/registry';
import type { ExerciseId } from '../lib/types';
import { useAppState } from '../state/AppState';

/** Runs today's plan: each pending exercise in turn, with a short pause screen between them. */
export function Train() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { plan } = useAppState();
  const firstPending = (done: ExerciseId[]) => plan.exercises.find((id) => !done.includes(id));
  // Tracked locally: the plan marks an exercise done as soon as it's recorded,
  // but the user should still see its results screen before moving on.
  const [active, setActive] = useState(() => firstPending(plan.done));
  const [between, setBetween] = useState(false);

  if (!active) {
    return (
      <FocusLayout>
        <div className="card mt-10 text-center">
          <p className="text-7xl" aria-hidden>
            🎉
          </p>
          <h1 className="mt-4 text-3xl font-bold">{t('train.allDoneTitle')}</h1>
          <p className="mt-3 text-xl">{t('train.allDoneBody')}</p>
          <div className="mt-8 flex flex-col gap-3">
            <Link to="/" className="btn-primary">
              {t('train.backHome')}
            </Link>
            <Link to="/progreso" className="btn-secondary">
              {t('train.seeProgress')}
            </Link>
          </div>
        </div>
      </FocusLayout>
    );
  }

  if (between) {
    return (
      <FocusLayout>
        <div className="card mt-10 text-center">
          <p className="text-lg font-bold text-tinta-suave">{t('train.nextUp')}</p>
          <p className="mt-4 text-7xl" aria-hidden>
            {EXERCISES[active].icon}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{t(`exercises.${active}.name`)}</h1>
          <p className="mt-2 text-xl">{t(`exercises.${active}.short`)}</p>
          <button type="button" className="btn-primary mt-8 w-full" onClick={() => setBetween(false)} autoFocus>
            {t('common.continue')}
          </button>
        </div>
      </FocusLayout>
    );
  }

  return (
    <FocusLayout>
      <ExerciseRunner
        key={active}
        exercise={active}
        subtitle={t('train.exerciseOf', { n: plan.exercises.indexOf(active) + 1, total: plan.exercises.length })}
        onFinish={() => {
          const next = firstPending(plan.done);
          setActive(next);
          setBetween(Boolean(next));
        }}
        onExit={() => navigate('/')}
      />
    </FocusLayout>
  );
}
