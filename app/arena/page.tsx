"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { montserrat } from "@/app/fonts";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info, Target, Trophy, ChevronDown, ChevronUp, Swords, Ruler, Scale, Flame, Percent, X } from "lucide-react";
import StatRadarChart from "../../components/StatRadarChart";
import Image from "next/image";
import { ARENA_LEVELS, getArenaLevel, getNumericLevel, getLevelProgress } from "@/lib/arena-levels";

import { calcStatsFromStorageObj } from "@/lib/stats";
import UserEmailDisplay from "../../components/UserEmailDisplay";

export default function ArenaPage() {
  const router = useRouter();
  const [avgScore, setAvgScore] = useState(20);
  const [showAllLevels, setShowAllLevels] = useState(false);
  
  // Vitals State
  const [weight, setWeight] = useState("N/A");
  const [height, setHeight] = useState("N/A");
  const [bodyFat, setBodyFat] = useState("N/A");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    // Build a storage object exactly like Versus does
    const storageObj: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) storageObj[key] = localStorage.getItem(key) || "";
    }
    const stats = calcStatsFromStorageObj(storageObj);
    setAvgScore(stats.avgScore);

    // Load Vitals
    setWeight(localStorage.getItem("ultimatum_weight") || "N/A");
    setHeight(localStorage.getItem("ultimatum_height") || "N/A");
    setBodyFat(localStorage.getItem("ultimatum_bodyfat") || "N/A");
  }, []);

  const saveSpecs = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const w = formData.get("weight") as string;
    const h = formData.get("height") as string;
    const bf = formData.get("bodyFat") as string;
    
    if (w) { setWeight(w); localStorage.setItem("ultimatum_weight", w); }
    if (h) { setHeight(h); localStorage.setItem("ultimatum_height", h); }
    if (bf) { setBodyFat(bf); localStorage.setItem("ultimatum_bodyfat", bf); }
    
    import("@/lib/syncService").then(({ saveUserSettingsToCloud }) => {
      saveUserSettingsToCloud().catch(() => {});
    }).catch(() => {});

    setIsEditModalOpen(false);
  };

  const arenaLevel = getArenaLevel(avgScore);
  const numericLevel = getNumericLevel(avgScore);
  const { pct, pointsToNext, nextRank } = getLevelProgress(avgScore);

  // Levels to show in table — collapsed = first 5, expanded = all
  const visibleLevels = showAllLevels ? ARENA_LEVELS : ARENA_LEVELS.slice(0, 5);

  return (
    <main className={`relative min-h-screen bg-black text-white px-4 md:px-8 py-8 overflow-x-hidden ${montserrat.className}`}>
      <div className="max-w-3xl mx-auto relative z-10 flex flex-col gap-10 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between w-full gap-2 mb-2">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Profile</h1>
            <UserEmailDisplay />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => router.push("/arena/versus")}
              className="flex items-center justify-center px-4 h-12 bg-[#1C1C1E] rounded-full border border-[#2C2C2E] text-white hover:bg-[#2C2C2E] transition-all duration-300 text-[10px] font-bold uppercase tracking-widest shrink-0 whitespace-nowrap"
            >
              Multiplayer
            </button>
            <button
              onClick={() => router.back()}
              className="w-12 h-12 shrink-0 flex items-center justify-center bg-[#1C1C1E] rounded-full border border-[#2C2C2E] text-neutral-400 hover:text-white hover:bg-[#2C2C2E] transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>

        {/* ─── LEVEL CARD ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full bg-[#1C1C1E] rounded-[32px] p-6 border border-[#2C2C2E]"
        >
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="text-3xl font-bold tracking-tight text-white mb-1">
                {arenaLevel.rank}
              </div>
              <div className="text-sm text-neutral-400 font-medium max-w-[250px]">
                {arenaLevel.description}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-black/40 border border-white/5 shrink-0">
              <div className="text-[10px] font-bold text-neutral-500 mb-0.5">LV</div>
              <div className="text-xl font-bold text-white leading-none">
                {numericLevel}
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <div className="text-sm font-medium text-white">
                Score: {avgScore}
              </div>
              {nextRank ? (
                <div className="text-xs text-neutral-400">
                  +{pointsToNext} to {nextRank.rank}
                </div>
              ) : (
                <div className="text-xs text-neutral-400">
                  Max Rank Achieved
                </div>
              )}
            </div>
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                className="h-full bg-[#FFC107] rounded-full"
              />
            </div>
          </div>
        </motion.div>


        {/* ─── PHYSICAL SPECS ─── */}
        <div className="w-full mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold tracking-tight text-white">Physical Specs</h2>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white px-3 py-1.5 rounded-full border border-[#2C2C2E] bg-[#1C1C1E] transition-colors"
            >
              Update
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[24px] p-4 flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/5">
                <Scale size={18} className="text-neutral-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-0.5">Weight</div>
                <div className="text-lg font-black text-white leading-none">{weight}</div>
              </div>
            </div>
            
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[24px] p-4 flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/5">
                <Ruler size={18} className="text-neutral-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-0.5">Height</div>
                <div className="text-lg font-black text-white leading-none">{height}</div>
              </div>
            </div>

            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[24px] p-4 flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/5">
                <Percent size={18} className="text-neutral-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-0.5">Body Fat</div>
                <div className="text-lg font-black text-white leading-none">{bodyFat}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RADAR CHART ─── */}
        <div className="w-full flex justify-center mb-4">
          <StatRadarChart color="#FFC107" variant="polygon" />
        </div>

        {/* ─── RANK TABLE ─── */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Progression Ranks
            </h2>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {visibleLevels.map((lvl, i) => {
                const isCurrentBracket = arenaLevel.rank === lvl.rank;
                return (
                  <motion.div
                    key={lvl.rank}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`flex items-center gap-3 p-4 rounded-[20px] transition-all ${
                      isCurrentBracket
                        ? "bg-[#2C2C2E] border border-white/10"
                        : "bg-[#1C1C1E] border border-transparent"
                    }`}
                  >
                    {/* Level number */}
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-black/40 border border-white/5 shrink-0">
                      <span className="text-[8px] font-bold uppercase text-neutral-500 mb-0.5">LV</span>
                      <span className="text-sm font-bold text-white leading-none">
                        {lvl.level}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 ml-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white tracking-tight">
                          {lvl.rank}
                        </span>
                        {isCurrentBracket && (
                          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#FFC107] text-[#000000] leading-none">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 leading-tight line-clamp-1">
                        {lvl.description}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1">
                        Score
                      </div>
                      <div className="text-sm font-bold text-white">
                        {lvl.minScore}+
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Show more / collapse */}
          <button
            onClick={() => setShowAllLevels((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-neutral-400 hover:text-white transition-colors border border-[#2C2C2E] bg-[#1C1C1E] rounded-full hover:bg-[#2C2C2E]"
          >
            {showAllLevels ? (
              <><ChevronUp size={16} /> Show Less</>
            ) : (
              <><ChevronDown size={16} /> Show All {ARENA_LEVELS.length} Ranks</>
            )}
          </button>
        </div>

        {/* ─── MECHANICS BREAKDOWN ─── */}
        <div className="w-full space-y-4">
          <div className="flex items-center gap-2 mb-2 mt-4">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Stat Mechanics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#121212] border border-white/5 border-l-2 border-l-[#FFC107] p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-2">Strength</h3>
              <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                Your absolute max weight lifted in any tracked movement. Pushing heavier weights in the Routine tab grows this.
              </p>
            </div>

            <div className="bg-[#121212] border border-white/5 border-l-2 border-l-[#FFC107] p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-2">Volume</h3>
              <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                Weekly tonnage (Weight × Reps) across all lifts in the last 7 days. High volume = massive VOL stat.
              </p>
            </div>

            <div className="bg-[#121212] border border-white/5 border-l-2 border-l-[#FFC107] p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-2">Consistency</h3>
              <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                4+ unique training days in a 7-day window = maxed CON. Miss training → CON drops.
              </p>
            </div>

            <div className="bg-[#121212] border border-white/5 border-l-2 border-l-[#FFC107] p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-2">Discipline</h3>
              <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                Nutritional adherence. Log your macros every day in the Nutrition tab to keep DIS high.
              </p>
            </div>
            
            <div className="bg-[#121212] border border-white/5 border-l-2 border-l-[#FFC107] p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-2">Engine</h3>
              <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                Cardiovascular capacity and daily movement. Hit 150 minutes of cardio OR 70k steps weekly to max out.
              </p>
            </div>
          </div>


        </div>

      </div>

      {/* Edit Specs Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-[#222] rounded-[32px] p-6 w-full max-w-sm relative"
            >
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-bold tracking-tight text-white mb-6">Update Specs</h2>
              
              <form onSubmit={saveSpecs} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Weight (e.g. 185 lbs or 84 kg)</label>
                  <input name="weight" defaultValue={weight !== "N/A" ? weight : ""} placeholder="185 lbs / 84 kg" className="w-full bg-neutral-900 border border-[#333] rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white transition-colors" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Height (e.g. 6'0" or 180 cm)</label>
                  <input name="height" defaultValue={height !== "N/A" ? height : ""} placeholder="6'0&quot; / 180 cm" className="w-full bg-neutral-900 border border-[#333] rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white transition-colors" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Body Fat % (e.g. 12%)</label>
                  <input name="bodyFat" defaultValue={bodyFat !== "N/A" ? bodyFat : ""} placeholder="12%" className="w-full bg-neutral-900 border border-[#333] rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white transition-colors" />
                </div>
                
                <button type="submit" className="w-full bg-white text-black font-black uppercase tracking-widest text-sm py-4 rounded-2xl mt-4 hover:bg-neutral-200 transition-colors">
                  Save Specs
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
