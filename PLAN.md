# Plan projektu — aplikacja do nauki niemieckiego

Aplikacja webowa (PWA) budowana na bazie `star learn german.md`: zwroty z tego pliku stają się talią fiszek z algorytmem powtórek, a plan 4 tygodni — interaktywnym trackerem z zapisem postępów w chmurze.

## 1. Decyzje techniczne

| Obszar | Wybór | Uzasadnienie |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | PWA, deploy na Vercel, jeden projekt na desktop i telefon |
| Styl | Tailwind CSS | wymagany przez shadcn i aceternity |
| Komponenty | shadcn/ui jako baza + aceternity na akcenty | shadcn = Button/Card/Dialog/Progress; aceternity = animowana karta fiszki, ekran startowy |
| Menedżer pakietów | **pnpm** (wyłącznie) | wymóg projektu — `packageManager` w package.json + `only-allow` |
| Backend | Firebase Auth (Google) + Firestore | synchronizacja postępów telefon ↔ desktop od pierwszego dnia |
| Hosting | Vercel | darmowy, deploy z gita, HTTPS wymagany przez PWA |
| Wymowa | Web Speech API (`de-DE`) | wbudowane w przeglądarkę, zero kosztów API |
| Testy | Vitest | tylko dla logiki SRS — tam błąd jest niewidoczny gołym okiem |

**Poza zakresem MVP** (świadomie odłożone): quizy i tryby ćwiczeń, generowanie zdań przez AI, import/eksport do Anki.

## 2. Struktura katalogów i aliasy

```
learn-german/
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login/page.tsx
│  │  ├─ (app)/
│  │  │  ├─ page.tsx              # dashboard — co na dziś
│  │  │  ├─ review/page.tsx       # sesja fiszek
│  │  │  ├─ plan/page.tsx         # tracker 4 tygodni
│  │  │  └─ phrases/page.tsx      # przeglądarka wszystkich zwrotów
│  │  ├─ layout.tsx
│  │  └─ manifest.ts              # manifest PWA
│  ├─ components/
│  │  ├─ ui/                      # shadcn (generowane)
│  │  └─ aceternity/              # komponenty animowane
│  ├─ features/
│  │  ├─ srs/                     # algorytm SM-2 (czysta logika, bez Reacta)
│  │  ├─ flashcards/              # UI sesji powtórek
│  │  ├─ plan/                    # tracker planu nauki
│  │  └─ auth/                    # kontekst użytkownika
│  ├─ lib/
│  │  ├─ firebase/                # client.ts, firestore.ts, reguły
│  │  ├─ tts.ts                   # Web Speech API
│  │  └─ utils.ts                 # cn() od shadcn
│  ├─ data/
│  │  ├─ phrases.ts               # ~50 zwrotów z star learn german.md
│  │  ├─ categories.ts            # 7 kategorii
│  │  └─ study-plan.ts            # 4 tygodnie zadań
│  ├─ hooks/
│  └─ types/
├─ star learn german.md           # źródło treści — zostaje jako referencja
└─ PLAN.md
```

Aliasy w `tsconfig.json` (`paths`) — bez `../../..` w żadnym imporcie:

```json
"@/*":            ["./src/*"]
"@/components/*": ["./src/components/*"]
"@/features/*":   ["./src/features/*"]
"@/lib/*":        ["./src/lib/*"]
"@/data/*":       ["./src/data/*"]
"@/hooks/*":      ["./src/hooks/*"]
"@/types/*":      ["./src/types/*"]
```

`components.json` (shadcn) dostaje te same aliasy, żeby generowane komponenty trafiały we właściwe miejsca.

## 3. Model danych

**Treść (zwroty, plan) leży w repo jako TypeScript, nie w bazie.** Powód: jest statyczna, zmienia się przez commit, a nie przez UI — trzymanie jej w Firestore to zbędne odczyty i koszt. W bazie ląduje wyłącznie *Twój postęp*.

```ts
// src/data/phrases.ts
type Phrase = {
  id: string          // "greetings-hallo" — stabilne, bo klucz stanu SRS
  de: string          // "Guten Morgen"
  pl: string          // "Dzień dobry (rano)"
  category: CategoryId
  note?: string       // np. "forma formalna"
}
```

Firestore:

```
users/{uid}
  displayName, createdAt, planStartDate, streak, lastReviewDate, timezone

users/{uid}/cards/{phraseId}          # stan SRS jednej fiszki
  repetitions: number
  interval: number                     # w dniach
  easeFactor: number                   # start 2.5, minimum 1.3
  dueDate: Timestamp
  lapses: number
  introducedAt: Timestamp              # początek dnia pierwszego pokazania

users/{uid}/reviews/{autoId}           # log powtórek → wykresy postępu
  phraseId, rating, reviewedAt, previousInterval

users/{uid}/planProgress/{dayId}       # dayId = "w1-d3"
  tasks: { grammar: bool, phrases: bool, listening: bool }
  completedAt, note
```

Reguły bezpieczeństwa: `allow read, write: if request.auth.uid == uid` — dostęp wyłącznie do własnego poddrzewa. Plik: `firestore.rules`, wdrożenie przez `firebase deploy --only firestore:rules`.

Rozstrzygnięcia z implementacji (Faza 4):

- **Logowanie jest wymagane** — każda strona poza `/login` przekierowuje niezalogowanego. Jedno źródło prawdy (Firestore) zamiast godzenia stanu lokalnego z chmurowym.
- **`phraseId` jest identyfikatorem dokumentu**, więc nie powtarza się w jego polach. Zapis oceny to `setDoc` po znanym id, bez zapytania.
- **Znaczniki czasu z urządzenia**, nie `serverTimestamp()` — offline serwerowy znacznik zostaje `null` do synchronizacji, co przekłamałoby datę każdej powtórki zrobionej bez zasięgu.
- **Zapisy nie są awaitowane w UI.** Z persystencją offline zapis jest trwały w IndexedDB natychmiast, ale jego `Promise` rozwiązuje się dopiero po potwierdzeniu z serwera. Odrzucenie oznacza więc realną odmowę (reguły, wygasła sesja) — i tylko wtedy pokazujemy komunikat.
- **Migracja z localStorage jest jednokierunkowa i konfliktów nie rozstrzyga po stronie urządzenia** — wysyłane są wyłącznie zwroty, których nie ma jeszcze w Firestore. Lokalna kopia zostaje jako backup; powtórce migracji zapobiega flaga z `uid`.
- **Brak konfiguracji to normalny stan, nie awaria** — bez `.env.local` aplikacja startuje i na `/login` wypisuje brakujące zmienne środowiskowe.

Rozstrzygnięcia z implementacji (Faza 5):

- **`streak` nie jest polem w bazie, tylko funkcją z `planProgress`.** Licznik trzymany w dokumencie użytkownika trzeba aktualizować przy każdym odhaczeniu i po każdej przerwie — a gdy raz się rozjedzie (dwa urządzenia, zapis offline), nic go nie naprawi. Wyliczanie z odhaczonych dni jest czystą funkcją i zawsze zgadza się z tym, co widać na ekranie.
- **Serię podtrzymuje jedno zadanie, nie cały dzień**, a dzisiejszy dzień jej nie przerywa, dopóki się nie skończy. Wczorajszy pusty dzień przerywa ją bez wyjątków.
- **Dni z przyszłości są zablokowane** — plan, w którym można odhaczyć jutro, przestaje cokolwiek mówić o tym, co faktycznie zrobiłeś.
- **`planStartDate` zapisuje się na wyraźne kliknięcie**, nie przy pierwszym wejściu na `/plan`. Inaczej dzień pierwszy wypadałby wtedy, gdy przypadkiem zajrzałeś na stronę.
- **Zapis dnia jest scalający (`merge`)**, żeby przełączenie checkboxa nie kasowało pola `note` z modelu danych.
- **`completedAt` to znacznik z urządzenia**, ustawiany przy odhaczeniu trzeciego zadania i czyszczony do `null`, gdy któreś wróci do odznaczonego — z tego samego powodu co w logu powtórek.

Rozstrzygnięcia z implementacji (Faza 6):

- **Dashboard nie ma własnego stanu planu** — korzysta z tego samego `usePlanTracker`, co `/plan`. Zadanie odhaczone na stronie głównej to ten sam dokument, więc nie ma czego synchronizować.
- **Wykres to wbudowany SVG, nie biblioteka.** Trzydzieści liczb nie uzasadnia zależności (recharts to ~100 kB), a `viewBox` skaluje całość na telefonie za darmo. Wartości są dostępne również w tabeli pod wykresem — tooltip niczego nie zamyka.
- **Historia powtórek to zapytanie zakresowe po jednym polu** (`reviewedAt >= …`), więc Firestore nie potrzebuje indeksu złożonego i `firestore.indexes.json` zostaje pusty.
- **Puste dni zostają w wykresie.** Pominięcie ich ścisnęłoby oś i przerwana seria wyglądałaby na ciągłą.
- **Adresy materiałów:** w `star learn german.md` są tylko dwa (Nicos Weg, Goethe-Institut). Pozostałe to oficjalne strony serwisów wymienionych w pliku z nazwy — warto je zweryfikować przy okazji.

## 4. Algorytm powtórek (SM-2)

Cztery oceny mapowane na jakość SM-2: **Nie znam** (0) · **Trudne** (3) · **Dobrze** (4) · **Łatwe** (5).

- `EF' = EF + (0.1 − (5−q) × (0.08 + (5−q) × 0.02))`, dolny limit 1.3
- `q < 3` → `repetitions = 0`, `interval = 1` (fiszka wraca jutro, `lapses++`)
- `q ≥ 3` → 1. powtórka: 1 dzień · 2. powtórka: 6 dni · kolejne: `round(interval × EF)`

Czysta funkcja `schedule(card, rating, now) → card`, w pełni testowalna. Kolejka na dziś = fiszki z `dueDate ≤ dziś` + limit nowych dziennie (domyślnie 8, zgodnie z „5–10 nowych zwrotów" z Twojego planu).

Trzy rozstrzygnięcia z implementacji (Faza 2), których nie było w pierwotnym szkicu:

- **`introducedAt`** — bez zapisanej daty pierwszego pokazania limit nowych fiszek jest nieegzekwowalny: ponowne otwarcie aplikacji tego samego dnia wydaje kolejną porcję. Stąd dodatkowe pole w `cards`.
- **Termin liczony od początku dnia**, nie od momentu powtórki — ocena o 23:45 i o 6:30 wyznacza ten sam dzień następnej powtórki.
- **EF spada również przy porażce** (zgodnie z oryginalnym SM-2), więc uporczywie mylona fiszka dostaje trwale krótsze interwały, a nie tylko wraca jutro.

## 5. Fazy realizacji

**Faza 0 — Fundament**
`pnpm create next-app` (TypeScript, Tailwind, App Router), init gita, `pnpm dlx shadcn@latest init`, aliasy w tsconfig i components.json, blokada npm/yarn przez `only-allow`, `.gitignore` z `.env.local`. Efekt: `pnpm dev` startuje.

**Faza 1 — Treść**
Przeniesienie ~50 zwrotów z `star learn german.md` do `src/data/phrases.ts` ze stabilnymi id, kategoriami i typami. Plan 4 tygodni → `study-plan.ts` (28 dni × 3 zadania). Efekt: strona `/phrases` listuje zwroty po kategoriach.

**Faza 2 — Silnik SRS**
Implementacja SM-2 + testy Vitest (awans interwałów, reset po pomyłce, dolny limit EF, budowanie kolejki na dziś). Bez UI, bez Firebase. Efekt: `pnpm test` zielony.

**Faza 3 — Fiszki i wymowa**
Ekran `/review`: karta z animacją odsłonięcia (aceternity), przyciski ocen, pasek postępu sesji, podsumowanie na koniec. Przycisk głośnika czyta niemiecką stronę przez `speechSynthesis` z głosem `de-DE`. Stan tymczasowo w localStorage. Efekt: pełna sesja powtórek działa lokalnie.

**Faza 4 — Firebase**
Projekt w konsoli Firebase, Auth przez Google, klient w `lib/firebase`, reguły Firestore, migracja stanu SRS z localStorage do Firestore, włączona persystencja offline (IndexedDB). Efekt: postępy przeżywają zmianę urządzenia.

**Faza 5 — Tracker planu**
`/plan`: 4 tygodnie, checklisty dzienne, procent ukończenia tygodnia, streak. `planStartDate` wyznacza „dzisiejszy dzień" planu. Efekt: widać, w którym miejscu 4-tygodniowego planu jesteś.

**Faza 6 — Dashboard**
Strona główna: fiszki do powtórki dziś, zadania na dziś, streak, wykres powtórek z 30 dni, linki do materiałów z sekcji 3 pliku źródłowego. Efekt: jedno wejście do aplikacji odpowiada „co mam dziś zrobić".

**Faza 7 — PWA i deploy**
Manifest, ikony, service worker, cache offline, deploy na Vercel, zmienne środowiskowe Firebase w panelu Vercela, instalacja na telefonie. Efekt: ikona na ekranie głównego telefonu, fiszki działają bez zasięgu.

Fazy 0–3 dają samodzielnie użyteczną aplikację — od Fazy 4 możesz już z niej korzystać codziennie, kończąc resztę równolegle z nauką.

## 6. Ryzyka

- **Głosy TTS** — jakość i dostępność `de-DE` zależą od systemu; iOS Safari bywa zawodny. Zapasowo: przycisk wymowy wyłącza się, gdy brak niemieckiego głosu, zamiast czytać z polskim akcentem.
- **Klucze Firebase w kliencie** — są publiczne z natury; bezpieczeństwo opiera się wyłącznie na regułach Firestore, więc trzeba je napisać i przetestować, a nie zostawić w trybie testowym.
- **Stabilność `id` zwrotów** — zmiana id zrywa powiązanie ze stanem SRS w bazie. Id ustalamy raz w Fazie 1 i traktujemy jak klucz główny.
- **Strefy czasowe** — „dziś" liczone lokalnie u użytkownika, nie w UTC, inaczej streak psuje się po północy.

## 7. Zasady pracy

- `pnpm` do wszystkiego — nigdy `npm` ani `yarn`.
- Wszystkie importy przez aliasy.
- **Każdy `git commit` i `git push` po Twojej wyraźnej zgodzie.**
