import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const globalForOtp = global as unknown as { otpStore: Map<string, { code: string, expires: number }> };
if (!globalForOtp.otpStore) {
  globalForOtp.otpStore = new Map();
}
const otpStore = globalForOtp.otpStore;

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const otpData = otpStore.get(email);
    if (!otpData) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    if (Date.now() > otpData.expires) {
      otpStore.delete(email);
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    if (otpData.code !== code) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // Code matches, hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const { error: updateError } = await supabaseAdmin
      .from("User")
      .update({ password: hashedPassword })
      .eq("email", email);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Clear the code
    otpStore.delete(email);

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
