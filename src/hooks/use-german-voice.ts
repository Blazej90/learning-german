"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import {
  cancelSpeech,
  getServerVoiceSnapshot,
  getVoiceSnapshot,
  pickGermanVoice,
  speak,
  subscribeToVoices,
} from "@/lib/tts";

export type VoiceStatus =
  /** No `speechSynthesis` in this browser. */
  | "unsupported"
  /** Waiting for the browser to hand over its voice list. */
  | "loading"
  /** A German voice is installed and ready. */
  | "ready"
  /** Voices loaded, but none of them speaks German. */
  | "missing";

export type GermanVoice = {
  status: VoiceStatus;
  /** True only when speaking will actually produce German. */
  isAvailable: boolean;
  speakGerman: (text: string) => void;
};

/**
 * The German voice this device can offer, if any.
 *
 * Deliberately reports "no voice" instead of falling back to the default one:
 * a Polish voice reading German teaches the wrong pronunciation, which is
 * worse than a silent button.
 */
export function useGermanVoice(): GermanVoice {
  const { supported, voices, settled } = useSyncExternalStore(
    subscribeToVoices,
    getVoiceSnapshot,
    getServerVoiceSnapshot,
  );

  const voice = useMemo(() => pickGermanVoice(voices), [voices]);

  const status: VoiceStatus = !supported
    ? "unsupported"
    : voice
      ? "ready"
      : settled
        ? "missing"
        : "loading";

  // Leaving the screen mid-sentence should not keep the speaker talking.
  useEffect(() => cancelSpeech, []);

  const speakGerman = useCallback(
    (text: string) => {
      if (voice) speak(text, voice);
    },
    [voice],
  );

  return { status, isAvailable: voice !== null, speakGerman };
}
