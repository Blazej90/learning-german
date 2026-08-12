"use client";

/**
 * Keeps `(app)` pages for signed-in users only.
 *
 * The check runs in the browser, not in middleware: the session lives in
 * IndexedDB where the server cannot see it, and gating on the server would mean
 * a round trip on every navigation for an app whose data is already local.
 * This is a UX guard — the actual protection is `firestore.rules`.
 */

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/auth-provider";

export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "signed-out" || status === "unconfigured") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status !== "signed-in") {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-muted-foreground" role="status">
          {status === "loading" ? "Sprawdzam logowanie…" : "Przekierowuję…"}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
