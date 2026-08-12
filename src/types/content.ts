/**
 * Types for the static learning content that lives in the repo (`src/data`).
 * User progress is stored in Firestore and typed separately.
 */

export const CATEGORY_IDS = [
  "greetings",
  "politeness",
  "introductions",
  "questions",
  "restaurant",
  "shopping",
  "smalltalk",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type Category = {
  id: CategoryId;
  /** Polish label shown in the UI. */
  name: string;
  /** One-line hint about when these phrases are used. */
  description: string;
};

export type Phrase = {
  /**
   * Primary key of the SRS state in Firestore (`users/{uid}/cards/{phraseId}`).
   * Never change an existing id — it would orphan the user's progress.
   */
  id: string;
  /** German side of the card — the prompt read aloud by TTS. */
  de: string;
  /** Polish side of the card. */
  pl: string;
  category: CategoryId;
  /** Usage hint, e.g. formal vs. informal register. */
  note?: string;
};

export const STUDY_TASK_IDS = ["grammar", "phrases", "listening"] as const;

export type StudyTaskId = (typeof STUDY_TASK_IDS)[number];

export type StudyWeek = {
  /** 1-based week number, matching the four weeks of the study plan. */
  week: number;
  title: string;
  goal: string;
  /**
   * The three daily tasks, repeated every day of the week. Task ids are stable
   * because they key the booleans in `users/{uid}/planProgress/{dayId}`.
   */
  dailyTasks: Record<StudyTaskId, string>;
  /** Once-per-week goal, tracked outside the daily checklist. */
  milestone?: string;
};

export type StudyDay = {
  /** "w1-d3" — document id in `users/{uid}/planProgress`. */
  id: string;
  week: number;
  /** 1-based day within the week. */
  dayOfWeek: number;
  /** 1-based day within the whole 4-week plan (1–28). */
  dayOfPlan: number;
};
