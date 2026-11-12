"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Shield, AlertTriangle, Trash, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { montserrat } from "@/app/fonts";

const SUPPORT_EMAIL = "projectultimatum07@gmail.com";
const LAST_UPDATED = "November 8, 2026";

export default function PrivacyPage() {
  const router = useRouter();
  const [deletionEmail, setDeletionEmail] = useState("");
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionSent, setDeletionSent] = useState(false);

  const handleWebDeletionRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const address = deletionEmail.trim();
    if (!address) return;

    const subject = encodeURIComponent("Account Deletion Request - Project Ultimatum");
    const body = encodeURIComponent(
      [
        "Please permanently delete my Project Ultimatum account and all associated data.",
        "",
        `Account Email: ${address}`,
        deletionReason.trim() ? `Reason: ${deletionReason.trim()}` : "",
        "",
        "I request permanent deletion of:",
        "- Firebase Authentication account and UID",
        "- Google Cloud Firestore documents (workout logs, nutrition records, settings)",
        "- Associated Cloudflare R2 images and assets",
        "",
        "I understand that this action is irreversible.",
      ]
        .filter(Boolean)
        .join("\n")
    );

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setDeletionSent(true);
  };

  return (
    <div className={`min-h-screen bg-black text-white relative overflow-hidden pb-32 ${montserrat.className}`}>
      {/* Ensure bottom navigation bar is completely hidden on legal compliance page */}
      <style jsx global>{`
        .global-nav-container,
        nav.global-nav-container {
          display: none !important;
        }
      `}</style>

      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-white opacity-[0.02] blur-[150px] rounded-[100%] pointer-events-none" />

      {/* Top Nav */}
      <div className="relative z-10 w-full p-6 flex justify-between items-center max-w-4xl mx-auto">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          className="w-12 h-12 flex items-center justify-center bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shadow-lg"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 mt-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 mb-6 text-zinc-400 text-xs font-semibold tracking-wider uppercase">
            <Shield size={14} className="text-zinc-300" />
            <span>Google Play Compliance</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] leading-tight mb-4">
            <span className="text-white">Privacy Policy &amp;</span>
            <br />
            <span className="text-zinc-500">Legal Disclaimers</span>
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm font-medium max-w-2xl mx-auto leading-relaxed">
            Project Ultimatum respects your privacy. This page outlines our data collection practices, medical
            disclaimers, and procedures for permanently deleting your account and personal records.
          </p>
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] mt-6">
            Last Updated: {LAST_UPDATED}
          </p>
        </motion.div>

        {/* 1. PRIVACY POLICY SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-14 bg-zinc-950 border border-zinc-900 rounded-3xl p-8 md:p-10 shadow-2xl"
        >
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Shield size={18} className="text-zinc-300" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.15em] text-white">
                1. Privacy Policy &amp; Data Practices
              </h2>
              <p className="text-zinc-500 text-xs font-medium">How your information is collected, stored, and protected</p>
            </div>
          </div>

          <div className="space-y-6 text-xs md:text-sm text-zinc-300 font-normal leading-relaxed">
            <p>
              Project Ultimatum is engineered with a privacy-first architecture. We collect only the data necessary
              to provide personal fitness, workout tracking, nutrition planning, and vitals monitoring.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-black border border-zinc-900">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Account Information</h3>
                <ul className="text-zinc-400 text-xs space-y-1.5 list-disc list-inside">
                  <li>Email address</li>
                  <li>Account display name</li>
                  <li>Firebase Authentication UID</li>
                </ul>
                <p className="text-[11px] text-zinc-500 mt-3">Managed via Firebase Authentication with industry-standard credentials.</p>
              </div>

              <div className="p-5 rounded-2xl bg-black border border-zinc-900">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Health &amp; Fitness Data</h3>
                <ul className="text-zinc-400 text-xs space-y-1.5 list-disc list-inside">
                  <li>Workout sets, reps, and weights</li>
                  <li>Reps in Reserve (RIR) logs</li>
                  <li>Body weight &amp; body metrics</li>
                  <li>Nutrition &amp; macro logs</li>
                </ul>
                <p className="text-[11px] text-zinc-500 mt-3">Stored securely in Google Cloud Firestore.</p>
              </div>

              <div className="p-5 rounded-2xl bg-black border border-zinc-900">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2">User Content</h3>
                <ul className="text-zinc-400 text-xs space-y-1.5 list-disc list-inside">
                  <li>Optional profile pictures</li>
                  <li>Optional meal photos for scanning</li>
                </ul>
                <p className="text-[11px] text-zinc-500 mt-3">Stored in Cloudflare R2 object storage.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2 mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Security &amp; Non-Sale Guarantee</h4>
              <ul className="text-zinc-400 text-xs space-y-2 list-disc list-inside">
                <li><strong className="text-zinc-200">Encryption in Transit:</strong> All data transmissions between the application and our servers are encrypted using modern HTTPS and TLS protocols.</li>
                <li><strong className="text-zinc-200">Zero Commercial Sale of Data:</strong> User data is strictly used to deliver and maintain application functionality. We never sell, monetize, rent, or lease personal information to third-party advertisers, data brokers, or marketing networks.</li>
                <li><strong className="text-zinc-200">Third-Party Service Providers:</strong> We integrate with verified cloud infrastructure providers (Google Firebase and Cloudflare) exclusively for secure database storage, authentication, and asset hosting.</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* 2. MEDICAL & FITNESS DISCLAIMER SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-14 bg-zinc-950 border border-zinc-900 rounded-3xl p-8 md:p-10 shadow-2xl"
        >
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-amber-400/90" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.15em] text-white">
                2. Medical &amp; Fitness Disclaimer
              </h2>
              <p className="text-zinc-500 text-xs font-medium">Important health and safety notification</p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-900/30 bg-amber-950/20 p-6">
            <p className="text-xs md:text-sm text-zinc-200 leading-relaxed font-medium">
              &ldquo;Ultimatum is designed for informational, educational, and fitness/nutrition tracking purposes only.
              It is not a medical device and does not provide medical advice, diagnosis, or treatment. Always consult a
              qualified healthcare professional or physician before starting any new strength training, hypertrophy,
              nutrition, or supplementation regimen.&rdquo;
            </p>
          </div>
        </motion.section>

        {/* 3. ACCOUNT & DATA DELETION POLICY SECTION (with anchor id="delete-account") */}
        <motion.section
          id="delete-account"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-14 bg-zinc-950 border border-zinc-900 rounded-3xl p-8 md:p-10 shadow-2xl scroll-mt-20"
        >
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Trash size={18} className="text-zinc-300" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.15em] text-white">
                3. Account &amp; Data Deletion Policy
              </h2>
              <p className="text-zinc-500 text-xs font-medium">Full self-service and web-based deletion options</p>
            </div>
          </div>

          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mb-6">
            In compliance with Google Play Store data safety requirements, Project Ultimatum provides two straightforward
            methods to permanently delete your account, authentication records, workout history, nutrition logs, and
            associated cloud storage assets.
          </p>

          {/* Option A: In-App */}
          <div className="p-6 rounded-2xl bg-black border border-zinc-900 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-white">
                Option A
              </span>
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-white">
                In-App Instant Deletion
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Users can delete their account directly within the application at any time:
            </p>
            <ol className="text-xs text-zinc-300 space-y-2 list-decimal list-inside pl-1 font-medium">
              <li>Open the app and navigate to <span className="text-white font-bold">Profile / Settings</span> (or Settings &rarr; System Config).</li>
              <li>Scroll to the bottom of the screen and tap <span className="text-red-400 font-bold">DELETE ACCOUNT</span>.</li>
              <li>Confirm the action in the prompt.</li>
            </ol>
            <p className="text-[11px] text-zinc-500 mt-3">
              This immediately erases your Firestore profile, all synchronized workout and nutrition records, and your Firebase Authentication identity.
            </p>
          </div>

          {/* Option B: Web Request */}
          <div className="p-6 rounded-2xl bg-black border border-zinc-900">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-white">
                Option B
              </span>
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-white">
                Web Account Deletion Request (Without Installing the App)
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              If you have uninstalled the app or cannot access your mobile device, you can submit an account deletion
              request directly through this web page.
            </p>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 space-y-1.5 mb-6">
              <p className="font-semibold text-white">A verified web deletion request permanently removes:</p>
              <ul className="list-disc list-inside text-zinc-400 space-y-1">
                <li>Your Firebase Authentication account and UID.</li>
                <li>All associated Firestore documents, workout history, custom splits, and nutrition data.</li>
                <li>Associated Cloudflare R2 assets and uploaded profile pictures.</li>
              </ul>
              <p className="text-amber-400/90 font-medium pt-2">
                Turnaround: Verified deletion requests are completed within 7 days.
              </p>
            </div>

            {deletionSent ? (
              <div className="p-5 rounded-xl border border-zinc-700 bg-zinc-900/80">
                <p className="text-xs text-zinc-200 leading-relaxed">
                  Your email client has been prepared with your deletion request. Please send the message to{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-white underline underline-offset-4">
                    {SUPPORT_EMAIL}
                  </a>
                  . Our team will verify account ownership and process the complete removal within 7 days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWebDeletionRequest} className="space-y-4">
                <div>
                  <label htmlFor="del-email" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Registered Account Email *
                  </label>
                  <input
                    id="del-email"
                    type="email"
                    required
                    value={deletionEmail}
                    onChange={(e) => setDeletionEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs md:text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="del-reason" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Reason for Deletion (Optional)
                  </label>
                  <input
                    id="del-reason"
                    type="text"
                    value={deletionReason}
                    onChange={(e) => setDeletionReason(e.target.value)}
                    placeholder="No longer using the app"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs md:text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-widest text-[11px] transition-colors shadow-md"
                >
                  Submit Account Deletion Request
                </button>
              </form>
            )}
          </div>
        </motion.section>

        {/* 4. CONTACT SUPPORT SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 md:p-10 shadow-2xl text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={18} className="text-zinc-300" />
          </div>
          <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.15em] text-white mb-2">
            4. Contact Support
          </h2>
          <p className="text-zinc-400 text-xs md:text-sm font-medium max-w-md mx-auto mb-4">
            For inquiries regarding privacy, data protection, or account deletion, contact our support desk:
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-block px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs md:text-sm hover:border-zinc-600 transition-colors"
          >
            {SUPPORT_EMAIL}
          </a>
        </motion.section>

        <p className="text-center text-zinc-600 text-[10px] font-bold uppercase tracking-[0.25em] mt-12">
          Project Ultimatum &copy; 2026. All rights reserved.
        </p>
      </div>
    </div>
  );
}

