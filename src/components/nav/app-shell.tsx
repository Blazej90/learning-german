"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/nav/app-header";
import { BottomNav } from "@/components/nav/bottom-nav";
import { cn } from "@/lib/utils";

/**
 * Routes that take over the screen: no tab bar, and the header offers a close
 * button instead of the account. A review session is the only one — the bottom
 * strip there belongs to the rating buttons, which have to be under the thumb.
 */
const IMMERSIVE_ROUTES: readonly string[] = ["/review"];

/** Header, content and tab bar in the order the phone reads them. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const immersive = IMMERSIVE_ROUTES.includes(pathname);

  return (
    <>
      <AppHeader immersive={immersive} />

      {/* Without the reserved space the tab bar, being fixed, would sit on top
          of the last item of every scrolling list. */}
      <div className={cn("flex flex-1 flex-col", !immersive && "pb-nav")}>
        {children}
      </div>

      {immersive ? null : <BottomNav />}
    </>
  );
}
