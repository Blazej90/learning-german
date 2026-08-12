# AGENT.md — instrukcje pracy nad projektem

Aplikacja PWA do nauki niemieckiego. Fiszki SRS + tracker planu 4 tygodni, zbudowane na treści z `star learn german.md`. Pełny plan realizacji i model danych: **`PLAN.md`** — przeczytaj go przed rozpoczęciem pracy nad nową fazą.

## Zasady twarde

Naruszenie którejkolwiek to błąd, nie kwestia gustu.

1. **Tylko pnpm.** Nigdy `npm install` ani `yarn`. Instalacja pakietów: `pnpm add`, jednorazowe binaria: `pnpm dlx`. Projekt ma `only-allow pnpm` w `preinstall`, więc npm i tak odbije się z błędem — ale nie polegaj na tym.
2. **Zawsze aliasy w importach.** `@/features/srs/schedule`, nigdy `../../features/srs/schedule`. Dotyczy też testów.
3. **Commit i push wyłącznie po wyraźnej zgodzie Błażeja.** Za każdym razem osobno — zgoda na jeden commit nie przenosi się na następny. Przygotuj zmiany, pokaż co wejdzie, zapytaj.
4. **Sekrety nie trafiają do repo.** Konfiguracja Firebase idzie do `.env.local` (w `.gitignore`) i do panelu Vercela. Klucze `NEXT_PUBLIC_FIREBASE_*` są z natury publiczne — ochroną są reguły Firestore, nie ukrywanie kluczy.
5. **`id` zwrotów są kluczem głównym stanu SRS w bazie.** Zmiana istniejącego `id` w `src/data/phrases.ts` zrywa powiązanie z postępami użytkownika. Dodawać można swobodnie, zmieniać — nie.

## Stack

Next.js (App Router) · TypeScript · Tailwind · shadcn/ui + aceternity · Firebase Auth + Firestore · Vitest · deploy na Vercel · Node 22, pnpm 11.

Komponenty: najpierw sprawdź, czy shadcn ma gotowy (`pnpm dlx shadcn@latest add <nazwa>`) — dopiero potem pisz własny. Aceternity używamy oszczędnie, na akcenty wizualne (karta fiszki, ekran startowy), nie jako bazę systemu komponentów.

## Konwencje

- **Język:** UI i teksty dla użytkownika po polsku (materiał do nauki po niemiecku). Kod, nazwy zmiennych, typy, commity — po angielsku. Rozmowa z Błażejem — po polsku.
- **Logika w `features/`, nie w komponentach.** Algorytm SRS to czyste funkcje bez importów Reacta — dzięki temu jest testowalny.
- **Server Components domyślnie.** `'use client'` tylko tam, gdzie potrzebny jest stan, event handler albo API przeglądarki (TTS, IndexedDB).
- **Testy tylko dla logiki SRS.** Tam błąd jest niewidoczny gołym okiem — zły interwał powtórki nie rzuca wyjątku, po prostu psuje naukę. Reszta UI nie wymaga testów w tym projekcie.

## Definition of done

Zmiana jest skończona, gdy: `rtk tsc --noEmit` przechodzi, `rtk lint` jest czysty, a jeśli ruszałeś `features/srs` — `rtk vitest run` jest zielony. Nie raportuj ukończenia fazy bez uruchomienia tych komend.

## RTK — obowiązkowo

`rtk` (0.43.0, `C:\Users\Błażej\AppData\Local\rtk\rtk.exe`) jest zainstalowany globalnie i **hook Claude Code jest już skonfigurowany w `~/.claude/settings.json`**. Nie uruchamiaj `rtk init` w tym projekcie — wstrzyknęłoby to wygenerowaną treść do lokalnego `CLAUDE.md` i nadpisało te instrukcje.

**Przepisywane automatycznie przez hook** (pisz normalnie, hook zamieni):

| Piszesz | Hook wykonuje |
|---|---|
| `git status`, `git diff`, `git log` | `rtk git …` |
| `pnpm install` | `rtk pnpm install` |
| `npx tsc --noEmit` | `rtk tsc --noEmit` |
| `eslint src` | `rtk lint src` |
| `prettier --check .` | `rtk prettier --check .` |

**NIE przepisywane — wywołuj `rtk` jawnie**, inaczej pełny output leci do kontekstu:

| Zamiast | Użyj |
|---|---|
| `pnpm build` | `rtk proxy "npx next build"` — **nie `rtk next build`**, patrz niżej |
| `pnpm test` | `rtk vitest run` |
| `pnpm lint` | `rtk lint` |
| przeszukiwania plików | `rtk grep <wzorzec>` |

Nieprzepisywane i bez filtra rtk (uruchamiaj normalnie): `pnpm dev`, `pnpm add`, `pnpm dlx`, `firebase …`.

Meta-komendy zawsze bezpośrednio: `rtk gain` (statystyki oszczędności), `rtk gain --history`, `rtk discover` (przegapione okazje), `rtk proxy <cmd>` (wykonanie bez filtrowania, do debugowania gdy podejrzewasz że filtr zjadł istotny output).

Jeśli output rtk wygląda na obcięty w miejscu, które ma znaczenie dla diagnozy — powtórz przez `rtk proxy`, nie zgaduj.

**Znany błąd: `rtk next build` nie buduje.** Na rtk 0.43.0 + Next.js 16.3.0 wypisuje `Errors: 0 | Warnings: 0`, ale zostawia w `.next/` wyłącznie katalog `dev/` (sam typegen) — bez `BUILD_ID`, `server/` i `static/`, przez co `next start` przewraca się na „Could not find a production build". Zielony output jest fałszywie uspokajający, więc do weryfikacji builda używaj `rtk proxy "npx next build"`; jego output to krótka tabelka tras, więc oszczędność tokenów zostaje. `rtk lint` i `rtk tsc --noEmit` działają poprawnie — usterka dotyczy tylko builda. Gdy nowsza wersja rtk to naprawi, usuń ten akapit.
