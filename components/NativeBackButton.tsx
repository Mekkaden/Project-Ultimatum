"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { App as CapacitorApp } from "@capacitor/app";
import { backButtonStore } from "@/lib/backButtonStore";

export default function NativeBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only run if we are in a native platform (Capacitor)
    if (typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform()) {
      
      const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        // Give in-app handlers (open modals, builder steps) first refusal.
        // Previously this was never consulted, so a screen registering
        // useHardwareBack still exited the app on Back.
        if (backButtonStore.handleBack()) {
          return;
        }

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
        } else if (canGoBack) {
          // If we are on a nested screen (like /campaign/track), pop the NextJS history
          router.back();
        } else {
          // Some platforms start with an empty history stack; exit rather than dead-end.
          CapacitorApp.exitApp();
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
