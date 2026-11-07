import { auth } from "./firebase";
import { deleteUser } from "firebase/auth";

/**
 * Where the deletion endpoint lives.
 *
 * The APK is a static export with no server of its own, so it must call the
 * deployed site. The web build calls its own origin. This matches how the other
 * server-backed features in the app choose their endpoint.
 */
function deleteEndpoint(): string {
  if (typeof window === "undefined") return "/api/user/delete";
  // Same rule the rest of the app uses for server-backed features: talk to the
  // local dev server when one is in front of us, otherwise to the deployment
  // (the Android app serves its own bundle and has no API beside it).
  const onDeployedSite = window.location.hostname.endsWith("ultimatum.website");
  if (onDeployedSite) return "/api/user/delete";
  return "https://www.ultimatum.website/api/user/delete";
}

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; reason: "signed-out" | "network" | "server"; message: string };

/**
 * Permanently deletes the signed-in user's account and cloud data.
 *
 * The server removes the synced backup and the Auth user in one verified call.
 * If the network is unavailable we deliberately do NOT fall back to
 * `deleteUser()`: that only deletes the Auth record in the typical
 * long-lived-session case it throws "requires-recent-login" anyway, and it would
 * leave the person's cloud backup orphaned. Failing loudly is the honest
 * outcome; the caller tells the user to retry.
 */
export async function deleteAccountAndData(): Promise<DeleteAccountResult> {
  const user = auth.currentUser;
  if (!user) {
    return { ok: false, reason: "signed-out", message: "No signed-in account to delete." };
  }

  let token: string;
  try {
    token = await user.getIdToken(true);
  } catch {
    return {
      ok: false,
      reason: "network",
      message: "Could not confirm your session. Check your connection and try again.",
    };
  }

  let response: Response;
  try {
    response = await fetch(deleteEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    return {
      ok: false,
      reason: "network",
      message:
        "Could not reach the server. Account deletion needs a connection — please try again when you are online.",
    };
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    return {
      ok: false,
      reason: response.status === 401 ? "signed-out" : "server",
      message: body?.error || "The account could not be deleted. Please try again.",
    };
  }

  // The account is gone server-side. Clear the local identity so this device
  // cannot keep acting as the deleted user, and drop local copies of their data.
  try {
    await deleteUser(user);
  } catch {
    // Already deleted remotely; a lingering local token is cleared below.
    try {
      await auth.signOut();
    } catch {}
  }

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
