/**
 * The `users/{uid}` profile document.
 *
 * Identity, timezone and the plan start date. Every write merges, so the phases
 * own their own fields and never clobber each other's.
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

/**
 * Day 1 of the four-week plan, or `null` if it has not been started yet.
 *
 * Absent is a normal state, not an error: the tracker shows a "start the plan"
 * screen until this date exists.
 */
export async function fetchPlanStartDate(uid: string): Promise<Date | null> {
  const snapshot = await getDoc(doc(getDb(), "users", uid));
  const value = snapshot.data()?.planStartDate;

  return value instanceof Timestamp ? value.toDate() : null;
}

/** Start the plan on `startDate` — the beginning of the user's local day. */
export function setPlanStartDate(uid: string, startDate: Date): Promise<void> {
  return setDoc(
    doc(getDb(), "users", uid),
    { planStartDate: Timestamp.fromDate(startDate) },
    { merge: true },
  );
}
