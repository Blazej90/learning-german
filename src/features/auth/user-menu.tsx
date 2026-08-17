"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";

/**
 * Who is signed in, plus the way out. Renders nothing until that is known.
 *
 * Icon-only in the app bar — the label would crowd a 48px row on a phone, and
 * signing out is not something you reach for often enough to spend the width.
 */
export function UserMenu() {
  const { status, user, signOut } = useAuth();

  if (status !== "signed-in" || !user) return null;

  const who = user.displayName ?? user.email ?? "";

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-40 truncate text-sm text-muted-foreground sm:inline">
        {who}
      </span>
      <Button
        variant="ghost"
        size="icon-touch"
        onClick={() => void signOut()}
        aria-label={who ? `Wyloguj się (${who})` : "Wyloguj się"}
        title="Wyloguj się"
      >
        <LogOut />
      </Button>
    </div>
  );
}
