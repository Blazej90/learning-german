"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Info, X } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/features/auth/user-menu";

/**
 * The screen title, per route.
 *
 * "/" is absent on purpose: the dashboard shows the logo instead, because the
 * hero figure below it already says what the screen is for. Everywhere else a
 * logo would compete with the page you are actually on.
 */
const TITLES: Record<string, string> = {
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
  const title = TITLES[pathname];

  return (
    <header className="pt-safe px-safe sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-12 w-full max-w-3xl items-center gap-2 px-4">
        <h1 className="min-w-0 flex-1">
          {title ? (
            <span className="block truncate text-base font-semibold tracking-tight">
              {title}
            </span>
          ) : (
            // The wordmark is real text, so the heading still has a name.
            <Logo />
          )}
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
          <>
            {/* "O aplikacji" is not a fifth tab — it is read once and then
                never again, which is exactly what an icon in the bar is for. */}
            <Button
              render={<Link href="/about" />}
              nativeButton={false}
              variant="ghost"
              size="icon-touch"
              aria-label="O aplikacji i jej autorze"
              title="O aplikacji"
            >
              <Info />
            </Button>
            <UserMenu />
          </>
        )}
      </div>
    </header>
  );
}
