"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/features/auth/auth-provider";
import {
  computeStreak,
  currentDayOfPlan,
  isDayComplete,
  planCompletion,
  tasksOfDay,
  type Completion,
  type DayProgress,
  type PlanProgress,
} from "@/features/plan/progress";
import { startOfDay } from "@/features/srs";
import { fetchPlanProgress, saveDayTasks } from "@/lib/firebase/plan";
import { fetchPlanStartDate, setPlanStartDate } from "@/lib/firebase/user";
import type { StudyTaskId } from "@/types/content";

export type PlanTrackerStatus =
  | "loading"
  /** Signed in, but `planStartDate` has never been written. */
  | "not-started"
  | "ready"
  /** The plan could not be read — ticking now would grade against nothing. */
  | "error";

export type PlanTracker = {
  status: PlanTrackerStatus;
  planStart: Date | null;
  /** Reference "now", frozen at load so the day numbers stay stable. */
  now: Date;
  /** Day of the plan today is; may exceed 28 once the four weeks are over. */
  today: number;
  streak: number;
  completion: Completion;
  progress: PlanProgress;
  /** Sync problem worth showing; the checklist itself keeps working. */
  error: string | null;
  toggleTask: (dayId: string, taskId: StudyTaskId) => void;
  startPlan: () => void;
  reload: () => void;
};

const EMPTY_PROGRESS: PlanProgress = new Map<string, DayProgress>();

/**
 * Reads `planStartDate` and `users/{uid}/planProgress`, and writes back each
 * ticked box.
 *
 * Writes are fired without awaiting, exactly as in the review session: with
 * offline persistence the write is durable in IndexedDB immediately, while the
 * promise waits for the server — so a rejection means a real refusal.
 */
export function usePlanTracker(): PlanTracker {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [planStart, setPlanStart] = useState<Date | null>(null);
  const [progress, setProgress] = useState<PlanProgress>(EMPTY_PROGRESS);
  const [now, setNow] = useState(() => new Date());
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
      try {
        const [startDate, saved] = await Promise.all([
          fetchPlanStartDate(uid),
          fetchPlanProgress(uid),
        ]);

        if (currentLoad !== loadId.current) return;

        setPlanStart(startDate);
        setProgress(saved);
        setNow(new Date());
        setIsLoading(false);
      } catch {
        if (currentLoad !== loadId.current) return;

        setHasFailed(true);
        setError(
          "Nie udało się wczytać planu z chmury. Sprawdź połączenie i spróbuj ponownie.",
        );
        setIsLoading(false);
      }
    })();
  }, [uid]);

  // Firestore is browser-only and the read is async, so the plan is loaded
  // after mount — one extra render on entry, which `set-state-in-effect` warns
  // about; reading a promise during render is not an option.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  const startPlan = useCallback(() => {
    if (!uid) return;

    const today = startOfDay(new Date());

    setPlanStart(today);
    setNow(new Date());
    setError(null);

    void setPlanStartDate(uid, today).catch(() => {
      setError(
        "Nie udało się zapisać startu planu. Zaloguj się ponownie i spróbuj jeszcze raz.",
      );
    });
  }, [uid]);

  const toggleTask = useCallback(
    (dayId: string, taskId: StudyTaskId) => {
      if (!uid) return;

      const moment = new Date();
      const tasks = { ...tasksOfDay(progress, dayId) };
      tasks[taskId] = !tasks[taskId];

      const next = new Map(progress);
      next.set(dayId, {
        dayId,
        tasks,
        // Mirrors what `saveDayTasks` is about to write, so the local state and
        // the document agree without waiting for a round trip.
        completedAt: isDayComplete(tasks) ? moment : null,
      });
      setProgress(next);

      void saveDayTasks(uid, dayId, tasks, moment).catch(() => {
        setError(
          "Odhaczenie nie zapisało się w chmurze. Zaloguj się ponownie i sprawdź ten dzień.",
        );
      });
    },
    [progress, uid],
  );

  const status: PlanTrackerStatus = hasFailed
    ? "error"
    : isLoading
      ? "loading"
      : planStart
        ? "ready"
        : "not-started";

  return {
    status,
    planStart,
    now,
    today: planStart ? currentDayOfPlan(planStart, now) : 0,
    streak: planStart ? computeStreak(progress, planStart, now) : 0,
    completion: planCompletion(progress),
    progress,
    error,
    toggleTask,
    startPlan,
    reload,
  };
}
