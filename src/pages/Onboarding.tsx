import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FocusLayout } from '../components/Layout';
import { SpeakButton } from '../components/SpeakButton';
import type { TextSize } from '../lib/types';
import { useAppState } from '../state/AppState';

const AGES = ['60', '70', '80', 'other'] as const;
const SIZES: TextSize[] = ['normal', 'grande', 'muy-grande'];
const STEPS = 4;

export function Onboarding() {
  const { t } = useTranslation();
  const { data, setProfile, updateSettings } = useAppState();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');

  function finish() {
    setProfile({ name: name.trim(), ageRange: age, createdAt: new Date().toISOString() });
  }

  return (
    <FocusLayout>
      <p className="mb-6 text-base font-bold text-tinta-suave">{t('onboarding.step', { n: step, total: STEPS })}</p>

      {step === 1 && (
        <section>
          <p className="text-6xl" aria-hidden>
            🧠
          </p>
          <h1 className="mt-4 text-3xl font-bold">{t('onboarding.welcomeTitle')}</h1>
          <p className="mt-4 text-xl">{t('onboarding.welcomeBody')}</p>
          <div className="mt-4">
            <SpeakButton text={`${t('onboarding.welcomeTitle')} ${t('onboarding.welcomeBody')}`} />
          </div>
          <button type="button" className="btn-primary mt-8 w-full" onClick={() => setStep(2)}>
            {t('common.continue')}
          </button>
        </section>
      )}

      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep(3);
          }}
        >
          <label htmlFor="name" className="text-3xl font-bold">
            {t('onboarding.nameQuestion')}
          </label>
          <p className="mt-2 text-lg text-tinta-suave">{t('onboarding.nameHelp')}</p>
          <input
            id="name"
            autoFocus
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('onboarding.namePlaceholder')}
            className="mt-6 w-full rounded-2xl border-2 border-borde bg-white px-4 py-4 text-2xl focus:border-primario"
          />
          <button type="submit" className="btn-primary mt-8 w-full" disabled={!name.trim()}>
            {t('common.continue')}
          </button>
        </form>
      )}

      {step === 3 && (
        <section>
          <h1 className="text-3xl font-bold">{t('onboarding.ageQuestion')}</h1>
          <div className="mt-6 flex flex-col gap-3" role="radiogroup" aria-label={t('onboarding.ageQuestion')}>
            {AGES.map((a) => (
              <button
                key={a}
                type="button"
                role="radio"
                aria-checked={age === a}
                onClick={() => {
                  setAge(a);
                  setStep(4);
                }}
                className={`btn justify-start border-2 text-xl ${
                  age === a ? 'border-primario bg-primario-claro' : 'border-borde bg-white'
                }`}
              >
                {t(`onboarding.ages.${a}`)}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 4 && (
        <section>
          <h1 className="text-3xl font-bold">{t('onboarding.textQuestion')}</h1>
          <p className="mt-2 text-lg text-tinta-suave">{t('onboarding.textHelp')}</p>
          <div className="mt-6 flex flex-col gap-3" role="radiogroup" aria-label={t('onboarding.textQuestion')}>
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                role="radio"
                aria-checked={data.settings.textSize === size}
                onClick={() => updateSettings({ textSize: size })}
                className={`btn justify-between border-2 text-xl ${
                  data.settings.textSize === size ? 'border-primario bg-primario-claro' : 'border-borde bg-white'
                }`}
              >
                {t(`settings.sizes.${size}`)}
                {data.settings.textSize === size && <span aria-hidden>✓</span>}
              </button>
            ))}
          </div>
          <button type="button" className="btn-primary mt-8 w-full" onClick={finish}>
            {t('onboarding.finish')}
          </button>
        </section>
      )}

      {step > 1 && (
        <button type="button" className="btn-quiet mt-4 w-full" onClick={() => setStep(step - 1)}>
          ← {t('common.back')}
        </button>
      )}
    </FocusLayout>
  );
}
