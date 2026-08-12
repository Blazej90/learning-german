/**
 * Firebase config read from `NEXT_PUBLIC_*` env vars.
 *
 * The reads have to be literal `process.env.NEXT_PUBLIC_X` member accesses —
 * Next inlines those at build time, and anything dynamic (a loop over names,
 * destructuring `process.env`) ends up `undefined` in the browser bundle.
 *
 * Missing config is a normal state, not a crash: before the Firebase project
 * exists, the app should still start and say what is missing.
 */

import type { FirebaseOptions } from "firebase/app";

const RAW_CONFIG = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
} as const;

/** Auth and Firestore refuse to start without these four. */
const REQUIRED_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const satisfies readonly (keyof typeof RAW_CONFIG)[];

/** Env var names that are still empty — empty array means "ready to go". */
export function missingFirebaseEnvVars(): string[] {
  return REQUIRED_KEYS.filter((key) => !RAW_CONFIG[key]);
}

export const isFirebaseConfigured = missingFirebaseEnvVars().length === 0;

/** `null` when required vars are missing, so callers cannot half-initialise. */
export function readFirebaseConfig(): FirebaseOptions | null {
  if (!isFirebaseConfigured) return null;

  return {
    apiKey: RAW_CONFIG.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: RAW_CONFIG.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: RAW_CONFIG.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: RAW_CONFIG.NEXT_PUBLIC_FIREBASE_APP_ID,
    // Optional: passing `undefined` is the same as omitting them.
    storageBucket: RAW_CONFIG.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: RAW_CONFIG.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };
}
