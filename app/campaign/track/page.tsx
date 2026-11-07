"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, PlayCircle, AlertTriangle, Heart, CheckCircle2, Dumbbell, ShieldCheck, Footprints, Info, ArrowUp, ArrowDown, Trash2, Edit3, Save, Plus, Calendar } from "lucide-react";
import { getLocalCampaign, getLocalFlexibilityCampaign, SSR_CAMPAIGN_FALLBACK, SSR_FLEX_CAMPAIGN_FALLBACK } from "../../../lib/get-campaign";
import WorkoutTracker from "../../../components/WorkoutTracker";
import ExercisePicker from "../../../components/ExercisePicker";
import DisciplinedTimer from "../../../components/DisciplinedTimer";
import { WorkoutCalendar } from "../../../components/WorkoutCalendar";
import { registerPlugin } from "@capacitor/core";
import { resolveMovementName } from "../../../lib/exercise-aliases";
import {
  isDayRecorded,
  migrateLegacyDayRecords,
  readCampaignDay,
  recordDayComplete,
  writeCampaignDay,
} from "../../../lib/day-completion";

const RestTimerNative = registerPlugin<any>('RestTimerNative');

function TrackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const dayParam = searchParams.get("day");

  // SSR-safe initial state: use the static fallbacks so server and client
  // produce identical HTML. The real localStorage-backed values are loaded
  // in the mount effect below, which is client-only.
  const [campaign, setCampaign] = useState<any>(
    modeParam === "flexibility" ? SSR_FLEX_CAMPAIGN_FALLBACK : SSR_CAMPAIGN_FALLBACK
  );
  const [currentDayIndex, setCurrentDayIndex] = useState(() => {
    const parsed = dayParam ? parseInt(dayParam, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  });

  // Hydrate from localStorage after mount (client-only, never runs on the server).
  useEffect(() => {
    // Load the real campaign for this user.
    const isFlexibility = modeParam === "flexibility";
    const realCampaign = isFlexibility ? getLocalFlexibilityCampaign() : getLocalCampaign();
    setCampaign(realCampaign);
    migrateLegacyDayRecords(realCampaign);

    // Load the stored day index for THIS mode only. The URL still wins when it
    // pins a day, so opening a specific day from the timeline is exact.
    if (!dayParam) {
      const stored = readCampaignDay(isFlexibility ? "flexibility" : "resistance");
      if (stored !== null) {
        setCurrentDayIndex(stored);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [activeTrackingExercise, setActiveTrackingExercise] = useState<any>(null);
  const [activeFlexExercise, setActiveFlexExercise] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
  const [dailySets, setDailySets] = useState<Record<string, any[]>>({});

  // System exercises display the catalogue movement; anything user-made keeps
  // the name the user typed.
  function movementDisplayName(ex: any): string {
    return resolveMovementName(ex?.prescribedEquipment) || ex?.prescribedEquipment || ex?.slotName || "Exercise";
  }
  const [isEditing, setIsEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Helper to get today's date in the same format WorkoutTracker uses
  const getTodayString = () => {
    const today = new Date();
    const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long' } as const;
    return today.toLocaleDateString('en-US', options).toUpperCase();
  };

  // Helper to clean up exercise names for better YouTube search results
  const getSearchQueryName = (name: string) => {
    if (!name) return "";
    // Remove text in parentheses (e.g., "(Middle/upper back)")
    let cleanName = name.replace(/\([^)]*\)/g, '').trim();
    // Remove common descriptive prefixes
    cleanName = cleanName.replace(/^(Floor|Wall|Seated|Standing|Lying|Partner|Solo)\s+/i, '');
    return cleanName.trim();
  };

  const loadDailySets = useCallback(() => {
    if (!campaign || !campaign.days[currentDayIndex]) return;
    const currentDay = campaign.days[currentDayIndex];
    const todayStr = getTodayString();
    
    const newDailySets: Record<string, any[]> = {};
    
    currentDay.exercises.forEach((ex: any) => {
      // The tracker logs under `prescribedEquipment` for system exercises, so the
      // day must read the same key. Custom exercises have no catalogue entry and
      // keep their raw name.
      const exerciseName = resolveMovementName(ex.prescribedEquipment) || ex.slotName || ex.name || "Incline Press";
      const key = "ultimatum_history_" + exerciseName.replace(/\s+/g, '_').toLowerCase();
      const savedData = localStorage.getItem(key);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed)) {
            newDailySets[exerciseName] = parsed.filter(item => item.date === todayStr);
          }
        } catch (e) {
          // ignore parsing errors
        }
      }
    });
    
    setDailySets(newDailySets);
  }, [campaign, currentDayIndex]);

  // Foreground Service removed since user doesn't want the persistent tracking notification

  // Intercept physical hardware back button (e.g. Android back button or iOS swipe back)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (activeTrackingExercise) {
        // Prevent navigation, close the modal instead
        setActiveTrackingExercise(null);
        loadDailySets();
      } else if (activeFlexExercise) {
        setActiveFlexExercise(null);
      } else if (showCalendar) {
        setShowCalendar(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTrackingExercise, loadDailySets]);

  const openTracker = (ex: any) => {
    setActiveTrackingExercise(ex);
    // Push a dummy state so the physical back button has something to "pop" without leaving the page
    window.history.pushState({ modalOpen: true }, "");
  };

  const closeTracker = () => {
    setActiveTrackingExercise(null);
    loadDailySets();
    // If we close it manually, we need to pop that dummy state we added so the history stays clean
    if (window.history.state?.modalOpen) {
      window.history.back();
    }
  };

  const openFlexTracker = (ex: any) => {
    setActiveFlexExercise(ex);
    window.history.pushState({ modalOpen: true }, "");
  };

  const closeFlexTracker = () => {
    setActiveFlexExercise(null);
    if (window.history.state?.modalOpen) {
      window.history.back();
    }
  };

  useEffect(() => {
    // Whenever campaign or currentDayIndex changes, load sets.
    loadDailySets();
  }, [campaign, currentDayIndex]);

  const currentDay = campaign.days[currentDayIndex] ?? campaign.days[0];
  if (!currentDay) return null;

  const handleNextDay = () => {
    if (currentDayIndex < campaign.days.length - 1) {
      setDirection(1);
      setCurrentDayIndex(prev => prev + 1);
    }
  };

  const handlePrevDay = () => {
    if (currentDayIndex > 0) {
      setDirection(-1);
      setCurrentDayIndex(prev => prev - 1);
    }
  };

  const completeMission = () => {
    const isFlexibility = modeParam === "flexibility";
    const scope = campaign.id || "default";
    // Record this specific day as done. The cursor only decides what to suggest
    // next, because every day is reachable independently now.
    try {
      recordDayComplete(campaign.days[currentDayIndex], currentDayIndex, scope);
    } catch {}
    // Advance to the next day that is NOT already complete, so finishing a day
    // out of order does not silently move "Up Next" onto a day already trained.
    const nextIncomplete = campaign.days.findIndex(
      (day: any, index: number) => index > currentDayIndex && !isDayRecorded(day, index, scope),
    );
    // Nothing after this day is left: fall back to the first day still open
    // (training out of order can leave earlier days untouched).
    const firstOpen =
      nextIncomplete === -1
        ? campaign.days.findIndex((day: any, index: number) => !isDayRecorded(day, index, scope))
        : -1;
    const nextDay =
      nextIncomplete !== -1
        ? nextIncomplete
        : firstOpen !== -1
          ? firstOpen
          : campaign.days.length;
    // Never write the resistance track's cursor from a flexibility session.
    writeCampaignDay(isFlexibility ? "flexibility" : "resistance", nextDay);
    // Always use client-side routing. The offline branch used a full document
    // load, which reloaded the whole app shell (visible flash) and reset the
    // navigation stack right after finishing a workout.
    router.push("/campaign");
  };

  const saveEdits = () => {
    localStorage.setItem("ultimatum_campaign_override", JSON.stringify(campaign));
    setIsEditing(false);
  };

  const moveExerciseUp = (index: number) => {
    if (index === 0) return;
    const newCampaign = { ...campaign };
    const exercises = [...newCampaign.days[currentDayIndex].exercises];
    const temp = exercises[index];
    exercises[index] = exercises[index - 1];
    exercises[index - 1] = temp;
    newCampaign.days[currentDayIndex].exercises = exercises;
    setCampaign(newCampaign);
  };

  const moveExerciseDown = (index: number) => {
    if (index === campaign.days[currentDayIndex].exercises.length - 1) return;
    const newCampaign = { ...campaign };
    const exercises = [...newCampaign.days[currentDayIndex].exercises];
    const temp = exercises[index];
    exercises[index] = exercises[index + 1];
    exercises[index + 1] = temp;
    newCampaign.days[currentDayIndex].exercises = exercises;
    setCampaign(newCampaign);
  };

  const deleteExercise = (index: number) => {
    const newCampaign = { ...campaign };
    const exercises = [...newCampaign.days[currentDayIndex].exercises];
    exercises.splice(index, 1);
    newCampaign.days[currentDayIndex].exercises = exercises;
    setCampaign(newCampaign);
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const newCampaign = { ...campaign };
    const exercises = [...newCampaign.days[currentDayIndex].exercises];
    exercises[index] = { ...exercises[index], [field]: value };
    newCampaign.days[currentDayIndex].exercises = exercises;
    setCampaign(newCampaign);
  };

  const handleAddExercise = (slotName: string, prescribedEquipment: string, videoUrl?: string, isCustom?: boolean) => {
    const newCampaign = { ...campaign };
    const exercises = [...newCampaign.days[currentDayIndex].exercises];
    exercises.push({
      slotName,
      prescribedEquipment,
      sets: 3,
      targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR",
      substitutions: [],
      videoUrl,
      isCustom
    });
    newCampaign.days[currentDayIndex].exercises = exercises;
    setCampaign(newCampaign);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-tracker-bg text-tracker-text-bold flex flex-col font-sans selection:bg-red-900 selection:text-tracker-text-bold">
      {/* Top Header / Calendar Nav */}
      <div className="sticky top-0 z-40 bg-tracker-bg/80 backdrop-blur-xl border-b border-tracker-border">
        <div className="flex flex-col md:flex-row justify-between md:items-center p-4 gap-4 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between w-full md:w-auto md:justify-start">
            <button 
              onClick={() => router.push("/campaign")} 
              className="group flex items-center gap-1.5 px-3 py-1.5 bg-tracker-bg border border-tracker-border rounded-lg text-[10px] font-black tracking-widest uppercase text-tracker-text-soft hover:text-tracker-text-bold hover:bg-tracker-card hover:border-tracker-border transition-all shadow-sm"
            >
              <ChevronLeft size={14} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
              Overview
            </button>
            
            <div className="flex items-center gap-2">
              <DisciplinedTimer />
              <button 
                onClick={() => {
                  setShowCalendar(true);
                  window.history.pushState({ modalOpen: true }, "");
                }}
                className="flex items-center justify-center w-8 h-[30px] rounded-lg bg-tracker-bg border border-tracker-border text-tracker-text-soft hover:text-tracker-text-bold hover:bg-tracker-card hover:border-tracker-border transition-all shadow-sm"
              >
                <Calendar size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-2">
            <button onClick={handlePrevDay} disabled={currentDayIndex === 0} className="p-2 text-tracker-text-soft hover:text-tracker-text-bold disabled:opacity-30 transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div className="text-center flex-1 md:flex-none md:min-w-[140px]">
              <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-tracker-text-soft mb-1">
                Day 0{currentDay.dayNumber}
              </div>
              <div className="text-sm md:text-base font-black uppercase tracking-wider text-balance leading-tight">
                {currentDay.title}
              </div>
              {currentDay.subtitle && (
                <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-tracker-text-soft/70 mt-1 leading-tight">
                  {currentDay.subtitle}
                </div>
              )}
            </div>
            <button onClick={handleNextDay} disabled={currentDayIndex === campaign.days.length - 1} className="p-2 text-tracker-text-soft hover:text-tracker-text-bold disabled:opacity-30 transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area (Swipeable) */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentDayIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000 || offset.x < -100) {
                handleNextDay();
              } else if (swipe > 10000 || offset.x > 100) {
                handlePrevDay();
              }
            }}
            className="absolute inset-0 w-full h-full overflow-y-auto custom-scrollbar pt-6 pb-32"
          >
            <div className="max-w-4xl mx-auto px-4 md:px-8">
              
              {currentDay.warning && (
                <div className="mb-8 relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start shadow-xl">
                  {/* Left accent line */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-tracker-accent shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
                  
                  {/* Icon container */}
                  <div className="bg-tracker-accent/10 p-2.5 rounded-xl border border-tracker-accent/20 flex-shrink-0 shadow-inner">
                    <AlertTriangle className="text-tracker-accent" size={22} strokeWidth={2.5} />
                  </div>
                  
                  {/* Text content */}
                  <div className="flex-1 mt-0.5">
                    <h4 className="text-tracker-accent text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">
                      {currentDay.warningTitle || (currentDay.warning?.toLowerCase().includes("neck") ? "Neck Training Warning" : "Protocol Note")}
                    </h4>
                    <p className="text-white/90 text-sm leading-relaxed font-medium">
                      {currentDay.warning}
                    </p>
                  </div>
                </div>
              )}

              {currentDay.isRestDay ? (
                <div className="flex flex-col h-full justify-center text-center py-20">
                  <Heart size={64} className="mx-auto text-neutral-800 mb-6" />
                  <h3 className="text-2xl font-black uppercase tracking-widest text-tracker-text-soft mb-4">Active Recovery</h3>
                  <p className="text-tracker-text-soft max-w-md mx-auto text-sm md:text-base leading-relaxed mb-12">
                    Stay out of the gym. Eat, sleep, and allow your central nervous system to repair the mechanical damage inflicted.
                  </p>
                  <div className="mt-auto flex justify-center">
                    <button
                      onClick={completeMission}
                      className="px-8 py-3 bg-white hover:bg-neutral-200 text-black font-black uppercase tracking-[0.2em] text-xs rounded-full transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <CheckCircle2 size={14} className="text-black" />
                      Mark Rest Complete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pt-4">
                  {searchParams.get("mode") === "flexibility" ? (
                    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
                      {currentDay.exercises.map((ex: any, i: number) => {
                        const exerciseName = ex.slotName || ex.name || "Stretching Exercise";
                        const isCompleted = dailySets[exerciseName] && dailySets[exerciseName].length > 0;
                        return (
                          <div 
                            key={i} 
                            onClick={(e) => {
                              // Don't open popup if they clicked the youtube button
                              if ((e.target as HTMLElement).closest('a')) return;
                              openFlexTracker(ex);
                            }}
                            className={`group bg-[#151515] border border-transparent rounded-[2.5rem] p-6 md:p-8 flex flex-row items-center justify-between gap-6 transition-colors shadow-sm cursor-pointer hover:bg-tracker-card`}
                          >
                            <div className="flex items-center gap-6 flex-grow overflow-hidden pointer-events-none">
                              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0 transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.325)] bg-white text-black`}>
                                {i + 1}
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <h3 className="font-bold text-lg md:text-xl text-tracker-text-bold mb-1.5 truncate tracking-wide">
                                  {exerciseName}
                                </h3>
                                <div className="text-sm md:text-base text-tracker-text-soft truncate">
                                  {ex.sets} sets • {ex.targetRIR || ex.reps || "C-R protocol"}
                                </div>
                                {ex.notes && (
                                  <div className="text-xs text-tracker-text-soft mt-2 truncate max-w-full font-medium">
                                    {ex.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <a 
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(getSearchQueryName(exerciseName) + ' stretch form')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Watch Form"
                                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-tracker-card flex items-center justify-center text-tracker-text-soft hover:text-tracker-text-bold hover:bg-neutral-800 transition-colors shadow-inner border border-tracker-border/50"
                              >
                                <PlayCircle size={22} />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => {
                          const todayStr = getTodayString();
                          const newDailySets = { ...dailySets };
                          currentDay.exercises.forEach((ex: any) => {
                            const exerciseName = ex.slotName || ex.name || "Stretching Exercise";
                            const key = "ultimatum_history_" + exerciseName.replace(/\s+/g, '_').toLowerCase();
                            const dummySet = [{ reps: ex.targetRIR || ex.reps || "Done", date: todayStr }];
                            localStorage.setItem(key, JSON.stringify(dummySet));
                            newDailySets[exerciseName] = dummySet;
                          });
                          setDailySets(newDailySets);
                          setTimeout(() => completeMission(), 500);
                        }}
                        className="mt-8 w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-all shadow-sm"
                      >
                        Complete Flexibility Session
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 pt-4 relative">
                      {/* EDIT TOGGLE BUTTON */}
                      <div className="flex justify-end mb-2">
                        {isEditing ? (
                          <button onClick={saveEdits} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-200 text-black font-black uppercase tracking-widest text-[10px] rounded-full shadow-sm transition-colors z-20">
                            <Save size={14} /> Save Edits
                          </button>
                        ) : (
                          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-tracker-card border border-tracker-border hover:border-tracker-border hover:bg-neutral-800 text-tracker-text-soft hover:text-tracker-text-bold font-black uppercase tracking-widest text-[10px] rounded-full transition-colors z-20">
                            <Edit3 size={14} /> Edit Routine
                          </button>
                        )}
                      </div>

                      {currentDay.exercises.map((ex: any, i: number) => {
                        return (
                        <div 
                          key={i} 
                          className="bg-tracker-card border border-tracker-border rounded-3xl overflow-hidden hover:border-tracker-accent/50 transition-all relative"
                        >
                          {/* EDIT UI OVERLAY */}
                          {isEditing && (
                            <div className="absolute right-0 top-0 bottom-0 w-16 bg-tracker-card border-l border-tracker-border flex flex-col items-center justify-center gap-4 z-10">
                              <button onClick={() => moveExerciseUp(i)} disabled={i === 0} className="p-2 text-tracker-text-soft hover:text-tracker-text-bold disabled:opacity-30">
                                <ArrowUp size={20} />
                              </button>
                              <button onClick={() => deleteExercise(i)} className="p-2 text-tracker-accent hover:bg-tracker-accent-faint rounded">
                                <Trash2 size={18} />
                              </button>
                              <button onClick={() => moveExerciseDown(i)} disabled={i === currentDay.exercises.length - 1} className="p-2 text-tracker-text-soft hover:text-tracker-text-bold disabled:opacity-30">
                                <ArrowDown size={20} />
                              </button>
                            </div>
                          )}

                          <div 
                            className={`p-5 md:p-6 cursor-pointer flex flex-col group relative ${isEditing ? "pr-20" : ""}`}
                            onClick={() => { if (!isEditing) openTracker(ex); }}
                          >
                            <h3 className="font-black text-xl text-tracker-text-bold uppercase tracking-wider group-hover:text-tracker-accent transition-colors">
                              {movementDisplayName(ex)}
                            </h3>
                            {ex.slotName && ex.slotName !== movementDisplayName(ex) && (
                              <div className="text-xs text-tracker-text-soft font-bold mt-1 uppercase tracking-widest">
                                {ex.slotName}
                              </div>
                            )}
                            
                            <div className="mt-6 flex flex-row items-center justify-between gap-4 w-full">
                              {isEditing ? (
                                <div className="flex flex-row gap-2 text-sm flex-wrap items-center">
                                  <div className="px-3 py-1.5 bg-[#222222] border border-[#333333] rounded-full flex items-center gap-2 shadow-sm">
                                    <span className="text-tracker-text-soft font-bold tracking-widest text-[9px] uppercase">Sets</span>
                                    <input 
                                      type="number" 
                                      value={ex.sets === "" ? "" : ex.sets} 
                                      onChange={(e) => updateExercise(i, 'sets', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                                      className="w-10 bg-transparent text-tracker-text-bold text-xs font-black outline-none border-b border-tracker-border focus:border-white text-center"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <div className="px-3 py-1.5 bg-[#222222] border border-[#333333] rounded-full flex items-center gap-2 shadow-sm">
                                    <span className="text-tracker-text-soft font-bold tracking-widest text-[9px] uppercase">Target</span>
                                    <input 
                                      type="text" 
                                      value={ex.targetRIR} 
                                      onChange={(e) => updateExercise(i, 'targetRIR', e.target.value)}
                                      className="w-24 bg-transparent text-tracker-text-bold text-xs font-black outline-none border-b border-tracker-border focus:border-tracker-accent text-center"
                                      onClick={(e) => e.stopPropagation()}
                                      placeholder="e.g. 1-0 RIR"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-row gap-2 text-sm flex-wrap">
                                  <div className="px-3 py-1.5 bg-[#222222] border border-[#333333] rounded-full flex items-center gap-1.5 shadow-sm">
                                    <span className="text-tracker-text-soft font-bold tracking-widest text-[9px] uppercase">Sets</span>
                                    <span className="font-black text-tracker-text-bold text-xs">{ex.sets}</span>
                                  </div>
                                  <div className="px-3 py-1.5 bg-[#222222] border border-[#333333] rounded-full flex items-center gap-1.5 shadow-sm">
                                    <span className="text-tracker-text-soft font-bold tracking-widest text-[9px] uppercase">RIR</span>
                                    <span className="font-black text-tracker-text-bold text-xs truncate max-w-[120px] md:max-w-none">
                                      {ex.targetRIR.replace(/S\d+:\s*/g, '').replace(/ RIR/g, '')}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              <button className="flex-shrink-0 flex items-center gap-1 px-4 py-2 bg-tracker-accent text-white font-black uppercase tracking-widest text-[10px] rounded-full group-hover:scale-105 shadow-sm transition-transform">
                                Track <ChevronRight size={14} strokeWidth={3} />
                              </button>
                            </div>
                          </div>

                          {(ex.notes || (ex.substitutions && ex.substitutions.length > 0)) && (
                            <div className="px-5 md:px-6 pb-5">
                              {ex.notes && (
                                <div className="flex items-start gap-2 bg-tracker-bg/30 p-3 rounded-xl border border-tracker-border/50 mb-2">
                                  <Info size={14} className="text-tracker-text-soft mt-0.5 flex-shrink-0" />
                                  <div className="text-xs text-tracker-text-soft font-medium leading-relaxed italic">
                                    {ex.notes}
                                  </div>
                                </div>
                              )}
                              {ex.substitutions && ex.substitutions.length > 0 && (
                                <details 
                                  className="group cursor-pointer bg-tracker-bg/30 border border-tracker-border/50 rounded-xl overflow-hidden transition-colors hover:border-tracker-border"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <summary className="px-4 py-3 text-[10px] md:text-xs font-bold text-tracker-text-soft uppercase tracking-widest hover:text-tracker-text-bold transition-colors flex items-center gap-2 list-none [&::-webkit-details-marker]:hidden bg-tracker-bg/50">
                                    <span className="group-open:rotate-90 transition-transform text-[8px]">▶</span>
                                    Substitutions
                                  </summary>
                                  <div className="px-4 pb-4 pt-2 flex flex-col gap-2 bg-tracker-bg/20 border-t border-tracker-border/50">
                                    {ex.substitutions.map((sub: string, idx: number) => (
                                      <span key={idx} className="text-xs font-medium text-tracker-text-soft hover:text-tracker-text-bold transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-neutral-600 before:rounded-full">
                                        {sub}
                                      </span>
                                    ))}
                                  </div>
                                </details>
                              )}
                            </div>
                          )}

                          {/* Actual Tracked Sets */}
                          {dailySets[ex.slotName || ex.name || "Incline Press"] && dailySets[ex.slotName || ex.name || "Incline Press"].length > 0 && (
                            <div className="px-5 md:px-6 pb-5 border-t border-tracker-border/50 pt-5">
                              <details 
                                className="group cursor-pointer bg-tracker-bg/30 border border-tracker-border/50 rounded-xl overflow-hidden transition-colors hover:border-tracker-border"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <summary className="px-4 py-3 text-[10px] md:text-xs font-bold text-tracker-text-soft uppercase tracking-widest hover:text-tracker-text-bold transition-colors flex items-center gap-2 list-none [&::-webkit-details-marker]:hidden bg-tracker-bg/50">
                                  <span className="group-open:rotate-90 transition-transform text-[8px]">▶</span>
                                  Today's Sets ({dailySets[ex.slotName || ex.name || "Incline Press"].length})
                                </summary>
                                <div className="px-4 pb-4 pt-4 flex flex-wrap gap-2 items-center bg-tracker-bg/20 border-t border-tracker-border/50">
                                  {dailySets[ex.slotName || ex.name || "Incline Press"].map((set, setIdx) => (
                                    <div key={set.id || setIdx} className="px-3.5 py-1.5 bg-tracker-accent-faint rounded-full text-[11px] font-black tracking-widest text-tracker-accent shadow-sm flex items-center justify-center">
                                      {set.weight} {set.unit || 'LBS'} × {set.reps}
                                    </div>
                                  ))}
                                  {dailySets[ex.slotName || ex.name || "Incline Press"].length < parseInt(String(ex.sets || "0").replace(/[^0-9]/g, '') || "0") && (
                                    <div className="px-3.5 py-1.5 bg-[#121212] border border-dashed border-[#333333] rounded-full text-[11px] font-bold tracking-widest text-tracker-text-soft flex items-center justify-center">
                                      SET {dailySets[ex.slotName || ex.name || "Incline Press"].length + 1}
                                    </div>
                                  )}
                                </div>
                              </details>
                            </div>
                          )}
                        </div>
                        );
                      })}
                      
                      {isEditing && (
                        <button 
                          onClick={() => setPickerOpen(true)}
                          className="w-full py-4 border-2 border-dashed border-tracker-border hover:border-neutral-600 text-tracker-text-soft hover:text-tracker-text-bold rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                          <Plus size={16} /> Add Exercise
                        </button>
                      )}

                      <div className="mt-10 mb-8 flex justify-center">
                        <button
                          onClick={completeMission}
                          className="py-3.5 px-8 bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 font-black uppercase tracking-[0.15em] text-[10px] md:text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={14} className="inherit" />
                          Mark Day Complete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Full Screen Slide-in Tracker */}
      <AnimatePresence>
        {activeTrackingExercise && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-tracker-bg overflow-hidden"
          >
            <div className="w-full h-full">
              <WorkoutTracker 
                exercise={activeTrackingExercise} 
                onClose={closeTracker}
                campaignId={campaign?.id}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flex Exercise Popup */}
      <AnimatePresence>
        {activeFlexExercise && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-tracker-bg/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 overflow-y-auto"
            onClick={closeFlexTracker}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#151515] border border-tracker-border rounded-[2.5rem] p-8 max-w-lg w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closeFlexTracker}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-tracker-card flex items-center justify-center text-tracker-text-soft hover:text-tracker-text-bold"
              >
                ✕
              </button>
              
              <div className="text-xs font-bold tracking-widest text-tracker-text-soft uppercase mb-4">Flexibility Protocol</div>
              <h2 className="text-2xl md:text-3xl font-black text-tracker-text-bold mb-6 uppercase tracking-wide leading-tight">
                {activeFlexExercise.slotName || activeFlexExercise.name || "Stretching Exercise"}
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="p-5 rounded-2xl bg-tracker-card/50 border border-tracker-border flex flex-col">
                  <div className="text-xs font-bold text-tracker-text-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    Repeat for {activeFlexExercise.sets} Sets
                  </div>
                </div>
                
                {activeFlexExercise.notes && (
                  <div className="p-5 rounded-2xl bg-tracker-card/50 border border-tracker-border">
                    <div className="text-[10px] text-tracker-text-soft font-bold uppercase tracking-widest mb-2">Execution Notes</div>
                    <p className="text-sm md:text-base text-neutral-300 leading-relaxed">
                      {activeFlexExercise.notes}
                    </p>
                  </div>
                )}
              </div>
              
              <a 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(getSearchQueryName(activeFlexExercise.slotName || activeFlexExercise.name || "Stretching Exercise") + ' stretch form')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-center flex items-center justify-center gap-3 hover:bg-neutral-200 transition-colors shadow-sm"
              >
                <PlayCircle size={24} />
                Watch Form Tutorial
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ExercisePicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddExercise}
      />

      {/* Full Screen Calendar Overlay */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] bg-tracker-bg overflow-hidden"
          >
            <WorkoutCalendar onClose={() => {
              setShowCalendar(false);
              if (window.history.state?.modalOpen) {
                window.history.back();
              }
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-tracker-bg" />}>
      <TrackPageContent />
    </Suspense>
  );
}
