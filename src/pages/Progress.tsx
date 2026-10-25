import { useTranslation } from 'react-i18next';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Layout } from '../components/Layout';
import { EXERCISES } from '../exercises/registry';
import { dayKey, parseDay } from '../lib/dates';
import { currentStreak, dailySeries, personalBest, trainedDays, weeklySummary, type ChartPoint } from '../lib/stats';
import { EXERCISE_IDS, type ExerciseId } from '../lib/types';
import { useAppState } from '../state/AppState';

const LINE = '#00897B';
const INK_MUTED = '#4A5561';
const GRID = '#E8E2D6';

export function Progress() {
  const { t } = useTranslation();
  const { data, today } = useAppState();
  const { results } = data;

  if (results.length === 0) {
    return (
      <Layout>
        <h1 className="text-3xl font-bold">{t('progress.title')}</h1>
        <div className="card mt-6 text-center">
          <p className="text-6xl" aria-hidden>
            🌱
          </p>
          <p className="mt-4 text-xl">{t('progress.empty')}</p>
        </div>
      </Layout>
    );
  }

  const streak = currentStreak(results, today);
  const week = weeklySummary(results, today);

  return (
    <Layout>
      <h1 className="text-3xl font-bold">{t('progress.title')}</h1>
      <p className="mt-2 text-xl">
        <span aria-hidden>✅ </span>
        {streak > 0 ? t('home.streak', { count: streak }) : t('home.streakZero')}
      </p>

      <section className="card mt-6" aria-labelledby="week-title">
        <h2 id="week-title" className="text-2xl font-bold">
          {t('progress.weekTitle')}
        </h2>
        <ul className="mt-3 space-y-2 text-lg">
          <li>{t('progress.daysThisWeek', { count: week.daysTrained })}</li>
          {week.items.map((item) => (
            <li key={item.exercise}>
              <span aria-hidden>{EXERCISES[item.exercise].icon} </span>
              <WeeklyLine {...item} />
            </li>
          ))}
        </ul>
      </section>

      <Calendar trained={trainedDays(results)} today={today} />

      {EXERCISE_IDS.map((id) => (
        <ExerciseCard key={id} id={id} />
      ))}
    </Layout>
  );
}

function WeeklyLine({ exercise, plays, bestNow, bestBefore }: { exercise: ExerciseId; plays: number; bestNow: number; bestBefore: number }) {
  const { t } = useTranslation();
  const name = t(`exercises.${exercise}.name`);
  const unit = (count: number) => t(`exercises.${exercise}.unit`, { count });
  if (bestBefore > 0 && bestNow > bestBefore) {
    return <>{t('progress.improved', { name, before: unit(bestBefore), now: unit(bestNow) })}</>;
  }
  if (bestNow > 0) return <>{t('progress.kept', { name, now: unit(bestNow) })}</>;
  return <>{t('progress.played', { name, count: plays })}</>;
}

function Calendar({ trained, today }: { trained: Set<string>; today: string }) {
  const { t, i18n } = useTranslation();
  const now = parseDay(today);
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (new Date(year, month, 1).getDay() + 6) % 7; // weeks start on Monday
  const monthName = now.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' });
  // Monday → Sunday names, from a known Monday (2024-01-01).
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i));

  return (
    <section className="card mt-6" aria-labelledby="cal-title">
      <h2 id="cal-title" className="text-2xl font-bold">
        {t('progress.calendarTitle')}
      </h2>
      <p className="mt-1 text-lg text-tinta-suave first-letter:uppercase">{monthName}</p>
      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
        {weekdays.map((d) => (
          <abbr
            key={d.getDay()}
            title={d.toLocaleDateString(i18n.language, { weekday: 'long' })}
            className="text-base font-bold uppercase text-tinta-suave no-underline"
          >
            {d.toLocaleDateString(i18n.language, { weekday: 'narrow' })}
          </abbr>
        ))}
        {Array.from({ length: leading }, (_, i) => (
          <span key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const key = dayKey(new Date(year, month, i + 1));
          const done = trained.has(key);
          return (
            <span
              key={key}
              title={done ? t('progress.trainedDay') : undefined}
              className={`flex h-[3.1rem] flex-col items-center justify-center rounded-xl text-base font-bold leading-none ${
                done ? 'bg-exito text-white' : 'bg-crema text-tinta-suave'
              } ${key === today ? 'ring-4 ring-acento' : ''}`}
            >
              {i + 1}
              {done && (
                <span aria-label={t('progress.trainedDay')} className="text-sm leading-none">
                  ✓
                </span>
              )}
            </span>
          );
        })}
      </div>
    </section>
  );
}

function ExerciseCard({ id }: { id: ExerciseId }) {
  const { t } = useTranslation();
  const { data, today } = useAppState();
  const best = personalBest(data.results, id);
  const series = dailySeries(data.results, id, today);
  const unit = (count: number) => t(`exercises.${id}.unit`, { count });
  // Even steps of 2 with headroom above the highest point: 0, 2, 4, 6, 8.
  const top = Math.max(4, Math.ceil((Math.max(0, ...series.map((p) => p.best)) + 1) / 2) * 2);
  const yTicks = Array.from({ length: top / 2 + 1 }, (_, i) => i * 2);

  return (
    <section className="card mt-6" aria-labelledby={`ex-${id}`}>
      <h2 id={`ex-${id}`} className="text-2xl font-bold">
        <span aria-hidden>{EXERCISES[id].icon}</span> {t(`exercises.${id}.name`)}
      </h2>
      <p className="mt-1 text-lg">{t('progress.currentLevel', { level: data.levels[id].level })}</p>
      <p className="text-lg">{best > 0 ? t('progress.best', { value: unit(best) }) : t('progress.noBest')}</p>

      <h3 className="mt-4 text-base font-bold text-tinta-suave">{t('progress.chartTitle')}</h3>
      {series.length >= 2 ? (
        <div className="mt-2 h-52" role="img" aria-label={series.map((p) => `${p.date}: ${unit(p.best)}`).join('; ')}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 12, right: 12, bottom: 4, left: -16 }}>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis
                dataKey="date"
                tickFormatter={(d: string) => `${parseDay(d).getDate()}/${parseDay(d).getMonth() + 1}`}
                tick={{ fontSize: '0.75rem', fill: INK_MUTED }}
                tickLine={false}
                axisLine={{ stroke: GRID }}
                minTickGap={16}
              />
              <YAxis
                allowDecimals={false}
                domain={[0, yTicks[yTicks.length - 1]]}
                ticks={yTicks}
                tick={{ fontSize: '0.75rem', fill: INK_MUTED }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ stroke: INK_MUTED, strokeDasharray: '4 4' }}
                content={({ active, payload }) => {
                  const point = payload?.[0]?.payload as ChartPoint | undefined;
                  if (!active || !point) return null;
                  return (
                    <div className="rounded-xl border-2 border-borde bg-white px-3 py-2 text-base shadow">
                      <p className="font-bold">{parseDay(point.date).toLocaleDateString('es', { day: 'numeric', month: 'long' })}</p>
                      <p>{unit(point.best)}</p>
                      <p className="text-tinta-suave">{t('progress.chartTooltipLevel', { level: point.level })}</p>
                    </div>
                  );
                }}
              />
              <Line
                type="linear"
                dataKey="best"
                stroke={LINE}
                strokeWidth={2}
                dot={{ r: 5, fill: LINE, stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 8, fill: LINE, stroke: '#fff', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="mt-2 text-lg text-tinta-suave">{t('progress.chartEmpty')}</p>
      )}
    </section>
  );
}
