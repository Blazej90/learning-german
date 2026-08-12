/**
 * SRS state and ratings. Mirrors `users/{uid}/cards/{phraseId}` in Firestore,
 * except that dates are plain `Date` here — converting to and from Firestore
 * `Timestamp` is the storage layer's job, so this logic stays pure.
 */

/** The four buttons of a review, mapped to SM-2 quality grades. */
export const RATINGS = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
} as const;

export type RatingId = keyof typeof RATINGS;

export type Quality = (typeof RATINGS)[RatingId];

/** Below this grade SM-2 treats the answer as a failure and restarts the card. */
export const FAILING_QUALITY = 3;

export const INITIAL_EASE_FACTOR = 2.5;

/** SM-2 never lets the ease factor drop below this, or intervals collapse. */
export const MINIMUM_EASE_FACTOR = 1.3;

/** Interval in days after the first and second successful review. */
export const FIRST_INTERVAL = 1;
export const SECOND_INTERVAL = 6;

/** Matches "5-10 nowych zwrotów" from the study plan. */
export const DEFAULT_NEW_CARDS_PER_DAY = 8;

export type CardState = {
  /** Id of the phrase this card schedules — see `src/data/phrases.ts`. */
  phraseId: string;
  /** Consecutive successful reviews; a failure resets it to 0. */
  repetitions: number;
  /** Current spacing in days. 0 until the first review happens. */
  interval: number;
  easeFactor: number;
  /** Start of the local day the card is next due on. */
  dueDate: Date;
  /** How many times the card was forgotten after having been learned. */
  lapses: number;
  /**
   * Start of the local day the card was first shown. Not in the original
   * Firestore sketch, but the daily cap on new cards cannot be enforced
   * without it — otherwise reopening the app hands out a fresh batch.
   */
  introducedAt: Date;
};

/** One entry of the session queue: a card to review, plus why it is there. */
export type QueueItem = {
  phraseId: string;
  /** `new` cards have never been reviewed; `due` ones are coming back. */
  kind: "new" | "due";
  card: CardState;
};
