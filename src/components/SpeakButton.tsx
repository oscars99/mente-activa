import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { canSpeak, speak, stopSpeaking } from '../lib/speech';
import { useAppState } from '../state/AppState';

export function SpeakButton({ text }: { text: string }) {
  const { t } = useTranslation();
  const { data } = useAppState();

  useEffect(() => stopSpeaking, []);

  if (!data.settings.voice || !canSpeak()) return null;
  return (
    <button type="button" className="btn-quiet border-2 border-primario-claro" onClick={() => speak(text)}>
      <span aria-hidden>🔊</span> {t('common.listen')}
    </button>
  );
}
