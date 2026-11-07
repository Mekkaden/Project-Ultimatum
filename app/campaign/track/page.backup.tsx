"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, PlayCircle, AlertTriangle, Heart, CheckCircle2, Dumbbell, ShieldCheck, Footprints, Info } from "lucide-react";
import { getLocalCampaign, getLocalFlexibilityCampaign } from "../../../lib/get-campaign";
import WorkoutTracker from "../../../components/WorkoutTracker";

function TrackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [campaign, setCampaign] = useState<any>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [activeTrackingExercise, setActiveTrackingExercise] = useState<any>(null);
  const [activeFlexExercise, setActiveFlexExercise] = useState<any>(null);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
  const [dailySets, setDailySets] = useState<Record<string, any[]>>({});

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
      const exerciseName = ex.slotName || ex.name || "Incline Press";
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

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    const activeCamp = modeParam === "flexibility" ? getLocalFlexibilityCampaign() : getLocalCampaign();
    setCampaign(activeCamp);

    const dayParam = searchParams.get("day");
    if (dayParam) {
      setCurrentDayIndex(parseInt(dayParam, 10));
    } else {
      const savedDay = localStorage.getItem("ultimatum_campaign_day");
      if (savedDay) {
        setCurrentDayIndex(parseInt(savedDay, 10));
      }
    }
  }, [searchParams]);

  // Intercept physical hardware back button (e.g. Android back button or iOS swipe back)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (activeTrackingExercise) {
        // Prevent navigation, close the modal instead
        setActiveTrackingExercise(null);
        loadDailySets();
      } else if (activeFlexExercise) {
        setActiveFlexExercise(null);
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

  if (!campaign) return null;

  const currentDay = campaign.days[currentDayIndex];
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
    const nextDay = Math.min(currentDayIndex + 1, campaign.days.length);
    localStorage.setItem("ultimatum_campaign_day", nextDay.toString());
    if (!navigator.onLine) {
      window.location.href = "/campaign";
    } else {
      router.push("/campaign");
    }
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
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-red-900 selection:text-white">
      {/* Top Header / Calendar Nav */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-neutral-800">
        <div className="flex justify-between items-center p-4 max-w-4xl mx-auto">
          <button 
            onClick={() => router.push("/campaign")} 
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-[10px] font-black tracking-widest uppercase text-neutral-400 hover:text-white hover:bg-neutral-900 hover:border-neutral-700 transition-all shadow-sm"
          >
            <ChevronLeft size={14} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
            Overview
          </button>
          
          <div className="flex items-center gap-4">
            <button onClick={handlePrevDay} disabled={currentDayIndex === 0} className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div className="text-center min-w-[140px]">
              <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-500 mb-1">
                Day 0{currentDay.dayNumber}
              </div>
              <div className="text-sm md:text-base font-black uppercase tracking-wider">
                {currentDay.title}
              </div>
            </div>
            <button onClick={handleNextDay} disabled={currentDayIndex === campaign.days.length - 1} className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors">
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
                <div className="mb-8 bg-red-950/30 border border-red-900/50 rounded-lg p-4 flex gap-4 items-start">
                  <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" size={24} />
                  <p className="text-red-200 text-sm leading-relaxed font-medium">
                    {currentDay.warning}
                  </p>
                </div>
              )}

              {currentDay.isRestDay ? (
                <div className="flex flex-col h-full justify-center text-center py-20">
                  <Heart size={64} className="mx-auto text-neutral-800 mb-6" />
                  <h3 className="text-2xl font-black uppercase tracking-widest text-neutral-400 mb-4">Active Recovery</h3>
                  <p className="text-neutral-500 max-w-md mx-auto text-sm md:text-base leading-relaxed mb-12">
                    Stay out of the gym. Eat, sleep, and allow your central nervous system to repair the mechanical damage inflicted.
                  </p>
                  <div className="mt-auto flex justify-center">
                    <button
                      onClick={completeMission}
                      className="px-8 py-3 bg-white hover:bg-neutral-200 text-black font-black uppercase tracking-[0.2em] text-xs rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.098)] hover:shadow-[0_0_40px_rgba(255,255,255,0.163)] flex items-center gap-2"
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
                            className={`group bg-[#151515] border border-transparent rounded-[2.5rem] p-6 md:p-8 flex flex-row items-center justify-between gap-6 transition-colors shadow-sm cursor-pointer hover:bg-neutral-900`}
                          >
                            <div className="flex items-center gap-6 flex-grow overflow-hidden pointer-events-none">
                              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0 transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.325)] bg-white text-black`}>
                                {i + 1}
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <h3 className="font-bold text-lg md:text-xl text-white mb-1.5 truncate tracking-wide">
                                  {exerciseName}
                                </h3>
                                <div className="text-sm md:text-base text-neutral-400 truncate">
                                  {ex.sets} sets • {ex.targetRIR || ex.reps || "C-R protocol"}
                                </div>
                                {ex.notes && (
                                  <div className="text-xs text-neutral-500 mt-2 truncate max-w-full font-medium">
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
                                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shadow-inner border border-neutral-800/50"
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
                        className="mt-8 w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.13)]"
                      >
                        Complete Flexibility Session
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 pt-4">
                      {currentDay.exercises.map((ex: any, i: number) => (
                        <div 
                          key={i} 
                          className="bg-[#0f0f0f] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 hover:bg-neutral-950 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.39)]"
                        >
                          <div 
                            className="p-5 md:p-6 cursor-pointer flex flex-col group relative"
                            onClick={() => openTracker(ex)}
                          >
                            <h3 className="font-black text-xl text-white uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
                              {ex.prescribedEquipment}
                            </h3>
                            <div className="text-xs text-neutral-500 font-bold mt-1 uppercase tracking-widest">
                              {ex.slotName}
                            </div>
                            
                            <div className="mt-6 flex flex-row items-center justify-between gap-4 w-full">
                              <div className="flex flex-row gap-2 text-sm flex-wrap">
                                <div className="px-3 py-1.5 border border-white/10 bg-white/5 rounded-full flex items-center gap-1.5 shadow-sm">
                                  <span className="text-neutral-400 font-bold tracking-widest text-[9px] uppercase">Sets</span>
                                  <span className="font-black text-white text-xs">{ex.sets}</span>
                                </div>
                                <div className="px-3 py-1.5 border border-emerald-900/50 bg-emerald-950/30 rounded-full flex items-center gap-1.5 shadow-sm">
                                  <span className="text-emerald-700 font-bold tracking-widest text-[9px] uppercase">RIR</span>
                                  <span className="font-black text-emerald-400 text-xs truncate max-w-[120px] md:max-w-none">
                                    {ex.targetRIR.replace(/S\d+:\s*/g, '').replace(/ RIR/g, '')}
                                  </span>
                                </div>
                              </div>
                              
                              <button className="flex-shrink-0 flex items-center gap-1 px-4 py-2 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-full group-hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.098)] transition-transform">
                                Track <ChevronRight size={14} strokeWidth={3} />
                              </button>
                            </div>
                          </div>

                          {(ex.notes || (ex.substitutions && ex.substitutions.length > 0)) && (
                            <div className="px-5 md:px-6 pb-5">
                              {ex.notes && (
                                <div className="flex items-start gap-2 bg-neutral-900/30 p-3 rounded-xl border border-neutral-800/50 mb-2">
                                  <Info size={14} className="text-neutral-500 mt-0.5 flex-shrink-0" />
                                  <div className="text-xs text-neutral-400 font-medium leading-relaxed italic">
                                    {ex.notes}
                                  </div>
                                </div>
                              )}
                              {ex.substitutions && ex.substitutions.length > 0 && (
                                <details 
                                  className="group cursor-pointer bg-neutral-900/30 border border-neutral-800/50 rounded-xl overflow-hidden transition-colors hover:border-neutral-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <summary className="px-4 py-3 text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 list-none [&::-webkit-details-marker]:hidden bg-neutral-900/50">
                                    <span className="group-open:rotate-90 transition-transform text-[8px]">▶</span>
                                    Substitutions
                                  </summary>
                                  <div className="px-4 pb-4 pt-2 flex flex-col gap-2 bg-neutral-900/20 border-t border-neutral-800/50">
                                    {ex.substitutions.map((sub: string, idx: number) => (
                                      <span key={idx} className="text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-neutral-600 before:rounded-full">
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
                            <div className="bg-neutral-950/50 p-4 border-t border-neutral-800/50 flex flex-wrap gap-2 items-center">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 w-full mb-1">Today's Sets</div>
                              {dailySets[ex.slotName || ex.name || "Incline Press"].map((set, setIdx) => (
                                <div key={set.id || setIdx} className="px-3 py-1.5 bg-neutral-900 rounded border border-neutral-800 text-xs font-bold text-neutral-400">
                                  {set.weight} {set.unit || 'LBS'} × {set.reps}
                                </div>
                              ))}
                              {dailySets[ex.slotName || ex.name || "Incline Press"].length < parseInt(String(ex.sets || "0").replace(/[^0-9]/g, '') || "0") && (
                                <div className="px-3 py-1.5 bg-neutral-900 border border-dashed border-neutral-700 rounded text-xs font-bold text-neutral-600">
                                  Set {dailySets[ex.slotName || ex.name || "Incline Press"].length + 1}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="mt-12 mb-8">
                        <button
                          onClick={completeMission}
                          className="w-full py-6 bg-white hover:bg-neutral-200 text-black font-black uppercase tracking-[0.2em] text-sm md:text-base rounded-full transition-all shadow-[0_0_30px_rgba(255,255,255,0.098)] hover:shadow-[0_0_50px_rgba(255,255,255,0.163)] flex items-center justify-center gap-3"
                        >
                          <CheckCircle2 size={20} className="text-black" />
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
            className="fixed inset-0 z-[100] bg-black overflow-y-auto custom-scrollbar"
          >
            <div className="max-w-4xl mx-auto h-full pt-12 pb-24 px-4 md:px-8">
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
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 overflow-y-auto"
            onClick={closeFlexTracker}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#151515] border border-neutral-800 rounded-[2.5rem] p-8 max-w-lg w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closeFlexTracker}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                ✕
              </button>
              
              <div className="text-xs font-bold tracking-widest text-neutral-500 uppercase mb-4">Flexibility Protocol</div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-6 uppercase tracking-wide leading-tight">
                {activeFlexExercise.slotName || activeFlexExercise.name || "Stretching Exercise"}
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col">
                  <div className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    Repeat for {activeFlexExercise.sets} Sets
                  </div>
                </div>
                
                {activeFlexExercise.notes && (
                  <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                    <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2">Execution Notes</div>
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
                className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-center flex items-center justify-center gap-3 hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.13)]"
              >
                <PlayCircle size={24} />
                Watch Form Tutorial
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <TrackPageContent />
    </Suspense>
  );
}
