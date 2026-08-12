"use client";

import { useState, type PointerEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Enough tilt for the card to read as a physical object, not enough to distract. */
const MAX_TILT_DEGREES = 7;

type FlipCardProps = {
  isFlipped: boolean;
  onFlip: () => void;
  front: ReactNode;
  back: ReactNode;
  /** Announced to screen readers — the faces are decorative markup. */
  label: string;
  className?: string;
};

/**
 * A card that turns over in 3D, tilting slightly towards the cursor.
 *
 * The whole surface is a single button: clicking or pressing Enter/Space turns
 * the card. Nothing else inside may be interactive — a nested button would be
 * invalid markup and unreachable behind the rotation — so actions such as the
 * pronunciation button live outside the card.
 */
export function FlipCard({
  isFlipped,
  onFlip,
  front,
  back,
  label,
  className,
}: FlipCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
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

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <button
      type="button"
      onClick={onFlip}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      onBlur={resetTilt}
      aria-label={label}
      aria-pressed={isFlipped}
      className={cn(
        "group block w-full cursor-pointer [perspective:1600px] outline-none",
        className,
      )}
    >
      <div
        className="relative h-72 w-full transition-transform duration-500 ease-out [transform-style:preserve-3d] motion-reduce:transition-none sm:h-80"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (isFlipped ? 180 : 0)}deg)`,
        }}
      >
        <CardFace>{front}</CardFace>
        <CardFace className="[transform:rotateY(180deg)]">{back}</CardFace>
      </div>
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
        "absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card px-8 py-10 text-center shadow-lg transition-shadow [backface-visibility:hidden] group-hover:shadow-xl group-focus-visible:ring-3 group-focus-visible:ring-ring/50",
        className,
      )}
    >
      {children}
    </div>
  );
}
