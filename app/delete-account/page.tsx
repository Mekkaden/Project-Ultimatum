"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Mail, Smartphone, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { montserrat } from "@/app/fonts";

/**
 * Public account-deletion page.
 *
 * Google Play requires that anyone who created an account can request its
 * deletion from a web page, without installing or opening the app. This page
 * satisfies that: it is linked from the Play listing's "Delete account URL"
 * field and needs no login to read.
 *
 * The request is delivered by email rather than an unauthenticated endpoint: a
 * public form that deletes accounts by typing an address would let anyone
 * destroy someone else's account. Requests are verified against the account
 * owner before anything is removed.
 */
const SUPPORT_EMAIL = "support@ultimatum.website";

const DELETED_ITEMS = [
  "Your account and sign-in details (email address and password)",
  "Synced settings, custom splits and workout history saved to your account",
  "Nutrition targets, body metrics and vitals logged to your account",
  "Progress photos stored with your account",
];

const KEPT_ITEMS = [
  "Data on a device where you used the app offline is removed when you sign out or delete the app",
  "Records we must keep for legal, tax or fraud-prevention obligations",
];

export default function DeleteAccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);

  const handleRequest = (event: React.FormEvent) => {
    event.preventDefault();
    const address = email.trim();
    if (!address) return;
    // A mailto keeps the request verifiable: it comes from the address on the
    // account and reaches the operator directly. No unauthenticated server
    // endpoint can safely accept "delete this account" from a stranger.
    const subject = encodeURIComponent("Account deletion request");
    const body = encodeURIComponent(
      [
        "Please delete my Project Ultimatum account and all associated data.",
        "",
        `Account email: ${address}`,
        reason.trim() ? `Reason: ${reason.trim()}` : "",
        "",
        "I understand this cannot be undone.",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className={`min-h-screen bg-black text-white relative overflow-hidden pb-32 ${montserrat.className}`}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-white opacity-[0.03] blur-[150px] rounded-[100%] pointer-events-none"></div>

      <div className="relative z-10 w-full p-6 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 flex items-center justify-center bg-black/20 backdrop-blur-xl border border-white/10 rounded-full text-neutral-400 hover:text-white hover:bg-black/40 transition-colors shadow-lg"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 relative z-10 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] leading-tight mb-6">
            <span className="text-white">Delete</span> <span className="text-neutral-500">Account</span>
          </h1>
          <p className="text-neutral-400 text-xs md:text-sm font-medium max-w-xl mx-auto leading-relaxed">
            Project Ultimatum lets you delete your account and its data directly from inside the app,
            or request deletion here if you no longer have the app installed.
          </p>
        </motion.div>

        {/* In-app path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-[#050505] border border-neutral-900 rounded-3xl p-8 mb-6 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Smartphone size={18} className="text-neutral-400" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Delete from the app</h2>
          </div>
          <ol className="space-y-3 text-xs md:text-sm text-neutral-400 font-medium leading-relaxed list-decimal list-outside pl-5">
            <li>Open the app and go to <span className="text-white">Settings → Advanced</span>.</li>
            <li>Scroll to <span className="text-white">Policies &amp; Account</span> and tap <span className="text-white">Delete Account</span>.</li>
            <li>Type <span className="text-white">DELETE</span> to confirm. Your account and data are removed immediately.</li>
          </ol>
        </motion.div>

        {/* Web request path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#050505] border border-neutral-900 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Mail size={18} className="text-neutral-400" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Request deletion without the app</h2>
          </div>
          <p className="text-xs md:text-sm text-neutral-400 font-medium leading-relaxed mb-6">
            Send the request from the email address on your account. We verify ownership before deleting
            anything, and complete requests within 30 days — usually much sooner.
          </p>

          {sent ? (
            <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5">
              <p className="text-xs text-neutral-300 leading-relaxed">
                Your email app should now be open with the request ready to send. If nothing opened, email{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Account%20deletion%20request`}
                  className="text-white underline underline-offset-4"
                >
                  {SUPPORT_EMAIL}
                </a>{" "}
                from your account address with the subject “Account deletion request”.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRequest} className="flex flex-col gap-4">
              <div>
                <label htmlFor="account-email" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Account email
                </label>
                <input
                  id="account-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm outline-none focus:border-white/40 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="request-reason" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Reason (optional)
                </label>
                <input
                  id="request-reason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="No longer using the app"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white text-sm outline-none focus:border-white/40 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-neutral-200 transition-colors"
              >
                Send deletion request
              </button>
            </form>
          )}
        </motion.div>

        {/* What is removed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 bg-[#050505] border border-neutral-900 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={18} className="text-neutral-400" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">What is deleted</h2>
          </div>
          <ul className="space-y-2.5 text-xs md:text-sm text-neutral-400 font-medium leading-relaxed list-disc list-outside pl-5 mb-6">
            {DELETED_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-3">What may be kept</h3>
          <ul className="space-y-2.5 text-xs text-neutral-500 font-medium leading-relaxed list-disc list-outside pl-5">
            {KEPT_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </motion.div>

        <p className="text-center text-neutral-600 text-[10px] font-bold uppercase tracking-[0.25em] mt-12">
          Questions? {SUPPORT_EMAIL}
        </p>
      </div>
    </div>
  );
}
