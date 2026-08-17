"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Enough tilt for the card to read as a physical object, not enough to distract. */
const MAX_TILT_DEGREES = 7;

/** How far the card has to travel before letting go counts as an answer. */
const SWIPE_THRESHOLD_PX = 88;

/** A drag past this is a swipe, not a tap — below it the card still flips. */
const TAP_SLOP_PX = 8;

/** Degrees of roll at the threshold. Small: this is a card, not a steering wheel. */
const SWIPE_ROLL_DEGREES = 6;

export type SwipeActions = {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  /** Shown at the edge the card is heading towards. */
  leftLabel: string;
  rightLabel: string;
};

type FlipCardProps = {
  isFlipped: boolean;
  onFlip: () => void;
  front: ReactNode;
  back: ReactNode;
  /** Announced to screen readers — the faces are decorative markup. */
  label: string;
  /**
   * Drag-to-answer. Omit it and the card only flips — which is what the
   * question side wants, since there is nothing to answer yet.
   */
  swipe?: SwipeActions;
  className?: string;
};

/**
 * A card that turns over in 3D, tilting slightly towards the cursor, and — once
 * turned — can be flung left or right to answer.
 *
 * The whole surface is a single button: clicking or pressing Enter/Space turns
 * the card. Nothing else inside may be interactive — a nested button would be
 * invalid markup and unreachable behind the rotation — so actions such as the
 * pronunciation button are siblings layered on top, not children.
 *
 * The swipe is an accelerator, never the only way through: every grade it can
 * reach is also a button under the card and a number key on a keyboard.
 */
export function FlipCard({
  isFlipped,
  onFlip,
  front,
  back,
  label,
  swipe,
  className,
}: FlipCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Where the pointer went down, and whether it has travelled far enough to
  // stop being a tap. Refs, not state: the click handler reads them after the
  // pointer sequence has already ended.
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const didDrag = useRef(false);
  // The distance also lives in a ref, because `pointerup` must read the last
  // `pointermove`'s value. Going through state risks reading a render behind
  // it and silently dropping the gesture.
  const dragXRef = useRef(0);

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragStart.current && swipe) {
      const deltaX = event.clientX - dragStart.current.x;
      const deltaY = event.clientY - dragStart.current.y;

      // Until the gesture commits, a mostly-vertical drag belongs to the page,
      // not the card — otherwise the list underneath cannot be scrolled.
      if (!didDrag.current) {
        if (Math.abs(deltaX) < TAP_SLOP_PX) return;
        if (Math.abs(deltaY) > Math.abs(deltaX)) return;

        didDrag.current = true;
        setIsDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }

      dragXRef.current = deltaX;
      setDragX(deltaX);
      return;
    }

    // Touch would tilt the card at the moment of tapping it — mouse only.
    if (event.pointerType !== "mouse") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

    setTilt({
      x: -offsetY * 2 * MAX_TILT_DEGREES,
      y: offsetX * 2 * MAX_TILT_DEGREES,
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!swipe) return;
    dragStart.current = { x: event.clientX, y: event.clientY };
  };

  const endDrag = () => {
    const travelled = dragXRef.current;

    dragStart.current = null;
    dragXRef.current = 0;
    setIsDragging(false);
    setDragX(0);

    if (!swipe || Math.abs(travelled) < SWIPE_THRESHOLD_PX) return;

    if (travelled < 0) swipe.onSwipeLeft();
    else swipe.onSwipeRight();
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  const handlePointerUp = () => {
    endDrag();
    // The click that follows this pointer sequence is the tail of a swipe, not
    // a tap, so it must not also flip the card. Cleared on the next frame,
    // once that click has been and gone.
    if (didDrag.current) {
      requestAnimationFrame(() => {
        didDrag.current = false;
      });
    }
  };

  const progress = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD_PX, 1);
  const isArmed = Math.abs(dragX) >= SWIPE_THRESHOLD_PX;

  return (
    <button
      type="button"
      onClick={() => {
        if (didDrag.current) return;
        onFlip();
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={resetTilt}
      onBlur={resetTilt}
      aria-label={label}
      aria-pressed={isFlipped}
      className={cn(
        "group relative block w-full cursor-pointer [perspective:1600px] outline-none",
        // Vertical scrolling stays with the page; horizontal is ours.
        swipe && "touch-pan-y",
        className,
      )}
    >
      <div
        className={cn(
          "relative h-[clamp(16rem,42dvh,26rem)] w-full [transform-style:preserve-3d] motion-reduce:transition-none",
          // Following a finger must not be animated, or it lags behind it.
          isDragging
            ? "transition-none"
            : "transition-transform duration-500 ease-out",
        )}
        style={{
          transform: [
            `translateX(${dragX}px)`,
            `rotateZ(${(dragX / SWIPE_THRESHOLD_PX) * SWIPE_ROLL_DEGREES}deg)`,
            `rotateX(${tilt.x}deg)`,
            `rotateY(${tilt.y + (isFlipped ? 180 : 0)}deg)`,
          ].join(" "),
        }}
      >
        <CardFace className="bg-card-front text-card-front-foreground">
          {front}
        </CardFace>
        <CardFace className="bg-card text-card-foreground [transform:rotateY(180deg)]">
          {back}
        </CardFace>
      </div>

      {swipe ? (
        <>
          <SwipeHint
            side="left"
            label={swipe.leftLabel}
            opacity={dragX < 0 ? progress : 0}
            isArmed={isArmed && dragX < 0}
          />
          <SwipeHint
            side="right"
            label={swipe.rightLabel}
            opacity={dragX > 0 ? progress : 0}
            isArmed={isArmed && dragX > 0}
          />
        </>
      ) : null}
    </button>
  );
}

function CardFace({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border px-6 py-8 text-center shadow-lg transition-shadow [backface-visibility:hidden] group-hover:shadow-xl group-focus-visible:ring-3 group-focus-visible:ring-ring/50 sm:px-8 sm:py-10",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * The label that fades in at the edge the card is being dragged towards, so
 * the gesture says what it will do before you commit to it.
 */
function SwipeHint({
  side,
  label,
  opacity,
  isArmed,
}: {
  side: "left" | "right";
  label: string;
  opacity: number;
  isArmed: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-sm font-semibold",
        side === "left"
          ? "left-3 bg-rating-again text-rating-again-foreground"
          : "right-3 bg-rating-good text-rating-good-foreground",
      )}
      // Fades in with the drag and reaches full strength only once letting go
      // would actually answer — the label doubles as the commit indicator.
      style={{ opacity: isArmed ? 1 : opacity * 0.8 }}
    >
      {label}
    </span>
  );
}
