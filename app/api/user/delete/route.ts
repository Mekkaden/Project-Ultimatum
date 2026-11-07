import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/getServerUser";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

/**
 * Account deletion, used by Google Play's account-deletion requirement.
 *
 * Deleting only the Auth user would leave `users/{uid}` (the synced settings and
 * history backup) behind, and the client-side `user.delete()` fails whenever the
 * session is older than a few minutes — which is the normal case for someone
 * who opened the app days ago. So the deletion runs here with the Admin SDK,
 * after verifying the caller's own ID token: the only account anyone can delete
 * through this route is their own.
 */

// Server-side only. Next static export requires 'force-static' at build time;
// on Vercel or live server, POST requests are handled dynamically by nodejs runtime.
export const dynamic = "force-static";
export const runtime = "nodejs";

async function deleteAccount(uid: string): Promise<void> {
  // Firestore first: if this fails, the Auth user still exists and the user can
  // retry. Deleting Auth first would strand an unreadable orphan document that
  // no future request could reach.
  try {
    await adminDb.collection("users").doc(uid).delete();
  } catch (error) {
    console.error("[delete-account] Firestore cleanup failed:", error);
    throw error;
  }

  try {
    await adminAuth.deleteUser(uid);
  } catch (error) {
    // A user that is already gone is the desired end state.
    const code = (error as { code?: string })?.code;
    if (code !== "auth/user-not-found") {
      console.error("[delete-account] Auth deletion failed:", error);
      throw error;
    }
  }
}

export async function POST(req: Request) {
  const user = await getServerUser(req);
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteAccount(user.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "The account could not be deleted. Please try again." },
      { status: 500 },
    );
  }
}
