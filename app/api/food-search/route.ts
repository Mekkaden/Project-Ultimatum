export const dynamic = 'force-static';
import { NextResponse } from "next/server";

// In-memory cache for food search results to avoid hitting the USDA API
// for the same query multiple times within a session.
// Key: lowercase query string. Value: { data, timestamp }
const foodSearchCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  const apiKey = process.env.USDA_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: "USDA API Key is not configured" }, { status: 500 });
  }

  const cacheKey = query.toLowerCase().trim();
  const cached = foodSearchCache.get(cacheKey);

  // Return cached result if it's fresh (within TTL)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    const response = NextResponse.json(cached.data);
    response.headers.set("X-Cache", "HIT");
    response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    return response;
  }

  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=10`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`USDA API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse out just the data we need (Calories, Protein, Carbs, Fats per 100g)
    const formattedFoods = data.foods.map((food: any) => {
      // Nutrients are provided in an array. We need to find the specific ones by ID or name
      const nutrients = food.foodNutrients || [];
      
      const getNutrient = (name: string, id: number) => {
        const nut = nutrients.find((n: any) => n.nutrientName.toLowerCase().includes(name.toLowerCase()) || n.nutrientId === id);
        return nut ? Math.round(nut.value) : 0;
      };

      // 1008 = Energy (kcal)
      // 1003 = Protein
      // 1005 = Carbohydrate, by difference
      // 1004 = Total lipid (fat)
      const calories = getNutrient("energy", 1008);
      const protein = getNutrient("protein", 1003);
      const carbs = getNutrient("carbohydrate", 1005);
      const fats = getNutrient("lipid", 1004);

      return {
        id: food.fdcId,
        description: food.description,
        calories,
        protein,
        carbs,
        fats,
        brandOwner: food.brandOwner || "Generic/Whole Food"
      };
    });

    const result = { foods: formattedFoods };

    // Store in server-side cache
    foodSearchCache.set(cacheKey, { data: result, timestamp: Date.now() });

    // Also tell the browser/CDN to cache this response
    const nextResponse = NextResponse.json(result);
    nextResponse.headers.set("X-Cache", "MISS");
    nextResponse.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    return nextResponse;

  } catch (error) {
    console.error("USDA API Error:", error);
    return NextResponse.json({ error: "Failed to fetch food data" }, { status: 500 });
  }
}
