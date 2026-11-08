"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Mail } from "lucide-react";
import DecryptedText from "@/components/DecryptedText";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { hasLocalSession } from "@/lib/useOfflineSession";
import { isUserAllowedIn } from "@/lib/authHelper";
import { requestNotificationPermissions, scheduleDailyReminders } from "@/lib/notifications";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

type AuthMode = "login" | "signup" | "forgot_password" | "reset_password" | "verify_email";

function AuthContent() {
  const [signedIn, setSignedIn] = useState(hasLocalSession);
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as AuthMode) || "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showOverrideWarning, setShowOverrideWarning] = useState(false);
  const router = useRouter();

  // Verification Screen States
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Auto-redirect allowed users into the app, or direct unverified users to verification screen
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && isUserAllowedIn(user)) {
        router.replace("/campaign");
      } else if (user && !isUserAllowedIn(user)) {
        setSignedIn(false);
        setVerificationEmail(user.email || "");
        setMode("verify_email");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Cooldown timer tick down
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const copyPendingSetupToLocal = () => {
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
      sessionStorage.setItem("ultimatum_post_auth_target", "/campaign");
    } catch {}
  };

  const clearCloudSyncWarning = () => {
    try { sessionStorage.removeItem("ultimatum_cloud_sync_warning"); } catch {}
  };

  const leaveAuthForCampaign = () => {
    router.replace("/campaign");
  };

  const leaveAuthAfterSignup = () => {
    router.replace("/campaign");
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

  /**
   * Finalizes successful authentication across all sign-in methods
   * (email/password login, email verification, and Google Sign-In).
   */
  const completeSuccessfulAuth = async (user: User) => {
    const loggedInUid = user.uid;

    const cachedToken = await user.getIdToken().catch(() => undefined);
    localStorage.setItem("ultimatum_cached_session", JSON.stringify({
      user: {
        id: user.uid,
        email: user.email,
        name: user.displayName,
      },
      access_token: cachedToken,
    }));
    localStorage.setItem("ultimatum_session_active", "1");

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
      if (Capacitor.isNativePlatform()) {
        try {
          const { display } = await LocalNotifications.checkPermissions();
          if (display !== "granted") {
            await requestNotificationPermissions();
          }
          await scheduleDailyReminders();
        } catch (_) {}
      }

      const { loadUserSettingsFromCloud } = await import("@/lib/syncService");
      let keysRestored = 0;
      try {
        keysRestored = await loadUserSettingsFromCloud(loggedInUid);
      } catch (err: any) {
        console.error("[auth] LOGIN HYDRATION FAILED — proceeding with local data only:", err?.message || err);
        flagCloudSyncWarning();
      }

      if (keysRestored > 0) {
        console.log("[auth] Cloud hydration succeeded —", keysRestored, "keys restored. Proceeding to campaign.");
        clearCloudSyncWarning();
      } else {
        console.warn("[auth] Cloud hydration returned 0 keys. Initializing local data backup.");
        try {
          await persistToCloud(loggedInUid);
          clearCloudSyncWarning();
        } catch (saveErr) {
          console.error("[auth] SIGNUP CLOUD SAVE FAILED:", saveErr);
          flagCloudSyncWarning();
        }
      }

      leaveAuthAfterSignup();
    }
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
        return;
      }

      const user = userCredential?.user as User | undefined;
      if (!user) {
        setError("Authentication failed: No user returned");
        setLoading(false);
        return;
      }

      // If newly registered, immediately trigger email verification
      if (mode === "signup") {
        try {
          await sendEmailVerification(user);
        } catch (verErr: any) {
          console.warn("[auth] sendEmailVerification error:", verErr);
        }
      }

      // Zero-loss grandfathering & verification check
      if (!isUserAllowedIn(user)) {
        setVerificationEmail(user.email || email);
        setMode("verify_email");
        setResendCooldown(60);
        setLoading(false);
        return;
      }

      // Allowed user - proceed with standard authentication flow
      await completeSuccessfulAuth(user);
      setLoading(false);
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

  // Google Sign-In handler (Hybrid Web + Capacitor Android)
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const { signInWithGoogle, checkUserProfileExists } = await import("@/lib/authHelper");
      const userCredential = await signInWithGoogle();
      const user = userCredential.user;

      if (!user) {
        throw new Error("No user returned from Google authentication.");
      }

      const uid = user.uid;

      // Safe check if profile exists (capped at 3s so it never hangs)
      let exists = false;
      try {
        exists = await Promise.race([
          checkUserProfileExists(uid),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 3000)),
        ]);
      } catch (checkErr) {
        console.warn("[auth] Profile check skipped/errored:", checkErr);
      }

      const pendingFreq = sessionStorage.getItem("pending_frequency");
      const existingFreq = localStorage.getItem("ultimatum_frequency");

      if (exists) {
        // Document already exists! Preserve it completely.
        if (pendingFreq && existingFreq) {
          setShowOverrideWarning(true);
          setGoogleLoading(false);
          return;
        }

        if (Capacitor.isNativePlatform()) {
          try {
            const { display } = await LocalNotifications.checkPermissions();
            if (display !== "granted") {
              await requestNotificationPermissions();
            }
            await scheduleDailyReminders();
          } catch (_) {}
        }

        try {
          const { loadUserSettingsFromCloud } = await import("@/lib/syncService");
          await Promise.race([
            loadUserSettingsFromCloud(uid),
            new Promise((resolve) => setTimeout(resolve, 3000)),
          ]);
          clearCloudSyncWarning();
        } catch (err) {
          console.warn("[auth] Google login hydration failed:", err);
          flagCloudSyncWarning();
        }
      } else {
        // Document does not exist. Initialize user profile with existing logic
        if (pendingFreq) {
          copyPendingSetupToLocal();
          clearPendingSetup();
        }
        try {
          await Promise.race([
            persistToCloud(uid),
            new Promise((resolve) => setTimeout(resolve, 3000)),
          ]);
          clearCloudSyncWarning();
        } catch (saveErr) {
          console.warn("[auth] Google signup cloud save failed:", saveErr);
          flagCloudSyncWarning();
        }
      }

      // Cache session in localStorage
      const cachedToken = await user.getIdToken().catch(() => undefined);
      localStorage.setItem("ultimatum_cached_session", JSON.stringify({
        user: {
          id: user.uid,
          email: user.email,
          name: user.displayName,
        },
        access_token: cachedToken,
      }));
      localStorage.setItem("ultimatum_session_active", "1");

      leaveAuthAfterSignup();
      router.replace("/campaign");
    } catch (err: any) {
      console.error("[auth] Google sign-in error:", err);
      if (err.code === "auth/account-exists-with-different-credential") {
        setError("An account already exists with this email address. Please sign in with your email and password.");
      } else if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign-in popup was closed before completion.");
      } else {
        setError(err.message?.replace("Firebase: ", "") || "Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Verification button handler: reload and check status
  const handleCheckVerification = async () => {
    setCheckingVerification(true);
    setVerifyFeedback(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        setVerifyFeedback({
          type: "error",
          message: "No active session found. Please sign in with your credentials.",
        });
        setCheckingVerification(false);
        return;
      }

      await user.reload();
      const reloadedUser = auth.currentUser;

      if (reloadedUser && isUserAllowedIn(reloadedUser)) {
        setVerifyFeedback({
          type: "success",
          message: "Email confirmed. Initializing your protocol...",
        });
        await completeSuccessfulAuth(reloadedUser);
      } else {
        setVerifyFeedback({
          type: "error",
          message: "Your email has not been verified yet. Check your inbox and click the verification link.",
        });
      }
    } catch (err: any) {
      setVerifyFeedback({
        type: "error",
        message: err.message?.replace("Firebase: ", "") || "Verification check failed. Please try again.",
      });
    } finally {
      setCheckingVerification(false);
    }
  };

  // Resend verification email handler with cooldown
  const handleResendVerification = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setVerifyFeedback(null);

    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setResendCooldown(60);
        setVerifyFeedback({
          type: "success",
          message: "Verification email resent. Check your inbox and spam folder.",
        });
      } else {
        setVerifyFeedback({
          type: "error",
          message: "Session expired. Please sign out and sign in again.",
        });
      }
    } catch (err: any) {
      setVerifyFeedback({
        type: "error",
        message: err.message?.replace("Firebase: ", "") || "Failed to resend verification email.",
      });
    } finally {
      setResending(false);
    }
  };

  // Sign out from verification screen
  const handleSignOutFromVerification = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("ultimatum_session_active");
      localStorage.removeItem("ultimatum_cached_session");
    } catch {}
    setVerificationEmail("");
    setVerifyFeedback(null);
    setError("");
    setMode("login");
  };

  const getHeading = () => {
    switch (mode) {
      case "login": return "AUTHORIZE";
      case "signup": return "INITIATE";
      case "forgot_password": return "RECOVER";
      case "reset_password": return "RESET";
      case "verify_email": return "VERIFY YOUR IDENTITY";
    }
  };

  const getSubheading = () => {
    switch (mode) {
      case "login": return "Access your active campaign.";
      case "signup": return "Create your identity. The protocol awaits.";
      case "forgot_password": return "Request access recovery code.";
      case "reset_password": return "Establish new credentials.";
      case "verify_email": return "Activate your credentials to access the protocol.";
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

      {mode === "verify_email" ? (
        /* DEDICATED VERIFY YOUR IDENTITY SCREEN */
        <motion.div
          key="verify_email"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-zinc-950/95 backdrop-blur-3xl border border-zinc-800 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden"
        >
          {/* Subtle amber accent ambient glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

          {/* Icon + Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-zinc-900 border border-amber-500/30 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
              <Mail className="w-6 h-6 text-amber-400" />
            </div>

            <h1 className="text-2xl md:text-3xl font-light uppercase tracking-[0.2em] mb-2 text-white drop-shadow-md text-center">
              <DecryptedText text="VERIFY YOUR IDENTITY" animateOn="view" speed={50} maxIterations={10} encryptedClassName="text-white/30" />
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm font-light text-center leading-relaxed">
              A protocol activation link has been dispatched to:
            </p>
            <div className="mt-3 px-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-amber-300 font-mono text-xs tracking-wider break-all select-all">
              {verificationEmail || auth.currentUser?.email || "your registered email"}
            </div>
          </div>

          {/* Verification notice */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 mb-6 text-center">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Open the verification link to confirm your identity.
              <span className="block mt-1.5 text-zinc-300 font-normal">
                Be sure to check your <span className="text-white font-medium">Spam</span> and <span className="text-white font-medium">Promotions</span> folders if it doesn't appear promptly.
              </span>
            </p>
          </div>

          {/* Status feedback */}
          {verifyFeedback && (
            <div className={`mb-6 p-3.5 rounded-xl text-xs font-medium text-center ${
              verifyFeedback.type === "error"
                ? "bg-red-950/40 border border-red-800/60 text-red-400"
                : "bg-amber-950/30 border border-amber-700/50 text-amber-300"
            }`}>
              {verifyFeedback.message}
            </div>
          )}

          {/* Verification Action Buttons */}
          <div className="flex flex-col gap-3.5">
            <button
              type="button"
              onClick={handleCheckVerification}
              disabled={checkingVerification}
              className="w-full py-4 px-6 rounded-full bg-white text-black font-semibold text-xs md:text-sm tracking-[0.2em] uppercase hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50"
            >
              {checkingVerification ? "VERIFYING..." : "I'VE VERIFIED MY EMAIL"}
            </button>

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendCooldown > 0 || resending}
              className="w-full py-3.5 px-6 rounded-full bg-transparent border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/60 text-white font-medium text-xs tracking-[0.15em] uppercase transition-all duration-300 disabled:opacity-40 disabled:hover:border-zinc-700 disabled:hover:bg-transparent"
            >
              {resending
                ? "TRANSMITTING..."
                : resendCooldown > 0
                ? `RESEND EMAIL (${resendCooldown}s)`
                : "RESEND VERIFICATION EMAIL"}
            </button>

            <button
              type="button"
              onClick={handleSignOutFromVerification}
              className="mt-2 text-center text-[11px] font-bold tracking-[0.15em] text-zinc-500 hover:text-white uppercase transition-colors"
            >
              SIGN OUT / USE ANOTHER ACCOUNT
            </button>

            <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
              <Link
                href="/privacy"
                className="text-[11px] font-medium tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Privacy &amp; Terms
              </Link>
            </div>
          </div>
        </motion.div>
      ) : (
        /* STANDARD INITIATE / SIGN IN CARD */
        <motion.div
          key={mode} // Animate on mode change
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/20 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10"
        >
          <h1 className="text-3xl font-light uppercase tracking-[0.2em] mb-2 text-white drop-shadow-md text-center">
            <DecryptedText text={getHeading()} animateOn="view" speed={50} maxIterations={10} encryptedClassName="text-white/30" />
          </h1>
          <p className="text-white/70 mb-8 text-sm font-light text-center leading-relaxed">
            {getSubheading()}
          </p>

          {/* GOOGLE SIGN IN BUTTON + OR DIVIDER */}
          {(mode === "login" || mode === "signup") && (
            <div className="flex flex-col gap-5 mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-zinc-900/80 border border-zinc-700/80 hover:border-zinc-500 hover:bg-zinc-800/90 text-white font-medium text-xs md:text-sm tracking-[0.15em] uppercase transition-all duration-300 shadow-md disabled:opacity-50"
              >
                {/* Official Google 'G' SVG Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{googleLoading ? "AUTHENTICATING..." : "CONTINUE WITH GOOGLE"}</span>
              </button>

              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-zinc-800" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">OR</span>
                <div className="h-[1px] flex-1 bg-zinc-800" />
              </div>
            </div>
          )}

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
              disabled={loading || googleLoading}
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

          <div className="mt-8 pt-4 border-t border-white/10 text-center">
            <Link
              href="/privacy"
              className="text-[11px] font-medium tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Privacy &amp; Terms
            </Link>
          </div>
        </motion.div>
      )}

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
