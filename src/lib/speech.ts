export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Prefer a Latin American Spanish voice, then any Spanish voice. */
function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const preferred = ['es-MX', 'es-US', 'es-419', 'es-CO', 'es-AR'];
  for (const lang of preferred) {
    const v = voices.find((voice) => voice.lang.replace('_', '-') === lang);
    if (v) return v;
  }
  return voices.find((voice) => voice.lang.startsWith('es'));
}

export function speak(text: string): void {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-MX';
  u.rate = 0.9;
  const voice = pickVoice();
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}
