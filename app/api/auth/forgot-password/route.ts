import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: user, error: fetchError } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("email", email)
      .single();

    if (!user) {
      // Don't leak whether user exists, just return success
      return NextResponse.json({ success: true, message: "If an account exists, an email was sent." });
    }

    // Generate a 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email, { code, expires });

    console.log('\n=============================================');
    console.log(`[PASSWORD RESET] Email: ${email}`);
    console.log(`[PASSWORD RESET] Code: ${code}`);
    console.log('=============================================\n');

    return NextResponse.json({ success: true, message: "If an account exists, an email was sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
