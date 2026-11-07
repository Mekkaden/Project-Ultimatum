"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, AlertTriangle, ChevronRight, X, PlayCircle, Bot, Loader2, BedDouble, Dumbbell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthHeaders } from "@/lib/utils";
import { useOfflineSession } from "@/lib/useOfflineSession";
import type { Campaign, WorkoutDay, Exercise } from "../lib/workout-data";
import ExercisePicker from "./ExercisePicker";
import { resolveMovementName } from "@/lib/exercise-aliases";
import { matchCatalogueExercise, type NameMatch } from "@/lib/exercise-catalogue";

type BuilderTab = "manual" | "ai";

export default function CustomSplitBuilder({
  onDeploy,
  onCancel,
  initialCampaign,
}: {
  onDeploy: (campaign: Campaign) => void;
  onCancel?: () => void;
  initialCampaign?: Campaign;
}) {
  const { data: session } = useOfflineSession();
  const [activeTab, setActiveTab] = useState<BuilderTab>("manual");
  const [isDeploying, setIsDeploying] = useState(false);

  // Hide the global navigation bar while in builder mode
  useEffect(() => {
    document.body.classList.add('hide-global-nav');
    return () => {
      document.body.classList.remove('hide-global-nav');
    };
  }, []);

  // --- Manual Builder State ---
  const [days, setDays] = useState<WorkoutDay[]>(
    initialCampaign?.days && initialCampaign.days.length > 0
      ? initialCampaign.days
      : [
          {
            id: `custom-d1-${Date.now()}`,
            dayNumber: 1,
            isRestDay: false,
            title: "Custom Day 1",
            totalSets: 0,
            exercises: [],
          },
        ]
  );

  // Exercise picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{ dayIndex: number; exerciseIndex: number } | null>(null);
  // AI preview row the user is re-mapping through the catalogue picker.
  const [reviewTarget, setReviewTarget] = useState<{ dayIndex: number; exerciseIndex: number } | null>(null);

  // --- AI Import State ---
  const [splitText, setSplitText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  // Preview rows carry the catalogue resolution so the user can see what the
  // AI's free-text names were mapped to before anything is written.
  type PreviewExercise = { name: string; sets: number; targetRIR: string; match: NameMatch };
  const [parsePreview, setParsePreview] = useState<null | { title: string; isRestDay: boolean; exercises: PreviewExercise[] }[]>(null);

  // ---- Day / Exercise manipulation ----

  const addDay = (isRest = false) => {
    setDays((prev) => [
      ...prev,
      {
        id: `custom-d${prev.length + 1}-${Date.now()}`,
        dayNumber: prev.length + 1,
        isRestDay: isRest,
        title: isRest ? "REST" : `Day ${prev.length + 1}`,
        totalSets: 0,
        exercises: [],
      },
    ]);
  };

  const removeDay = (dayIndex: number) => {
    setDays((prev) => {
      // Build new objects instead of mutating the ones React/framer-motion is
      // still animating: a mutated array made the exiting node reference data
      // that no longer existed, which threw inside the animation loop.
      const next = prev
        .filter((_, idx) => idx !== dayIndex)
        .map((day, idx) => ({ ...day, dayNumber: idx + 1 }));
      return next.length > 0
        ? next
        : [
            {
              id: `custom-d1-${Date.now()}`,
              dayNumber: 1,
              isRestDay: false,
              title: "Custom Day 1",
              totalSets: 0,
              exercises: [],
            },
          ];
    });
  };

  const toggleRestDay = (dayIndex: number) => {
    setDays((prev) => {
      const next = [...prev];
      const day = { ...next[dayIndex] };
      day.isRestDay = !day.isRestDay;
      if (day.isRestDay) {
        day.title = "REST";
        day.exercises = [];
      } else {
        day.title = `Day ${dayIndex + 1}`;
      }
      next[dayIndex] = day;
      return next;
    });
  };

  const openPicker = (dayIndex: number, exerciseIndex: number) => {
    setPickerTarget({ dayIndex, exerciseIndex });
    setPickerOpen(true);
  };

  const handlePickerSelect = (slotName: string, prescribedEquipment: string, videoUrl?: string, isCustom?: boolean) => {
    if (!pickerTarget) return;
    const { dayIndex, exerciseIndex } = pickerTarget;
    setDays((prev) => {
      if (!prev[dayIndex]?.exercises?.[exerciseIndex]) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as WorkoutDay[];
      const ex = next[dayIndex].exercises[exerciseIndex];
      if (ex) {
        // Picker returns (joint action, movement). Stored shape keeps the two
        // separate so the tracker, analytics and Movement Database agree.
        ex.slotName = resolveMovementName(prescribedEquipment) ?? prescribedEquipment;
        ex.prescribedEquipment = prescribedEquipment;
        ex.isCustom = !!isCustom;
        if (videoUrl) ex.videoUrl = videoUrl;
        else delete ex.videoUrl;
      }
      return next;
    });
    setPickerTarget(null);
  };

  const addExercise = (dayIndex: number) => {
    setDays((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as WorkoutDay[];
      next[dayIndex].exercises.push({
        slotName: "",
        prescribedEquipment: "",
        sets: 3,
        targetRIR: "2-1",
        substitutions: [],
      });
      return next;
    });
    // Auto-open picker for the new exercise
    const newIdx = days[dayIndex].exercises.length;
    setTimeout(() => openPicker(dayIndex, newIdx), 50);
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    setDays((prev) =>
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day;
        const exercises = day.exercises.filter((_, i) => i !== exerciseIndex);
        return {
          ...day,
          exercises,
          totalSets: exercises.reduce((sum, ex) => sum + (Number(ex.sets) || 0), 0),
        };
      }),
    );
  };

  const updateExercise = (
    dayIndex: number,
    exerciseIndex: number,
    field: keyof Exercise,
    value: any
  ) => {
    setDays((prev) => {
      if (!prev[dayIndex]?.exercises?.[exerciseIndex]) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as WorkoutDay[];
      (next[dayIndex].exercises[exerciseIndex] as any)[field] =
        field === "sets" ? (value === "" ? "" : (parseInt(value) || 0)) : value;
      return next;
    });
  };

  const updateDayTitle = (dayIndex: number, title: string) => {
    setDays((prev) => {
      const next = [...prev];
      next[dayIndex] = { ...next[dayIndex], title };
      return next;
    });
  };

  // ---- AI Import ----

  // The system prompt is duplicated here so the direct Groq call (used inside
  // the Capacitor APK where there's no Next.js server) matches the server route.
  const PARSE_SYSTEM_PROMPT = `You are an expert workout split parser integrated into a fitness app called Project Ultimatum.

The user will paste a workout program in ANY format — from FitNotes exports, coach plans, Reddit posts, spreadsheets, or plain text.

Your job: parse it into structured JSON. Follow these rules strictly:
1. Include BOTH training days AND rest days.
2. For rest days, set "isRestDay": true, "exercises": [].
3. For training days, extract exercise name, sets, and RIR (Reps In Reserve). If RIR not specified, default to "2-1".
4. If the user gives reps (e.g. "3x10"), convert to targetRIR = "2-1" by default since this app uses RIR.
5. Day titles should be descriptive (e.g. "Push Day", "Upper Body A", "Legs", "REST").
6. Do not invent exercises that aren't in the text.
7. Parse as many days as you can find.

Return ONLY this exact JSON structure, nothing else, no markdown, no explanation:
{"days":[{"title":"Push Day","isRestDay":false,"exercises":[{"name":"Bench Press","sets":4,"targetRIR":"2-1"}]},{"title":"REST","isRestDay":true,"exercises":[]}]}`;

  const handleParseSplit = async () => {
    if (!splitText.trim()) return;
    setIsParsing(true);
    setParseError("");
    setParsePreview(null);
    try {
      // Detect Capacitor (APK context) — in native builds there's no Next.js server,
      // so we call Groq directly. On web we proxy through the server to keep the key hidden.
      const isCapacitor = typeof (window as any).Capacitor !== "undefined";

      if (isCapacitor) {
        // --- Direct Groq call (APK / Capacitor context) ---
        const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
        if (!groqKey) {
          setParseError("AI service not configured.");
          return;
        }
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: [
              { role: "system", content: PARSE_SYSTEM_PROMPT },
              { role: "user", content: splitText.trim() },
            ],
            temperature: 0.1,
            max_tokens: 3000,
            response_format: { type: "json_object" },
          }),
        });
        if (!groqRes.ok) {
          setParseError("AI service error. Try again.");
          return;
        }
        const groqData = await groqRes.json();
        const rawOutput: string = groqData.choices?.[0]?.message?.content ?? "";
        const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          setParseError("AI could not parse the split. Try pasting it in a cleaner format.");
          return;
        }
        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.days || !Array.isArray(parsed.days)) {
          setParseError("AI returned unexpected structure. Please try again.");
          return;
        }
        setParsePreview(resolvePreview(parsed.days));
      } else {
        // --- Server route call (Web context — key stays hidden on server) ---
        const res = await fetch("https://www.ultimatum.website/api/parse-split", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ splitText }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setParseError(data.error || "Failed to parse split.");
          return;
        }
        setParsePreview(resolvePreview(data.days));
      }
    } catch {
      setParseError("Network error. Check your connection.");
    } finally {
      setIsParsing(false);
    }
  };


  // Map every name the AI returned onto the catalogue, locally and
  // deterministically. Anything unrecognised stays as the user's own custom
  // exercise rather than silently becoming a different movement.
  const resolvePreview = (days: any[]): { title: string; isRestDay: boolean; exercises: PreviewExercise[] }[] =>
    days.map((d) => ({
      title: d.title ?? "Day",
      isRestDay: !!d.isRestDay,
      exercises: (d.exercises ?? []).map((ex: any) => {
        const name = String(ex.name ?? "").trim();
        return {
          name,
          sets: Number(ex.sets) || 3,
          targetRIR: ex.targetRIR || "2-1",
          match: name ? matchCatalogueExercise(name) : { movement: null, confidence: "none" as const, query: "" },
        };
      }),
    }));

  const openReviewPicker = (dayIndex: number, exerciseIndex: number) => {
    setReviewTarget({ dayIndex, exerciseIndex });
    setPickerOpen(true);
  };

  const handleApplyParsed = () => {
    if (!parsePreview) return;
    const newDays: WorkoutDay[] = parsePreview.map((d, idx) => ({
      id: `ai-d${idx + 1}-${Date.now()}`,
      dayNumber: idx + 1,
      isRestDay: d.isRestDay,
      title: d.title,
      totalSets: d.exercises.reduce((acc, ex) => acc + (ex.sets || 0), 0),
      exercises: d.exercises.map((ex) => {
        const movement = ex.match.movement;
        return {
          // Matched exercises become real catalogue movements, so form guides,
          // history and analytics all line up. Everything else stays exactly as
          // written and is flagged as a custom exercise.
          slotName: movement ? movement.name : ex.name,
          prescribedEquipment: movement ? movement.name : ex.name,
          sets: ex.sets || 3,
          targetRIR: ex.targetRIR || "2-1",
          substitutions: [],
          ...(movement?.videoUrl ? { videoUrl: movement.videoUrl } : {}),
          ...(movement ? {} : { isCustom: true }),
        };
      }),
    }));
    setDays(newDays);
    setActiveTab("manual");
    setParsePreview(null);
    setSplitText("");
  };

  // ---- Deploy ----

  const handleDeploy = async () => {
    if (!session?.user?.email) {
      alert("You must be logged in to deploy a custom split. Please sign in and try again.");
      return;
    }

    const hasAtLeastOneExercise = days.some((day) => !day.isRestDay && day.exercises.length > 0);
    if (!hasAtLeastOneExercise) {
      alert("Cannot deploy an empty split. Add at least one exercise to a training day.");
      return;
    }

    const unnamedExercise = days.some((day) =>
      day.exercises.some((ex) => !ex.slotName.trim())
    );
    if (unnamedExercise) {
      alert("Some exercises have no name. Please tap each exercise and select or type a name.");
      return;
    }

    const finalizedDays = days.map((day) => ({
      ...day,
      totalSets: day.exercises.reduce((acc, ex) => acc + (ex.sets || 0), 0),
    }));

    const customCampaign: Campaign = {
      id: "custom-code-split",
      title: "CUSTOM: OFF GRID",
      globalRule: "You dictate the rules. Total fatigue management is on you.",
      days: finalizedDays,
    };

    setIsDeploying(true);
    try {
      // Always save locally first — this never fails
      localStorage.setItem("ultimatum_custom_campaign_cache", JSON.stringify(customCampaign));
      // Ensure frequency is marked as "custom" so returning login knows data exists
      localStorage.setItem("ultimatum_frequency", "custom");
      onDeploy(customCampaign);

      // CRITICAL: Await cloud sync — this is what makes data survive logout+login
      if (session?.user?.id || session?.user?.email) {
        try {
          const { saveUserSettingsToCloud } = await import("@/lib/syncService");
          await Promise.race([
            saveUserSettingsToCloud(session.user?.id),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Sync timeout")), 15000))
          ]);
          console.log("[CustomSplitBuilder] Custom split synced to cloud.");
        } catch (syncErr) {
          console.error("[CustomSplitBuilder] Cloud sync failed — data still saved locally:", syncErr);
        }
      }
    } catch (e) {
      console.error(e);
      // Local save already happened above, so the protocol is deployed regardless
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <>
      <ExercisePicker
        isOpen={pickerOpen}
        onClose={() => { setPickerOpen(false); setReviewTarget(null); }}
        onSelect={(slotName, prescribedEquipment, videoUrl, isCustom) => {
          // Re-mapping a row of the AI preview before it is applied.
          if (reviewTarget) {
            const target = reviewTarget;
            setParsePreview((prev) =>
              prev
                ? prev.map((day, di) =>
                    di !== target.dayIndex
                      ? day
                      : {
                          ...day,
                          exercises: day.exercises.map((ex, ei) => {
                            if (ei !== target.exerciseIndex) return ex;
                            const movement = isCustom ? null : matchCatalogueExercise(prescribedEquipment).movement;
                            return {
                              ...ex,
                              name: prescribedEquipment,
                              match: {
                                movement,
                                confidence: movement ? "exact" : "none",
                                query: ex.match.query,
                              },
                            };
                          }),
                        },
                  )
                : prev,
            );
            setReviewTarget(null);
            setPickerOpen(false);
            return;
          }
          handlePickerSelect(slotName, prescribedEquipment, videoUrl, isCustom);
        }}
      />

      <div className="w-full max-w-2xl mx-auto pb-24">
        {/* Builder Mode Banner */}
        <div className="mb-6 border border-blue-900/40 bg-blue-950/40 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="text-blue-500 mt-0.5 shrink-0" size={18} />
          <div>
            <h2 className="text-blue-500 font-black uppercase tracking-widest text-xs mb-1">Builder Mode Active</h2>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Construct your off-grid protocol. Add training days and rest days, pick exercises from our library or enter custom ones, then deploy.
            </p>
          </div>
        </div>

        {/* Premium Tab Switcher */}
        <div className="flex relative mb-8 bg-black border border-neutral-800 p-1.5 rounded-full shadow-inner">
          <button
            onClick={() => setActiveTab("manual")}
            className={`relative flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-full transition-all duration-300 z-10 ${
              activeTab === "manual"
                ? "text-white bg-neutral-800 shadow-md"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Manual Builder
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-full transition-all duration-300 z-10 ${
              activeTab === "ai"
                ? "bg-blue-600 text-white shadow-sm border border-blue-700"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <Bot size={14} />
            AI Import
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "manual" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Day Cards */}
              {days.map((day, dIdx) => (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.18 }}
                  className={`rounded-2xl border overflow-hidden ${
                    day.isRestDay
                      ? "bg-neutral-950/60 border-neutral-800/50"
                      : "bg-neutral-900/40 border-neutral-800"
                  }`}
                >
                  {/* Day Header */}
                  <div className="p-4 flex items-center gap-3">
                    {/* Day number badge */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black ${
                      day.isRestDay ? "bg-neutral-800 text-neutral-500" : "bg-blue-900/20 text-blue-500 border border-blue-800/50"
                    }`}>
                      {dIdx + 1}
                    </div>

                    {day.isRestDay ? (
                      <div className="flex items-center gap-2 flex-1">
                        <BedDouble size={14} className="text-neutral-500" />
                        <span className="text-neutral-400 text-sm font-bold uppercase tracking-widest">Rest Day</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => updateDayTitle(dIdx, e.target.value)}
                        className="bg-transparent text-sm font-bold text-white outline-none border-b border-transparent focus:border-white/20 flex-1 min-w-0 py-0.5"
                        placeholder="Day Name (e.g. Push Day)"
                      />
                    )}

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Toggle rest day */}
                      <button
                        onClick={() => toggleRestDay(dIdx)}
                        title={day.isRestDay ? "Make training day" : "Make rest day"}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors border text-[10px] font-black ${
                          day.isRestDay
                            ? "border-neutral-700 text-neutral-500 hover:border-blue-600 hover:text-blue-500"
                            : "border-neutral-700 text-neutral-500 hover:border-blue-500 hover:text-blue-400"
                        }`}
                      >
                        {day.isRestDay ? <Dumbbell size={12} /> : <BedDouble size={12} />}
                      </button>
                      <button
                        onClick={() => removeDay(dIdx)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-neutral-800 text-neutral-600 hover:text-red-500 hover:border-red-900 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Exercises (only for training days) */}
                  {!day.isRestDay && (
                    <div className="px-4 pb-4 space-y-2">
                      {day.exercises.map((ex, eIdx) => (
                        <div
                          key={(ex as any).id ?? `${ex.prescribedEquipment}-${eIdx}`}
                          className="bg-black/40 rounded-xl border border-neutral-800/50 p-3"
                        >
                          {/* Exercise name picker button */}
                          <div className="flex items-center gap-3 mb-3">
                            <button
                              onClick={() => openPicker(dIdx, eIdx)}
                              className={`flex-1 text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                                ex.slotName
                                  ? "bg-neutral-900 border-neutral-700 text-white"
                                  : "bg-neutral-900/60 border-dashed border-neutral-700 text-neutral-500 hover:border-blue-600/50"
                              }`}
                            >
                              {ex.slotName || "Tap to pick exercise..."}
                            </button>
                            <button
                              onClick={() => removeExercise(dIdx, eIdx)}
                              className="text-neutral-600 hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* Equipment / progression label */}
                          {ex.prescribedEquipment && !ex.isCustom && ex.prescribedEquipment !== ex.slotName && (
                            <p className="flex items-center gap-1.5 text-[10px] text-neutral-500 uppercase tracking-widest mb-2 px-1">
                              <Dumbbell size={10} className="text-blue-500" /> {ex.prescribedEquipment}
                            </p>
                          )}

                          {/* Sets + RIR */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1">Sets</label>
                              <input
                                type="number"
                                value={String(ex.sets ?? "")}
                                onChange={(e) => updateExercise(dIdx, eIdx, "sets", e.target.value)}
                                min={1}
                                max={20}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-neutral-600"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1">Target RIR</label>
                              <input
                                type="text"
                                value={ex.targetRIR}
                                onChange={(e) => updateExercise(dIdx, eIdx, "targetRIR", e.target.value)}
                                placeholder="2-1"
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-neutral-600"
                              />
                            </div>
                          </div>

                          {/* Video link if available */}
                          {ex.videoUrl && (
                            <a
                              href={ex.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 mt-2 text-[10px] text-blue-500/70 hover:text-blue-400 transition-colors"
                            >
                              <PlayCircle size={10} />
                              Form Guide
                            </a>
                          )}
                        </div>
                      ))}

                      <button
                        onClick={() => addExercise(dIdx)}
                        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-neutral-500 hover:text-white transition-colors py-1"
                      >
                        <Plus size={13} />
                        Add Exercise
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Add Day Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => addDay(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors"
                >
                  <Plus size={14} />
                  Training Day
                </button>
                <button
                  onClick={() => addDay(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm font-bold uppercase tracking-widest text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  <BedDouble size={14} />
                  Rest Day
                </button>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-3 pt-2">
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="flex-1 flex items-center justify-center gap-3 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeploying ? (
                    <><Loader2 size={14} className="animate-spin" /> Deploying...</>
                  ) : (
                    <>Deploy Protocol <ChevronRight size={16} /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* AI explainer */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-900/30 border border-blue-800/50 flex items-center justify-center">
                    <Bot size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">AI Split Importer</h3>
                  </div>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Paste your workout split in <strong className="text-white">any format</strong> — FitNotes export, a coach&apos;s plan, a Reddit post, a spreadsheet, anything.
                  We&apos;ll match every exercise to the library and flag anything new as a custom exercise.
                </p>
              </div>

              {/* Text area */}
              <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">
                  Paste Your Split Here
                </label>
                <textarea
                  value={splitText}
                  onChange={(e) => setSplitText(e.target.value)}
                  placeholder={`Example:\nPPL Split — 6 Days\n\nDay 1 – Push:\nBench Press 4x8\nIncline DB Press 3x10\nLateral Raises 4x15\n\nDay 2 – Pull:\nBarbell Row 4x8\nPullups 3x8\n\nDay 3 – Legs:\nSquat 4x6\nRDL 3x10\nLeg Curl 3x12\n\nDay 4 – REST\n...`}
                  rows={14}
                  className="w-full bg-neutral-900/80 border border-neutral-800 rounded-2xl px-4 py-4 text-sm text-white outline-none focus:border-blue-600/50 transition-colors resize-none placeholder-neutral-700 leading-relaxed"
                />
              </div>

              {parseError && (
                <div className="bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3 text-xs text-red-500 font-medium">
                  {parseError}
                </div>
              )}

              {/* Parse preview */}
              {parsePreview && (
                <div className="bg-neutral-900/60 border border-emerald-900/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400">
                      ✓ Parsed — {parsePreview.length} Days Found
                    </h4>
                    <button
                      onClick={() => setParsePreview(null)}
                      className="text-neutral-600 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {parsePreview.map((d, i) => {
                      const matched = d.exercises.filter((ex) => ex.match.movement).length;
                      return (
                      <div
                        key={i}
                        className={`rounded-xl px-3 py-2.5 border ${
                          d.isRestDay
                            ? "border-neutral-800 bg-neutral-950/60"
                            : "border-neutral-700 bg-neutral-900/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-bold ${d.isRestDay ? "text-neutral-500" : "text-white"}`}>
                            Day {i + 1} — {d.title}
                          </span>
                          {!d.isRestDay && (
                            <span className="text-[10px] text-neutral-500 shrink-0">
                              {matched}/{d.exercises.length} matched
                            </span>
                          )}
                        </div>

                        {!d.isRestDay && d.exercises.length > 0 && (
                          <div className="mt-2 flex flex-col gap-1">
                            {d.exercises.map((ex, j) => {
                              const movement = ex.match.movement;
                              return (
                                <button
                                  key={j}
                                  onClick={() => openReviewPicker(i, j)}
                                  className="flex items-center justify-between gap-2 w-full text-left rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors"
                                >
                                  <span className="min-w-0">
                                    <span className={`block text-[11px] font-bold truncate ${movement ? "text-white" : "text-amber-400"}`}>
                                      {movement ? movement.name : ex.name}
                                    </span>
                                    <span className="block text-[9px] text-neutral-500 truncate">
                                      {movement
                                        ? `${ex.name} · matched`
                                        : "custom exercise · tap to pick"}
                                    </span>
                                  </span>
                                  <span className={`text-[9px] font-black uppercase tracking-widest shrink-0 ${movement ? "text-emerald-500" : "text-amber-500"}`}>
                                    {movement ? "OK" : "Custom"}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleApplyParsed}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-sm"
                  >
                    Apply to Builder →
                  </button>
                </div>
              )}

              {/* Parse button */}
              {!parsePreview && (
                <button
                  onClick={handleParseSplit}
                  disabled={isParsing || !splitText.trim()}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-black uppercase tracking-[0.15em] rounded-xl transition-all shadow-sm hover:shadow-md disabled:shadow-none"
                >
                  {isParsing ? (
                    <><Loader2 size={16} className="animate-spin" /> Parsing Split...</>
                  ) : (
                    <><Bot size={16} /> Parse My Split</>
                  )}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
