import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CORS for the native app.
 *
 * The Android build is a Capacitor bundle served from the WebView's own origin
 * (capacitor://localhost, or https://localhost depending on androidScheme), not
 * from ultimatum.website. Every server-backed feature therefore makes a
 * cross-origin request, and the browser blocks the RESPONSE unless the server
 * sends Access-Control-Allow-Origin.
 *
 * Nothing sent those headers, so on device every API call failed at the network
 * layer. The delete-account screen reported it as "Could not reach the server"
 * because fetch() rejects before any status is readable, even though the
 * endpoint was up and answering 401/200 correctly.
 *
 * Only these origins are allowed. The web app is same-origin and needs none of
 * this, but including it is harmless.
 */
const ALLOWED_ORIGINS = new Set([
  "capacitor://localhost",
  "https://localhost",
  "http://localhost",
  "https://www.ultimatum.website",
  "https://ultimatum.website",
]);

const ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const ALLOWED_HEADERS = "Content-Type,Authorization";
const MAX_AGE = "86400";

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": ALLOWED_METHODS,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Max-Age": MAX_AGE,
    Vary: "Origin",
  };
  // Echo only known origins; never reflect an arbitrary one.
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");

  // Preflight: answer immediately. Without a successful preflight the browser
  // never sends the real request at all.
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(corsHeaders(origin))) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  // Only the API surface needs CORS. Excluding pages and static assets keeps
  // this off the hot path for the site itself.
  matcher: ["/api/:path*"],
};
