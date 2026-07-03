import { NextResponse } from "next/server";

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

    return NextResponse.json({ foods: formattedFoods });
  } catch (error) {
    console.error("USDA API Error:", error);
    return NextResponse.json({ error: "Failed to fetch food data" }, { status: 500 });
  }
}
