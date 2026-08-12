import { describe, expect, it } from "vitest";

import { STUDY_DAYS } from "@/data/study-plan";
import {
  computeStreak,
  countDoneTasks,
  currentDayOfPlan,
  dateOfPlanDay,
  isDayComplete,
  isDayTouched,
  isFutureDay,
  NO_TASKS_DONE,
  planCompletion,
  tasksOfDay,
  TASKS_PER_WEEK,
  TOTAL_PLAN_DAYS,
  weekCompletion,
  type DayProgress,
  type DayTasks,
  type PlanProgress,
} from "@/features/plan/progress";
import type { StudyTaskId } from "@/types/content";

/** Plan day 1. All other dates in these tests are relative to it. */
const START = new Date(2026, 7, 12);

function tasks(...done: StudyTaskId[]): DayTasks {
  return {
    grammar: done.includes("grammar"),
    phrases: done.includes("phrases"),
    listening: done.includes("listening"),
  };
}

/** Day id of the n-th day of the plan, straight from the content module. */
function dayId(dayOfPlan: number): string {
  return STUDY_DAYS[dayOfPlan - 1].id;
}

/** Progress map from `{ dayOfPlan: taskIds }` — days left out are untouched. */
function progressOf(
  done: Record<number, readonly StudyTaskId[]>,
): PlanProgress {
  const entries = Object.entries(done).map(([dayOfPlan, taskIds]): [
    string,
    DayProgress,
  ] => {
    const id = dayId(Number(dayOfPlan));

    return [id, { dayId: id, tasks: tasks(...taskIds), completedAt: null }];
  });

  return new Map(entries);
}

/** Every day of the plan, fully ticked. */
function fullyDone(): PlanProgress {
  return progressOf(
    Object.fromEntries(
      STUDY_DAYS.map((day) => [
        day.dayOfPlan,
        ["grammar", "phrases", "listening"] as const,
      ]),
    ),
  );
}

describe("dateOfPlanDay", () => {
  it("puts day 1 on the start date", () => {
    expect(dateOfPlanDay(START, 1)).toEqual(new Date(2026, 7, 12));
  });

  it("advances one calendar day per plan day", () => {
    expect(dateOfPlanDay(START, 8)).toEqual(new Date(2026, 7, 19));
  });

  it("crosses month boundaries", () => {
    expect(dateOfPlanDay(START, TOTAL_PLAN_DAYS)).toEqual(new Date(2026, 8, 8));
  });

  it("ignores the clock time of the start date", () => {
    const eveningStart = new Date(2026, 7, 12, 23, 45);

    expect(dateOfPlanDay(eveningStart, 2)).toEqual(new Date(2026, 7, 13));
  });
});

describe("currentDayOfPlan", () => {
  it("counts the start date as day 1", () => {
    expect(currentDayOfPlan(START, new Date(2026, 7, 12, 9, 0))).toBe(1);
  });

  it("does not roll over before local midnight", () => {
    expect(currentDayOfPlan(START, new Date(2026, 7, 12, 23, 59))).toBe(1);
  });

  it("rolls over at local midnight", () => {
    expect(currentDayOfPlan(START, new Date(2026, 7, 13, 0, 1))).toBe(2);
  });

  it("goes past the end of the plan instead of clamping", () => {
    expect(currentDayOfPlan(START, new Date(2026, 8, 9))).toBe(
      TOTAL_PLAN_DAYS + 1,
    );
  });

  it("is below 1 before the plan starts", () => {
    expect(currentDayOfPlan(START, new Date(2026, 7, 11))).toBe(0);
  });
});

describe("isFutureDay", () => {
  const now = new Date(2026, 7, 15, 10, 0); // plan day 4

  it("does not lock today", () => {
    expect(isFutureDay(4, START, now)).toBe(false);
  });

  it("does not lock a day that has passed", () => {
    expect(isFutureDay(3, START, now)).toBe(false);
  });

  it("locks tomorrow", () => {
    expect(isFutureDay(5, START, now)).toBe(true);
  });
});

describe("task counting", () => {
  it("treats a missing day as nothing done", () => {
    expect(tasksOfDay(new Map(), "w1-d1")).toEqual(NO_TASKS_DONE);
  });

  it("counts the ticked tasks", () => {
    expect(countDoneTasks(tasks("grammar", "listening"))).toBe(2);
  });

  it("calls a day complete only with all three tasks", () => {
    expect(isDayComplete(tasks("grammar", "phrases"))).toBe(false);
    expect(isDayComplete(tasks("grammar", "phrases", "listening"))).toBe(true);
  });

  it("calls a day touched from the first task", () => {
    expect(isDayTouched(NO_TASKS_DONE)).toBe(false);
    expect(isDayTouched(tasks("listening"))).toBe(true);
  });
});

describe("weekCompletion", () => {
  it("is empty for a week nothing has been ticked in", () => {
    expect(weekCompletion(new Map(), 1)).toEqual({
      done: 0,
      total: TASKS_PER_WEEK,
      percent: 0,
    });
  });

  it("counts task slots, not whole days", () => {
    const progress = progressOf({ 1: ["grammar"], 2: ["phrases", "listening"] });

    expect(weekCompletion(progress, 1)).toMatchObject({
      done: 3,
      total: TASKS_PER_WEEK,
    });
  });

  it("ignores days from other weeks", () => {
    const progress = progressOf({ 8: ["grammar", "phrases", "listening"] });

    expect(weekCompletion(progress, 1).done).toBe(0);
    expect(weekCompletion(progress, 2).done).toBe(3);
  });

  it("reaches 100% with every slot of the week ticked", () => {
    expect(weekCompletion(fullyDone(), 3).percent).toBe(100);
  });

  it("rounds the percentage", () => {
    // 1 of 21 slots is 4.76%.
    expect(weekCompletion(progressOf({ 1: ["grammar"] }), 1).percent).toBe(5);
  });
});

describe("planCompletion", () => {
  it("spans all four weeks", () => {
    expect(planCompletion(new Map()).total).toBe(TASKS_PER_WEEK * 4);
  });

  it("sums the weeks", () => {
    const progress = progressOf({ 1: ["grammar"], 8: ["grammar", "phrases"] });

    expect(planCompletion(progress).done).toBe(3);
  });

  it("reaches 100% with the whole plan ticked", () => {
    expect(planCompletion(fullyDone()).percent).toBe(100);
  });
});

describe("computeStreak", () => {
  const dayFour = new Date(2026, 7, 15, 10, 0);

  it("is zero with nothing ticked", () => {
    expect(computeStreak(new Map(), START, dayFour)).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    const progress = progressOf({
      2: ["grammar"],
      3: ["grammar"],
      4: ["grammar"],
    });

    expect(computeStreak(progress, START, dayFour)).toBe(3);
  });

  it("keeps the streak alive on a today that is still untouched", () => {
    const progress = progressOf({ 2: ["grammar"], 3: ["grammar"] });

    expect(computeStreak(progress, START, dayFour)).toBe(2);
  });

  it("breaks on an untouched yesterday", () => {
    const progress = progressOf({ 1: ["grammar"], 2: ["grammar"], 4: ["grammar"] });

    expect(computeStreak(progress, START, dayFour)).toBe(1);
  });

  it("keeps a single task enough to hold the streak", () => {
    const progress = progressOf({ 3: ["listening"], 4: ["listening"] });

    expect(computeStreak(progress, START, dayFour)).toBe(2);
  });

  it("stops at day 1 of the plan", () => {
    const progress = progressOf({ 1: ["grammar"], 2: ["grammar"] });

    expect(computeStreak(progress, START, new Date(2026, 7, 13, 8, 0))).toBe(2);
  });

  it("is zero before the plan starts", () => {
    expect(computeStreak(fullyDone(), START, new Date(2026, 7, 11))).toBe(0);
  });

  it("keeps the streak from the last plan day once the plan is over", () => {
    const afterPlan = new Date(2026, 8, 9); // day 29

    expect(computeStreak(fullyDone(), START, afterPlan)).toBe(TOTAL_PLAN_DAYS);
  });

  it("gives no grace day once the plan is over", () => {
    const progress = progressOf({ 26: ["grammar"], 27: ["grammar"] });
    const afterPlan = new Date(2026, 8, 9); // day 29, day 28 never ticked

    expect(computeStreak(progress, START, afterPlan)).toBe(0);
  });
});
