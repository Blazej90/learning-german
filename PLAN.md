# Architektura i rozstrzygnięcia — aplikacja do nauki niemieckiego

Aplikacja webowa (PWA) do nauki niemieckiego: talia fiszek z algorytmem powtórek plus tracker 4-tygodniowego planu, z zapisem postępów w chmurze. Treść wyszła z `start-learning-german.md`, ale od tego czasu urosła — źródłem prawdy jest kod w `src/data/`.

**Plan realizacji jest wykonany w całości, więc ten plik przestał być harmonogramem.** Zostaje w nim to, czego nie widać w kodzie: kontrakt danych w Firestore i powody, dla których rzeczy są takie, jakie są. Zasady pracy nad projektem — `AGENT.md`.

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

## 2. Model danych

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

## 3. Algorytm powtórek

Cztery oceny mapowane na jakość SM-2: **Nie znam** (0) · **Trudne** (3) · **Dobrze** (4) · **Łatwe** (5).

Współczynnik łatwości jest czystym SM-2: `EF' = EF + (0.1 − (5−q) × (0.08 + (5−q) × 0.02))`, start 2.5, dolny limit 1.3, przeliczany przy każdej ocenie — również przy porażce.

**Odstępy nie są już czystym SM-2, tylko wariantem w stylu Anki.** Oryginał dawał trzem pozytywnym ocenom niemal ten sam termin przez pierwszy miesiąc życia fiszki: pierwsza powtórka 1 dzień, druga 6 dni niezależnie od oceny, trzecia rozjazd 14/15/16 dni. Cztery przyciski wskazujące ten sam dzień to cztery przyciski, które wyglądają na zepsute.

- **Nie znam** → `repetitions = 0`, powrót jutro, `lapses++`
- pierwsza powtórka nowej fiszki ma trzy osobne szczeble: **Trudne** 1 dzień, **Dobrze** 2 dni, **Łatwe** 4 dni
- **Trudne** → `interval × 1,2`, z pominięciem EF, przycięte z góry do wartości „Dobrze", żeby rampa się nie odwróciła
- **Dobrze** → `round(interval × EF)`
- **Łatwe** → `round(interval × EF × 1,3)`, nigdy mniej niż „Dobrze" + 1
- dolny limit powtórki innej niż pierwsza: 2 dni

Stałe siedzą w `src/features/srs/types.ts`. `schedule(card, rating, now) → card` w `src/features/srs/schedule.ts` jest czystą funkcją, w pełni testowalną. Kolejka na dziś = fiszki z `dueDate ≤ dziś` + limit nowych dziennie (domyślnie 8, zgodnie z „5–10 nowych zwrotów" z planu).

**Dlaczego „Dobrze" na nowej fiszce daje 2 dni, a nie 1.** Anki domyślnie wypuszcza świeżą kartę na jutro niezależnie od oceny, zakładając, że jedno spojrzenie to słaby dowód: „Dobrze" wciśnięte sekundę po odsłonięciu odpowiedzi zwykle znaczy „rozpoznałem", a nie „przypomniałem sobie". To założenie pasuje do talii nowego materiału. Ta talia jest powtórkową — plik źródłowy nazywa ją „listą zwrotów do przypomnienia" — więc spora część kart jest już częściowo znana przy pierwszym pokazaniu. Dwa dni, a nie trzy: wciąż wystarczająco blisko, żeby złapać zwrot tylko rozpoznany, i wystarczająco daleko, żeby „Dobrze" i „Trudne" przestały znaczyć to samo.

Istniejące fiszki nie wymagały migracji przy zmianach odstępów — nowe wartości wyliczają się z `interval` i `easeFactor`, które każdy zapisany dokument już miał.

### Rozstrzygnięcia

- **`introducedAt`** — bez zapisanej daty pierwszego pokazania limit nowych fiszek jest nieegzekwowalny: ponowne otwarcie aplikacji tego samego dnia wydaje kolejną porcję. Stąd dodatkowe pole w `cards`.
- **Termin liczony od początku dnia**, nie od momentu powtórki — ocena o 23:45 i o 6:30 wyznacza ten sam dzień następnej powtórki.
- **EF spada również przy porażce** (zgodnie z oryginalnym SM-2), więc uporczywie mylona fiszka dostaje trwale krótsze interwały, a nie tylko wraca jutro.

## 4. Rozstrzygnięcia z implementacji

### Firebase i dane

- **Logowanie jest wymagane** — każda strona poza `/login` przekierowuje niezalogowanego. Jedno źródło prawdy (Firestore) zamiast godzenia stanu lokalnego z chmurowym.
- **`phraseId` jest identyfikatorem dokumentu**, więc nie powtarza się w jego polach. Zapis oceny to `setDoc` po znanym id, bez zapytania.
- **Znaczniki czasu z urządzenia**, nie `serverTimestamp()` — offline serwerowy znacznik zostaje `null` do synchronizacji, co przekłamałoby datę każdej powtórki zrobionej bez zasięgu.
- **Zapisy nie są awaitowane w UI.** Z persystencją offline zapis jest trwały w IndexedDB natychmiast, ale jego `Promise` rozwiązuje się dopiero po potwierdzeniu z serwera. Odrzucenie oznacza więc realną odmowę (reguły, wygasła sesja) — i tylko wtedy pokazujemy komunikat.
- **Migracja z localStorage jest jednokierunkowa i konfliktów nie rozstrzyga po stronie urządzenia** — wysyłane są wyłącznie zwroty, których nie ma jeszcze w Firestore. Lokalna kopia zostaje jako backup; powtórce migracji zapobiega flaga z `uid`.
- **Brak konfiguracji to normalny stan, nie awaria** — bez `.env.local` aplikacja startuje i na `/login` wypisuje brakujące zmienne środowiskowe.

### Tracker planu

- **`streak` nie jest polem w bazie, tylko funkcją z `planProgress`.** Licznik trzymany w dokumencie użytkownika trzeba aktualizować przy każdym odhaczeniu i po każdej przerwie — a gdy raz się rozjedzie (dwa urządzenia, zapis offline), nic go nie naprawi. Wyliczanie z odhaczonych dni jest czystą funkcją i zawsze zgadza się z tym, co widać na ekranie.
- **Serię podtrzymuje jedno zadanie, nie cały dzień**, a dzisiejszy dzień jej nie przerywa, dopóki się nie skończy. Wczorajszy pusty dzień przerywa ją bez wyjątków.
- **Dni z przyszłości są zablokowane** — plan, w którym można odhaczyć jutro, przestaje cokolwiek mówić o tym, co faktycznie zrobiłeś.
- **`planStartDate` zapisuje się na wyraźne kliknięcie**, nie przy pierwszym wejściu na `/plan`. Inaczej dzień pierwszy wypadałby wtedy, gdy przypadkiem zajrzałeś na stronę.
- **Zapis dnia jest scalający (`merge`)**, żeby przełączenie checkboxa nie kasowało pola `note` z modelu danych.
- **`completedAt` to znacznik z urządzenia**, ustawiany przy odhaczeniu trzeciego zadania i czyszczony do `null`, gdy któreś wróci do odznaczonego — z tego samego powodu co w logu powtórek.

### Dashboard

- **Dashboard nie ma własnego stanu planu** — korzysta z tego samego `usePlanTracker`, co `/plan`. Zadanie odhaczone na stronie głównej to ten sam dokument, więc nie ma czego synchronizować.
- **Wykres to wbudowany SVG, nie biblioteka.** Trzydzieści liczb nie uzasadnia zależności (recharts to ~100 kB), a `viewBox` skaluje całość na telefonie za darmo. Wartości są dostępne również w tabeli pod wykresem — tooltip niczego nie zamyka.
- **Historia powtórek to zapytanie zakresowe po jednym polu** (`reviewedAt >= …`), więc Firestore nie potrzebuje indeksu złożonego i `firestore.indexes.json` zostaje pusty.
- **Puste dni zostają w wykresie.** Pominięcie ich ścisnęłoby oś i przerwana seria wyglądałaby na ciągłą.
- **Adresy materiałów:** w `start-learning-german.md` są tylko dwa (Nicos Weg, Goethe-Institut). Pozostałe to oficjalne strony serwisów wymienionych w pliku z nazwy — warto je zweryfikować przy okazji.

### PWA i deploy

- **Service worker jest napisany ręcznie** (`public/sw.js`, ~130 linii), bez `next-pwa` ani `@serwist/next`. Dane i tak są offline dzięki persystencji Firestore, więc worker odpowiada wyłącznie za powłokę aplikacji — a wtyczka budująca własny worker to zależność, która lubi się rozjeżdżać z każdą nową wersją Next i Turbopacka.
- **Strategie cache'owania:** nawigacje — sieć z awaryjnym cache'em (świeża treść, gdy jest zasięg); `/_next/static/*` — cache first (URL zmienia się razem z zawartością); reszta zasobów tego samego origin — stale-while-revalidate. Zapytania cross-origin (Firestore, Auth) worker przepuszcza bez dotykania.
- **Payloady RSC (`?_rsc=`) nie są cache'owane.** Nieaktualny payload psuje nawigację po stronie klienta; pozwalając mu polec bez zasięgu, wymuszamy pełne przeładowanie strony — a na nie worker ma odpowiedź.
- **Rejestracja tylko w produkcji.** Worker cache'ujący wyjście Turbopacka podawałby wczorajszy bundle i każda zmiana wyglądałaby na nieudaną.
- **Jedna grafika na wszystkie ikony** — `public/icons/icon.svg`, z marginesami wewnątrz środkowych 80%, więc ten sam plik przechodzi przez maskę Androida. PNG-i są wygenerowane i zacommitowane; projekt nie ma zależności do rasteryzacji.
- **Deploy zostaje po stronie Błażeja** (konto Vercela, zmienne środowiskowe, dopisanie domeny do Authorized domains w Firebase Auth). Kroki spisane w `README.md`.

## 5. Ryzyka

- **Klucze Firebase w kliencie** — są publiczne z natury; bezpieczeństwo opiera się wyłącznie na regułach Firestore. Reguły są napisane, ale **nie mają testów** — to jedyna granica bezpieczeństwa w projekcie, której nic nie pilnuje automatycznie.
- **Głosy TTS** — jakość i dostępność `de-DE` zależą od systemu; iOS Safari bywa zawodny. Zabezpieczone: przycisk wymowy wyłącza się, gdy brak niemieckiego głosu, i mówi dlaczego, zamiast czytać z polskim akcentem.
- **Stabilność `id` zwrotów** — zmiana id zrywa powiązanie ze stanem SRS w bazie. Zabezpieczone: `src/data/phrases.test.ts` trzyma listę wszystkich wydanych id i czerwienieje, gdy któreś zniknie. Nowe zwroty trzeba do niej dopisać, inaczej zostają poza ochroną.
- **Strefy czasowe** — „dziś" liczone lokalnie u użytkownika, nie w UTC, inaczej streak psuje się po północy. Zabezpieczone przez `startOfDay` w `src/features/srs/date.ts`.
