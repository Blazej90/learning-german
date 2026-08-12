"use client";

import { useCallback, useEffect, useState } from "react";

import { loadCards, saveCards } from "@/features/flashcards/storage";
import {
  buildReviewQueue,
  schedule,
  type CardState,
  type QueueItem,
  type RatingId,
} from "@/features/srs";

/** A queue entry, plus whether it is a second attempt within this session. */
export type SessionItem = QueueItem & { repeat: boolean };

export type SessionSummary = Record<RatingId, number>;

const EMPTY_SUMMARY: SessionSummary = { again: 0, hard: 0, good: 0, easy: 0 };

export type ReviewSessionStatus = "loading" | "reviewing" | "finished";

export type ReviewSession = {
  status: ReviewSessionStatus;
  /** The card on screen; `null` once the queue runs out. */
  current: SessionItem | null;
  isRevealed: boolean;
  /** How many cards have been graded, including repeats. */
  answered: number;
  /** Length of the live queue — grows when a card is failed and comes back. */
  total: number;
  /** Queue length at session start, i.e. distinct cards planned for today. */
  plannedCount: number;
  /** First answer per card, so a repeat does not count twice. */
  summary: SessionSummary;
  reveal: () => void;
  grade: (rating: RatingId) => void;
  restart: () => void;
};

/**
 * Drives one review session over `phraseIds`, persisting each answer.
 *
 * A failed card is pushed back onto the end of today's queue. That is a session
 * decision, not an SM-2 one: the engine already books it for tomorrow, but a
 * card you just failed and never saw again would leave the session having
 * taught nothing.
 */
export function useReviewSession(phraseIds: readonly string[]): ReviewSession {
  const [cards, setCards] = useState<ReadonlyMap<string, CardState>>(
    () => new Map(),
  );
  const [queue, setQueue] = useState<SessionItem[]>([]);
  const [index, setIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [summary, setSummary] = useState<SessionSummary>(EMPTY_SUMMARY);
  const [plannedCount, setPlannedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const restart = useCallback(() => {
    const saved = loadCards();
    const items: SessionItem[] = buildReviewQueue({
      phraseIds,
      cards: saved,
      now: new Date(),
    }).map((item) => ({ ...item, repeat: false }));

    setCards(saved);
    setQueue(items);
    setPlannedCount(items.length);
    setIndex(0);
    setIsRevealed(false);
    setSummary(EMPTY_SUMMARY);
    setIsLoading(false);
  }, [phraseIds]);

  // localStorage only exists in the browser, so the queue is built after mount.
  // That means one extra render on entry, which `set-state-in-effect` warns
  // about; the alternative — reading storage while rendering — would make the
  // prerendered markup disagree with the browser's on hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    restart();
  }, [restart]);

  const reveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const grade = useCallback(
    (rating: RatingId) => {
      const item = queue[index];
      if (!item) return;

      const updated = schedule(item.card, rating, new Date());

      const nextCards = new Map(cards);
      nextCards.set(item.phraseId, updated);
      saveCards(nextCards);
      setCards(nextCards);

      if (!item.repeat) {
        setSummary((previous) => ({
          ...previous,
          [rating]: previous[rating] + 1,
        }));
      }

      if (rating === "again") {
        setQueue((previous) => [
          ...previous,
          { ...item, card: updated, repeat: true },
        ]);
      }

      setIndex((previous) => previous + 1);
      setIsRevealed(false);
    },
    [cards, index, queue],
  );

  const current = queue[index] ?? null;

  return {
    status: isLoading ? "loading" : current ? "reviewing" : "finished",
    current,
    isRevealed,
    answered: index,
    total: queue.length,
    plannedCount,
    summary,
    reveal,
    grade,
    restart,
  };
}
