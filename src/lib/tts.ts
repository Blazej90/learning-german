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
  /**
   * True once the browser has stopped handing over new voices — either because
   * it produced some or because it had long enough to and did not. An empty
   * list means "still loading" before this flips and "this device has none"
   * after, and the UI has to tell those two apart.
   */
  settled: boolean;
};

const NO_VOICES: VoiceSnapshot = {
  supported: false,
  voices: [],
  settled: false,
};

let snapshot: VoiceSnapshot = NO_VOICES;
let signature: string | null = null;
let settled = false;

/** How long to keep re-reading the voice list before giving up, in ms. */
const VOICE_POLL_INTERVAL = 250;
const VOICE_POLL_TIMEOUT = 5000;

export function subscribeToVoices(onChange: () => void): () => void {
  if (!isSpeechSupported()) return () => {};

  window.speechSynthesis.addEventListener("voiceschanged", onChange);

  /*
   * `voiceschanged` fires once, and browsers are free to fire it before React
   * has subscribed — on a page that paints quickly, the list can already be
   * populated by then. Waiting for an event that has been and gone leaves the
   * app convinced the device owns no voices, so the speakers never appear and
   * nothing explains why.
   *
   * Re-reading for the first few seconds closes that race. The snapshot is
   * cached behind its signature, so a poll that finds nothing new returns the
   * identical object and React re-renders nothing.
   */
  const startedAt = Date.now();
  const poll = window.setInterval(() => {
    const hasVoices = window.speechSynthesis.getVoices().length > 0;

    if (hasVoices || Date.now() - startedAt >= VOICE_POLL_TIMEOUT) {
      settled = true;
      window.clearInterval(poll);
    }

    onChange();
  }, VOICE_POLL_INTERVAL);

  return () => {
    window.clearInterval(poll);
    window.speechSynthesis.removeEventListener("voiceschanged", onChange);
  };
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
  // `settled` joins the signature, or the last poll — which changes nothing but
  // the flag — would hand back the stale object and the UI would stay stuck on
  // "loading" forever.
  const nextSignature = `${settled}:${voices.map((voice) => voice.voiceURI).join("|")}`;

  if (nextSignature !== signature) {
    signature = nextSignature;
    snapshot = { supported: true, voices, settled };
  }

  return snapshot;
}

/** No speech synthesis while prerendering — the client re-reads after mount. */
export function getServerVoiceSnapshot(): VoiceSnapshot {
  return NO_VOICES;
}
