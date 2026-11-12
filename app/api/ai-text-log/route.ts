export const dynamic = 'force-static';
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // AI Logging is blocked to protect API quotas until Ultimatum Pro launches.
  return NextResponse.json(
    { error: "AI Text Logging is reserved for the upcoming Ultimatum Pro tier." },
    { status: 403 }
  );
}
