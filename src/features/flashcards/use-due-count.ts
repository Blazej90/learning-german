"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { PHRASE_IDS } from "@/data/phrases";
import { useAuth } from "@/features/auth/auth-provider";
import { buildReviewQueue } from "@/features/srs";
import { fetchCards } from "@/lib/firebase/cards";

/**
 * How many cards are waiting today — the number on the "Powtórki" tab.
 *
 * Deliberately not `useDashboard`: that one also pulls thirty days of the
 * review log for the chart, which a badge has no use for. This reads the card
 * documents only, and after the first load they resolve from the IndexedDB
 * cache.
 *
 * It refetches on every route change, because the obvious way to leave the
 * count stale is to finish a session and walk away from `/review`.
 *
 * `null` means "not known yet", so the badge stays hidden rather than flashing
 * a zero that is about to become a twelve.
 */
export function useDueCount(): number | null {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const pathname = usePathname();

  const [count, setCount] = useState<number | null>(null);

  // Discards a load whose account changed or that a newer navigation superseded.
  const loadId = useRef(0);

  useEffect(() => {
    if (!uid) return;

    const currentLoad = ++loadId.current;

    void (async () => {
      try {
        const cards = await fetchCards(uid);
        if (currentLoad !== loadId.current) return;

        setCount(
          buildReviewQueue({ phraseIds: PHRASE_IDS, cards, now: new Date() })
            .length,
        );
      } catch {
        // A badge is not worth an error state — hidden says enough.
        if (currentLoad === loadId.current) setCount(null);
      }
    })();
  }, [pathname, uid]);

  return count;
}
