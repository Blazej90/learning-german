import { describe, expect, it } from "vitest";

import { createCard, nextEaseFactor, schedule } from "@/features/srs/schedule";
import {
  INITIAL_EASE_FACTOR,
  MINIMUM_EASE_FACTOR,
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
  it("sends the first successful review one day out", () => {
    const card = schedule(fresh(), "good", NOW);

    expect(card.repetitions).toBe(1);
    expect(card.interval).toBe(1);
    expect(card.dueDate).toEqual(new Date(2026, 7, 13));
  });

  it("sends the second successful review six days out", () => {
    const card = reviewSequence(fresh(), ["good", "good"]);

    expect(card.repetitions).toBe(2);
    expect(card.interval).toBe(6);
  });

  it("multiplies by the ease factor from the third review on", () => {
    const card = reviewSequence(fresh(), ["good", "good", "good"]);

    // "good" leaves the ease factor at 2.5, so 6 * 2.5 = 15.
    expect(card.repetitions).toBe(3);
    expect(card.interval).toBe(15);
    expect(card.easeFactor).toBeCloseTo(2.5, 10);
  });

  it("rounds the multiplied interval to whole days", () => {
    const card = reviewSequence(fresh(), ["good", "good", "hard"]);

    // "hard" drops the ease factor to 2.36 first, then 6 * 2.36 = 14.16.
    expect(card.easeFactor).toBeCloseTo(2.36, 10);
    expect(card.interval).toBe(14);
  });

  it("grows faster for a card graded easy than one graded good", () => {
    const easy = reviewSequence(fresh(), ["easy", "easy", "easy"]);
    const good = reviewSequence(fresh(), ["good", "good", "good"]);

    expect(easy.interval).toBeGreaterThan(good.interval);
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
