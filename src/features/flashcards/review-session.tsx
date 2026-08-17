"use client";

import { useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { FlipCard } from "@/components/aceternity/flip-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
    return (
      <p className="text-muted-foreground" role="status">
        Wczytuję fiszki…
      </p>
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

  const progress = session.total > 0 ? (session.answered / session.total) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
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

      <FlipCard
        isFlipped={isRevealed}
        onFlip={() => (isRevealed ? undefined : reveal())}
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
            <span className="text-sm text-muted-foreground">
              Kliknij, żeby zobaczyć tłumaczenie
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

      <div className="flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => voice.speakGerman(phrase.de)}
          disabled={!voice.isAvailable}
          title={
            voice.isAvailable
              ? "Przeczytaj po niemiecku"
              : "Brak niemieckiego głosu w tej przeglądarce"
          }
        >
          {voice.isAvailable ? <Volume2 /> : <VolumeX />}
          {voice.status === "ready"
            ? "Przeczytaj"
            : voice.status === "loading"
              ? "Szukam głosu…"
              : "Brak głosu de-DE"}
        </Button>
      </div>

      {isRevealed ? (
        <RatingButtons card={current.card} onGrade={grade} />
      ) : (
        <Button size="touch" onClick={reveal}>
          Pokaż tłumaczenie
        </Button>
      )}
    </div>
  );
}
