"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Check, X, Droplet } from 'lucide-react';
import Link from 'next/link';
import { montserrat } from '@/app/fonts';

interface Supplement {
  id: string;
  name: string;
  dose: string;
  timing: string;
  /** Local calendar days (YYYY-MM-DD) this supplement was taken on. */
  completedDates: string[];
  /** When this supplement was most recently ticked. Informational only; the
      daily reset is decided purely by comparing `completedDates` to today. */
  lastTakenAt?: number;
}

const TIMING_OPTIONS = ['Morning', 'Pre-Workout', 'Post-Workout', 'Before Bed', 'With Meals', 'Anytime'];

/**
 * The day's key, in the user's own time zone.
 *
 * The old reset compared the day only when the component rendered, so a screen
 * left mounted (or restored from the background the next morning) kept
 * yesterday's ticks forever: the value was computed once and never revisited.
 * The local date parts also keep the key stable regardless of time zone, and
 * match the YYYY-MM-DD convention used elsewhere in the app.
 */
function localDayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Converts anything stored by older builds into a local day key. */
function normalizeDay(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  // Already YYYY-MM-DD.
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  // Legacy `new Date().toDateString()` output, e.g. "Fri Oct 31 2026".
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return localDayKey(parsed);
  return null;
}

/**
 * Flips one supplement's "taken" flag for the current local day.
 *
 * Pure in the sense that matters here: it touches no React state and is only
 * ever called from an event handler, so the clock read cannot make a render
 * unstable.
 */
function toggleForDay(source: Supplement[], id: string): { updated: Supplement[]; day: string } {
  const day = localDayKey();
  const now = Date.now();
  const updated = source.map((sup) => {
    const existing = (Array.isArray(sup.completedDates) ? sup.completedDates : [])
      .map(normalizeDay)
      .filter((d): d is string => !!d);
    if (sup.id !== id) {
      return { ...sup, completedDates: pruneHistory(existing) };
    }
    const hasCompletedToday = existing.includes(day);
    const newDates = hasCompletedToday ? existing.filter((d) => d !== day) : [...existing, day];
    return {
      ...sup,
      completedDates: pruneHistory(newDates),
      lastTakenAt: hasCompletedToday ? sup.lastTakenAt : now,
    };
  });
  return { updated, day };
}

/**
 * Reads the stored list and normalises it. Kept outside the component so state
 * can be seeded from it on the first render without doing storage work during
 * render on later passes.
 */
function readStoredSupplements(): Supplement[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem('ultimatum_supplements');
    if (!saved) return [];
    const parsed = JSON.parse(saved) as Supplement[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((sup) => ({
      ...sup,
      completedDates: Array.isArray(sup.completedDates)
        ? pruneHistory(sup.completedDates.map(normalizeDay).filter((d): d is string => !!d))
        : [],
    }));
  } catch {
    return [];
  }
}

/** How many distinct days are kept; enough for a streak without unbounded growth. */
const HISTORY_DAYS = 60;

function pruneHistory(days: string[], reference: Date = new Date()): string[] {
  const cutoff = new Date(reference);
  cutoff.setDate(cutoff.getDate() - HISTORY_DAYS);
  const oldest = localDayKey(cutoff);
  const unique = Array.from(new Set(days)).sort();
  return unique.filter((day) => day >= oldest && day <= localDayKey(reference));
}

export default function SupplementsPage() {
  const [supplements, setSupplements] = useState<Supplement[]>(readStoredSupplements);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newDose, setNewDose] = useState('');
  const [newTiming, setNewTiming] = useState('Morning');

  const [today, setToday] = useState(localDayKey);

  const loadSupplements = () => {
    setSupplements(readStoredSupplements());
  };

  // The reset is driven by the clock, not by navigation: while this screen is
  // mounted (including overnight, or when the app is brought back to the
  // foreground the next morning) the day key is re-derived so yesterday's
  // ticks clear even though the page never re-mounted.
  useEffect(() => {
    const syncDay = () => {
      const current = localDayKey();
      setToday((previous) => (previous === current ? previous : current));
    };

    // Fire just after midnight rather than polling every second.
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    const midnightTimer = window.setTimeout(syncDay, nextMidnight.getTime() - now.getTime());

    // A WebView suspends timers while backgrounded, so also re-check whenever
    // the app becomes visible again or the device clock/zone changes.
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        syncDay();
        loadSupplements();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onVisibility);
    window.addEventListener("pageshow", onVisibility);

    return () => {
      window.clearTimeout(midnightTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onVisibility);
      window.removeEventListener("pageshow", onVisibility);
    };
  }, []);

  // Picks up changes written by another instance of this page.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'ultimatum_supplements') return;
      loadSupplements();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const saveSupplements = (newSups: Supplement[]) => {
    const pruned = newSups.map((sup) => ({
      ...sup,
      completedDates: pruneHistory(sup.completedDates),
    }));
    setSupplements(pruned);
    try {
      localStorage.setItem('ultimatum_supplements', JSON.stringify(pruned));
    } catch {}
  };

  const handleAddSupplement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newSup: Supplement = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName.trim(),
      dose: newDose.trim(),
      timing: newTiming,
      completedDates: [],
    };

    saveSupplements([...supplements, newSup]);
    
    setNewName('');
    setNewDose('');
    setNewTiming('Morning');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    saveSupplements(supplements.filter(s => s.id !== id));
  };

  const toggleCompletion = (id: string) => {
    // Re-read the stored list: another screen may have written since this one
    // rendered, and saving the stale array would silently undo those ticks.
    const source: Supplement[] = readStoredSupplements();
    if (!source.length) return;
    const { updated, day } = toggleForDay(source, id);
    saveSupplements(updated);
    // A tap always applies to the real current day, so the dial follows it
    // even in the moment before the midnight tick fires.
    setToday((previous) => (previous === day ? previous : day));
  };

  // Calculations for the dial
  const totalPods = supplements.length;
  const completedPods = supplements.filter(s =>
    (Array.isArray(s.completedDates) ? s.completedDates : []).some(d => normalizeDay(d) === today),
  ).length;
  const completionPercentage = totalPods === 0 ? 0 : Math.round((completedPods / totalPods) * 100);
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className={`min-h-screen bg-black text-white relative overflow-hidden pt-12 pb-24 px-4 ${montserrat.className}`}>
      
      {/* Background Image */}
      <div className="fixed inset-0 z-0 bg-black">
        <img 
          src="/supplements-bg.jpg" 
          alt="Supplements Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70 backdrop-saturate-50 z-0"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto flex flex-col min-h-[90vh]">
        
        {/* Header (Back Button) */}
        <div className="flex items-center mb-8 px-2">
          <Link href="/diet" className="w-12 h-12 flex items-center justify-center bg-black/20 rounded-full border border-white/10 backdrop-blur-md hover:bg-black/40 transition-colors shadow-lg">
            <ArrowLeft size={20} className="text-white" />
          </Link>
        </div>

        {/* Top HUD Stats */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full justify-between px-6 mt-4"
        >
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-neutral-500 uppercase font-black tracking-widest">Pods Online</span>
            <span className="text-xl font-medium mt-1">
              {completedPods} <span className="text-neutral-600 text-sm">/{totalPods}</span>
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-neutral-500 uppercase font-black tracking-widest">Status</span>
            <span className="text-xl font-medium mt-1 text-[#f2e8cf]">{completionPercentage}%</span>
          </div>
        </motion.div>

        {/* Arcs removed for functionality */}

        {/* Central Dial - Scaled Down & Functional */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative w-[220px] h-[220px] mx-auto mt-10 flex items-center justify-center"
        >
          {/* Soft inner glow */}
          <div className="absolute inset-0 bg-[#f2e8cf] opacity-[0.04] blur-[40px] rounded-full mix-blend-screen"></div>
          
          {/* SVG Progress Ring */}
          <svg width="220" height="220" className="absolute inset-0 -rotate-90">
            <circle cx="110" cy="110" r="95" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" strokeDasharray="4 6" />
            <circle 
              cx="110" cy="110" r="95" 
              stroke="#f2e8cf" 
              strokeWidth="6" 
              strokeDasharray={2 * Math.PI * 95} 
              strokeDashoffset={2 * Math.PI * 95 - (completionPercentage / 100) * (2 * Math.PI * 95)} 
              strokeLinecap="round" 
              fill="none" 
              className="transition-all duration-1000 ease-out" 
            />
          </svg>

          {/* Center Text */}
          <div className="flex flex-col items-center justify-center relative z-10">
            <span className="text-[9px] font-black text-neutral-500 mb-1 uppercase tracking-widest">Stack</span>
            <span className="text-4xl font-medium text-white tracking-tight">{completionPercentage === 100 ? 'Full' : `${completedPods}`}</span>
            {completionPercentage !== 100 && <span className="text-[10px] font-bold text-neutral-600 tracking-widest mt-1 uppercase">Taken</span>}
          </div>
        </motion.div>

        {/* Functional List of Protocol Pods */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full mt-10 px-4 flex flex-col gap-3 pb-32"
        >
          {supplements.map(sup => {
             const isCompleted = (Array.isArray(sup.completedDates) ? sup.completedDates : []).some(d => normalizeDay(d) === today);
             return (
               <div 
                 key={sup.id} 
                 onClick={() => toggleCompletion(sup.id)}
                 className={`w-full flex items-center justify-between p-4 rounded-[24px] cursor-pointer transition-all duration-300 border ${
                   isCompleted 
                     ? 'bg-[#f2e8cf] text-black border-[#f2e8cf] shadow-[0_0_20px_rgba(242,232,207,0.1)]' 
                     : 'bg-black/20 text-white border-white/10 hover:border-white/20 hover:bg-black/40 backdrop-blur-md shadow-lg'
                 }`}
               >
                 <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-black/10' : 'bg-white/5'}`}>
                     {isCompleted ? <Check size={18} strokeWidth={3} /> : <Droplet size={16} className="opacity-50" />}
                   </div>
                   <div className="flex flex-col">
                     <span className={`font-semibold text-sm ${isCompleted ? 'text-black' : 'text-white/90'}`}>{sup.name}</span>
                     <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isCompleted ? 'text-black/60' : 'text-neutral-500'}`}>
                       {sup.dose ? `${sup.dose} • ` : ''}{sup.timing}
                     </span>
                   </div>
                 </div>

                 <button 
                   onClick={(e) => { e.stopPropagation(); handleDelete(sup.id); }}
                   className={`p-2 rounded-full transition-colors ${isCompleted ? 'hover:bg-black/10 text-black/40' : 'hover:bg-red-500/10 text-neutral-600 hover:text-red-500'}`}
                 >
                   <X size={16} />
                 </button>
               </div>
             )
          })}
          
          {/* Add Button */}
          <button 
             onClick={() => setIsAdding(true)} 
             className="w-full py-5 rounded-[24px] bg-black/20 backdrop-blur-md shadow-lg border border-white/20 border-dashed flex items-center justify-center hover:bg-black/40 transition-colors gap-3"
           >
             <Plus size={18} className="text-neutral-400" />
             <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Deploy New Pod</span>
          </button>
        </motion.div>

        {/* Add Supplement Modal */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md"
              onClick={() => setIsAdding(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative"
              >
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">New Protocol Pod</h2>
                  <button onClick={() => setIsAdding(false)} className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-white transition-colors bg-white/5 rounded-full">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddSupplement} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Compound Name</label>
                    <input 
                      type="text" 
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Creatine"
                      className="bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#f2e8cf]/50 focus:bg-white/10 transition-all font-medium placeholder:text-neutral-700"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Dosage (Optional)</label>
                    <input 
                      type="text" 
                      value={newDose}
                      onChange={(e) => setNewDose(e.target.value)}
                      placeholder="e.g. 5g"
                      className="bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#f2e8cf]/50 focus:bg-white/10 transition-all font-medium placeholder:text-neutral-700"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1">Timing Protocol</label>
                    <div className="flex flex-wrap gap-2">
                      {TIMING_OPTIONS.map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setNewTiming(time)}
                          className={`px-4 py-2.5 text-[9px] font-black tracking-widest rounded-full transition-all border ${
                            newTiming === time 
                              ? 'bg-[#f2e8cf] text-black border-[#f2e8cf]' 
                              : 'bg-white/5 text-neutral-400 border-transparent hover:bg-white/10'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full mt-4 py-4 bg-[#f2e8cf] text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all shadow-[0_0_20px_rgba(242,232,207,0.2)]"
                  >
                    Deploy Pod
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
