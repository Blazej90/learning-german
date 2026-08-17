"use client";

import { useState } from "react";
import { Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DAYS_PER_WEEK, getStudyDays, STUDY_WEEKS } from "@/data/study-plan";
import { TOTAL_PLAN_DAYS } from "@/features/plan/progress";
import { usePlanTracker } from "@/features/plan/use-plan-tracker";
import { WeekCard } from "@/features/plan/week-card";

const START_FORMAT = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Which week a plan day belongs to, clamped to the four weeks of the plan. */
function weekOfDay(dayOfPlan: number): number {
  const week = Math.ceil(dayOfPlan / DAYS_PER_WEEK);

  return Math.min(Math.max(week, 1), STUDY_WEEKS.length);
}

export function PlanTracker() {
  const tracker = usePlanTracker();

  // `null` means "follow the week I'm in"; `0` means the user closed it and
  // wants nothing expanded. Only one week is open at a time.
  const [openWeek, setOpenWeek] = useState<number | null>(null);

  if (tracker.status === "loading") {
    return (
      <p className="text-muted-foreground" role="status">
        Wczytuję plan…
      </p>
    );
  }

  if (tracker.status === "error") {
    return (
      <div className="flex flex-col items-start gap-4">
        <p role="alert" className="text-destructive">
          {tracker.error}
        </p>
        <Button onClick={tracker.reload}>Spróbuj ponownie</Button>
      </div>
    );
  }

  if (tracker.status === "not-started" || !tracker.planStart) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="max-w-prose text-muted-foreground">
          Plan trwa {TOTAL_PLAN_DAYS} dni: {STUDY_WEEKS.length} tygodnie po trzy
          zadania dziennie — gramatyka, zwroty i słuchanie. Dzień pierwszy to
          dzień, w którym go zaczniesz.
        </p>
        <Button size="touch" onClick={tracker.startPlan}>
          Zacznij plan dzisiaj
        </Button>
        {tracker.error ? (
          <p role="alert" className="text-sm text-destructive">
            {tracker.error}
          </p>
        ) : null}
      </div>
    );
  }

  const { today, streak, completion, planStart, now, progress } = tracker;
  const isFinished = today > TOTAL_PLAN_DAYS;
  const currentWeek = weekOfDay(today);
  const activeWeek = openWeek ?? currentWeek;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold tracking-tight">
              {isFinished
                ? "Plan zakończony"
                : `Dzień ${today} z ${TOTAL_PLAN_DAYS}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {isFinished
                ? "Cztery tygodnie za Tobą — zostaje rytm powtórek."
                : `Tydzień ${currentWeek} — ${STUDY_WEEKS[currentWeek - 1].title}`}
              {" · start "}
              {START_FORMAT.format(planStart)}
            </p>
          </div>

          <div className="text-right">
            <p className="flex items-center justify-end gap-1.5 text-2xl font-semibold tabular-nums">
              <Flame aria-hidden className="size-5 text-muted-foreground" />
              {streak}
            </p>
            <p className="text-sm text-muted-foreground">
              {streak === 1 ? "dzień z rzędu" : "dni z rzędu"}
            </p>
          </div>
        </div>

        <Progress value={completion.percent} aria-label="Ukończenie planu">
          <span className="text-sm text-muted-foreground">
            {completion.done} z {completion.total} zadań ({completion.percent}%)
          </span>
        </Progress>

        {/* Zapis offline trafia do pamięci podręcznej i wyjdzie później, więc ten
            komunikat pojawia się tylko przy realnej odmowie zapisu. */}
        {tracker.error ? (
          <p role="alert" className="text-sm text-destructive">
            {tracker.error}
          </p>
        ) : null}
      </section>

      <div className="flex flex-col gap-4">
        {STUDY_WEEKS.map((week) => (
          <WeekCard
            key={week.week}
            week={week}
            days={getStudyDays(week.week)}
            progress={progress}
            planStart={planStart}
            now={now}
            isOpen={activeWeek === week.week}
            onToggleOpen={() =>
              setOpenWeek(activeWeek === week.week ? 0 : week.week)
            }
            onToggleTask={tracker.toggleTask}
          />
        ))}
      </div>
    </div>
  );
}
