"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Activity, Zap, AlertTriangle } from "lucide-react";
import { Montserrat } from "next/font/google";
import { useRouter, useSearchParams } from "next/navigation";
import { useOfflineSession } from "@/lib/useOfflineSession";
import DecryptedText from "./DecryptedText";
import { getAllowedFrequencyIds } from "@/lib/utils";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["200", "400", "600", "800"] });

type Frequency = "3-days" | "4-days" | "5-days" | "6-days" | "custom" | null;
type Directive = "hypertrophy" | "strength" | "calisthenics" | "hybrid" | null;

const FREQUENCIES = [
  {
    id: "3-days",
    title: "3 DAYS: THE MINIMUM DOSE",
    subtitle: "Maximum intensity, maximum recovery. Usually structured as Full Body. Perfect if you have a demanding life but refuse to compromise on effort.",
    metric: "Recovery Focus: High",
    icon: Calendar,
    accentColor: "white",
    borderColor: "border-white/20",
    shadowColor: "hover:shadow-md",
    activeBg: "bg-white/20",
    activeBorder: "border-white/60 shadow-md",
    textClass: "text-white",
    bgClass: "bg-white/20",
    borderClass: "border-white/30"
  },
  {
    id: "4-days",
    title: "4 DAYS: THE SWEET SPOT",
    subtitle: "The golden standard for natural lifters. Usually an Upper/Lower split. Optimal balance of mechanical tension and CNS recovery.",
    metric: "Recovery Focus: Balanced",
    icon: Zap,
    accentColor: "white",
    borderColor: "border-white/20",
    shadowColor: "hover:shadow-md",
    activeBg: "bg-white/20",
    activeBorder: "border-white/60 shadow-md",
    textClass: "text-white",
    bgClass: "bg-white/20",
    borderClass: "border-white/30"
  },
  {
    id: "5-days",
    title: "5 DAYS: THE REDLINE",
    subtitle: "Advanced programming. You are walking the edge of overtraining. Only choose this if your sleep, nutrition, and stress management are flawless.",
    metric: "Recovery Focus: Minimal",
    icon: Activity,
    accentColor: "white",
    borderColor: "border-white/20",
    shadowColor: "hover:shadow-md",
    activeBg: "bg-white/20",
    activeBorder: "border-white/60 shadow-md",
    textClass: "text-white",
    bgClass: "bg-white/20",
    borderClass: "border-white/30"
  },
  {
    id: "6-days",
    title: "6 DAYS: ELITE RECOVERY",
    subtitle: "Extreme volume and frequency. Requires flawless sleep, nutrition, and advanced recovery protocols.",
    metric: "Recovery Focus: Critical",
    icon: Activity,
    accentColor: "white",
    borderColor: "border-white/20",
    shadowColor: "hover:shadow-md",
    activeBg: "bg-white/20",
    activeBorder: "border-white/60 shadow-md",
    textClass: "text-white",
    bgClass: "bg-white/20",
    borderClass: "border-white/30"
  },
  {
    id: "custom",
    title: "CUSTOM: OFF GRID",
    subtitle: "[WARNING] Not recommended for beginners. You must dictate the rules, programming, and fatigue management yourself.",
    metric: "Recovery Focus: Unknown",
    icon: AlertTriangle,
    accentColor: "white",
    borderColor: "border-white/20",
    shadowColor: "hover:shadow-md",
    activeBg: "bg-white/20",
    activeBorder: "border-white/60 shadow-md",
    textClass: "text-white",
    bgClass: "bg-white/20",
    borderClass: "border-white/30"
  }
];

export default function FrequencySelection() {
  const [selected, setSelected] = useState<Frequency>(null);
  const [directive, setDirective] = useState<Directive>(null);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [showOverrideWarning, setShowOverrideWarning] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFastTrack = searchParams.get("fastTrack") === "true";
  const { data: session } = useOfflineSession();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const storedDirective = localStorage.getItem("ultimatum_directive") as Directive;
    setDirective(storedDirective);
  }, []);

  const proceedInitialize = () => {
    if (!selected) return;

    if (session) {
      localStorage.setItem("ultimatum_frequency", selected.toString());
      localStorage.setItem("ultimatum_gender", gender);
      if (directive) localStorage.setItem("ultimatum_directive", directive);
      
      // Clear any manual edits to the previous routine
      localStorage.removeItem("ultimatum_campaign_override");
      localStorage.removeItem("ultimatum_custom_campaign_cache");
      
      router.push("/manual-nutrition");
    } else {
      // Unauthenticated users save to pending session state, then go to auth
      sessionStorage.setItem("pending_frequency", selected.toString());
      sessionStorage.setItem("pending_gender", gender);
      if (directive) sessionStorage.setItem("pending_directive", directive);
      router.push("/manual-nutrition");
    }
  };

  const handleInitialize = () => {
    if (!selected) return;
    
    const existingFreq = localStorage.getItem("ultimatum_frequency");
    
    // ONLY show the override warning if they are logged in. 
    // Unauthenticated users will be warned AFTER they login if their account has an existing routine.
    if (existingFreq && session) {
      setShowOverrideWarning(true);
    } else {
      proceedInitialize();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{ willChange: "opacity" }}
      className={`min-h-screen w-full flex flex-col items-center py-24 px-6 relative overflow-hidden ${montserrat.className}`}
    >
      <img src="/onboarding/photo-1694023536590-60d02108b323.avif" className="absolute inset-0 w-full h-full object-cover pointer-events-none -z-20" alt="Background" />
      <div className="absolute inset-0 bg-black/40 pointer-events-none fixed"></div>
      <div className="max-w-5xl w-full flex flex-col items-center relative z-10">
        
        {/* Header Section */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          className="text-center w-full mb-12"
        >
          <div className="text-2xl md:text-4xl lg:text-5xl font-light text-white uppercase tracking-[0.3em] mb-10 drop-shadow-md">
            <DecryptedText
              text="DEFINE YOUR COMMITMENT"
              speed={60}
              maxIterations={15}
              characters="01!@#$%^&*?"
              animateOn="view"
            />
          </div>
        </motion.div>

        {/* Gender Toggle for Hypertrophy */}
        {directive === "hypertrophy" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 flex justify-center w-full"
          >
            <div className="bg-white/5 backdrop-blur-md p-1.5 rounded-[1.5rem] flex border border-white/10 shadow-lg">
              <button
                onClick={() => setGender("male")}
                className={`px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 ${
                  gender === "male" 
                    ? "bg-white/20 text-white shadow-sm" 
                    : "text-white/50 hover:text-white/90 hover:bg-white/5"
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setGender("female")}
                className={`px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 ${
                  gender === "female" 
                    ? "bg-white/20 text-white shadow-sm" 
                    : "text-white/50 hover:text-white/90 hover:bg-white/5"
                }`}
              >
                Female
              </button>
            </div>
          </motion.div>
        )}

        {/* The Protocol Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
          {FREQUENCIES.filter(freq => {
            const allowedIds = getAllowedFrequencyIds(directive);
            return allowedIds.includes(freq.id);
          }).map((freq, index) => {
            const Icon = freq.icon;
            const isActive = selected === freq.id;
            
            return (
              <motion.div
                key={freq.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 + index * 0.04, duration: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(freq.id as Frequency)}
                className={`relative cursor-pointer w-full rounded-[2rem] border transition-all duration-300 flex flex-col p-6 md:p-8 backdrop-blur-xl
                  ${isActive 
                    ? `${freq.activeBg} ${freq.activeBorder}` 
                    : `bg-white/5 border-white/10 opacity-70 hover:opacity-100 hover:bg-white/10 ${freq.shadowColor} hover:${freq.borderColor}`
                  }
                `}
              >
                <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-6">
                  <Icon 
                    size={24} 
                    className={`md:w-7 md:h-7 ${isActive ? freq.textClass : "text-white/80"}`} 
                    strokeWidth={isActive ? 1.5 : 1} 
                  />
                  <h3 className={`text-lg md:text-xl font-semibold uppercase tracking-[0.2em] ${isActive ? "text-white" : "text-white/90"}`}>
                    {freq.title.split(":")[0]}
                  </h3>
                </div>

                <div className={`text-[10px] md:text-xs font-semibold tracking-widest uppercase mb-3 md:mb-4 ${isActive ? freq.textClass : "text-white/50"}`}>
                  {freq.title.split(":")[1].trim()}
                </div>
                
                <p className="text-white/90 text-sm md:text-base leading-relaxed font-medium mb-6 md:mb-8 flex-grow">
                  {freq.subtitle}
                </p>

                <div className={`text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.2em] py-1.5 px-3 md:py-2 rounded-[1rem] inline-block w-fit mt-auto border
                  ${isActive ? `${freq.bgClass} ${freq.textClass} ${freq.borderClass}` : "bg-white/5 text-white/50 border-white/10"}
                `}>
                  {freq.metric}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* The Reality Check (Interactive Card) */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="group relative bg-white/10 backdrop-blur-3xl border border-white/20 p-6 md:p-10 text-left rounded-[3rem] max-w-4xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden w-full mb-12"
          style={{ willChange: "transform, opacity" }}
        >
          {/* Glowing white accent that follows hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/20 flex-shrink-0">
              <AlertTriangle size={32} className="text-white drop-shadow-md" strokeWidth={1.5} />
            </div>
            
            <div>
              <h3 className="text-white font-semibold uppercase tracking-[0.2em] text-sm md:text-base mb-3 drop-shadow-md">
                The Myth of Volume
              </h3>
              <p className="text-white/70 text-sm md:text-base leading-relaxed font-light">
                More days do not equal more gains. If you are truly training at <span className="text-white font-semibold">0-2 RIR (Absolute Mechanical Failure)</span>, your Central Nervous System will burn out before your muscles do. Pick the frequency you can realistically sustain for 6 months, not 6 days. <span className="text-white font-semibold">By no means change from this split for at least 3 months to assess progress, so choose wisely.</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Finalizer Button */}
      </div>

      <AnimatePresence>
        {selected && !showOverrideWarning && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
          >
            <button
              onClick={handleInitialize}
              className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs md:text-sm rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center gap-3 whitespace-nowrap"
            >
              <span>Initialize Sanctuary</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="w-full max-w-lg bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-8 md:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 mb-6">
                  <AlertTriangle size={32} className="text-white drop-shadow-md" strokeWidth={1.5} />
                </div>
                
                <h3 className="text-lg md:text-xl font-semibold uppercase tracking-[0.2em] text-white mb-4 drop-shadow-md">
                  WARNING: ACTIVE PROTOCOL DETECTED
                </h3>
                
                <p className="text-white/70 text-sm md:text-base leading-relaxed font-light mb-10">
                  You are currently assigned to an active training block. Proceeding will <strong className="text-white font-semibold">completely overwrite</strong> your existing program and <strong className="text-white font-semibold">reset all your progress back to Day 1</strong>. Are you certain you want to abandon your current path?
                </p>
                
                <div className="flex flex-col md:flex-row w-full gap-4">
                  <button
                    onClick={() => setShowOverrideWarning(false)}
                    className="flex-1 px-6 py-4 bg-white/5 border border-white/20 text-white/80 font-bold uppercase tracking-[0.2em] text-xs md:text-sm rounded-[1.5rem] hover:bg-white/10 hover:text-white transition-all duration-300"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={proceedInitialize}
                    className="flex-1 px-6 py-4 bg-white/20 border border-white/30 text-white font-bold uppercase tracking-[0.2em] text-xs md:text-sm rounded-[1.5rem] shadow-sm hover:bg-white hover:text-black transition-all duration-500"
                  >
                    OVERRIDE PROTOCOL
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
