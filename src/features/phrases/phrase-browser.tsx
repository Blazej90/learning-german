"use client";

import { useMemo, useState } from "react";
import { Search, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/data/categories";
import { PHRASES } from "@/data/phrases";
import { useGermanVoice } from "@/hooks/use-german-voice";
import type { GermanVoice } from "@/hooks/use-german-voice";
import type { Phrase } from "@/types/content";

/**
 * Folds accents away, so "uber" finds "über" and "zycze" finds "życzę".
 *
 * ß and ł have no decomposed form — NFD leaves them alone — so they are
 * spelled out before the rest is stripped.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replaceAll("ß", "ss")
    .replaceAll("ł", "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Polish counts: 1 zwrot, 2–4 zwroty, 5+ zwrotów (11–14 are the trap). */
function phrasesLabel(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;

  if (count === 1) return "zwrot";
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return "zwroty";

  return "zwrotów";
}

/**
 * The whole phrase set, searchable and speakable.
 *
 * A client component because all three things it adds — the query, the audio
 * and the filtering — are browser-side. The data is still the static import,
 * so nothing is fetched.
 */
export function PhraseBrowser() {
  const [query, setQuery] = useState("");
  const voice = useGermanVoice();

  const needle = normalize(query.trim());

  const groups = useMemo(() => {
    const matches =
      needle === ""
        ? PHRASES
        : PHRASES.filter(
            (phrase) =>
              normalize(phrase.de).includes(needle) ||
              normalize(phrase.pl).includes(needle),
          );

    // Empty categories drop out entirely — a heading over nothing reads as a
    // loading failure rather than as "no matches here".
    return CATEGORIES.map((category) => ({
      category,
      phrases: matches.filter((phrase) => phrase.category === category.id),
    })).filter((group) => group.phrases.length > 0);
  }, [needle]);

  const found = groups.reduce((total, group) => total + group.phrases.length, 0);
  const isSearching = needle !== "";

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Szukaj po polsku lub po niemiecku"
          aria-label="Szukaj zwrotu"
          className="h-11 pl-9"
        />
      </div>

      <p className="text-sm text-muted-foreground" role="status">
        {isSearching
          ? `${found} ${phrasesLabel(found)} pasuje do „${query.trim()}”`
          : `${PHRASES.length} zwrotów w ${CATEGORIES.length} kategoriach — cały materiał, z którego powstają fiszki.`}
      </p>

      {/* One line instead of a column of dead buttons: without a German voice
          every row's speaker would be disabled, which says the same thing
          worse. */}
      {voice.status === "missing" || voice.status === "unsupported" ? (
        <p className="text-sm text-muted-foreground">
          Ta przeglądarka nie ma niemieckiego głosu, więc odsłuch jest
          niedostępny.
        </p>
      ) : null}

      {groups.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>Nic nie pasuje do „{query.trim()}”</EmptyTitle>
            <EmptyDescription>
              Spróbuj krótszego fragmentu — szukanie działa po obu językach i
              nie wymaga znaków diakrytycznych.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        groups.map(({ category, phrases }) => (
          <section key={category.id} className="flex flex-col">
            <h2 className="top-appbar sticky z-20 -mx-4 flex items-baseline justify-between gap-3 border-b border-border bg-background/90 px-4 py-2 backdrop-blur-lg sm:-mx-6 sm:px-6">
              <span className="font-medium">{category.name}</span>
              <span className="text-sm font-normal text-muted-foreground tabular-nums">
                {phrases.length}
              </span>
            </h2>

            {!isSearching ? (
              <p className="pt-3 text-sm text-muted-foreground">
                {category.description}
              </p>
            ) : null}

            <ul className="flex flex-col divide-y divide-border">
              {phrases.map((phrase) => (
                <PhraseRow key={phrase.id} phrase={phrase} voice={voice} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

/**
 * German on top at full weight, Polish underneath.
 *
 * The old two-column grid collapsed to one column on a phone anyway, which
 * left the two languages looking equally important — on a page whose job is
 * learning the German one, the hierarchy has to be vertical and explicit.
 */
function PhraseRow({ phrase, voice }: { phrase: Phrase; voice: GermanVoice }) {
  return (
    <li className="flex items-start gap-2 py-3">
      <div className="min-w-0 flex-1">
        <p lang="de" className="font-medium">
          {phrase.de}
        </p>
        <p className="text-sm text-muted-foreground">{phrase.pl}</p>
        {phrase.note ? (
          <p className="mt-0.5 text-xs text-muted-foreground/80">
            {phrase.note}
          </p>
        ) : null}
      </div>

      {voice.isAvailable ? (
        <Button
          variant="ghost"
          size="icon-touch"
          onClick={() => voice.speakGerman(phrase.de)}
          aria-label={`Przeczytaj po niemiecku: ${phrase.de}`}
          className="-my-1 shrink-0 text-muted-foreground"
        >
          <Volume2 />
        </Button>
      ) : null}
    </li>
  );
}
