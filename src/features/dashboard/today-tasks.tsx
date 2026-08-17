"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getStudyWeek, STUDY_TASK_LABELS } from "@/data/study-plan";
import { tasksOfDay, TOTAL_PLAN_DAYS } from "@/features/plan/progress";
import type { PlanTracker } from "@/features/plan/use-plan-tracker";
import { STUDY_DAYS } from "@/data/study-plan";
import { STUDY_TASK_IDS } from "@/types/content";
import { cn } from "@/lib/utils";

/**
 * Today's three tasks, tickable without leaving the dashboard.
 *
 * The state comes from the same `usePlanTracker` the `/plan` page uses, so a
 * box ticked here is the same document — there is no second source of truth.
 */
export function TodayTasks({ plan }: { plan: PlanTracker }) {
  if (plan.status === "not-started" || !plan.planStart) {
    return (
      <section className="flex flex-col items-start gap-3">
        <h2 className="font-medium">Zadania na dziś</h2>
        <p className="text-sm text-muted-foreground">
          Plan czterech tygodni jeszcze nie wystartował.
        </p>
        <Button
          render={<Link href="/plan" />}
          nativeButton={false}
          variant="outline"
          size="touch"
        >
          Zacznij plan
        </Button>
      </section>
    );
  }

  const day = STUDY_DAYS[plan.today - 1];
  const week = day ? getStudyWeek(day.week) : undefined;

  if (!day || !week) {
    return (
      <section className="flex flex-col items-start gap-3">
        <h2 className="font-medium">Zadania na dziś</h2>
        <p className="text-sm text-muted-foreground">
          Plan zakończony — {TOTAL_PLAN_DAYS} dni za Tobą. Zostaje codzienne
          słuchanie i powtórki.
        </p>
      </section>
    );
  }

  const tasks = tasksOfDay(plan.progress, day.id);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 className="font-medium">Zadania na dziś</h2>
        <Link
          href="/plan"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Cały plan →
        </Link>
      </div>

      <ul className="flex flex-col gap-1">
        {STUDY_TASK_IDS.map((taskId) => {
          const inputId = `today-${taskId}`;

          return (
            <li
              key={taskId}
              className="-mx-2 flex items-start gap-3 rounded-lg px-2 py-2 transition-colors active:bg-muted"
            >
              <Checkbox
                id={inputId}
                className="mt-0.5 size-6"
                checked={tasks[taskId]}
                onCheckedChange={() => plan.toggleTask(day.id, taskId)}
              />
              {/* The label carries the description too, so the tap target is
                  the whole row rather than the few words of the title. */}
              <Label
                htmlFor={inputId}
                className={cn(
                  "flex flex-1 cursor-pointer flex-col items-start gap-0.5 font-normal",
                  tasks[taskId] && "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "font-medium transition-colors",
                    tasks[taskId] && "text-muted-foreground line-through",
                  )}
                >
                  {STUDY_TASK_LABELS[taskId]}
                </span>
                <span className="text-left text-sm text-muted-foreground">
                  {week.dailyTasks[taskId]}
                </span>
              </Label>
            </li>
          );
        })}
      </ul>

      {week.milestone ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Cel tygodnia: </span>
          {week.milestone}
        </p>
      ) : null}
    </section>
  );
}
