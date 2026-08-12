/**
 * Lazily created Firebase singletons.
 *
 * Nothing initialises at import time on purpose. Client components are also
 * prerendered on the server, and Firestore's persistent cache needs IndexedDB —
 * touching it during prerender throws. Every getter here is therefore called
 * from an effect or an event handler, never from a module body or render.
 */

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

import { readFirebaseConfig } from "@/lib/firebase/config";

export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Brak konfiguracji Firebase — uzupełnij NEXT_PUBLIC_FIREBASE_* w .env.local.",
    );
    this.name = "FirebaseNotConfiguredError";
  }
}

let firestore: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  const config = readFirebaseConfig();
  if (!config) throw new FirebaseNotConfiguredError();

  // Next's dev server re-evaluates modules on hot reload; reusing the existing
  // app keeps `initializeApp` from throwing on the second pass.
  return getApps()[0] ?? initializeApp(config);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

/**
 * Firestore with an IndexedDB-backed cache, shared across tabs.
 *
 * Offline persistence is the point of Phase 4 as much as sync is: reviews on a
 * phone with no signal still land in the cache and upload later. Writes are
 * therefore acknowledged locally straight away, and the promise returned by a
 * write only settles once the server has seen it — callers must not block the
 * UI on it.
 */
export function getDb(): Firestore {
  if (firestore) return firestore;

  firestore = initializeFirestore(getFirebaseApp(), {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });

  return firestore;
}
