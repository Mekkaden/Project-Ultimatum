export type Muscle =
  | "chest"
  | "front-delts"
  | "side-delts"
  | "rear-delts"
  | "lats"
  | "traps"
  | "lower-back"
  | "abs"
  | "biceps"
  | "triceps"
  | "forearms"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves";

interface MappingRule {
  keywords: string[];
  muscles: Muscle[];
}

// Ordered by specificity. getMusclesForExercise returns the FIRST rule whose
// keyword matches, which is what prevents broad words like "extension" or
// "curl" from stealing exercises that belong elsewhere (e.g. "Leg Extension"
// was previously misclassified as triceps, "Leg Curl" as biceps).
const MUSCLE_RULES: MappingRule[] = [
  // Hamstring isolation (before generic "curl")
  { keywords: ["leg curl", "nordic", "good morning", "hamstring"], muscles: ["hamstrings", "glutes"] },
  // Quad isolation
  { keywords: ["leg extension", "sissy"], muscles: ["quads"] },
  // Hip hinge / posterior chain. Quads are not listed: a deadlift is a hip
  // hinge, not a squat, and counting it as quad volume inflated leg totals.
  // Barbell deadlift gets a small trap/forearm contribution from the grip hold.
  { keywords: ["barbell deadlift", "trap bar deadlift", "trap-bar deadlift"], muscles: ["hamstrings", "glutes", "lower-back", "traps", "forearms"] },
  { keywords: ["romanian", "rdl", "deadlift", "rack pull", "hyperextension", "back extension", "hip extension", "pull-through", "pull through"], muscles: ["hamstrings", "glutes", "lower-back"] },
  // Hip abduction is glute-med, not glute-max isolation: keep it out of the
  // heavy glute volume bucket so the heatmap does not double count.
  { keywords: ["hip thrust", "glute bridge", "glute kickback", "donkey kickback"], muscles: ["glutes"] },
  { keywords: ["hip abduction", "abduct", "monster walk", "lateral band walk", "band walk"], muscles: ["glutes"] },
  // Calves
  { keywords: ["calf", "soleus"], muscles: ["calves"] },
  // Squat patterns
  { keywords: ["squat", "leg press", "hack", "lunge", "split squat", "bulgarian"], muscles: ["quads", "glutes"] },
  // Vertical pull
  { keywords: ["pull-up", "pull up", "chin-up", "chin up", "pulldown", "pullover", "vertical pull"], muscles: ["lats", "biceps"] },
  // Traps / upper back. Upright row is a trap + side-delt movement and must be
  // matched before the generic "row" rule below.
  { keywords: ["shrug", "scapula", "trap raise", "upright row", "kelso", "face pull"], muscles: ["traps", "rear-delts"] },
  // Rear delts
  { keywords: ["rear delt", "reverse fly", "reverse pec"], muscles: ["rear-delts", "traps"] },
  // Side delts
  { keywords: ["lateral raise", "side raise", "side lateral", "lu raise"], muscles: ["side-delts"] },
  // Front delts
  { keywords: ["front raise"], muscles: ["front-delts"] },
  // Shoulder press / vertical press
  { keywords: ["overhead press", "military press", "shoulder press", "arnold", "pike push", "delt press", "vertical press", "push press", "frontal"], muscles: ["front-delts", "side-delts", "triceps"] },
  // Core (before "extension"/"curl" so core progressions aren't stolen)
  // NOTE: use "ab " and "abs" rather than bare "ab", otherwise "cable" matches.
  { keywords: ["crunch", "plank", "ab ", "abs", "hollow", "l-sit", "lever", "leg raise", "sit-up", "core"], muscles: ["abs"] },
  // Biceps
  { keywords: ["curl", "zottman", "bicep", "elbow flexion"], muscles: ["biceps", "forearms"] },
  // Triceps
  { keywords: ["tricep", "extension", "pushdown", "press down", "skull", "elbow extension", "kickback"], muscles: ["triceps"] },
  // Chest / horizontal press
  { keywords: ["bench", "chest press", "push-up", "push up", "dip", "larsen", "close grip", "horizontal press", "incline press", "incline db"], muscles: ["chest", "front-delts", "triceps"] },
  // Chest fly
  { keywords: ["fly", "flye", "pec"], muscles: ["chest"] },
  // Horizontal row
  { keywords: ["row", "t-bar", "seal", "meadows", "pendlay", "helms", "horizontal pull"], muscles: ["lats", "traps", "biceps", "rear-delts"] },
  // Explosive hinge
  { keywords: ["swing"], muscles: ["glutes", "hamstrings"] },
];

// Weekly working-set targets per muscle (MEV = minimum effective volume,
// MRV = maximum recoverable volume), from the standard hypertrophy guidelines
// the programs are built on. Used by the heatmap and the trends chart so a
// colour means "under / optimal / over" instead of "more is redder".
export const MUSCLE_WEEKLY_TARGETS: Record<Muscle, { mev: number; mrv: number }> = {
  chest: { mev: 8, mrv: 22 },
  "front-delts": { mev: 6, mrv: 16 },
  "side-delts": { mev: 8, mrv: 26 },
  "rear-delts": { mev: 6, mrv: 22 },
  lats: { mev: 10, mrv: 24 },
  traps: { mev: 4, mrv: 20 },
  "lower-back": { mev: 3, mrv: 12 },
  abs: { mev: 4, mrv: 20 },
  biceps: { mev: 6, mrv: 20 },
  triceps: { mev: 6, mrv: 20 },
  forearms: { mev: 2, mrv: 14 },
  quads: { mev: 8, mrv: 22 },
  hamstrings: { mev: 6, mrv: 20 },
  glutes: { mev: 4, mrv: 20 },
  calves: { mev: 6, mrv: 22 },
};

export type VolumeZone = "untrained" | "under" | "optimal" | "over";

export function volumeZone(sets: number, muscle: Muscle): VolumeZone {
  const { mev, mrv } = MUSCLE_WEEKLY_TARGETS[muscle] ?? { mev: 6, mrv: 20 };
  if (sets <= 0) return "untrained";
  if (sets < mev) return "under";
  if (sets > mrv) return "over";
  return "optimal";
}

// Bodyweight movements are logged with the added weight only, which is 0 for
// most users. Treat a set with no load at all as one "bodyweight unit" so
// calisthenics volume and recovery are not invisible.
export function setLoad(weight: number, reps: number): number {
  const w = Number(weight) || 0;
  const r = Number(reps) || 0;
  if (w > 0) return w * r;
  // Unloaded set (calisthenics, bands, bodyweight progression): each rep counts
  // as one unit of work so the muscle still registers volume.
  return r > 0 ? r : 0;
}

// Narrower attribution for fatigue tracking: a compound does not leave every
// secondary muscle equally fatigued, so recovery only considers the movers that
// actually carry the load. Volume still uses the full list.
const PRIMARY_RULES: { keywords: string[]; muscles: Muscle[] }[] = [
  { keywords: ["leg curl", "nordic", "good morning"], muscles: ["hamstrings"] },
  { keywords: ["leg extension", "sissy"], muscles: ["quads"] },
  { keywords: ["calf", "soleus"], muscles: ["calves"] },
  { keywords: ["pull-up", "chin-up", "pulldown", "pullover", "vertical pull"], muscles: ["lats"] },
  { keywords: ["row", "t-bar", "meadows", "pendlay", "horizontal pull", "face pull"], muscles: ["lats", "rear-delts"] },
  { keywords: ["shrug", "trap raise", "upright row", "kelso"], muscles: ["traps"] },
  { keywords: ["rear delt", "reverse fly", "reverse pec"], muscles: ["rear-delts"] },
  { keywords: ["lateral raise", "side raise", "side lateral"], muscles: ["side-delts"] },
  { keywords: ["front raise"], muscles: ["front-delts"] },
  { keywords: ["overhead press", "military press", "shoulder press", "arnold", "pike push", "push press", "delt press", "frontal"], muscles: ["front-delts"] },
  { keywords: ["bench", "chest press", "push-up", "push up", "dip", "larsen", "horizontal press", "incline press", "incline db"], muscles: ["chest"] },
  { keywords: ["fly", "flye", "pec"], muscles: ["chest"] },
  { keywords: ["curl", "zottman", "bicep", "elbow flexion"], muscles: ["biceps"] },
  { keywords: ["tricep", "pushdown", "press down", "skull", "elbow extension", "kickback", "overhead extension"], muscles: ["triceps"] },
  { keywords: ["squat", "leg press", "hack", "lunge", "split squat", "bulgarian"], muscles: ["quads"] },
  { keywords: ["romanian", "rdl", "deadlift", "rack pull", "hyperextension", "back extension", "hip extension", "pull-through", "pull through", "swing"], muscles: ["hamstrings"] },
  { keywords: ["hip thrust", "glute bridge", "glute kickback", "donkey kickback", "hip abduction", "abduct", "band walk", "monster walk"], muscles: ["glutes"] },
  { keywords: ["crunch", "plank", "ab ", "abs", "hollow", "l-sit", "lever", "leg raise", "sit-up", "core"], muscles: ["abs"] },
];

export function getPrimaryMuscles(exerciseName: string): Muscle[] {
  // Hyphens and underscores are both used between words by the exercise names
  // and by the storage keys, so normalise them before matching.
  const name = exerciseName.toLowerCase().replace(/[_-]+/g, " ");
  for (const rule of PRIMARY_RULES) {
    if (rule.keywords.some((kw) => name.includes(kw))) return rule.muscles;
  }
  // Fall back to the broad mapping so nothing silently disappears.
  return getMusclesForExercise(exerciseName);
}

export function getMusclesForExercise(exerciseName: string): Muscle[] {
  const name = exerciseName.toLowerCase().replace(/[_-]+/g, " ");

  // Neck has no dedicated muscle in the heatmap model; attribute to upper traps.
  if (name.includes("neck")) return ["traps"];

  for (const rule of MUSCLE_RULES) {
    if (rule.keywords.some((kw) => name.includes(kw))) {
      return rule.muscles;
    }
  }

  // Last-resort category fallback for unknown/custom exercise names.
  if (/(press|bench|push|dip|fly|pec|incline)/.test(name)) return ["chest", "front-delts", "triceps"];
  if (/(pull|row|lat|chin|deadlift)/.test(name)) return ["lats", "biceps"];
  if (/(shoulder|delt|raise|shrug)/.test(name)) return ["front-delts", "side-delts", "triceps"];
  if (/(squat|leg|lunge|curl|hamstring|quad|glute|calf)/.test(name)) return ["quads", "hamstrings", "glutes"];
  if (/(crunch|plank|ab|core|hollow|l-sit|lever)/.test(name)) return ["abs"];

  return [];
}
