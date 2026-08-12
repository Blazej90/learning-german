/**
 * Reviews per day for the dashboard chart. Pure date maths, no React.
 *
 * Buckets follow the user's local midnight, like everything else in the app —
 * a review at 23:30 belongs to that evening, not to the next UTC day.
 */

import { addDays, daysBetween, startOfDay } from "@/features/srs";

/** How far back the chart looks, today included. */
export const REVIEW_HISTORY_DAYS = 30;

export type DayBucket = {
  /** Local midnight of the day. */
  date: Date;
  count: number;
};

/** Local midnight of the first day the chart shows. */
export function historyStart(now: Date, days = REVIEW_HISTORY_DAYS): Date {
  return startOfDay(addDays(startOfDay(now), -(days - 1)));
}

/**
 * One bucket per day, oldest first, always `days` long — days with nothing to
 * show still get a bucket, otherwise the chart would silently compress the
 * gaps and make a broken streak look continuous.
 *
 * Timestamps outside the window are ignored, so a wider query still renders
 * the same chart.
 */
export function bucketReviewsByDay(
  reviewedAt: readonly Date[],
  now: Date,
  days = REVIEW_HISTORY_DAYS,
): DayBucket[] {
  const start = historyStart(now, days);

  const buckets: DayBucket[] = Array.from({ length: days }, (_, index) => ({
    date: startOfDay(addDays(start, index)),
    count: 0,
  }));

  for (const date of reviewedAt) {
    const index = daysBetween(start, date);

    if (index >= 0 && index < days) buckets[index].count += 1;
  }

  return buckets;
}

export function totalReviews(buckets: readonly DayBucket[]): number {
  return buckets.reduce((total, bucket) => total + bucket.count, 0);
}

export function busiestDay(buckets: readonly DayBucket[]): DayBucket | null {
  return buckets.reduce<DayBucket | null>(
    (best, bucket) =>
      bucket.count > 0 && (!best || bucket.count > best.count) ? bucket : best,
    null,
  );
}
