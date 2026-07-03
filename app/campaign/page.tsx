"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Montserrat } from "next/font/google";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, ChevronRight, X, AlertTriangle, Dumbbell, Heart, LogOut, Loader2, Info, BookOpen, PlayCircle } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import DecryptedText from "../../components/DecryptedText";
import { CAMPAIGN_3_DAY, CAMPAIGN_4_DAY, CAMPAIGN_5_DAY, CAMPAIGN_CUSTOM, CAMPAIGN_STRENGTH_3_DAY, CAMPAIGN_STRENGTH_4_DAY, CAMPAIGN_STRENGTH_6_DAY, CAMPAIGN_CALISTHENICS_3_DAY, CAMPAIGN_CALISTHENICS_4_DAY, CAMPAIGN_CALISTHENICS_6_DAY, CAMPAIGN_HYBRID_4_DAY, CAMPAIGN_HYBRID_6_DAY, WorkoutDay, Campaign } from "../../lib/workout-data";
import { supabase } from "../../lib/supabase";
import CustomSplitBuilder from "../../components/CustomSplitBuilder";
import { ProgressionModal } from "../../components/ProgressionModal";
import WorkoutTracker from "../../components/WorkoutTracker";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700", "900"] });

export default function CampaignPage() {
  const { data: session, status } = useSession();
  const [campaign, setCampaign] = useState<Campaign>(CAMPAIGN_5_DAY); // Defaulting to 5-day for prototype
  const [currentDayIndex, setCurrentDayIndex] = useState(0); // 0 = Day 1
  
  const [selectedMission, setSelectedMission] = useState<WorkoutDay | null>(null);
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [isProgressionModalOpen, setIsProgressionModalOpen] = useState(false);
  const [activeTrackingExercise, setActiveTrackingExercise] = useState<any>(null);
  const router = useRouter();

  // Load state from local storage and DB
  useEffect(() => {
    async function loadData() {
      // 1. Load basic frequency preference
      const savedFreq = localStorage.getItem("ultimatum_frequency");
      const savedDirective = localStorage.getItem("ultimatum_directive") || "hypertrophy";
      let activeCampaign = CAMPAIGN_5_DAY;

      if (savedDirective === "strength") {
        if (savedFreq === "3-days") activeCampaign = CAMPAIGN_STRENGTH_3_DAY;
        if (savedFreq === "4-days") activeCampaign = CAMPAIGN_STRENGTH_4_DAY;
        if (savedFreq === "6-days") activeCampaign = CAMPAIGN_STRENGTH_6_DAY;
        if (savedFreq === "custom") activeCampaign = CAMPAIGN_CUSTOM;
      } else if (savedDirective === "calisthenics") {
        if (savedFreq === "3-days") activeCampaign = CAMPAIGN_CALISTHENICS_3_DAY;
        if (savedFreq === "4-days") activeCampaign = CAMPAIGN_CALISTHENICS_4_DAY;
        if (savedFreq === "6-days") activeCampaign = CAMPAIGN_CALISTHENICS_6_DAY;
        if (savedFreq === "custom") activeCampaign = CAMPAIGN_CUSTOM;
      } else if (savedDirective === "hybrid") {
        if (savedFreq === "4-days") activeCampaign = CAMPAIGN_HYBRID_4_DAY;
        if (savedFreq === "6-days") activeCampaign = CAMPAIGN_HYBRID_6_DAY;
      } else {
        if (savedFreq === "3-days") activeCampaign = CAMPAIGN_3_DAY;
        if (savedFreq === "4-days") activeCampaign = CAMPAIGN_4_DAY;
        if (savedFreq === "custom") activeCampaign = CAMPAIGN_CUSTOM;
      }
      
      // Load saved day progression
      const savedDay = localStorage.getItem("ultimatum_campaign_day");
      if (savedDay) {
        setCurrentDayIndex(parseInt(savedDay, 10));
      }

      // 2. If it's a custom campaign, we must fetch their stored JSON from Supabase
      if (savedFreq === "custom" && session?.user?.email) {
        try {
          const { data, error } = await supabase
            .from("User")
            .select("customSplitData")
            .eq("email", session.user.email)
            .single();
          
          if (data?.customSplitData) {
            // User already has a custom built protocol
            setCampaign(data.customSplitData as Campaign);
            setIsBuilderMode(false);
          } else {
            // User selected custom but hasn't built it yet
            setCampaign(CAMPAIGN_CUSTOM);
            setIsBuilderMode(true);
          }
        } catch (err) {
          console.error("Failed to load custom split", err);
          setCampaign(CAMPAIGN_CUSTOM);
          setIsBuilderMode(true); // Default to builder on fail just in case
        }
      } else {
        setCampaign(activeCampaign);
      }
      setIsLoadingDB(false);
    }
    
    if (status !== "loading") {
      loadData();
    }
  }, [session, status]);

  const completeMission = () => {
    if (selectedMission) {
      const nextDay = Math.min(currentDayIndex + 1, campaign.days.length);
      setCurrentDayIndex(nextDay);
      localStorage.setItem("ultimatum_campaign_day", nextDay.toString());
      setSelectedMission(null);
    }
  };

  const handleResetWeek = () => {
    setCurrentDayIndex(0);
    localStorage.setItem("ultimatum_campaign_day", "0");
  };

  const handleCustomDeploy = (deployedCampaign: Campaign) => {
    setCampaign(deployedCampaign);
    setIsBuilderMode(false);
    setCurrentDayIndex(0);
    localStorage.setItem("ultimatum_campaign_day", "0");
  };

  if (status === "loading" || isLoadingDB) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-white opacity-50" size={32} />
      </div>
    );
  }

  return (
    <main className={`relative min-h-screen w-full bg-black text-white py-20 px-4 md:px-8 overflow-x-hidden ${montserrat.className}`}>
      
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src="/pipi.webp" 
          alt="Campaign Background" 
          className="w-full h-full object-cover object-center mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black"></div>
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col relative z-10">
        
        {/* Top Navigation / Action Bar */}
        <div className="w-full flex justify-between items-center gap-4 mb-6 flex-wrap">
          <button
            onClick={() => router.push("/")}
            className="text-white font-black tracking-[0.3em] uppercase text-xl hover:text-red-500 transition-colors drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] flex-shrink-0"
          >
            ULTIMATUM
          </button>
          
          <div className="flex gap-4 items-center flex-wrap justify-end">
            <button
            onClick={() => router.push("/diet")}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 border border-red-500 rounded-lg text-sm font-black uppercase tracking-widest text-white hover:bg-red-500 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
          >
            <Heart size={16} />
            <span>Nutrition</span>
          </button>
          <button
            onClick={() => router.push("/doctrine")}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-950/80 backdrop-blur border border-neutral-800/80 rounded-lg text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white hover:border-white/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          >
            <BookOpen size={13} />
            <span>View Doctrine</span>
          </button>
          {campaign?.id.includes("calisthenics") && (
            <button
              onClick={() => setIsProgressionModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-950/80 backdrop-blur border border-emerald-800/80 rounded-lg text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-white hover:border-emerald-400/50 transition-all duration-300 shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
            >
              <Info size={13} />
              <span>View Progressions</span>
            </button>
          )}
          {campaign?.id === "custom-code-split" && !isBuilderMode && (
            <button
              onClick={() => setIsBuilderMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-950/80 backdrop-blur border border-neutral-800/80 rounded-lg text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white hover:border-white/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              <span>Edit Custom Split</span>
            </button>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-950/80 backdrop-blur border border-neutral-800/80 rounded-lg text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white hover:border-white/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
          </div>
        </div>

        <ProgressionModal 
          isOpen={isProgressionModalOpen} 
          onClose={() => setIsProgressionModalOpen(false)} 
        />

        {isBuilderMode ? (
          <CustomSplitBuilder 
            onDeploy={handleCustomDeploy} 
            onCancel={campaign?.id === "custom-code-split" ? () => setIsBuilderMode(false) : undefined}
            initialCampaign={campaign?.id === "custom-code-split" ? campaign : undefined} 
          />
        ) : (
          <>
            {/* Header */}
            <div className="mb-16 text-center md:text-left">
          <div className="text-sm font-bold tracking-[0.3em] uppercase text-neutral-500 mb-2">
            Active Directive
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <DecryptedText
              text={campaign.title}
              speed={50}
              maxIterations={15}
              characters="01!@#$%^&*?"
              animateOn="view"
            />
          </h1>
          <div className="inline-block bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-xs md:text-sm font-medium tracking-wide text-neutral-300">
            <span className="text-white font-bold mr-2">GLOBAL RULE:</span> 
            {campaign.globalRule}
          </div>
        </div>

        {/* The Campaign Timeline */}
        <div className="relative border-l-2 border-neutral-800 ml-4 md:ml-8 pl-8 md:pl-12 py-4 space-y-12">
          {campaign.days.map((day, index) => {
            const isCompleted = index < currentDayIndex;
            const isUnlocked = index === currentDayIndex;
            const isLocked = index > currentDayIndex;

            return (
              <motion.div 
                key={day.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative"
              >
                {/* Timeline Node */}
                <div className={`absolute -left-[41px] md:-left-[57px] top-6 w-5 h-5 rounded-full border-4 bg-black flex items-center justify-center z-10
                  ${isCompleted ? "border-emerald-500 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : ""}
                  ${isUnlocked ? "border-white bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]" : ""}
                  ${isLocked ? "border-neutral-700 bg-neutral-900" : ""}
                `}>
                  {isUnlocked && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-white opacity-40"></div>
                  )}
                </div>

                {/* Day Card */}
                <div 
                  onClick={() => {
                    if (isUnlocked || isCompleted) setSelectedMission(day);
                  }}
                  className={`group relative overflow-hidden rounded-xl border p-5 md:p-6 transition-all duration-300
                    ${isUnlocked ? "cursor-pointer border-white bg-neutral-900/60 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:bg-neutral-900" : ""}
                    ${isCompleted ? "cursor-pointer border-emerald-900/50 bg-emerald-950/20 hover:border-emerald-500/50" : ""}
                    ${isLocked ? "border-neutral-800/50 bg-neutral-950 opacity-40 grayscale pointer-events-none" : ""}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-xl font-black uppercase tracking-wider ${isCompleted ? "text-emerald-400" : "text-white"}`}>
                      DAY 0{day.dayNumber} <span className="text-neutral-500 mx-2">/</span> {day.title}
                    </h3>
                    
                    {isUnlocked && (
                      <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white bg-white/10 px-3 py-1 rounded-full border border-white/20">
                        Ready <ChevronRight size={14} />
                      </div>
                    )}
                    {isCompleted && (
                      <CheckCircle2 className="text-emerald-500" size={24} />
                    )}
                    {isLocked && (
                      <Lock className="text-neutral-600" size={20} />
                    )}
                  </div>
                  
                  {!day.isRestDay && (
                    <div className="text-sm font-medium text-neutral-400 mt-4 flex items-center gap-2">
                      <Dumbbell size={16} />
                      {day.totalSets} Total Working Sets
                    </div>
                  )}
                  {day.isRestDay && (
                    <div className="text-sm font-medium text-neutral-500 mt-4 italic">
                      Central Nervous System Recovery
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {currentDayIndex >= campaign.days.length && (
          <div className="mt-16 text-center relative z-10 mb-10">
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider text-emerald-500 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              TRAINING BLOCK COMPLETE
            </h3>
            <button 
              onClick={handleResetWeek}
              className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-sm md:text-base rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] hover:bg-neutral-200"
            >
              Start Next Week
            </button>
          </div>
        )}
          </>
        )}

      </div>

      {/* Mission Viewer Modal */}
      <AnimatePresence>
        {selectedMission && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-neutral-800 flex justify-between items-start bg-neutral-900/50">
                <div>
                  <div className="text-xs font-bold tracking-[0.3em] uppercase text-neutral-500 mb-2">
                    Mission Briefing
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-white">
                    Day 0{selectedMission.dayNumber}: {selectedMission.title}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedMission(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                
                {selectedMission.warning && (
                  <div className="mb-8 bg-red-950/30 border border-red-900/50 rounded-lg p-4 flex gap-4 items-start">
                    <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" size={24} />
                    <p className="text-red-200 text-sm leading-relaxed font-medium">
                      {selectedMission.warning}
                    </p>
                  </div>
                )}

                {selectedMission.isRestDay ? (
                  <div className="text-center py-12">
                    <Heart size={48} className="mx-auto text-neutral-700 mb-4" />
                    <h3 className="text-xl font-bold uppercase tracking-widest text-neutral-400 mb-2">Active Recovery</h3>
                    <p className="text-neutral-500 max-w-md mx-auto">
                      Stay out of the gym. Eat, sleep, and allow your central nervous system to repair the mechanical damage inflicted.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 pb-2 border-b border-neutral-800 text-xs font-bold uppercase tracking-widest text-neutral-500">
                      <div className="col-span-6 md:col-span-8">Exercise</div>
                      <div className="col-span-3 md:col-span-2 text-center">Sets</div>
                      <div className="col-span-3 md:col-span-2 text-center">RIR Target</div>
                    </div>
                    
                    {/* Exercise List */}
                    {selectedMission.exercises.map((ex, i) => (
                      <div 
                        key={i} 
                        className="flex flex-col py-4 border-b border-neutral-800/50 last:border-0 hover:bg-neutral-900 cursor-pointer rounded-lg px-2 -mx-2 transition-colors"
                        onClick={() => setActiveTrackingExercise(ex)}
                      >
                        <div className="grid grid-cols-12 gap-4 items-start">
                          <div className="col-span-6 md:col-span-8 flex flex-col">
                            <span className="font-black text-sm md:text-base text-white uppercase tracking-wide flex items-center gap-2">
                              {ex.prescribedEquipment}
                              {ex.videoUrl && (
                                <a 
                                  href={ex.videoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-red-500 hover:text-red-400 transition-colors"
                                  title="Watch Form Guide"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <PlayCircle size={16} className="inline-block" />
                                </a>
                              )}
                            </span>
                            <span className="text-xs md:text-sm text-neutral-400 font-medium mt-1">
                              Joint Action: <span className="text-white">{ex.slotName}</span>
                            </span>
                          </div>
                          <div className="col-span-3 md:col-span-2 text-center text-sm md:text-base font-medium text-neutral-400 pt-1">
                            {ex.sets}x
                          </div>
                          <div className="col-span-3 md:col-span-2 text-center text-sm md:text-base font-black text-emerald-400 pt-1">
                            {ex.targetRIR}
                          </div>
                        </div>
                        
                        {ex.notes && (
                          <div className="mt-2 text-xs text-neutral-500 font-medium italic">
                            * {ex.notes}
                          </div>
                        )}

                        {ex.substitutions && ex.substitutions.length > 0 && (
                          <details className="mt-3 group cursor-pointer">
                            <summary className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 list-none [&::-webkit-details-marker]:hidden">
                              <span className="group-open:rotate-90 transition-transform text-[8px]">▶</span>
                              Substitutions
                            </summary>
                            <div className="mt-2 pl-4 border-l border-neutral-800 flex flex-col gap-1.5 py-1">
                              {ex.substitutions.map((sub, idx) => (
                                <span key={idx} className="text-xs font-medium text-neutral-400 hover:text-white transition-colors">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 md:p-8 border-t border-neutral-800 bg-black">
                <button
                  onClick={completeMission}
                  disabled={selectedMission.dayNumber < currentDayIndex + 1}
                  className={`w-full py-5 font-black uppercase tracking-[0.2em] text-sm md:text-base rounded-xl transition-all duration-300
                    ${selectedMission.dayNumber < currentDayIndex + 1 
                      ? "bg-neutral-800 text-neutral-500 cursor-not-allowed" 
                      : "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] hover:bg-neutral-200"
                    }
                  `}
                >
                  {selectedMission.dayNumber < currentDayIndex + 1 ? "Mission Already Completed" : "Complete Mission"}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeTrackingExercise && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[60] bg-black overflow-y-auto pt-12 pb-24 px-4 md:px-8 custom-scrollbar"
          >
            <WorkoutTracker 
              exercise={activeTrackingExercise} 
              onClose={() => setActiveTrackingExercise(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
