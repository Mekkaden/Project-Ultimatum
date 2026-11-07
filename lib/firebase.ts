import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, indexedDBLocalPersistence, browserLocalPersistence } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Use indexedDBLocalPersistence for Capacitor as it is more persistent than localStorage
if (typeof window !== "undefined") {
  setPersistence(auth, indexedDBLocalPersistence).catch(() => {
    // Fallback if indexedDB fails
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  });
}

/**
 * Firestore is loaded on demand, NOT at module scope.
 *
 * This file used to `import { getFirestore, initializeFirestore } from
 * "firebase/firestore"` and build the instance eagerly, so every screen that
 * merely needed `auth` also dragged in the whole Firestore SDK (~650 KB of JS)
 * before it could render. The landing screen needs none of it, and on a cold
 * start that parse was a large part of the wait before ENTER appeared.
 *
 * Consumers that already import Firestore themselves pay nothing extra: by the
 * time they call this, the module is loaded.
 */
let dbPromise: Promise<Firestore> | null = null;
let dbInstance: Firestore | null = null;

export function getDb(): Promise<Firestore> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (!dbPromise) {
    dbPromise = import("firebase/firestore")
      .then(({ getFirestore, initializeFirestore }) => {
        try {
          dbInstance = initializeFirestore(app, { experimentalForceLongPolling: true });
        } catch {
          dbInstance = getFirestore(app);
        }
        return dbInstance;
      })
      .catch((err) => {
        dbPromise = null;
        throw err;
      });
  }
  return dbPromise;
}

/** Storage is also lazy and currently unused, but kept for future uploads. */
export async function getStorageInstance(): Promise<FirebaseStorage> {
  const { getStorage } = await import("firebase/storage");
  return getStorage(app);
}

export default app;
