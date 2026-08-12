/**
 * The `users/{uid}` profile document.
 *
 * Phase 4 only needs enough to identify the account and to know which timezone
 * "today" means; `planStartDate`, `streak` and `lastReviewDate` are written by
 * the phases that own them, which is why every write here merges.
 */

import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import type { User } from "firebase/auth";

import { getDb } from "@/lib/firebase/client";

function localTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "";
  }
}

/**
 * Create the profile on first sign-in, refresh it on later ones.
 *
 * `createdAt` is only written when the document is absent, so signing in again
 * does not reset it. If that read fails — offline with an empty cache — the
 * rest still merges and `createdAt` gets filled in on a later sign-in.
 */
export async function ensureUserDocument(user: User): Promise<void> {
  const reference = doc(getDb(), "users", user.uid);

  let isNew = false;

  try {
    isNew = !(await getDoc(reference)).exists();
  } catch {
    isNew = false;
  }

  await setDoc(
    reference,
    {
      displayName: user.displayName ?? null,
      timezone: localTimezone(),
      ...(isNew ? { createdAt: Timestamp.now() } : {}),
    },
    { merge: true },
  );
}
