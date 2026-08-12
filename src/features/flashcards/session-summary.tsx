"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RATING_OPTIONS } from "@/features/flashcards/rating-buttons";
import type { SessionSummary } from "@/features/flashcards/use-review-session";

type SessionSummaryViewProps = {
  summary: SessionSummary;
  /** Distinct cards the session started with. */
  plannedCount: number;
  /** Answers given, repeats included. */
  answered: number;
  onRestart: () => void;
};

export function SessionSummaryView({
  summary,
  plannedCount,
  answered,
  onRestart,
}: SessionSummaryViewProps) {
  if (plannedCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Na dziś nic nie czeka</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground">
            Wszystkie fiszki na dzisiaj są zrobione, a dzienny limit nowych
            zwrotów wyczerpany. Wróć jutro — powtórki pojawią się same.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button render={<Link href="/phrases" />} variant="outline">
              Przeglądaj zwroty
            </Button>
            <Button onClick={onRestart} variant="ghost">
              Odśwież
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const repeats = answered - plannedCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sesja skończona</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-muted-foreground">
          Przerobione fiszki: <strong>{plannedCount}</strong>
          {repeats > 0
            ? `, w tym ${repeats} pokazane ponownie po pomyłce.`
            : "."}
        </p>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {RATING_OPTIONS.map((option) => (
            <div
              key={option.id}
              className="rounded-lg border border-border px-3 py-2"
            >
              <dt className="text-xs text-muted-foreground">{option.label}</dt>
              <dd className="text-2xl font-semibold tabular-nums">
                {summary[option.id]}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onRestart}>Sprawdź, czy coś jeszcze czeka</Button>
          <Button render={<Link href="/" />} variant="outline">
            Wróć na start
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
