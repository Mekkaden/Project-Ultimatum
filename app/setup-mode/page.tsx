"use client";

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Montserrat } from "next/font/google";
import { Cpu, Settings2 } from "lucide-react";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["200", "400", "600", "800"] });

function SetupModeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFastTrack = searchParams.get("fastTrack") === "true";

  const handleModeSelect = (mode: "auto" | "manual") => {
    if (mode === "auto") {
      router.push(isFastTrack ? "/auto-setup?fastTrack=true" : "/auto-setup");
    } else {
      router.push(isFastTrack ? "/frequency?fastTrack=true" : "/frequency");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className={`min-h-screen w-full flex flex-col items-center justify-start md:justify-center py-16 md:py-12 px-4 md:px-6 relative overflow-y-auto ${montserrat.className}`}
    >
      <img src="/NEWCOVERS/new%20cover.png" className="absolute inset-0 w-full h-full object-cover pointer-events-none -z-20" alt="Background" />
      {/* Darker overlay to ensure white text is clearly visible against the image */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none fixed"></div>

      <div className="max-w-4xl w-full flex flex-col items-center relative z-10">
        
        {/* Header Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-center w-full mb-8 md:mb-12 mt-4"
        >
          <div className="text-xl md:text-3xl font-bold text-white uppercase tracking-[0.3em] mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            System Initialization
          </div>
          <p className="text-white/90 font-medium tracking-wide text-xs md:text-base drop-shadow-md">
            Select your preferred onboarding protocol.
          </p>
        </motion.div>

        {/* Options Grid inside a Glass Container */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/20 rounded-[2rem] md:rounded-[3rem] p-4 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-3xl flex flex-col md:flex-row gap-4 md:gap-6 mb-24 md:mb-0">
          
          {/* Automatic Option */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModeSelect("auto")}
            className="group cursor-pointer flex-1 rounded-[1.5rem] border border-white/10 border-t-white/40 border-l-white/20 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl shadow-[inset_0_1px_20px_rgba(255,255,255,0.05),_0_20px_40px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_1px_30px_rgba(255,255,255,0.1),_0_20px_50px_rgba(0,0,0,0.6)] hover:bg-gradient-to-br hover:from-white/15 hover:to-white/5 transition-all duration-500 flex flex-col p-6 text-center items-center justify-between min-h-[220px]"
          >
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="text-white group-hover:scale-110 transition-all duration-500 drop-shadow-lg">
                <Cpu strokeWidth={1.5} size={40} />
              </div>
              <h3 className="text-base md:text-xl font-bold uppercase tracking-[0.2em] text-white drop-shadow-md">
                Automatic
              </h3>
            </div>
            
            <p className="text-white/90 text-xs leading-relaxed font-medium mb-4 drop-shadow-md">
              Algorithm computes <span className="text-white font-black tracking-wide">precise nutrition</span> and assigns <span className="text-white font-black tracking-wide">optimal training protocol</span> based on your metrics.
            </p>
            
            <div className="w-full pt-3 border-t border-white/20">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">
                Recommended
              </span>
            </div>
          </motion.div>

          {/* Manual Option */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleModeSelect("manual")}
            className="group cursor-pointer flex-1 rounded-[1.5rem] border border-white/10 border-t-white/40 border-l-white/20 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl shadow-[inset_0_1px_20px_rgba(255,255,255,0.05),_0_20px_40px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_1px_30px_rgba(255,255,255,0.1),_0_20px_50px_rgba(0,0,0,0.6)] hover:bg-gradient-to-br hover:from-white/15 hover:to-white/5 transition-all duration-500 flex flex-col p-6 text-center items-center justify-between min-h-[220px]"
          >
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="text-white group-hover:scale-110 transition-all duration-500 drop-shadow-lg">
                <Settings2 strokeWidth={1.5} size={40} />
              </div>
              <h3 className="text-base md:text-xl font-bold uppercase tracking-[0.2em] text-white drop-shadow-md">
                Manual
              </h3>
            </div>
            
            <p className="text-white/90 text-xs leading-relaxed font-medium mb-4 drop-shadow-md">
              Take complete control. <span className="text-white font-black tracking-wide">Create custom workout split & nutrition</span>, select frequency, and dictate own protocols.
            </p>
            
            <div className="w-full pt-3 border-t border-white/20">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">
                Advanced
              </span>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}

export default function SetupModePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SetupModeContent />
    </Suspense>
  );
}
