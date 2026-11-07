export type Gender = "male" | "female";
export type Objective = "lose_slow" | "lose_fast" | "maintain_tone" | "lean_muscle" | "mass_bulk";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export interface NutritionTargets {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  goal: string;
}

/**
 * SINGLE SOURCE OF TRUTH for activity levels.
 *
 * The multiplier ladder follows the standard Harris–Benedict / Mifflin–St Jeor
 * convention used by calculator.net, ChatGPT and most nutrition apps:
 *
 *   1.2    sedentary          little or no exercise
 *   1.375  light              1–3 workouts/week
 *   1.55   moderately active  3–5 workouts/week   <-- "3-4x/week" belongs HERE
 *   1.725  very active        6–7 workouts/week
 *   1.9    extra active       hard training + physical job
 *
 * IMPORTANT: do not label 1.725 as "3–4x/week" anywhere in the UI. Doing so
 * inflates maintenance calories by ~11% for the average user. All activity
 * pickers must import ACTIVITY_LEVELS instead of hardcoding their own labels.
 */
export const ACTIVITY_LEVELS: Record<
  ActivityLevel,
  { multiplier: number; label: string; shortLabel: string }
> = {
  sedentary: { multiplier: 1.2, label: "Sedentary (Little/No Exercise)", shortLabel: "Sedentary" },
  light: { multiplier: 1.375, label: "Light (Exercise 1-3 times/week)", shortLabel: "Light" },
  moderate: { multiplier: 1.55, label: "Moderate (Exercise 3-5 times/week)", shortLabel: "Moderate" },
  active: { multiplier: 1.725, label: "Very Active (Intense 6-7 times/week)", shortLabel: "Very Active" },
  very_active: { multiplier: 1.9, label: "Extra Active (Hard Training + Physical Job)", shortLabel: "Extra Active" },
};

export const ACTIVITY_ORDER: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
];

export function activityMultiplier(level: ActivityLevel): number {
  return ACTIVITY_LEVELS[level]?.multiplier ?? ACTIVITY_LEVELS.moderate.multiplier;
}

/**
 * Normalises the value stored in localStorage under "ultimatum_activity".
 * Accepts either a legacy numeric multiplier ("1.55") or a level key ("moderate").
 */
export function normalizeActivityValue(stored: string | null): ActivityLevel | null {
  if (!stored) return null;
  const asKey = ACTIVITY_ORDER.find((k) => k === stored);
  if (asKey) return asKey;
  const asNumber = parseFloat(stored);
  if (Number.isNaN(asNumber)) return null;
  const match = ACTIVITY_ORDER.find((k) => ACTIVITY_LEVELS[k].multiplier === asNumber);
  return match ?? null;
}

export function calculateBaseNutrition(
  gender: Gender,
  age: number,
  height: number,
  weight: number,
  bodyFat: number | "",
  activityLevel: ActivityLevel,
  objective: Objective
): NutritionTargets {
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr += gender === "male" ? 5 : -161;

  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: ACTIVITY_LEVELS.sedentary.multiplier,
    light: ACTIVITY_LEVELS.light.multiplier,
    moderate: ACTIVITY_LEVELS.moderate.multiplier,
    active: ACTIVITY_LEVELS.active.multiplier,
    very_active: ACTIVITY_LEVELS.very_active.multiplier,
  };
  
  const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

  let targetCalories = tdee;
  let finalGoal = "Maintain";

  if (objective === "lose_slow") {
    targetCalories -= 350;
    finalGoal = "Cut";
  } else if (objective === "lose_fast") {
    targetCalories -= 650;
    finalGoal = "Cut";
  } else if (objective === "maintain_tone") {
    targetCalories += 0;
    finalGoal = "Maintain";
  } else if (objective === "mass_bulk") {
    targetCalories += 400;
    finalGoal = "Mass Bulk";
  } else if (objective === "lean_muscle") {
    if (bodyFat !== "" && Number(bodyFat) >= 17) {
      targetCalories += 0;
      finalGoal = "Maintain";
    } else {
      targetCalories += 100;
      finalGoal = "Lean Bulk";
    }
  }

  return recalculateMacros(targetCalories, weight, finalGoal);
}

export function recalculateMacros(
  targetCalories: number, 
  weight: number, 
  goal: string
): NutritionTargets {
  // Protein is kept high during a cut to preserve muscle, 
  // and moderate/high during a bulk. 2.2g/kg is standard for trained individuals.
  const protein = Math.round(weight * 2.2); 
  
  // Fats at 1g/kg for hormonal health
  const fats = Math.round(weight * 1.0);    
  
  const proteinCals = protein * 4;
  const fatCals = fats * 9;
  const remainingCals = targetCalories - (proteinCals + fatCals);
  
  // Carbs fill the rest of the calorie budget
  const carbs = Math.max(0, Math.round(remainingCals / 4));

  return {
    calories: targetCalories,
    protein,
    fats,
    carbs,
    goal
  };
}
