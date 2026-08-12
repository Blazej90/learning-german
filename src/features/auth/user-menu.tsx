"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";

/** Who is signed in, plus the way out. Renders nothing until that is known. */
export function UserMenu() {
  const { status, user, signOut } = useAuth();

  if (status !== "signed-in" || !user) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-muted-foreground sm:inline">
        {user.displayName ?? user.email}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void signOut()}
        title="Wyloguj się"
      >
        <LogOut />
        Wyloguj
      </Button>
    </div>
  );
}
