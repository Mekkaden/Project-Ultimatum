export const dynamic = 'force-static';
import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/getServerUser";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  const userObj = await getServerUser(req);

  if (!userObj?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await adminDb
      .collection("weightLogs")
      .where("userId", "==", userObj.id)
      .orderBy("createdAt", "asc")
      .get();

    const weightLogs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    return NextResponse.json({ weightLogs });
  } catch (error) {
    console.error("Error fetching weight logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userObj = await getServerUser(req);

  if (!userObj?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { weight, dateOverride } = await req.json();

    if (weight === undefined || typeof weight !== "number") {
      return NextResponse.json({ error: "Invalid weight provided" }, { status: 400 });
    }

    const logData: any = {
      userId: userObj.id,
      weight,
      createdAt: dateOverride
        ? new Date(dateOverride)
        : new Date(),
    };

    const docRef = await adminDb.collection("weightLogs").add(logData);

    return NextResponse.json({
      weightLog: {
        id: docRef.id,
        ...logData,
        createdAt: logData.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating weight log:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const userObj = await getServerUser(req);

  if (!userObj?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const docRef = adminDb.collection("weightLogs").doc(id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.userId !== userObj.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting weight log:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
