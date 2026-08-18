import type { Metadata } from "next";

import { Logo } from "@/components/brand/logo";
import { AuthorCredit } from "@/features/about/author-credit";
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

      {/* The only screen in the app with room for a real footer — everywhere
          else the bottom band belongs to the tab bar. It is also the only
          screen someone without an account ever reaches, which makes it the
          one place the authorship has to be. */}
      <footer className="mt-10 border-t border-border pt-5">
        <AuthorCredit />
      </footer>
    </main>
  );
}
