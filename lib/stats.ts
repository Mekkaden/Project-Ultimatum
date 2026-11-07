export function calcStatsFromStorageObj(storageObj: Record<string, string>) {
  const allKeys = Object.keys(storageObj).filter((k) =>
    k.startsWith("ultimatum_history_")
  );
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  
  let maxWeight = 0; // Pure max weight (still tracked for stats)
  let best1RM = 0; // Calculated 1RM via Epley
  let totalTonnage = 0;
  let totalReps = 0;
  let totalSets = 0;
  const activeDays = new Set<string>();
  const totalActiveDaysAllTime = new Set<string>();

  for (const key of allKeys) {
    const raw = storageObj[key];
    if (!raw) continue;
    try {
      const entries = JSON.parse(raw);
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        const w = Number(entry.weight) || 0;
        const r = Number(entry.reps) || 0;
        const ts = Number(entry.timestamp) || 0;
        // Normalize to LBS (the arena's display unit) so the 405 lb / 30,000 lb
        // benchmarks and the "LBS" suffix are consistent. Previously KG weights
        // were compared raw against the 405 lb benchmark, undercounting force
        // by ~2.2x for KG users.
        const unit = String(entry.unit || "KG").toUpperCase();
        const wLbs = unit === "KG" ? w * 2.20462 : w;

        if (wLbs > maxWeight) maxWeight = wLbs;
        totalActiveDaysAllTime.add(new Date(ts).toDateString());

        const isRecent = now - ts < sevenDaysMs;
        if (isRecent) {
          totalTonnage += wLbs * r;
          totalReps += r;
          totalSets += 1;
          activeDays.add(new Date(ts).toDateString());

          // Epley 1RM Formula (in LBS): w * (1 + r / 30)
          const epley1RM = wLbs * (1 + (r / 30));
          if (epley1RM > best1RM) best1RM = epley1RM;
        }
      }
    } catch {}
  }

  // --- ARENA SCORE 3.0 (PEAK ENGINE) FORMULA (100 Points Total) ---
  
  // Pillar 1: Output - Power (15 Points)
  // Epley 1RM relative to a 405lb benchmark
  const forcePoints = Math.min(15, (best1RM / 405) * 15);
  
  // Pillar 1: Output - Tonnage (15 Points)
  // Tonnage capped at 30,000 lbs
  const tonnagePoints = Math.min(15, (totalTonnage / 30000) * 15);

  // Pillar 2: The Work - Consistency (15 Points)
  // Max points for 4+ days in the last week
  const consistencyPoints = Math.min(15, (activeDays.size / 4) * 15);
  
  // Pillar 2: The Work - Hypertrophy (15 Points)
  // Bell Curve peaking exactly at 10 reps.
  let hypertrophyPoints = 0;
  if (totalSets > 0) {
    const avgReps = totalReps / totalSets;
    // Distance from the sweet spot of 10 reps. 
    // e.g. 10 reps = 0 distance. 15 reps = 5 distance. 2 reps = 8 distance.
    const distFromSweetSpot = Math.abs(avgReps - 10);
    // Every 1 rep away from 10 decreases score by 1.5 points.
    // If distance is > 10, it bottoms out at 0.
    hypertrophyPoints = Math.max(0, 15 - (distFromSweetSpot * 1.5));
  }

  // Pillar 3: The Fuel - Caloric Accuracy (25 Points)
  let fuelPoints = 0;
  try {
    const consumedObj = JSON.parse(storageObj["ultimatum_daily_consumed"] || "{}");
    const planObj = JSON.parse(storageObj["ultimatum_diet_plan"] || "{}");
    
    // Only process if they logged calories today
    if (consumedObj.date === new Date().toDateString() && consumedObj.data?.calories > 0) {
      const consumedCals = Number(consumedObj.data.calories);
      const targetCals = Number(planObj.calories);
      
      if (targetCals > 0) {
        // Distance from target
        const calorieDistance = Math.abs(consumedCals - targetCals);
        // Accuracy Percentage (0 to 1). e.g. if target is 2500, distance of 250 = 10% off. Accuracy = 90%.
        // If distance is greater than target (e.g. eating 5000 cals on a 2000 goal), accuracy drops to 0.
        const accuracy = Math.max(0, 1 - (calorieDistance / targetCals));
        
        fuelPoints = accuracy * 25;
      } else {
        // If they don't have a plan set up yet, give them a flat 15 points for at least tracking
        fuelPoints = 15;
      }
    }
  } catch {}

  // Pillar 4: The Engine - Cardio or Steps (15 Points)
  // Max points for either hitting 150 mins of cardio or 70k steps in the last 7 days. Whichever is higher.
  let cardioMinutes = 0;
  let stepCount = 0;
  try {
    const cardioEntries = JSON.parse(storageObj["ultimatum_cardio_history"] || "[]");
    cardioMinutes = cardioEntries.reduce((sum: number, entry: any) => {
      return (now - (entry.timestamp || 0) < sevenDaysMs) ? sum + Number(entry.minutes || 0) : sum;
    }, 0);

    const stepsEntries = JSON.parse(storageObj["ultimatum_steps_history"] || "[]");
    stepCount = stepsEntries.reduce((sum: number, entry: any) => {
      return (now - (entry.timestamp || 0) < sevenDaysMs) ? sum + Number(entry.steps || 0) : sum;
    }, 0);
  } catch {}

  const cardioPoints = Math.min(15, (cardioMinutes / 150) * 15);
  const stepsPoints = Math.min(15, (stepCount / 70000) * 15);
  const enginePoints = Math.max(cardioPoints, stepsPoints);

  // Total Score (0 - 100)
  const avgScore = Math.round(forcePoints + tonnagePoints + consistencyPoints + hypertrophyPoints + fuelPoints + enginePoints);

  return {
    avgScore: Math.min(100, Math.max(1, avgScore)), // Clamp between 1-100
    maxWeight, // Keeping maxWeight returned instead of 1RM so UI looks normal
    totalTonnage,
    consistency: activeDays.size,
    totalActiveDays: totalActiveDaysAllTime.size,
    // Return individual scores for Radar Chart (scale to 100 for visualization if needed, or radar can handle raw)
    forcePoints,
    tonnagePoints,
    consistencyPoints,
    hypertrophyPoints,
    fuelPoints,
    enginePoints
  };
}
