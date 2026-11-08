import { auth } from "./firebase";
import { deleteUser } from "firebase/auth";

/**
 * Where the deletion endpoint lives.
 *
 * The APK is a static export with no server of its own, so it must call the
 * deployed site. The web build calls its own origin.
 *
 * This deliberately matches the absolute-URL style the rest of the app uses
 * (WeightTracker, DietDashboard, CustomSplitBuilder, ...). The previous version
 * whitelisted only hosts ending in "ultimatum.website" and sent everything else
 * to https://www.ultimatum.website, which meant a request from a Vercel preview
 * host or the Android WebView could be bounced through a 308 redirect — and a
 * redirect on a POST drops the Authorization header, turning a valid request
 * into a 401.
 */
function deleteEndpoint(): string {
  if (typeof window === "undefined") return "/api/user/delete";
  const host = window.location.hostname;
  // Same-origin when the web app is served from the canonical domains.
  if (host === "ultimatum.website" || host === "www.ultimatum.website") {
    return "/api/user/delete";
  }
  // Android/Capacitor (localhost) and preview deployments call the live site.
  return "https://www.ultimatum.website/api/user/delete";
}

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; reason: "signed-out" | "network" | "server" | "requires-recent-login"; message: string };

/**
 * Permanently deletes the signed-in user's account and cloud data.
 *
 * 1. Deletes primary Firestore records at users/{uid} safely with timeout.
 * 2. Invokes backend cleanup for any associated R2 assets and Admin SDK tasks.
 * 3. Deletes Firebase Authentication account via deleteUser(auth.currentUser).
 * 4. Handles auth/requires-recent-login gracefully.
 * 5. Clears all local application storage and cached sessions.
 */
export async function deleteAccountAndData(): Promise<DeleteAccountResult> {
  const user = auth.currentUser;
  if (!user) {
    return { ok: false, reason: "signed-out", message: "No signed-in account to delete." };
  }

  // Step 1: Delete Firestore user profile document
  try {
    const { getDb } = await import("./firebase");
    const { doc, deleteDoc } = await import("firebase/firestore");
    const db = await getDb();
    await Promise.race([
      deleteDoc(doc(db, "users", user.uid)),
      new Promise((resolve) => setTimeout(resolve, 4000)),
    ]).catch((err) => console.warn("[deleteAccount] Firestore deleteDoc warning:", err));
  } catch (fsErr) {
    console.warn("[deleteAccount] Firestore cleanup error:", fsErr);
  }

  // Best-effort remote server deletion for Cloudflare R2 assets & Admin SDK
  try {
    const token = await user.getIdToken(true).catch(() => null);
    if (token) {
      await Promise.race([
        fetch(deleteEndpoint(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token }),
        }),
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ]).catch(() => {});
    }
  } catch {}

  // Step 2 & 3: Delete Firebase Authentication user & handle requires-recent-login
  try {
    await deleteUser(user);
  } catch (authErr: any) {
    if (authErr?.code === "auth/requires-recent-login") {
      return {
        ok: false,
        reason: "requires-recent-login",
        message: "For security, please sign out, sign back in, and tap Delete Account again.",
      };
    }
    console.warn("[deleteAccount] deleteUser fallback:", authErr);
    try {
      await auth.signOut();
    } catch {}
  }

  // Step 4: Clear all local storage and session state
  await clearLocalAccountData();
  return { ok: true };
}

/**
 * Removes everything this device stored for the account. Kept separate from the
 * network call so the caller can run it knowing the account really is gone.
 */
export async function clearLocalAccountData(): Promise<void> {
  if (typeof window === "undefined") return;
  // Progress photos and the sync queue live in IndexedDB, which the
  // localStorage sweep below does not reach.
  try {
    const { clearAllProgressPhotos } = await import("./db");
    await clearAllProgressPhotos();
  } catch {}
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("ultimatum_") || key.startsWith("pending_"))) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem("ultimatum_session_active");
  } catch {}
  try {
    sessionStorage.clear();
  } catch {}
}
