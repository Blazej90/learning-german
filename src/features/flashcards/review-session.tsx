"use client";

import { useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { FlipCard } from "@/components/aceternity/flip-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RATING_OPTIONS,
  RatingButtons,
} from "@/features/flashcards/rating-buttons";
import { SessionSummaryView } from "@/features/flashcards/session-summary";
import { useReviewSession } from "@/features/flashcards/use-review-session";
import { useGermanVoice } from "@/hooks/use-german-voice";
import { getPhrase, PHRASE_IDS } from "@/data/phrases";

export function ReviewSession() {
  const session = useReviewSession(PHRASE_IDS);
  const voice = useGermanVoice();

  const { current, isRevealed, reveal, grade, status } = session;
  const phrase = current ? getPhrase(current.phraseId) : undefined;

  // Keyboard: space/enter turns the card, 1-4 grade it. The card itself is a
  // button, so keys pressed while it has focus are left to the browser.
  useEffect(() => {
    if (status !== "reviewing") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (!isRevealed) {
        const onBody = event.target === document.body;
        if (onBody && (event.key === " " || event.key === "Enter")) {
          event.preventDefault();
          reveal();
        }
        return;
      }

      const option = RATING_OPTIONS.find(
        (candidate) => candidate.shortcut === event.key,
      );

      if (option) {
        event.preventDefault();
        grade(option.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [grade, isRevealed, reveal, status]);

  if (status === "loading") {
    // Mirrors the session layout below, so the card does not jump into place.
    return (
      <div className="flex flex-1 flex-col gap-4" role="status" aria-busy="true">
        <span className="sr-only">Wczytuję fiszki…</span>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-1 w-full" />
        </div>

        <Skeleton className="my-auto h-[clamp(16rem,42dvh,26rem)] w-full rounded-2xl" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-start gap-4">
        <p role="alert" className="text-destructive">
          {session.error}
        </p>
        <Button onClick={session.restart}>Spróbuj ponownie</Button>
      </div>
    );
  }

  if (!current || !phrase) {
    return (
      <SessionSummaryView
        summary={session.summary}
        plannedCount={session.plannedCount}
        answered={session.answered}
        onRestart={session.restart}
      />
    );
  }

  const progress =
    session.total > 0 ? (session.answered / session.total) * 100 : 0;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="tabular-nums">
            {session.answered + 1} / {session.total}
          </span>
          <Badge variant={current.kind === "new" ? "default" : "secondary"}>
            {current.kind === "new" ? "Nowa" : "Powtórka"}
          </Badge>
        </div>
        <Progress value={progress} aria-label="Postęp sesji" />
      </div>

      {/* Zapis offline trafia do pamięci podręcznej i wyjdzie później, więc ten
          komunikat pojawia się tylko przy realnej odmowie zapisu. */}
      {session.error ? (
        <p role="alert" className="text-sm text-destructive">
          {session.error}
        </p>
      ) : null}

      {/* `my-auto` centres the card in whatever height is left over, while the
          wrapper still hugs it — which is what the overlaid button needs to
          land on the card's corner rather than the container's. */}
      <div className="relative my-auto">
        {/* Keying on the phrase drops the previous card's flip and drag state,
            so the next one arrives face-up rather than rotating back. */}
        <FlipCard
          key={current.phraseId}
          isFlipped={isRevealed}
          onFlip={() => (isRevealed ? undefined : reveal())}
          swipe={
            isRevealed
              ? {
                  onSwipeLeft: () => grade("again"),
                  onSwipeRight: () => grade("good"),
                  leftLabel: "Nie znam",
                  rightLabel: "Dobrze",
                }
              : undefined
          }
          label={
            isRevealed
              ? `Tłumaczenie: ${phrase.pl}`
              : `Zwrot: ${phrase.de}. Odsłoń tłumaczenie.`
          }
          front={
            <>
              <span lang="de" className="text-3xl font-semibold sm:text-4xl">
                {phrase.de}
              </span>
              <span className="text-sm opacity-70">
                Dotknij, żeby zobaczyć tłumaczenie
              </span>
            </>
          }
          back={
            <>
              <span lang="de" className="text-sm text-muted-foreground">
                {phrase.de}
              </span>
              <span className="text-3xl font-semibold sm:text-4xl">
                {phrase.pl}
              </span>
              {phrase.note ? (
                <span className="text-sm text-muted-foreground">
                  {phrase.note}
                </span>
              ) : null}
            </>
          }
        />

        {/* A sibling, not a child: the card is one big button, and a button
            inside a button is invalid markup. Its own translucent chip, so it
            stays legible over both the dark front and the light back. */}
        <Button
          variant="ghost"
          size="icon-touch"
          onClick={() => voice.speakGerman(phrase.de)}
          disabled={!voice.isAvailable}
          aria-label={
            voice.isAvailable
              ? "Przeczytaj po niemiecku"
              : "Brak niemieckiego głosu w tej przeglądarce"
          }
          title={
            voice.isAvailable
              ? "Przeczytaj po niemiecku"
              : "Brak niemieckiego głosu w tej przeglądarce"
          }
          className="absolute top-3 right-3 z-10 rounded-full bg-background/80 text-foreground backdrop-blur hover:bg-background"
        >
          {voice.isAvailable ? <Volume2 /> : <VolumeX />}
        </Button>
      </div>

      {/* The answer controls own the bottom strip — the tab bar steps aside on
          this route precisely so they can sit where the thumb already is. */}
      <div className="pb-safe sticky bottom-0 -mx-4 border-t border-border bg-background/90 px-4 pt-3 backdrop-blur-lg sm:-mx-6 sm:px-6">
        {isRevealed ? (
          <RatingButtons card={current.card} onGrade={grade} />
        ) : (
          <Button size="touch" className="w-full" onClick={reveal}>
            Pokaż tłumaczenie
          </Button>
        )}
      </div>
    </div>
  );
}
