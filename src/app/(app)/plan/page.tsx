import type { Metadata } from "next";

import { PlanTracker } from "@/features/plan/plan-tracker";

export const metadata: Metadata = {
  title: "Plan nauki",
  description:
    "Cztery tygodnie nauki niemieckiego: dzienne checklisty, postęp tygodnia i seria dni z rzędu.",
};

export default function PlanPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <PlanTracker />
    </main>
  );
}
