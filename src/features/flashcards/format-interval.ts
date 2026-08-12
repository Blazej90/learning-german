const DAYS_PER_MONTH = 30;

/**
 * Human wording for "when this card comes back", in days.
 *
 * Polish plurals are avoided rather than solved: "jutro" covers 1, and every
 * other count reads "za N dni", which is correct for 2, 3, 4, 5, 22…
 */
export function formatInterval(days: number): string {
  if (days <= 0) return "dzisiaj";
  if (days === 1) return "jutro";
  if (days < DAYS_PER_MONTH) return `za ${days} dni`;

  return `za ${Math.round(days / DAYS_PER_MONTH)} mies.`;
}
