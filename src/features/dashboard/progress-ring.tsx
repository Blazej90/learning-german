import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Drawing units. The rendered size comes from the class, not from these. */
const SIZE = 120;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type ProgressRingProps = {
  /** 0–100. Values outside the range are clamped rather than drawn wrong. */
  percent: number;
  /** What the ring means, for anyone who cannot see it. */
  label: string;
  /** The figure in the middle — the ring is the context, this is the answer. */
  children: ReactNode;
  className?: string;
};

/**
 * A ring showing how much of today is behind you, wrapped around the number
 * that says how much is left.
 *
 * Inline SVG rather than a chart library: it is two circles, and the `viewBox`
 * makes it scale with whatever size class it is given.
 */
export function ProgressRing({
  percent,
  label,
  children,
  className,
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className={cn("relative size-28 shrink-0", className)}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        // Rotated so the arc starts at twelve o'clock instead of three.
        className="size-full -rotate-90"
        role="img"
        aria-label={label}
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-muted"
        />
        {/* At zero a round cap would still paint a dot, which reads as
            progress that has not happened. */}
        {clamped > 0 ? (
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - clamped / 100)}
            className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
          />
        ) : null}
      </svg>

      <div className="absolute inset-0 grid place-content-center text-center">
        {children}
      </div>
    </div>
  );
}
