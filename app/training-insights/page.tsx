"use client";

import React, { useState, useEffect } from "react";
import BodyHeatmap from "@/components/BodyHeatmap";
import WeeklySetsChart, { WeeklySetData } from "@/components/WeeklySetsChart";
import ExerciseInsightsList, { ExerciseInsight } from "@/components/ExerciseInsightsList";
import { Muscle, MUSCLE_WEEKLY_TARGETS } from "@/lib/muscleMapping";
import { CATALOGUE } from "@/lib/exercise-catalogue";
import { Camera, Trash2 } from "lucide-react";
import DotField from "@/components/DotField";
import DecryptedText from "@/components/DecryptedText";
import SleepInsightsModule from "@/components/SleepInsightsModule";
import { calcLocalVolumeData, calcLocalChartData, calcLocalRecovery, calcLocalDietAlignment, calcLocalRecordsMatrix, calcLocalInsights, getLocalGoals, TrainingGoal, saveLocalGoal, deleteLocalGoal, MuscleRecovery } from "@/lib/local-analytics";
import { InsightsGuideModal } from "@/components/InsightsGuideModal";
import { Info } from "lucide-react";

const RECOVERY_TONE: Record<MuscleRecovery["status"], {
  card: string; label: string; value: string; title: string; text: string;
}> = {
  "no-data": {
    card: "bg-[#0E0E0E] border border-dashed border-white/10",
    label: "text-white/25",
    value: "text-white/40",
    title: "text-white/40",
    text: "never trained",
  },
  fresh: {
    card: "bg-[#121212] border border-white/5",
    label: "text-white/30",
    value: "text-white/70",
    title: "text-white",
    text: "fresh",
  },
  recovering: {
    card: "bg-[#121212] border border-white/5",
    label: "text-white/30",
    value: "text-white/60",
    title: "text-white",
    text: "recovering",
  },
  ready: {
    card: "bg-emerald-950/10 border border-emerald-900/25",
    label: "text-emerald-500/50",
    value: "text-emerald-400",
    title: "text-emerald-50",
    text: "ready",
  },
  stalled: {
    card: "bg-white/5 border border-white/10",
    label: "text-white/40",
    value: "text-white",
    title: "text-white",
    text: "stalled",
  },
  "under-recovering": {
    card: "bg-rose-950/10 border border-rose-900/30",
    label: "text-rose-500/50",
    value: "text-rose-500",
    title: "text-rose-100",
    text: "under-recovering",
  },
};

export default function TrainingInsightsPage() {
  const [activeTab, setActiveTab] = useState<"volume" | "sets" | "recovery" | "insights" | "photos" | "records" | "goals">("volume");
  const [loading, setLoading] = useState(true);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  
  const [volumeData, setVolumeData] = useState<Record<Muscle, number>>({} as Record<Muscle, number>);
  const [chartData, setChartData] = useState<WeeklySetData[]>([]);
  const [insights, setInsights] = useState<ExerciseInsight[]>([]);
  const [dietAlignment, setDietAlignment] = useState<any>(null);
  const [muscleRecovery, setMuscleRecovery] = useState<Record<string, MuscleRecovery>>({});
  const [cardioMinutes, setCardioMinutes] = useState<number>(0);
  const [cardioTarget, setCardioTarget] = useState<number>(150);
  const [unitLabel, setUnitLabel] = useState<"KG" | "LBS">("KG");

  const [recordsMatrix, setRecordsMatrix] = useState<Record<string, Record<number, {weight: number, unit: string}>>>({});
  const [goals, setGoals] = useState<TrainingGoal[]>([]);

  // Goal Modal State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalExercise, setGoalExercise] = useState("");
  const [goalType, setGoalType] = useState<"1RM" | "Weight for Reps" | "Volume">("1RM");
  const [goalValue, setGoalValue] = useState<number | "">("");
  const [goalReps, setGoalReps] = useState<number | "">(1);

  const [progressPhotos, setProgressPhotos] = useState<{ id: string, date: number, base64: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { getAllProgressPhotos, addProgressPhoto } = await import("@/lib/db");
        // One-time migration: move any legacy localStorage photos into IndexedDB.
        const legacyRaw = localStorage.getItem("ultimatum_progress_photos");
        if (legacyRaw) {
          try {
            const legacy = JSON.parse(legacyRaw);
            if (Array.isArray(legacy)) {
              for (const p of legacy) {
                try { await addProgressPhoto(p); } catch {}
              }
              localStorage.removeItem("ultimatum_progress_photos");
            }
          } catch {}
        }
        const photos = await getAllProgressPhotos();
        setProgressPhotos(photos);
      } catch (e) {}
    })();

    function fetchAnalytics() {
      try {
        setVolumeData(calcLocalVolumeData() || {});
        setChartData(calcLocalChartData() || []);
        setInsights(calcLocalInsights());
        setDietAlignment(calcLocalDietAlignment() || null);
        setMuscleRecovery(calcLocalRecovery() || {});
        setRecordsMatrix(calcLocalRecordsMatrix());
        setGoals(getLocalGoals());
      } catch (error) {
        console.error("Failed to load local analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();

    // The cardio target follows the protocol the user picked in the cardio
    // tracker, instead of a hardcoded 150 minutes.
    try {
      const splitId = localStorage.getItem("ultimatum_cardio_split") || "3-day";
      const targets: Record<string, number> = { "2-day": 90, "3-day": 150, "4-day": 160, "7-day": 140 };
      setCardioTarget(targets[splitId] ?? 150);
    } catch {}
    try {
      setUnitLabel(localStorage.getItem("ultimatum_weight_unit") === "LBS" ? "LBS" : "KG");
    } catch {}

    try {
      const historyRaw = localStorage.getItem("ultimatum_cardio_history");
      if (historyRaw) {
        const history = JSON.parse(historyRaw);
        const now = Date.now();
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const recentMins = history.reduce((sum: number, entry: any) => {
          return (now - (entry.timestamp || 0) < sevenDaysMs) ? sum + Number(entry.minutes || 0) : sum;
        }, 0);
        setCardioMinutes(recentMins);
      }
    } catch {}
  }, []);

  // Baseline = average of completed weeks only (the current week is still
  // accumulating and would drag the average down).
  const completedWeeks = chartData.filter((w) => !w.isCurrent);
  const baselineSets =
    completedWeeks.length > 0
      ? Math.round(completedWeeks.reduce((sum, w) => sum + w.sets, 0) / completedWeeks.length)
      : 0;
  // Weekly target = sum of the minimum effective volume of every muscle that
  // has been trained in the window. Only muscles in the data are counted so a
  // lifter who never trains calves is not chased for calf volume.
  const trainedMuscles = Object.entries(volumeData)
    .filter(([, sets]) => (sets as number) > 0)
    .map(([muscle]) => muscle as Muscle);
  const weeklyTarget = trainedMuscles.reduce(
    (sum, muscle) => sum + (MUSCLE_WEEKLY_TARGETS[muscle]?.mev ?? 0),
    0,
  );

  return (
    <div className="min-h-screen bg-black text-white relative font-sans selection:bg-sky-900 selection:text-white overflow-hidden pb-24">
      {/* Abstract Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <DotField 
          dotRadius={1}
          dotSpacing={25}
          cursorRadius={300}
          cursorForce={0.15}
          bulgeOnly={true}
          bulgeStrength={40}
          glowRadius={100}
          sparkle={true}
          waveAmplitude={0.5}
          gradientFrom="rgba(99, 102, 241, 0.2)" // Indigo tint
          gradientTo="rgba(255, 255, 255, 0.02)"
          glowColor="rgba(99, 102, 241, 0.05)"
        />
        {/* Subtle radial overlay to focus center */}
        <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_top,transparent_0%,rgba(0,0,0,1)_80%)]"></div>
      </div>

      <div className="relative z-10 p-4 pt-12 md:p-8 max-w-lg mx-auto">
        <header className="mb-10 text-center flex flex-col items-center relative">
          <div className="absolute top-0 right-0">
             <button
              onClick={() => setIsGuideModalOpen(true)}
              className="flex items-center justify-center w-8 h-8 bg-neutral-950/80 backdrop-blur border border-neutral-800/80 rounded-full text-neutral-400 hover:text-white hover:border-white/30 hover:bg-neutral-900 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.195)]"
              title="Guide"
            >
              <Info size={16} />
            </button>
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] mb-3 text-[11px] font-medium tracking-wider uppercase text-neutral-400">
            Analytics
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Training Insights
          </h1>
        </header>

        {/* Tabs - Stiff Cyberpunk style */}
        <div className="flex w-full border-b border-neutral-800 mb-8 overflow-x-auto no-scrollbar custom-scrollbar pb-1">
          {(["volume", "sets", "recovery", "insights", "photos", "records", "goals"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-none px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                activeTab === tab 
                  ? "text-white border-b-2 border-blue-500 bg-neutral-900/30" 
                  : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/10 border-b-2 border-transparent"
              }`}
            >
              {tab.replace("volume", "Heatmap").replace("sets", "Trends").replace("recovery", "Recovery").replace("insights", "Intel").replace("photos", "Photos").replace("records", "Records").replace("goals", "Goals")}
            </button>
          ))}
        </div>

        {/* Content Container */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-6">
               <div className="w-8 h-8 border-2 border-neutral-800 border-t-white rounded-full animate-spin"></div>
               <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] animate-pulse">Decrypting Data...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              {activeTab === "volume" && (
                <div>
                  <div className="mb-8 text-center px-4">
                    <h2 className="text-lg font-bold mb-2">Weekly Volume Heatmap</h2>
                    <p className="text-xs text-white/40 font-mono tracking-wide leading-relaxed">
                      Working sets per muscle over the last 7 days, coloured against each muscle&apos;s own effective range. Blue is below the minimum, green is inside it, red is past the recoverable maximum.
                    </p>
                  </div>
                  <BodyHeatmap volumeData={volumeData} />
                </div>
              )}

              {activeTab === "sets" && (
                <div>
                  <div className="mb-8 text-center px-4">
                    <h2 className="text-lg font-bold mb-2">Total Weekly Volume</h2>
                    <p className="text-xs text-white/40 font-mono tracking-wide leading-relaxed">
                      Working sets per week across every muscle, with your rolling baseline and the weekly target implied by your current muscle coverage.
                    </p>
                  </div>
                  <WeeklySetsChart
                    data={chartData}
                    baselineSets={baselineSets}
                    targetSets={weeklyTarget}
                  />
                </div>
              )}

              {activeTab === "recovery" && (
                <div>
                  <div className="mb-8 text-center px-4">
                    <h2 className="text-lg font-bold mb-2">Muscle Readiness</h2>
                    <p className="text-xs text-white/40 font-mono tracking-wide leading-relaxed">
                      Per muscle: time since last trained, sets this week, and the strength change between your last two sessions. Only primary movers are counted.
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {Object.keys(muscleRecovery).length > 0 ? (
                      Object.entries(muscleRecovery).map(([muscle, data]) => {
                        const tone = RECOVERY_TONE[data.status];
                        const hours = data.hoursSince === null ? null : Math.round(data.hoursSince);
                        return (
                          <div
                            key={muscle}
                            className={`w-full rounded-[32px] p-6 flex flex-col justify-between min-h-[140px] transition-all ${tone.card}`}
                          >
                            <div className="grid grid-cols-3 gap-2 w-full">
                              <div className="flex flex-col">
                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${tone.label}`}>Status</span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${tone.value}`}>
                                  {tone.text}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${tone.label}`}>Trend</span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${tone.value}`}>
                                  {data.hasTrend ? `${data.netScore > 0 ? "+" : ""}${data.netScore.toFixed(1)}%` : "—"}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${tone.label}`}>Priority</span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${tone.value}`}>
                                  {data.status === "no-data" ? "—" : data.priority.toUpperCase()}
                                </span>
                              </div>
                            </div>

                            <div className="mt-6 flex items-end justify-between gap-3">
                              <div className={`text-4xl font-black uppercase tracking-tighter leading-none ${tone.title}`}>
                                {muscle.replace("-", " ")}
                              </div>
                              <div className={`text-[9px] font-bold uppercase tracking-widest text-right leading-tight ${tone.label}`}>
                                {hours === null ? "Never trained" : hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`}
                                <br />
                                {data.setsThisWeek} sets / 7d
                              </div>
                            </div>
                          </div>
                        );
                      })                    ) : (
                      <div className="text-center p-8 border border-neutral-800 rounded-[32px] text-neutral-500 text-xs font-bold uppercase tracking-widest">
                        Insufficient Intel to calculate recovery
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "insights" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Diet & Weight Alignment */}
                  {dietAlignment && (
                    <div className="bg-[#121212] border border-neutral-800/60 rounded-[32px] p-6 col-span-1 md:col-span-2 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6] opacity-[0.03] blur-[40px] rounded-full pointer-events-none" />
                      <h3 className="text-xs font-bold text-neutral-400 flex items-center gap-2 mb-6 uppercase tracking-widest">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        Weight Alignment
                      </h3>
                      
                      <div className="flex justify-between text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">
                        <span>Current Diff</span>
                        <span>{dietAlignment.goal}</span>
                      </div>
                      
                      <div className="w-full h-8 bg-neutral-900 rounded-lg overflow-hidden relative border border-[#222]">
                        <div 
                          className="h-full bg-[#3B82F6] flex items-center justify-end pr-1 transition-all duration-1000"
                          style={{ width: dietAlignment.status === 'success' ? '100%' : dietAlignment.status === 'warning' ? '50%' : '10%' }}
                        >
                          <div className="w-1.5 h-6 bg-white rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end mt-4">
                        <div className={`text-4xl font-black tracking-tighter ${dietAlignment.status === 'success' ? 'text-white' : 'text-neutral-300'}`}>
                          {dietAlignment.diff > 0 ? '+' : ''}{dietAlignment.diff} <span className="text-sm text-neutral-500 tracking-normal">{unitLabel}</span>
                        </div>
                        <p className={`text-[10px] font-bold uppercase tracking-widest max-w-[200px] text-right ${dietAlignment.status === 'success' ? 'text-[#3B82F6]' : 'text-neutral-500'}`}>
                          {dietAlignment.message}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cardio Engine Segmented Track */}
                  <div className="bg-[#121212] border border-neutral-800/60 rounded-[32px] p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6] opacity-[0.03] blur-[40px] rounded-full pointer-events-none" />
                    <h3 className="text-xs font-bold text-neutral-400 flex items-center gap-2 mb-8 uppercase tracking-widest">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                      Active Min (7D)
                    </h3>
                    
                    <div className="w-full">
                      <div className="flex gap-1 h-12 w-full mb-6">
                        {Array.from({ length: 15 }).map((_, i) => {
                          const segment = cardioTarget / 15;
                          const isActive = cardioMinutes >= (i + 1) * segment;
                          const isPartial = !isActive && cardioMinutes > i * segment;
                          const partialHeight = isPartial
                            ? Math.min(100, ((cardioMinutes - i * segment) / segment) * 100)
                            : 0;
                          
                          return (
                            <div key={i} className="flex-1 bg-[#151515] rounded-[2px] relative overflow-hidden flex items-end">
                              {isActive && (
                                <div className="w-full h-full bg-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                              )}
                              {isPartial && (
                                <div 
                                  className="w-full bg-[#3B82F6]/50 shadow-[0_0_10px_rgba(59,130,246,0.4)]" 
                                  style={{ height: `${partialHeight}%` }} 
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="text-4xl font-black tracking-tighter text-white">
                          {cardioMinutes} <span className="text-sm text-neutral-600 tracking-normal font-bold">/ {cardioTarget}</span>
                        </div>
                        <div className={`text-[9px] font-bold uppercase tracking-widest max-w-[120px] text-right leading-tight ${cardioMinutes >= 150 ? 'text-[#3B82F6]' : 'text-neutral-500'}`}>
                          {cardioMinutes >= cardioTarget
                            ? 'Target achieved. Aerobic base maintained.'
                            : `${Math.max(0, cardioTarget - cardioMinutes)} min left this week.`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sleep Engine Card */}
                  <div className="bg-[#121212] border border-neutral-800/60 rounded-[32px] p-6 relative overflow-hidden shadow-2xl flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6] opacity-[0.03] blur-[40px] rounded-full pointer-events-none" />
                    <SleepInsightsModule />
                  </div>

                  {/* Exercise Insights */}
                  <div className="bg-[#121212] border border-neutral-800/60 rounded-[32px] p-6 col-span-1 md:col-span-2 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#3B82F6] opacity-[0.02] blur-[50px] rounded-full pointer-events-none" />
                    <h3 className="text-xs font-bold text-neutral-400 flex items-center gap-2 mb-6 uppercase tracking-widest">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.42-4.42c.78-.78 2.05-.78 2.83 0L12 5.3 14.75 2.5c.78-.78 2.05-.78 2.83 0L22 7M2 17l4.42 4.42c.78.78 2.05.78 2.83 0L12 18.7l2.75 2.8c.78.78 2.05.78 2.83 0L22 17"/></svg>
                      Progression Intel
                    </h3>
                    
                    {insights.length > 0 ? (
                      <ExerciseInsightsList insights={insights} />
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">Insufficient Intel</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 max-w-[200px]">Log more protocol executions to decrypt progression insights.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === "photos" && (
                <div className="flex flex-col">
                  <div className="mb-8 text-center px-4">
                    <h2 className="text-lg font-bold mb-2">Visual Progression</h2>
                    <p className="text-xs text-white/40 font-mono tracking-wide leading-relaxed">
                      See the changes the scale misses. Upload or capture progress photos.
                    </p>
                  </div>
                  
                  <div className="flex justify-center mb-8">
                    <label className="bg-white text-black px-6 py-3 rounded-lg font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer text-xs flex items-center gap-2">
                      <Camera size={16} />
                      Add Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            // Downscale to a max of 900px JPEG so photos stay
                            // small and store comfortably in IndexedDB.
                            const img = new Image();
                            img.onload = () => {
                              let { width, height } = img;
                              const maxDim = 900;
                              if (width > maxDim || height > maxDim) {
                                const scale = Math.min(maxDim / width, maxDim / height);
                                width = Math.round(width * scale);
                                height = Math.round(height * scale);
                              }
                              const canvas = document.createElement("canvas");
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext("2d");
                              ctx?.drawImage(img, 0, 0, width, height);
                              const compressed = canvas.toDataURL("image/jpeg", 0.82);

                              const newPhoto = {
                                id: Math.random().toString(36).substr(2, 9),
                                date: Date.now(),
                                base64: compressed
                              };
                              const newPhotos = [newPhoto, ...progressPhotos];
                              setProgressPhotos(newPhotos);
                              import("@/lib/db")
                                .then(({ addProgressPhoto }) => addProgressPhoto(newPhoto))
                                .catch(() => alert("Couldn't save photo to storage."));
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }} 
                      />
                    </label>
                  </div>

                  {progressPhotos.length === 0 ? (
                    <div className="py-12 border border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center text-center">
                      <Camera size={32} className="text-neutral-600 mb-4" />
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-neutral-500 mb-3">No Visual Data</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 max-w-xs">Upload your first progress photo to start building a visual record.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {progressPhotos.map((photo) => (
                        <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-[3/4] border border-neutral-800">
                          <img src={photo.base64} alt="Progress" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">
                              {new Date(photo.date).toLocaleDateString()}
                            </span>
                            <button 
                              className="absolute top-2 right-2 p-2 bg-sky-600/80 text-white rounded-lg hover:bg-sky-500"
                              onClick={() => {
                                if (confirm("Delete this photo?")) {
                                  const newPhotos = progressPhotos.filter(p => p.id !== photo.id);
                                  setProgressPhotos(newPhotos);
                                  import("@/lib/db")
                                    .then(({ deleteProgressPhoto }) => deleteProgressPhoto(photo.id))
                                    .catch(() => {});
                                }
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "records" && (
                <div>
                  <div className="mb-8 text-center px-4">
                    <h2 className="text-lg font-black mb-2 uppercase tracking-widest text-white">PR Matrix</h2>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest leading-relaxed">
                      All-time highest weight achieved per rep.
                    </p>
                  </div>
                  
                  {Object.keys(recordsMatrix).length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 font-bold uppercase tracking-widest text-[10px] border border-dashed border-neutral-800 rounded-xl mx-4">
                      No records logged yet
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto pb-6 custom-scrollbar px-4">
                      <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950/50">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="p-4 text-left bg-neutral-900 border-b border-neutral-800 border-r border-neutral-800 text-[9px] font-black uppercase tracking-widest text-neutral-500 min-w-[80px] sticky left-0 z-10 shadow-[2px_0_10px_rgba(0,0,0,0.5)]">REPS</th>
                              {Object.keys(recordsMatrix).map(ex => (
                                <th key={ex} className="p-4 text-center bg-neutral-900 border-b border-neutral-800 text-[10px] font-black uppercase tracking-widest text-white min-w-[120px]">
                                  {ex}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({length: 15}).map((_, i) => {
                              const rep = i + 1;
                              return (
                                <tr key={rep} className="border-b border-neutral-800/50 hover:bg-white/5 transition-colors last:border-0">
                                  <td className="p-4 text-left font-black text-neutral-400 text-xs sticky left-0 z-10 bg-neutral-950 border-r border-neutral-800 shadow-[2px_0_10px_rgba(0,0,0,0.5)]">{rep} RM</td>
                                  {Object.keys(recordsMatrix).map(ex => {
                                    const record = recordsMatrix[ex][rep];
                                  return (
                                    <td key={ex} className="p-3 text-center">
                                      {record && record.weight > 0 ? (
                                        <div className="flex flex-col items-center">
                                          <span className="font-black text-white">{record.weight}</span>
                                          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">{record.unit}</span>
                                        </div>
                                      ) : (
                                        <span className="text-neutral-700 font-black">-</span>
                                      )}
                                    </td>
                                  )
                                })}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "goals" && (
                <div>
                  <div className="mb-8 flex items-center justify-between px-4">
                    <div>
                      <h2 className="text-lg font-black mb-1 uppercase tracking-widest text-white">Active Goals</h2>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                        {goals.length} Tracked Objectives
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowGoalModal(true)}
                      className="px-4 py-2 bg-white hover:bg-neutral-200 transition-colors text-black text-[10px] font-black uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    >
                      New Goal
                    </button>
                  </div>
                  
                  {goals.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl mx-4 bg-neutral-950/30">
                      <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs mb-2">No Goals Set</p>
                      <p className="text-[10px] text-neutral-600 font-bold max-w-xs mx-auto leading-relaxed">Set specific targets to track your progress automatically based on your logged history.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 px-4">
                      {goals.map(goal => {
                        let progressPct = 0;
                        let currentValue = 0;

                        // Goal exercises are chosen from the catalogue, so an
                        // exact match is the only correct match: a fuzzy one
                        // made "Bench Press" resolve to "Close-Grip Bench Press".
                        const goalKey = goal.exerciseName.toLowerCase().trim();
                        const matchKey = Object.keys(recordsMatrix).find(
                          (k) => k.toLowerCase().trim() === goalKey,
                        );
                        const records = matchKey ? recordsMatrix[matchKey] : null;

                        if (goal.targetType === "1RM") {
                           if (records) {
                              const epley1RM = Array.from({ length: 15 }).reduce<number>((max, _, i) => {
                                 const rep = i + 1;
                                 const w = records[rep]?.weight || 0;
                                 const est = w > 0 ? w * (1 + rep/30) : 0;
                                 return est > max ? est : max;
                              }, 0);
                              currentValue = Math.round(epley1RM * 10) / 10;
                           }
                        } else if (goal.targetType === "Weight for Reps") {
                           if (records && goal.targetReps && records[goal.targetReps]) {
                              currentValue = records[goal.targetReps].weight;
                           }
                        } else if (goal.targetType === "Volume") {
                           // Sum logged sets over the last 7 days for the matched exercise.
                           const historyKey = "ultimatum_history_" + (matchKey || goal.exerciseName).toLowerCase().replace(/\s+/g, "_");
                           try {
                              const hist = JSON.parse(localStorage.getItem(historyKey) || "[]");
                              const now = Date.now();
                              currentValue = (hist as any[]).reduce((sum, s) =>
                                 (now - (s.timestamp || 0) < 7 * 24 * 60 * 60 * 1000) ? sum + 1 : sum, 0);
                           } catch {}
                        }

                        progressPct = Math.min(100, Math.max(0, (currentValue / goal.targetValue) * 100));

                        return (
                          <div key={goal.id} className="bg-neutral-950/50 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden group">
                            <button 
                               onClick={() => {
                                 if (confirm("Delete this goal?")) {
                                   deleteLocalGoal(goal.id);
                                   setGoals(getLocalGoals());
                                 }
                               }}
                               className="absolute top-4 right-4 p-2 text-neutral-600 hover:text-sky-500 transition-colors"
                            >
                               <Trash2 size={16} />
                            </button>
                            <h3 className="text-white font-black uppercase tracking-wider text-sm mb-1 pr-8">{goal.exerciseName}</h3>
                            <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest mb-4">
                              {goal.targetType} • TARGET: {goal.targetValue} {goal.targetType === 'Weight for Reps' ? `for ${goal.targetReps} Reps` : goal.targetType === 'Volume' ? 'sets / week' : ''}
                            </p>
                            
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">
                               <span>Current: {currentValue}</span>
                               <span className="text-white">{progressPct.toFixed(1)}%</span>
                            </div>
                            
                            <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                               <div className="h-full bg-sky-600 transition-all duration-1000 shadow-[0_0_10px_rgba(2,132,199,0.5)]" style={{ width: `${progressPct}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* GOAL MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] p-6 space-y-6">
              <h3 className="text-white text-sm font-black uppercase tracking-widest border-b-2 border-blue-600 pb-3">Create New Goal</h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Exercise Name</label>
                    <input 
                       type="text" 
                       value={goalExercise}
                       onChange={e => setGoalExercise(e.target.value)}
                       placeholder="e.g. Bench Press"
                       className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-sky-500 transition-colors uppercase"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Goal Type</label>
                    <select 
                       value={goalType}
                       onChange={e => setGoalType(e.target.value as any)}
                       className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-sky-500 transition-colors uppercase appearance-none"
                    >
                       <option value="1RM">Est. 1RM Target</option>
                       <option value="Weight for Reps">Weight for Reps</option>
                       <option value="Volume">Weekly Sets</option>
                    </select>
                 </div>

                 {goalType === "Weight for Reps" && (
                   <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Target Reps</label>
                      <input 
                         type="number" 
                         value={goalReps}
                         onChange={e => setGoalReps(e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                         className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-sky-500 transition-colors"
                      />
                   </div>
                 )}

                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Target Weight</label>
                    <input 
                       type="number" 
                       value={goalValue}
                       onChange={e => setGoalValue(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                       className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-sky-500 transition-colors"
                    />
                 </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                 <button 
                    onClick={() => setShowGoalModal(false)}
                    className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition-colors"
                 >
                    Cancel
                 </button>
                 <button 
                    onClick={() => {
                       if (!goalExercise || !goalValue) return;
                       saveLocalGoal({
                         id: "goal_" + Date.now(),
                         exerciseName: goalExercise,
                         targetType: goalType,
                         targetValue: Number(goalValue),
                         targetReps: Number(goalReps),
                         createdAt: Date.now()
                       });
                       setGoals(getLocalGoals());
                       setShowGoalModal(false);
                       setGoalExercise("");
                       setGoalValue("");
                    }}
                    className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(2,132,199,0.3)] transition-colors"
                 >
                    Save Goal
                 </button>
              </div>
           </div>
        </div>
      )}
      
      <InsightsGuideModal 
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
