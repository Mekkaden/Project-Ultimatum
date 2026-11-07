"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && pathname) {
      // Ignore root, auth, and external/standalone pages so they don't hijack the user's last app route
      const IGNORED_ROUTES = [
        "/",
        "/auth",
        "/downloads",
        "/faq",
        "/privacy-policy",
        "/terms-of-service",
        "/delete-account",
      ];

      if (!IGNORED_ROUTES.includes(pathname)) {
        localStorage.setItem("ultimatum_last_route", pathname);
      }
    }
  }, [pathname]);

  return null;
}
