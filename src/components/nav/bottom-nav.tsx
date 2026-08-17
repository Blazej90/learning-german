"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarCheck, House, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useDueCount } from "@/features/flashcards/use-due-count";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Only "Powtórki" carries a count — one number, or it stops meaning anything. */
  showsDueCount?: boolean;
};

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Start", icon: House },
  { href: "/review", label: "Powtórki", icon: Layers, showsDueCount: true },
  { href: "/plan", label: "Plan", icon: CalendarCheck },
  { href: "/phrases", label: "Zwroty", icon: BookOpen },
];

/**
 * The app's primary navigation, parked under the thumb.
 *
 * On a 6.7" phone the top-left corner is the furthest point from a thumb
 * holding the device, which is exactly where the old "← Start" links were.
 * Everything reachable now sits in the bottom band instead.
 *
 * Hidden on `/review` by `AppShell`: a session is a focus mode, and the bottom
 * strip belongs to the rating buttons there.
 */
export function BottomNav() {
  const pathname = usePathname();
  const dueCount = useDueCount();

  return (
    <nav
      aria-label="Nawigacja główna"
      className="pb-safe px-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/85 backdrop-blur-lg"
    >
      <ul className="mx-auto flex w-full max-w-lg items-stretch">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          const badge =
            item.showsDueCount && dueCount !== null && dueCount > 0
              ? dueCount
              : null;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  // 56px of height plus the safe-area inset: comfortably past
                  // the 44px iOS asks for, without eating the screen.
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium transition-colors",
                  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="relative">
                  <Icon
                    aria-hidden
                    className="size-5"
                    // The active tab reads as filled without a second icon set.
                    strokeWidth={isActive ? 2.4 : 1.8}
                  />
                  {badge !== null ? (
                    <span
                      aria-hidden
                      className="absolute -top-1.5 -right-2.5 min-w-4 rounded-full bg-brand px-1 text-center text-[0.625rem] leading-4 font-semibold text-brand-foreground tabular-nums"
                    >
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </span>
                <span>{item.label}</span>
                {/* The badge is decorative above; the count reaches screen
                    readers here instead of as a bare number beside a label. */}
                {badge !== null ? (
                  <span className="sr-only">
                    {`— ${badge} do zrobienia`}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
