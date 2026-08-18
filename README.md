# Kartoffel — niemiecki na fiszkach

PWA do nauki niemieckiego: talia fiszek z powtórkami SM-2 i tracker
4-tygodniowego planu. Treść pochodzi z `start-learning-german.md`, postępy
z Firestore.

Nazwa czyta się dwujęzycznie: „karto-" jak karta/fiszka, „Kartoffel" jak
ziemniak. Logo — ziemniak, który jest fiszką — mieszka w
`public/icons/icon.svg` (źródło ikon PWA, rasteryzowane przez
`scripts/generate-icons.mjs`) i w `src/components/brand/logo.tsx` (pasek
aplikacji). Te dwa pliki trzeba zmieniać razem.

Instrukcje pracy nad projektem: **`AGENT.md`**. Plan i model danych: **`PLAN.md`**.

## Uruchomienie lokalne

```bash
pnpm install          # tylko pnpm — npm i yarn odbiją się od `only-allow`
cp .env.example .env.local
pnpm dev
```

Bez `.env.local` aplikacja startuje, ale `/login` wypisze brakujące zmienne
zamiast formularza. Wartości znajdziesz w konsoli Firebase → Project settings →
Your apps.

| Komenda | Do czego |
|---|---|
| `pnpm dev` | serwer deweloperski |
| `rtk vitest run` | testy logiki SRS i planu |
| `rtk tsc --noEmit` | typy |
| `rtk lint` | eslint |
| `rtk proxy "npx next build"` | build produkcyjny |

## Deploy na Vercel

1. **Import repozytorium** — vercel.com → Add New → Project → wskaż to repo.
   Preset Next.js, Node 22; reszta ustawień domyślna.
2. **Zmienne środowiskowe** — w Settings → Environment Variables wklej wszystkie
   sześć `NEXT_PUBLIC_FIREBASE_*` z `.env.local` (Production, Preview i
   Development). Klucze są publiczne z natury — chronią nas reguły Firestore,
   nie ukrywanie kluczy.
3. **Domena w Firebase** — Authentication → Settings → Authorized domains →
   dodaj `<projekt>.vercel.app`. Bez tego logowanie Google zwróci
   `auth/unauthorized-domain`.
4. **Reguły Firestore** — `firebase deploy --only firestore:rules` albo wklejenie
   `firestore.rules` w konsoli. Reguły są tym samym plikiem dla wszystkich
   środowisk.

## Instalacja na telefonie

Otwórz adres z Vercela (musi być HTTPS — `localhost` nie wystarczy do instalacji
z telefonu) i wybierz:

- **Android / Chrome:** menu → „Zainstaluj aplikację".
- **iOS / Safari:** Udostępnij → „Dodaj do ekranu początkowego".

Po instalacji aplikacja otwiera się bez paska przeglądarki. Odwiedzone ekrany
działają bez zasięgu, a oceny fiszek trafiają do IndexedDB i dosyłają się przy
kolejnym połączeniu.

## Ikony

`public/icons/icon.svg` jest źródłem wszystkich PNG-ów (`public/icons/icon-192`,
`icon-512`, `src/app/icon.png`, `src/app/apple-icon.png`). Po zmianie SVG
wygeneruj je ponownie — projekt nie ma zależności do rasteryzacji, więc
najprościej `pnpm dlx sharp-cli` albo dowolny konwerter.
