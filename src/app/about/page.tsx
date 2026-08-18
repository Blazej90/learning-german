import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/data/categories";
import { PHRASES } from "@/data/phrases";
import { AUTHOR, STACK, authorLinks } from "@/data/about";
import { TOTAL_PLAN_DAYS } from "@/features/plan/progress";

export const metadata: Metadata = {
  title: "O aplikacji",
  description: `Kartoffel — fiszki z powtórkami i tracker planu nauki niemieckiego. Aplikację napisał ${AUTHOR.name}.`,
};

/**
 * The colophon: what this is, who made it, what it is built from.
 *
 * Deliberately outside the `(app)` group, so it sits in front of the login
 * rather than behind it. Someone who opens a link to this app without an
 * account sees exactly one screen — and "kto to napisał" is the one question
 * that screen should still be able to answer.
 *
 * No tab bar either, for the same reason `/review` has none: this is a pushed
 * screen with one way back, not a fifth destination.
 */
export default function AboutPage() {
  const links = authorLinks();

  return (
    <main className="pt-safe mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-6">
      <div className="flex flex-col gap-10 pt-2">
        <div>
          {/* Pulled into the page's own margin so the arrow lines up with the
              text below it rather than with the button's padding. */}
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="ghost"
            size="touch"
            className="-ml-4"
          >
            <ArrowLeft />
            Wróć
          </Button>
        </div>

        <header className="flex flex-col gap-3">
          <h1>
            <Logo
              markClassName="size-11"
              wordClassName="text-3xl"
              className="gap-3"
            />
          </h1>
          <p className="text-muted-foreground">
            Fiszki z powtórkami i tracker czterotygodniowego planu nauki
            niemieckiego. Nazwę czyta się dwujęzycznie: „karto-” jak karta,
            „Kartoffel” jak ziemniak.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Co to jest</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Aplikacja pilnuje, kiedy wrócić do którego zwrotu. Ten, który
            znasz, wraca coraz rzadziej. Ten, na którym się pomylisz — już
            jutro. Terminy wylicza algorytm SM-2.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Obok fiszek chodzi plan na cztery tygodnie: codzienna lista zadań i
            licznik dni z rzędu. Wszystko działa offline, a aplikację można
            zainstalować na ekranie głównym telefonu.
          </p>

          <dl className="grid grid-cols-3 gap-2 sm:gap-4">
            <Figure value={PHRASES.length} label="zwrotów" />
            <Figure value={CATEGORIES.length} label="kategorii" />
            <Figure value={TOTAL_PLAN_DAYS} label="dni planu" />
          </dl>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Autor</h2>

          <div className="flex flex-col gap-1">
            <p className="text-xl font-semibold tracking-tight">
              {AUTHOR.name}
            </p>
            <p className="text-sm text-muted-foreground">{AUTHOR.role}</p>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Uczę się niemieckiego i potrzebowałem czegoś, co pomoże mi trzymać
            się planu — stąd ta aplikacja. Powstała pod materiał, który
            faktycznie przerabiam, i rośnie razem z nim.
          </p>

          {links.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.href}>
                  {/* Full-width rows, 44 px tall: this is the version of the
                      links meant to be tapped, unlike the credit line. */}
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-11 items-center gap-3 rounded-xl bg-card px-4 py-2.5 ring-1 ring-foreground/10 transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-medium">{link.label}</span>
                      <span className="truncate text-sm text-muted-foreground">
                        {link.note}
                      </span>
                    </span>
                    <ExternalLink
                      aria-hidden
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Jak to zbudowane
          </h2>
          <dl className="flex flex-col gap-4">
            {STACK.map((entry) => (
              <div key={entry.name} className="flex flex-col gap-0.5">
                <dt className="text-sm font-medium">{entry.name}</dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">
                  {entry.role}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}

/** One number from the deck, with its unit under it. */
function Figure({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-card px-3 py-3 ring-1 ring-foreground/10">
      <dt className="sr-only">{label}</dt>
      <dd className="flex flex-col gap-0.5">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        <span className="truncate text-xs text-muted-foreground">{label}</span>
      </dd>
    </div>
  );
}
