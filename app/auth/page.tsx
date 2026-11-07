"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import DecryptedText from "@/components/DecryptedText";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { hasLocalSession } from "@/lib/useOfflineSession";
import { requestNotificationPermissions, scheduleDailyReminders } from "@/lib/notifications";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

type AuthMode = "login" | "signup" | "forgot_password" | "reset_password";

function AuthContent() {
  // A signed-in user never needs this form. Showing it for a frame during an
  // in-app reload is the same flash as the landing page's, so the screen stays
  // blank until Firebase confirms them and the redirect below runs.
  const [signedIn] = useState(hasLocalSession);
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as AuthMode) || "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOverrideWarning, setShowOverrideWarning] = useState(false);
  const router = useRouter();

  const copyPendingSetupToLocal = () => {
    // The pending setup is consumed here; clear it so a later visit to the
    // landing screen cannot re-apply a stale protocol (reinstall / cache wipe).
    const keysToCopy = [
      { sessionKey: "pending_frequency", localKey: "ultimatum_frequency", defaultVal: "3-days" },
      { sessionKey: "pending_gender", localKey: "ultimatum_gender", defaultVal: "male" },
      { sessionKey: "pending_directive", localKey: "ultimatum_directive" },
      { sessionKey: "ultimatum_diet_plan", localKey: "ultimatum_diet_plan" },
      { sessionKey: "ultimatum_calories", localKey: "ultimatum_calories" },
      { sessionKey: "ultimatum_protein", localKey: "ultimatum_protein" },
      { sessionKey: "ultimatum_fats", localKey: "ultimatum_fats" },
      { sessionKey: "ultimatum_carbs", localKey: "ultimatum_carbs" },
      { sessionKey: "ultimatum_training_days", localKey: "ultimatum_training_days" },
      { sessionKey: "ultimatum_cardio_enabled", localKey: "ultimatum_cardio_enabled" },
      { sessionKey: "ultimatum_cardio_split", localKey: "ultimatum_cardio_split" },
      { sessionKey: "ultimatum_flex_enabled", localKey: "ultimatum_flex_enabled" },
      { sessionKey: "ultimatum_flex_tier", localKey: "ultimatum_flex_tier" },
      { sessionKey: "ultimatum_campaign_override", localKey: "ultimatum_campaign_override" },
      { sessionKey: "ultimatum_custom_campaign_cache", localKey: "ultimatum_custom_campaign_cache" },
    ];

    keysToCopy.forEach(({ sessionKey, localKey, defaultVal }) => {
      const val = sessionStorage.getItem(sessionKey);
      if (val) {
        localStorage.setItem(localKey, val);
      } else if (defaultVal) {
        localStorage.setItem(localKey, defaultVal);
      }
    });

    localStorage.setItem("ultimatum_campaign_day", "0");
  };

  const clearPendingSetup = () => {
    const keysToClear = [
      "pending_frequency", "pending_gender", "pending_directive", 
      "ultimatum_diet_plan", "ultimatum_calories", "ultimatum_protein", 
      "ultimatum_fats", "ultimatum_carbs", "ultimatum_training_days",
      "ultimatum_cardio_enabled", "ultimatum_cardio_split", 
      "ultimatum_flex_enabled", "ultimatum_flex_tier"
    ];
    keysToClear.forEach(key => sessionStorage.removeItem(key));
  };

  // Persist the user's protocol to Firestore. saveUserSettingsToCloud already
  // retries internally (3 attempts); this outer cap is only a safety net so a
  // dead network cannot hang signup/login indefinitely.
  const persistToCloud = async (uid: string): Promise<void> => {
    const { saveUserSettingsToCloud } = await import("@/lib/syncService");
    await Promise.race([
      saveUserSettingsToCloud(uid),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Cloud save timed out after 20s")), 20000)),
    ]);
  };

  const flagCloudSyncWarning = () => {
    try {
      sessionStorage.setItem("ultimatum_cloud_sync_warning", "true");
      // Land on /campaign after auth so the warning banner is actually seen
      // (it lives on the campaign screen, not on the landing screen).
      sessionStorage.setItem("ultimatum_post_auth_target", "/campaign");
    } catch {}
  };

  const clearCloudSyncWarning = () => {
    try { sessionStorage.removeItem("ultimatum_cloud_sync_warning"); } catch {}
  };

  /**
   * Leaving auth for the main app. Setup screens there were opened by a real
   * session (their own Back button points at Settings), so auth is replaced
   * rather than pushed; the landing screen also keeps its dismiss-on-back.
   */
  const leaveAuthForCampaign = () => {
    router.replace("/campaign");
  };

  /**
   * Signing up from the end of onboarding has nothing sensible behind it —
   * the wizard is finished. Swapping the stack root keeps Back from exiting
   * the app right after account creation; a login keeps its history.
   */
  const leaveAuthAfterSignup = () => {
    if (mode === "signup") {
      window.history.replaceState(window.history.state, "", "/campaign");
    } else {
      router.replace("/campaign");
    }
  };

  const confirmOverride = async () => {
    copyPendingSetupToLocal();
    clearPendingSetup();
    const { saveUserSettingsToCloud } = await import("@/lib/syncService");
    await saveUserSettingsToCloud();
    setShowOverrideWarning(false);
    leaveAuthForCampaign();
  };

  const cancelOverride = async () => {
    clearPendingSetup();
    const { loadUserSettingsFromCloud } = await import("@/lib/syncService");
    await loadUserSettingsFromCloud();
    setShowOverrideWarning(false);
    leaveAuthForCampaign();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (mode === "login" || mode === "signup") {
      let authError: string | null = null;
      let userCredential: any = null;

      try {
        const authPromise = mode === "signup" 
          ? createUserWithEmailAndPassword(auth, email, password)
          : signInWithEmailAndPassword(auth, email, password);

        userCredential = await Promise.race([
          authPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Authentication timed out. Check connection.")), 10000))
        ]);
      } catch (err: any) {
        authError = err.message?.replace("Firebase: ", "") || "Authentication failed";
      }

      if (authError) {
        setError(authError);
        setLoading(false);
      } else {
        const loggedInUid = userCredential?.user?.uid;

        if (userCredential?.user) {
          // Cache the session locally for immediate access during the boot
          // loader. MUST match the shape useOfflineSession writes, otherwise
          // getAuthHeaders() (custom-split /api/sync calls) and the offline
          // fallback read a malformed object.
          const cachedToken = await userCredential.user.getIdToken().catch(() => undefined);
          localStorage.setItem("ultimatum_cached_session", JSON.stringify({
            user: {
              id: userCredential.user.uid,
              email: userCredential.user.email,
              name: userCredential.user.displayName,
            },
            access_token: cachedToken,
          }));
        }

        const pendingFreq = sessionStorage.getItem("pending_frequency");
        const existingFreq = localStorage.getItem("ultimatum_frequency");

        if (pendingFreq) {
          if (existingFreq && mode === "login") {
            setShowOverrideWarning(true);
            setLoading(false);
            return;
          } else {
            copyPendingSetupToLocal();
            clearPendingSetup();
            // Always save to cloud after copying pending setup — this is the
            // critical step that persists data for returning logins.
            try {
              await persistToCloud(loggedInUid);
              clearCloudSyncWarning();
            } catch (err) {
              console.error("[auth] PENDING SETUP CLOUD SAVE FAILED:", err);
              flagCloudSyncWarning();
            }
            router.replace("/campaign");
          }
        } else {
          // Returning login — check notification permission and request if not granted
          if (Capacitor.isNativePlatform()) {
            try {
              const { display } = await LocalNotifications.checkPermissions();
              if (display !== 'granted') {
                await requestNotificationPermissions();
              }
              await scheduleDailyReminders();
            } catch (_) {}
          }
          
          if (mode === "login") {
            const { loadUserSettingsFromCloud } = await import("@/lib/syncService");

            // CRITICAL: await the Firestore fetch and hydrate localStorage
            // BEFORE routing to the dashboard, so a returning user's routine is
            // injected into global state (localStorage) first.
            let keysRestored = 0;
            try {
              keysRestored = await loadUserSettingsFromCloud(loggedInUid);
            } catch (err: any) {
              // loadUserSettingsFromCloud already retried internally; if it still
              // failed we surface a warning rather than silently defaulting to PPL.
              console.error("[auth] LOGIN HYDRATION FAILED — proceeding with local data only:", err?.message || err);
              flagCloudSyncWarning();
            }

            if (keysRestored > 0) {
              console.log("[auth] Cloud hydration succeeded —", keysRestored, "keys restored. Proceeding to campaign.");
              clearCloudSyncWarning();
            } else {
              console.warn("[auth] Cloud hydration returned 0 keys. User may have no saved data or is a new account.");
            }

          } else if (mode === "signup") {
            // New signup with no pending setup — save any local data to cloud
            try {
              await persistToCloud(loggedInUid);
              clearCloudSyncWarning();
            } catch (saveErr) {
              console.error("[auth] SIGNUP CLOUD SAVE FAILED:", saveErr);
              flagCloudSyncWarning();
            }
          }

          // Successful login/signup — go to the main app
          leaveAuthAfterSignup();
        }
      }
    } else if (mode === "forgot_password") {
      try {
        await sendPasswordResetEmail(auth, email);
        setError("If an account exists, a reset link was sent to your email.");
      } catch (err: any) {
        setError(err.message?.replace("Firebase: ", "") || "Failed to send reset email");
      }
      setLoading(false);
    } else if (mode === "reset_password") {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          await updatePassword(currentUser, password);
          setMode("login");
          setError("Password reset successfully. Please login.");
        } else {
          setError("No authenticated user. Please use the reset link from your email.");
        }
      } catch (err: any) {
        setError(err.message?.replace("Firebase: ", "") || "Failed to reset password");
      }
      setLoading(false);
    }
  };

  const getHeading = () => {
    switch (mode) {
      case "login": return "AUTHORIZE";
      case "signup": return "INITIATE";
      case "forgot_password": return "RECOVER";
      case "reset_password": return "RESET";
    }
  };

  const getSubheading = () => {
    switch (mode) {
      case "login": return "Access your active campaign.";
      case "signup": return "Create your identity. The protocol awaits.";
      case "forgot_password": return "Request access recovery code.";
      case "reset_password": return "Establish new credentials.";
    }
  };

  if (signedIn) {
    return <main className="fixed inset-0 bg-black" aria-busy="true" />;
  }

  return (
    <main 
      className="min-h-screen w-full flex items-center justify-center p-6 font-sans relative z-10"
    >
      <img src="/onboarding/premium_photo-1672862928749-d49270b3af84.avif" className="absolute inset-0 w-full h-full object-cover pointer-events-none -z-20" alt="Background" />
      <div className="absolute inset-0 bg-black/80 z-0 pointer-events-none"></div>

      <motion.div
        key={mode} // Animate on mode change
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/20 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10"
      >
        <h1 className="text-3xl font-light uppercase tracking-[0.2em] mb-2 text-white drop-shadow-md text-center">
          <DecryptedText text={getHeading()} animateOn="view" speed={50} maxIterations={10} encryptedClassName="text-white/30" />
        </h1>
        <p className="text-white/70 mb-10 text-sm font-light text-center leading-relaxed">
          {getSubheading()}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all text-white placeholder-white/20 shadow-inner"
              required
            />
          </div>

          {mode === "reset_password" && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Recovery Code</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all text-white placeholder-white/20 shadow-inner"
                required
              />
            </div>
          )}

          {mode !== "forgot_password" && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">
                {mode === "reset_password" ? "New Password" : "Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all text-white placeholder-white/20 shadow-inner"
                required
              />
            </div>
          )}

          {mode === "signup" && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all text-white placeholder-white/20 shadow-inner"
                required
              />
            </div>
          )}

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 font-semibold tracking-[0.2em] uppercase py-4 px-10 text-xs md:text-sm rounded-full bg-white/20 text-white shadow-sm hover:shadow-md hover:bg-white hover:text-black transition-all border border-white/30 disabled:opacity-50 disabled:hover:bg-white/20 disabled:hover:text-white"
          >
            {loading ? "PROCESSING..." : mode === "login" ? "ENTER" : mode === "signup" ? "JOIN" : mode === "forgot_password" ? "SEND CODE" : "UPDATE"}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4 text-center text-xs font-bold tracking-wider text-white/50 uppercase">
          {mode === "login" || mode === "signup" ? (
            <>
              {mode === "signup" && (
                <button onClick={() => setMode("login")} className="hover:text-white transition-colors decoration-white/30 underline-offset-4">
                  Already have an account? SIGN IN
                </button>
              )}
              {mode === "login" && (
                <button type="button" onClick={() => setMode("forgot_password")} className="hover:text-white transition-colors">
                  Forgot Password?
                </button>
              )}
            </>
          ) : (
            <button onClick={() => setMode("login")} className="hover:text-white transition-colors decoration-white/30 underline-offset-4">
              Return to SIGN IN
            </button>
          )}
        </div>
      </motion.div>

      {/* OVERRIDE WARNING MODAL */}
      <AnimatePresence>
        {showOverrideWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-neutral-950 border-2 border-red-900 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)] relative overflow-hidden"
            >
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-red-600/20 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-950/50 rounded-full flex items-center justify-center border border-red-900/50 mb-6">
                  <AlertTriangle size={32} className="text-red-500" />
                </div>
                
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-red-500 mb-4 drop-shadow-[0_0_10px_rgba(220,38,38,0.4)]">
                  WARNING: ACTIVE PROTOCOL DETECTED
                </h3>
                
                <p className="text-neutral-300 text-sm md:text-base leading-relaxed mb-8">
                  You are currently assigned to an active training block on this device. Proceeding will <strong className="text-white font-bold">completely overwrite</strong> your existing program and <strong className="text-red-400">reset all your progress back to Day 1</strong>. Are you certain you want to abandon your current path?
                </p>
                
                <div className="flex flex-col md:flex-row w-full gap-4">
                  <button
                    onClick={cancelOverride}
                    className="flex-1 px-6 py-4 bg-transparent border-2 border-neutral-700 text-white font-bold uppercase tracking-[0.1em] text-xs md:text-sm rounded-lg hover:border-white hover:bg-white/5 transition-all duration-300"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={confirmOverride}
                    className="flex-1 px-6 py-4 bg-red-600 border-2 border-red-600 text-white font-black uppercase tracking-[0.1em] text-xs md:text-sm rounded-lg shadow-sm hover:shadow-md hover:bg-red-500 hover:border-red-500 transition-all duration-300"
                  >
                    OVERRIDE PROTOCOL
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-black text-white">LOADING...</div>}>
      <AuthContent />
    </Suspense>
  );
}
