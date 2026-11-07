"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, Zap, AlertTriangle, ShieldCheck, Moon, Sun, ThermometerSnowflake, Smartphone, BrainCircuit, Pill, Info, X } from "lucide-react";
import { montserrat } from "@/app/fonts";
import { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import SleepTracker from "@/components/SleepTracker";

type SleepLog = {
  date: string;
  targetWakeTime: string;
  actualWakeTime: string;
  sunlightLogged: boolean;
  durationHours: number;
};

export default function SleepAnalyticsPage() {
  const router = useRouter();
  
  const [history, setHistory] = useState<SleepLog[]>([]);
  const [status, setStatus] = useState<"LOCKED" | "COMPROMISED" | "DEBT" | "NO_DATA">("NO_DATA");
  const [targetWake, setTargetWake] = useState("07:00");
  const [showGuide, setShowGuide] = useState(false);
  
  const loadData = useCallback(() => {
    const rawHistory = localStorage.getItem("ultimatum_sleep_history");
    const savedTargetWake = localStorage.getItem("ultimatum_target_wake_time") || "07:00";
    setTargetWake(savedTargetWake);

    if (rawHistory) {
      const parsed: SleepLog[] = JSON.parse(rawHistory);
      parsed.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setHistory(parsed);
      calculateStatus(parsed, savedTargetWake);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const calculateStatus = (logs: SleepLog[], target: string) => {
    if (logs.length === 0) {
      setStatus("NO_DATA");
      return;
    }

    // Rule 2: Sleep Debt Threshold (< 6 Hours for last 4 days)
    if (logs.length >= 4) {
      const lastFour = logs.slice(-4);
      const allUnderSix = lastFour.every(log => log.durationHours < 6);
      if (allUnderSix) {
        setStatus("DEBT");
        return;
      }
    }

    // Rule 1: Wake Time Window (7 Minutes)
    const todayLog = logs[logs.length - 1];
    
    // Parse target and actual into minutes from midnight
    const [tHours, tMins] = target.split(":").map(Number);
    const targetMins = tHours * 60 + tMins;
    
    const [aHours, aMins] = todayLog.actualWakeTime.split(":").map(Number);
    const actualMins = aHours * 60 + aMins;

    const diff = Math.abs(targetMins - actualMins);

    if (diff > 7) {
      setStatus("COMPROMISED");
      return;
    }

    // Rule 3: Routine Locked
    setStatus("LOCKED");
  };

  const getStatusConfig = () => {
    switch(status) {
      case "DEBT":
        return {
          title: "SEVERE SLEEP DEBT DETECTED",
          color: "text-white",
          bg: "bg-black",
          border: "border-white border-2",
          icon: AlertTriangle,
          tip: "Your sleep duration dropped below threshold. Sleeping in tomorrow will delay your melatonin onset and ruin the next night. Endure today's exhaustion, and shift your bedtime earlier to recover without destroying your rhythm."
        };
      case "COMPROMISED":
        return {
          title: "CIRCADIAN RHYTHM COMPROMISED",
          color: "text-white",
          bg: "bg-black",
          border: "border-neutral-800",
          icon: Zap,
          tip: "Missing sunlight or shifting your wake time delays your morning cortisol spike, meaning you won't feel tired at your normal bedtime tonight. Get direct sunlight immediately upon waking tomorrow to hard-reset your biological clock."
        };
      case "LOCKED":
        return {
          title: "ROUTINE LOCKED",
          color: "text-white",
          bg: "bg-black",
          border: "border-neutral-800",
          icon: ShieldCheck,
          tip: "Your cortisol and melatonin release cycles are perfectly synchronized. By waking up consistently and getting sunlight, your biological clock knows exactly when to give you energy and when to wind down."
        };
      default:
        return {
          title: "AWAITING DATA",
          color: "text-neutral-500",
          bg: "bg-black",
          border: "border-neutral-800",
          icon: Moon,
          tip: "Log your first sleep cycle to activate the analytics engine."
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  // Last 7 days for graph
  const graphData = history.slice(-7).map(h => ({
    date: new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' }),
    hours: h.durationHours
  }));

  let score = 0;
  let duration = 0;
  let isSunlight = false;
  
  if (history.length > 0) {
    const recent = history[history.length - 1];
    duration = recent.durationHours;
    isSunlight = recent.sunlightLogged;
    
    score = 10;
    if (duration < 7.5) score -= (7.5 - duration) * 1.5;
    if (!isSunlight) score -= 1.0;
    if (status === "COMPROMISED") score -= 1.5;
    if (status === "DEBT") score -= 2.0;
    
    if (score < 1.0) score = 1.0;
    if (score > 10.0) score = 10.0;
  }

  return (
    <div className={`min-h-screen bg-black text-white px-6 py-12 md:py-24 relative overflow-hidden ${montserrat.className}`}>
      
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src="/new%20images/sleeping.jpg" 
          alt="Sleep Engine Background" 
          className="w-full h-full object-cover grayscale brightness-[0.8]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90"></div>
      </div>
      
      <div className="max-w-3xl mx-auto relative z-10 flex flex-col h-full">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center gap-4"
        >
          <button 
            onClick={() => router.push("/settings")}
            className="w-12 h-12 shrink-0 flex items-center justify-center bg-black/20 backdrop-blur-xl border border-sky-900/20 rounded-full text-sky-200/60 hover:text-sky-200 hover:bg-sky-900/10 transition-colors shadow-lg"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">
              Sleep Analytics
            </h1>
            <p className="text-neutral-300 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
              Deterministic Engine
            </p>
          </div>
          <button 
            onClick={() => setShowGuide(true)}
            className="ml-auto w-10 h-10 shrink-0 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Info size={18} />
          </button>
        </motion.div>

        {/* Quick Guide Modal */}
        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="mb-8"
            >
              <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative">
                <button 
                  onClick={() => setShowGuide(false)}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                  <Info size={16} className="text-[#0ea5e9]" /> 
                  How to use this tracker
                </h3>
                <ul className="space-y-4 text-xs font-medium leading-relaxed text-neutral-300">
                  <li>
                    <strong className="text-white block mb-1">1. Set Your Target Wake Anchor</strong>
                    Tap the <strong>Target Wake Anchor</strong> time picker to lock in your strict wake-up time. This should never change.
                  </li>
                  <li>
                    <strong className="text-white block mb-1">2. Log Your Bedtime</strong>
                    Right before you go to sleep, tap the <strong>Bedtime Now</strong> button under the clock. The engine will start tracking your sleep duration.
                  </li>
                  <li>
                    <strong className="text-white block mb-1">3. Submit Your Morning Log</strong>
                    When you wake up, enter your <strong>Actual Wake Time</strong>. Check the box if you got 60 minutes of sunlight, then tap the <strong>Submit Log</strong> button to save your data and view your analytics.
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Form */}
        <SleepTracker onLogSubmitted={loadData} />

        {/* Status Widget Redesign */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full bg-[#111] backdrop-blur-3xl rounded-[32px] p-6 md:p-8 mb-12 border border-white/5 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] group"
        >
          {/* Subtle gradient background flair matching the aesthetic (but dark mode) */}
          <div className={`absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32 transition-opacity duration-700 ${status === 'LOCKED' ? 'opacity-50' : 'opacity-10'}`} />
          <div className={`absolute bottom-0 left-0 w-48 h-48 ${status === 'DEBT' || status === 'COMPROMISED' ? 'bg-red-500/10' : 'bg-sky-500/10'} rounded-full blur-[60px] -ml-24 -mb-24`} />

          <div className="relative z-10 flex justify-between items-start mb-6">
            <div className="pr-4">
              <h2 className="text-white text-lg md:text-xl font-bold tracking-tight mb-1">
                {config.title.replace('CIRCADIAN RHYTHM ', '')}
              </h2>
              <p className="text-neutral-400 text-xs font-medium leading-relaxed max-w-[80%]">
                {config.tip}
              </p>
            </div>
            
            {history.length > 0 && (
              <div className="flex items-baseline gap-1 text-right shrink-0">
                <span className="text-4xl md:text-5xl font-medium tracking-tighter text-white">{score.toFixed(1)}</span>
                <span className="text-neutral-500 font-medium text-sm md:text-base">/10</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {history.length > 0 && (
             <div className="w-full h-3 md:h-4 bg-white/5 rounded-full overflow-hidden mb-8 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] relative">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(score / 10) * 100}%` }}
                 transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                 className={`h-full rounded-full ${score > 7 ? 'bg-gradient-to-r from-white/40 to-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-gradient-to-r from-red-500/40 to-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}
               />
             </div>
          )}

          {/* Bottom Metrics */}
          {history.length > 0 && (
            <div className="flex flex-wrap items-center gap-8 relative z-10">
              {/* Sunlight */}
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                    <circle 
                      cx="16" cy="16" r="14" fill="none" stroke={isSunlight ? "#fff" : "rgba(255,255,255,0.1)"} 
                      strokeWidth="3" 
                      strokeDasharray="88" 
                      strokeDashoffset={isSunlight ? "0" : "88"} 
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <Sun size={12} className={isSunlight ? "text-black bg-white rounded-full p-[2px]" : "text-neutral-600"} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 tracking-wider">Sunlight</p>
                  <p className="text-sm font-semibold text-white">{isSunlight ? "Logged" : "Missed"}</p>
                </div>
              </div>

              {/* Sleep Duration */}
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                    <circle 
                      cx="16" cy="16" r="14" fill="none" stroke={duration >= 7 ? "#fff" : "#ef4444"} 
                      strokeWidth="3" 
                      strokeDasharray="88" 
                      strokeDashoffset={88 - (Math.min(duration, 8) / 8) * 88} 
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <Moon size={12} className={duration >= 7 ? "text-white" : "text-red-500"} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 tracking-wider">Duration</p>
                  <p className="text-sm font-semibold text-white">{duration} hrs</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Graph */}
        {graphData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full bg-black/40 backdrop-blur-xl border border-sky-900/20 rounded-[32px] p-6 mb-12 shadow-2xl"
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-6">7-Day Duration Trend</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graphData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: 'black', border: '1px solid #262626', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Bar dataKey="hours" fill="#bae6fd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* The Ultimate Sleep Protocol */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full mt-12 md:mt-20"
        >
          <div className="flex flex-col gap-2 mb-10">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-white" size={24} />
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white">
                The Ultimate Protocol
              </h2>
            </div>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-neutral-400 ml-10">
              Absolute Deep Sleep & Biological Recovery
            </p>
          </div>

          <div className="space-y-8">
            {/* 1. Light Elimination */}
            <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-6 md:p-8 shadow-2xl border border-sky-900/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-sky-200/10 flex items-center justify-center shrink-0">
                  <Smartphone size={20} className="text-sky-200" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-widest text-white">Synthetic Light Elimination</h3>
              </div>
              <p className="text-sm font-medium text-neutral-300 leading-relaxed mb-4">
                120 minutes before sleep, all screens die. Period. Leave your devices in another room. Stop using cheap dopamine to mask your inability to be alone with your thoughts.
              </p>
              <ul className="text-sm font-medium text-neutral-300 leading-relaxed list-disc list-inside space-y-2">
                <li>Zero blue light exposure before your target sleep window.</li>
                <li>Read a physical book if you need an anchor.</li>
                <li>Prepare for tomorrow instead of doomscrolling tonight.</li>
              </ul>
            </div>

            {/* 2. Cognitive Purge */}
            <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-6 md:p-8 shadow-2xl border border-sky-900/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-sky-200/10 flex items-center justify-center shrink-0">
                  <BrainCircuit size={20} className="text-sky-200" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-widest text-white">Cognitive Purge</h3>
              </div>
              <p className="text-sm font-medium text-neutral-300 leading-relaxed mb-3">
                Sit in silence for 20 minutes. No inputs. No music. Your mind will race—let it. This is your brain processing the garbage you consumed all day.
              </p>
              <p className="text-sm font-medium text-neutral-300 leading-relaxed">
                Endure the discomfort until the noise stops. If you don't do this now, your brain will do it at 3 AM when you're trying to sleep.
              </p>
            </div>

            {/* 3. Core Thermal Regulation */}
            <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-6 md:p-8 shadow-2xl border border-sky-900/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-sky-200/10 flex items-center justify-center shrink-0">
                  <ThermometerSnowflake size={20} className="text-sky-200" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-widest text-white">Core Thermal Regulation</h3>
              </div>
              <p className="text-sm font-medium text-neutral-300 leading-relaxed mb-5">
                Drop your ambient environment to 18-20°C. Your body cannot enter deep restorative phases if it's fighting to cool down. Make your room a cold, dark cave.
              </p>
              <div className="bg-white/10 rounded-2xl p-5 text-sm text-neutral-300 shadow-sm border border-white/5">
                <strong className="text-white uppercase tracking-widest block mb-2 text-xs">Threat Mitigation</strong>
                Lock every door and window. Shut down your brain's primal threat-detection loop. You cannot rest if a primitive part of your mind feels exposed.
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}
