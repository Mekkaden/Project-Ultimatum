"use client";

import { useEffect } from "react";

/**
 * Route-level boundary. Next renders this instead of the page when a route
 * throws, so the app shell (nav, providers) stays alive and the user can
 * recover in place via reset().
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RouteError]", error);
    // A screen that just failed to render must not be the one restored on the
    // next launch, or the app reopens straight into the error.
    try {
      localStorage.removeItem("ultimatum_last_route");
    } catch {}
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-14 h-14 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center mb-6">
        <span className="text-2xl font-black text-red-500">!</span>
      </div>
      <h1 className="text-lg font-black uppercase tracking-widest text-white mb-2">
        This screen failed to load
      </h1>
      <p className="text-sm text-neutral-400 max-w-sm mb-8 leading-relaxed">
        Your data is safe. Try loading it again.
      </p>
      <button
        onClick={reset}
        className="px-10 py-3.5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full"
      >
        Try again
      </button>
    </div>
  );
}
