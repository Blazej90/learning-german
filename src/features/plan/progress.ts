/**
 * Where you are in the 4-week plan, and how much of it is done.
 *
 * Pure functions over `planStartDate` and the saved day documents — no React,
 * no Firebase. The plan is a calendar, so every comparison goes through the
 * local-day helpers in `features/srs/date`: "today" has to follow the user's
 * midnight, otherwise the streak breaks for anyone reviewing late at night.
 */

import { DAYS_PER_WEEK, STUDY_DAYS } from "@/data/study-plan";
import { addDays, daysBetween, startOfDay } from "@/features/srs";
import { STUDY_TASK_IDS, type StudyTaskId } from "@/types/content";

export type DayTasks = Record<StudyTaskId, boolean>;

export type DayProgress = {
  /** "w1-d3" — matches `users/{uid}/planProgress/{dayId}`. */
  dayId: string;
  tasks: DayTasks;
  /** When the third task was ticked; `null` while the day is unfinished. */
  completedAt: Date | null;
};

export type PlanProgress = ReadonlyMap<string, DayProgress>;

export const TOTAL_PLAN_DAYS = STUDY_DAYS.length;

/** Task slots in one week — the denominator of its completion percentage. */
export const TASKS_PER_WEEK = DAYS_PER_WEEK * STUDY_TASK_IDS.length;

export const NO_TASKS_DONE: DayTasks = {
  grammar: false,
  phrases: false,
  listening: false,
};

export function tasksOfDay(progress: PlanProgress, dayId: string): DayTasks {
  return progress.get(dayId)?.tasks ?? NO_TASKS_DONE;
}

export function countDoneTasks(tasks: DayTasks): number {
  return STUDY_TASK_IDS.filter((taskId) => tasks[taskId]).length;
}

export function isDayComplete(tasks: DayTasks): boolean {
  return countDoneTasks(tasks) === STUDY_TASK_IDS.length;
}

/** One tick is enough to keep the streak alive — see `computeStreak`. */
export function isDayTouched(tasks: DayTasks): boolean {
  return countDoneTasks(tasks) > 0;
}

/** The calendar date a plan day falls on. Day 1 is `planStart` itself. */
export function dateOfPlanDay(planStart: Date, dayOfPlan: number): Date {
  return startOfDay(addDays(startOfDay(planStart), dayOfPlan - 1));
}

/**
 * Which day of the plan `now` is.
 *
 * Deliberately unclamped: values above `TOTAL_PLAN_DAYS` mean the four weeks
 * are behind you, and callers need to tell that apart from "day 28".
 */
export function currentDayOfPlan(planStart: Date, now: Date): number {
  return daysBetween(planStart, now) + 1;
}

export function isFutureDay(
  dayOfPlan: number,
  planStart: Date,
  now: Date,
): boolean {
  return dayOfPlan > currentDayOfPlan(planStart, now);
}

export type Completion = {
  done: number;
  total: number;
  /** 0–100, rounded — for the progress bar and its label. */
  percent: number;
};

function completionOf(done: number, total: number): Completion {
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

export function weekCompletion(
  progress: PlanProgress,
  week: number,
): Completion {
  const done = STUDY_DAYS.filter((day) => day.week === week).reduce(
    (total, day) => total + countDoneTasks(tasksOfDay(progress, day.id)),
    0,
  );

  return completionOf(done, TASKS_PER_WEEK);
}

export function planCompletion(progress: PlanProgress): Completion {
  const done = STUDY_DAYS.reduce(
    (total, day) => total + countDoneTasks(tasksOfDay(progress, day.id)),
    0,
  );

  return completionOf(done, TOTAL_PLAN_DAYS * STUDY_TASK_IDS.length);
}

/** `STUDY_DAYS` is ordered by `dayOfPlan`, so the id format stays in one file. */
function planDayId(dayOfPlan: number): string {
  return STUDY_DAYS[dayOfPlan - 1]?.id ?? "";
}

/**
 * Consecutive plan days ending today on which at least one task was ticked.
 *
 * Two rules make the number honest rather than flattering:
 * an untouched *today* does not break the streak (the day is not over yet),
 * but an untouched yesterday does — nothing else can rescue it. Any single
 * task counts, because a day where you only listened still kept the habit.
 */
export function computeStreak(
  progress: PlanProgress,
  planStart: Date,
  now: Date,
): number {
  const today = currentDayOfPlan(planStart, now);
  if (today < 1) return 0;

  let day = Math.min(today, TOTAL_PLAN_DAYS);

  // The grace day applies only when the plan is still running; once it is over,
  // the last day stands or falls on what was actually ticked.
  if (today <= TOTAL_PLAN_DAYS && !isDayTouched(tasksOfDay(progress, planDayId(day)))) {
    day -= 1;
  }

  let streak = 0;

  while (day >= 1 && isDayTouched(tasksOfDay(progress, planDayId(day)))) {
    streak += 1;
    day -= 1;
  }

  return streak;
}
