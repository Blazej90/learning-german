/**
 * Study-plan progress in Firestore: `users/{uid}/planProgress/{dayId}`.
 *
 * The day id ("w1-d3") is the document id, so it is not repeated in the fields.
 * Unlike the SRS cards, a malformed document is repaired instead of dropped:
 * the payload is three booleans, so anything unexpected can only mean "not
 * done" — there is no schedule to corrupt.
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";

import type { DayProgress, DayTasks } from "@/features/plan/progress";
import { getDb } from "@/lib/firebase/client";
import { STUDY_TASK_IDS } from "@/types/content";

function planCollection(uid: string) {
  return collection(getDb(), "users", uid, "planProgress");
}

function toDayTasks(value: unknown): DayTasks {
  const saved = (typeof value === "object" && value !== null ? value : {}) as
    Record<string, unknown>;

  return {
    grammar: saved.grammar === true,
    phrases: saved.phrases === true,
    listening: saved.listening === true,
  };
}

function toDayProgress(dayId: string, data: DocumentData): DayProgress {
  return {
    dayId,
    tasks: toDayTasks(data.tasks),
    completedAt:
      data.completedAt instanceof Timestamp ? data.completedAt.toDate() : null,
  };
}

/**
 * Every saved plan day, keyed by day id. At most 28 documents, so this reads
 * the whole subcollection; offline it resolves from the local cache.
 */
export async function fetchPlanProgress(
  uid: string,
): Promise<Map<string, DayProgress>> {
  const snapshot = await getDocs(planCollection(uid));
  const progress = new Map<string, DayProgress>();

  for (const document of snapshot.docs) {
    progress.set(document.id, toDayProgress(document.id, document.data()));
  }

  return progress;
}

/**
 * Write one day's checklist.
 *
 * Merged rather than replaced so the `note` field from the data model survives
 * a checkbox toggle. `completedAt` is the moment the third task was ticked, and
 * goes back to `null` if one is later unticked — a device timestamp, for the
 * same reason as in the review log: offline `serverTimestamp()` stays null.
 */
export function saveDayTasks(
  uid: string,
  dayId: string,
  tasks: DayTasks,
  now: Date,
): Promise<void> {
  const isComplete = STUDY_TASK_IDS.every((taskId) => tasks[taskId]);

  return setDoc(
    doc(planCollection(uid), dayId),
    {
      tasks,
      completedAt: isComplete ? Timestamp.fromDate(now) : null,
    },
    { merge: true },
  );
}
