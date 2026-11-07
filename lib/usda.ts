export const USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

export interface FoodResult {
  id: number;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  brandOwner?: string;
}

// USDA nutrient numbers. Looked up by ID first — matching on name alone
// ("energy") picks up "Energy (Atwater General Factors)" on branded items
// and silently returns the wrong number.
const NUTRIENT_ENERGY = 1008; // Energy (kcal)
const NUTRIENT_PROTEIN = 1003;
const NUTRIENT_CARBS = 1005; // Carbohydrate, by difference
const NUTRIENT_FAT = 1004; // Total lipid (fat)
const NUTRIENT_ENERGY_ATWATER = 2047; // fallback only

const NUTRIENT_FALLBACK_NAMES: Record<number, string[]> = {
  [NUTRIENT_ENERGY]: ["energy"],
  [NUTRIENT_PROTEIN]: ["protein"],
  [NUTRIENT_CARBS]: ["carbohydrate"],
  [NUTRIENT_FAT]: ["lipid", "fat"],
};

type UsdaNutrient = {
  nutrientId?: number;
  nutrientName?: string;
  nutrientNumber?: string;
  unitName?: string;
  value?: number;
};

function nutrientValue(nutrients: UsdaNutrient[], nutrientId: number): number {
  const ids = nutrientId === NUTRIENT_ENERGY ? [NUTRIENT_ENERGY, NUTRIENT_ENERGY_ATWATER] : [nutrientId];

  // 1. Exact nutrient ID. USDA reports energy in both kcal (1008) and kJ
  //    (1062); only accept kcal if the unit is present.
  for (const id of ids) {
    const hit = nutrients.find((n) => n.nutrientId === id && !(n.unitName && n.unitName.toUpperCase() === "KJ"));
    if (hit && typeof hit.value === "number") return hit.value;
  }

  // 2. Legacy records only carry nutrientNumber ("208" = energy kcal).
  const legacyNumbers: Record<number, string[]> = {
    [NUTRIENT_ENERGY]: ["208"],
    [NUTRIENT_PROTEIN]: ["203"],
    [NUTRIENT_CARBS]: ["205"],
    [NUTRIENT_FAT]: ["204"],
  };
  for (const num of legacyNumbers[nutrientId] || []) {
    const hit = nutrients.find((n) => n.nutrientNumber === num);
    if (hit && typeof hit.value === "number") return hit.value;
  }

  // 3. Name match, last resort.
  for (const name of NUTRIENT_FALLBACK_NAMES[nutrientId] || []) {
    const hit = nutrients.find(
      (n) =>
        typeof n.nutrientName === "string" &&
        n.nutrientName.toLowerCase().includes(name) &&
        !(n.nutrientName.toLowerCase().includes("kj") || n.unitName?.toUpperCase() === "KJ")
    );
    if (hit && typeof hit.value === "number") return hit.value;
  }

  return 0;
}

export function mapUsdaFood(food: Record<string, unknown>): FoodResult {
  const nutrients = Array.isArray(food.foodNutrients) ? (food.foodNutrients as UsdaNutrient[]) : [];

  return {
    id: Number(food.fdcId) || 0,
    description: String(food.description || "Unknown food"),
    calories: Math.round(nutrientValue(nutrients, NUTRIENT_ENERGY)),
    protein: Math.round(nutrientValue(nutrients, NUTRIENT_PROTEIN)),
    carbs: Math.round(nutrientValue(nutrients, NUTRIENT_CARBS)),
    fats: Math.round(nutrientValue(nutrients, NUTRIENT_FAT)),
    brandOwner: (food.brandOwner as string) || "Generic/Whole Food",
  };
}

// Queries USDA directly from the device. The static export (APK) has no server
// to run /api/food-search, so the previous absolute fetch to
// https://www.ultimatum.website/api/food-search returned
// "Query parameter is required" on every search.
export async function searchUsdaFoods(query: string, signal?: AbortSignal): Promise<FoodResult[]> {
  const apiKey = process.env.NEXT_PUBLIC_USDA_API_KEY;
  if (!apiKey) {
    throw new Error("USDA API key is not configured (NEXT_PUBLIC_USDA_API_KEY).");
  }

  const url = `${USDA_SEARCH_URL}?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(
    query
  )}&pageSize=10&dataType=Foundation,SR%20Legacy,Branded`;

  const res = await fetch(url, { signal });

  if (res.status === 429) {
    throw new Error("USDA rate limit reached. Please wait a moment and try again.");
  }
  if (res.status === 403) {
    throw new Error("USDA rejected the API key. Check NEXT_PUBLIC_USDA_API_KEY.");
  }
  if (!res.ok) {
    throw new Error(`USDA request failed (${res.status}).`);
  }

  const data = await res.json();
  const foods = Array.isArray(data?.foods) ? data.foods : [];
  return foods.map(mapUsdaFood);
}
