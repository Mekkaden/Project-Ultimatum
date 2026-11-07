"use client";
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { globalTimerStore } from '@/lib/timerStore';
import { backButtonStore } from '@/lib/backButtonStore';
import { isBackExitRoute } from '@/lib/appRoutes';

const LAST_EXIT_KEY = 'ultimatum_last_back_exit';

export default function CapacitorHardwareBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let listener: PluginListenerHandle | null = null;
    let cancelled = false;

    const setupListener = async () => {
      try {
        const added = await App.addListener('backButton', ({ canGoBack }) => {
          if (cancelled) return;

          // 0. Intercept for full-page modals/overlays using the registry
          if (backButtonStore.handleBack()) {
            return;
          }

          // 1. If timer modal is open, just close it and do NOT navigate.
          if (globalTimerStore.state.isOpen) {
            globalTimerStore.closeModal();
            return;
          }

          // 2. Root tabs exit the app; everything else pops history. Only exit
          //    when there is really nothing to go back to, otherwise a stray
          //    back press during/after navigation dumps the user out.
          if (isBackExitRoute(window.location.pathname) || !canGoBack) {
            const now = Date.now();
            const lastExit = Number(sessionStorage.getItem(LAST_EXIT_KEY) || 0);
            if (now - lastExit < 1500) {
              App.exitApp();
            } else {
              sessionStorage.setItem(LAST_EXIT_KEY, String(now));
            }
          } else {
            // Guard against a history entry that resolves back onto itself
            // (replace() chains leave these behind). Popping to the same URL
            // does nothing visible, and a second press then exits the app —
            // which is what felt like "randomly jumping out".
            const before = window.history.length;
            router.back();
            window.setTimeout(() => {
              if (window.history.length === before) {
                // Nothing moved; fall back to the home screen rather than
                // leaving the press silently swallowed.
                router.replace("/campaign");
              }
            }, 300);
          }
        });

        if (cancelled) {
          added.remove();
        } else {
          listener = added;
        }
      } catch (e) {
        console.error("Failed to setup Capacitor back button listener", e);
      }
    };

    setupListener();

    return () => {
      cancelled = true;
      if (listener && listener.remove) {
        listener.remove();
      }
    };
  }, [router, pathname]);

  return null;
}
