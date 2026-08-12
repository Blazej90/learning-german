import type { Metadata } from "next";

import { SignInPanel } from "@/features/auth/sign-in-panel";

export const metadata: Metadata = {
  title: "Logowanie",
  description: "Zaloguj się, żeby postępy w nauce działały na każdym urządzeniu.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Niemiecki</h1>
      <p className="mt-3 text-muted-foreground">
        Fiszki z powtórkami i tracker planu. Zaloguj się, żeby postępy
        synchronizowały się między telefonem a komputerem.
      </p>

      <div className="mt-8">
        <SignInPanel />
      </div>
    </main>
  );
}
