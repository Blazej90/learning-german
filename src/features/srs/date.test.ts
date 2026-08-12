import { describe, expect, it } from "vitest";

import {
  addDays,
  daysBetween,
  isSameDay,
  startOfDay,
} from "@/features/srs/date";

describe("startOfDay", () => {
  it("strips the time while keeping the local calendar day", () => {
    const result = startOfDay(new Date(2026, 7, 12, 23, 47, 31, 500));

    expect(result).toEqual(new Date(2026, 7, 12, 0, 0, 0, 0));
  });

  it("is idempotent", () => {
    const once = startOfDay(new Date(2026, 7, 12, 9, 30));

    expect(startOfDay(once)).toEqual(once);
  });
});

describe("addDays", () => {
  it("rolls over the end of a month", () => {
    expect(addDays(new Date(2026, 7, 30), 3)).toEqual(new Date(2026, 8, 2));
  });

  it("rolls over the end of a year", () => {
    expect(addDays(new Date(2026, 11, 31), 1)).toEqual(new Date(2027, 0, 1));
  });

  it("handles a leap day", () => {
    expect(addDays(new Date(2028, 1, 28), 1)).toEqual(new Date(2028, 1, 29));
  });

  it("keeps the clock time", () => {
    expect(addDays(new Date(2026, 7, 12, 21, 15), 6)).toEqual(
      new Date(2026, 7, 18, 21, 15),
    );
  });

  it("goes backwards for a negative count", () => {
    expect(addDays(new Date(2026, 7, 1), -1)).toEqual(new Date(2026, 6, 31));
  });
});

describe("daysBetween", () => {
  it("ignores the time of day on both ends", () => {
    const from = new Date(2026, 7, 12, 23, 59);
    const to = new Date(2026, 7, 13, 0, 1);

    expect(daysBetween(from, to)).toBe(1);
  });

  it("is negative when the target is in the past", () => {
    expect(daysBetween(new Date(2026, 7, 12), new Date(2026, 7, 9))).toBe(-3);
  });

  it("survives a daylight-saving change", () => {
    // Late March in Europe: one of these days is 23 hours long, so a naive
    // millisecond division would round to 6 days instead of 7.
    expect(daysBetween(new Date(2026, 2, 25), new Date(2026, 3, 1))).toBe(7);
  });
});

describe("isSameDay", () => {
  it("compares calendar days, not instants", () => {
    expect(
      isSameDay(new Date(2026, 7, 12, 0, 1), new Date(2026, 7, 12, 23, 59)),
    ).toBe(true);
  });

  it("separates adjacent days one minute apart", () => {
    expect(
      isSameDay(new Date(2026, 7, 12, 23, 59), new Date(2026, 7, 13, 0, 0)),
    ).toBe(false);
  });
});
