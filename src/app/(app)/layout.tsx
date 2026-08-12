import type { ReactNode } from "react";

import { AuthGate } from "@/features/auth/auth-gate";
import { UserMenu } from "@/features/auth/user-menu";

/**
 * Shell for everything behind the login: a thin header with the account, and
 * the gate that sends signed-out visitors to `/login`.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="flex justify-end px-6 py-4">
        <UserMenu />
      </header>
      <AuthGate>{children}</AuthGate>
    </>
  );
}
