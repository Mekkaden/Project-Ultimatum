"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { montserrat } from "@/app/fonts";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, Play, ChevronRight, X, AlertTriangle, Dumbbell, Heart, LogOut, Loader2, Info, BookOpen, PlayCircle, Settings, CheckSquare, Accessibility, Activity, RefreshCw, Layers, CalendarRange } from "lucide-react";
import { useOfflineSession } from "../../lib/useOfflineSession";

import { CAMPAIGN_5_DAY, CAMPAIGN_CUSTOM, WorkoutDay, Campaign } from "../../lib/workout-data";
import { getLocalCampaign, getLocalFlexibilityCampaign } from "../../lib/get-campaign";
import { getAuthHeaders } from "../../lib/utils";
import CustomSplitBuilder from "../../components/CustomSplitBuilder";
import { ProgressionModal } from "../../components/ProgressionModal";
import { TrainingGuideModal } from "../../components/TrainingGuideModal";
import { InPlaceConfigModal } from "../../components/InPlaceConfigModal";
import CardioTracker from "../../components/CardioTracker";
import HabitTracker from "../../components/HabitTracker";
import {
  isDayComplete,
  isDayRecorded,
  migrateLegacyDayRecords,
  readCampaignDay,
  todayISO,
  writeCampaignDay,
} from "../../lib/day-completion";


/**
 * Reads an `"true"`/`"false"` flag from localStorage, tolerating private mode
 * and unavailable storage.
 */
function readFlag(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

export default function CampaignPage() {
  const { data: session, status, isOffline } = useOfflineSession();
  const [campaign, setCampaign] = useState<Campaign>(CAMPAIGN_5_DAY); // Defaulting to 5-day for prototype
  const [currentDayIndex, setCurrentDayIndex] = useState(0); // resistance cursor, 0 = Day 1
  const [flexDayIndex, setFlexDayIndex] = useState(0); // flexibility cursor, independent of resistance
  const [routineMode, setRoutineModeState] = useState<"resistance" | "cardio" | "habits" | "flexibility">("resistance");
  const [flexTier, setFlexTier] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO">("BEGINNER");
  // Seeded from storage on the first render rather than defaulting to false and
  // correcting in an effect. Defaulting meant a configured protocol painted as
  // "Cardio Inactive" / locked flexibility until the mount effect ran, and if
  // that effect was beaten by a slow start or a process restore, the screen
  // kept saying "not configured" even though the settings were on disk.
  const [hasCardio, setHasCardio] = useState(() => readFlag("ultimatum_cardio_enabled"));
  const [hasFlex, setHasFlex] = useState(() => readFlag("ultimatum_flex_enabled"));
  
  const setRoutineMode = (mode: "resistance" | "cardio" | "habits" | "flexibility") => {
    setRoutineModeState(mode);
    sessionStorage.setItem("ultimatum_routine_mode", mode);
  };
  
  // A custom directive with no deployed split belongs in the builder from the
  // very first paint. Deciding this after `getLocalCampaign()` has run made the
  // home screen render for a frame and then swap out — the visible flash.
  const [isBuilderMode, setIsBuilderMode] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      if (localStorage.getItem("ultimatum_frequency") !== "custom") return false;
      const cached = localStorage.getItem("ultimatum_custom_campaign_cache");
      if (!cached) return true;
      const parsed = JSON.parse(cached);
      return !(parsed?.days?.length > 0);
    } catch {
      return false;
    }
  });
  const [isFetchingCustomSplit, setIsFetchingCustomSplit] = useState(false); // Only true when we explicitly need to fetch a custom split from the DB
  const [isProgressionModalOpen, setIsProgressionModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configModalMode, setConfigModalMode] = useState<"cardio" | "flexibility">("cardio");
  const [pendingDayChange, setPendingDayChange] = useState<{ index: number; day: WorkoutDay } | null>(null);
  const [cloudSyncWarning, setCloudSyncWarning] = useState(false);
  const [retryingSync, setRetryingSync] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Read the cloud-sync warning flag set by the auth flow (save/hydration failure).
  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem("ultimatum_cloud_sync_warning") === "true") {
        setCloudSyncWarning(true);
      }
    } catch {}
  }, []);

  const handleRetrySync = async () => {
    setRetryingSync(true);
    try {
      const { loadUserSettingsFromCloud, saveUserSettingsToCloud } = await import("@/lib/syncService");
      // Reconcile both directions: restore anything missing from cloud, then
      // push current local data back up (idempotent upsert).
      await loadUserSettingsFromCloud();
      await saveUserSettingsToCloud();
      try { sessionStorage.removeItem("ultimatum_cloud_sync_warning"); } catch {}
      setCloudSyncWarning(false);
    } catch (err) {
      console.error("[campaign] Manual cloud sync failed:", err);
    } finally {
      setRetryingSync(false);
    }
  };

  // Opening a day makes it the day being trained, so "Up Next" follows what the
  // user is actually doing. Without this, training an out-of-order day forced
  // them to press "Mark Day Complete" on every earlier day just to advance the
  // cursor.
  const goToDay = (index: number) => {
    // Each routine mode owns its own cursor. Writing one shared index was what
    // made a completed resistance day show up as a completed flexibility day.
    if (routineMode === "flexibility") {
      if (index !== flexDayIndex) {
        setFlexDayIndex(index);
        writeCampaignDay("flexibility", index);
      }
    } else if (index !== currentDayIndex) {
      setCurrentDayIndex(index);
      writeCampaignDay("resistance", index);
    }
    router.push(`/campaign/track?day=${index}&mode=${routineMode}`);
  };

  // Tapping a day that is not "Up Next" asks before it becomes the next day.
  // Without this, browsing the split silently rewrote the recommendation.
  const openDay = (index: number) => {
    if (index === todaysIndex) {
      goToDay(index);
      return;
    }
    const day = timelineDays[index];
    if (!day) return;
    setPendingDayChange({ index, day });
  };

  // Re-render the timeline when the user comes back to the app so a day
  // completed elsewhere (tracker) is reflected without a manual reload.
  const [, setDayTick] = useState(0);
  useEffect(() => {
    const refresh = () => {
      // Protocol configuration can change while this screen is backgrounded
      // (deployed from the library, restored from cloud, or edited elsewhere),
      // so re-read the flags rather than trusting what was on screen.
      setHasCardio(readFlag("ultimatum_cardio_enabled"));
      setHasFlex(readFlag("ultimatum_flex_enabled"));
      // The tracker owns the cursor while it is open. Re-read both tracks when
      // the user comes back so the correct day is "Up Next" in this mode.
      const resistanceDay = readCampaignDay("resistance");
      if (resistanceDay !== null) setCurrentDayIndex(resistanceDay);
      const flexibilityDay = readCampaignDay("flexibility");
      if (flexibilityDay !== null) setFlexDayIndex(flexibilityDay);
      setDayTick((t) => t + 1);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Resolve campaign — pulls from cloud if this device has no local settings yet
  useEffect(() => {
    const savedFreq = localStorage.getItem("ultimatum_frequency");

    // Helper: read all local settings and apply them to state
    const applyLocalSettings = () => {
      setHasCardio(localStorage.getItem("ultimatum_cardio_enabled") === "true");
      setHasFlex(localStorage.getItem("ultimatum_flex_enabled") === "true");
      const activeCampaign = getLocalCampaign();

      const savedDay = readCampaignDay("resistance");
      if (savedDay !== null) {
        setCurrentDayIndex(savedDay);
      }
      const savedFlexDay = readCampaignDay("flexibility");
      if (savedFlexDay !== null) {
        setFlexDayIndex(savedFlexDay);
      }
      // Move pre-v2 completion records into the campaign-scoped format. The
      // legacy cursor is deliberately not migrated: it may belong to the other
      // routine mode.
      migrateLegacyDayRecords(activeCampaign);
      migrateLegacyDayRecords(getLocalFlexibilityCampaign());

      const savedFlexTier = localStorage.getItem("ultimatum_flex_tier") as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO" | null;
      if (savedFlexTier) setFlexTier(savedFlexTier);

      const savedRoutineMode = sessionStorage.getItem("ultimatum_routine_mode") as "resistance" | "cardio" | "habits" | "flexibility" | null;
      if (savedRoutineMode) setRoutineModeState(savedRoutineMode);

      return activeCampaign;
    };

    // If this device already has settings, resolve instantly (fast path)
    if (savedFreq) {
      const activeCampaign = applyLocalSettings();

      if (savedFreq !== "custom") {
        setCampaign(activeCampaign);
        return;
      }

      // Custom splits: try to load from cache synchronously first
      let hasCache = false;
      try {
        const cachedCustom = localStorage.getItem("ultimatum_custom_campaign_cache");
        if (cachedCustom) {
          const parsed = JSON.parse(cachedCustom);
          if (parsed?.days?.length > 0) {
            setCampaign(parsed as Campaign);
            setIsBuilderMode(false);
            hasCache = true;
          }
        }
      } catch {}

      if (!hasCache) {
        setIsFetchingCustomSplit(true);
      }
      return;
    }

    // NEW DEVICE: No local frequency found — pull settings from cloud first
    // This is the critical path that was missing and caused the wrong split on new devices.
    let cancelled = false;

    (async () => {
      try {
        const { loadUserSettingsFromCloud } = await import("@/lib/syncService");
        await loadUserSettingsFromCloud();
      } catch (err) {
        console.error("Failed to load settings from cloud on new device:", err);
      }

      if (cancelled) return;

      // After cloud sync, re-read localStorage (now populated) and resolve
      const restoredFreq = localStorage.getItem("ultimatum_frequency");
      const activeCampaign = applyLocalSettings();

      if (!restoredFreq || restoredFreq !== "custom") {
        setCampaign(activeCampaign);
        return;
      }

      // Custom split on a new device — the cache was just restored from cloud
      try {
        const cachedCustom = localStorage.getItem("ultimatum_custom_campaign_cache");
        if (cachedCustom) {
          const parsed = JSON.parse(cachedCustom);
          if (parsed?.days?.length > 0) {
            setCampaign(parsed as Campaign);
            setIsBuilderMode(false);
            return;
          }
        }
      } catch {}

      // Still nothing — open builder
      setCampaign(CAMPAIGN_CUSTOM);
      setIsBuilderMode(true);
      setIsFetchingCustomSplit(true);
    })();

    return () => { cancelled = true; };
  }, []); // Run once on mount

  const getFlexibilityCampaign = () => {
    return getLocalFlexibilityCampaign();
  };

  const displayCampaign = routineMode === "flexibility" ? getFlexibilityCampaign() : campaign;
  const displayCursor = routineMode === "flexibility" ? flexDayIndex : currentDayIndex;
  const displayScope = displayCampaign.id || "default";
  // Days visible for the active routine mode. Flexibility is hidden when the
  // protocol was never configured.
  const timelineDays: WorkoutDay[] =
    routineMode === "flexibility" && !hasFlex ? [] : displayCampaign.days;
  const todaysIndex =
    timelineDays.length > 0 ? Math.min(Math.max(displayCursor, 0), timelineDays.length - 1) : -1;
  const todaysDay = todaysIndex >= 0 ? timelineDays[todaysIndex] : null;
  const todaysComplete = mounted && todaysDay
    ? isDayComplete(todaysDay, todaysIndex, displayScope, todayISO())
    : false;
  // The block is finished only when every day has a completion record, not when
  // the cursor happens to reach the end — days can be trained in any order.
  // A deployed custom split has real days; the CAMPAIGN_CUSTOM stub has none.
  // Editing an existing split seeds the builder from it, while a first-time
  // setup starts from a blank day.
  const hasDeployedSplit = (campaign?.days?.filter((d) => d.exercises?.length).length ?? 0) > 0;
  const builderSessionKey = hasDeployedSplit ? `edit-${campaign?.id}` : "new";

  const allDaysComplete =
    mounted &&
    timelineDays.length > 0 &&
    timelineDays.every((day, index) => isDayRecorded(day, index, displayScope));

  // Separate effect for the async DB fetch (only runs for custom splits)
  useEffect(() => {
    // If offline or session timed out, bail out gracefully from DB load
    if (!isFetchingCustomSplit) return;
    if (isOffline || (status !== "loading" && !session?.user?.email)) {
      // No live session — check if we have a locally cached split before opening builder
      try {
        const cachedCustom = localStorage.getItem("ultimatum_custom_campaign_cache");
        if (cachedCustom) {
          const parsed = JSON.parse(cachedCustom);
          if (parsed?.days?.length > 0) {
            setCampaign(parsed as Campaign);
            setIsBuilderMode(false);
            setIsFetchingCustomSplit(false);
            return;
          }
        }
      } catch {}
      // No cached split either — open builder so user can set up a custom split later
      setCampaign(CAMPAIGN_CUSTOM);
      setIsBuilderMode(true);
      setIsFetchingCustomSplit(false);
      return;
    }
    if (status === "loading") return; // Still waiting, hook will timeout if needed

    async function loadCustomSplit() {
      try {
        const syncUrl = typeof window !== "undefined" && window.location.hostname === "localhost"
          ? "/api/sync"
          : "https://www.ultimatum.website/api/sync";

        let customSplitFound = false;

        // 1. Try direct Firestore cloud sync first
        try {
          const { loadUserSettingsFromCloud } = await import("@/lib/syncService");
          await loadUserSettingsFromCloud();
          const cachedCustom = localStorage.getItem("ultimatum_custom_campaign_cache");
          if (cachedCustom) {
            const parsed = JSON.parse(cachedCustom);
            if (parsed?.days?.length > 0) {
              setCampaign(parsed as Campaign);
              setIsBuilderMode(false);
              customSplitFound = true;
            }
          }
        } catch {
          // Bypassed if unauthenticated or offline
        }

        // 2. If not found in direct Firestore, query sync endpoint
        if (!customSplitFound) {
          try {
            const res = await fetch(syncUrl, {
              headers: getAuthHeaders(),
            });
            
            if (res.ok) {
              const { data } = await res.json();
              if (data?.ultimatum_custom_campaign_cache) {
                localStorage.setItem("ultimatum_custom_campaign_cache", data.ultimatum_custom_campaign_cache);
                setCampaign(JSON.parse(data.ultimatum_custom_campaign_cache) as Campaign);
                setIsBuilderMode(false);
                customSplitFound = true;
              }
            }
          } catch {
            // Gracefully catch network or CORS error
          }
        }

        // 3. Fallback to local cache before opening builder
        if (!customSplitFound) {
          try {
            const cachedCustom = localStorage.getItem("ultimatum_custom_campaign_cache");
            if (cachedCustom) {
              const parsed = JSON.parse(cachedCustom);
              if (parsed?.days?.length > 0) {
                setCampaign(parsed as Campaign);
                setIsBuilderMode(false);
                return;
              }
            }
          } catch {}
          setCampaign(CAMPAIGN_CUSTOM);
          setIsBuilderMode(true);
        }
      } catch (err) {
        console.warn("Could not load custom split, falling back to local:", err);
        try {
          const cachedCustom = localStorage.getItem("ultimatum_custom_campaign_cache");
          if (cachedCustom) {
            const parsed = JSON.parse(cachedCustom);
            if (parsed?.days?.length > 0) {
              setCampaign(parsed as Campaign);
              setIsBuilderMode(false);
              return;
            }
          }
        } catch {}
        setCampaign(CAMPAIGN_CUSTOM);
        setIsBuilderMode(true);
      } finally {
        setIsFetchingCustomSplit(false);
      }
    }

    loadCustomSplit();
  }, [isFetchingCustomSplit, session, status, isOffline]);

  // Mission completion is now handled in the tracking page, so we don't need completeMission here anymore.


  const handleResetWeek = () => {
    if (routineMode === "flexibility") {
      setFlexDayIndex(0);
      writeCampaignDay("flexibility", 0);
    } else {
      setCurrentDayIndex(0);
      writeCampaignDay("resistance", 0);
    }
  };

  const handleCustomDeploy = (deployedCampaign: Campaign) => {
    // The just-deployed split MUST win. "ultimatum_campaign_override" holds a
    // snapshot of a previous split's days and takes priority over everything in
    // getLocalCampaign(), so leaving it in place made the routine screen show
    // the new split while /campaign/track silently loaded the old one (e.g.
    // tapping "Full Body 1" opened "Push Day"). Clear it on every deploy.
    try {
      localStorage.removeItem("ultimatum_campaign_override");
    } catch {
      // localStorage unavailable — the in-memory campaign below still applies.
    }
    setCampaign(deployedCampaign);
    setIsBuilderMode(false);
    setCurrentDayIndex(0);
    writeCampaignDay("resistance", 0);
  };

  // Only block render for custom split DB fetches — auth loading is handled gracefully

const EmptyProtocolState = ({ title, description, onConfigure }: { title: string, description: string, onConfigure: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6">
      <Lock className="text-neutral-500" size={24} />
    </div>
    <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">{title}</h3>
    <p className="text-sm text-neutral-400 max-w-md mx-auto mb-8 leading-relaxed">
      {description}
    </p>
    <button 
      onClick={onConfigure}
      className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-transform shadow-sm"
    >
      Configure Protocol
    </button>
  </div>
);

  // Hold the loading screen while a custom split is being resolved AND while the
  // builder is about to take over. Releasing it one render early showed the home
  // screen for a frame before the builder replaced it (the flash).
  if (
    isFetchingCustomSplit &&
    (isBuilderMode || (campaign?.id === "custom-code-split" && (!campaign.days || campaign.days.length === 0)))
  ) {
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
          key={routineMode}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0 }}
          src={routineMode === "cardio" ? "/new%20images/cardio2.jpg" : routineMode === "habits" ? "/NEWCOVERS/habits-bg-v2.png" : routineMode === "flexibility" ? "/leopard5343.jpg" : "/new%20images/routinemain.jpg"} 
          className="w-full h-full object-cover object-[center_65%] grayscale-[60%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/90"></div>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col relative z-10">

        {/* Cloud sync warning banner — shown when the auth flow failed to save/restore to Firestore */}
        {cloudSyncWarning && (
          <div className="mb-4 w-full flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-amber-300 text-xs md:text-sm font-medium">
              <AlertTriangle size={16} className="shrink-0" />
              <span>Your protocol could not be synced to the cloud. Retry to prevent data loss on reinstall.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRetrySync}
                disabled={retryingSync}
                className="px-3 py-1.5 bg-amber-500 text-black text-[11px] font-black uppercase tracking-wider rounded-full hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                {retryingSync ? "Syncing..." : "Retry"}
              </button>
              <button
                onClick={() => setCloudSyncWarning(false)}
                className="text-amber-300/60 hover:text-amber-300 transition-colors"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Top Navigation / Action Bar — the builder has its own header. */}
        <div className={`w-full justify-between items-center gap-4 mb-6 relative ${isBuilderMode ? "hidden" : "flex"}`}>
          <div className="flex-1"></div>
          
          <div className="relative">
            {!isBuilderMode && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 bg-neutral-950/80 backdrop-blur border border-neutral-800/80 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.195)]"
              >
                <Settings size={18} className={isMenuOpen ? "rotate-90 transition-transform" : "transition-transform"} />
              </button>
            )}

            <AnimatePresence>
              {isMenuOpen && !isBuilderMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-48 bg-[#111] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl z-50 flex flex-col"
                >
                  <button
                    onClick={() => { setIsGuideModalOpen(true); setIsMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors border-b border-neutral-800"
                  >
                    <Info size={14} />
                    <span>Guide</span>
                  </button>

                  <button
                    onClick={() => { setIsMenuOpen(false); router.push("/splits"); }}
                    className="flex items-center gap-3 px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors border-b border-neutral-800"
                  >
                    <Layers size={14} />
                    <span>Split Library</span>
                  </button>
                  
                  {campaign?.id === "custom-code-split" && (
                    <button
                      onClick={() => { setIsBuilderMode(true); setIsMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                    >
                      <Settings size={14} />
                      <span>Edit Split</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {isBuilderMode ? (
          <CustomSplitBuilder 
            key={builderSessionKey}
            onDeploy={handleCustomDeploy} 
            onCancel={hasDeployedSplit ? () => setIsBuilderMode(false) : undefined}
            initialCampaign={hasDeployedSplit && campaign?.id === "custom-code-split" ? campaign : undefined} 
          />
        ) : (
          <>
            {/* Header & Mode Toggle */}
            <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="text-sm font-bold tracking-[0.3em] uppercase text-neutral-500 mb-2 mt-4 md:mt-0">
                  Active Directive
                </div>
                <h1 className="text-2xl md:text-4xl font-black uppercase tracking-wider mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.195)]">
                  {routineMode === "resistance" ? (
                    displayCampaign.title.match(/\(([^)]+)\)/) ? displayCampaign.title.match(/\(([^)]+)\)/)?.[1] : (displayCampaign.title.includes(':') ? displayCampaign.title.split(':')[1].trim() : displayCampaign.title)
                  ) : routineMode === "cardio" ? "Cardio Protocol" : routineMode === "flexibility" ? "Flexibility Protocol" : "Daily Protocol"}
                </h1>
              </div>

              {/* Mode Toggle Switch */}
              <div className="flex bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10 self-center md:self-auto w-full md:w-auto max-w-[350px]">
                <button
                  onClick={() => setRoutineMode("resistance")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 outline-none focus:outline-none ${
                    routineMode === "resistance"
                      ? "bg-white text-black shadow-sm"
                      : "text-neutral-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Dumbbell size={14} />
                  <span className="hidden md:inline">Weights</span>
                </button>
                <button
                  onClick={() => setRoutineMode("cardio")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 outline-none focus:outline-none ${
                    routineMode === "cardio"
                      ? "bg-[#ff3333] text-white shadow-sm"
                      : "text-neutral-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Heart size={14} />
                  <span className="hidden md:inline">Cardio</span>
                </button>
                <button
                  onClick={() => setRoutineMode("habits")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 outline-none focus:outline-none ${
                    routineMode === "habits"
                      ? "bg-[#e4fcaf] text-black shadow-sm"
                      : "text-neutral-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <CheckSquare size={14} />
                  <span className="hidden md:inline">Habits</span>
                </button>
                <button
                  onClick={() => setRoutineMode("flexibility")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 outline-none focus:outline-none ${
                    routineMode === "flexibility"
                      ? "bg-[#3366ff] text-white shadow-sm"
                      : "text-neutral-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Accessibility size={14} />
                  <span className="hidden md:inline">Flex</span>
                </button>
              </div>
            </div>

        {/* Content based on Mode */}
        {routineMode === "habits" ? (
          <HabitTracker />
        ) : routineMode === "cardio" ? (
          hasCardio ? <CardioTracker /> : <EmptyProtocolState title="Cardio Inactive" description="You did not configure a cardiovascular protocol during setup. Reconfigure your directive to unlock this." onConfigure={() => { setConfigModalMode("cardio"); setIsConfigModalOpen(true); }} />
        ) : (
          <>
            {routineMode === "flexibility" && (
              hasFlex ? (
                <div className="flex justify-center md:justify-start gap-4 mb-6 ml-4 md:ml-8">
                  {["BEGINNER", "INTERMEDIATE", "ADVANCED", "PRO"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => {
                        setFlexTier(tier as any);
                        localStorage.setItem("ultimatum_flex_tier", tier);
                      }}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                        flexTier === tier
                          ? "bg-white text-black shadow-sm"
                          : "bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-white"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyProtocolState title="Flexibility Inactive" description="You did not configure a flexibility protocol during setup. Reconfigure your directive to unlock this." onConfigure={() => { setConfigModalMode("flexibility"); setIsConfigModalOpen(true); }} />
              )
            )}
            {/* The current day, promoted to the top of the page. No auto-scroll:
                the day being trained is simply the first thing the user sees. */}
            {todaysDay && (
                <div className="max-w-xl mx-auto w-full px-4 pt-2 pb-1 relative z-10">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-500">
                      Up Next
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-600">
                      Day {todaysDay.dayNumber} / {timelineDays.length}
                    </span>
                  </div>
                  <motion.button
                    key={`current-${todaysDay.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    onClick={() => openDay(todaysIndex)}
                    className="w-full text-left relative overflow-hidden rounded-3xl md:rounded-[2rem] border border-white/25 bg-gradient-to-br from-neutral-800 to-neutral-900 p-5 md:p-6 shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:border-white/40 transition-all active:scale-[0.995]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-neutral-700/60 pr-4">
                        <span className="text-[9px] font-bold tracking-widest uppercase mb-1 text-neutral-400">DAY</span>
                        <span className="text-2xl font-black leading-none text-white">{todaysDay.dayNumber}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-base font-black uppercase tracking-wider leading-tight text-white">
                          {todaysDay.title}
                        </h3>
                        <div className="mt-2 text-[10px] font-bold tracking-wider uppercase text-neutral-400" suppressHydrationWarning>
                          {todaysDay.isRestDay
                            ? "CNS Recovery"
                            : `${todaysDay.exercises.reduce((sum, ex) => sum + ex.sets, 0)} Working Sets`}
                          {todaysComplete && <span className="text-emerald-400"> · Done</span>}
                        </div>
                      </div>
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black shrink-0">
                        <Play size={16} fill="currentColor" />
                      </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-white/10">
                      <span className="block w-full py-3.5 bg-white text-black text-center font-black uppercase tracking-[0.2em] text-xs rounded-full" suppressHydrationWarning>
                        {todaysComplete ? "Train Again" : "Get Started"}
                      </span>
                    </div>
                  </motion.button>
                </div>
            )}

            {/* Divider: everything above is "what to do now", everything below
                is the full split. */}
            <div className="max-w-xl mx-auto w-full px-4 pt-7 pb-1 relative z-10">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500">
                  Your Split
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-600" suppressHydrationWarning>
                  · {mounted ? timelineDays.filter((d, i) => isDayComplete(d, i, displayScope, todayISO())).length : 0}/{timelineDays.length} done
                </span>
              </div>
            </div>

            {/* The Campaign Timeline — every day is open. The current day is
                included so the list stays a complete, stable record. */}
        <div className="flex flex-col gap-3 pb-4 max-w-xl mx-auto w-full px-4 relative z-10">
          {timelineDays.map((day, index) => {
            const isCurrent = index === todaysIndex;
            const isCompleted = mounted && isDayComplete(day, index, displayScope, todayISO());

            return (
              <motion.div 
                key={day.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative scroll-mt-24"
              >
                <div 
                  onClick={() => openDay(index)}
                  className={`group relative overflow-hidden rounded-3xl md:rounded-[2rem] border p-5 md:p-6 transition-all duration-300 flex flex-col justify-center cursor-pointer hover:border-neutral-600 hover:bg-neutral-900/60
                    ${isCurrent ? "border-dashed border-neutral-700 bg-neutral-950/20" : "border-neutral-800 bg-neutral-950/40"}
                    ${isCurrent ? "opacity-55 hover:opacity-90" : isCompleted ? "opacity-70 hover:opacity-100" : ""}
                  `}
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Day Number */}
                    <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-neutral-800/50 pr-4 mr-4">
                      <span className={`text-[9px] font-bold tracking-widest uppercase mb-1 ${isCompleted ? "text-neutral-600" : "text-neutral-500"}`}>DAY</span>
                      <span className={`text-xl font-black leading-none ${isCompleted ? "text-neutral-500" : "text-white"}`}>{day.dayNumber}</span>
                    </div>

                    {/* Middle: Title & Stats */}
                    <div className="flex-1 flex flex-col justify-center">
                      {(() => {
                        const match = day.title.match(/^(.*?)\s*([\(\+].*)$/);
                        if (match) {
                          return (
                            <div className="flex flex-col gap-1">
                              <h3 className={`text-sm md:text-base font-black uppercase tracking-wider leading-none ${isCompleted ? "text-neutral-500" : "text-white"}`}>
                                {match[1].trim()}
                              </h3>
                              <div className={`text-[9px] md:text-[10px] font-bold tracking-wider uppercase ${isCompleted ? "text-neutral-700" : "text-neutral-500"}`}>
                                {match[2].trim()}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <h3 className={`text-sm md:text-base font-black uppercase tracking-wider leading-none ${isCompleted ? "text-neutral-500" : "text-white"} mb-1`}>
                            {day.title}
                          </h3>
                        );
                      })()}
                      
                      <div className="mt-2 flex items-center gap-2">
                        {!day.isRestDay ? (
                          <div className={`text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${isCompleted ? "text-neutral-600" : "text-neutral-400"}`}>
                            {day.exercises.reduce((sum, ex) => sum + ex.sets, 0)} Working Sets
                          </div>
                        ) : (
                          <div className={`text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${isCompleted ? "text-neutral-600" : "text-neutral-500"}`}>
                            <RefreshCw size={12} className={isCompleted ? "text-neutral-600" : "text-neutral-500"} />
                            CNS Recovery
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Right: Status Icons */}
                    <div className="flex items-center justify-center pl-4 ml-auto">
                      {isCompleted ? (
                        <CheckCircle2 className="text-black" fill="white" size={24} strokeWidth={2} />
                      ) : (
                        <ChevronRight size={20} className="text-neutral-600 group-hover:text-white transition-colors" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {timelineDays.length > 0 && allDaysComplete && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 relative z-10 mb-10 flex flex-col items-center justify-center p-10 rounded-3xl border border-[#222] bg-gradient-to-b from-[#111] to-[black] shadow-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-700 mb-6">
              <CheckCircle2 className="text-white" size={24} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-8 text-center">
              Training Block Complete
            </h3>
            <button 
              onClick={handleResetWeek}
              className="group relative px-10 py-4 bg-black text-white font-black uppercase tracking-[0.2em] text-xs rounded-full border border-neutral-800 transition-all duration-300 hover:border-white/50 hover:shadow-md overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10">Deploy Next Week</span>
            </button>
          </motion.div>
        )}
          </>
        )}
          </>
        )}

      </div>

      <ProgressionModal 
        isOpen={isProgressionModalOpen} 
        onClose={() => setIsProgressionModalOpen(false)} 
      />

      <TrainingGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        mode={routineMode}
      />

      {/* Confirm before a browsed day replaces "Up Next" */}
      <AnimatePresence>
        {pendingDayChange && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPendingDayChange(null)}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-950 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-full bg-white/5 border border-neutral-800 flex items-center justify-center">
                  <CalendarRange size={16} className="text-neutral-300" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-600">
                  Day {pendingDayChange.day.dayNumber}
                </span>
              </div>

              <h2 className="text-base font-black uppercase tracking-wider text-white mb-2">
                Train {pendingDayChange.day.title} today?
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                Right now <span className="text-neutral-200 font-semibold">{todaysDay?.title ?? "the current day"}</span> is up next.
                Choosing this session moves your plan onto Day {pendingDayChange.day.dayNumber}.
              </p>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setPendingDayChange(null)}
                  className="flex-1 py-3 rounded-xl border border-neutral-800 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                >
                  Not now
                </button>
                <button
                  onClick={() => {
                    const { index } = pendingDayChange;
                    setPendingDayChange(null);
                    goToDay(index);
                  }}
                  className="flex-1 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.18em] hover:bg-neutral-200 transition-colors"
                >
                  Yes, train it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <InPlaceConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        mode={configModalMode}
        onConfigured={() => {
          if (configModalMode === "cardio") {
            setHasCardio(true);
          } else {
            setHasFlex(true);
            const savedFlexTier = localStorage.getItem("ultimatum_flex_tier") as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO" | null;
            if (savedFlexTier) setFlexTier(savedFlexTier);
          }
        }}
      />

    </main>
  );
}
