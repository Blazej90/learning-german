# CLAUDE.md

Instrukcje pracy nad tym projektem są w **`AGENT.md`** — jedno źródło prawdy, wspólne dla wszystkich narzędzi AI. Zaimportowane poniżej:

@AGENT.md

Model danych Firestore i rozstrzygnięcia z implementacji: **`PLAN.md`**.

## Specyfika Claude Code

- **Zanim ruszysz model danych albo algorytm powtórek, przeczytaj `PLAN.md`** — zapisane są tam powody decyzji, których z kodu nie widać. Logika SRS z testami powstaje przed UI.
- **Nie uruchamiaj `rtk init`** w tym katalogu — hook jest już skonfigurowany globalnie, a `rtk init` nadpisuje lokalny `CLAUDE.md`.
- **Firebase wymaga działań Błażeja w konsoli** (założenie projektu, włączenie logowania Google, pobranie configu). Przygotuj kod i reguły, ale nie próbuj zakładać zasobów w Google Cloud — poproś o wykonanie kroku i podanie configu do `.env.local`.
- **Zanim zaproponujesz `git commit`** — pokaż `git status` i `git diff --stat`, potem zapytaj. Zasada obowiązuje bez wyjątków, także przy trywialnych zmianach.
