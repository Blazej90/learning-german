import { addDays, startOfDay } from "@/features/srs/date";
import {
  EASY_BONUS,
  EASY_FIRST_INTERVAL,
  FAILING_QUALITY,
  FIRST_INTERVAL,
  HARD_MULTIPLIER,
  INITIAL_EASE_FACTOR,
  MINIMUM_EASE_FACTOR,
  MINIMUM_REVIEW_INTERVAL,
  RATINGS,
  type CardState,
  type Quality,
  type RatingId,
} from "@/features/srs/types";

/** A card that has never been reviewed: due immediately, default ease. */
export function createCard(phraseId: string, now: Date): CardState {
  const today = startOfDay(now);

  return {
    phraseId,
    repetitions: 0,
    interval: 0,
    easeFactor: INITIAL_EASE_FACTOR,
    dueDate: today,
    lapses: 0,
    introducedAt: today,
  };
}

/**
 * SM-2 ease update: `EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))`.
 *
 * Applied on every grade, failures included — that is what makes repeatedly
 * missed cards come back faster for good.
 */
export function nextEaseFactor(easeFactor: number, quality: Quality): number {
  const miss = 5 - quality;
  const updated = easeFactor + (0.1 - miss * (0.08 + miss * 0.02));

  return Math.max(MINIMUM_EASE_FACTOR, updated);
}

/**
 * Days until a card graded `rating` should come back.
 *
 * `easeFactor` is the value the grade has already been applied to, so "easy"
 * multiplies by a slightly larger factor than "good" before its bonus even
 * lands. The three passing grades are kept strictly apart wherever the day grid
 * allows it: four buttons offering the same date are four buttons that look
 * broken, and they were the reason this function stopped being pure SM-2.
 */
function nextInterval(
  rating: RatingId,
  repetitions: number,
  previousInterval: number,
  easeFactor: number,
): number {
  if (rating === "again") return FIRST_INTERVAL;

  // Graduating a new card: there is no previous interval to multiply, so the
  // first step is fixed — and longer for "easy", which is the whole point.
  if (repetitions === 1) {
    return rating === "easy" ? EASY_FIRST_INTERVAL : FIRST_INTERVAL;
  }

  const good = Math.max(
    MINIMUM_REVIEW_INTERVAL,
    Math.round(previousInterval * easeFactor),
  );

  if (rating === "good") return good;

  if (rating === "easy") {
    return Math.max(
      good + 1,
      Math.round(previousInterval * easeFactor * EASY_BONUS),
    );
  }

  // "hard" ignores the ease factor entirely and takes a small step, capped
  // below "good" so the ramp never inverts.
  return Math.max(
    MINIMUM_REVIEW_INTERVAL,
    Math.min(Math.round(previousInterval * HARD_MULTIPLIER), good),
  );
}

/**
 * Grade one review and return the card's next state. Pure: the same card,
 * rating and clock always produce the same result, and `card` is untouched.
 *
 * A grade below 3 restarts the card from scratch (back tomorrow, one more
 * lapse) but still lowers the ease factor, so a card that keeps failing ends
 * up with permanently shorter intervals.
 *
 * SM-2 supplies the ease factor; the spacing itself is the Anki-style variant,
 * because pure SM-2 hands the three passing grades near-identical intervals for
 * the first month of a card's life — see `nextInterval`. Existing cards need no
 * migration: the new intervals are derived from `interval` and `easeFactor`,
 * both of which every stored card already carries.
 */
export function schedule(
  card: CardState,
  rating: RatingId,
  now: Date,
): CardState {
  const quality = RATINGS[rating];
  const easeFactor = nextEaseFactor(card.easeFactor, quality);
  const failed = quality < FAILING_QUALITY;

  const repetitions = failed ? 0 : card.repetitions + 1;
  const interval = nextInterval(rating, repetitions, card.interval, easeFactor);

  return {
    ...card,
    repetitions,
    interval,
    easeFactor,
    // Scheduling from the start of today, not from `now`, keeps the due day
    // independent of the hour at which the review happened.
    dueDate: addDays(startOfDay(now), interval),
    lapses: failed ? card.lapses + 1 : card.lapses,
  };
}
