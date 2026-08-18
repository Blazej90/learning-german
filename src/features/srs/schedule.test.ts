import { describe, expect, it } from "vitest";

import { createCard, nextEaseFactor, schedule } from "@/features/srs/schedule";
import {
  EASY_FIRST_INTERVAL,
  FIRST_INTERVAL,
  GOOD_FIRST_INTERVAL,
  INITIAL_EASE_FACTOR,
  MINIMUM_EASE_FACTOR,
  MINIMUM_REVIEW_INTERVAL,
  type CardState,
  type RatingId,
} from "@/features/srs/types";

const NOW = new Date(2026, 7, 12, 9, 0);
const TODAY = new Date(2026, 7, 12);

function fresh(): CardState {
  return createCard("greetings-hallo", NOW);
}

/** Grade the same card several times, one review per day. */
function reviewSequence(card: CardState, ratings: RatingId[]): CardState {
  return ratings.reduce(
    (state, rating, index) =>
      schedule(state, rating, new Date(2026, 7, 12 + index, 9, 0)),
    card,
  );
}

describe("createCard", () => {
  it("starts due today with the default ease factor", () => {
    expect(fresh()).toEqual({
      phraseId: "greetings-hallo",
      repetitions: 0,
      interval: 0,
      easeFactor: INITIAL_EASE_FACTOR,
      dueDate: TODAY,
      lapses: 0,
      introducedAt: TODAY,
    });
  });
});

describe("nextEaseFactor", () => {
  it("rewards an easy answer with +0.1", () => {
    expect(nextEaseFactor(2.5, 5)).toBeCloseTo(2.6, 10);
  });

  it("leaves a good answer unchanged", () => {
    expect(nextEaseFactor(2.5, 4)).toBeCloseTo(2.5, 10);
  });

  it("penalises a hard answer by 0.14", () => {
    expect(nextEaseFactor(2.5, 3)).toBeCloseTo(2.36, 10);
  });

  it("penalises a failure by 0.8", () => {
    expect(nextEaseFactor(2.5, 0)).toBeCloseTo(1.7, 10);
  });

  it("never drops below the minimum", () => {
    expect(nextEaseFactor(1.5, 0)).toBe(MINIMUM_EASE_FACTOR);
    expect(nextEaseFactor(MINIMUM_EASE_FACTOR, 0)).toBe(MINIMUM_EASE_FACTOR);
  });
});

describe("schedule — interval promotion", () => {
  it("graduates a brand-new card graded good past tomorrow", () => {
    const card = schedule(fresh(), "good", NOW);

    expect(card.repetitions).toBe(1);
    expect(card.interval).toBe(GOOD_FIRST_INTERVAL);
    expect(card.dueDate).toEqual(new Date(2026, 7, 14));
  });

  it("still sends a brand-new card graded hard to tomorrow", () => {
    const card = schedule(fresh(), "hard", NOW);

    // The three passing grades have to differ on the first review, or grading
    // it is theatre — but "hard" on first sight is what tomorrow is for.
    expect(card.interval).toBe(FIRST_INTERVAL);
    expect(card.dueDate).toEqual(new Date(2026, 7, 13));
  });

  it("lets a brand-new card graded easy skip ahead", () => {
    const card = schedule(fresh(), "easy", NOW);

    expect(card.repetitions).toBe(1);
    expect(card.interval).toBe(EASY_FIRST_INTERVAL);
  });

  it("multiplies by the ease factor from the second review on", () => {
    const card = reviewSequence(fresh(), ["good", "good"]);

    // "good" leaves the ease factor at 2.5, so 2 * 2.5 lands on 5.
    expect(card.repetitions).toBe(2);
    expect(card.interval).toBe(5);
    expect(card.easeFactor).toBeCloseTo(2.5, 10);
  });

  it("keeps multiplying as the card matures", () => {
    const card = reviewSequence(fresh(), ["good", "good", "good"]);

    // 5 * 2.5 = 12.5, rounded to 13.
    expect(card.interval).toBe(13);
  });

  it("steps hard by its own multiplier rather than the ease factor", () => {
    const card = reviewSequence(fresh(), ["good", "good", "hard"]);

    // 5 * 1.2 = 6, well short of the 13 that "good" would have given.
    expect(card.interval).toBe(6);
  });

  it("never lets a remembered card come back as soon as a forgotten one", () => {
    const card = reviewSequence(fresh(), ["good", "hard"]);

    // 2 * 1.2 rounds to 2; the floor is what keeps it from colliding with the
    // single day "again" hands out.
    expect(card.interval).toBeGreaterThanOrEqual(MINIMUM_REVIEW_INTERVAL);
  });

  it("grows faster for a card graded easy than one graded good", () => {
    const easy = reviewSequence(fresh(), ["easy", "easy", "easy"]);
    const good = reviewSequence(fresh(), ["good", "good", "good"]);

    expect(easy.interval).toBeGreaterThan(good.interval);
  });
});

/**
 * The regression this whole variant exists for: textbook SM-2 offered the same
 * date under three different buttons for the first weeks of a card's life, so
 * grading honestly changed nothing the user could see.
 */
describe("schedule — the four grades stay distinguishable", () => {
  const PASSING: RatingId[] = ["hard", "good", "easy"];

  /** Walk a card forward with `good`, checking every review it passes through. */
  function everyStep(steps: number): CardState[] {
    const states: CardState[] = [];
    let card = fresh();

    for (let index = 0; index < steps; index += 1) {
      states.push(card);
      card = schedule(card, "good", new Date(2026, 7, 12 + index, 9, 0));
    }

    return states;
  }

  it("orders the passing grades hard <= good < easy at every step", () => {
    for (const card of everyStep(8)) {
      const [hard, good, easy] = PASSING.map(
        (rating) => schedule(card, rating, NOW).interval,
      );

      expect(hard).toBeLessThanOrEqual(good);
      expect(good).toBeLessThan(easy);
    }
  });

  it("never offers three identical intervals, first review included", () => {
    for (const card of everyStep(8)) {
      const intervals = PASSING.map(
        (rating) => schedule(card, rating, NOW).interval,
      );

      expect(new Set(intervals).size).toBeGreaterThan(1);
    }
  });

  it("keeps every passing grade ahead of a failure", () => {
    for (const card of everyStep(8)) {
      const failed = schedule(card, "again", NOW).interval;

      for (const rating of PASSING) {
        expect(schedule(card, rating, NOW).interval).toBeGreaterThanOrEqual(
          failed,
        );
      }
    }
  });
});

describe("schedule — failure", () => {
  it("restarts a mature card and books it for tomorrow", () => {
    const mature = reviewSequence(fresh(), ["good", "good", "good"]);
    const failed = schedule(mature, "again", new Date(2026, 7, 27, 9, 0));

    expect(failed.repetitions).toBe(0);
    expect(failed.interval).toBe(1);
    expect(failed.dueDate).toEqual(new Date(2026, 7, 28));
    expect(failed.lapses).toBe(mature.lapses + 1);
  });

  it("keeps the lowered ease factor after the restart", () => {
    const mature = reviewSequence(fresh(), ["good", "good", "good"]);
    const failed = schedule(mature, "again", new Date(2026, 7, 27, 9, 0));

    expect(failed.easeFactor).toBeCloseTo(1.7, 10);
  });

  it("makes a repeatedly failed card grow more slowly than a clean one", () => {
    const struggled = reviewSequence(fresh(), [
      "again",
      "good",
      "good",
      "good",
    ]);
    const clean = reviewSequence(fresh(), ["good", "good", "good"]);

    expect(struggled.repetitions).toBe(clean.repetitions);
    expect(struggled.interval).toBeLessThan(clean.interval);
  });

  it("bottoms the ease factor out at the minimum after enough failures", () => {
    const card = reviewSequence(fresh(), ["again", "again", "again"]);

    expect(card.easeFactor).toBe(MINIMUM_EASE_FACTOR);
    expect(card.interval).toBe(1);
    expect(card.lapses).toBe(3);
  });
});

describe("schedule — purity and day boundaries", () => {
  it("does not mutate the card it was given", () => {
    const card = fresh();
    const snapshot = { ...card };

    schedule(card, "easy", NOW);

    expect(card).toEqual(snapshot);
  });

  it("returns the same result for the same input", () => {
    expect(schedule(fresh(), "good", NOW)).toEqual(
      schedule(fresh(), "good", NOW),
    );
  });

  it("ignores the time of day when picking the due date", () => {
    const morning = schedule(fresh(), "good", new Date(2026, 7, 12, 6, 30));
    const night = schedule(fresh(), "good", new Date(2026, 7, 12, 23, 45));

    expect(morning.dueDate).toEqual(night.dueDate);
  });

  it("carries the introduction date through later reviews", () => {
    const card = reviewSequence(fresh(), ["good", "good", "again"]);

    expect(card.introducedAt).toEqual(TODAY);
    expect(card.phraseId).toBe("greetings-hallo");
  });
});
