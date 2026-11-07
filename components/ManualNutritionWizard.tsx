"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { useOfflineSession } from "@/lib/useOfflineSession";
import { requestNotificationPermissions, scheduleWelcomeNotification, scheduleDailyReminders } from "@/lib/notifications";
import { Ruler, Weight, Activity, ChevronRight, ChevronLeft, ChevronDown, Loader2 } from "lucide-react";
import DecryptedText from "./DecryptedText";
import NutritionReview from "./NutritionReview";
import { calculateBaseNutrition, NutritionTargets, Gender, Objective, ActivityLevel, ACTIVITY_LEVELS } from "@/lib/nutrition";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["200", "400", "600", "800"] });

type Step = "metrics" | "objective" | "nutrition_review" | "calculating";

export default function ManualNutritionWizard() {
  const router = useRouter();
  const { data: session } = useOfflineSession();

  const [step, setStep] = useState<Step>("metrics");
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [error, setError] = useState("");

  // Step 1 Data
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">(""); // cm
  const [weight, setWeight] = useState<number | "">(""); // kg
  const [bodyFat, setBodyFat] = useState<number | "">(""); // %
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  const activityOptions: Record<ActivityLevel, string> = {
    sedentary: ACTIVITY_LEVELS.sedentary.label,
    light: ACTIVITY_LEVELS.light.label,
    moderate: ACTIVITY_LEVELS.moderate.label,
    active: ACTIVITY_LEVELS.active.label,
    very_active: ACTIVITY_LEVELS.very_active.label
  };

  // Step 2 Data (Objective)
  const [objective, setObjective] = useState<Objective>("lean_muscle");

  // Final calculated nutrition
  const [finalNutrition, setFinalNutrition] = useState<NutritionTargets | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [step]);

  const saveAndFinish = (targets: NutritionTargets) => {
    const { calories, protein, fats, carbs, goal } = targets;

    const storage = session ? localStorage : sessionStorage;

    // --- Nutrition targets ---
    storage.setItem("ultimatum_calories", calories.toString());
    storage.setItem("ultimatum_protein", protein.toString());
    storage.setItem("ultimatum_fats", fats.toString());
    storage.setItem("ultimatum_carbs", carbs.toString());

    const dietPlan = { goal, calories, protein, carbs, fats };
    storage.setItem("ultimatum_diet_plan", JSON.stringify(dietPlan));

    // --- Campaign / split data (manual users skip the split wizard, so we
    //     fall back to whatever they already have, or sensible defaults) ---
    const existingFreq = localStorage.getItem("ultimatum_frequency") ||
                         sessionStorage.getItem("pending_frequency");
    const splitId = existingFreq || "3-days";
    storage.setItem(session ? "ultimatum_frequency" : "pending_frequency", splitId);
    storage.setItem(session ? "ultimatum_gender" : "pending_gender", gender);

    // Default training days to first N days of the week matching the split
    const existingDays = localStorage.getItem("ultimatum_training_days") ||
                         sessionStorage.getItem("ultimatum_training_days");
    if (!existingDays) {
      const freq = parseInt(splitId.split("-")[0]) || 3;
      const defaultDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].slice(0, freq);
      storage.setItem("ultimatum_training_days", JSON.stringify(defaultDays));
    }

    // Preserve existing cardio / flex settings, or set safe defaults
    if (!localStorage.getItem("ultimatum_cardio_enabled") &&
        !sessionStorage.getItem("ultimatum_cardio_enabled")) {
      storage.setItem("ultimatum_cardio_enabled", "false");
    }
    if (!localStorage.getItem("ultimatum_flex_enabled") &&
        !sessionStorage.getItem("ultimatum_flex_enabled")) {
      storage.setItem("ultimatum_flex_enabled", "false");
    }

    if (session) {
      localStorage.setItem("ultimatum_campaign_day", "0");
    }

    setTimeout(async () => {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleWelcomeNotification();
        await scheduleDailyReminders();
      }

      if (session) {
        try {
          const { saveUserSettingsToCloud } = await import("@/lib/syncService");
          await Promise.race([
            saveUserSettingsToCloud(session.user?.id),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Sync timeout")), 15000))
          ]);
        } catch (e) {
          console.error("[ManualNutritionWizard] Cloud sync failed:", e);
        }
        // Setup is done: do not leave the wizard screens behind, or Back from
        // the campaign would walk straight back into onboarding.
        router.replace("/campaign");
      } else {
        router.replace("/auth?mode=signup");
      }
    }, 2000);
  };

  const goForward = (nextStep: Step) => {
    setError("");
    setDirection("forward");
    setStep(nextStep);
  };

  const goBack = (prevStep: Step) => {
    setError("");
    setDirection("backward");
    setStep(prevStep);
  };

  const handleNext = (targets?: NutritionTargets) => {
    if (step === "metrics") {
      if (!age || !height || !weight) {
        setError("Please fill out all metrics to proceed.");
        return;
      }
      goForward("objective");
    } else if (step === "objective") {
      goForward("nutrition_review");
    } else if (step === "nutrition_review") {
      goForward("calculating");
      if (targets) saveAndFinish(targets);
    }
  };

  const slideVariants = {
    enter: (dir: "forward" | "backward") => ({
      x: dir === "forward" ? 30 : -30,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: "forward" | "backward") => ({
      x: dir === "forward" ? -30 : 30,
      opacity: 0
    })
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{ willChange: "opacity" }}
      className={`min-h-screen w-full flex flex-col items-center py-20 px-6 relative overflow-hidden ${montserrat.className}`}
    >
      <img src="/onboarding/premium_photo-1672862928749-d49270b3af84.avif" className="fixed inset-0 w-full h-full object-cover pointer-events-none -z-20" alt="Background" />
      <div className="absolute inset-0 bg-black/40 pointer-events-none fixed"></div>
      
      <div className="max-w-2xl w-full flex flex-col relative z-10">
        {step !== "calculating" && (
          <div className="mb-12 text-center">
            <h2 className="text-xl md:text-2xl font-light uppercase tracking-[0.3em] text-white mb-4 drop-shadow-md">
              <DecryptedText text="MANUAL SETUP" speed={50} maxIterations={10} />
            </h2>
            <div className="flex gap-2 mt-4 max-w-xs mx-auto">
              <div className={`h-1 flex-1 rounded-full ${["metrics", "objective", "nutrition_review"].includes(step) ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-white/20"}`} />
              <div className={`h-1 flex-1 rounded-full ${["objective", "nutrition_review"].includes(step) ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-white/20"}`} />
              <div className={`h-1 flex-1 rounded-full ${["nutrition_review"].includes(step) ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-white/20"}`} />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          {/* STEP 1: METRICS */}
          {step === "metrics" && (
            <motion.div
              key="metrics"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ willChange: "transform, opacity" }}
              className="w-full flex flex-col gap-6"
            >
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" style={{ willChange: "transform, backdrop-filter" }}>
                <h3 className="text-white font-semibold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Activity size={20} className="text-white/90" />
                  Body Metrics
                </h3>
                <p className="text-white/90 text-sm md:text-base mb-8 font-medium leading-relaxed drop-shadow-md">
                  Used exclusively to calculate your Basal Metabolic Rate and optimal macronutrient targets.
                </p>

                <div className="space-y-6">
                  {/* Gender Selection */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3 block">Gender</label>
                    <div className="flex gap-4">
                      <button onClick={() => setGender("male")} className={`flex-1 py-4 rounded-[1.5rem] border font-semibold uppercase tracking-widest text-sm transition-all ${gender === "male" ? "border-white bg-white/20 text-white shadow-sm" : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"}`}>Male</button>
                      <button onClick={() => setGender("female")} className={`flex-1 py-4 rounded-[1.5rem] border font-semibold uppercase tracking-widest text-sm transition-all ${gender === "female" ? "border-white bg-white/20 text-white shadow-sm" : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"}`}>Female</button>
                    </div>
                  </div>

                  {/* Height & Weight */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3 flex items-center gap-2"><Ruler size={14} /> Height (cm)</label>
                      <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || "")} placeholder="175" className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[1.5rem] py-4 px-5 text-white font-semibold text-lg placeholder-white/20 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3 flex items-center gap-2"><Weight size={14} /> Weight (kg)</label>
                      <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value) || "")} placeholder="75" className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[1.5rem] py-4 px-5 text-white font-semibold text-lg placeholder-white/20 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all" />
                    </div>
                  </div>

                  {/* Age & Body Fat */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3 block">Age (Years)</label>
                      <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value) || "")} placeholder="25" className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[1.5rem] py-4 px-5 text-white font-semibold text-lg placeholder-white/20 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3 block">Body Fat % <span className="text-white/30 lowercase">(opt)</span></label>
                      <input type="number" value={bodyFat} onChange={(e) => setBodyFat(Number(e.target.value) || "")} placeholder="15" className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[1.5rem] py-4 px-5 text-white font-semibold text-lg placeholder-white/20 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all" />
                    </div>
                  </div>

                  {/* Activity Level */}
                  <div className="relative z-50">
                    <label className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3 block">Activity Level</label>
                    <div onClick={() => setIsActivityOpen(!isActivityOpen)} className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[1.5rem] py-4 px-5 text-white font-semibold text-sm cursor-pointer flex justify-between items-center hover:bg-white/10 transition-all">
                      <span>{activityOptions[activityLevel]}</span>
                      <ChevronDown size={16} className={`text-white/50 transition-transform ${isActivityOpen ? "rotate-180" : ""}`} />
                    </div>
                    
                    <AnimatePresence>
                      {isActivityOpen && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-[105%] left-0 w-full bg-[#111] border border-white/10 rounded-[1.5rem] overflow-hidden shadow-2xl z-50 mb-2">
                          {(Object.keys(activityOptions) as ActivityLevel[]).map(key => (
                            <div key={key} onClick={() => { setActivityLevel(key); setIsActivityOpen(false); }} className={`py-3 px-5 text-sm font-semibold cursor-pointer transition-colors ${activityLevel === key ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
                              {activityOptions[key]}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {error && <p className="text-red-400 mt-4 text-xs font-semibold uppercase tracking-widest">{error}</p>}

                <button onClick={handleNext} className="w-full mt-10 py-4 bg-white/10 border border-white/30 text-white font-bold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white hover:text-black transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3">
                  Confirm Metrics <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: OBJECTIVE */}
          {step === "objective" && (
            <motion.div
              key="objective"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ willChange: "transform, opacity" }}
              className="w-full flex flex-col gap-6"
            >
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" style={{ willChange: "transform, backdrop-filter" }}>
                <button onClick={() => goBack("metrics")} className="text-white/60 hover:text-white mb-6 flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest transition-colors">
                  <ChevronLeft size={16} /> Back
                </button>
                
                <h3 className="text-white font-semibold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Activity size={20} className="text-white/90" />
                  Primary Objective
                </h3>
                <p className="text-white/90 text-sm md:text-base mb-8 font-medium leading-relaxed drop-shadow-md">
                  Select your exact physique transformation goal. We will adjust your macronutrients automatically.
                </p>

                <div className="space-y-3">
                  {[
                    { id: "lose_slow", label: "Lose Fat Slowly", desc: "Small deficit (-350 kcal). Preserve maximum muscle." },
                    { id: "lose_fast", label: "Lose Fat Aggressively", desc: "Large deficit (-650 kcal). Rapid weight loss." },
                    { id: "maintain_tone", label: "Maintain", desc: "Maintenance calories. Body recomposition." },
                    { id: "lean_muscle", label: "Gain Lean Muscle", desc: bodyFat !== "" && Number(bodyFat) >= 17 ? "Body fat \u2265 17%: Maintenance calories to recomp." : "Small surplus (+100 kcal) for lean growth." },
                    { id: "mass_bulk", label: "Mass Bulk", desc: "Large surplus (+400 kcal) for maximum size." }
                  ].map((obj) => (
                    <button
                      key={obj.id}
                      onClick={() => setObjective(obj.id as Objective)}
                      className={`w-full flex flex-col text-left p-5 rounded-[1.5rem] border transition-all ${objective === obj.id ? "border-white bg-white/20 text-white shadow-sm" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                    >
                      <span className="text-sm font-bold uppercase tracking-widest text-white mb-1">{obj.label}</span>
                      <span className="text-xs font-medium text-white/60">{obj.desc}</span>
                    </button>
                  ))}
                </div>

                <button onClick={handleNext} className="w-full mt-10 py-4 bg-white/10 border border-white/30 text-white font-bold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white hover:text-black transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3">
                  Confirm Objective <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* NUTRITION REVIEW */}
          {step === "nutrition_review" && (
            <motion.div
              key="nutrition_review"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ willChange: "transform, opacity" }}
              className="w-full flex flex-col gap-6"
            >
              <NutritionReview
                initialTargets={calculateBaseNutrition(
                  gender,
                  Number(age),
                  Number(height),
                  Number(weight),
                  bodyFat !== "" ? Number(bodyFat) : "",
                  activityLevel,
                  objective
                )}
                weight={Number(weight)}
                onBack={() => goBack("objective")}
                onConfirm={(targets) => {
                  setFinalNutrition(targets);
                  handleNext(targets);
                }}
              />
            </motion.div>
          )}

          {/* CALCULATING */}
          {step === "calculating" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full flex flex-col items-center justify-center py-32 text-center"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="mb-8 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                <Loader2 size={48} strokeWidth={1} />
              </motion.div>
              <h2 className="text-xl md:text-2xl font-light uppercase tracking-[0.3em] text-white mb-6">
                <DecryptedText text="SAVING PROTOCOL" speed={50} maxIterations={20} />
              </h2>
              <div className="space-y-3 text-white/60 font-semibold uppercase tracking-[0.2em] text-[10px] md:text-xs">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Committing Nutrition Targets...</motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>Finalizing Split Directives...</motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
