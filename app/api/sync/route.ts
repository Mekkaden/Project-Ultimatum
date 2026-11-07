export const dynamic = 'force-static';
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/getServerUser";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const user = await getServerUser(req);
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backupData = await req.json();

    await adminDb.collection("users").doc(userId).set(
      { appDataBackup: backupData, updatedAt: new Date() },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API sync error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getServerUser(req);
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await adminDb.collection("users").doc(userId).get();

    if (!doc.exists) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: doc.data()?.appDataBackup || null });
  } catch (error) {
    console.error("API sync get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
