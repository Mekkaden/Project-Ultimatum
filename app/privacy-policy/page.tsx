"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { montserrat } from "@/app/fonts";

/**
 * Public privacy policy.
 *
 * Written to match what the app actually does, because Play reviews the stated
 * data handling against the app's behaviour and its Data Safety form. Every
 * claim here corresponds to real code: Firebase (auth + Firestore), Google
 * Gemini and Groq for the AI features, Health Connect for imported vitals, the
 * microphone for voice food logging, and local-only storage for everything else.
 */

const SUPPORT_EMAIL = "support@ultimatum.website";
const LAST_UPDATED = "November 4, 2026";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  const collected = [
    {
      title: "ACCOUNT INFORMATION",
      content:
        "Your email address and password (stored by Firebase Authentication; passwords are hashed and never visible to us), plus any display name you add in your profile.",
    },
    {
      title: "FITNESS AND NUTRITION DATA",
      content:
        "Workouts, exercise history, sets, reps and weights, cardio and flexibility sessions, nutrition entries, calorie and macro targets, body weight, height, body fat and progress notes you record.",
    },
    {
      title: "HEALTH AND VITALS DATA (OPTIONAL)",
      content:
        "If you choose to connect Health Connect, we read step count, sleep sessions, weight, exercise sessions, heart rate and resting heart rate to fill in your vitals. This is read-only: we never write data back to Health Connect.",
    },
    {
      title: "VOICE INPUT (OPTIONAL)",
      content:
        "If you use voice food logging, your microphone is used to capture speech, which your device's speech recognition service converts to text. We store the resulting food entry, not the audio recording.",
    },
    {
      title: "PHOTOS YOU CHOOSE TO SEND",
      content:
        "Meal photos you select for nutrition scanning, and any progress photos you add. Photos are sent for analysis only when you start a scan, and progress photos stay on your device unless included in a backup you export.",
    },
    {
      title: "TECHNICAL AND DIAGNOSTIC DATA",
      content:
        "Basic technical information such as device type, app version and error reports needed to keep the app secure and working. We do not use advertising identifiers or third-party ad trackers.",
    },
  ];

  const usage = [
    {
      title: "CORE FUNCTIONALITY",
      content: "To track workouts, nutrition, sleep and vitals, and to show your progress over time.",
    },
    {
      title: "PERSONALISATION",
      content: "To generate plans, targets and insights based on the information you enter.",
    },
    {
      title: "AI-ASSISTED FEATURES",
      content:
        "Meal photos and food descriptions you submit are sent to Google (Gemini) or Groq to estimate nutrition. Sleep and training text is sent to Groq to generate coaching responses. Only the content you submit for that feature is sent.",
    },
    {
      title: "ACCOUNT AND SYNC",
      content: "To sign you in, keep your data available across installs, and restore it if you change phones.",
    },
    {
      title: "NOTIFICATIONS",
      content: "To send reminders you enable, such as workout timers and daily check-ins. You can turn these off at any time.",
    },
  ];

  const sharing = [
    {
      title: "GOOGLE FIREBASE",
      content:
        "Authentication, database and storage that keep your account and synced data working across devices.",
    },
    {
      title: "GOOGLE GEMINI AND GROQ",
      content:
        "AI providers that process the specific text or image you submit for food scanning, meal parsing and sleep coaching. We do not send your name, email or full history with these requests.",
    },
    {
      title: "HEALTH CONNECT",
      content:
        "The Google health service on your device. It only shares the data types you approve, and you can revoke access at any time in its settings.",
    },
  ];

  return (
    <div className={`min-h-screen bg-black text-white relative overflow-hidden pb-32 ${montserrat.className}`}>
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-white opacity-[0.03] blur-[150px] rounded-[100%] pointer-events-none"></div>

      {/* Top Nav */}
      <div className="relative z-10 w-full p-6 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 flex items-center justify-center bg-black/20 backdrop-blur-xl border border-white/10 rounded-full text-neutral-400 hover:text-white hover:bg-black/40 transition-colors shadow-lg"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 mt-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] leading-tight mb-6">
            <span className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">Privacy</span>
            <br />
            <span className="text-neutral-500">Policy</span>
          </h1>
          <p className="text-neutral-400 text-xs md:text-sm font-medium max-w-2xl mx-auto leading-relaxed">
            This policy explains what Project Ultimatum collects, why we collect it, who we share it with, and how
            you can get it deleted. It applies to the Android app and to {`www.ultimatum.website`}.
          </p>
          <p className="text-neutral-600 text-[10px] font-black uppercase tracking-[0.3em] mt-8">
            Last updated: {LAST_UPDATED}
          </p>
        </motion.div>

        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <div className="bg-[#050505] border border-neutral-900 rounded-3xl p-8 md:p-10 shadow-2xl">
            <h2 className="text-lg font-black uppercase tracking-[0.2em] text-white mb-4">Overview</h2>
            <p className="text-neutral-400 text-xs md:text-sm leading-relaxed font-medium mb-4">
              Project Ultimatum is operated with a privacy-first approach to fitness data. We collect only what the
              features you use require, and we do not sell your personal data or share it with advertisers.
            </p>
            <p className="text-neutral-400 text-xs md:text-sm leading-relaxed font-medium">
              Most of what you log is stored on your own device first. It is synced to your account only when you are
              signed in, so it can be restored on another device.
            </p>
          </div>
        </motion.div>

        {/* Information We Collect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-center mb-8">
            <span className="text-neutral-500">Information We</span> <span className="text-white">Collect</span>
          </h2>
          <div className="flex flex-col gap-4">
            {collected.map((section) => (
              <div
                key={section.title}
                className="bg-black border border-neutral-900 rounded-2xl p-6 hover:border-neutral-700 transition-colors"
              >
                <h3 className="text-xs font-black uppercase tracking-[0.1em] text-white mb-2">{section.title}</h3>
                <p className="text-neutral-400 text-xs leading-relaxed font-medium">{section.content}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* How We Use */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-center mb-8">
            <span className="text-neutral-500">How We Use</span> <span className="text-white">Information</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usage.map((section) => (
              <div
                key={section.title}
                className="bg-black border border-neutral-900 rounded-2xl p-6 hover:border-neutral-700 transition-colors"
              >
                <h3 className="text-xs font-black uppercase tracking-[0.1em] text-white mb-2">{section.title}</h3>
                <p className="text-neutral-400 text-xs leading-relaxed font-medium">{section.content}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sharing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mb-16"
        >
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-center mb-8">
            <span className="text-neutral-500">Who We</span> <span className="text-white">Share With</span>
          </h2>
          <div className="flex flex-col gap-4">
            {sharing.map((section) => (
              <div
                key={section.title}
                className="bg-black border border-neutral-900 rounded-2xl p-6 hover:border-neutral-700 transition-colors"
              >
                <h3 className="text-xs font-black uppercase tracking-[0.1em] text-white mb-2">{section.title}</h3>
                <p className="text-neutral-400 text-xs leading-relaxed font-medium">{section.content}</p>
              </div>
            ))}
          </div>
          <p className="text-neutral-500 text-xs leading-relaxed font-medium mt-6 px-2">
            We share data with these providers only to run the features described above. We never sell your data, and
            we do not share it with advertisers or data brokers.
          </p>
        </motion.div>

        {/* Security and Retention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mb-16"
        >
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-center mb-8">
            <span className="text-neutral-500">Security &amp;</span> <span className="text-white">Retention</span>
          </h2>
          <div className="bg-[#050505] border border-neutral-900 rounded-3xl p-8 shadow-2xl">
            <ul className="space-y-4 text-xs font-medium text-neutral-400 list-disc list-outside pl-4">
              <li>Data is encrypted in transit, and hosted on secure cloud infrastructure with access controls.</li>
              <li>Internal access to user data is limited to what is needed to operate and support the service.</li>
              <li>
                Your data is kept while your account exists. Deleting your account removes your account and synced
                data; data stored only on your device is removed when you sign out, delete the app, or clear its data.
              </li>
              <li>
                We may keep limited records where the law requires it, such as transaction or fraud-prevention records.
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Your choices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-center mb-8">
            <span className="text-neutral-500">Your</span> <span className="text-white">Choices</span>
          </h2>
          <div className="bg-black border border-neutral-900 rounded-2xl p-6">
            <ul className="space-y-4 text-xs font-medium text-neutral-400 list-disc list-outside pl-4">
              <li>
                <span className="text-white">Health Connect:</span> choose which data types to share, or disconnect at
                any time in Health Connect settings. The app works without it.
              </li>
              <li>
                <span className="text-white">Microphone:</span> voice logging is optional and only records while you
                start it. Revoke microphone access in Android settings.
              </li>
              <li>
                <span className="text-white">Notifications:</span> turn reminders off in the app or in Android
                settings.
              </li>
              <li>
                <span className="text-white">Export or delete:</span> you can export a copy of your data or delete your
                account from Settings → Advanced at any time.
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Children */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mb-16"
        >
          <div className="bg-[#050505] border border-neutral-900 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-lg font-black uppercase tracking-[0.2em] text-white mb-4">Children&apos;s Privacy</h2>
            <p className="text-neutral-400 text-xs md:text-sm leading-relaxed font-medium">
              Project Ultimatum is not intended for children under 13, and we do not knowingly collect personal
              information from them. If you believe a child has provided us with personal information, contact us and
              we will delete it.
            </p>
          </div>
        </motion.div>

        {/* Changes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.58 }}
          className="mb-16"
        >
          <div className="bg-[#050505] border border-neutral-900 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-lg font-black uppercase tracking-[0.2em] text-white mb-4">Changes to This Policy</h2>
            <p className="text-neutral-400 text-xs md:text-sm leading-relaxed font-medium">
              If we change how the app handles your data, we will update this page and revise the date above. Material
              changes will be communicated in the app before they take effect.
            </p>
          </div>
        </motion.div>

        {/* Account deletion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-center mb-8">
            <span className="text-neutral-500">Your</span> <span className="text-white">Account</span>
          </h2>
          <div className="bg-[#050505] border border-neutral-900 rounded-3xl p-8 shadow-2xl">
            <p className="text-xs md:text-sm font-medium text-neutral-400 leading-relaxed mb-6">
              You can delete your account and all associated data at any time. Deletion is permanent and removes your
              sign-in, synced settings, workout history, nutrition entries and photos.
            </p>
            <button
              onClick={() => router.push("/delete-account")}
              className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-neutral-200 transition-colors"
            >
              Delete my account
            </button>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-8 bg-[#050505] border border-neutral-900 rounded-3xl p-8 shadow-2xl"
        >
          <h2 className="text-lg font-black uppercase tracking-[0.2em] text-white mb-4">Contact</h2>
          <p className="text-neutral-400 text-xs md:text-sm leading-relaxed font-medium">
            Questions about this policy or your data? Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-white underline underline-offset-4">
              {SUPPORT_EMAIL}
            </a>
            . We aim to respond within 30 days.
          </p>
        </motion.div>

        <p className="text-center text-neutral-600 text-[10px] font-bold uppercase tracking-[0.25em] mt-12">
          Last updated: {LAST_UPDATED}
        </p>
      </div>
    </div>
  );
}
