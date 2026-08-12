import Link from "next/link";
import type { Metadata } from "next";

import { ReviewSession } from "@/features/flashcards/review-session";

export const metadata: Metadata = {
  title: "Powtórki",
  description: "Sesja fiszek na dziś: zwroty do powtórzenia i nowe zwroty.",
};

export default function ReviewPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Start
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Powtórki</h1>
      </header>

      <ReviewSession />
    </main>
  );
}
