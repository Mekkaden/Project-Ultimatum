export const dynamic = 'force-static';
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { email, password, action } = await req.json();

    if (!email || !password || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (action === "signup") {
      try {
        const userRecord = await adminAuth.createUser({
          email,
          password,
        });
        // Create a custom token so the client can sign in immediately
        const customToken = await adminAuth.createCustomToken(userRecord.uid);
        return NextResponse.json({
          customToken,
          user: { id: userRecord.uid, email: userRecord.email },
        });
      } catch (err: any) {
        if (err.code === "auth/email-already-exists") {
          return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }
        throw err;
      }
    }

    if (action === "login") {
      // Firebase Auth does not support server-side password verification directly.
      // The client must sign in with signInWithEmailAndPassword (Firebase Client SDK)
      // and then send the ID token. This endpoint is now only for signup.
      // For login: use Firebase client SDK on the frontend.
      return NextResponse.json(
        { error: "Use Firebase client SDK for login (signInWithEmailAndPassword)" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Mobile auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
