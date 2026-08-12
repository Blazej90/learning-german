import { isSameDay, startOfDay } from "@/features/srs/date";
import { createCard } from "@/features/srs/schedule";
import {
  DEFAULT_NEW_CARDS_PER_DAY,
  type CardState,
  type QueueItem,
} from "@/features/srs/types";

/** True once the local day of `card.dueDate` has arrived (or passed). */
export function isDue(card: CardState, now: Date): boolean {
  return startOfDay(card.dueDate).getTime() <= startOfDay(now).getTime();
}

/** How many cards were seen for the first time on `now`'s local day. */
export function countNewCardsIntroducedOn(
  cards: ReadonlyMap<string, CardState>,
  now: Date,
): number {
  let count = 0;

  for (const card of cards.values()) {
    if (isSameDay(card.introducedAt, now)) count += 1;
  }

  return count;
}

export type ReviewQueueInput = {
  /** Every phrase in the deck, in presentation order — see `PHRASES`. */
  phraseIds: readonly string[];
  /** Saved SRS state, keyed by phrase id. A missing entry means "not seen yet". */
  cards: ReadonlyMap<string, CardState>;
  now: Date;
  newCardsPerDay?: number;
};

/**
 * The session queue for today: everything that came due, then as many unseen
 * phrases as the daily budget still allows.
 *
 * Cards already introduced today count against that budget, so closing and
 * reopening the app does not hand out a second batch of new cards.
 */
export function buildReviewQueue({
  phraseIds,
  cards,
  now,
  newCardsPerDay = DEFAULT_NEW_CARDS_PER_DAY,
}: ReviewQueueInput): QueueItem[] {
  const due: QueueItem[] = [];
  const unseen: string[] = [];

  for (const phraseId of phraseIds) {
    const card = cards.get(phraseId);

    if (!card) {
      unseen.push(phraseId);
    } else if (isDue(card, now)) {
      due.push({ phraseId, kind: "due", card });
    }
  }

  // Longest overdue first; ties keep deck order, because sort is stable.
  due.sort((a, b) => a.card.dueDate.getTime() - b.card.dueDate.getTime());

  const budget = Math.max(
    0,
    newCardsPerDay - countNewCardsIntroducedOn(cards, now),
  );

  const fresh: QueueItem[] = unseen
    .slice(0, budget)
    .map((phraseId) => ({
      phraseId,
      kind: "new",
      card: createCard(phraseId, now),
    }));

  return [...due, ...fresh];
}
