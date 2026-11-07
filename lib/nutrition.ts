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
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
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
