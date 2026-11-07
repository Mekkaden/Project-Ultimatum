export interface OverloadTarget {
  weight: number;
  reps: number;
  message: string;
}

/**
 * Calculates the next target weight and reps based on Strict Double Progression & RIR.
 * Default rep range is 4-8.
 */
export function calculateOverloadTarget(
  lastWeight: number,
  lastReps: number,
  lastRir: number = 0,
  unit: string = "KG",
  repRangeBottom: number = 4,
  repRangeTop: number = 8
): OverloadTarget {
  if (!lastWeight || !lastReps) {
    return { weight: 0, reps: 0, message: "Log a set to get target." };
  }

  const weightStep = unit === "LBS" ? 5 : 2.5;
  const effectiveReps = lastReps + lastRir;

  // 1. Conquered the top of the rep range (physically or effectively)
  if (effectiveReps >= repRangeTop) {
    return {
      weight: lastWeight + weightStep,
      reps: repRangeBottom,
      message: `Effective performance: ${effectiveReps} reps (${lastReps} reps + ${lastRir} RIR). You conquered the top of the range! Increase weight and start from ${repRangeBottom} reps.`
    };
  }

  // 2. Working within the rep range
  else if (effectiveReps >= repRangeBottom) {
    return {
      weight: lastWeight,
      reps: effectiveReps + 1,
      message: `Effective performance: ${effectiveReps} reps. Push for 1 more rep this week at the same weight.`
    };
  }

  // 3. Missed the bottom of the rep range
  else {
    return {
      weight: Math.max(0, lastWeight - weightStep),
      reps: repRangeTop,
      message: `Missed the ${repRangeBottom} rep minimum. Deloading weight slightly to build momentum.`
    };
  }
}
