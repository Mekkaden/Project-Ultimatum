"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { montserrat } from "@/app/fonts";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const APK_DOWNLOAD_URL = "https://www.dropbox.com/scl/fi/uxk3nd9ow61tuj6dsith8/app-debug.apk?rlkey=xlfyxqt1yfm2q5ajmonm96gqn&st=ww679rsj&dl=1";

export default function DownloadsPage() {
  useEffect(() => {
    document.body.classList.add('hide-global-nav');
    return () => document.body.classList.remove('hide-global-nav');
  }, []);

  return (
    <div className={`min-h-screen bg-black text-white relative overflow-hidden ${montserrat.className}`}>
      
      {/* ── Background Cover Image ── */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/beyer.png" 
          alt="" 
          className="w-full h-full object-cover object-center grayscale opacity-100"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20 pb-48 max-w-lg mx-auto w-full">
        
        {/* Status */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full mb-12 flex justify-start"
        >
          <div className="border border-white/20 px-3 py-1 text-[10px] tracking-[0.3em] font-bold text-neutral-400 uppercase rounded-full">
            Status: Beta
          </div>
        </motion.div>

        {/* Header */}
        <div className="w-full mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase mb-2 text-white">
            ULTIMATUM
          </h1>
          <p className="text-neutral-400 text-sm tracking-wide">
            Exclusive Early Access
          </p>
        </div>

        <div className="w-full space-y-6">
          
          {/* Android Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-white/10 hover:border-white/20 shadow-2xl transition-all duration-500 bg-black/40 backdrop-blur-2xl p-6 w-full rounded-3xl"
          >
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-widest uppercase text-white">Android</h2>
                <p className="text-neutral-500 text-xs tracking-widest uppercase mt-1">Direct APK</p>
              </div>
              <span className="text-neutral-600 text-xs font-mono">v1.0.0-BETA</span>
            </div>

            <p className="text-neutral-400 text-xs leading-relaxed mb-6">
              Download the APK and install manually. Allow installation from unknown sources when prompted.
            </p>

            <a
              href={APK_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="block w-full border border-white/20 bg-white text-black hover:bg-black hover:text-white hover:border-white/50 shadow-sm hover:shadow-md transition-all duration-500 text-center py-3 rounded-full text-xs font-bold tracking-[0.2em] uppercase"
            >
              [ Download ]
            </a>
          </motion.div>

          {/* iOS Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-white/10 hover:border-white/20 shadow-2xl transition-all duration-500 bg-black/40 backdrop-blur-2xl p-6 w-full rounded-3xl"
          >
            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-widest uppercase text-white">iPhone / iOS</h2>
              <p className="text-neutral-500 text-xs tracking-widest uppercase mt-1">PWA Install</p>
            </div>

            <p className="text-neutral-400 text-xs leading-relaxed mb-6">
              You can use your preferred browser (e.g., Chrome or Safari) to install as a PWA.
            </p>

            <div className="space-y-4 border-l border-neutral-800 pl-4">
              <div className="flex flex-col">
                <span className="text-white text-xs font-bold tracking-widest uppercase mb-1">01. Go to website</span>
                <span className="text-neutral-500 text-[10px] tracking-wider">
                  <span className="uppercase">Open your browser and navigate to </span>
                  <a href="https://www.ultimatum.website" target="_blank" rel="noopener noreferrer" className="text-neutral-400 underline hover:text-white transition-colors">
                    https://www.ultimatum.website
                  </a>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-xs font-bold tracking-widest uppercase mb-1">02. Share</span>
                <span className="text-neutral-500 text-[10px] tracking-wider uppercase">Tap the Share icon</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-xs font-bold tracking-widest uppercase mb-1">03. Install</span>
                <span className="text-neutral-500 text-[10px] tracking-wider uppercase">Select "Add to Home Screen"</span>
              </div>
            </div>
          </motion.div>
          
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-32 text-center max-w-sm mx-auto space-y-6"
        >
          <p className="text-white text-xs tracking-[0.2em] uppercase font-bold drop-shadow-md">
            Enjoy the early access.
          </p>
          <p className="text-neutral-300 text-[11px] leading-loose">
            Welcome to the Beta Division. Your feedback shapes the protocol. As a founding tester, you will unlock exclusive lifetime perks and complimentary PRO access upon global release.
          </p>

          <div className="pt-8 mt-8 border-t border-white/10 space-y-3">
            <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">
              Feedback & Bugs
            </p>
            <p className="text-neutral-400 text-[11px] leading-loose">
              Got an idea or found a bug? 
              <br />
              Email <a href="mailto:richardbluedio@gmail.com?subject=[ULTIMATUM BETA] Feedback" className="text-white hover:underline transition-colors">richardbluedio@gmail.com</a> or text <a href="tel:+918136965260" className="text-white hover:underline transition-colors">+91 8136965260</a>.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10 space-y-3">
            <p className="text-red-500/80 text-[10px] uppercase tracking-widest font-bold">
              Beta Warning
            </p>
            <p className="text-neutral-400 text-[11px] leading-loose">
              This protocol is in active testing. You may encounter bugs. Please export your data regularly (workout logs, nutrition tracking, etc.) to prevent accidental data loss.
            </p>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
