"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DecryptedText from "@/components/DecryptedText";

type AuthMode = "login" | "signup" | "forgot_password" | "reset_password";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "login" || mode === "signup") {
      const res = await signIn("credentials", {
        email,
        password,
        action: mode,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        if (mode === "login") {
          router.push("/campaign");
        } else {
          router.push("/doctrine");
        }
      }
    } else if (mode === "forgot_password") {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to send code");
        setMode("reset_password");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else if (mode === "reset_password") {
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: otpCode, newPassword: password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to reset password");
        setMode("login");
        setPassword("");
        alert("Password updated successfully!");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
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

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-black text-white p-4 font-sans">
      <motion.div
        key={mode} // Animate on mode change
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-neutral-950 border border-neutral-800 p-8 rounded-2xl relative z-10"
      >
        <h1 className="text-3xl font-black uppercase tracking-[0.2em] mb-2">
          <DecryptedText text={getHeading()} animateOn="view" speed={50} maxIterations={10} />
        </h1>
        <p className="text-neutral-400 mb-8 text-sm">
          {getSubheading()}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg focus:outline-none focus:border-white transition-colors"
              required
            />
          </div>

          {mode === "reset_password" && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Recovery Code</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg focus:outline-none focus:border-white transition-colors"
                required
              />
            </div>
          )}

          {mode !== "forgot_password" && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                {mode === "reset_password" ? "New Password" : "Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg focus:outline-none focus:border-white transition-colors"
                required
              />
            </div>
          )}

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-white text-black font-bold uppercase tracking-widest py-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {loading ? "PROCESSING..." : mode === "login" ? "ENTER" : mode === "signup" ? "JOIN" : mode === "forgot_password" ? "SEND CODE" : "UPDATE"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center text-sm text-neutral-500">
          {mode === "login" || mode === "signup" ? (
            <>
              <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="hover:text-white transition-colors underline decoration-neutral-700 underline-offset-4">
                {mode === "login" ? "New user? SIGN UP" : "Already have an account? SIGN IN"}
              </button>
              {mode === "login" && (
                <button type="button" onClick={() => setMode("forgot_password")} className="hover:text-white transition-colors">
                  Forgot Password?
                </button>
              )}
            </>
          ) : (
            <button onClick={() => setMode("login")} className="hover:text-white transition-colors underline decoration-neutral-700 underline-offset-4">
              Return to SIGN IN
            </button>
          )}
        </div>
      </motion.div>
    </main>
  );
}
