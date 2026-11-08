import {
  User,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { auth, getDb } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { Capacitor } from "@capacitor/core";

export const VERIFICATION_CUTOFF = new Date("2026-11-08T00:00:00Z").getTime();
export const REVIEWER_EMAIL = "reviewer@ultimatum.app";

/**
 * Validates whether a user is permitted into the application.
 *
 * Evaluation order (CRITICAL):
 * 1. If !user, return false.
 * 2. If user.emailVerified === true, return true.
 * 3. If user.providerData.some(p => p.providerId === "google.com"), return true.
 * 4. If user.email?.toLowerCase() === REVIEWER_EMAIL, return true.
 * 5. Grandfathering rule: Retrieve account creation timestamp.
 *    If createdAt > 0 && createdAt < VERIFICATION_CUTOFF, return true.
 * 6. Otherwise, return false.
 */
export function isUserAllowedIn(user: User | null): boolean {
  // 1. If !user, return false.
  if (!user) {
    return false;
  }

  // 2. If user.emailVerified === true, return true.
  if (user.emailVerified === true) {
    return true;
  }

  // 3. If user.providerData.some(p => p.providerId === "google.com"), return true.
  if (user.providerData && user.providerData.some((p) => p.providerId === "google.com")) {
    return true;
  }

  // 4. If user.email?.toLowerCase() === REVIEWER_EMAIL, return true.
  if (user.email?.toLowerCase() === REVIEWER_EMAIL.toLowerCase()) {
    return true;
  }

  // 5. Grandfathering rule: Retrieve the account creation timestamp:
  const createdAt = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).getTime()
    : 0;

  if (createdAt > 0 && createdAt < VERIFICATION_CUTOFF) {
    return true;
  }

  // 6. Otherwise, return false.
  return false;
}

/**
 * Unified Google Sign-In supporting both Web and Native Android (Capacitor).
 * On Android, uses @capacitor-firebase/authentication for native credential retrieval.
 * On Web, uses Firebase standard signInWithPopup.
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  if (Capacitor.isNativePlatform()) {
    const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
    const result = await FirebaseAuthentication.signInWithGoogle();

    const idToken = result.credential?.idToken;
    if (!idToken) {
      throw new Error("No Google ID token received from native sign-in.");
    }

    const credential = GoogleAuthProvider.credential(idToken);
    return await signInWithCredential(auth, credential);
  } else {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  }
}

/**
 * Checks whether the user's Firestore profile document exists at users/{uid}.
 * Does not overwrite existing workout history or preferences.
 */
export async function checkUserProfileExists(uid: string): Promise<boolean> {
  const db = await getDb();
  const userDocRef = doc(db, "users", uid);
  const docSnap = await getDoc(userDocRef);
  return docSnap.exists();
}
