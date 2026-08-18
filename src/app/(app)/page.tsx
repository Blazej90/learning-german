import { AuthorCredit } from "@/features/about/author-credit";
import { Dashboard } from "@/features/dashboard/dashboard";
import { ResourceList } from "@/features/dashboard/resource-list";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10">
      <Dashboard />

      <ResourceList />

      {/* `mt-auto` so it sits at the bottom of the screen rather than halfway
          up it while the dashboard is still loading its skeleton. */}
      <footer className="mt-auto">
        <AuthorCredit />
      </footer>
    </main>
  );
}
