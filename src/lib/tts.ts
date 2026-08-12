/**
 * Web Speech API wrapper for reading the German side of a card out loud.
 *
 * Browser-only: every function here touches `window`, so call them from client
 * components or effects. Voice quality and availability depend on the operating
 * system, hence the explicit "no German voice" case — reading German with a
 * Polish voice is worse than staying silent.
 */

/** Slower than default: learners need the endings, not native speed. */
const SPEECH_RATE = 0.85;

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Picks the voice to read German with: `de-DE` first, then any other German
 * locale (`de-AT`, `de-CH`), then nothing.
 */
export function pickGermanVoice(
  voices: readonly SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  const german = voices.filter((voice) =>
    voice.lang.toLowerCase().replace("_", "-").startsWith("de"),
  );

  const germany = german.find(
    (voice) => voice.lang.toLowerCase().replace("_", "-") === "de-de",
  );

  return germany ?? german[0] ?? null;
}

/** Speaks `text`, cancelling whatever was being said before. */
export function speak(text: string, voice: SpeechSynthesisVoice): void {
  if (!isSpeechSupported()) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = SPEECH_RATE;

  // Chrome queues utterances; without this, tapping twice reads it twice.
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  if (!isSpeechSupported()) return;

  window.speechSynthesis.cancel();
}

/**
 * The installed voices, shaped as an external store for `useSyncExternalStore`.
 *
 * Browsers fill the list asynchronously and announce it with `voiceschanged`,
 * which is exactly a subscribe-and-snapshot source. The snapshot has to keep
 * the same reference between changes, so it is cached behind a signature
 * built from the voice identifiers — `getVoices()` hands back a fresh array
 * on every call and would otherwise re-render forever.
 */
export type VoiceSnapshot = {
  supported: boolean;
  voices: readonly SpeechSynthesisVoice[];
};

const NO_VOICES: VoiceSnapshot = { supported: false, voices: [] };

let snapshot: VoiceSnapshot = NO_VOICES;
let signature: string | null = null;

export function subscribeToVoices(onChange: () => void): () => void {
  if (!isSpeechSupported()) return () => {};

  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  return () =>
    window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}

export function getVoiceSnapshot(): VoiceSnapshot {
  if (!isSpeechSupported()) {
    if (signature !== null) {
      signature = null;
      snapshot = NO_VOICES;
    }
    return snapshot;
  }

  const voices = window.speechSynthesis.getVoices();
  const nextSignature = voices.map((voice) => voice.voiceURI).join("|");

  if (nextSignature !== signature) {
    signature = nextSignature;
    snapshot = { supported: true, voices };
  }

  return snapshot;
}

/** No speech synthesis while prerendering — the client re-reads after mount. */
export function getServerVoiceSnapshot(): VoiceSnapshot {
  return NO_VOICES;
}
