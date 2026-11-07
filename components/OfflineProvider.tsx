"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getPendingSyncActions, removeSyncAction } from "@/lib/db";

interface OfflineContextType {
  isOnline: boolean;
}

const OfflineContext = createContext<OfflineContextType>({ isOnline: true });

export const useOffline = () => useContext(OfflineContext);

const isOnline = () => (typeof navigator === "undefined" ? true : navigator.onLine);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  // Initialised lazily so the first client render already matches the device
  // state (avoids an "offline" banner flash on launch).
  const [online, setOnline] = useState(isOnline);

  // Function to process pending actions when coming online
  const processSyncQueue = async () => {
    try {
      // 1. Process old action queue (if any remain)
      const actions = await getPendingSyncActions();
      for (const action of actions) {
        if (action.id) {
          await removeSyncAction(action.id);
        }
      }

      // 2. Perform the full auto-backup to Firestore
      const data: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("ultimatum_")) {
          data[key] = localStorage.getItem(key) || "";
        }
      }

      // Only sync if we have actual data to sync
      if (Object.keys(data).length > 0) {
        console.log("[OfflineProvider] Back online — auto-syncing to Firestore...");
        try {
          const { saveUserSettingsToCloud } = await import("@/lib/syncService");
          await saveUserSettingsToCloud();
          console.log("[OfflineProvider] Auto-sync to Firestore complete.");
        } catch (err) {
          console.warn("[OfflineProvider] Auto-sync failed:", err);
        }
      }

    } catch (error) {
      console.error("Failed to process sync queue:", error);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      processSyncQueue();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // The startup sync is DEFERRED off the critical path.
    //
    // processSyncQueue() dynamically imports lib/syncService, which pulls in the
    // entire Firestore SDK (~650 KB of JS). Running it on mount meant a cold
    // launch had to download and parse the database client before the landing
    // screen became interactive — a large part of the 8-10s delay before ENTER
    // appeared. Nothing on the landing screen reads from Firestore.
    //
    // Waiting for idle (with a timeout so it still runs promptly) keeps the
    // sync behaviour identical, just no longer ahead of first paint.
    let cancelled = false;

    const startSync = () => {
      if (!cancelled && isOnline()) processSyncQueue();
    };

    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(startSync, { timeout: 3000 });
    } else {
      timer = setTimeout(startSync, 1500);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
      if (timer !== undefined) clearTimeout(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <OfflineContext.Provider value={{ isOnline: online }}>
      {children}
    </OfflineContext.Provider>
  );
}
