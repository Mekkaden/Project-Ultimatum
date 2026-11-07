"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChevronDown, Trash2, PlayCircle, Trophy, Calendar, ChevronLeft, Timer, Info, X, Target, MessageSquare } from 'lucide-react';
import { calculateOverloadTarget } from '@/lib/overloadAI';
import {
  adjusted1RM,
  latestSessionBestSet,
  pickBestSet,
  setScore,
} from '@/lib/set-metrics';
import { GLOBAL_PROGRESSIONS, PROGRESSION_MOVEMENTS } from '@/lib/progressions';
import { resolveMovementName } from '@/lib/exercise-aliases';
import { LocalNotifications } from '@capacitor/local-notifications';
import { registerPlugin } from '@capacitor/core';
import { globalTimerStore, TimerState } from '@/lib/timerStore';
import GlobalTimerBadge from '@/components/GlobalTimerBadge';
import { useHardwareBack } from '@/lib/useHardwareBack';
import { findGifId } from '@/lib/gifMatcher';
import { getExerciseNotes, type ExerciseNote } from '@/lib/exercise-notes';
import ExerciseNoteModal from '@/components/ExerciseNoteModal';

// Both frames of the "GIF" are static jpgs on jsDelivr. They are requested
// eagerly as soon as the exercise is known and swapped on a timer, so opening
// the panel never shows an empty box.
const gifFrameUrl = (exerciseId: string, frame: number) =>
  `https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${exerciseId}/${frame}.jpg`;

// Tracks whether both frames have decoded, so callers can hold back layout
// until there is something to show (prevents the container popping open).
function useGifPreload(exerciseId: string | null | undefined, enabled: boolean) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!exerciseId || !enabled) {
      setReady(false);
      return;
    }

    let cancelled = false;
    setReady(false);

    const load = (url: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => resolve();
        img.onerror = () => resolve(); // still resolve: never block the UI on a CDN miss
        img.src = url;
      });

    Promise.all([load(gifFrameUrl(exerciseId, 0)), load(gifFrameUrl(exerciseId, 1))]).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [exerciseId, enabled]);

  return ready;
}

const ExerciseImageAnimator = ({ exerciseId }: { exerciseId: string }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev === 0 ? 1 : 0));
    }, 1000); // 1s per frame
    return () => clearInterval(interval);
  }, []);

  return (
    <img
      src={gifFrameUrl(exerciseId, frame)}
      alt="Exercise form"
      className="w-full h-auto max-h-[320px] object-contain scale-[1.05]"
      decoding="async"
      draggable={false}
    />
  );
};




interface WorkoutTrackerProps {
  exercise?: {
    prescribedEquipment?: string;
    slotName?: string;
    name?: string;
    videoUrl?: string;
    targetRIR?: string;
    isCustom?: boolean;
  };
  onClose?: () => void;
  campaignId?: string;
}

interface WorkoutSet {
  id: string;
  date: string;
  weight: number;
  reps: number;
  rir?: number | string;
  unit: string;
  timestamp: number;
}

export default function WorkoutTracker({ exercise, onClose, campaignId }: WorkoutTrackerProps) {
  const [showCalculator, setShowCalculator] = useState(false);
  useHardwareBack(showCalculator, () => setShowCalculator(false));
  const [showOverloadModal, setShowOverloadModal] = useState(false);
  useHardwareBack(showOverloadModal, () => setShowOverloadModal(false));
  // Notes open only from the header icon, for the exercise on screen. Moving to
  // another exercise closes the sheet, so it never appears on its own.
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteVersion, setNoteVersion] = useState(0);
  const [activeSet, setActiveSet] = useState(1);
  const [weight, setWeight] = useState<number | string>(0);
  const [reps, setReps] = useState<number | string>(0);
  const [rir, setRir] = useState<number | string>("");
  const [unit, setUnit] = useState("KG");
  const [history, setHistory] = useState<WorkoutSet[]>([]);
  const [activeTab, setActiveTab] = useState("TRACK");
  const [currentDate, setCurrentDate] = useState("");
  const [calendarDate, setCalendarDate] = useState("");
  const [showWarmup, setShowWarmup] = useState(false);
  const [warmupWeight, setWarmupWeight] = useState<number | "">("");
  
  // Graph states
  const [graphMetric, setGraphMetric] = useState<"Estimated 1RM" | "Volume" | "Max Weight" | "Total Reps">("Estimated 1RM");
  const [graphTimeRange, setGraphTimeRange] = useState<"1m" | "3m" | "6m" | "1y" | "all">("1m");

  // Calculator states
  const [show1RMInfo, setShow1RMInfo] = useState(false);
  const [calcWeight, setCalcWeight] = useState<number | "">(0);
  const [calcReps, setCalcReps] = useState<number | "">(0);
  
  // GIF states
  const [showGif, setShowGif] = useState(false);

  const prescribedEquipment = exercise?.prescribedEquipment;
  // Campaigns label a slot with the movement, the training intent, or a
  // progression key; all three resolve to the same catalogue movement.
  const canonicalMovement =
    resolveMovementName(prescribedEquipment, exercise?.slotName, exercise?.name) ?? prescribedEquipment ?? "";
  const progressionKey =
    prescribedEquipment && GLOBAL_PROGRESSIONS[prescribedEquipment]
      ? prescribedEquipment
      : Object.entries(PROGRESSION_MOVEMENTS).find(([, movement]) => movement === canonicalMovement)?.[0] ?? null;
  const progData = progressionKey ? GLOBAL_PROGRESSIONS[progressionKey] : null;

  // --- Warmup Calculator Logic ---
  const COMPOUND_KEYWORDS = [
    "squat", "bench", "deadlift", "incline bench", "incline press",
  ];

  const isCompoundExercise = (name: string): boolean => {
    const lower = (name || "").toLowerCase();
    return COMPOUND_KEYWORDS.some((kw) => lower.includes(kw));
  };

  function checkRirMatch(setIndex: number, rirValue: number | string | undefined): boolean {
    if (rirValue === "" || rirValue === undefined) return false;
    const target = exercise?.targetRIR;
    if (!target) return false;
    
    const rirNum = parseFloat(String(rirValue));
    if (isNaN(rirNum)) return false;

    let activePart = target;
    
    if (target.includes("S1:")) {
      const parts = target.split(',');
      const setNum = setIndex + 1;
      const matchedPart = parts.find(p => {
        const match = p.match(/S(\d+)(?:-(\d+))?:/);
        if (match) {
          const start = parseInt(match[1]);
          const end = match[2] ? parseInt(match[2]) : start;
          return setNum >= start && setNum <= end;
        }
        return false;
      });
      if (matchedPart) activePart = matchedPart;
    }
    
    const numMatch = activePart.match(/(\d+(?:\.\d+)?)(?:-(\d+(?:\.\d+)?))?/);
    if (numMatch) {
      const val1 = parseFloat(numMatch[1]);
      const val2 = numMatch[2] ? parseFloat(numMatch[2]) : val1;
      const min = Math.min(val1, val2);
      const max = Math.max(val1, val2);
      return rirNum >= min && rirNum <= max;
    }
    
    return false;
  }

  const getWarmupSets = (workingWeight: number, isCompound: boolean, u: string) => {
    const round = (w: number) => {
      const step = u === "LBS" ? 5 : 2.5;
      return Math.round(w / step) * step;
    };
    if (isCompound) {
      return [
        { label: "W1", pct: 25, reps: 10, weight: round(workingWeight * 0.25) },
        { label: "W2", pct: 50, reps: 10, weight: round(workingWeight * 0.50) },
        { label: "W3", pct: 75, reps: 3,  weight: round(workingWeight * 0.75) },
        { label: "W4", pct: 85, reps: 1,  weight: round(workingWeight * 0.85) },
      ];
    }
    return [
      { label: "W1", pct: 50, reps: 8, weight: round(workingWeight * 0.50) },
    ];
  };
  // --- End Warmup Logic ---

  const [selectedTierIndex, setSelectedTierIndex] = useState(0);

  const exerciseName = progData
    ? progData.tiers[selectedTierIndex]
    : (exercise ? canonicalMovement : "Incline Press");

  const globalDirective = typeof window !== "undefined" ? localStorage.getItem("ultimatum_directive") : "";
  const isCalisthenics = campaignId?.startsWith("calisthenics") || globalDirective === "Calisthenics";
  const videoHref = (isCalisthenics || progData)
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName ?? "")}`
    : (exercise?.videoUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName ?? "")}`);
  const rawExerciseName = exerciseName ?? "";
  const equipmentName = canonicalMovement;

  // Resolve the GIF id: equipment name first, then the descriptive slot/name.
  // findGifId guarantees a valid id (curated map -> full DB fallback), so we
  // never render a 404 frame for a known movement. Custom exercises are user
  // named, so a fuzzy match would show an unrelated movement: no form guide.
  const exerciseId = exercise?.isCustom
    ? null
    : findGifId(equipmentName) ?? findGifId(rawExerciseName);

  // Warm the form frames as soon as this exercise's tracker is on screen, but
  // only after the user has opened the panel once for it. That keeps the first
  // reveal smooth without downloading two ~70KB jpgs for everyone who never
  // taps "Form". The panel itself still awaits `gifReady` before animating in.
  const [gifOpenedOnce, setGifOpenedOnce] = useState(false);
  const gifReady = useGifPreload(exerciseId, !isCalisthenics && (showGif || gifOpenedOnce));

  useEffect(() => {
    if (showGif) setGifOpenedOnce(true);
  }, [showGif]);

  useEffect(function() {
    if (progData) {
      const savedTierKey = "ultimatum_tier_" + progData.id;
      const saved = localStorage.getItem(savedTierKey);
      if (saved !== null) {
        setSelectedTierIndex(parseInt(saved, 10));
      }
    }
  }, [progData]);

  const handleTierChange = function(e: React.ChangeEvent<HTMLSelectElement>) {
    const newIdx = parseInt(e.target.value, 10);
    setSelectedTierIndex(newIdx);
    if (progData) {
      localStorage.setItem("ultimatum_tier_" + progData.id, newIdx.toString());
    }
  };

  useEffect(function() {
    // Set Live Date on mount
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setCalendarDate(yyyy + "-" + mm + "-" + dd);

    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long' };
    setCurrentDate(today.toLocaleDateString('en-US', options).toUpperCase());

    // Pre-fill calculator with last set if available
    const key = "ultimatum_history_" + (exerciseName ?? "Incline Press").replace(/\s+/g, '_').toLowerCase();
    const savedData = localStorage.getItem(key);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const lastSet = parsed[parsed.length - 1];
          setCalcWeight(lastSet.weight || 0);
          setCalcReps(lastSet.reps || 0);
        }
      } catch (e) {}
    }
    // Foreground service is now handled by the parent track page
  }, []);

  useEffect(() => {
    // A notes sheet opened for one exercise must not stay open over the next.
    setNoteOpen(false);
  }, [exerciseName]);

  useEffect(function() {
    // Load History
    const key = "ultimatum_history_" + (exerciseName ?? "Incline Press").replace(/\s+/g, '_').toLowerCase();
    const savedData = localStorage.getItem(key);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
          
          // Pre-fill from the best WORKING set. Warm-ups are excluded so a
          // heavy single or a light warm-up never becomes the suggested load.
          if (parsed.length > 0) {
            const bestSet = pickBestSet(parsed);
            if (bestSet) {
              setWeight(bestSet.weight);
              setReps(bestSet.reps);
              if (bestSet.rir !== undefined) setRir(bestSet.rir);
              if (bestSet.unit) setUnit(bestSet.unit);
            }
          }
        } else {
          // Corrupt/legacy data — discard rather than wrapping in array
          console.warn("Discarding non-array history entry for", key);
          setHistory([]);
        }
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, [exerciseName]);

  // Only the newest note is read here, to light the header icon's dot. The
  // notes themselves are shown in the modal and nowhere else.
  const exerciseNotes: ExerciseNote[] = useMemo(() => {
    void noteVersion;
    return getExerciseNotes(exerciseName);
  }, [exerciseName, noteVersion]);
  const exerciseNote: ExerciseNote | null = exerciseNotes.length > 0 ? exerciseNotes[0] : null;

  function refreshNote() {
    setNoteVersion((version) => version + 1);
  }

  function handleLogSet() {
    const w = parseFloat(weight as any);
    const r = parseInt(reps as any);
    // Weight 0 is a valid, meaningful entry: it is a bodyweight or band set.
    // Requiring weight > 0 made every unweighted set impossible to log, which
    // in turn made bodyweight progression and its trophy unreachable.
    if (!isFinite(w) || w < 0 || !isFinite(r) || r <= 0) return;
    
    const key = "ultimatum_history_" + (exerciseName ?? "Incline Press").replace(/\s+/g, '_').toLowerCase();

    const newSet: WorkoutSet = {
      id: "set-" + Date.now(),
      date: currentDate,
      weight: parseFloat(String(weight)),
      reps: parseInt(String(reps)),
      unit: unit,
      timestamp: Date.now(),
    };
    
    if (rir !== "") {
      newSet.rir = parseFloat(String(rir));
    }
    
    setHistory(function(prev) {
      const newHistory = prev.concat(newSet as any);
      localStorage.setItem(key, JSON.stringify(newHistory));
      return newHistory;
    });
    setActiveSet(function(prev) { return prev + 1; });
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newVal = e.target.value;
    setCalendarDate(newVal);
    if (newVal) {
      const parts = newVal.split('-');
      const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long' };
      setCurrentDate(dateObj.toLocaleDateString('en-US', options).toUpperCase());
    }
  }

  function clearInputs() {
    setWeight("");
    setReps("");
    setRir("");
  }

  function handleDeleteSet(idToDelete: string) {
    if (!idToDelete) return;
    const key = "ultimatum_history_" + (exerciseName ?? "Incline Press").replace(/\s+/g, '_').toLowerCase();
    setHistory(function(prev) {
      const newHistory = prev.filter(function(item) {
        return item.id !== idToDelete;
      });
      localStorage.setItem(key, JSON.stringify(newHistory));
      return newHistory;
    });
  }

  function checkIfPR(item: WorkoutSet, allHistory: WorkoutSet[]) {
    // One shared RIR-adjusted estimate.

    const itemWeight = Number(item.weight) || 0;
    // Unweighted sets (bodyweight, bands) cannot be ranked by estimated 1RM:
    // every one of them scores zero, so a single weighted set would beat them
    // forever. They are scored on reps within their own group.
    const isUnweighted = itemWeight <= 0;

    // Only sets logged BEFORE this exercise's current position are eligible to
    // break a record. Without this, an empty or single-set history makes the
    // first set ever logged a "best of all time" trophy, including warm-ups.
    const previousSets = allHistory.filter((h) => h.id !== item.id);

    const sameKind = previousSets.filter((h) =>
      isUnweighted ? (Number(h.weight) || 0) <= 0 : (Number(h.weight) || 0) > 0,
    );

    // Nothing to beat yet: no trophy on the first ever performance.
    if (sameKind.length === 0) return false;

    const score = (h: WorkoutSet) =>
      isUnweighted ? Number(h.reps) || 0 : setScore(h);

    const currentScore = score(item);
    const bestSoFar = Math.max(...sameKind.map(score));

    // Not a record unless it strictly matches or exceeds the previous best.
    if (currentScore < bestSoFar - 1e-9) return false;

    // Ties belong to the EARLIEST set that achieved them, so one trophy marks
    // the set that set the record no matter how the array is ordered. Sets
    // logged later that only equal it must not claim it too.
    const itemTime = Number(item.timestamp) || 0;
    const earlierEqual = sameKind.filter(
      (h) => Math.abs(score(h) - currentScore) < 1e-9 && (Number(h.timestamp) || 0) < itemTime,
    );
    return earlierEqual.length === 0;
  }

  // Calculate chart data for GRAPH
  interface ChartPoint { date: string; value: number; }
  const chartData: ChartPoint[] = [];
  
  if (history.length > 0) {
    const now = Date.now();
    let timeLimit = 0;
    if (graphTimeRange === "1m") timeLimit = now - 30 * 24 * 60 * 60 * 1000;
    else if (graphTimeRange === "3m") timeLimit = now - 90 * 24 * 60 * 60 * 1000;
    else if (graphTimeRange === "6m") timeLimit = now - 180 * 24 * 60 * 60 * 1000;
    else if (graphTimeRange === "1y") timeLimit = now - 365 * 24 * 60 * 60 * 1000;

    // Filter history based on time range
    const filteredHistory = history.filter((item) => item.timestamp >= timeLimit);

    // Group by date and calculate metric per date
    const dailyData: Record<string, number> = {};
    const dateLabels: Record<string, string> = {}; // Keep nice formatted dates
    const dateTimestamps: Record<string, number> = {}; // Keep track for sorting
    
    for (let i = 0; i < filteredHistory.length; i++) {
      const item = filteredHistory[i];
      const dateParts = item.date.split(",");
      // E.g. "FRIDAY, AUG 20, 2026" -> "Aug 20"
      const shortDate = dateParts.length > 1 ? dateParts[1].trim() : item.date;
      
      const key = item.date; // Use full date as unique key
      dateLabels[key] = shortDate;
      dateTimestamps[key] = item.timestamp;

      if (!dailyData[key]) dailyData[key] = 0;

      if (graphMetric === "Estimated 1RM") {
        const estimated = adjusted1RM(item.weight, item.reps, item.rir);
        if (isFinite(estimated) && estimated > dailyData[key]) {
          dailyData[key] = estimated;
        }
      } else if (graphMetric === "Volume") {
        dailyData[key] += (item.weight * item.reps);
      } else if (graphMetric === "Max Weight") {
        if (item.weight > dailyData[key]) {
          dailyData[key] = item.weight;
        }
      } else if (graphMetric === "Total Reps") {
        dailyData[key] += item.reps;
      }
    }

    const uniqueKeys = Object.keys(dailyData).sort((a, b) => dateTimestamps[a] - dateTimestamps[b]);
    
    for (let i = 0; i < uniqueKeys.length; i++) {
      chartData.push({
        date: dateLabels[uniqueKeys[i]],
        value: Math.round(dailyData[uniqueKeys[i]])
      });
    }
  }

  // Filter today's sets for TRACK
  const todaysSets = history.filter(function(item) {
    return item.date === currentDate;
  });

  // Group by date for HISTORY
  const historyByDate: Record<string, WorkoutSet[]> = {};
  for (let i = 0; i < history.length; i++) {
    const item = history[i];
    if (!historyByDate[item.date]) {
      historyByDate[item.date] = [];
    }
    historyByDate[item.date].push(item);
  }
  const sortedDates = Object.keys(historyByDate).sort(function(a, b) {
    const maxA = Math.max(...historyByDate[a].map(function(item) { return item.timestamp || 0; }));
    const maxB = Math.max(...historyByDate[b].map(function(item) { return item.timestamp || 0; }));
    return maxB - maxA;
  });

  return (
    <div className="w-full bg-tracker-bg flex flex-col h-full overflow-hidden">
      
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-tracker-border bg-tracker-bg/80 flex flex-col justify-between shrink-0">
        <div className="flex items-center justify-between w-full gap-3">
          
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            {onClose && (
              <button onClick={onClose} className="text-tracker-text-soft hover:text-tracker-text-bold transition-colors shrink-0">
                <ChevronLeft size={24} />
              </button>
            )}
            <h2 className="text-base font-black uppercase tracking-wider text-tracker-text-bold truncate leading-tight">
              {exerciseName}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <GlobalTimerBadge 
              onClick={() => globalTimerStore.openModal()} 
              idleIconSize={20} 
            />

            <div className="relative flex items-center justify-center w-6 h-6">
              <input 
                type="date"
                value={calendarDate}
                onChange={handleDateChange}
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
              />
              <Calendar size={20} className="text-tracker-text-soft hover:text-tracker-text-bold transition-colors" />
            </div>
            
            <button
              onClick={() => setNoteOpen(true)}
              className={`relative transition-colors flex items-center justify-center ${
                exerciseNote ? "text-tracker-accent" : "text-tracker-text-soft hover:text-tracker-text-bold"
              }`}
              title={exerciseNote ? "View notes" : "Add note"}
            >
              <MessageSquare size={20} />
              {exerciseNote && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-tracker-accent" />
              )}
            </button>

            <button 
              onClick={() => setShowCalculator(true)}
              className="text-tracker-text-soft hover:text-tracker-text-bold transition-colors flex items-center justify-center"
            >
              <Info size={20} />
            </button>
            
            <button 
              onClick={() => setUnit(unit === "KG" ? "LBS" : "KG")}
              className="ml-1 px-2.5 py-1 bg-white text-black rounded text-[10px] font-black tracking-widest transition-transform active:scale-95 shadow-sm"
            >
              {unit}
            </button>
          </div>
        </div>

        {/* Notes stay out of the logging view on purpose: the header comment
            icon is the only way in, and the notes appear only in the modal it
            opens. The icon keeps a small dot when a note exists. */}

        {/* Render inline GIF if active. The wrapper animates its height and
            clips the artwork, so the panel grows smoothly instead of popping.
            The light placeholder is gone — the frame is preloaded, and a dark
            surface is used while it finishes decoding. */}
        <AnimatePresence initial={false}>
          {exerciseId && showGif && !isCalisthenics && (
            <motion.div
              key="gif-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-full overflow-hidden"
            >
              <div className="mt-4 mb-1 w-full rounded-2xl overflow-hidden bg-black flex justify-center items-center relative group shadow-2xl border border-tracker-border/60">
                <button
                  onClick={() => setShowGif(false)}
                  className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white/60 hover:text-white shadow-sm transition-all active:scale-95 z-20 flex items-center justify-center"
                >
                  <X size={16} strokeWidth={3} />
                </button>
                {gifReady ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="w-full flex justify-center"
                  >
                    <ExerciseImageAnimator exerciseId={exerciseId} />
                  </motion.div>
                ) : (
                  <div className="w-full h-[220px] flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-tracker-text-soft/30 border-t-tracker-text-soft animate-spin" />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 flex items-center justify-center gap-2 w-full">
          {exerciseId && !isCalisthenics && (
            <button
              onClick={() => setShowGif(!showGif)}
              className={`flex-[1] flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] font-black transition-all duration-200 ${
                showGif 
                  ? 'border-tracker-accent bg-tracker-accent text-tracker-text-bold' 
                  : 'border-tracker-accent/30 bg-tracker-accent/10 text-tracker-accent hover:bg-tracker-accent hover:text-tracker-text-bold hover:border-tracker-accent'
              }`}
            >
              <PlayCircle size={14} />
              {showGif ? 'Hide' : 'Form'}
            </button>
          )}
          
          {(exercise?.videoUrl || videoHref) && (
            <a
              href={exercise?.videoUrl || videoHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl border border-tracker-accent/30 bg-tracker-accent/10 text-tracker-accent hover:bg-tracker-accent hover:text-tracker-text-bold hover:border-tracker-accent transition-all duration-200 font-black text-xs uppercase tracking-[0.2em]"
            >
              <PlayCircle size={14} />
              Watch Video
            </a>
          )}
        </div>

        {progData && (
          <div className="mt-3 flex items-center justify-between w-full gap-2">
            <div className="text-[10px] font-bold tracking-widest text-tracker-text-soft uppercase truncate flex-1">
              {canonicalMovement}
            </div>
            <div className="relative shrink-0 w-[160px]">
              <select
                value={selectedTierIndex}
                onChange={handleTierChange}
                className="w-full appearance-none bg-tracker-card border border-tracker-border text-tracker-text-bold font-black text-xs p-1.5 pl-3 pr-7 truncate rounded-lg outline-none focus:border-tracker-accent transition-colors uppercase tracking-wider"
              >
                {progData.tiers.map((tier, idx) => (
                  <option key={idx} value={idx}>
                    T{idx + 1}: {tier}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-tracker-text-soft">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="flex border-b border-tracker-border bg-tracker-bg shrink-0">
        <button 
          onClick={function() { setActiveTab("TRACK"); }}
          className={"flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 " + (activeTab === "TRACK" ? "border-tracker-accent text-tracker-text-bold bg-tracker-card/50" : "border-transparent text-tracker-text-soft hover:bg-tracker-card/30 hover:text-tracker-text-bold")}
        >
          Track
        </button>
        <button 
          onClick={function() { setActiveTab("HISTORY"); }}
          className={"flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 " + (activeTab === "HISTORY" ? "border-tracker-accent text-tracker-text-bold bg-tracker-card/50" : "border-transparent text-tracker-text-soft hover:bg-tracker-card/30 hover:text-tracker-text-bold")}
        >
          History
        </button>
        <button 
          onClick={function() { setActiveTab("GRAPH"); }}
          className={"flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 " + (activeTab === "GRAPH" ? "border-tracker-accent text-tracker-text-bold bg-tracker-card/50" : "border-transparent text-tracker-text-soft hover:bg-tracker-card/30 hover:text-tracker-text-bold")}
        >
          Graph
        </button>
      </div>

      {/* ESTIMATED 1RM CALCULATOR OVERLAY */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-tracker-bg flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-tracker-border/50 bg-tracker-bg mt-10 md:mt-0 shrink-0">
              <div className="flex items-center gap-2.5">
                <button onClick={() => setShowCalculator(false)} className="w-9 h-9 rounded-full bg-tracker-card flex items-center justify-center text-tracker-text-soft hover:text-white transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <h3 className="text-white text-sm font-black uppercase tracking-[0.18em]">1RM Calculator</h3>
              </div>
              <button onClick={() => setShow1RMInfo(!show1RMInfo)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${show1RMInfo ? 'bg-tracker-accent text-white' : 'bg-tracker-card text-tracker-text-soft hover:text-white'}`}>
                <Info size={16} />
              </button>
            </div>

            {/* Info Panel */}
            <AnimatePresence>
              {show1RMInfo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-tracker-card/30 shrink-0"
                >
                  <div className="px-4 py-3 text-[11px] leading-relaxed text-tracker-text-soft font-medium">
                    <p className="mb-2"><strong className="text-white">1 Rep Max (1RM)</strong> is the most you can lift for one clean rep. Estimating it from a working set is safer than testing it.</p>
                    <p className="text-tracker-accent tracking-widest uppercase text-[9px] font-bold mt-2 mb-1">Why it matters</p>
                    <p>Programs set working loads as percentages of 1RM (e.g. 8 reps at 70%), so this number keeps you lifting the right weight.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inputs: label above, full-width stepper row below. Labels set
                beside the steppers squeezed the number into a narrow column. */}
            <div className="px-4 py-5 border-b border-tracker-border/50 shrink-0 bg-tracker-bg">
              <div className="w-full max-w-md mx-auto flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-tracker-text-soft">Weight ({unit.toLowerCase()})</span>
                  <div className="flex items-center gap-3 w-full">
                    <button
                      onClick={() => setCalcWeight(Math.max(0, (parseFloat(String(calcWeight)) || 0) - 2.5))}
                      className="w-14 h-14 shrink-0 text-2xl font-light text-tracker-text-soft bg-tracker-card hover:bg-neutral-800 hover:text-white active:bg-neutral-700 rounded-2xl flex items-center justify-center transition-all"
                    >−</button>
                    <input
                      type="number"
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                      className="flex-1 min-w-0 h-14 bg-transparent text-white font-black text-4xl text-center outline-none border-b-2 border-tracker-border/50 focus:border-tracker-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors"
                    />
                    <button
                      onClick={() => setCalcWeight((parseFloat(String(calcWeight)) || 0) + 2.5)}
                      className="w-14 h-14 shrink-0 text-2xl font-light text-tracker-text-soft bg-tracker-card hover:bg-neutral-800 hover:text-white active:bg-neutral-700 rounded-2xl flex items-center justify-center transition-all"
                    >+</button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-tracker-text-soft">Reps</span>
                  <div className="flex items-center gap-3 w-full">
                    <button
                      onClick={() => setCalcReps(Math.max(1, (parseInt(String(calcReps)) || 1) - 1))}
                      className="w-14 h-14 shrink-0 text-2xl font-light text-tracker-text-soft bg-tracker-card hover:bg-neutral-800 hover:text-white active:bg-neutral-700 rounded-2xl flex items-center justify-center transition-all"
                    >−</button>
                    <input
                      type="number"
                      value={calcReps}
                      onChange={(e) => setCalcReps(e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                      className="flex-1 min-w-0 h-14 bg-transparent text-white font-black text-4xl text-center outline-none border-b-2 border-tracker-border/50 focus:border-tracker-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors"
                    />
                    <button
                      onClick={() => setCalcReps((parseInt(String(calcReps)) || 1) + 1)}
                      className="w-14 h-14 shrink-0 text-2xl font-light text-tracker-text-soft bg-tracker-card hover:bg-neutral-800 hover:text-white active:bg-neutral-700 rounded-2xl flex items-center justify-center transition-all"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results: the RM range lifters actually program with fits on one
                screen as a card list; no scrolling needed. */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-tracker-bg">
              <div className="max-w-md mx-auto px-3 py-2 space-y-1">
              {(() => {
                const w = parseFloat(String(calcWeight)) || 0;
                const r = parseInt(String(calcReps)) || 0;
                
                // Using Epley Formula
                const epley1RM = r > 0 ? w * (1 + (r / 30)) : 0;
                
                return Array.from({ length: 10 }).map((_, i) => {
                  const rmTarget = i + 1;
                  let rmWeight = 0;
                  if (epley1RM > 0) {
                    if (rmTarget === 1) rmWeight = epley1RM;
                    else rmWeight = epley1RM / (1 + (rmTarget / 30));
                  }
                  const pct = epley1RM > 0 ? (rmWeight / epley1RM) * 100 : 0;
                  const roundedWeight = Math.round(rmWeight * 2) / 2;
                  const isTop = rmTarget === 1;

                  return (
                    <div
                      key={rmTarget}
                      className={`flex items-center justify-between gap-3 px-4 py-2 rounded-xl ${isTop ? "bg-tracker-card border border-tracker-accent/40" : ""}`}
                    >
                      <span className={`font-black text-sm uppercase tracking-[0.14em] w-14 shrink-0 ${isTop ? "text-tracker-accent" : "text-tracker-text-soft"}`}>
                        {rmTarget} RM
                      </span>
                      <span className="flex-1 flex items-baseline justify-end gap-1.5 tabular-nums">
                        <span className={`font-black ${isTop ? "text-xl text-white" : "text-base text-tracker-text-bold"}`}>
                          {roundedWeight.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-tracker-text-soft uppercase tracking-widest font-bold">{unit.toLowerCase()}</span>
                      </span>
                      <span className="w-11 text-right text-[11px] text-tracker-text-soft font-bold tabular-nums shrink-0">
                        {epley1RM > 0 ? `${pct.toFixed(0)}%` : "—"}
                      </span>
                    </div>
                  );
                });
              })()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-tracker-bg/20 relative">

        <div className="p-4 md:p-6">
          {/* TRACK TAB */}
          {activeTab === "TRACK" && (
            <motion.div 
              key="track"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* WARMUP & TARGET ROW */}
              <div className="flex items-start gap-2 mb-4">
                {/* WARMUP CALCULATOR */}
                {!isCalisthenics && (
                  <div className="flex-1 border border-tracker-border rounded-xl overflow-hidden">
                  <button
                  onClick={() => {
                    if (!showWarmup && warmupWeight === "") {
                      const w = parseFloat(String(weight));
                      setWarmupWeight(isFinite(w) && w > 0 ? w : "");
                    }
                    setShowWarmup((v) => !v);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-tracker-card hover:bg-neutral-800 transition-colors"
                >
                  <span className="text-[11px] font-black uppercase tracking-widest text-neutral-300">Warmup Sets</span>
                  <span className={`text-tracker-text-soft text-sm transition-transform duration-200 ${showWarmup ? "rotate-180" : ""}`}>▾</span>
                </button>

                {showWarmup && (() => {
                  const ww = parseFloat(String(warmupWeight));
                  const compound = isCompoundExercise(String(exerciseName));
                  const sets = (isFinite(ww) && ww > 0) ? getWarmupSets(ww, compound, unit) : [];
                  const hasWeight = isFinite(ww) && ww > 0;
                  return (
                    <div className="bg-tracker-bg">

                      {/* ── WEIGHT ENTRY SECTION ── */}
                      <div className="flex flex-col items-center px-6 pt-6 pb-5 border-b border-tracker-border/60">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-tracker-text-soft mb-4">
                          First Working Set Weight
                        </p>

                        {/* Centered ± stepper */}
                        <div className="flex items-center justify-center gap-4 w-full">
                          <button
                            onClick={() => setWarmupWeight(Math.max(0, (parseFloat(String(warmupWeight)) || 0) - 2.5))}
                            className="w-12 h-12 bg-neutral-800 active:bg-neutral-700 rounded-xl flex items-center justify-center text-2xl font-bold text-tracker-text-bold transition-colors shrink-0"
                          >−</button>

                          <div className="flex-1 text-center">
                            <input
                              type="number"
                              value={warmupWeight}
                              onChange={(e) => setWarmupWeight(e.target.value === "" ? "" : parseFloat(e.target.value) || "")}
                              placeholder="0"
                              className="w-full bg-transparent text-4xl font-black text-tracker-text-bold text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-[10px] text-tracker-text-soft font-bold uppercase tracking-widest">{unit}</span>
                          </div>

                          <button
                            onClick={() => setWarmupWeight((parseFloat(String(warmupWeight)) || 0) + 2.5)}
                            className="w-12 h-12 bg-neutral-800 active:bg-neutral-700 rounded-xl flex items-center justify-center text-2xl font-bold text-tracker-text-bold transition-colors shrink-0"
                          >+</button>
                        </div>
                      </div>

                      {/* ── WARMUP TABLE ── */}
                      <div className="px-4 py-3">
                        {hasWeight ? (
                          <div>
                            <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-bold mb-2">
                              {compound ? "Compound" : "Isolation"} warmup protocol
                            </p>
                            {sets.map((s, i) => (
                              <div key={s.label} className={`flex items-center py-3 ${i < sets.length - 1 ? "border-b border-tracker-border/40" : ""}`}>
                                {/* Set label */}
                                <span className="text-[10px] font-black text-tracker-text-soft w-6 shrink-0">{s.label}</span>
                                {/* Progress bar */}
                                <div className="flex-1 mx-3 h-[3px] bg-neutral-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-tracker-accent rounded-full" style={{ width: `${s.pct}%` }} />
                                </div>
                                {/* Percentage */}
                                <span className="text-[10px] text-tracker-text-soft font-bold w-8 text-right shrink-0">{s.pct}%</span>
                                {/* Weight */}
                                <span className="text-tracker-text-bold font-black text-lg w-20 text-right shrink-0">
                                  {s.weight}
                                  <span className="text-[9px] text-tracker-text-soft ml-0.5 font-normal">{unit.toLowerCase()}</span>
                                </span>
                                {/* Reps */}
                                <span className="text-tracker-text-soft text-[11px] font-bold ml-2 w-8 text-right shrink-0">×{s.reps}</span>
                              </div>
                            ))}
                            <p className="text-[9px] text-neutral-600 text-center pt-2 pb-1 uppercase tracking-widest font-bold">
                              ↓ then your working {compound ? "sets" : "set"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-neutral-600 text-center py-3 px-4">
                            Enter the weight you plan to use for your first working set to generate a warmup protocol
                          </p>
                        )}
                      </div>

                    </div>
                  );
                })()}
                  </div>
                )}

                <button 
                  onClick={() => setShowOverloadModal(true)}
                  className="shrink-0 flex items-center justify-center w-[46px] h-[46px] bg-tracker-card hover:bg-neutral-800 transition-colors border border-tracker-border rounded-xl text-tracker-accent"
                  title="View AI Target"
                >
                  <Target size={16} />
                </button>
              </div>





              {/* Stepper Inputs */}
              <div className="space-y-4">
                {/* Weight */}
                <div>
                  <div className="border-b-2 border-tracker-accent pb-1 mb-3">
                    <span className="text-[11px] font-black text-tracker-text-bold uppercase tracking-widest">WEIGHT ({unit.toLowerCase()})</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <button 
                      onClick={function() { setWeight(Math.max(0, (parseFloat(String(weight)) || 0) - 2.5)); }}
                      className="w-12 h-12 md:w-16 shrink-0 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold text-tracker-text-bold transition-colors"
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      value={weight}
                      onChange={function(e) { 
                        const val = e.target.value;
                        setWeight(val === "" ? "" : (parseFloat(val) || 0)); 
                      }}
                      className="flex-1 w-full min-w-0 h-12 bg-transparent text-2xl md:text-3xl font-black text-tracker-text-bold text-center outline-none border-b border-tracker-border focus:border-tracker-accent transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      onClick={function() { setWeight((parseFloat(String(weight)) || 0) + 2.5); }}
                      className="w-12 h-12 md:w-16 shrink-0 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold text-tracker-text-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Reps & RIR Flex Container */}
                <div className="flex gap-4">
                  {/* Reps */}
                  <div className="flex-[4]">
                    <div className="border-b-2 border-tracker-accent pb-1 mb-3 mt-4">
                      <span className="text-[11px] font-black text-tracker-text-bold uppercase tracking-widest">REPS</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button 
                        onClick={function() { setReps(Math.max(0, (parseInt(String(reps)) || 0) - 1)); }}
                        className="w-10 h-10 md:w-12 shrink-0 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-xl font-bold text-tracker-text-bold transition-colors"
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        value={reps}
                        onChange={function(e) { 
                          const val = e.target.value;
                          setReps(val === "" ? "" : (parseInt(val) || 0)); 
                        }}
                        className="flex-1 w-full min-w-0 h-10 bg-transparent text-xl md:text-2xl font-black text-tracker-text-bold text-center outline-none border-b border-tracker-border focus:border-tracker-accent transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button 
                        onClick={function() { setReps((parseInt(String(reps)) || 0) + 1); }}
                        className="w-10 h-10 md:w-12 shrink-0 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-xl font-bold text-tracker-text-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* RIR (Reps In Reserve) */}
                  <div className="flex-[3]">
                    <div className="border-b-2 border-tracker-accent pb-1 mb-3 mt-4">
                      <span className="text-[11px] font-black text-tracker-text-bold uppercase tracking-widest">RIR <span className="text-tracker-text-soft lowercase">(opt)</span></span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <button 
                        onClick={function() { setRir(Math.max(0, (parseInt(String(rir)) || 0) - 1)); }}
                        className="w-8 h-10 md:w-10 shrink-0 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-lg font-bold text-tracker-text-bold transition-colors"
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        step="0.5"
                        placeholder="-"
                        value={rir}
                        onChange={function(e) { 
                          const val = e.target.value;
                          setRir(val === "" ? "" : parseFloat(val)); 
                        }}
                        className="flex-1 w-full min-w-0 h-10 bg-transparent text-lg md:text-xl font-black text-tracker-text-bold text-center outline-none border-b border-tracker-border focus:border-tracker-accent transition-colors placeholder:text-neutral-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button 
                        onClick={function() { setRir((parseInt(String(rir)) || 0) + 1); }}
                        className="w-8 h-10 md:w-10 shrink-0 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-lg font-bold text-tracker-text-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleLogSet}
                  disabled={!reps || parseInt(String(reps)) <= 0 || parseFloat(String(weight)) < 0}
                  className="flex-[2] py-4 bg-tracker-accent hover:bg-tracker-accent disabled:bg-neutral-800 disabled:text-tracker-text-soft text-tracker-text-bold rounded-lg text-sm font-black uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  SAVE
                </button>
                <button 
                  onClick={clearInputs}
                  className="flex-1 py-4 bg-transparent border border-tracker-border hover:bg-neutral-800 text-tracker-text-soft hover:text-tracker-text-bold rounded-lg text-sm font-black uppercase tracking-widest transition-colors"
                >
                  CLEAR
                </button>
              </div>

              {/* Today's Logged Sets */}
              {todaysSets.length > 0 && (
                <div className="mt-8 space-y-2">
                  {todaysSets.map(function(item, idx) {
                    const isRecord = checkIfPR(item, history);
                    return (
                      <div key={item.id || ("today-" + idx)} className="flex justify-between items-center py-3 border-b border-tracker-border/50">
                        <div className="flex items-center gap-4">
                          <span className="w-6 h-6 bg-tracker-card text-tracker-text-soft flex items-center justify-center rounded text-xs font-bold">{idx + 1}</span>
                          {isRecord && <Trophy size={14} className="text-[#38bdf8] shrink-0" />}
                          <span className="text-lg font-bold text-tracker-text-bold">{item.weight} <span className="text-xs text-tracker-text-soft">{item.unit.toLowerCase()}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-tracker-text-soft text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-tracker-text-bold text-lg">{item.reps}</span> REPS
                          {item.rir !== undefined && (
                            <>
                              <span className="mx-1 text-neutral-600">•</span>
                              <span className={`text-lg ${checkRirMatch(idx, item.rir) ? 'text-tracker-text-bold' : 'text-tracker-accent'}`}>{item.rir}</span> RIR
                            </>
                          )}
                          {item.id && (
                            <button 
                              onClick={function() { handleDeleteSet(item.id); }}
                              className="w-6 h-6 flex items-center justify-center rounded text-tracker-text-soft hover:text-tracker-accent hover:bg-tracker-accent/10 transition-colors"
                              title="Delete Set"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "HISTORY" && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {sortedDates.length > 0 ? (
                sortedDates.map(function(dateStr) {
                  return (
                    <div key={dateStr} className="space-y-2">
                      <div className="border-b-2 border-tracker-accent pb-1 mb-2">
                        <span className="text-[11px] font-black text-tracker-text-bold uppercase tracking-widest">{dateStr}</span>
                      </div>
                      {historyByDate[dateStr].map(function(item, idx) {
                        const isRecord = checkIfPR(item, history);
                        return (
                          <div key={item.id || (dateStr + "-" + idx)} className="flex justify-between items-center py-2 px-2 hover:bg-white/5 rounded transition-colors">
                            <div className="flex items-center gap-3">
                              {isRecord && <Trophy size={14} className="text-[#38bdf8] shrink-0 ml-2" />}
                              <span className={`text-base font-bold text-tracker-text-bold ${!isRecord ? "pl-4" : ""}`}>{item.weight} <span className="text-[10px] text-tracker-text-soft">{item.unit.toLowerCase()}</span></span>
                            </div>
                            <div className="flex items-center gap-1.5 text-tracker-text-soft text-[10px] font-bold uppercase tracking-widest pr-2">
                              <span className="text-tracker-text-bold text-base">{item.reps}</span> REPS
                              {item.rir !== undefined && (
                                <>
                                  <span className="mx-1 text-neutral-600">•</span>
                                  <span className={`text-base ${checkRirMatch(idx, item.rir) ? 'text-tracker-text-bold' : 'text-tracker-accent'}`}>{item.rir}</span> RIR
                                </>
                              )}
                              {item.id && (
                                <button 
                                  onClick={function() { handleDeleteSet(item.id); }}
                                  className="w-5 h-5 flex items-center justify-center rounded text-neutral-600 hover:text-tracker-accent hover:bg-tracker-accent/10 transition-colors"
                                  title="Delete Set"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <span className="text-xs font-bold text-tracker-text-soft uppercase tracking-widest">No history recorded yet</span>
                </div>
              )}
            </motion.div>
          )}

          {/* GRAPH TAB */}
          {activeTab === "GRAPH" && (
            <motion.div 
              key="graph"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 h-full flex flex-col min-h-[300px]"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-black text-tracker-text-bold uppercase tracking-widest shrink-0">
                  GRAPH:
                </span>
                <div className="relative flex-1">
                  <select
                    value={graphMetric}
                    onChange={(e) => setGraphMetric(e.target.value as any)}
                    className="w-full appearance-none bg-tracker-card border-b border-tracker-border text-tracker-text-bold font-medium text-sm py-1.5 pl-2 rounded-none outline-none focus:border-tracker-accent transition-colors"
                  >
                    <option value="Estimated 1RM">Estimated 1RM</option>
                    <option value="Volume">Volume</option>
                    <option value="Max Weight">Max Weight</option>
                    <option value="Total Reps">Total Reps</option>
                  </select>
                  <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-tracker-text-soft">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Time Range Filters */}
              <div className="flex gap-1 mb-4">
                {(["1m", "3m", "6m", "1y", "all"] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setGraphTimeRange(range)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${graphTimeRange === range ? "bg-neutral-600 text-tracker-text-bold" : "bg-neutral-800 text-tracker-text-soft hover:bg-neutral-700"}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              
              {chartData.length > 1 ? (
                <div className="w-full h-[250px] relative border border-tracker-border bg-tracker-card/50 rounded-lg p-2 outline-none focus:outline-none [&_*]:outline-none [&_*]:focus:outline-none">
                  <ResponsiveContainer width="100%" height="100%" className="focus:outline-none outline-none" style={{ outline: 'none' }}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} style={{ outline: 'none' }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#1f1f1f" vertical={false} />
                      <XAxis dataKey="date" stroke="#404040" tick={{ fill: '#737373', fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis domain={['dataMin - 10', 'dataMax + 10']} stroke="#404040" tick={{ fill: '#737373', fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '10px 14px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#3b82f6', paddingTop: '4px' }}
                        cursor={{ stroke: '#262626', strokeWidth: 1, strokeDasharray: '4 4' }}
                        formatter={function(value) { return [value + (graphMetric !== "Total Reps" ? " " + unit : ""), graphMetric]; }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        dot={{ r: 4, fill: '#0a0a0a', stroke: '#3b82f6', strokeWidth: 2 }} 
                        activeDot={{ r: 6, fill: '#3b82f6', stroke: '#0a0a0a', strokeWidth: 2 }} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="text-center mt-2">
                    <span className="text-[10px] text-tracker-text-soft font-medium">Tap a point on the graph to view more details</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center min-h-[250px]">
                  <span className="text-xs font-bold text-tracker-text-soft uppercase tracking-widest text-center">Log at least two separate days<br/>to generate graph</span>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>

      <ExerciseNoteModal
        key={`${exerciseName}-${noteOpen}`}
        exerciseName={exerciseName}
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        onSaved={refreshNote}
      />

      {/* OVERLOAD TARGET MODAL */}
      <AnimatePresence>
        {showOverloadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-tracker-bg flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-tracker-border/50 bg-tracker-bg mt-10 md:mt-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowOverloadModal(false)} className="w-10 h-10 rounded-full bg-tracker-card flex items-center justify-center text-tracker-text-soft hover:text-white transition-colors">
                  <X size={18} />
                </button>
                <h2 className="text-sm font-black tracking-widest uppercase text-white">Overload Target</h2>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="mb-8">
                <p className="text-xs text-tracker-text-soft mb-2 uppercase tracking-widest font-bold">How it works</p>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Ultimatum uses a strict Double Progression model. Once you hit the top of your rep range for a given weight, your next workout target will increase the weight slightly and drop back to the bottom of the rep range.
                </p>
                <p className="text-[11px] text-tracker-text-soft leading-relaxed mt-3">
                  Best set = highest estimated 1RM (weight adjusted for the reps you left in reserve). The target follows your latest session&apos;s best set.
                </p>
              </div>

              {(() => {
                // Read the last session's best working set from this
                // exercise's history. The old code read progData[0], which is
                // the progression title object, so the target was always empty.
                const lastSet = latestSessionBestSet(history);
                const lastWeight = Number(lastSet?.weight) || 0;
                const lastReps = Number(lastSet?.reps) || 0;
                const lastRir = Number(lastSet?.rir) || 0;
                
                // If there's no data, show empty state
                if (!lastWeight || !lastReps) {
                  return (
                    <div className="rounded-xl border border-tracker-border bg-tracker-card p-5 text-center">
                      <p className="text-sm font-bold text-tracker-text-soft">Log at least one set to generate a target.</p>
                    </div>
                  );
                }

                const target = calculateOverloadTarget(lastWeight, lastReps, lastRir, unit);
                
                return (
                  <div className="rounded-xl border border-tracker-accent/30 bg-tracker-accent/10 p-5">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-tracker-text-soft uppercase tracking-[0.2em] font-bold mb-1">Previous</span>
                        <span className="text-xl font-bold text-neutral-400">{lastWeight}{unit} × {lastReps}</span>
                      </div>
                      <div className="text-tracker-accent text-2xl font-light">→</div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-tracker-accent uppercase tracking-[0.2em] font-bold mb-1">Target</span>
                        <span className="text-2xl font-black text-white">{target.weight}{unit} <span className="text-base text-white/70">× {target.reps}</span></span>
                      </div>
                    </div>

                    <p className="text-xs text-tracker-accent text-center mb-6 font-bold leading-relaxed">
                      {target.message}
                    </p>
                    
                    <button 
                      onClick={() => setShowOverloadModal(false)}
                      className="w-full py-3 rounded-lg bg-tracker-accent text-tracker-bg font-black text-xs uppercase tracking-[0.2em]"
                    >
                      Got it
                    </button>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
