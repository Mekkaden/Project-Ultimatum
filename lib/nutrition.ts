export type Gender = "male" | "female";
export type Objective = "lose_slow" | "lose_fast" | "maintain_tone" | "lean_muscle" | "mass_bulk";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active"
  | "extra_active";

export interface NutritionTargets {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  goal: string;
}

export interface ActivityLevelInfo {
  /** Harris–Benedict / Mifflin–St Jeor activity factor */
  multiplier: number;
  /** Short name, e.g. "Moderate" */
  shortLabel: string;
  /** Full dropdown label, e.g. "Moderate: exercise 4-5 times/week" */
  label: string;
  /** Human description shown as secondary text */
  description: string;
}

/**
 * SINGLE SOURCE OF TRUTH for activity levels.
 *
 * This mirrors calculator.net's calorie calculator exactly (verified against
 * the live site for a 21yo male, 170 cm, 67 kg, Mifflin–St Jeor → BMR 1632.5):
 *
 *   Sedentary     1.2    -> 1959
 *   Light         1.375  -> 2245
 *   Moderate      1.55   -> 2530
 *   Active        1.55   -> 2530   (same factor as Moderate on calculator.net)
 *   Very Active   1.725  -> 2816
 *   Extra Active  1.9    -> 3102
 *
 * NOTE: do not hardcode multipliers or labels in any picker. Import
 * ACTIVITY_LEVELS / ACTIVITY_ORDER so every screen stays in sync.
 */
export const ACTIVITY_LEVELS: Record<ActivityLevel, ActivityLevelInfo> = {
  sedentary: {
    multiplier: 1.2,
    shortLabel: "Sedentary",
    label: "Sedentary: little or no exercise",
    description: "Desk job, no planned training.",
  },
  light: {
    multiplier: 1.375,
    shortLabel: "Light",
    label: "Light: exercise 1-3 times/week",
    description: "Training once to three times a week.",
  },
  moderate: {
    multiplier: 1.55,
    shortLabel: "Moderate",
    label: "Moderate: exercise 4-5 times/week",
    description: "Four to five sessions a week.",
  },
  active: {
    multiplier: 1.55,
    shortLabel: "Active",
    label: "Active: daily exercise or intense exercise 3-4 times/week",
    description: "Train most days, or three to four hard sessions a week.",
  },
  very_active: {
    multiplier: 1.725,
    shortLabel: "Very Active",
    label: "Very Active: intense exercise 6-7 times/week",
    description: "Six to seven intense sessions a week.",
  },
  extra_active: {
    multiplier: 1.9,
    shortLabel: "Extra Active",
    label: "Extra Active: very intense exercise daily, or physical job",
    description: "Daily very intense training, or a physical job on top of it.",
  },
};

export const ACTIVITY_ORDER: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
  "extra_active",
];

/** Wearable-style moving-average default used when no history exists yet. */
export const DEFAULT_ACTIVITY_LEVEL: ActivityLevel = "moderate";

export function activityMultiplier(level: ActivityLevel): number {
  return ACTIVITY_LEVELS[level]?.multiplier ?? ACTIVITY_LEVELS[DEFAULT_ACTIVITY_LEVEL].multiplier;
}

/** Legacy key kept so older saved values continue to resolve sensibly. */
const LEGACY_ACTIVITY_ALIASES: Record<string, ActivityLevel> = {
  // The pre-fix "active" bucket used 1.725 and meant "very active".
  "1.725": "very_active",
  "1.9": "extra_active",
  "1.55": "moderate",
  "1.375": "light",
  "1.2": "sedentary",
  very_active_legacy: "very_active",
};

/**
 * Normalises the value stored in localStorage under "ultimatum_activity".
 * Accepts either a legacy numeric multiplier ("1.725") or a level key ("active").
 */
export function normalizeActivityValue(stored: string | null): ActivityLevel | null {
  if (!stored) return null;
  const trimmed = stored.trim();
  const asKey = ACTIVITY_ORDER.find((k) => k === trimmed);
  if (asKey) return asKey;
  if (LEGACY_ACTIVITY_ALIASES[trimmed]) return LEGACY_ACTIVITY_ALIASES[trimmed];
  const asNumber = parseFloat(trimmed);
  if (Number.isNaN(asNumber)) return null;
  for (const key of ACTIVITY_ORDER) {
    if (ACTIVITY_LEVELS[key].multiplier === asNumber) return key;
  }
  return null;
}

/** Mifflin–St Jeor basal metabolic rate (kcal/day). */
export function calculateBMR(
  gender: Gender,
  age: number,
  height: number,
  weight: number
): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return base + (gender === "male" ? 5 : -161);
}

/** Maintenance calories (TDEE) = BMR x activity factor, unrounded. */
export function calculateTDEE(
  gender: Gender,
  age: number,
  height: number,
  weight: number,
  activityLevel: ActivityLevel
): number {
  return calculateBMR(gender, age, height, weight) * activityMultiplier(activityLevel);
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
  const tdee = Math.round(calculateTDEE(gender, age, height, weight, activityLevel));

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
