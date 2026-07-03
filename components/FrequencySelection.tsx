"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Activity, Zap, AlertTriangle } from "lucide-react";
import { Montserrat } from "next/font/google";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DecryptedText from "./DecryptedText";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700", "900"] });

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
    borderColor: "border-white",
    shadowColor: "hover:shadow-white/20",
    activeBg: "bg-white/10",
    activeBorder: "border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]",
    textClass: "text-white",
    bgClass: "bg-white/20",
    borderClass: "border-white/50"
  },
  {
    id: "4-days",
    title: "4 DAYS: THE SWEET SPOT",
    subtitle: "The golden standard for natural lifters. Usually an Upper/Lower split. Optimal balance of mechanical tension and CNS recovery.",
    metric: "Recovery Focus: Balanced",
    icon: Zap,
    accentColor: "blue",
    borderColor: "border-blue-500",
    shadowColor: "hover:shadow-blue-500/20",
    activeBg: "bg-blue-900/20",
    activeBorder: "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    textClass: "text-blue-400",
    bgClass: "bg-blue-900/30",
    borderClass: "border-blue-700/50"
  },
  {
    id: "5-days",
    title: "5 DAYS: THE REDLINE",
    subtitle: "Advanced programming. You are walking the edge of overtraining. Only choose this if your sleep, nutrition, and stress management are flawless.",
    metric: "Recovery Focus: Minimal",
    icon: Activity,
    accentColor: "yellow",
    borderColor: "border-yellow-500",
    shadowColor: "hover:shadow-yellow-500/20",
    activeBg: "bg-yellow-900/20",
    activeBorder: "border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)]",
    textClass: "text-yellow-400",
    bgClass: "bg-yellow-900/30",
    borderClass: "border-yellow-700/50"
  },
  {
    id: "6-days",
    title: "6 DAYS: ELITE RECOVERY",
    subtitle: "Extreme volume and frequency. Requires flawless sleep, nutrition, and advanced recovery protocols.",
    metric: "Recovery Focus: Critical",
    icon: Activity,
    accentColor: "purple",
    borderColor: "border-purple-500",
    shadowColor: "hover:shadow-purple-500/20",
    activeBg: "bg-purple-900/20",
    activeBorder: "border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]",
    textClass: "text-purple-400",
    bgClass: "bg-purple-900/30",
    borderClass: "border-purple-700/50"
  },
  {
    id: "custom",
    title: "CUSTOM: OFF GRID",
    subtitle: "[WARNING] Not recommended for beginners. You must dictate the rules, programming, and fatigue management yourself.",
    metric: "Recovery Focus: Unknown",
    icon: AlertTriangle,
    accentColor: "red",
    borderColor: "border-red-600",
    shadowColor: "hover:shadow-red-600/20",
    activeBg: "bg-red-900/20",
    activeBorder: "border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)]",
    textClass: "text-red-500",
    bgClass: "bg-red-900/30",
    borderClass: "border-red-900/50"
  }
];

export default function FrequencySelection() {
  const [selected, setSelected] = useState<Frequency>(null);
  const [directive, setDirective] = useState<Directive>(null);
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const storedDirective = localStorage.getItem("ultimatum_directive") as Directive;
    setDirective(storedDirective);
  }, []);

  const handleInitialize = () => {
    if (!selected) return;
    
    // Save selection to local prototype state
    localStorage.setItem("ultimatum_frequency", selected.toString());
    
    // TODO: Log the entire onboarding state to Supabase here
    console.log("Saving onboarding state to Supabase...", { frequency: selected });
    
    // Route to auth if not authenticated, otherwise doctrine
    if (status === "authenticated") {
      router.push("/doctrine");
    } else {
      router.push("/auth");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className={`min-h-screen w-full bg-black flex flex-col items-center py-24 px-6 relative overflow-hidden ${montserrat.className}`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/fun2.jpg" 
          alt="Arnold Background" 
          className="w-full h-full object-cover object-[center_30%] opacity-60 grayscale" 
        />
        {/* Subtle gradients only at the edges to maintain text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90"></div>
      </div>

      <div className="max-w-5xl w-full flex flex-col items-center relative z-10">
        
        {/* Header Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-center w-full mb-12"
        >
          <div className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-widest mb-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            <DecryptedText
              text="DEFINE YOUR COMMITMENT"
              speed={60}
              maxIterations={15}
              characters="01!@#$%^&*?"
              animateOn="view"
              encryptedClassName="text-neutral-500"
            />
          </div>

          {/* The Reality Check (Interactive Card) */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="group relative bg-neutral-950/80 backdrop-blur-md border border-neutral-800 p-6 md:p-8 text-left rounded-xl max-w-4xl mx-auto shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Glowing red accent that follows hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            {/* Left border accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="bg-red-950/50 p-4 rounded-lg border border-red-900/50 flex-shrink-0">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              
              <div>
                <h3 className="text-red-500 font-black uppercase tracking-[0.2em] text-sm md:text-base mb-2">
                  The Myth of Volume
                </h3>
                <p className="text-neutral-300 text-sm md:text-base leading-relaxed font-medium">
                  More days do not equal more gains. If you are truly training at <span className="text-white font-bold">0-2 RIR (Absolute Mechanical Failure)</span>, your Central Nervous System will burn out before your muscles do. Do not let ego dictate your schedule. Pick the frequency you can realistically sustain for 6 months, not 6 days. <span className="text-white font-bold">By no means change from this split for at least 3 months to assess progress, so choose wisely and pick what you can practically follow.</span>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* The Protocol Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
          {FREQUENCIES.filter(freq => {
            if (directive === "strength") {
              return freq.id === "3-days" || freq.id === "4-days" || freq.id === "6-days" || freq.id === "custom";
            }
            if (directive === "calisthenics") {
              return freq.id === "3-days" || freq.id === "4-days" || freq.id === "6-days" || freq.id === "custom";
            }
            if (directive === "hybrid") {
              return freq.id === "4-days" || freq.id === "6-days" || freq.id === "custom";
            }
            if (directive === "hypertrophy") {
              return freq.id === "3-days" || freq.id === "4-days" || freq.id === "5-days" || freq.id === "custom";
            }
            return true;
          }).map((freq, index) => {
            const Icon = freq.icon;
            const isActive = selected === freq.id;
            
            return (
              <motion.div
                key={freq.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(freq.id as Frequency)}
                className={`relative cursor-pointer w-full rounded-xl border-2 transition-all duration-300 flex flex-col p-6 md:p-8
                  ${isActive 
                    ? `${freq.activeBg} ${freq.activeBorder}` 
                    : `bg-neutral-950 border-neutral-800 opacity-60 hover:opacity-100 ${freq.shadowColor} hover:${freq.borderColor}`
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Icon 
                    size={28} 
                    className={isActive ? freq.textClass : "text-white"} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                  <h3 className={`text-xl font-black uppercase tracking-wider ${isActive ? "text-white" : "text-neutral-200"}`}>
                    {freq.title.split(":")[0]}
                  </h3>
                </div>

                <div className={`text-sm font-bold tracking-widest uppercase mb-4 ${isActive ? freq.textClass : "text-neutral-500"}`}>
                  {freq.title.split(":")[1].trim()}
                </div>
                
                <p className="text-neutral-400 text-sm leading-relaxed mb-8 flex-grow">
                  {freq.subtitle}
                </p>

                <div className={`text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-md inline-block w-fit mt-auto border
                  ${isActive ? `${freq.bgClass} ${freq.textClass} ${freq.borderClass}` : "bg-neutral-900 text-neutral-500 border-neutral-800"}
                `}>
                  {freq.metric}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Finalizer Button */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-4"
            >
              <button
                onClick={handleInitialize}
                className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-[0.3em] text-sm md:text-base rounded-full shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.8)] hover:bg-red-500 transition-all duration-300 border border-red-400"
              >
                Initialize Sanctuary
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
