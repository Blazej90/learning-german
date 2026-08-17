import { cn } from "@/lib/utils";

/**
 * The Kartoffel mark: a potato that is also a flashcard.
 *
 * Geometry identical to `public/icons/icon.svg`, minus that file's ink
 * backing square — here the mark sits directly on the app bar, which is why
 * the silhouette carries its own dark outline. Change both files together,
 * then run `node scripts/generate-icons.mjs`.
 *
 * The colours are literals rather than theme tokens on purpose: a logo that
 * recolours with the interface stops being the same logo, and these three
 * hold up on both the light and the dark page.
 */
export function KartoffelMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={cn("size-7 shrink-0", className)}
      aria-hidden
      focusable="false"
    >
      <g transform="rotate(-5 256 256)">
        <path
          d="M256 92
             C322 92, 374 116, 376 186
             C378 246, 384 336, 352 382
             C326 420, 188 424, 162 390
             C130 348, 134 244, 136 184
             C138 116, 190 92, 256 92 Z"
          fill="#dab787"
          stroke="#63462d"
          strokeWidth="14"
          strokeLinejoin="round"
        />

        {/* Sprouting eyes, on a diagonal — a level pair reads as a face. */}
        <ellipse
          cx="188"
          cy="158"
          rx="14"
          ry="11"
          fill="#63462d"
          transform="rotate(-20 188 158)"
        />
        <ellipse
          cx="334"
          cy="238"
          rx="11"
          ry="14"
          fill="#63462d"
          transform="rotate(14 334 238)"
        />

        {/* Two left-aligned lines of unequal length: written-on, not a mouth. */}
        <rect x="172" y="300" width="168" height="26" rx="13" fill="#e49e22" />
        <rect x="172" y="346" width="104" height="24" rx="12" fill="#a9825a" />
      </g>
    </svg>
  );
}

/**
 * Mark plus wordmark — the app's name as it appears in the bar and on the
 * login screen.
 *
 * The word is set in the interface font rather than drawn as paths, so it
 * inherits the page's colour and stays legible in both themes. The mark is
 * the part that has to be recognisable at 60 px on a home screen; the word is
 * the part that has to be readable at 16 px.
 */
export function Logo({
  className,
  markClassName,
  wordClassName,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <KartoffelMark className={markClassName} />
      <span
        className={cn(
          "text-base font-semibold tracking-tight whitespace-nowrap",
          wordClassName,
        )}
      >
        Kartoffel
      </span>
    </span>
  );
}
