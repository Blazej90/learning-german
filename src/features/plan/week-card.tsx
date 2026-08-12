"use client";

import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { STUDY_TASK_LABELS } from "@/data/study-plan";
import {
  dateOfPlanDay,
  isDayComplete,
  isFutureDay,
  tasksOfDay,
  weekCompletion,
  type PlanProgress,
} from "@/features/plan/progress";
import { isSameDay } from "@/features/srs";
import { cn } from "@/lib/utils";
import {
  STUDY_TASK_IDS,
  type StudyDay,
  type StudyTaskId,
  type StudyWeek,
} from "@/types/content";

const DAY_FORMAT = new Intl.DateTimeFormat("pl-PL", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export type WeekCardProps = {
  week: StudyWeek;
  days: readonly StudyDay[];
  progress: PlanProgress;
  planStart: Date;
  now: Date;
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggleTask: (dayId: string, taskId: StudyTaskId) => void;
};

/**
 * One week of the plan: the three recurring tasks, the weekly milestone, and a
 * checklist for its seven days. Collapsed unless it is the week you are in.
 */
export function WeekCard({
  week,
  days,
  progress,
  planStart,
  now,
  isOpen,
  onToggleOpen,
  onToggleTask,
}: WeekCardProps) {
  const completion = weekCompletion(progress, week.week);
  const panelId = `week-${week.week}-days`;
  const isCurrent = days.some((day) =>
    isSameDay(dateOfPlanDay(planStart, day.dayOfPlan), now),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <button
            type="button"
            onClick={onToggleOpen}
            aria-expanded={isOpen}
            aria-controls={panelId}
            className="flex w-full items-center gap-2 text-left"
          >
            <ChevronRight
              aria-hidden
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                isOpen && "rotate-90",
              )}
            />
            <span>
              Tydzień {week.week} — {week.title}
            </span>
            {isCurrent ? <Badge>Ten tydzień</Badge> : null}
            <span className="ml-auto text-sm font-normal text-muted-foreground tabular-nums">
              {completion.percent}%
            </span>
          </button>
        </CardTitle>
        <CardDescription>{week.goal}</CardDescription>
        <Progress
          value={completion.percent}
          aria-label={`Ukończenie tygodnia ${week.week}`}
          className="mt-2"
        />
      </CardHeader>

      {isOpen ? (
        <CardContent id={panelId} className="flex flex-col gap-5">
          <dl className="grid gap-3 sm:grid-cols-3">
            {STUDY_TASK_IDS.map((taskId) => (
              <div key={taskId}>
                <dt className="font-medium">{STUDY_TASK_LABELS[taskId]}</dt>
                <dd className="text-muted-foreground">
                  {week.dailyTasks[taskId]}
                </dd>
              </div>
            ))}
          </dl>

          {week.milestone ? (
            <p className="rounded-lg bg-muted px-3 py-2 text-muted-foreground">
              <span className="font-medium text-foreground">
                Cel tygodnia:{" "}
              </span>
              {week.milestone}
            </p>
          ) : null}

          <ul className="divide-y divide-border">
            {days.map((day) => (
              <DayRow
                key={day.id}
                day={day}
                planStart={planStart}
                now={now}
                progress={progress}
                onToggleTask={onToggleTask}
              />
            ))}
          </ul>
        </CardContent>
      ) : null}
    </Card>
  );
}

type DayRowProps = {
  day: StudyDay;
  planStart: Date;
  now: Date;
  progress: PlanProgress;
  onToggleTask: (dayId: string, taskId: StudyTaskId) => void;
};

function DayRow({ day, planStart, now, progress, onToggleTask }: DayRowProps) {
  const date = dateOfPlanDay(planStart, day.dayOfPlan);
  const tasks = tasksOfDay(progress, day.id);
  const isToday = isSameDay(date, now);
  // Days that have not arrived yet stay locked: a plan you can tick ahead of
  // time stops saying anything about what you actually did.
  const isFuture = isFutureDay(day.dayOfPlan, planStart, now);

  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-x-6 gap-y-2 py-3",
        isFuture && "opacity-60",
      )}
    >
      <div className="min-w-28">
        <span className="flex items-center gap-2 font-medium">
          Dzień {day.dayOfPlan}
          {isToday ? <Badge variant="secondary">dziś</Badge> : null}
          {isDayComplete(tasks) ? (
            <span className="sr-only">— dzień ukończony</span>
          ) : null}
        </span>
        <span className="block text-xs text-muted-foreground">
          {DAY_FORMAT.format(date)}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {STUDY_TASK_IDS.map((taskId) => {
          const inputId = `${day.id}-${taskId}`;

          return (
            <div key={taskId} className="flex items-center gap-2">
              <Checkbox
                id={inputId}
                checked={tasks[taskId]}
                disabled={isFuture}
                onCheckedChange={() => onToggleTask(day.id, taskId)}
              />
              <Label
                htmlFor={inputId}
                className={cn(
                  "font-normal",
                  isFuture ? "cursor-not-allowed" : "cursor-pointer",
                  tasks[taskId] && "text-muted-foreground line-through",
                )}
              >
                {STUDY_TASK_LABELS[taskId]}
              </Label>
            </div>
          );
        })}
      </div>
    </li>
  );
}
