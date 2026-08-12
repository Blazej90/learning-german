"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PHRASE_IDS } from "@/data/phrases";
import {
  bucketReviewsByDay,
  historyStart,
  type DayBucket,
} from "@/features/dashboard/review-history";
import { buildReviewQueue } from "@/features/srs";
import { fetchCards, fetchReviewDates } from "@/lib/firebase/cards";
import { useAuth } from "@/features/auth/auth-provider";

export type DashboardStatus = "loading" | "ready" | "error";

export type Dashboard = {
  status: DashboardStatus;
  /** Reference "now", frozen at load so counts and buckets agree. */
  now: Date;
  /** Cards that came due today. */
  dueCount: number;
  /** Unseen phrases today's budget still allows. */
  newCount: number;
  /** Phrases with any saved SRS state — how much of the deck is in play. */
  startedCount: number;
  deckSize: number;
  history: DayBucket[];
  error: string | null;
  reload: () => void;
};

const EMPTY_HISTORY: DayBucket[] = [];

/**
 * Everything the dashboard shows about the flashcards: today's queue split
 * into due and new, and the last 30 days of the review log.
 *
 * The plan side comes from `usePlanTracker`, which already owns that data.
 */
export function useDashboard(): Dashboard {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [now, setNow] = useState(() => new Date());
  const [dueCount, setDueCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [startedCount, setStartedCount] = useState(0);
  const [history, setHistory] = useState<DayBucket[]>(EMPTY_HISTORY);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Discards a load whose account changed or that a reload superseded.
  const loadId = useRef(0);

  const reload = useCallback(() => {
    const currentLoad = ++loadId.current;

    setIsLoading(true);
    setHasFailed(false);
    setError(null);

    if (!uid) return;

    void (async () => {
      const moment = new Date();

      try {
        const [cards, reviewDates] = await Promise.all([
          fetchCards(uid),
          fetchReviewDates(uid, historyStart(moment)),
        ]);

        if (currentLoad !== loadId.current) return;

        const queue = buildReviewQueue({
          phraseIds: PHRASE_IDS,
          cards,
          now: moment,
        });

        setNow(moment);
        setDueCount(queue.filter((item) => item.kind === "due").length);
        setNewCount(queue.filter((item) => item.kind === "new").length);
        setStartedCount(cards.size);
        setHistory(bucketReviewsByDay(reviewDates, moment));
        setIsLoading(false);
      } catch {
        if (currentLoad !== loadId.current) return;

        setHasFailed(true);
        setError(
          "Nie udało się wczytać postępów z chmury. Sprawdź połączenie i spróbuj ponownie.",
        );
        setIsLoading(false);
      }
    })();
  }, [uid]);

  // Firestore is browser-only and both reads are async, so this runs after
  // mount — one extra render on entry, which `set-state-in-effect` warns about.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  return {
    status: hasFailed ? "error" : isLoading ? "loading" : "ready",
    now,
    dueCount,
    newCount,
    startedCount,
    deckSize: PHRASE_IDS.length,
    history,
    error,
    reload,
  };
}
