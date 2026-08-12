import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/data/categories";
import { PHRASES } from "@/data/phrases";
import { STUDY_DAYS, STUDY_WEEKS } from "@/data/study-plan";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        Niemiecki od podstaw do rozmowy
      </h1>
      <p className="mt-3 max-w-prose text-lg text-muted-foreground">
        {PHRASES.length} zwrotów w {CATEGORIES.length} kategoriach i plan na{" "}
        {STUDY_DAYS.length} dni, podzielony na {STUDY_WEEKS.length} tygodnie.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {/* Base UI (shadcn v4) skleja komponenty przez `render`, nie `asChild`. */}
        <Button render={<Link href="/review" />} size="lg" className="h-11">
          Zacznij powtórki
        </Button>
        <Button
          render={<Link href="/phrases" />}
          variant="outline"
          size="lg"
          className="h-11"
        >
          Przeglądaj zwroty
        </Button>
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        Postępy zapisują się na razie w tej przeglądarce. Synchronizacja między
        urządzeniami i tracker planu powstają w kolejnych fazach.
      </p>
    </main>
  );
}
