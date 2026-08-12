"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/features/auth/auth-provider";
import { fetchCards, logReview, saveCard } from "@/lib/firebase/cards";
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

export type ReviewSessionStatus =
  | "loading"
  | "reviewing"
  | "finished"
  /** The deck could not be read — reviewing now would grade against nothing. */
  | "error";

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
  /** Sync problem worth showing; the session itself keeps working. */
  error: string | null;
  reveal: () => void;
  grade: (rating: RatingId) => void;
  restart: () => void;
};

/**
 * Drives one review session over `phraseIds`, persisting each answer to
 * `users/{uid}/cards` and appending to the review log.
 *
 * A failed card is pushed back onto the end of today's queue. That is a session
 * decision, not an SM-2 one: the engine already books it for tomorrow, but a
 * card you just failed and never saw again would leave the session having
 * taught nothing.
 *
 * Writes are deliberately not awaited. With offline persistence a write is
 * durable in IndexedDB immediately but its promise only settles once the server
 * acknowledges it — waiting would freeze the session on every weak connection.
 */
export function useReviewSession(phraseIds: readonly string[]): ReviewSession {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [cards, setCards] = useState<ReadonlyMap<string, CardState>>(
    () => new Map(),
  );
  const [queue, setQueue] = useState<SessionItem[]>([]);
  const [index, setIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [summary, setSummary] = useState<SessionSummary>(EMPTY_SUMMARY);
  const [plannedCount, setPlannedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

  // Discards a load whose account changed or that a restart superseded.
  const loadId = useRef(0);

  const restart = useCallback(() => {
    const currentLoad = ++loadId.current;

    setIsLoading(true);
    setHasFailed(false);
    setError(null);

    if (!uid) return;

    void (async () => {
      try {
        const saved = await fetchCards(uid);
        if (currentLoad !== loadId.current) return;

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
      } catch {
        if (currentLoad !== loadId.current) return;

        setHasFailed(true);
        setError(
          "Nie udało się wczytać fiszek z chmury. Sprawdź połączenie i spróbuj ponownie.",
        );
        setIsLoading(false);
      }
    })();
  }, [phraseIds, uid]);

  // Firestore is browser-only and the read is async, so the queue is built
  // after mount. That means one extra render on entry, which
  // `set-state-in-effect` warns about; the alternative — reading during render
  // — is not available for a promise.
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
      if (!item || !uid) return;

      const now = new Date();
      const updated = schedule(item.card, rating, now);

      const nextCards = new Map(cards);
      nextCards.set(item.phraseId, updated);
      setCards(nextCards);

      const reportSyncFailure = () => {
        setError(
          "Ocena nie zapisała się w chmurze. Zaloguj się ponownie i powtórz tę fiszkę.",
        );
      };

      // Offline these promises simply stay pending, so a rejection here means a
      // real refusal (expired session, rules) — worth telling the user about.
      void saveCard(uid, updated).catch(reportSyncFailure);
      void logReview(uid, {
        phraseId: item.phraseId,
        rating,
        reviewedAt: now,
        previousInterval: item.card.interval,
      }).catch(reportSyncFailure);

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
    [cards, index, queue, uid],
  );

  const current = queue[index] ?? null;

  const status: ReviewSessionStatus = hasFailed
    ? "error"
    : isLoading
      ? "loading"
      : current
        ? "reviewing"
        : "finished";

  return {
    status,
    current,
    isRevealed,
    answered: index,
    total: queue.length,
    plannedCount,
    summary,
    error,
    reveal,
    grade,
    restart,
  };
}
