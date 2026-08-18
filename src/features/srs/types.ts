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

/** Where a card lands after a failure, and after a first review graded "hard". */
export const FIRST_INTERVAL = 1;

/**
 * A brand-new card graded "good" lands here rather than on tomorrow.
 *
 * Anki's default graduating interval is one day, on the theory that a single
 * exposure is weak evidence: "good" pressed a second after the answer appeared
 * often means "I recognised it", which is not recall. That theory assumes a
 * deck of unfamiliar material. This one is a refresher — its source file is
 * literally a "lista zwrotów do przypomnienia" — so a large share of cards are
 * already half-known on first sight, and treating every first "good" as a first
 * contact understates what the user just reported.
 *
 * Two days rather than three: still close enough to catch a card that was only
 * recognised, far enough that "good" and "hard" stop meaning the same thing.
 */
export const GOOD_FIRST_INTERVAL = 2;

/**
 * A card graded "easy" on its very first review skips straight to here. Without
 * it the four buttons all schedule a brand-new card for tomorrow, which makes
 * grading it feel pointless on the one review where the user is most attentive.
 */
export const EASY_FIRST_INTERVAL = 4;

/**
 * "Hard" steps by this instead of by the ease factor.
 *
 * Textbook SM-2 lets the grade move only the ease factor, whose steps are tiny
 * (-0.14 for hard, +0.10 for easy) and compound slowly — three grades that land
 * within a day of each other for the first month of a card's life. Multiplying
 * the interval directly is what makes the buttons mean something.
 */
export const HARD_MULTIPLIER = 1.2;

/** "Easy" takes the "good" step and stretches it by this much. */
export const EASY_BONUS = 1.3;

/**
 * The soonest a remembered card may return. Tomorrow is what "nie znam" means,
 * so a successful review has to clear it or the two answers say the same thing.
 */
export const MINIMUM_REVIEW_INTERVAL = 2;

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
