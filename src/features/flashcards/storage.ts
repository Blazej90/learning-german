/**
 * Temporary home for SRS state: localStorage, one key for the whole deck.
 *
 * Phase 4 replaces this with Firestore, so the shape stays deliberately close
 * to `users/{uid}/cards/{phraseId}` — dates as ISO strings here, `Timestamp`
 * there. Anything unreadable is dropped rather than repaired: losing a card's
 * schedule costs one extra review, while crashing costs the whole session.
 */

import type { CardState } from "@/features/srs";

const STORAGE_KEY = "learning-german:cards:v1";

type StoredCard = {
  phraseId: string;
  repetitions: number;
  interval: number;
  easeFactor: number;
  dueDate: string;
  lapses: number;
  introducedAt: string;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toCardState(value: unknown): CardState | null {
  if (typeof value !== "object" || value === null) return null;

  const raw = value as Partial<StoredCard>;
  const dueDate = parseDate(raw.dueDate);
  const introducedAt = parseDate(raw.introducedAt);

  if (
    typeof raw.phraseId !== "string" ||
    !isFiniteNumber(raw.repetitions) ||
    !isFiniteNumber(raw.interval) ||
    !isFiniteNumber(raw.easeFactor) ||
    !isFiniteNumber(raw.lapses) ||
    dueDate === null ||
    introducedAt === null
  ) {
    return null;
  }

  return {
    phraseId: raw.phraseId,
    repetitions: raw.repetitions,
    interval: raw.interval,
    easeFactor: raw.easeFactor,
    dueDate,
    lapses: raw.lapses,
    introducedAt,
  };
}

function toStoredCard(card: CardState): StoredCard {
  return {
    ...card,
    dueDate: card.dueDate.toISOString(),
    introducedAt: card.introducedAt.toISOString(),
  };
}

/** Empty map when nothing was saved, storage is unavailable, or data is corrupt. */
export function loadCards(): Map<string, CardState> {
  const cards = new Map<string, CardState>();

  if (typeof window === "undefined") return cards;

  let parsed: unknown;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cards;
    parsed = JSON.parse(raw);
  } catch {
    // Private mode, disabled storage, or a half-written value.
    return cards;
  }

  if (!Array.isArray(parsed)) return cards;

  for (const entry of parsed) {
    const card = toCardState(entry);
    if (card) cards.set(card.phraseId, card);
  }

  return cards;
}

export function saveCards(cards: ReadonlyMap<string, CardState>): void {
  if (typeof window === "undefined") return;

  try {
    const payload = [...cards.values()].map(toStoredCard);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota exceeded or storage blocked — the session still works in memory.
  }
}

export function clearCards(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do; the caller cannot recover from this either.
  }
}
