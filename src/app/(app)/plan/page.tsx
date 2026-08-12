import Link from "next/link";
import type { Metadata } from "next";

import { PlanTracker } from "@/features/plan/plan-tracker";

export const metadata: Metadata = {
  title: "Plan nauki",
  description:
    "Cztery tygodnie nauki niemieckiego: dzienne checklisty, postęp tygodnia i seria dni z rzędu.",
};

export default function PlanPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Start
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Plan nauki
        </h1>
      </header>

      <PlanTracker />
    </main>
  );
}
