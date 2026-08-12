import { describe, expect, it } from "vitest";

import {
  bucketReviewsByDay,
  busiestDay,
  historyStart,
  REVIEW_HISTORY_DAYS,
  totalReviews,
} from "@/features/dashboard/review-history";

const NOW = new Date(2026, 7, 12, 14, 30);

describe("historyStart", () => {
  it("counts today as the last day of the window", () => {
    expect(historyStart(NOW, 7)).toEqual(new Date(2026, 7, 6));
  });

  it("spans 30 days by default", () => {
    expect(historyStart(NOW)).toEqual(new Date(2026, 6, 14));
  });
});

describe("bucketReviewsByDay", () => {
  it("returns one bucket per day, oldest first", () => {
    const buckets = bucketReviewsByDay([], NOW);

    expect(buckets).toHaveLength(REVIEW_HISTORY_DAYS);
    expect(buckets[0].date).toEqual(new Date(2026, 6, 14));
    expect(buckets[REVIEW_HISTORY_DAYS - 1].date).toEqual(new Date(2026, 7, 12));
  });

  it("keeps empty days instead of dropping them", () => {
    const buckets = bucketReviewsByDay([new Date(2026, 7, 12, 8, 0)], NOW, 3);

    expect(buckets.map((bucket) => bucket.count)).toEqual([0, 0, 1]);
  });

  it("counts several reviews on the same day into one bucket", () => {
    const reviews = [
      new Date(2026, 7, 11, 7, 0),
      new Date(2026, 7, 11, 21, 0),
      new Date(2026, 7, 11, 23, 59),
    ];

    expect(bucketReviewsByDay(reviews, NOW, 3)[1].count).toBe(3);
  });

  it("puts a late-night review on its own local day", () => {
    // 23:30 belongs to the evening it happened, not to the next day.
    const buckets = bucketReviewsByDay([new Date(2026, 7, 10, 23, 30)], NOW, 3);

    expect(buckets.map((bucket) => bucket.count)).toEqual([1, 0, 0]);
  });

  it("ignores reviews older than the window", () => {
    const buckets = bucketReviewsByDay([new Date(2026, 7, 9, 12, 0)], NOW, 3);

    expect(totalReviews(buckets)).toBe(0);
  });

  it("ignores timestamps from the future", () => {
    const buckets = bucketReviewsByDay([new Date(2026, 7, 13, 1, 0)], NOW, 3);

    expect(totalReviews(buckets)).toBe(0);
  });
});

describe("busiestDay", () => {
  it("is null when nothing was reviewed", () => {
    expect(busiestDay(bucketReviewsByDay([], NOW))).toBeNull();
  });

  it("finds the day with the most reviews", () => {
    const reviews = [
      new Date(2026, 7, 10, 9, 0),
      new Date(2026, 7, 11, 9, 0),
      new Date(2026, 7, 11, 10, 0),
    ];

    expect(busiestDay(bucketReviewsByDay(reviews, NOW, 3))).toMatchObject({
      date: new Date(2026, 7, 11),
      count: 2,
    });
  });

  it("keeps the earliest day when two are tied", () => {
    const reviews = [new Date(2026, 7, 10, 9, 0), new Date(2026, 7, 11, 9, 0)];

    expect(busiestDay(bucketReviewsByDay(reviews, NOW, 3))?.date).toEqual(
      new Date(2026, 7, 10),
    );
  });
});
