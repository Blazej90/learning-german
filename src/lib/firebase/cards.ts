/**
 * SRS state in Firestore: `users/{uid}/cards/{phraseId}` and the review log
 * `users/{uid}/reviews/{autoId}`.
 *
 * The phrase id is the document id, so it is not repeated inside the document.
 * Dates cross the boundary here — `Timestamp` in the database, plain `Date` in
 * `features/srs`, which stays free of Firebase imports.
 *
 * Documents that fail validation are dropped rather than repaired, exactly as
 * in the localStorage layer this replaces: losing one card's schedule costs an
 * extra review, crashing costs the whole session.
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  Timestamp,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";

import type { CardState, RatingId } from "@/features/srs";
import { getDb } from "@/lib/firebase/client";

/** Firestore caps a batch at 500 writes; the deck is smaller, but be explicit. */
const MAX_BATCH_SIZE = 500;

function cardsCollection(uid: string) {
  return collection(getDb(), "users", uid, "cards");
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function toDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

function toCardState(phraseId: string, data: DocumentData): CardState | null {
  const dueDate = toDate(data.dueDate);
  const introducedAt = toDate(data.introducedAt);

  if (
    !isFiniteNumber(data.repetitions) ||
    !isFiniteNumber(data.interval) ||
    !isFiniteNumber(data.easeFactor) ||
    !isFiniteNumber(data.lapses) ||
    dueDate === null ||
    introducedAt === null
  ) {
    return null;
  }

  return {
    phraseId,
    repetitions: data.repetitions,
    interval: data.interval,
    easeFactor: data.easeFactor,
    dueDate,
    lapses: data.lapses,
    introducedAt,
  };
}

function toDocumentData(card: CardState): DocumentData {
  return {
    repetitions: card.repetitions,
    interval: card.interval,
    easeFactor: card.easeFactor,
    dueDate: Timestamp.fromDate(card.dueDate),
    lapses: card.lapses,
    introducedAt: Timestamp.fromDate(card.introducedAt),
  };
}

/**
 * Every saved card, keyed by phrase id.
 *
 * Reads the whole subcollection in one go — the deck is ~50 cards, so filtering
 * by due date server-side would cost an index and a second query for new cards
 * without saving anything measurable. Offline this resolves from the cache.
 */
export async function fetchCards(uid: string): Promise<Map<string, CardState>> {
  const snapshot = await getDocs(cardsCollection(uid));
  const cards = new Map<string, CardState>();

  for (const document of snapshot.docs) {
    const card = toCardState(document.id, document.data());
    if (card) cards.set(card.phraseId, card);
  }

  return cards;
}

/**
 * Persist one card. The returned promise settles on server acknowledgement, so
 * offline it stays pending — the write is already durable in IndexedDB by then,
 * which is why callers fire it without awaiting.
 */
export function saveCard(uid: string, card: CardState): Promise<void> {
  return setDoc(doc(cardsCollection(uid), card.phraseId), toDocumentData(card));
}

/** Bulk write used by the localStorage migration. */
export async function saveCards(
  uid: string,
  cards: readonly CardState[],
): Promise<void> {
  const db = getDb();

  for (let start = 0; start < cards.length; start += MAX_BATCH_SIZE) {
    const batch = writeBatch(db);

    for (const card of cards.slice(start, start + MAX_BATCH_SIZE)) {
      batch.set(doc(cardsCollection(uid), card.phraseId), toDocumentData(card));
    }

    await batch.commit();
  }
}

export type ReviewLogEntry = {
  phraseId: string;
  rating: RatingId;
  reviewedAt: Date;
  /** Spacing in days before this answer — how the charts show progress later. */
  previousInterval: number;
};

/**
 * Append to the review log that Phase 6 turns into a chart.
 *
 * The timestamp comes from the device rather than `serverTimestamp()`: offline
 * a server timestamp stays null until sync, which would misdate every review
 * done without signal.
 */
export function logReview(uid: string, entry: ReviewLogEntry): Promise<void> {
  const reviews = collection(getDb(), "users", uid, "reviews");

  return setDoc(doc(reviews), {
    phraseId: entry.phraseId,
    rating: entry.rating,
    reviewedAt: Timestamp.fromDate(entry.reviewedAt),
    previousInterval: entry.previousInterval,
  });
}
