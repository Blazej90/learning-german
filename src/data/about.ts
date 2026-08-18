/**
 * Authorship, and the content of the `/about` screen.
 *
 * One file rather than strings scattered across the login footer, the About
 * screen and the page metadata: adding a link or correcting a surname should be
 * a single edit, not a hunt through JSX.
 */

export type AuthorLink = {
  /** How the link is labelled in the interface. */
  label: string;
  /**
   * `null` means the address does not exist yet. Such a link is skipped
   * everywhere it would be rendered, so filling one in later is one line here
   * rather than new markup in three files.
   */
  href: string | null;
  /** One line of context. Only the About screen has room for it. */
  note: string;
};

/** An `AuthorLink` that has an address, and can therefore be rendered. */
export type PublishedLink = AuthorLink & { href: string };

const LINKS: readonly AuthorLink[] = [
  {
    label: "Portfolio",
    href: "https://blazej-portfolio-sand.vercel.app/",
    note: "Pozostałe projekty i sposób, w jaki je buduję.",
  },
  {
    label: "GitHub",
    href: "https://github.com/Blazej90",
    note: "Kod tej aplikacji i reszta repozytoriów.",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/błażej-bartoszewski-36b7162b7",
    note: "Doświadczenie zawodowe i kontakt.",
  },
];

export const AUTHOR = {
  name: "Błażej Bartoszewski",
  role: "Frontend developer",
  links: LINKS,
};

/** The links that actually have an address. */
export function authorLinks(): PublishedLink[] {
  return AUTHOR.links.filter(
    (link): link is PublishedLink => link.href !== null,
  );
}

/**
 * Where "who made this" points when only one address fits — the `author` meta
 * tag, for one. Portfolio first, because that is the page written for a reader
 * rather than for a compiler.
 */
export function authorHomepage(): string | undefined {
  return authorLinks()[0]?.href;
}

export type StackEntry = {
  name: string;
  /** What it does *here* — a bare list of package names says nothing. */
  role: string;
};

/**
 * The stack, on the About screen.
 *
 * Kept as content rather than read from `package.json`: the interesting part is
 * what each piece is doing in this app, and a dependency list cannot say that.
 */
export const STACK: readonly StackEntry[] = [
  {
    name: "Next.js · App Router",
    role: "Ekrany renderowane po stronie serwera i PWA, którą da się zainstalować na telefonie.",
  },
  {
    name: "TypeScript",
    role: "Model danych i algorytm powtórek opisane typami, nie komentarzem.",
  },
  {
    name: "Tailwind · shadcn/ui",
    role: "Interfejs projektowany pod kciuk: cele dotykowe od 44 px, tryb jasny i ciemny.",
  },
  {
    name: "Firebase Auth · Firestore",
    role: "Konto i postępy wspólne dla telefonu i komputera, z zapisem działającym offline.",
  },
  {
    name: "Vitest",
    role: "Testy algorytmu SM-2 — zły interwał powtórki nie rzuca wyjątku, więc złapać go może tylko test.",
  },
  {
    name: "Vercel",
    role: "Deploy prosto z gałęzi main.",
  },
];
