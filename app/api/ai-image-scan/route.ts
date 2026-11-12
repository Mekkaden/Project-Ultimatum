export const dynamic = 'force-static';
import { NextResponse } from 'next/server';

export const maxDuration = 30; // Max execution time for Vercel

export async function POST(req: Request) {
  // AI Meal Scanning is blocked to protect API quotas until Ultimatum Pro launches.
  return NextResponse.json(
    { error: "AI Meal Photo Scanning is reserved for the upcoming Ultimatum Pro tier." },
    { status: 403 }
  );
}
