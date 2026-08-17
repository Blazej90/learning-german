"use client";

import Link from "next/link";
import { Check, CalendarCheck, Flame, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TOTAL_PLAN_DAYS } from "@/features/plan/progress";
import { usePlanTracker } from "@/features/plan/use-plan-tracker";
import { ProgressRing } from "@/features/dashboard/progress-ring";
import { ReviewChart } from "@/features/dashboard/review-chart";
import { TodayTasks } from "@/features/dashboard/today-tasks";
import { useDashboard } from "@/features/dashboard/use-dashboard";
import { cn } from "@/lib/utils";

/**
 * "Co mam dziś zrobić" in one screen: the review queue, today's plan tasks,
 * the streak and the last 30 days of reviews.
 *
 * Two hooks, because the two halves already exist: `useDashboard` owns the
 * flashcards, `usePlanTracker` owns the plan — the same hook `/plan` uses, so
 * a task ticked here is the same document.
 */
export function Dashboard() {
  const cards = useDashboard();
  const plan = usePlanTracker();

  if (cards.status === "loading" || plan.status === "loading") {
    return <DashboardSkeleton />;
  }

  if (cards.status === "error" || plan.status === "error") {
    return (
      <div className="flex flex-col items-start gap-4">
        <p role="alert" className="text-destructive">
          {cards.error ?? plan.error}
        </p>
        <Button
          onClick={() => {
            cards.reload();
            plan.reload();
          }}
        >
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  const waiting = cards.dueCount + cards.newCount;

  // The last bucket of the history is today, which is the only source the app
  // already has for "how many have I answered so far". It counts answers
  // rather than distinct cards, so a card failed and shown again adds one —
  // that is the honest reading of effort spent, which is what a ring shows.
  const doneToday = cards.history.at(-1)?.count ?? 0;
  const plannedToday = doneToday + waiting;
  const percentToday =
    plannedToday === 0 ? 100 : (doneToday / plannedToday) * 100;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-5">
          <ProgressRing
            percent={percentToday}
            label={
              waiting === 0
                ? "Powtórki na dziś zrobione"
                : `Zrobione ${doneToday} z ${plannedToday} fiszek na dziś`
            }
          >
            {waiting === 0 ? (
              <Check aria-hidden className="size-8 text-primary" />
            ) : (
              // The one number on this page that gets this size.
              <span className="text-3xl font-semibold tracking-tight">
                {waiting}
              </span>
            )}
          </ProgressRing>

          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Fiszki na dziś</p>
            <p className="text-lg font-medium">
              {waiting === 0
                ? "Wszystko powtórzone"
                : `${cards.dueCount} do powtórki · ${cards.newCount} nowych`}
            </p>
            <p className="text-sm text-muted-foreground">
              {waiting === 0
                ? "Wróć jutro — powtórki pojawią się same."
                : `Zrobione dziś: ${doneToday}`}
            </p>
          </div>
        </div>

        {/* Nothing due means nothing to open — a disabled link is still a
            link, so the button simply steps aside. */}
        {waiting > 0 ? (
          <Button
            render={<Link href="/review" />}
            nativeButton={false}
            size="touch"
            className="w-full"
          >
            Zacznij powtórki
          </Button>
        ) : null}
      </section>

      {/* Three across even on the narrowest phone: stacked, these three short
          numbers would cost three screenfuls of scrolling to say very little. */}
      <section className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatTile
          icon={Flame}
          label="Seria"
          value={plan.streak}
          hint={plan.streak === 1 ? "dzień" : "dni"}
          isHighlighted={plan.streak > 0}
        />
        <StatTile
          icon={CalendarCheck}
          label="Plan"
          value={
            plan.status === "not-started"
              ? "—"
              : Math.min(plan.today, TOTAL_PLAN_DAYS)
          }
          hint={
            plan.status === "not-started" ? "nie zaczęty" : `z ${TOTAL_PLAN_DAYS}`
          }
        />
        <StatTile
          icon={Layers}
          label="Talia"
          value={cards.startedCount}
          hint={`z ${cards.deckSize}`}
        />
      </section>

      <TodayTasks plan={plan} />

      <ReviewChart history={cards.history} />

      {/* Zapis offline trafia do pamięci podręcznej i wyjdzie później, więc ten
          komunikat pojawia się tylko przy realnej odmowie zapisu. */}
      {plan.error ? (
        <p role="alert" className="text-sm text-destructive">
          {plan.error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The dashboard's own shape, greyed out.
 *
 * A skeleton rather than "Wczytuję postępy…" because this screen is the app's
 * front door: a line of text collapses the layout to nothing and then throws
 * the real thing at you, which reads as a page load rather than a wait.
 */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8" role="status" aria-busy="true">
      <span className="sr-only">Wczytuję postępy…</span>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-5">
          <Skeleton className="size-28 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-11 w-full" />
      </section>

      <section className="grid grid-cols-3 gap-2 sm:gap-4">
        {[0, 1, 2].map((tile) => (
          <Skeleton key={tile} className="h-22 rounded-xl" />
        ))}
      </section>

      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  isHighlighted = false,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint: string;
  /** A live streak earns the amber; nothing else on this row competes for it. */
  isHighlighted?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-card px-3 py-3 ring-1 ring-foreground/10">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon
          aria-hidden
          className={cn(
            "size-3.5 shrink-0",
            isHighlighted ? "text-brand-ink" : "text-muted-foreground",
          )}
        />
        <span className="truncate">{label}</span>
      </p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="truncate text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
