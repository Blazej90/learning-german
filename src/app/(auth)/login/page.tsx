import type { Metadata } from "next";

import { Logo } from "@/components/brand/logo";
import { SignInPanel } from "@/features/auth/sign-in-panel";

export const metadata: Metadata = {
  title: "Logowanie",
  description: "Zaloguj się, żeby postępy w nauce działały na każdym urządzeniu.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1>
        <Logo
          markClassName="size-11"
          wordClassName="text-3xl"
          className="gap-3"
        />
      </h1>
      <p className="mt-3 text-muted-foreground">
        Fiszki z powtórkami i tracker planu nauki niemieckiego. Zaloguj się,
        żeby postępy synchronizowały się między telefonem a komputerem.
      </p>

      <div className="mt-8">
        <SignInPanel />
      </div>
    </main>
  );
}
