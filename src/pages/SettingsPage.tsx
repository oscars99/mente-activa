import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Layout } from '../components/Layout';
import { Toggle } from '../components/Toggle';
import { canSpeak } from '../lib/speech';
import { downloadBackup, parseBackup } from '../lib/storage';
import type { AppData, TextSize } from '../lib/types';
import { useAppState } from '../state/AppState';

const SIZES: TextSize[] = ['normal', 'grande', 'muy-grande'];

export function SettingsPage() {
  const { t } = useTranslation();
  const { data, today, updateSettings, updateName, replaceData, resetAll } = useAppState();
  const { settings } = data;
  const [name, setName] = useState(data.profile?.name ?? '');
  const [savedName, setSavedName] = useState(false);
  const [pending, setPending] = useState<AppData | null>(null);
  const [message, setMessage] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    const parsed = parseBackup(await file.text());
    if (parsed) setPending(parsed);
    else setMessage(t('settings.restoreBad'));
    if (fileInput.current) fileInput.current.value = '';
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold">{t('settings.title')}</h1>

      <section className="card mt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateName(name.trim());
            setSavedName(true);
          }}
        >
          <label htmlFor="settings-name" className="text-lg font-bold">
            {t('settings.name')}
          </label>
          <div className="mt-2 flex flex-col gap-3">
            <input
              id="settings-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSavedName(false);
              }}
              className="w-full rounded-2xl border-2 border-borde bg-white px-4 py-3 text-xl focus:border-primario"
            />
            <button type="submit" className="btn-primary" disabled={!name.trim()}>
              {savedName ? `✓ ${t('settings.saved')}` : t('settings.save')}
            </button>
          </div>
        </form>
      </section>

      <section className="card mt-6">
        <h2 className="text-lg font-bold" id="size-label">
          {t('settings.textSize')}
        </h2>
        <div className="mt-3 flex flex-col gap-3" role="radiogroup" aria-labelledby="size-label">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={settings.textSize === size}
              onClick={() => updateSettings({ textSize: size })}
              className={`btn justify-between border-2 ${
                settings.textSize === size ? 'border-primario bg-primario-claro' : 'border-borde bg-white'
              }`}
            >
              {t(`settings.sizes.${size}`)}
              {settings.textSize === size && <span aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="card mt-6 divide-y-2 divide-borde/60 py-2">
        <Toggle
          label={t('settings.sound')}
          help={t('settings.soundHelp')}
          checked={settings.sound}
          onChange={(sound) => updateSettings({ sound })}
        />
        {canSpeak() && (
          <Toggle
            label={t('settings.voice')}
            help={t('settings.voiceHelp')}
            checked={settings.voice}
            onChange={(voice) => updateSettings({ voice })}
          />
        )}
        <Toggle
          label={t('settings.timer')}
          help={t('settings.timerHelp')}
          checked={settings.timer}
          onChange={(timer) => updateSettings({ timer })}
        />
      </section>

      <section className="card mt-6">
        <h2 className="text-xl font-bold">{t('settings.backupTitle')}</h2>
        <p className="mt-2 text-lg text-tinta-suave">{t('settings.backupHelp')}</p>
        <div className="mt-4 flex flex-col gap-3">
          <button type="button" className="btn-primary" onClick={() => downloadBackup(data, today)}>
            <span aria-hidden>💾</span> {t('settings.backupSave')}
          </button>
          <button type="button" className="btn-secondary" onClick={() => fileInput.current?.click()}>
            <span aria-hidden>📂</span> {t('settings.backupRestore')}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </div>
        {message && (
          <p className="mt-4 rounded-2xl bg-primario-claro px-4 py-3 text-lg font-bold" role="status">
            {message}
          </p>
        )}
      </section>

      <section className="card mt-6">
        <h2 className="text-xl font-bold">{t('settings.resetTitle')}</h2>
        <p className="mt-2 text-lg text-tinta-suave">{t('settings.resetHelp')}</p>
        <button type="button" className="btn mt-4 w-full border-2 border-acento text-acento" onClick={() => setConfirmReset(true)}>
          {t('settings.reset')}
        </button>
      </section>

      <ConfirmDialog
        open={pending !== null}
        title={t('settings.restoreConfirmTitle')}
        body={t('settings.restoreConfirmBody')}
        confirmLabel={t('settings.restoreConfirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          if (pending) {
            replaceData(pending);
            setName(pending.profile?.name ?? '');
          }
          setPending(null);
          setMessage(t('settings.restoreOk'));
        }}
        onCancel={() => setPending(null)}
      />
      <ConfirmDialog
        open={confirmReset}
        danger
        title={t('settings.resetConfirmTitle')}
        body={t('settings.resetConfirmBody')}
        confirmLabel={t('settings.resetConfirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          setConfirmReset(false);
          resetAll();
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </Layout>
  );
}
