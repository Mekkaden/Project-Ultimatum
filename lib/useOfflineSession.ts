"use client";

import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { isUserAllowedIn } from "./authHelper";

const SESSION_CACHE_KEY = "ultimatum_cached_session";
const OFFLINE_TIMEOUT_MS = 8000; // Give Firebase 8s to restore session before giving up
// A returning user who was signed in when they closed the app. Set on a
// confirmed login and on every confirmed sign-out, so it never contradicts the
// cached session and never turns a signed-out user into a signed-in one.
const SESSION_FLAG_KEY = "ultimatum_session_active";
// While Firebase re-checks a returning user's session in the background, this
// is how long that answer is allowed to take before we stop waiting for it to
// settle the cached session (the cached view is already on screen).
const RECONCILE_GRACE_MS = 2500;

export type OfflineSession = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  access_token?: string;
} | null;

function readCachedSession(): OfflineSession {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_CACHE_KEY);
    return raw ? (JSON.parse(raw) as OfflineSession) : null;
  } catch {
    return null;
  }
}

/**
 * True when the previous session ended signed in. Read on the first render so
 * the app opens straight away instead of holding the user on a loading screen
 * for a network round-trip that, for a returning user, almost always confirms
 * what the device already knows.
 */
function readSessionFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SESSION_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSessionFlag(active: boolean): void {
  try {
    if (active) localStorage.setItem(SESSION_FLAG_KEY, "1");
    else localStorage.removeItem(SESSION_FLAG_KEY);
  } catch {}
}

const LAST_ROUTE_KEY = "ultimatum_last_route";

/**
 * True when the user was signed in before this page load and their session is
 * still on the device.
 *
 * Screens that must not be shown to a signed-in user (the landing page, the
 * gatekeeper, the auth form) use this to stay blank until Firebase answers,
 * instead of painting for a frame and then navigating away. That flash is what
 * made an in-app reload look like the app had been signed out.
 *
 * Safe to call during render in the browser: it only reads localStorage. On the
 * server it is false, which is correct because the exported HTML has no session.
 */
export function hasLocalSession(): boolean {
  if (typeof window === "undefined") return false;
  return readSessionFlag() && !!readCachedSession()?.user;
}

const ONBOARDING_STEP_KEY = "ultimatum_onboarding_step";

/**
 * Reloads the app after data was restored, landing back on the screen the user
 * was on instead of the landing page.
 *
 * A bare reload keeps the current URL, and `ultimatum_last_route` survives it,
 * so the campaign screen picks the route up directly. The reload used to run
 * from a settings screen reached through the landing page, which left the
 * history at `/`: the app restored to the root and had to travel through the
 * landing screen and its gatekeeper again, flashing both. The record is only
 * touched when a signed-in user would otherwise land on a root/onboarding URL.
 */
export function reloadIntoApp(fallbackRoute = "/campaign"): void {
  if (typeof window === "undefined") return;
  try {
    const path = window.location.pathname.replace(/\.html$/, "");
    const rootLike = path === "/" || path === "/auth" || path === "/downloads";
    if (rootLike) {
      const lastRoute = readLastRoute();
      if (lastRoute && lastRoute !== path) {
        window.history.replaceState(window.history.state, "", lastRoute);
      } else if (hasLocalSession()) {
        window.history.replaceState(window.history.state, "", fallbackRoute);
      }
      // Nothing marked here is wanted on the way back in.
      sessionStorage.removeItem(ONBOARDING_STEP_KEY);
      sessionStorage.removeItem("ultimatum_post_auth_target");
    }
  } catch {}
  window.location.reload();
}

/** The last in-app route, if one was recorded. */
export function readLastRoute(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LAST_ROUTE_KEY);
  } catch {
    return null;
  }
}

function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function useOfflineSession() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  // Initialised lazily so an offline launch already knows about the cached
  // session on the first render (no cached-glance -> spinner flash).
  const [cachedSession, setCachedSession] = useState<OfflineSession>(readCachedSession);
  const [isOffline, setIsOffline] = useState(() => !isOnline());
  const [timedOut, setTimedOut] = useState(false);
  // The instant "returning user" path is armed once, on the first render, and
  // only when the previous session ended signed in with a cached user.
  const [returningSession] = useState<boolean>(() => readSessionFlag() && !!readCachedSession()?.user);
  // Only a returning session has anything to reconcile, so that case starts
  // unsettled and everything else starts settled.
  const [reconcileSettled, setReconcileSettled] = useState<boolean>(() => !readSessionFlag() || !readCachedSession()?.user);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Timeout fallback: if Firebase hasn't answered in time, stop blocking the
  // UI. This is a one-way latch — once it fires, a late auth callback may
  // still upgrade the status to authenticated, but must not flip a signed-out
  // user back into a loading (or cached-authenticated) state later.
  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setTimedOut(true), OFFLINE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [status]);

  // The cached session opens the app immediately, but its token is only as
  // fresh as the last time it was written (an ID token lasts an hour). Re-check
  // it quietly in the background; if it can no longer be renewed, Firebase says
  // so through onAuthStateChanged or refreshToken throws, and we fall back to
  // signed-out. Either way the grace below stops holding the cached view open
  // for longer than a moment.
  useEffect(() => {
    if (!returningSession) return;
    const timer = setTimeout(() => setReconcileSettled(true), RECONCILE_GRACE_MS);
    let cancelled = false;
    (async () => {
      try {
        const user = auth.currentUser;
        if (user && !isUserAllowedIn(user)) {
          writeSessionFlag(false);
          if (isOnline()) {
            localStorage.removeItem(SESSION_CACHE_KEY);
            setCachedSession(null);
          }
          if (!cancelled) setReconcileSettled(true);
          return;
        }
        const token = await user?.getIdToken(true);
        if (cancelled) return;
        const cached = readCachedSession();
        if (user && token && cached) {
          try {
            localStorage.setItem(
              SESSION_CACHE_KEY,
              JSON.stringify({
                user: { id: user.uid, email: user.email, name: user.displayName },
                access_token: token,
              }),
            );
          } catch {}
        }
        writeSessionFlag(!!user);
      } catch {
        // Offline, or the session was revoked: let Firebase's listener decide.
      } finally {
        if (!cancelled) setReconcileSettled(true);
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [returningSession]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!isUserAllowedIn(user)) {
          setFirebaseUser(user);
          setIdToken(null);
          setStatus("unauthenticated");
          writeSessionFlag(false);
          if (isOnline()) {
            localStorage.removeItem(SESSION_CACHE_KEY);
            setCachedSession(null);
          }
          return;
        }

        try {
          const token = await user.getIdToken();
          setIdToken(token);
          setFirebaseUser(user);
          setStatus("authenticated");

          // Cache session in localStorage for offline use
          const sessionToCache: OfflineSession = {
            user: {
              id: user.uid,
              email: user.email,
              name: user.displayName,
            },
            access_token: token,
          };
          try {
            localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(sessionToCache));
            setCachedSession(sessionToCache);
          } catch {}
          writeSessionFlag(true);
        } catch (err) {
          console.error("Failed to get Firebase ID token:", err);
          setStatus("unauthenticated");
        }
      } else {
        setFirebaseUser(null);
        setIdToken(null);
        setStatus("unauthenticated");
        // A definitive signed-out answer beats any cached session.
        writeSessionFlag(false);
        // Only clear cached session if we are actually online (prevent wiping cache during offline app start)
        if (isOnline()) {
          localStorage.removeItem(SESSION_CACHE_KEY);
          setCachedSession(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const hasCachedUser = !!cachedSession?.user;
  // Show the cached session while Firebase is still resolving, or once it has
  // timed out. A definitive "unauthenticated" online answer always wins, and so
  // does a returning user's cached session: the app opens on it straight away
  // and Firebase's answer takes over the moment it arrives.
  const cacheUsable = status === "loading" && (timedOut || (returningSession && !reconcileSettled));
  const finalStatus =
    (isOffline || cacheUsable) && hasCachedUser && !firebaseUser
      ? "authenticated"
      : status;

  const liveSession: OfflineSession = firebaseUser
    ? {
        user: {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
        },
        access_token: idToken || undefined,
      }
    : null;

  const finalData = finalStatus === "authenticated" ? liveSession || cachedSession : null;

  return {
    data: finalData,
    status: finalStatus,
    cachedSession,
    isOffline,
    firebaseUser,
    idToken,
  };
}
