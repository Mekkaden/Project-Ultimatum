"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { hasLocalSession, useOfflineSession } from "../lib/useOfflineSession";
import { motion, AnimatePresence } from "framer-motion";
import DotField from "../components/DotField";
import DecryptedText from "../components/DecryptedText";
import TruthsSection from "../components/TruthsSection";
import { ArrowLeft } from "lucide-react";
import { useHardwareBack } from "../lib/useHardwareBack";
import { ONBOARDING_STEP_KEY } from "../lib/onboarding";

// All background images used across onboarding steps — preloaded on mount
const PRELOAD_IMAGES = [
  "/onboarding/photo-1694023536590-60d02108b323.avif",
  "/fsdfdjfsdffdsfs/pexels-bynikolavu-10021269.jpg",
  "/fsdfdjfsdffdsfs/pexels-marta-nogueira-589022975-17093369.jpg",
  "/fsdfdjfsdffdsfs/pexels-shammah-njomo-578243531-35651163.jpg",
];

const ROUTE = {
  campaign: "/campaign",
  auth: "/auth",
} as const;

const NON_APP_ROUTES = ["/", "/auth", "/downloads", "/faq", "/privacy-policy", "/terms-of-service", "/delete-account"];


// Screens that only make sense right after onboarding. Restoring one of these
// on launch drops the user into a flow with no way back, so fall through to
// the campaign (the app's primary tab) instead.
const ONBOARDING_ROUTES = ["/directive", "/frequency", "/setup-mode", "/auto-setup", "/manual-nutrition"];

// Native answer for "is this a rebuild or a fresh launch". Set synchronously
// before render so nothing can navigate with the wrong assumption. A rebuild is
// the same task redrawn (rotation, font scale, a recents tap); anything else,
// including a launch after the app was swiped away from recents, is a fresh
// launch and starts on the landing page.
let launchWasCold: boolean | null = null;

function detectLaunchState(): void {
  if (typeof window === "undefined") return;
  try {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    // Capacitor injects its JS proxies at document start, so calling a sync
    // synchronous method here resolves natively before the first effect runs.
    const plugin = (window as unknown as {
      Capacitor?: {
        Plugins?: Record<
          string,
          { getLaunchState?: () => { restoring?: boolean } }
        >;
      };
    }).Capacitor?.Plugins?.RestTimerNative;
    const result = plugin?.getLaunchState?.();
    if (result && typeof result.restoring === "boolean") {
      launchWasCold = !result.restoring;
    }
  } catch {}
}

// The user is returned to the screen they left only when the Activity is rebuilt
// under them. A launch after the app was removed from recents is a fresh start
// and begins at the landing page, like the first launch after installing.
function resolveResumeRoute(): string {
  if (typeof window === "undefined") return ROUTE.campaign;
  try {
    const lastRoute = localStorage.getItem("ultimatum_last_route");
    if (!lastRoute) return ROUTE.campaign;
    if (launchWasCold !== false) {
      localStorage.removeItem("ultimatum_last_route");
      return ROUTE.campaign;
    }
    // The replayed URL already is the last route: nothing to redirect to.
    if (lastRoute === window.location.pathname.replace(/\.html$/, "")) return lastRoute;
    if (NON_APP_ROUTES.includes(lastRoute) || ONBOARDING_ROUTES.includes(lastRoute)) {
      return ROUTE.campaign;
    }
    // Route history is gone after a rebuild, so leaving the app root behind
    // keeps the back button from quitting the app mid-flow.
    window.history.replaceState(window.history.state, "", ROUTE.campaign);
    return lastRoute;
  } catch {}
  return ROUTE.campaign;
}

function takePostAuthTarget(): string | null {
  try {
    const target = sessionStorage.getItem("ultimatum_post_auth_target");
    if (target) {
      sessionStorage.removeItem("ultimatum_post_auth_target");
      return target;
    }
  } catch {}
  return null;
}

if (typeof window !== "undefined") {
  detectLaunchState();
}

type LandingState = "void" | "gatekeeper" | "philosophy" | "protocol";

/**
 * The route of the saved screen, only when this page load is really resuming
 * one (a rebuild, or a Back/reload inside the app). A fresh launch returns null,
 * so the app is never entered without the user leaving the landing page.
 *
 * This used to run on every launch, so a relaunch after clearing the app from
 * recents sent the user straight past ENTER. Storage is left alone here: the
 * finalised route decides it in `resolveResumeRoute`.
 */
function resumeRouteOnlyWhenResuming(): string | null {
  if (typeof window === "undefined") return null;
  if (window.location.pathname.replace(/\.html$/, "") !== "/") return null;
  if (launchWasCold !== false) return null;
  return resolveResumeRoute();
}

/**
 * The walkthrough step a reload should reopen on. The Problem page replaces the
 * root entry with itself, so a reload there re-mounts this page; without the
 * marker it would replay the landing animation underneath the user.
 */
function readOnboardingStep(): LandingState {
  if (typeof window === "undefined") return "void";
  try {
    const saved = sessionStorage.getItem(ONBOARDING_STEP_KEY);
    if (saved === "philosophy" || saved === "gatekeeper" || saved === "protocol") return saved;
  } catch {}
  return "void";
}

/**
 * True when the URL itself says which screen to show. The landing page pushes
 * these onto the history exactly when it shows a step, so a URL without them
 * means the user is at the start (first paint, or a Back that returned here).
 * A plain reload keeps the query, which is what the marker in sessionStorage
 * used to handle.
 */
function urlRequestedStep(): LandingState | null {
  if (typeof window === "undefined") return null;
  return window.location.search.includes("step=") ? readOnboardingStep() : null;
}

export default function Home() {
  // A signed-in user is on their way into the app, so the landing screen (and
  // its ENTER button) must not paint at all. Decided once, for the first render,
  // from the session already on the device: `useState` runs its initialiser a
  // single time, so a later Firebase answer that writes the flag cannot make
  // this flip underneath the user.
  const [resumingSession] = useState(hasLocalSession);

  // The opening screen. A marked step is honoured; otherwise this is the start,
  // even if sessionStorage still carries a marker from an earlier visit.
  const [state, setStateRaw] = useState<LandingState>(() => {
    const requested = urlRequestedStep();
    if (requested) return requested;
    try {
      sessionStorage.removeItem(ONBOARDING_STEP_KEY);
    } catch {}
    return "void";
  });

  // Every step change keeps the reload marker and the visible screen in sync.
  const setState = useCallback((next: LandingState) => {
    try {
      if (next === "void") sessionStorage.removeItem(ONBOARDING_STEP_KEY);
      else sessionStorage.setItem(ONBOARDING_STEP_KEY, next);
    } catch {}
    setStateRaw(next);
  }, []);

  // Captured once, on the first render. While it is true the WebView is already
  // loading the last screen, so redirecting from here would cancel that load
  // and strand the user on a blank page. A real launch instead starts on the
  // landing page and the route cached by the previous session is stale.
  const [restoring] = useState(() => launchWasCold === false);

  const [philosophyStep, setPhilosophyStep] = useState(1);
  // Track which background image is currently active so we can crossfade
  const [bgImage, setBgImage] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status, firebaseUser } = useOfflineSession();

  // Preload all background images immediately on mount so transitions are instant
  useEffect(() => {
    PRELOAD_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Auto-redirect ONLY verified (live Firebase) users to their last known
  // route or the campaign, and only when this page load is resuming a screen the
  // user was already on. A fresh launch - after installing, or after clearing the
  // app from recents - waits on the landing page and enters only on ENTER.
  // Previously this also fired on a stale localStorage "cached session", which
  // opened the app straight into builder mode after a reinstall.
  useEffect(() => {
    if (!firebaseUser) return;
    if (!resumeRouteOnlyWhenResuming()) return;

    let cancelled = false;
    const hasLocalFreq = !!localStorage.getItem("ultimatum_frequency");
    // A verified login triggered by onboarding or a failed cloud sync lands on
    // the campaign (so the sync warning is visible) instead of being bounced
    // straight back out by the "resume last route" logic.
    const postAuthTarget = takePostAuthTarget();
    const targetRoute = postAuthTarget || resolveResumeRoute();

    // A page load that already resumes onto this very route needs no
    // navigation: redirecting to it again would replace the entry the app is
    // loading on and blink the screen. The WebView restores that route from
    // its own state, so there is nothing to do here. An explicit post-auth
    // target is different — it is a deliberate jump, so it always runs.
    if (!postAuthTarget && window.location.pathname.replace(/\.html$/, "") === targetRoute) {
      return;
    }

    if (!hasLocalFreq) {
      // Pre-sync from cloud if this device has no local settings yet
      (async () => {
        try {
          const { loadUserSettingsFromCloud } = await import("@/lib/syncService");
          await loadUserSettingsFromCloud();
        } catch {}
        if (!cancelled) router.replace(targetRoute);
      })();
      return () => {
        cancelled = true;
      };
    }

    router.replace(targetRoute);
    return () => {
      cancelled = true;
    };
  }, [firebaseUser, router]);

  // The Enter button spins only while a real navigation is pending. It must not
  // survive coming back to this screen, or the button stays on "LOADING…"
  // forever with the spinner still acting as a way into the app.
  const [isEntering, setIsEntering] = useState(false);
  // True once the gatekeeper's own history entry exists on top of the landing
  // screen. It is only false while Back is mid-flight to the landing screen.
  const gatekeeperEntryLive = useRef(false);

  // The gatekeeper is a real screen of its own, not a step of the landing page.
  // Giving it its own history entry means Back from it returns to the landing
  // screen (and Back there exits the app), on the button and on the phone.
  const showGatekeeper = () => {
    setIsEntering(false);
    if (gatekeeperEntryLive.current) {
      setState("gatekeeper");
      return;
    }
    gatekeeperEntryLive.current = true;
    window.history.pushState(window.history.state, "", "/?step=warning");
    setState("gatekeeper");
  };

  // A reload of /?step=warning re-enters the gatekeeper once it has mounted
  // (the state already comes from the marker; only the history entry is missing).
  const [gatekeeperRequested] = useState<boolean>(() => readOnboardingStep() === "gatekeeper");
  useEffect(() => {
    if (!gatekeeperRequested) return;
    gatekeeperEntryLive.current = true;
    window.history.pushState(window.history.state, "", "/?step=warning");
  }, [gatekeeperRequested]);

  const handleEnter = () => {
    if (status === "authenticated") {
      // Already known: navigate on the same frame as the tap. Spinning the
      // button here only added a visible wait before the route changed.
      router.replace(resolveResumeRoute());
      return;
    }
    if (status === "loading") {
      // Auth still resolving without a cached session: the effect below
      // finishes the Enter when the answer arrives.
      setIsEntering(true);
      return;
    }
    showGatekeeper();
  };

  // A request that never resolves must not leave the button spinning forever.
  useEffect(() => {
    if (!isEntering) return;
    const timer = setTimeout(() => setIsEntering(false), 10000);
    return () => clearTimeout(timer);
  }, [isEntering]);

  // Every way back into this page — hardware Back, the browser's gesture, or a
  // navigation that returns here — must show the landing screen with its ENTER
  // button, never keep whichever step happened to be open (or, worse, leave the
  // button spinning from the Enter press that led there).
  const returnToLanding = useCallback(() => {
    gatekeeperEntryLive.current = false;
    setIsEntering(false);
    setState("void");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", returnToLanding);
    return () => window.removeEventListener("popstate", returnToLanding);
  }, [returnToLanding]);

  const leaveGatekeeper = () => {
    // Back = the browser's Back: the previous entry is the landing screen.
    window.history.back();
  };

  useHardwareBack(state === "philosophy", () => {
    // The doctrine walkthrough is one page below the gatekeeper in history.
    window.history.back();
  });
  useHardwareBack(state === "gatekeeper", leaveGatekeeper);

  useEffect(() => {
    if (isEntering && status !== "loading") {
      // Finishing a pending Enter is a hand-off, not derived UI state.
      /* eslint-disable react-hooks/set-state-in-effect */
      if (status === "authenticated") {
        setIsEntering(false);
        router.replace(resolveResumeRoute());
      } else {
        showGatekeeper();
      }
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEntering, status, router]);

  // A signed-in user is being handed to their last screen. Painting the
  // landing page here for even one frame is the flash that made an in-app
  // reload look like a sign-out, so the screen stays blank (black, not an empty
  // page) until the hand-off happens. It never applies to a real launch: those
  // have no session yet, so this is false and the landing page renders at once.
  if (resumingSession && status === "loading") {
    return <main className="fixed inset-0 bg-black" aria-busy="true" />;
  }

  return (
    <main className={`min-h-screen w-full bg-black font-sans selection:bg-red-900 selection:text-white ${state === "protocol" ? "" : "flex flex-col items-center justify-center overflow-hidden"}`}>
      
      {/* ENTER screen: kept in its own wait-mode AnimatePresence so DotField cleanly unmounts */}
      <AnimatePresence mode="wait">
        {/* Back on the gatekeeper returns to the landing screen instead of quitting. */}
        {state === "gatekeeper" && (
          <motion.button
            key="gatekeeper-back"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={leaveGatekeeper}
            className="absolute top-6 left-6 z-20 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
            aria-label="Back to start"
          >
            <ArrowLeft size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
          </motion.button>
        )}

        {state === "void" && (
          <motion.div
            key="void"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ willChange: "opacity" }}
            className="flex items-center justify-center w-full h-full absolute inset-0"
          >
            <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-black">
              <div className="absolute inset-0 opacity-30 z-0">
                <DotField 
                  dotRadius={1}
                  dotSpacing={20}
                  cursorRadius={400}
                  cursorForce={0.1}
                  bulgeOnly={true}
                  bulgeStrength={50}
                  glowRadius={150}
                  sparkle={true}
                  waveAmplitude={1}
                  gradientFrom="rgba(255, 255, 255, 0.2)"
                  gradientTo="rgba(255, 255, 255, 0.05)"
                  glowColor="rgba(255, 255, 255, 0.02)"
                />
              </div>
              <motion.div
                className="w-full h-full absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                animate={{
                  y: [0, -40, 0],
                  scale: [1, 1.06, 1],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.img 
                   src="/alllahhahahah.png" 
                   alt="Ultimatum" 
                   className="w-full h-full object-cover object-center md:object-contain"
                   initial={{ opacity: 0, scale: 1.3 }}
                   animate={{ opacity: 0.7, scale: 1.25 }}
                   transition={{ duration: 1.2, ease: "easeOut" }}
                   style={{ willChange: "opacity, transform" }}
                />
              </motion.div>
              {/* Radial gradient to seamlessly blend the image edges into the black background */}
              <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,1)_80%)] md:bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,1)_90%)] pointer-events-none"></div>
            </div>
          <motion.button
              onClick={handleEnter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black font-bold tracking-[0.3em] text-sm uppercase rounded-full py-4 px-12 relative z-10 shadow-md hover:shadow-lg transition-shadow duration-500"
            >
              {isEntering ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block" />
                  LOADING...
                </span>
              ) : (
                <DecryptedText
                  text="ENTER"
                  speed={50}
                  maxIterations={15}
                  characters="01!*?"
                  animateOn="hover"
                  encryptedClassName="text-neutral-500"
                />
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GPU backdrop-filter warmup: always mounted 1px element keeps a compositor layer active,
          eliminating the first-paint delay of backdrop-blur when glass cards appear */}
      <div
        className="backdrop-blur-xl"
        style={{
          position: "fixed",
          top: -2,
          left: -2,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
          willChange: "backdrop-filter",
        }}
        aria-hidden="true"
      />

      {/* Sync crossfade group: gatekeeper and philosophy overlap during transition.
          This eliminates the black gap between them and lets backdrop-blur paint
          before the entering element becomes visible (key fix for the end-of-fade stutter). */}
      <AnimatePresence mode="sync">
        {state === "gatekeeper" && (
          <motion.div
            key="gatekeeper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ willChange: "opacity" }}
            className="w-full h-full absolute inset-0 flex items-center justify-center p-6 z-10"
          >
            <img src="/onboarding/photo-1694023536590-60d02108b323.avif" className="absolute inset-0 w-full h-full object-cover -z-10" alt="Background" />
            <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>
            
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/20 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 text-center flex flex-col items-center" style={{ willChange: "backdrop-filter" }}>
              <h1 className="tracking-[0.3em] md:tracking-[0.4em] text-xl md:text-2xl font-bold mb-6 uppercase text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                <DecryptedText
                  text="WARNING"
                  speed={30}
                  maxIterations={8}
                  characters="01!@#$%^&*?"
                  animateOn="view"
                  encryptedClassName="text-white/50"
                />
              </h1>

              <div className="space-y-4 text-white/80 text-xs md:text-sm leading-relaxed mb-6 font-light">
                <p>
                  This is not another generic bro-split. <strong className="text-white font-semibold">None of the logic here is generated by AI.</strong>
                </p>
                <p>
                  Every protocol in Project Ultimatum is forged entirely from elite coaching data and peer-reviewed sports science.
                </p>
                
                <div className="pt-2">
                  <div className="w-12 h-px bg-white/10 mx-auto mb-4" />
                  <p className="text-xs md:text-sm text-white/80 mb-2">
                    If you have the time, patience, and attention span to understand the foundational truth of optimal training, read the Doctrine.
                  </p>
                  <p className="text-xs md:text-sm text-white/80">
                    If not, skip straight to the routine.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full mt-2">
                <motion.button
                  onClick={() => router.push("/directive?fastTrack=true")}
                  whileHover={{ scale: 1.05, backgroundColor: "#ffffff", color: "#000000" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full font-black tracking-[0.15em] uppercase py-4 px-6 text-[11px] md:text-sm rounded-full bg-white text-black shadow-sm hover:shadow-md transition-all"
                >
                  SKIP TO ROUTINE (RECOMMENDED)
                </motion.button>

                <div className="flex flex-col items-center w-full mb-1">
                  <motion.button
                    onClick={() => {
                      // The walkthrough sits on the gatekeeper's entry: Back
                      // from the Problem page lands on the gatekeeper, and
                      // Back from the gatekeeper on the landing screen.
                      setState("philosophy");
                    }}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full font-bold tracking-[0.15em] uppercase py-4 px-6 text-[11px] md:text-xs rounded-full bg-transparent text-white border border-white/20 hover:border-white/50 transition-all"
                  >
                    READ DOCTRINE
                  </motion.button>
                  <p className="text-[10px] md:text-[11px] text-white/50 mt-3 font-medium tracking-wide text-center">
                    (You can always read the Doctrine later in Settings)
                  </p>
                </div>

                <motion.button
                  onClick={() => router.push("/auth?mode=login")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full font-bold tracking-[0.15em] uppercase py-3 px-6 text-[10px] md:text-xs rounded-full bg-transparent text-neutral-500 hover:text-white transition-all mt-2"
                >
                  RETURNING USER? LOGIN
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {state === "philosophy" && (
          <motion.div
            key="philosophy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // delay: 0.08 — while gatekeeper is still fading out (sync mode), philosophy
            // mounts at opacity:0. The 80ms delay gives the browser time to compute the
            // backdrop-blur before opacity starts rising — eliminating the end-of-fade pop.
            transition={{ duration: 0.28, delay: 0.08, ease: "easeOut" }}
            style={{ willChange: "opacity" }}
            className="w-full h-full absolute inset-0 flex items-center justify-center p-6 z-20"
          >
            {/* Always mounted background images with CSS opacity crossfade */}
            <img 
              src="/fsdfdjfsdffdsfs/pexels-bynikolavu-10021269.jpg" 
              className={`absolute inset-0 w-full h-full object-cover -z-10 transition-opacity duration-200 ${philosophyStep === 1 ? "opacity-100" : "opacity-0"}`} 
              style={{ transform: "translateZ(0)", willChange: "opacity" }}
              alt="" 
            />
            <img 
              src="/fsdfdjfsdffdsfs/pexels-marta-nogueira-589022975-17093369.jpg" 
              className={`absolute inset-0 w-full h-full object-cover -z-10 transition-opacity duration-200 ${philosophyStep === 2 ? "opacity-100" : "opacity-0"}`} 
              style={{ transform: "translateZ(0)", willChange: "opacity" }}
              alt="" 
            />
            <img 
              src="/fsdfdjfsdffdsfs/pexels-shammah-njomo-578243531-35651163.jpg" 
              className={`absolute inset-0 w-full h-full object-cover -z-10 transition-opacity duration-200 ${philosophyStep === 3 ? "opacity-100" : "opacity-0"}`} 
              style={{ transform: "translateZ(0)", willChange: "opacity" }}
              alt="" 
            />
            
            <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none"></div>
            
            {/* Single static card — only the inner content animates via CSS */}
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/20 rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 flex flex-col items-center overflow-hidden" style={{ willChange: "backdrop-filter" }}>
              
              {/* Dummy invisible spacer to enforce minimum height and structure so absolute children don't collapse the parent */}
              <div className="w-full flex flex-col justify-between p-8 md:p-12 opacity-0 pointer-events-none select-none min-h-[380px] md:min-h-[420px]">
                <div>
                  <h2 className="text-2xl md:text-3xl font-light tracking-[0.1em] uppercase leading-tight mb-6">Stop Guessing,<br/>Start Progressing</h2>
                  <p className="text-sm md:text-base leading-relaxed mb-10">Project Ultimatum integrates high-intensity, low-volume training with precision nutrition and sleep tracking. It is built entirely on zero-BS scientific data. A casual bro-split or generic 4x12 PPL is horribly inefficient for a natural lifter.</p>
                </div>
                <div className="flex w-full gap-4 mt-auto">
                  <div className="w-1/3 py-4"></div>
                  <div className="w-2/3 py-4"></div>
                </div>
              </div>

              {/* STEP 1 */}
              <div className={`absolute inset-0 flex flex-col justify-between text-center p-8 md:p-12 transition-opacity duration-200 ${philosophyStep === 1 ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <div>
                  <h3 className="text-xs font-semibold tracking-[0.3em] uppercase text-white/50 mb-6 drop-shadow-md">The Problem</h3>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed font-light mb-10">
                    Most fitness apps feed you recycled routines and arbitrary high-volume junk. They ignore <span className="text-white font-semibold">mechanical tension</span>, <span className="text-white font-semibold">progression</span>, and <span className="text-white font-semibold">maximum recoverable volume</span>. A casual bro-split or generic 4x12 PPL is horribly inefficient for a natural lifter.
                  </p>
                </div>
                
                <motion.button
                  onClick={() => setPhilosophyStep(2)}
                  whileHover={{ scale: 1.05, backgroundColor: "#ffffff", color: "#000000" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full md:w-auto font-semibold tracking-[0.2em] uppercase py-4 px-10 text-xs md:text-sm rounded-full bg-white/20 text-white shadow-sm hover:shadow-md transition-all border border-white/30 mt-auto"
                >
                  Next
                </motion.button>
              </div>

              {/* STEP 2 */}
              <div className={`absolute inset-0 flex flex-col justify-between text-center p-8 md:p-12 transition-opacity duration-200 ${philosophyStep === 2 ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <div>
                  <h2 className="text-2xl md:text-3xl font-light tracking-[0.1em] uppercase text-white leading-tight mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    Stop Guessing,<br/>Start Progressing
                  </h2>
                  <div className="text-white/80 text-sm md:text-base leading-relaxed font-light mb-10">
                    Project Ultimatum integrates high-intensity, low-volume training with precision nutrition and sleep tracking. It is built entirely on zero-BS scientific data.
                  </div>
                </div>
                
                <div className="flex w-full gap-4 justify-center mt-auto">
                  <motion.button
                    onClick={() => setPhilosophyStep(1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-1/3 md:w-auto font-semibold tracking-[0.2em] uppercase py-4 px-6 text-xs md:text-sm rounded-full bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={() => setPhilosophyStep(3)}
                    whileHover={{ scale: 1.05, backgroundColor: "#ffffff", color: "#000000" }}
                    whileTap={{ scale: 0.95 }}
                    className="w-2/3 md:w-auto font-semibold tracking-[0.2em] uppercase py-4 px-10 text-xs md:text-sm rounded-full bg-white/20 text-white shadow-sm hover:shadow-md transition-all border border-white/30"
                  >
                    Next
                  </motion.button>
                </div>
              </div>

              {/* STEP 3 */}
              <div className={`absolute inset-0 flex flex-col justify-between text-center p-8 md:p-12 transition-opacity duration-200 ${philosophyStep === 3 ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <div>
                  <h3 className="text-xs font-semibold tracking-[0.3em] uppercase text-white/50 mb-6 drop-shadow-md">
                    The Truth
                  </h3>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed font-light mb-10">
                    If you train with true intensity, pushing close to muscular failure, you do not need endless sets. Just <span className="text-white font-semibold drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">3 to 10 high-quality sets</span> per muscle group, per week, is optimal for peak growth. Anything more is junk volume.
                  </p>
                </div>

                <div className="flex flex-col w-full gap-4 mt-auto">
                  <motion.button
                    onClick={() => setState("protocol")}
                    whileHover={{ scale: 1.05, backgroundColor: "#ffffff", color: "#000000" }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full font-semibold tracking-[0.2em] uppercase py-4 px-10 text-xs md:text-sm rounded-full bg-white text-black shadow-md hover:shadow-lg transition-all"
                  >
                    Create Protocol
                  </motion.button>
                  <motion.button
                    onClick={() => setPhilosophyStep(2)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full font-semibold tracking-[0.2em] uppercase py-3 px-6 text-[10px] md:text-xs rounded-full bg-transparent text-white/50 hover:text-white transition-all"
                  >
                    Back
                  </motion.button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Protocol: separate AnimatePresence with its own slow dramatic fade */}
      <AnimatePresence>
        {state === "protocol" && (
          <motion.div
            key="protocol"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-full bg-black min-h-screen text-white relative z-30"
          >
            {/* The Sticky Scroll Section */}
            <TruthsSection />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
