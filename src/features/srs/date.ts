/**
 * Day arithmetic in the user's local timezone.
 *
 * Everything here deliberately uses the local-time getters rather than UTC:
 * "due today" and the review streak have to follow the user's midnight, not
 * Greenwich's, or a review at 23:30 in Warsaw lands on the wrong day.
 */

/** Midnight at the start of `date`'s local day. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * `days` local days after `date`, at the same clock time.
 *
 * Passing a day number outside the month is intentional — `Date` normalises
 * it, and because these are local-time components, DST shifts keep the clock
 * time intact instead of drifting by an hour.
 */
export function addDays(date: Date, days: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

/** Whole local days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: Date, to: Date): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const difference = startOfDay(to).getTime() - startOfDay(from).getTime();

  return Math.round(difference / millisecondsPerDay);
}
