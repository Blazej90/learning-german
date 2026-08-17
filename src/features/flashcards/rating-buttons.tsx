"use client";

import { Button } from "@/components/ui/button";
import { formatInterval } from "@/features/flashcards/format-interval";
import { schedule, type CardState, type RatingId } from "@/features/srs";

type RatingOption = {
  id: RatingId;
  label: string;
  /** Keyboard shortcut, mirrored by the listener in `ReviewSession`. */
  shortcut: string;
  /**
   * The grade's own colour. Not a shadcn variant: these four are a scale, and
   * `destructive`/`outline`/`secondary`/`default` read as four unrelated
   * buttons rather than a ramp from "nie znam" to "łatwe".
   */
  className: string;
};

export const RATING_OPTIONS: readonly RatingOption[] = [
  {
    id: "again",
    label: "Nie znam",
    shortcut: "1",
    className:
      "bg-rating-again text-rating-again-foreground hover:bg-rating-again/90",
  },
  {
    id: "hard",
    label: "Trudne",
    shortcut: "2",
    className:
      "bg-rating-hard text-rating-hard-foreground hover:bg-rating-hard/90",
  },
  {
    id: "good",
    label: "Dobrze",
    shortcut: "3",
    className:
      "bg-rating-good text-rating-good-foreground hover:bg-rating-good/90",
  },
  {
    id: "easy",
    label: "Łatwe",
    shortcut: "4",
    className:
      "bg-rating-easy text-rating-easy-foreground hover:bg-rating-easy/90",
  },
];

type RatingButtonsProps = {
  card: CardState;
  onGrade: (rating: RatingId) => void;
};

/**
 * The four SM-2 grades, each labelled with the interval it would produce —
 * the same `schedule` the answer will actually run through, so the preview
 * cannot drift from the outcome.
 *
 * One row of four, never wrapped: on a phone these are the buttons you press
 * dozens of times a session, and a grid that reflows moves "Nie znam" to where
 * "Dobrze" was a moment ago.
 *
 * The colours are redundant with the labels on purpose — the word is what
 * carries the meaning, the colour only makes it faster to find.
 */
export function RatingButtons({ card, onGrade }: RatingButtonsProps) {
  const now = new Date();

  return (
    <div className="grid grid-cols-4 gap-2">
      {RATING_OPTIONS.map((option) => (
        <Button
          key={option.id}
          onClick={() => onGrade(option.id)}
          className={`h-auto min-h-14 flex-col gap-0.5 px-1 py-2 ${option.className}`}
        >
          <span className="flex items-center gap-1 text-sm leading-tight font-semibold">
            {option.label}
            <kbd className="hidden text-[0.65rem] font-normal opacity-60 sm:inline">
              {option.shortcut}
            </kbd>
          </span>
          <span className="text-xs font-normal tabular-nums opacity-80">
            {formatInterval(schedule(card, option.id, now).interval)}
          </span>
        </Button>
      ))}
    </div>
  );
}
