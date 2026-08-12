import Link from "next/link";
import type { Metadata } from "next";

import { CATEGORIES } from "@/data/categories";
import { getPhrasesByCategory, PHRASES } from "@/data/phrases";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Zwroty",
  description: "Wszystkie zwroty z zestawu startowego, pogrupowane w kategorie.",
};

export default function PhrasesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-10">
        <Link
          href="/"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Start
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Zwroty</h1>
        <p className="mt-2 text-muted-foreground">
          {PHRASES.length} zwrotów w {CATEGORIES.length} kategoriach — cały
          materiał, z którego powstaną fiszki.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {CATEGORIES.map((category) => {
          const phrases = getPhrasesByCategory(category.id);

          return (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  {category.name}
                  <Badge variant="secondary">{phrases.length}</Badge>
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-border">
                  {phrases.map((phrase) => (
                    <div
                      key={phrase.id}
                      className="grid gap-1 py-3 sm:grid-cols-2 sm:gap-4"
                    >
                      <dt lang="de" className="font-medium">
                        {phrase.de}
                      </dt>
                      <dd>
                        <span className="text-muted-foreground">
                          {phrase.pl}
                        </span>
                        {phrase.note ? (
                          <span className="mt-1 block text-xs text-muted-foreground/80">
                            {phrase.note}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
