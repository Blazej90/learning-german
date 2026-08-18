import type { StudyDay, StudyTaskId, StudyWeek } from "@/types/content";

/** Short Polish labels for the daily checklist columns. */
export const STUDY_TASK_LABELS: Record<StudyTaskId, string> = {
  grammar: "Gramatyka",
  phrases: "Zwroty",
  listening: "Słuchanie",
};

/** Source: `start-learning-german.md`, section 2 — "Plan nauki: 4 tygodnie na start". */
export const STUDY_WEEKS: readonly StudyWeek[] = [
  {
    week: 1,
    title: "Fundamenty",
    goal: "Odświeżyć gramatykę i wejść w rytm codziennych powtórek.",
    dailyTasks: {
      grammar:
        "15–20 min gramatyki: sein, haben, podstawowy szyk zdania",
      phrases: "5–10 nowych zwrotów — powitania, grzeczność, przedstawianie się",
      listening: "10–15 min słuchania: Easy German albo Nicos Weg",
    },
  },
  {
    week: 2,
    title: "Pierwsze zdania",
    goal: "Przejść od rozumienia do mówienia na głos.",
    dailyTasks: {
      grammar: "Przegląd gramatyki + czytanie dialogów z kursu na głos",
      phrases: "Nowe zwroty z kategorii: zakupy, restauracja, pytania",
      listening: "Słuchanie + opisz swój dzień prostymi zdaniami na głos",
    },
    milestone:
      "Pierwsza krótka rozmowa tekstowa lub głosowa po niemiecku — z AI albo partnerem z Tandem/HelloTalk",
  },
  {
    week: 3,
    title: "Pierwsza żywa rozmowa",
    goal: "Odbyć rozmowę z człowiekiem, nie z aplikacją.",
    dailyTasks: {
      grammar: "Przećwicz 5–6 przygotowanych zdań o sobie",
      phrases: "Powtórki fiszek + uzupełnianie luk z rozmów",
      listening: "Codzienne słuchanie, stopniowo trudniejszy materiał",
    },
    milestone:
      "Rozmowa z native speakerem (italki albo lokalna grupa konwersacyjna) — 15–20 minut wystarczy",
  },
  {
    week: 4,
    title: "Rytm",
    goal: "Zamienić miesiąc nauki w nawyk, który przetrwa dalej.",
    dailyTasks: {
      grammar: "Przegląd gramatyki z potknięć zauważonych w rozmowie",
      phrases: "Zapisuj nowe słowa z rozmów i wracaj do nich w fiszkach",
      listening: "Codzienne słuchanie — utrzymaj tempo z poprzednich tygodni",
    },
    milestone:
      "Kolejna rozmowa z native speakerem + ocena, co sprawia najwięcej trudności (słownictwo, gramatyka, rozumienie ze słuchu)",
  },
];

export const DAYS_PER_WEEK = 7;

/** All 28 days of the plan, in order. `id` matches `planProgress/{dayId}`. */
export const STUDY_DAYS: readonly StudyDay[] = STUDY_WEEKS.flatMap((week) =>
  Array.from({ length: DAYS_PER_WEEK }, (_, index): StudyDay => {
    const dayOfWeek = index + 1;

    return {
      id: `w${week.week}-d${dayOfWeek}`,
      week: week.week,
      dayOfWeek,
      dayOfPlan: (week.week - 1) * DAYS_PER_WEEK + dayOfWeek,
    };
  }),
);

export function getStudyWeek(week: number): StudyWeek | undefined {
  return STUDY_WEEKS.find((studyWeek) => studyWeek.week === week);
}

export function getStudyDays(week: number): readonly StudyDay[] {
  return STUDY_DAYS.filter((day) => day.week === week);
}
