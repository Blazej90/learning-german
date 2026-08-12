import { describe, expect, it } from "vitest";

import {
  buildReviewQueue,
  countNewCardsIntroducedOn,
  isDue,
} from "@/features/srs/queue";
import { createCard } from "@/features/srs/schedule";
import {
  DEFAULT_NEW_CARDS_PER_DAY,
  INITIAL_EASE_FACTOR,
  type CardState,
} from "@/features/srs/types";

const NOW = new Date(2026, 7, 12, 9, 0);
const TODAY = new Date(2026, 7, 12);

const DECK = Array.from({ length: 20 }, (_, index) => `phrase-${index + 1}`);

type CardOverrides = Partial<CardState> & { phraseId: string };

function card({ phraseId, ...overrides }: CardOverrides): CardState {
  return {
    phraseId,
    repetitions: 1,
    interval: 1,
    easeFactor: INITIAL_EASE_FACTOR,
    dueDate: TODAY,
    lapses: 0,
    introducedAt: new Date(2026, 7, 1),
    ...overrides,
  };
}

function cardMap(...states: CardState[]): ReadonlyMap<string, CardState> {
  return new Map(states.map((state) => [state.phraseId, state]));
}

function idsOf(queue: { phraseId: string }[]): string[] {
  return queue.map((item) => item.phraseId);
}

describe("isDue", () => {
  it("counts a card due earlier today as due", () => {
    expect(isDue(card({ phraseId: "a", dueDate: TODAY }), NOW)).toBe(true);
  });

  it("counts an overdue card as due", () => {
    expect(
      isDue(card({ phraseId: "a", dueDate: new Date(2026, 6, 30) }), NOW),
    ).toBe(true);
  });

  it("does not release a card due tomorrow, even late at night", () => {
    const tomorrow = card({ phraseId: "a", dueDate: new Date(2026, 7, 13) });

    expect(isDue(tomorrow, new Date(2026, 7, 12, 23, 59))).toBe(false);
  });
});

describe("countNewCardsIntroducedOn", () => {
  it("counts only cards first seen on the given day", () => {
    const cards = cardMap(
      card({ phraseId: "a", introducedAt: TODAY }),
      card({ phraseId: "b", introducedAt: TODAY }),
      card({ phraseId: "c", introducedAt: new Date(2026, 7, 11) }),
    );

    expect(countNewCardsIntroducedOn(cards, NOW)).toBe(2);
  });
});

describe("buildReviewQueue — new cards", () => {
  it("hands out the daily budget in deck order on a blank slate", () => {
    const queue = buildReviewQueue({
      phraseIds: DECK,
      cards: cardMap(),
      now: NOW,
    });

    expect(queue).toHaveLength(DEFAULT_NEW_CARDS_PER_DAY);
    expect(idsOf(queue)).toEqual(DECK.slice(0, DEFAULT_NEW_CARDS_PER_DAY));
    expect(queue.every((item) => item.kind === "new")).toBe(true);
  });

  it("gives new cards the state of a card that has never been reviewed", () => {
    const [first] = buildReviewQueue({
      phraseIds: DECK,
      cards: cardMap(),
      now: NOW,
    });

    expect(first.card).toEqual(createCard("phrase-1", NOW));
  });

  it("stops at the end of the deck when it is shorter than the budget", () => {
    const queue = buildReviewQueue({
      phraseIds: ["only-one"],
      cards: cardMap(),
      now: NOW,
    });

    expect(idsOf(queue)).toEqual(["only-one"]);
  });

  it("respects a custom daily limit", () => {
    const queue = buildReviewQueue({
      phraseIds: DECK,
      cards: cardMap(),
      now: NOW,
      newCardsPerDay: 3,
    });

    expect(idsOf(queue)).toEqual(["phrase-1", "phrase-2", "phrase-3"]);
  });

  it("returns no new cards when the limit is zero", () => {
    const queue = buildReviewQueue({
      phraseIds: DECK,
      cards: cardMap(),
      now: NOW,
      newCardsPerDay: 0,
    });

    expect(queue).toEqual([]);
  });

  it("skips phrases that already have saved state", () => {
    const queue = buildReviewQueue({
      phraseIds: DECK,
      cards: cardMap(
        card({ phraseId: "phrase-1", dueDate: new Date(2027, 0, 1) }),
      ),
      now: NOW,
      newCardsPerDay: 2,
    });

    expect(idsOf(queue)).toEqual(["phrase-2", "phrase-3"]);
  });
});

describe("buildReviewQueue — daily budget", () => {
  it("counts cards already introduced today against the budget", () => {
    const cards = cardMap(
      card({
        phraseId: "phrase-1",
        introducedAt: TODAY,
        dueDate: new Date(2026, 7, 13),
      }),
      card({
        phraseId: "phrase-2",
        introducedAt: TODAY,
        dueDate: new Date(2026, 7, 13),
      }),
    );

    const queue = buildReviewQueue({
      phraseIds: DECK,
      cards,
      now: NOW,
      newCardsPerDay: 3,
    });

    // Two of the three slots are spent, so only one fresh phrase is left.
    expect(idsOf(queue)).toEqual(["phrase-3"]);
  });

  it("ignores cards introduced on earlier days", () => {
    const cards = cardMap(
      card({
        phraseId: "phrase-1",
        introducedAt: new Date(2026, 7, 11),
        dueDate: new Date(2026, 7, 13),
      }),
    );

    const queue = buildReviewQueue({
      phraseIds: DECK,
      cards,
      now: NOW,
      newCardsPerDay: 2,
    });

    expect(idsOf(queue)).toEqual(["phrase-2", "phrase-3"]);
  });

  it("never goes negative when the budget is already overspent", () => {
    const cards = cardMap(
      card({
        phraseId: "phrase-1",
        introducedAt: TODAY,
        dueDate: new Date(2026, 7, 13),
      }),
      card({
        phraseId: "phrase-2",
        introducedAt: TODAY,
        dueDate: new Date(2026, 7, 13),
      }),
    );

    const queue = buildReviewQueue({
      phraseIds: DECK,
      cards,
      now: NOW,
      newCardsPerDay: 1,
    });

    expect(queue).toEqual([]);
  });
});

describe("buildReviewQueue — due cards", () => {
  it("puts due cards before new ones", () => {
    const cards = cardMap(
      card({ phraseId: "phrase-5", dueDate: new Date(2026, 7, 10) }),
    );

    const queue = buildReviewQueue({
      phraseIds: DECK,
      cards,
      now: NOW,
      newCardsPerDay: 2,
    });

    expect(idsOf(queue)).toEqual(["phrase-5", "phrase-1", "phrase-2"]);
    expect(queue[0].kind).toBe("due");
  });

  it("orders due cards with the longest overdue first", () => {
    const cards = cardMap(
      card({ phraseId: "phrase-1", dueDate: TODAY }),
      card({ phraseId: "phrase-2", dueDate: new Date(2026, 6, 20) }),
      card({ phraseId: "phrase-3", dueDate: new Date(2026, 7, 5) }),
    );

    const queue = buildReviewQueue({
      phraseIds: DECK,
      cards,
      now: NOW,
      newCardsPerDay: 0,
    });

    expect(idsOf(queue)).toEqual(["phrase-2", "phrase-3", "phrase-1"]);
  });

  it("keeps deck order for cards due on the same day", () => {
    const cards = cardMap(
      card({ phraseId: "phrase-3", dueDate: TODAY }),
      card({ phraseId: "phrase-1", dueDate: TODAY }),
      card({ phraseId: "phrase-2", dueDate: TODAY }),
    );

    const queue = buildReviewQueue({
      phraseIds: DECK,
      cards,
      now: NOW,
      newCardsPerDay: 0,
    });

    expect(idsOf(queue)).toEqual(["phrase-1", "phrase-2", "phrase-3"]);
  });

  it("leaves cards that are not due yet out of the queue", () => {
    const cards = cardMap(
      card({ phraseId: "phrase-1", dueDate: new Date(2026, 7, 13) }),
      card({ phraseId: "phrase-2", dueDate: TODAY }),
    );

    const queue = buildReviewQueue({
      phraseIds: DECK,
      cards,
      now: NOW,
      newCardsPerDay: 0,
    });

    expect(idsOf(queue)).toEqual(["phrase-2"]);
  });

  it("ignores saved state for phrases no longer in the deck", () => {
    const cards = cardMap(
      card({ phraseId: "retired-phrase", dueDate: new Date(2020, 0, 1) }),
    );

    const queue = buildReviewQueue({
      phraseIds: DECK,
      cards,
      now: NOW,
      newCardsPerDay: 1,
    });

    expect(idsOf(queue)).toEqual(["phrase-1"]);
  });
});
