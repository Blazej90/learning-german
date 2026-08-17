"use client";

import {
  busiestDay,
  totalReviews,
  type DayBucket,
} from "@/features/dashboard/review-history";

/**
 * Reviews per day over the last 30 days.
 *
 * One series, so one colour and no legend — the heading says what is plotted.
 * The columns are inline SVG rather than a chart library: 30 numbers do not
 * justify a dependency, and the `viewBox` scales the whole thing on a phone.
 *
 * Hover gives a per-day tooltip, but nothing is only in the tooltip — the
 * table below carries every value, which is also the keyboard-reachable path.
 */

/** Drawing units. At the desktop width one unit is about one pixel. */
const WIDTH = 640;
const PLOT_HEIGHT = 96;
/** Headroom so the tallest column does not touch the top edge. */
const TOP_PADDING = 8;
/** Surface gap between neighbouring columns — the separator is air, not ink. */
const COLUMN_GAP = 2;
const CORNER_RADIUS = 4;
/** A single review still has to be visible. */
const MINIMUM_BAR = 3;

const DAY_FORMAT = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
});

const WEEKDAY_FORMAT = new Intl.DateTimeFormat("pl-PL", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Polish counts: 1 powtórka, 2–4 powtórki, 5+ powtórek (11–14 are the trap). */
export function reviewsLabel(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;

  if (count === 1) return "powtórka";
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return "powtórki";
  }

  return "powtórek";
}

/** Rounded at the top, square at the baseline — the data-end is the only curve. */
function columnPath(x: number, width: number, height: number): string {
  const top = PLOT_HEIGHT - height;
  const radius = Math.min(CORNER_RADIUS, width / 2, height);
  const right = x + width;

  return [
    `M ${x} ${PLOT_HEIGHT}`,
    `V ${top + radius}`,
    `Q ${x} ${top} ${x + radius} ${top}`,
    `H ${right - radius}`,
    `Q ${right} ${top} ${right} ${top + radius}`,
    `V ${PLOT_HEIGHT}`,
    "Z",
  ].join(" ");
}

export function ReviewChart({ history }: { history: readonly DayBucket[] }) {
  const total = totalReviews(history);
  const busiest = busiestDay(history);
  const scale = busiest?.count ?? 1;

  const band = WIDTH / history.length;
  const columnWidth = Math.max(band - COLUMN_GAP, 1);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-medium">Powtórki z ostatnich 30 dni</h2>
        <p className="text-sm text-muted-foreground">
          {total === 0
            ? "jeszcze nic"
            : `razem ${total} ${reviewsLabel(total)}`}
          {busiest
            ? ` · najwięcej ${busiest.count} (${DAY_FORMAT.format(busiest.date)})`
            : ""}
        </p>
      </div>

      {total === 0 ? (
        <p className="text-sm text-muted-foreground">
          Wykres zapełni się sam — każda oceniona fiszka dokłada tu jeden
          słupek.
        </p>
      ) : (
        <>
          {/* `preserveAspectRatio="none"` plus an explicit height, because
              scaling the 640-unit drawing to a 390px phone would squash the
              plot to about 58px — too short to read a column against. The
              columns are rectangles, so the stretch costs nothing but a
              barely-visible flattening of the 4-unit corners. */}
          <svg
            viewBox={`0 0 ${WIDTH} ${PLOT_HEIGHT + 1}`}
            preserveAspectRatio="none"
            className="h-24 w-full sm:h-28"
            role="img"
            aria-label={`Powtórki dzień po dniu, ostatnie ${history.length} dni. Razem ${total}.`}
          >
            {history.map((bucket, index) => {
              const x = index * band + COLUMN_GAP / 2;
              const height =
                bucket.count === 0
                  ? 0
                  : Math.max(
                      (bucket.count / scale) * (PLOT_HEIGHT - TOP_PADDING),
                      MINIMUM_BAR,
                    );

              return (
                <g key={bucket.date.getTime()}>
                  <title>
                    {WEEKDAY_FORMAT.format(bucket.date)}: {bucket.count}{" "}
                    {reviewsLabel(bucket.count)}
                  </title>
                  {/* Hit area spans the whole band, so the tooltip does not
                      demand pixel accuracy on a short column. */}
                  <rect
                    x={index * band}
                    y={0}
                    width={band}
                    height={PLOT_HEIGHT}
                    fill="transparent"
                  />
                  {height > 0 ? (
                    <path
                      d={columnPath(x, columnWidth, height)}
                      className="fill-primary"
                    />
                  ) : null}
                </g>
              );
            })}
            <line
              x1={0}
              y1={PLOT_HEIGHT + 0.5}
              x2={WIDTH}
              y2={PLOT_HEIGHT + 0.5}
              className="stroke-border"
              strokeWidth={1}
            />
          </svg>

          {/* Three ticks, not two: with only the ends labelled there is no way
              to place a column in the middle of the month. */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{DAY_FORMAT.format(history[0].date)}</span>
            <span>
              {DAY_FORMAT.format(
                history[Math.floor((history.length - 1) / 2)].date,
              )}
            </span>
            <span>dziś</span>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground underline-offset-4 hover:underline">
              Pokaż dane w tabeli
            </summary>
            <table className="mt-3 w-full text-left">
              <thead className="text-muted-foreground">
                <tr>
                  <th scope="col" className="py-1 font-normal">
                    Dzień
                  </th>
                  <th scope="col" className="py-1 text-right font-normal">
                    Powtórki
                  </th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {history.map((bucket) => (
                  <tr key={bucket.date.getTime()} className="border-t border-border">
                    <td className="py-1">{DAY_FORMAT.format(bucket.date)}</td>
                    <td className="py-1 text-right">{bucket.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </section>
  );
}
