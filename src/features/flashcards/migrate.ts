/**
 * One-way move of Phase 3's localStorage deck into Firestore.
 *
 * Runs once per account on a given browser. Firestore always wins a conflict:
 * only phrases with no document yet are uploaded, so signing in on a device
 * with stale local progress cannot roll back what the cloud already knows.
 *
 * The local copy is left in place. Clearing it would mean deciding that the
 * upload finished, and offline a write is durable long before its promise
 * settles — the migration flag is enough to stop this from running twice.
 */

import { fetchCards, saveCards } from "@/lib/firebase/cards";
import { loadCards } from "@/features/flashcards/storage";

const MIGRATION_KEY = "learning-german:cards-migrated-to:v1";

function readMigratedUid(): string | null {
  try {
    return window.localStorage.getItem(MIGRATION_KEY);
  } catch {
    return null;
  }
}

function markMigrated(uid: string): void {
  try {
    window.localStorage.setItem(MIGRATION_KEY, uid);
  } catch {
    // Storage blocked: the next sign-in retries, and the "only upload what is
    // missing" rule makes a repeat harmless.
  }
}

/** Number of cards uploaded; 0 when there was nothing to move. */
export async function migrateLocalCards(uid: string): Promise<number> {
  if (typeof window === "undefined") return 0;
  if (readMigratedUid() === uid) return 0;

  const local = loadCards();

  if (local.size === 0) {
    markMigrated(uid);
    return 0;
  }

  const remote = await fetchCards(uid);
  const missing = [...local.values()].filter(
    (card) => !remote.has(card.phraseId),
  );

  if (missing.length > 0) await saveCards(uid, missing);

  markMigrated(uid);
  return missing.length;
}
