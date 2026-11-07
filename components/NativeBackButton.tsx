"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { App as CapacitorApp } from "@capacitor/app";

export default function NativeBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only run if we are in a native platform (Capacitor)
    if (typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform()) {
      
      const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        // Define root paths where pressing back should exit the app instead of popping web history
        const rootPaths = [
          "/campaign",
          "/diet",
          "/arena",
          "/settings",
          "/auth",
          "/"
        ];

        // If the current path is a primary tab, exit the app
        if (rootPaths.includes(pathname || "")) {
          CapacitorApp.exitApp();
        } else {
          // If we are on a nested screen (like /campaign/track), pop the NextJS history
          router.back();
        }
      });

      // Cleanup the listener when the component unmounts
      return () => {
        backButtonListener.then(listener => listener.remove());
      };
    }
  }, [pathname, router]);

  return null; // This component has no UI, it only handles routing logic
}
