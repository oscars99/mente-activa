import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { EXERCISES } from '../exercises/registry';
import { parseDay } from '../lib/dates';
import { currentStreak } from '../lib/stats';
import { EXERCISE_IDS } from '../lib/types';
import { useAppState } from '../state/AppState';

export function Home() {
  const { t, i18n } = useTranslation();
  const { data, today, plan } = useAppState();
  const name = data.profile?.name;
  const streak = currentStreak(data.results, today);
  const allDone = plan.exercises.every((id) => plan.done.includes(id));
  const started = plan.done.length > 0;
  const dateText = parseDay(today).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Layout>
      <p className="text-lg text-tinta-suave first-letter:uppercase">{dateText}</p>
      <h1 className="text-3xl font-bold">{name ? t('home.hello', { name }) : t('home.helloNoName')}</h1>
      <p className="mt-2 text-lg">
        {streak > 0 ? (
          <>
            <span aria-hidden>✅ </span>
            {t('home.streak', { count: streak })}
          </>
        ) : (
          t('home.streakZero')
        )}
      </p>

      <section className="card mt-6 border-primario" aria-labelledby="today-title">
        <h2 id="today-title" className="text-2xl font-bold">
          {allDone ? t('home.doneTitle') : t('home.todayTitle')}
        </h2>
        <p className="mt-1 text-lg text-tinta-suave">{allDone ? t('home.doneBody') : t('home.todayInfo')}</p>
        <ul className="mt-4 space-y-3">
          {plan.exercises.map((id) => {
            const done = plan.done.includes(id);
            return (
              <li
                key={id}
                className={`flex items-center gap-4 rounded-2xl border-2 p-3 ${
                  done ? 'border-exito/40 bg-exito-claro' : 'border-borde bg-crema'
                }`}
              >
                <span aria-hidden className="text-4xl">
                  {EXERCISES[id].icon}
                </span>
                <div className="flex-1">
                  <p className="text-xl font-bold">{t(`exercises.${id}.name`)}</p>
                  <p className="text-base text-tinta-suave">{t(`exercises.${id}.short`)}</p>
                </div>
                {done && (
                  <span className="text-lg font-bold text-exito">
                    <span aria-hidden>✓ </span>
                    {t('home.doneMark')}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        {!allDone && (
          <Link to="/entrenar" className="btn-primary mt-5 w-full text-xl">
            {started ? t('home.resume') : t('home.start')} <span aria-hidden>→</span>
          </Link>
        )}
      </section>

      <section className="mt-8" aria-labelledby="others-title">
        <h2 id="others-title" className="text-2xl font-bold">
          {t('home.othersTitle')}
        </h2>
        <p className="mt-1 text-lg text-tinta-suave">{t('home.othersHelp')}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {EXERCISE_IDS.map((id) => (
            <Link
              key={id}
              to={`/ejercicio/${id}`}
              className="card flex flex-col items-center gap-1 p-4 text-center hover:border-primario"
            >
              <span aria-hidden className="text-4xl">
                {EXERCISES[id].icon}
              </span>
              <span className="text-lg font-bold">{t(`exercises.${id}.name`)}</span>
              <span className="text-base text-tinta-suave">{t('common.level', { level: data.levels[id].level })}</span>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}
