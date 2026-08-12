import Link from "next/link";

import { Dashboard } from "@/features/dashboard/dashboard";
import { ResourceList } from "@/features/dashboard/resource-list";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Niemiecki od podstaw do rozmowy
        </h1>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/plan" className="underline-offset-4 hover:underline">
            Plan
          </Link>
          <Link href="/phrases" className="underline-offset-4 hover:underline">
            Zwroty
          </Link>
        </nav>
      </header>

      <Dashboard />

      <ResourceList />
    </main>
  );
}
