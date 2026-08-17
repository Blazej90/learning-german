import type { Metadata } from "next";

import { ReviewSession } from "@/features/flashcards/review-session";

export const metadata: Metadata = {
  title: "Powtórki",
  description: "Sesja fiszek na dziś: zwroty do powtórzenia i nowe zwroty.",
};

export default function ReviewPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 sm:px-6">
      <ReviewSession />
    </main>
  );
}
