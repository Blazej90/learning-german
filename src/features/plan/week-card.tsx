"use client";

import {
  ChevronRight,
  GraduationCap,
  Headphones,
  MessageSquareQuote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

/**
 * One icon per task, so a day's state reads as three marks rather than three
 * lines of text. The words still reach screen readers through `aria-label`,
 * and they are spelled out in full above the checklist.
 */
const TASK_ICONS: Record<StudyTaskId, LucideIcon> = {
  grammar: GraduationCap,
  phrases: MessageSquareQuote,
  listening: Headphones,
};

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
            // The whole header row is the target, and it clears 44px — the
            // chevron alone was a 16px mark to aim a thumb at.
            className="-my-1 flex min-h-11 w-full items-center gap-2 py-1 text-left"
          >
            <ChevronRight
              aria-hidden
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
                isOpen && "rotate-90",
              )}
            />
            <span className="min-w-0 flex-1 truncate">
              Tydzień {week.week} — {week.title}
            </span>
            {isCurrent ? <Badge>Ten tydzień</Badge> : null}
            <span className="text-sm font-normal text-muted-foreground tabular-nums">
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
            {STUDY_TASK_IDS.map((taskId) => {
              const Icon = TASK_ICONS[taskId];

              return (
                <div key={taskId}>
                  <dt className="flex items-center gap-1.5 font-medium">
                    <Icon aria-hidden className="size-4 text-muted-foreground" />
                    {STUDY_TASK_LABELS[taskId]}
                  </dt>
                  <dd className="text-muted-foreground">
                    {week.dailyTasks[taskId]}
                  </dd>
                </div>
              );
            })}
          </dl>

          {week.milestone ? (
            <p className="rounded-lg bg-muted px-3 py-2 text-muted-foreground">
              <span className="font-medium text-foreground">
                Cel tygodnia:{" "}
              </span>
              {week.milestone}
            </p>
          ) : null}

          <ul className="flex flex-col gap-1">
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
  const isComplete = isDayComplete(tasks);
  // Days that have not arrived yet stay locked: a plan you can tick ahead of
  // time stops saying anything about what you actually did.
  const isFuture = isFutureDay(day.dayOfPlan, planStart, now);

  return (
    <li
      className={cn(
        "-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5",
        isToday && "ring-1 ring-primary/40",
        isComplete && "bg-primary/5",
        isFuture && "opacity-55",
      )}
    >
      <div className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-medium">
          Dzień {day.dayOfPlan}
          {isToday ? <Badge variant="secondary">dziś</Badge> : null}
          {isComplete ? <span className="sr-only">— dzień ukończony</span> : null}
        </span>
        <span className="block text-xs text-muted-foreground">
          {DAY_FORMAT.format(date)}
        </span>
      </div>

      {/* Three square toggles instead of three checkbox-and-label pairs: those
          wrapped onto three lines per day, which on a phone turned four weeks
          into a wall of text. */}
      <div className="flex shrink-0 gap-1.5">
        {STUDY_TASK_IDS.map((taskId) => (
          <TaskToggle
            key={taskId}
            taskId={taskId}
            isDone={tasks[taskId]}
            isDisabled={isFuture}
            dayOfPlan={day.dayOfPlan}
            onToggle={() => onToggleTask(day.id, taskId)}
          />
        ))}
      </div>
    </li>
  );
}

/**
 * A task as a toggle button rather than a checkbox.
 *
 * `aria-pressed` is the right shape for a control whose entire label is an
 * icon — it announces "Gramatyka, wciśnięty" without needing a visible text
 * label sitting next to it.
 */
function TaskToggle({
  taskId,
  isDone,
  isDisabled,
  dayOfPlan,
  onToggle,
}: {
  taskId: StudyTaskId;
  isDone: boolean;
  isDisabled: boolean;
  dayOfPlan: number;
  onToggle: () => void;
}) {
  const Icon = TASK_ICONS[taskId];

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled}
      aria-pressed={isDone}
      aria-label={`${STUDY_TASK_LABELS[taskId]}, dzień ${dayOfPlan}`}
      title={STUDY_TASK_LABELS[taskId]}
      className={cn(
        "flex size-11 items-center justify-center rounded-lg border transition-colors",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        isDone
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-transparent text-muted-foreground",
        isDisabled ? "cursor-not-allowed" : "hover:border-primary/50",
      )}
    >
      <Icon aria-hidden className="size-5" />
    </button>
  );
}
