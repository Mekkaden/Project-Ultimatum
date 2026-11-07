"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Clock, Zap, Check } from "lucide-react";
import TimePicker from "./TimePicker";
import AnalogClock from "./AnalogClock";

interface SleepTrackerProps {
  onLogSubmitted?: () => void;
}

export default function SleepTracker({ onLogSubmitted }: SleepTrackerProps) {
  const [targetWakeTime, setTargetWakeTime] = useState("07:00");
  const [actualWakeTime, setActualWakeTime] = useState("");
  const [sunlightLogged, setSunlightLogged] = useState(false);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  
  // A string to show if a bedtime is currently running
  const [currentBedtime, setCurrentBedtime] = useState<string | null>(null);

  // Load saved preferences on mount
  useEffect(() => {
    const savedTargetWake = localStorage.getItem("ultimatum_target_wake_time");
    const activeBedtime = localStorage.getItem("ultimatum_current_bedtime");
    const existingHistory = localStorage.getItem("ultimatum_sleep_history");
    
    if (savedTargetWake) setTargetWakeTime(savedTargetWake);
    if (activeBedtime) setCurrentBedtime(activeBedtime);

    const todayStr = new Date().toISOString().split("T")[0];
    if (existingHistory) {
      const history = JSON.parse(existingHistory);
      if (history.some((h: any) => h.date === todayStr)) {
        setHasLoggedToday(true);
      }
    }

    // Auto-fill actual times with current time for convenience
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, "0");
    const currentMin = now.getMinutes().toString().padStart(2, "0");
    setActualWakeTime(`${currentHour}:${currentMin}`);
  }, []);

  const handleSaveTargetWake = (val: string) => {
    setTargetWakeTime(val);
    localStorage.setItem("ultimatum_target_wake_time", val);
  };

  const handleLogBedtime = () => {
    const now = new Date().toISOString();
    localStorage.setItem("ultimatum_current_bedtime", now);
    setCurrentBedtime(now);
  };

  const handleSubmitMorningLog = () => {
    // If no active bedtime, fallback to exactly 8 hours before wake time to not break the math
    let bedtimeDate = currentBedtime ? new Date(currentBedtime) : new Date();
    if (!currentBedtime) {
       bedtimeDate = new Date();
       bedtimeDate.setHours(bedtimeDate.getHours() - 8);
    }

    const [wakeHours, wakeMins] = actualWakeTime.split(":").map(Number);
    const wakeDate = new Date();
    wakeDate.setHours(wakeHours, wakeMins, 0, 0);

    // Calculate duration in hours
    let diffMs = wakeDate.getTime() - bedtimeDate.getTime();
    if (diffMs < 0) {
      // It means wakeDate is on the next day relative to when bedtime was set?
      // Actually if they set bedtime at 11pm and wake at 7am, diff is positive. 
      // If it's negative, it means something went weird with manual time inputs, let's just add 24h
      diffMs += 24 * 60 * 60 * 1000; 
    }
    const durationHours = diffMs / (1000 * 60 * 60);

    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const logEntry = {
      date: todayStr,
      targetWakeTime,
      actualWakeTime,
      sunlightLogged,
      durationHours: Number(durationHours.toFixed(2)),
    };

    // Save to history
    const existing = localStorage.getItem("ultimatum_sleep_history");
    let history = existing ? JSON.parse(existing) : [];
    
    const existingIdx = history.findIndex((h: any) => h.date === todayStr);
    if (existingIdx >= 0) {
      history[existingIdx] = logEntry;
    } else {
      history.push(logEntry);
    }
    
    localStorage.setItem("ultimatum_sleep_history", JSON.stringify(history));
    setHasLoggedToday(true);

    // Clear active bedtime
    localStorage.removeItem("ultimatum_current_bedtime");
    setCurrentBedtime(null);

    if (onLogSubmitted) {
      onLogSubmitted();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[40px] p-6 shadow-2xl relative overflow-hidden mb-8 border border-white/5"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Moon size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-widest text-white">Daily Log</h2>
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 mt-0.5">Circadian Inputs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        
        {/* Left Column: Analog Clock */}
        <div className="flex flex-col items-center justify-center bg-black/40 rounded-[32px] p-6 border border-white/5 shadow-inner">
          <AnalogClock />
          <div className="mt-8 flex flex-col items-center w-full">
            {!currentBedtime ? (
              <button
                onClick={handleLogBedtime}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs py-4 rounded-full flex items-center justify-center gap-2 transition-all border border-white/5"
              >
                <Moon size={14} />
                <span>Bedtime Now</span>
              </button>
            ) : (
              <div className="w-full bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest text-center">
                Tracking Sleep...
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Time Controls & Sunlight */}
        <div className="flex flex-col gap-3">
          {/* Target Wake Anchor */}
          <div className="bg-black/40 rounded-3xl p-4 border border-white/5 flex flex-col justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 flex items-center gap-1.5">
              <Clock size={12} /> Target Wake Anchor
            </label>
            <TimePicker 
              value={targetWakeTime} 
              onChange={(v) => handleSaveTargetWake(v)} 
            />
          </div>

          {/* Actual Wake Time */}
          <div className="bg-black/40 rounded-3xl p-4 border border-white/5 flex flex-col justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
              Actual Wake Time
            </label>
            <TimePicker 
              value={actualWakeTime} 
              onChange={(v) => setActualWakeTime(v)} 
            />
          </div>

          {/* Sunlight Toggle */}
          <button
            onClick={() => setSunlightLogged(!sunlightLogged)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-3xl transition-all duration-300 border ${
              sunlightLogged 
                ? "bg-white border-white shadow-sm" 
                : "bg-white/5 border-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun size={16} className={sunlightLogged ? "text-black" : "text-white/60"} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${sunlightLogged ? "text-black" : "text-white/60"}`}>
                Sunlight (60m)
              </span>
            </div>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
              sunlightLogged ? "bg-black text-white" : "bg-white/10 text-transparent"
            }`}>
              <Check size={12} strokeWidth={4} />
            </div>
          </button>

          {/* Submit Button */}
          <button
            onClick={handleSubmitMorningLog}
            className={`w-full font-bold uppercase tracking-widest text-[10px] py-4 rounded-3xl flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98] mt-auto ${
              hasLoggedToday 
                ? "bg-[#111] text-neutral-400 hover:text-white border border-neutral-800" 
                : "bg-white text-black hover:bg-neutral-200 shadow-sm"
            }`}
          >
            <span>{hasLoggedToday ? "Overwrite Log" : "Submit Log"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
