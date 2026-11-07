export interface ArenaLevel {
  level: number;
  rank: string;
  color: string;
  glowColor: string;
  minScore: number; // 0–100 scale (average of stats)
  description: string;
}

export const ARENA_LEVELS: ArenaLevel[] = [
  { level: 1,  rank: "Novice",           color: "#6b7280", glowColor: "rgba(107,114,128,0.4)",  minScore: 0,   description: "Baseline" },
  { level: 5,  rank: "Trainee",          color: "#9ca3af", glowColor: "rgba(156,163,175,0.4)",  minScore: 10,  description: "Consistency" },
  { level: 10, rank: "Apprentice",       color: "#34d399", glowColor: "rgba(52,211,153,0.4)",   minScore: 20,  description: "Adaptation" },
  { level: 15, rank: "Practitioner",     color: "#22d3ee", glowColor: "rgba(34,211,238,0.4)",   minScore: 30,  description: "Execution" },
  { level: 20, rank: "Athlete",          color: "#60a5fa", glowColor: "rgba(96,165,250,0.4)",   minScore: 40,  description: "Optimization" },
  { level: 25, rank: "Competitor",       color: "#818cf8", glowColor: "rgba(129,140,248,0.4)",  minScore: 50,  description: "Compliance" },
  { level: 30, rank: "Advanced",         color: "#c084fc", glowColor: "rgba(192,132,252,0.4)",  minScore: 60,  description: "Adherence" },
  { level: 35, rank: "Elite",            color: "#fb923c", glowColor: "rgba(251,146,60,0.4)",   minScore: 68,  description: "Regulation" },
  { level: 40, rank: "Master",           color: "#f87171", glowColor: "rgba(248,113,113,0.4)",  minScore: 76,  description: "Precision" },
  { level: 45, rank: "Apex",             color: "#dc2626", glowColor: "rgba(220,38,38,0.6)",    minScore: 86,  description: "Potential" },
  { level: 50, rank: "PROJECT ULTIMATUM",color: "#fbbf24", glowColor: "rgba(251,191,36,0.7)",   minScore: 96,  description: "Terminal" },
];

/**
 * Given an average stat score (0–100), returns the current ArenaLevel object.
 */
export function getArenaLevel(avgScore: number): ArenaLevel {
  // Find the highest bracket the score qualifies for
  let current = ARENA_LEVELS[0];
  for (const lvl of ARENA_LEVELS) {
    if (avgScore >= lvl.minScore) {
      current = lvl;
    }
  }
  return current;
}

/**
 * Returns the exact numeric level (1–50) for a given avgScore.
 * Linearly maps 0–100 → 1–50.
 */
export function getNumericLevel(avgScore: number): number {
  return Math.max(1, Math.min(50, Math.floor((avgScore / 100) * 50) + 1));
}

/**
 * Returns progress (0–100) within the current level bracket toward the next one.
 */
export function getLevelProgress(avgScore: number): { pct: number; pointsToNext: number; nextRank: ArenaLevel | null } {
  const currentLevel = getArenaLevel(avgScore);
  const currentIdx = ARENA_LEVELS.indexOf(currentLevel);
  const nextLevel = ARENA_LEVELS[currentIdx + 1] ?? null;

  if (!nextLevel) {
    return { pct: 100, pointsToNext: 0, nextRank: null };
  }

  const rangeSize = nextLevel.minScore - currentLevel.minScore;
  const progress = avgScore - currentLevel.minScore;
  const pct = Math.min(100, Math.max(0, Math.round((progress / rangeSize) * 100)));
  const pointsToNext = Math.max(0, Math.ceil(nextLevel.minScore - avgScore));

  return { pct, pointsToNext, nextRank: nextLevel };
}
