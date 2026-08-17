"use client";

import { useMemo, useState } from "react";
import { ListFilter, Search, Volume2 } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
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
import { cn } from "@/lib/utils";
import type { Category, CategoryId, Phrase } from "@/types/content";

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

/** "all" is a scope like any other, so the chip row is one uniform list. */
type Scope = CategoryId | "all";

/** Keeps a tapped chip from staying half off-screen on a narrow phone. */
function centerInChipRow(chip: HTMLElement): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  chip.scrollIntoView({
    inline: "center",
    // "nearest" vertically, or the page jumps as well as the chip row.
    block: "nearest",
    behavior: reduced ? "auto" : "smooth",
  });
}

/**
 * The whole phrase set, searchable, filterable and speakable.
 *
 * Two controls share the work, because they answer different questions. The
 * chips answer "show me shopping" — you know where you are going. The collapsed
 * sections answer "what is in here at all" — 200+ phrases in one flat list is a
 * scroll nobody finishes, so the default view is an index of eleven rows and
 * the phrases stay folded until asked for.
 *
 * A client component because everything it adds — the query, the scope, the
 * audio — is browser-side. The data is still the static import, so nothing is
 * fetched.
 */
export function PhraseBrowser() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const voice = useGermanVoice();

  const needle = normalize(query.trim());
  const isSearching = needle !== "";

  const phrasesByCategory = useMemo(() => {
    const matches = isSearching
      ? PHRASES.filter(
          (phrase) =>
            normalize(phrase.de).includes(needle) ||
            normalize(phrase.pl).includes(needle),
        )
      : PHRASES;

    const grouped = new Map<CategoryId, Phrase[]>(
      CATEGORIES.map((category) => [category.id, []]),
    );

    for (const phrase of matches) {
      grouped.get(phrase.category)?.push(phrase);
    }

    return grouped;
  }, [isSearching, needle]);

  const countIn = (category: CategoryId) =>
    phrasesByCategory.get(category)?.length ?? 0;

  /** Every category that still has something to show, in presentation order. */
  const groups = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        phrases: phrasesByCategory.get(category.id) ?? [],
      })).filter((group) => group.phrases.length > 0),
    [phrasesByCategory],
  );

  const totalFound = groups.reduce(
    (total, group) => total + group.phrases.length,
    0,
  );
  const scopedFound = scope === "all" ? totalFound : countIn(scope);

  const [openIds, setOpenIds] = useState<CategoryId[]>([]);
  const [syncedNeedle, setSyncedNeedle] = useState("");

  // Search results hidden behind a closed section are results the user never
  // sees, so a query opens everything it matched — and clearing it folds the
  // index back up. Adjusting state during render (rather than in an effect)
  // keeps the list from painting once in the wrong state first.
  if (needle !== syncedNeedle) {
    setSyncedNeedle(needle);
    setOpenIds(needle === "" ? [] : groups.map((group) => group.category.id));
  }

  const allOpen = groups.length > 0 && openIds.length === groups.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="top-appbar sticky z-20 -mx-4 flex flex-col gap-2.5 border-b border-border bg-background/90 px-4 pt-3 pb-2.5 backdrop-blur-lg sm:-mx-6 sm:px-6">
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

        {/* Bleeds past the padding on both sides so the strip runs edge to edge,
            then fades at both ends instead of guillotining the chip that is on
            its way out. `overscroll-x-contain` keeps a swipe that runs out of
            chips from turning into the browser's back gesture. */}
        <div
          role="group"
          aria-label="Filtruj według kategorii"
          className="scrollbar-none fade-x-edges -mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 py-0.5 sm:-mx-6 sm:px-6"
        >
          <ScopeChip
            label="Wszystkie"
            count={totalFound}
            isActive={scope === "all"}
            onSelect={() => setScope("all")}
          />

          {CATEGORIES.map((category) => (
            <ScopeChip
              key={category.id}
              label={category.short}
              count={countIn(category.id)}
              isActive={scope === category.id}
              onSelect={() => setScope(category.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-muted-foreground" role="status">
          {isSearching
            ? `${scopedFound} ${phrasesLabel(scopedFound)} pasuje do „${query.trim()}”`
            : scope === "all"
              ? `${PHRASES.length} ${phrasesLabel(PHRASES.length)} w ${CATEGORIES.length} kategoriach — rozwiń kategorię albo zawęź filtrem.`
              : `${scopedFound} ${phrasesLabel(scopedFound)} w tej kategorii.`}
        </p>

        {/* Full 44px of tap target, pulled back out of the row so a text-sized
            label does not push the summary line around. */}
        {scope === "all" && !isSearching && groups.length > 0 ? (
          <Button
            variant="ghost"
            size="touch"
            className="-my-3 shrink-0 px-2 text-sm text-muted-foreground"
            aria-expanded={allOpen}
            onClick={() =>
              setOpenIds(allOpen ? [] : groups.map((group) => group.category.id))
            }
          >
            {allOpen ? "Zwiń wszystko" : "Rozwiń wszystko"}
          </Button>
        ) : null}
      </div>

      {/* One line instead of a column of dead buttons: without a German voice
          every row's speaker would be disabled, which says the same thing
          worse. */}
      {voice.status === "unsupported" ? (
        <p className="text-sm text-muted-foreground">
          Ta przeglądarka nie obsługuje syntezy mowy, więc odsłuch jest
          niedostępny.
        </p>
      ) : null}

      {voice.status === "missing" ? (
        <p className="text-sm text-muted-foreground">
          System nie ma niemieckiego głosu, więc odsłuch jest niedostępny. W
          Windowsie dodasz go w <em>Ustawienia → Czas i język → Język i region</em>{" "}
          — dodaj niemiecki i doinstaluj pakiet mowy.
        </p>
      ) : null}

      {scopedFound === 0 ? (
        <NoMatches
          query={query.trim()}
          isScoped={scope !== "all"}
          elsewhere={totalFound}
          onWiden={() => setScope("all")}
        />
      ) : scope === "all" ? (
        <Accordion
          multiple
          value={openIds}
          onValueChange={(value) => setOpenIds(value as CategoryId[])}
          className="border-t border-border"
        >
          {groups.map(({ category, phrases }) => (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionTrigger className="min-h-14 items-center gap-3 px-1 hover:no-underline">
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-base font-medium">{category.name}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {category.description}
                  </span>
                </span>

                <Badge
                  variant="secondary"
                  className="shrink-0 tabular-nums"
                  aria-hidden
                >
                  {phrases.length}
                </Badge>
              </AccordionTrigger>

              <AccordionContent className="pb-3">
                <PhraseList phrases={phrases} voice={voice} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <SingleCategory
          category={CATEGORIES.find((item) => item.id === scope)}
          phrases={phrasesByCategory.get(scope) ?? []}
          isSearching={isSearching}
          voice={voice}
        />
      )}
    </div>
  );
}

/** A filter chip. 44px tall, because it is a thumb target before it is a label. */
function ScopeChip({
  label,
  count,
  isActive,
  onSelect,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  // A chip that would lead to an empty screen is not worth a tap — but the
  // active one stays live, or a search with no hits here would trap the user.
  const isDead = count === 0 && !isActive;

  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="touch"
      aria-pressed={isActive}
      disabled={isDead}
      onClick={(event) => {
        onSelect();
        centerInChipRow(event.currentTarget);
      }}
      className="rounded-full px-4 text-sm"
    >
      {label}
      <span
        className={cn(
          "text-xs tabular-nums",
          isActive ? "opacity-70" : "text-muted-foreground",
        )}
      >
        {count}
      </span>
    </Button>
  );
}

/** The filtered view: no folding, because the chip above already named it. */
function SingleCategory({
  category,
  phrases,
  isSearching,
  voice,
}: {
  category: Category | undefined;
  phrases: readonly Phrase[];
  isSearching: boolean;
  voice: GermanVoice;
}) {
  if (!category) return null;

  return (
    <section className="flex flex-col">
      <h2 className="text-base font-medium">{category.name}</h2>

      {!isSearching ? (
        <p className="pt-1 text-sm text-muted-foreground">
          {category.description}
        </p>
      ) : null}

      <div className="pt-2">
        <PhraseList phrases={phrases} voice={voice} />
      </div>
    </section>
  );
}

function PhraseList({
  phrases,
  voice,
}: {
  phrases: readonly Phrase[];
  voice: GermanVoice;
}) {
  return (
    <ul className="flex flex-col divide-y divide-border/60 border-t border-border/60">
      {phrases.map((phrase) => (
        <PhraseRow key={phrase.id} phrase={phrase} voice={voice} />
      ))}
    </ul>
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

/**
 * The dead end, and the way out of it.
 *
 * A filter the user set three scrolls ago is the usual reason a search looks
 * empty, so when the phrase exists in another category the escape hatch says
 * how many hits are waiting rather than just offering to clear the filter.
 */
function NoMatches({
  query,
  isScoped,
  elsewhere,
  onWiden,
}: {
  query: string;
  isScoped: boolean;
  elsewhere: number;
  onWiden: () => void;
}) {
  const hasHitsElsewhere = isScoped && elsewhere > 0;

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {hasHitsElsewhere ? <ListFilter /> : <Search />}
        </EmptyMedia>
        <EmptyTitle>
          {query ? `Nic nie pasuje do „${query}”` : "Tu nic nie ma"}
        </EmptyTitle>
        <EmptyDescription>
          {hasHitsElsewhere
            ? "W tej kategorii nie ma trafień, ale w pozostałych owszem."
            : "Spróbuj krótszego fragmentu — szukanie działa po obu językach i nie wymaga znaków diakrytycznych."}
        </EmptyDescription>
      </EmptyHeader>

      {hasHitsElsewhere ? (
        <EmptyContent>
          <Button variant="outline" size="touch" onClick={onWiden}>
            Szukaj we wszystkich kategoriach ({elsewhere})
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
