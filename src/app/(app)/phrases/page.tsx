import type { Metadata } from "next";

import { PhraseBrowser } from "@/features/phrases/phrase-browser";

export const metadata: Metadata = {
  title: "Zwroty",
  description: "Wszystkie zwroty z zestawu startowego, pogrupowane w kategorie.",
};

export default function PhrasesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <PhraseBrowser />
    </main>
  );
}
