"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { TOTAL_PLAN_DAYS } from "@/features/plan/progress";
import { usePlanTracker } from "@/features/plan/use-plan-tracker";
import { ReviewChart } from "@/features/dashboard/review-chart";
import { TodayTasks } from "@/features/dashboard/today-tasks";
import { useDashboard } from "@/features/dashboard/use-dashboard";

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
    return (
      <p className="text-muted-foreground" role="status">
        Wczytuję postępy…
      </p>
    );
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

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Fiszki na dziś</p>
          {/* Hero figure: proportional digits, not tabular — see the chart
              note. Exactly one number on this page gets this size. */}
          <p className="text-5xl font-semibold tracking-tight">{waiting}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {waiting === 0
              ? "Wszystko powtórzone — wróć jutro."
              : `${cards.dueCount} do powtórki · ${cards.newCount} nowych`}
          </p>
        </div>

        {/* Nothing due means nothing to open — a disabled link is still a
            link, so the button simply steps aside. */}
        {waiting === 0 ? (
          <p className="text-sm text-muted-foreground">Sesja na dziś zrobiona.</p>
        ) : (
          <Button
            render={<Link href="/review" />}
            nativeButton={false}
            size="touch"
          >
            Zacznij powtórki
          </Button>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Seria"
          value={plan.streak}
          hint={plan.streak === 1 ? "dzień z rzędu" : "dni z rzędu"}
        />
        <StatTile
          label="Dzień planu"
          value={
            plan.status === "not-started"
              ? "—"
              : Math.min(plan.today, TOTAL_PLAN_DAYS)
          }
          hint={
            plan.status === "not-started"
              ? "plan nie wystartował"
              : `z ${TOTAL_PLAN_DAYS}`
          }
        />
        <StatTile
          label="Talia"
          value={cards.startedCount}
          hint={`z ${cards.deckSize} zwrotów w powtórkach`}
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

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint: string;
}) {
  return (
    <div className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}
