"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { isBackExitRoute } from "./appRoutes";

/**
 * A drop-in replacement for the in-app "back" buttons.
 *
 * The buttons previously called `router.push("/parent")`, which does not go
 * back — it pushes a NEW history entry. That left the old entry underneath, so
 * a later hardware Back retraced it and the user saw screens reappear or get
 * skipped entirely (e.g. Sleep -> Vitals -> Home from what felt like one press).
 *
 * This pops history when there is somewhere real to go back to, and only falls
 * back to a `replace()` when a deep link landed the user directly on the page
 * (so Back would otherwise dump them out of the app).
 */
export function useGoBack(fallbackPath: string) {
  const router = useRouter();

  return useCallback(() => {
    // `history.state.idx` is set by the router; idx > 0 means real history.
    // window.history.length alone is NOT a reliable signal (it is the stack
    // size and never shrinks on back()).
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    const hasRealHistory = typeof idx === "number" && idx > 0;

    if (hasRealHistory && !isBackExitRoute(window.location.pathname)) {
      router.back();
      return;
    }

    // Deep link / cold start: replace so we do not stack a duplicate entry.
    router.replace(fallbackPath);
  }, [router, fallbackPath]);
}
