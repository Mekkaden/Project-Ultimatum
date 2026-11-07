"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Montserrat } from "next/font/google";
import { useOfflineSession } from "@/lib/useOfflineSession";
import { requestNotificationPermissions, scheduleWelcomeNotification, scheduleDailyReminders } from "@/lib/notifications";
import { Ruler, Weight, CalendarDays, Activity, ChevronRight, ChevronLeft, ChevronDown, Check, Loader2 } from "lucide-react";
import DecryptedText from "./DecryptedText";
import { getAllowedFrequencyNumbers } from "@/lib/utils";
import NutritionReview from "./NutritionReview";
import { calculateBaseNutrition, NutritionTargets, Gender, Objective, ActivityLevel } from "@/lib/nutrition";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["200", "400", "600", "800"] });

type Step = "metrics" | "objective" | "nutrition_review" | "frequency" | "modules" | "calculating";

const DAYS_OF_WEEK = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" }
];

export default function AutoSetupWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFastTrack = searchParams.get("fastTrack") === "true";
  const { data: session } = useOfflineSession();
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    sedentary: "Sedentary (Little/No Exercise)",
    light: "Light (Exercise 1-3 times/week)",
    moderate: "Moderate (Exercise 4-5 times/week)",
    active: "Active (Daily exercise/Intense 3-4x)",
    very_active: "Very Active (Intense 6-7x/Physical Job)"
  };

  // Step 2 Data (Objective)
  const [objective, setObjective] = useState<Objective>("lean_muscle");

  // Step 3 Data (Frequency)
  const [frequency, setFrequency] = useState<number>(4); // 3 to 6

  // Step 3 Data
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // Step 3 Data (Optional Modules)
  const [wantsCardio, setWantsCardio] = useState(false);
  const [wantsFlex, setWantsFlex] = useState(false);
  const [cardioSplit, setCardioSplit] = useState<string>("3-day");
  const [flexTier, setFlexTier] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO">("BEGINNER");

  const [directive, setDirective] = useState<string>("hypertrophy");
  
  // Final calculated nutrition
  const [finalNutrition, setFinalNutrition] = useState<NutritionTargets | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const storedDirective = localStorage.getItem("ultimatum_directive") || "hypertrophy";
    setDirective(storedDirective);
    
    // Ensure default frequency is valid
    const allowed = getAllowedFrequencyNumbers(storedDirective);
    
    setFrequency(prev => allowed.includes(prev) ? prev : allowed[0]);
  }, [step]);

  // Cancel any pending post-generation navigation if the user leaves the wizard
  // early (e.g., presses back and taps "Returning User Login"). Without this, the
  // 2s timer still fired and force-routed them to the Sign Up page.
  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  const availableDays = getAllowedFrequencyNumbers(directive);

  const toggleDay = (dayId: string) => {
    setError("");
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(d => d !== dayId));
    } else {
      if (selectedDays.length < frequency) {
        setSelectedDays([...selectedDays, dayId]);
      } else {
        setError(`You can only select ${frequency} days.`);
      }
    }
  };

  const calculateAndSave = () => {
    // 1. Determine the Split ID based strictly on frequency
    const splitId = `${frequency}-days`;

    if (!finalNutrition) return;

    const { calories, protein, fats, carbs, goal } = finalNutrition;

    // Save to localStorage or sessionStorage based on auth
    const storage = session ? localStorage : sessionStorage;

    storage.setItem(session ? "ultimatum_frequency" : "pending_frequency", splitId);
    storage.setItem(session ? "ultimatum_gender" : "pending_gender", gender);
    storage.setItem("ultimatum_calories", calories.toString());
    storage.setItem("ultimatum_protein", protein.toString());
    storage.setItem("ultimatum_fats", fats.toString());
    storage.setItem("ultimatum_carbs", carbs.toString());
    const defaultDays = DAYS_OF_WEEK.slice(0, frequency).map(d => d.id);
    storage.setItem("ultimatum_training_days", JSON.stringify(defaultDays));
    
    // Auto-configure the diet plan JSON for DietModule
    const dietPlan = {
      goal,
      calories,
      protein,
      carbs,
      fats
    };
    storage.setItem("ultimatum_diet_plan", JSON.stringify(dietPlan));
    
    if (session) {
      localStorage.setItem("ultimatum_campaign_day", "0");
    }

    // Without a session this wizard stages its answers in sessionStorage and
    // the auth screen copies them across later. Writing the cardio/flex flags
    // through `storage` in that mode still wrote the "off" values straight to
    // localStorage (removeItem is unconditional), which silently wiped a
    // protocol the user had already deployed. Staged answers must never touch
    // the live configuration.
    if (wantsCardio) {
      storage.setItem("ultimatum_cardio_split", cardioSplit);
      storage.setItem("ultimatum_cardio_enabled", "true");
    } else if (session) {
      localStorage.removeItem("ultimatum_cardio_split");
      localStorage.setItem("ultimatum_cardio_enabled", "false");
    }
    
    if (wantsFlex) {
      storage.setItem("ultimatum_flex_tier", flexTier);
      storage.setItem("ultimatum_flex_enabled", "true");
    } else if (session) {
      localStorage.removeItem("ultimatum_flex_tier");
      localStorage.setItem("ultimatum_flex_enabled", "false");
    }

    // Routing
    // Setup Push Notifications
    navTimerRef.current = setTimeout(async () => {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleWelcomeNotification();
        await scheduleDailyReminders();
      }
      
      if (session) {
        try {
          const { saveUserSettingsToCloud } = await import("@/lib/syncService");
          await saveUserSettingsToCloud(session.user?.id);
        } catch (syncErr) {
          // Log explicitly — do NOT silently swallow this
          console.error("[AutoSetupWizard] CLOUD SAVE FAILED — data is local only:", syncErr);
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

  const handleNext = () => {
    if (step === "metrics") {
      if (!age || !height || !weight) {
        setError("Please fill out all metrics to proceed.");
        return;
      }
      goForward("objective");
    } else if (step === "objective") {
      goForward("nutrition_review");
    } else if (step === "nutrition_review") {
      goForward("frequency");
    } else if (step === "frequency") {
      goForward("modules");
    } else if (step === "modules") {
      goForward("calculating");
      calculateAndSave();
    }
  };

  // Slide variants: forward slides in from right, backward slides in from left
  const slideVariants = {
    enter: (dir: "forward" | "backward") => ({
      x: dir === "forward" ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: "forward" | "backward") => ({
      x: dir === "forward" ? -30 : 30,
      opacity: 0,
    }),
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
              <DecryptedText text="Automatic Setup" speed={50} maxIterations={10} />
            </h2>
            <div className="flex gap-2 mt-4 max-w-xs mx-auto">
              <div className={`h-1 flex-1 rounded-full ${step === "metrics" || step === "objective" || step === "frequency" || step === "modules" ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-white/20"}`} />
              <div className={`h-1 flex-1 rounded-full ${step === "objective" || step === "frequency" || step === "modules" ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-white/20"}`} />
              <div className={`h-1 flex-1 rounded-full ${step === "frequency" || step === "modules" ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-white/20"}`} />
              <div className={`h-1 flex-1 rounded-full ${step === "modules" ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-white/20"}`} />
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
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3 block">Gender</label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setGender("male")}
                        className={`flex-1 py-4 rounded-[1.5rem] border font-semibold uppercase tracking-widest text-sm transition-all ${gender === "male" ? "border-white bg-white/20 text-white shadow-sm" : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"}`}
                      >
                        Male
                      </button>
                      <button 
                        onClick={() => setGender("female")}
                        className={`flex-1 py-4 rounded-[1.5rem] border font-semibold uppercase tracking-widest text-sm transition-all ${gender === "female" ? "border-white bg-white/20 text-white shadow-sm" : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"}`}
                      >
                        Female
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3 flex items-center gap-2">
                        <Ruler size={14} /> Height (cm)
                      </label>
                      <input 
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value) || "")}
                        placeholder="175"
                        className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[1.5rem] py-4 px-5 text-white font-semibold text-lg placeholder-white/20 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3 flex items-center gap-2">
                        <Weight size={14} /> Weight (kg)
                      </label>
                      <input 
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value) || "")}
                        placeholder="75"
                        className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[1.5rem] py-4 px-5 text-white font-semibold text-lg placeholder-white/20 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3 block">Age (Years)</label>
                      <input 
                        type="number"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value) || "")}
                        placeholder="25"
                        className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[1.5rem] py-4 px-5 text-white font-semibold text-lg placeholder-white/20 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3 block">Body Fat % <span className="text-white/30 lowercase">(opt)</span></label>
                      <input 
                        type="number"
                        value={bodyFat}
                        onChange={(e) => setBodyFat(Number(e.target.value) || "")}
                        placeholder="15"
                        className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[1.5rem] py-4 px-5 text-white font-semibold text-lg placeholder-white/20 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="relative z-50">
                    <label className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3 block">Activity Level</label>
                    <div 
                      onClick={() => setIsActivityOpen(!isActivityOpen)}
                      className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[1.5rem] py-4 px-5 text-white font-semibold text-sm cursor-pointer flex justify-between items-center hover:bg-white/10 transition-all"
                    >
                      <span>{activityOptions[activityLevel]}</span>
                      <ChevronDown size={16} className={`text-white/50 transition-transform ${isActivityOpen ? "rotate-180" : ""}`} />
                    </div>
                    
                    <AnimatePresence>
                      {isActivityOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-[105%] left-0 w-full bg-[#111] border border-white/10 rounded-[1.5rem] overflow-hidden shadow-2xl z-50 mb-2"
                        >
                          {(Object.keys(activityOptions) as ActivityLevel[]).map(key => (
                            <div
                              key={key}
                              onClick={() => {
                                setActivityLevel(key);
                                setIsActivityOpen(false);
                              }}
                              className={`py-3 px-5 text-sm font-semibold cursor-pointer transition-colors ${activityLevel === key ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                            >
                              {activityOptions[key]}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {error && <p className="text-red-400 mt-4 text-xs font-semibold uppercase tracking-widest">{error}</p>}

                <button 
                  onClick={handleNext}
                  className="w-full mt-10 py-4 bg-white/10 border border-white/30 text-white font-bold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white hover:text-black transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3"
                >
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
                      className={`w-full flex flex-col text-left p-5 rounded-[1.5rem] border transition-all ${
                        objective === obj.id 
                          ? "border-white bg-white/20 text-white shadow-sm" 
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm font-bold uppercase tracking-widest text-white mb-1">{obj.label}</span>
                      <span className="text-xs font-medium text-white/60">{obj.desc}</span>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleNext}
                  className="w-full mt-10 py-4 bg-white/10 border border-white/30 text-white font-bold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white hover:text-black transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3"
                >
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
                  handleNext();
                }}
              />
            </motion.div>
          )}

          {/* STEP 3: FREQUENCY */}
          {step === "frequency" && (
            <motion.div
              key="frequency"
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
                <button onClick={() => goBack("objective")} className="text-white/60 hover:text-white mb-6 flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest transition-colors">
                  <ChevronLeft size={16} /> Back
                </button>
                
                <h3 className="text-white font-semibold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Activity size={20} className="text-white/90" />
                  Training Frequency
                </h3>
                <p className="text-white/90 text-sm md:text-base mb-8 font-medium leading-relaxed drop-shadow-md">
                  How many days per week can you realistically commit to training? Be honest. Consistency beats intensity.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {availableDays.map((days) => (
                    <button
                      key={days}
                      onClick={() => setFrequency(days)}
                      className={`flex flex-col items-center justify-center py-8 rounded-[2rem] border transition-all ${
                        frequency === days 
                          ? "border-white bg-white/20 text-white shadow-sm" 
                          : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
                      }`}
                    >
                      <span className="text-4xl font-light mb-2">{days}</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">Days / Week</span>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleNext}
                  className="w-full mt-10 py-4 bg-white/10 border border-white/30 text-white font-bold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white hover:text-black transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3"
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: OPTIONAL MODULES */}
          {step === "modules" && (
            <motion.div
              key="modules"
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
                <button onClick={() => goBack("frequency")} className="text-white/60 hover:text-white mb-6 flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest transition-colors">
                  <ChevronLeft size={16} /> Back
                </button>
                
                <h3 className="text-white font-semibold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Activity size={20} className="text-white/90" />
                  Optional Modules
                </h3>
                <p className="text-white/90 text-sm md:text-base mb-8 font-medium leading-relaxed drop-shadow-md">
                  Enhance your protocol with optional training layers. You can always configure these later.
                </p>

                <div className="space-y-6">
                  {/* Cardio Toggle */}
                  <div className={`rounded-[2rem] border transition-all p-6 ${wantsCardio ? "border-white bg-white/10 shadow-sm" : "border-white/10 bg-white/5"}`}>
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setWantsCardio(!wantsCardio)}>
                      <div>
                        <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-1">Cardio Protocol</h4>
                        <p className="text-white/60 text-xs font-medium">Add structured cardiovascular training.</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full border flex items-center transition-all p-1 ${wantsCardio ? "bg-white border-white justify-end" : "border-white/30 justify-start"}`}>
                        <div className={`w-4 h-4 rounded-full transition-all ${wantsCardio ? "bg-black" : "bg-white/50"}`} />
                      </div>
                    </div>
                    
                    {wantsCardio && (
                      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { id: "2-day", label: "Minimalist" },
                          { id: "3-day", label: "Balanced" },
                          { id: "4-day", label: "Athlete" },
                          { id: "7-day", label: "Daily" }
                        ].map(split => (
                          <button
                            key={split.id}
                            onClick={() => setCardioSplit(split.id)}
                            className={`py-3 px-2 rounded-xl border text-[10px] uppercase font-bold tracking-widest transition-all ${cardioSplit === split.id ? "bg-white text-black border-white shadow-sm" : "border-white/20 text-white/60 hover:text-white"}`}
                          >
                            {split.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Flexibility Toggle */}
                  <div className={`rounded-[2rem] border transition-all p-6 ${wantsFlex ? "border-white bg-white/10 shadow-sm" : "border-white/10 bg-white/5"}`}>
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setWantsFlex(!wantsFlex)}>
                      <div>
                        <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-1">Flexibility Protocol</h4>
                        <p className="text-white/60 text-xs font-medium">Advanced deep-tissue elongation.</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full border flex items-center transition-all p-1 ${wantsFlex ? "bg-white border-white justify-end" : "border-white/30 justify-start"}`}>
                        <div className={`w-4 h-4 rounded-full transition-all ${wantsFlex ? "bg-black" : "bg-white/50"}`} />
                      </div>
                    </div>
                    
                    {wantsFlex && (
                      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {["BEGINNER", "INTERMEDIATE", "ADVANCED", "PRO"].map(tier => (
                          <button
                            key={tier}
                            onClick={() => setFlexTier(tier as any)}
                            className={`py-3 px-2 rounded-xl border text-[10px] uppercase font-bold tracking-widest transition-all ${flexTier === tier ? "bg-white text-black border-white shadow-sm" : "border-white/20 text-white/60 hover:text-white"}`}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleNext}
                  className="w-full mt-10 py-4 bg-white/10 border border-white/30 text-white font-bold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white hover:text-black transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3"
                >
                  Generate Protocol <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}
          
          {/* STEP 4: CALCULATING */}
          {step === "calculating" && (
            <motion.div
              key="calculating"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full flex flex-col items-center justify-center py-32 text-center"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="mb-8 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              >
                <Loader2 size={48} strokeWidth={1} />
              </motion.div>
              <h2 className="text-xl md:text-2xl font-light uppercase tracking-[0.3em] text-white mb-6">
                <DecryptedText text="SYNTHESIZING PROTOCOL" speed={50} maxIterations={20} />
              </h2>
              <div className="space-y-3 text-white/60 font-semibold uppercase tracking-[0.2em] text-[10px] md:text-xs">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Mapping Split Architecture...</motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>Calculating Metabolic Rate...</motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>Configuring Macronutrients...</motion.p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
