"use client";

import { Button } from "@/components/ui/button";
import { formatInterval } from "@/features/flashcards/format-interval";
import { schedule, type CardState, type RatingId } from "@/features/srs";

type RatingOption = {
  id: RatingId;
  label: string;
  /** Keyboard shortcut, mirrored by the listener in `ReviewSession`. */
  shortcut: string;
  variant: "destructive" | "outline" | "secondary" | "default";
};

export const RATING_OPTIONS: readonly RatingOption[] = [
  { id: "again", label: "Nie znam", shortcut: "1", variant: "destructive" },
  { id: "hard", label: "Trudne", shortcut: "2", variant: "outline" },
  { id: "good", label: "Dobrze", shortcut: "3", variant: "secondary" },
  { id: "easy", label: "Łatwe", shortcut: "4", variant: "default" },
];

type RatingButtonsProps = {
  card: CardState;
  onGrade: (rating: RatingId) => void;
};

/**
 * The four SM-2 grades, each labelled with the interval it would produce —
 * the same `schedule` the answer will actually run through, so the preview
 * cannot drift from the outcome.
 */
export function RatingButtons({ card, onGrade }: RatingButtonsProps) {
  const now = new Date();

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {RATING_OPTIONS.map((option) => (
        <Button
          key={option.id}
          variant={option.variant}
          size="lg"
          onClick={() => onGrade(option.id)}
          className="h-auto flex-col gap-0.5 py-2.5"
        >
          <span className="flex items-center gap-1.5">
            {option.label}
            <kbd className="hidden text-[0.65rem] font-normal opacity-60 sm:inline">
              {option.shortcut}
            </kbd>
          </span>
          <span className="text-xs font-normal opacity-70">
            {formatInterval(schedule(card, option.id, now).interval)}
          </span>
        </Button>
      ))}
    </div>
  );
}
