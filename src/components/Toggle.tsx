import { useId } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  label: string;
  help?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** A switch that always spells out its state ("Sí"/"No") instead of relying on color. */
export function Toggle({ label, help, checked, onChange }: Props) {
  const { t } = useTranslation();
  const helpId = useId();
  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-bold">{label}</p>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          aria-describedby={help ? helpId : undefined}
          onClick={() => onChange(!checked)}
          className={`flex min-h-[3rem] min-w-[4.5rem] shrink-0 items-center justify-center gap-2 rounded-full border-2 px-3 text-lg font-bold ${
            checked ? 'border-primario bg-primario text-white' : 'border-borde bg-white text-tinta-suave'
          }`}
        >
          <span aria-hidden>{checked ? '✓' : '○'}</span>
          {checked ? t('settings.on') : t('settings.off')}
        </button>
      </div>
      {help && (
        <p id={helpId} className="mt-1 text-base text-tinta-suave">
          {help}
        </p>
      )}
    </div>
  );
}
