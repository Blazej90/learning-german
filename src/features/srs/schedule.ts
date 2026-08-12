import { addDays, startOfDay } from "@/features/srs/date";
import {
  FAILING_QUALITY,
  FIRST_INTERVAL,
  INITIAL_EASE_FACTOR,
  MINIMUM_EASE_FACTOR,
  RATINGS,
  SECOND_INTERVAL,
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

function nextInterval(
  repetitions: number,
  previousInterval: number,
  easeFactor: number,
): number {
  if (repetitions === 1) return FIRST_INTERVAL;
  if (repetitions === 2) return SECOND_INTERVAL;

  return Math.round(previousInterval * easeFactor);
}

/**
 * Grade one review and return the card's next state. Pure: the same card,
 * rating and clock always produce the same result, and `card` is untouched.
 *
 * A grade below 3 restarts the card from scratch (back tomorrow, one more
 * lapse) but still lowers the ease factor, so a card that keeps failing ends
 * up with permanently shorter intervals.
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
  const interval = failed
    ? FIRST_INTERVAL
    : nextInterval(repetitions, card.interval, easeFactor);

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
