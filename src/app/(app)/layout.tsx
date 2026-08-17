import type { ReactNode } from "react";

import { AppShell } from "@/components/nav/app-shell";
import { AuthGate } from "@/features/auth/auth-gate";

/**
 * Shell for everything behind the login.
 *
 * The gate wraps the shell rather than the other way round, so a signed-out
 * visitor never sees a tab bar flash before the redirect to `/login`.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}
