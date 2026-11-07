import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, indexedDBLocalPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

let dbInstance;
try {
  dbInstance = initializeFirestore(app, { experimentalForceLongPolling: true });
} catch (e) {
  dbInstance = getFirestore(app);
}
export const db = dbInstance;
export const storage = getStorage(app);
export default app;
