"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/features/auth/user-menu";

/**
 * The screen title, per route.
 *
 * "/" gets the app's name rather than "Start": on the dashboard the hero figure
 * already says what the screen is for, so the bar is free to act as a wordmark.
 */
const TITLES: Record<string, string> = {
  "/": "Niemiecki",
  "/review": "Powtórki",
  "/plan": "Plan nauki",
  "/phrases": "Zwroty",
};

/**
 * One compact bar for every screen.
 *
 * It owns the `h1`, which is why the pages no longer carry their own heading —
 * the old arrangement spent a header row, a "← Start" link and a page title on
 * saying the same thing, roughly 90px of a 932px screen before any content.
 */
export function AppHeader({ immersive }: { immersive: boolean }) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Niemiecki";

  return (
    <header className="pt-safe px-safe sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-12 w-full max-w-3xl items-center gap-2 px-4">
        <h1 className="flex-1 truncate text-base font-semibold tracking-tight">
          {title}
        </h1>

        {/* A session hides the tab bar, so it has to offer its own way out. */}
        {immersive ? (
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="ghost"
            size="icon-touch"
            aria-label="Zakończ sesję i wróć na start"
          >
            <X />
          </Button>
        ) : (
          <UserMenu />
        )}
      </div>
    </header>
  );
}
