// ─────────────────────────────────────────────────────────────────────────────
// Movement catalogue — the single source of truth for the exercise picker, the
// Movement Database screen, form-guide GIFs and the campaign label mapping.
//
// Structure: a JOINT ACTION (what the joint is doing, e.g. "Vertical Pull")
// contains MOVEMENTS (what you actually do, e.g. "Wide-Grip Lat Pulldown").
// One movement appears exactly once, under exactly one action.
//
// `gifId` is always explicit: it is the id of a real entry in
// lib/exercise-db.ts (yuhonas/free-exercise-db) and is never guessed.
// ─────────────────────────────────────────────────────────────────────────────

export interface CatalogueMovement {
  /** Display name. Also the exercise name written into a campaign. */
  name: string;
  /** Equipment / implement used. Shown next to the name. */
  equipment: string;
  /** Primary muscles, shown as the subtitle. */
  muscles: string[];
  /** free-exercise-db id for the two-frame form guide. */
  gifId: string;
  /** Optional curated video; otherwise a YouTube search is used. */
  videoUrl?: string;
}

export interface CatalogueAction {
  /** Display name of the joint action. */
  name: string;
  /** One line describing what the action trains. */
  subtitle: string;
  movements: CatalogueMovement[];
}

const M = (
  name: string,
  equipment: string,
  muscles: string,
  gifId: string,
  videoUrl?: string,
): CatalogueMovement => ({ name, equipment, muscles: muscles.split("/"), gifId, videoUrl });

export const CATALOGUE: CatalogueAction[] = [
  {
    name: "Horizontal Press",
    subtitle: "Bench / push-up patterns — chest, front delts, triceps",
    movements: [
      M("Barbell Bench Press", "Barbell", "Chest/Front Delts/Triceps", "Barbell_Bench_Press_-_Medium_Grip", "https://www.youtube.com/watch?v=1V3vpcaxRYQ"),
      M("Incline Bench Press", "Barbell", "Upper Chest/Front Delts/Triceps", "Barbell_Incline_Bench_Press_-_Medium_Grip", "https://www.youtube.com/watch?v=SrqOu55lrYU"),
      M("Close-Grip Bench Press", "Barbell", "Triceps/Chest/Front Delts", "Close-Grip_Barbell_Bench_Press"),
      M("Larsen Press", "Barbell", "Chest/Front Delts/Triceps", "Barbell_Bench_Press_-_Medium_Grip"),
      M("Dumbbell Bench Press", "Dumbbells", "Chest/Front Delts/Triceps", "Dumbbell_Bench_Press"),
      M("Machine Chest Press", "Machine", "Chest/Front Delts/Triceps", "Machine_Bench_Press"),
      M("Cable Chest Press", "Cable", "Chest/Front Delts/Triceps", "Cable_Crossover"),
      M("Parallel Bar Dips", "Bodyweight", "Chest/Triceps/Front Delts", "Parallel_Bar_Dip"),
      M("Ring Dips", "Rings", "Chest/Triceps/Front Delts", "Ring_Dips"),
      M("Assisted Dip", "Machine", "Chest/Triceps/Front Delts", "Dip_Machine"),
      M("Push-Up", "Bodyweight", "Chest/Front Delts/Triceps", "Pushups"),
      M("Wide Push-Up", "Bodyweight", "Chest/Front Delts/Triceps", "Push-Up_Wide"),
      M("Chest Fly", "Machine", "Chest", "Butterfly"),
      M("Cable Fly", "Cable", "Chest", "Cable_Crossover"),
      M("Dumbbell Fly", "Dumbbells", "Chest", "Dumbbell_Flyes"),
    ],
  },
  {
    name: "Vertical Press",
    subtitle: "Overhead press patterns — front/side delts, triceps",
    movements: [
      M("Barbell Overhead Press", "Barbell", "Front Delts/Side Delts/Triceps", "Barbell_Shoulder_Press", "https://www.youtube.com/shorts/OLePvpxQEGk"),
      M("Military Press", "Barbell", "Front Delts/Triceps", "Standing_Military_Press"),
      M("Push Press", "Barbell", "Front Delts/Triceps", "Push_Press"),
      M("Dumbbell Shoulder Press", "Dumbbells", "Front Delts/Side Delts/Triceps", "Dumbbell_Shoulder_Press"),
      M("Arnold Press", "Dumbbells", "Front Delts/Side Delts/Triceps", "Arnold_Dumbbell_Press"),
      M("Machine Shoulder Press", "Machine", "Front Delts/Side Delts/Triceps", "Seated_Cable_Shoulder_Press"),
      M("Cable Shoulder Press", "Cable", "Front Delts/Side Delts/Triceps", "Cable_Shoulder_Press"),
      M("Handstand Push-Up", "Bodyweight", "Front Delts/Triceps", "Handstand_Push-Ups"),
    ],
  },
  {
    name: "Lateral Raise",
    subtitle: "Side delt isolation",
    movements: [
      M("Dumbbell Lateral Raise", "Dumbbells", "Side Delts", "Side_Lateral_Raise", "https://www.youtube.com/watch?v=pOmbQuGeHf8"),
      M("Cable Lateral Raise", "Cable", "Side Delts", "Side_Lateral_Raise"),
      M("Machine Lateral Raise", "Machine", "Side Delts", "Side_Lateral_Raise"),
      M("Band Lateral Raise", "Band", "Side Delts", "Lateral_Raise_-_With_Bands"),
      M("Front Raise", "Dumbbells", "Front Delts", "Front_Dumbbell_Raise"),
    ],
  },
  {
    name: "Rear Delt",
    subtitle: "Rear delt and scapular isolation",
    movements: [
      M("Rear Delt Fly", "Dumbbells", "Rear Delts/Traps", "Reverse_Flyes"),
      M("Reverse Pec Deck", "Machine", "Rear Delts/Traps", "Reverse_Machine_Flyes"),
      M("Cable Rear Delt Fly", "Cable", "Rear Delts/Traps", "Cable_Rear_Delt_Fly"),
      M("Face Pull", "Cable", "Rear Delts/Traps", "Face_Pull"),
      M("Prone Trap Raise", "Dumbbells", "Traps/Rear Delts", "Standing_Dumbbell_Straight-Arm_Front_Delt_Raise_Above_Head"),
      M("Kelso Shrug", "Dumbbells", "Traps/Rear Delts", "Dumbbell_Shrug"),
    ],
  },
  {
    name: "Vertical Pull",
    subtitle: "Pulldowns and pull-ups — lats, biceps",
    movements: [
      M("Lat Pulldown", "Cable", "Lats/Biceps", "Wide-Grip_Lat_Pulldown"),
      M("Wide-Grip Lat Pulldown", "Cable", "Lats/Biceps", "Wide-Grip_Lat_Pulldown"),
      M("Reverse-Grip Lat Pulldown", "Cable", "Lats/Biceps", "Underhand_Cable_Pulldowns"),
      M("Isolateral Pulldown", "Machine", "Lats/Biceps", "Wide-Grip_Lat_Pulldown"),
      M("Pull-Up", "Bodyweight", "Lats/Biceps", "Pullups"),
      M("Chin-Up", "Bodyweight", "Lats/Biceps", "Chin-Up"),
      M("Scapular Pull-Up", "Bodyweight", "Traps/Lats", "Scapular_Pull-Up"),
      M("Assisted Pull-Up", "Machine", "Lats/Biceps", "Band_Assisted_Pull-Up"),
      M("Weighted Pull-Up", "Bodyweight", "Lats/Biceps", "Pullups"),
    ],
  },
  {
    name: "Horizontal Pull",
    subtitle: "Row patterns — mid-back, lats, rear delts",
    movements: [
      M("Barbell Row", "Barbell", "Mid-Back/Lats/Biceps", "Bent_Over_Barbell_Row"),
      M("Pendlay Row", "Barbell", "Mid-Back/Lats", "Bent_Over_Barbell_Row"),
      M("Seated Cable Row", "Cable", "Mid-Back/Lats/Biceps", "Seated_Cable_Rows"),
      M("Chest-Supported Row", "Machine", "Mid-Back/Rear Delts", "Lying_T-Bar_Row"),
      M("Meadows Row", "Barbell", "Lats/Mid-Back", "One-Arm_Dumbbell_Row"),
      M("Single-Arm Dumbbell Row", "Dumbbells", "Lats/Mid-Back", "One-Arm_Dumbbell_Row"),
      M("Chest-Supported Dumbbell Row", "Dumbbells", "Mid-Back/Rear Delts", "Bent_Over_Two-Dumbbell_Row"),
      M("Cable Upright Row", "Cable", "Traps/Side Delts", "Upright_Cable_Row"),
      M("Bodyweight Row", "Bodyweight", "Mid-Back/Lats/Biceps", "Inverted_Row"),
      M("Incline Row", "Bodyweight", "Mid-Back/Lats/Biceps", "Inverted_Row"),
    ],
  },
  {
    name: "Squat",
    subtitle: "Squat patterns — quads, glutes",
    movements: [
      M("Back Squat", "Barbell", "Quads/Glutes", "Barbell_Squat", "https://www.youtube.com/watch?v=0tn5K9NlCfo"),
      M("Front Squat", "Barbell", "Quads/Glutes", "Front_Squat_Clean_Grip"),
      M("Smith Machine Squat", "Machine", "Quads/Glutes", "Smith_Machine_Squat"),
      M("Hack Squat", "Machine", "Quads/Glutes", "Hack_Squat"),
      M("Pendulum Squat", "Machine", "Quads/Glutes", "Hack_Squat"),
      M("Leg Press", "Machine", "Quads/Glutes", "Leg_Press"),
      M("Single-Leg Leg Press", "Machine", "Quads/Glutes", "Leg_Press"),
      M("Bulgarian Split Squat", "Dumbbells", "Quads/Glutes", "Split_Squats"),
      M("Bodyweight Squat", "Bodyweight", "Quads/Glutes", "Bodyweight_Squat"),
    ],
  },
  {
    name: "Hinge",
    subtitle: "Hip-hinge patterns — hamstrings, glutes, lower back",
    movements: [
      M("Romanian Deadlift", "Barbell", "Hamstrings/Glutes/Lower Back", "Romanian_Deadlift"),
      M("Dumbbell Romanian Deadlift", "Dumbbells", "Hamstrings/Glutes", "Romanian_Deadlift"),
      M("Deadlift", "Barbell", "Hamstrings/Glutes/Lower Back", "Barbell_Deadlift"),
      M("Kettlebell Swing", "Kettlebell", "Glutes/Hamstrings", "One-Arm_Kettlebell_Swings"),
      M("Back Extension", "Machine", "Lower Back/Glutes/Hamstrings", "Hyperextensions_Back_Extensions"),
      M("Reverse Hyperextension", "Machine", "Glutes/Hamstrings", "Reverse_Hyperextension"),
      M("Cable Pull-Through", "Cable", "Glutes/Hamstrings", "Pull_Through"),
      M("Good Morning", "Barbell", "Hamstrings/Lower Back", "Good_Morning"),
    ],
  },
  {
    name: "Hip Extension",
    subtitle: "Glute-focused extension and abduction",
    movements: [
      M("Barbell Hip Thrust", "Barbell", "Glutes", "Barbell_Hip_Thrust"),
      M("Banded Hip Thrust", "Band", "Glutes", "Barbell_Hip_Thrust"),
      M("Hip Abduction", "Machine", "Glutes", "Thigh_Abductor"),
      M("Cable Hip Abduction", "Cable", "Glutes", "Thigh_Abductor"),
      M("Glute Kickback", "Machine", "Glutes", "Glute_Kickback"),
      M("Cable Glute Kickback", "Cable", "Glutes", "Glute_Kickback"),
      M("Lateral Band Walk", "Band", "Glutes", "Monster_Walk"),
    ],
  },
  {
    name: "Leg Extension",
    subtitle: "Knee extension — quadriceps isolation",
    movements: [
      M("Leg Extension", "Machine", "Quads", "Leg_Extensions"),
      M("Single-Leg Extension", "Machine", "Quads", "Leg_Extensions"),
    ],
  },
  {
    name: "Leg Curl",
    subtitle: "Knee flexion — hamstring isolation",
    movements: [
      M("Lying Leg Curl", "Machine", "Hamstrings", "Lying_Leg_Curls"),
      M("Seated Leg Curl", "Machine", "Hamstrings", "Seated_Leg_Curl"),
      M("Single-Leg Curl", "Machine", "Hamstrings", "Seated_Leg_Curl"),
      M("Nordic Ham Curl", "Bodyweight", "Hamstrings/Glutes", "Lying_Leg_Curls"),
    ],
  },
  {
    name: "Calf Raise",
    subtitle: "Calves",
    movements: [
      M("Standing Calf Raise", "Machine", "Calves", "Standing_Calf_Raises"),
      M("Seated Calf Raise", "Machine", "Calves", "Seated_Calf_Raise"),
      M("Straight-Leg Calf Raise", "Machine", "Calves", "Standing_Barbell_Calf_Raise"),
      M("Calf Press", "Machine", "Calves", "Calf_Press"),
    ],
  },
  {
    name: "Biceps Curl",
    subtitle: "Elbow flexion — biceps and brachialis",
    movements: [
      M("Barbell Curl", "Barbell", "Biceps", "Barbell_Curl"),
      M("EZ-Bar Curl", "EZ Bar", "Biceps", "Close-Grip_EZ_Bar_Curl", "https://www.youtube.com/watch?v=zG2xJ0Q5QtI"),
      M("Dumbbell Curl", "Dumbbells", "Biceps", "Dumbbell_Bicep_Curl"),
      M("Incline Dumbbell Curl", "Dumbbells", "Biceps", "Alternate_Incline_Dumbbell_Curl"),
      M("Hammer Curl", "Dumbbells", "Brachialis/Biceps/Forearms", "Hammer_Curls"),
      M("Preacher Curl", "EZ Bar", "Biceps", "Preacher_Curl"),
      M("Dumbbell Preacher Curl", "Dumbbells", "Biceps", "Two-Arm_Dumbbell_Preacher_Curl"),
      M("Zottman Curl", "Dumbbells", "Biceps/Forearms", "Zottman_Curl"),
      M("Cable Curl", "Cable", "Biceps", "Standing_Biceps_Cable_Curl"),
      M("Cable Rope Hammer Curl", "Cable", "Brachialis/Biceps", "Cable_Hammer_Curls_-_Rope_Attachment"),
    ],
  },
  {
    name: "Triceps Extension",
    subtitle: "Elbow extension — triceps",
    movements: [
      M("Triceps Pushdown", "Cable", "Triceps", "Triceps_Pushdown"),
      M("Overhead Cable Triceps Extension", "Cable", "Triceps", "Cable_Rope_Overhead_Triceps_Extension"),
      M("Skull Crusher", "EZ Bar", "Triceps", "EZ-Bar_Skullcrusher"),
      M("Dumbbell Skull Crusher", "Dumbbells", "Triceps", "Dumbbell_One-Arm_Triceps_Extension"),
      M("Cable Kickback", "Cable", "Triceps", "One-Legged_Cable_Kickback"),
      M("Overhead Triceps Extension", "Dumbbells", "Triceps", "Overhead_Triceps"),
      M("Kneeling Cable Triceps Extension", "Cable", "Triceps", "Kneeling_Cable_Triceps_Extension"),
    ],
  },
  {
    name: "Core",
    subtitle: "Trunk flexion, anti-extension and stability",
    movements: [
      M("Cable Crunch", "Cable", "Abs", "Cable_Crunch"),
      M("Weighted Crunch", "Machine", "Abs", "Weighted_Crunches"),
      M("Crunch", "Bodyweight", "Abs", "Crunches"),
      M("Bicycle Crunch", "Bodyweight", "Abs/Obliques", "Air_Bike"),
      M("Hanging Leg Raise", "Bodyweight", "Abs/Hip Flexors", "Hanging_Leg_Raise"),
      M("Lying Leg Raise", "Bodyweight", "Lower Abs/Hip Flexors", "Hanging_Leg_Raise"),
      M("Plank", "Bodyweight", "Abs", "Plank"),
      M("Ab Vacuum", "Bodyweight", "Abs", "Stomach_Vacuum"),
    ],
  },
  {
    name: "Neck",
    subtitle: "Neck flexion and extension",
    movements: [
      M("Neck Curl", "Plate", "Neck", "Lying_Face_Up_Plate_Neck_Resistance"),
      M("Neck Extension", "Plate", "Neck", "Lying_Face_Down_Plate_Neck_Resistance"),
    ],
  },
];

// ─── Lookup ──────────────────────────────────────────────────────────────────

export const CATALOGUE_MOVEMENTS: CatalogueMovement[] = CATALOGUE.flatMap((a) => a.movements);

export const CATALOGUE_MOVEMENT_BY_NAME: Map<string, CatalogueMovement> = new Map(
  CATALOGUE_MOVEMENTS.map((m) => [m.name.toLowerCase(), m]),
);

export const ACTION_BY_MOVEMENT: Map<string, string> = new Map(
  CATALOGUE.flatMap((a) => a.movements.map((m) => [m.name.toLowerCase(), a.name] as [string, string])),
);

export function findCatalogueMovement(name: string | null | undefined): CatalogueMovement | null {
  if (!name) return null;
  return CATALOGUE_MOVEMENT_BY_NAME.get(name.trim().toLowerCase()) ?? null;
}

// Small typo tolerance so "inclien bench" still finds Incline Bench Press: at
// most one edit per word (a transposition, substitution, insertion or
// deletion). Deliberately narrow — movement names are short, so more slack
// starts matching unrelated movements.
function withinOneEdit(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  // Same length: one substitution, or one adjacent transposition.
  if (a.length === b.length) {
    const diffs: number[] = [];
    for (let i = 0; i < a.length && diffs.length <= 2; i++) {
      if (a[i] !== b[i]) diffs.push(i);
    }
    if (diffs.length === 1) return true;
    return (
      diffs.length === 2 &&
      diffs[1] === diffs[0] + 1 &&
      a[diffs[0]] === b[diffs[1]] &&
      a[diffs[1]] === b[diffs[0]]
    );
  }
  // One extra character: a single insertion/deletion.
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  let i = 0;
  let j = 0;
  let skipped = false;
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) {
      i++;
      j++;
    } else if (skipped) {
      return false;
    } else {
      skipped = true;
      j++;
    }
  }
  return true;
}

// ─── Name resolution for free text (pasted splits, AI imports, typed names) ──
//
// Abbreviations people and LLMs actually write. Kept separate from the campaign
// label table: this is about one exercise name arriving from outside the app.
const SHORTHAND: Record<string, string> = {
  rdl: "Romanian Deadlift",
  "rdls": "Romanian Deadlift",
  "db rdl": "Dumbbell Romanian Deadlift",
  "sldl": "Romanian Deadlift",
  "conv deadlift": "Deadlift",
  "bb row": "Barbell Row",
  "bent over row": "Barbell Row",
  "barbell bent over row": "Barbell Row",
  "t bar row": "Chest-Supported Row",
  "t-bar row": "Chest-Supported Row",
  "db row": "Single-Arm Dumbbell Row",
  "dumbbell row": "Single-Arm Dumbbell Row",
  "one arm db row": "Single-Arm Dumbbell Row",
  "cable row": "Seated Cable Row",
  "lat pulldown": "Lat Pulldown",
  "lat pull down": "Lat Pulldown",
  "pulldown": "Lat Pulldown",
  "pullup": "Pull-Up",
  "pullups": "Pull-Up",
  "pull ups": "Pull-Up",
  "pull-up": "Pull-Up",
  "chin up": "Chin-Up",
  "chinup": "Chin-Up",
  "chin ups": "Chin-Up",
  "ohp": "Barbell Overhead Press",
  "overhead press": "Barbell Overhead Press",
  "bb ohp": "Barbell Overhead Press",
  "db ohp": "Dumbbell Shoulder Press",
  "shoulder press": "Dumbbell Shoulder Press",
  "db shoulder press": "Dumbbell Shoulder Press",
  "seated db press": "Dumbbell Shoulder Press",
  "arnold": "Arnold Press",
  "lat raise": "Dumbbell Lateral Raise",
  "lateral raise": "Dumbbell Lateral Raise",
  "lateral raises": "Dumbbell Lateral Raise",
  "side raise": "Dumbbell Lateral Raise",
  "side lateral raise": "Dumbbell Lateral Raise",
  "db lateral raise": "Dumbbell Lateral Raise",
  "cable lateral raise": "Cable Lateral Raise",
  "band lateral raise": "Band Lateral Raise",
  "front raise": "Front Raise",
  "db front raise": "Front Raise",
  "reverse fly": "Rear Delt Fly",
  "reverse flyes": "Rear Delt Fly",
  "rear delt fly": "Rear Delt Fly",
  "rear delt flye": "Rear Delt Fly",
  "face pull": "Face Pull",
  "face pulls": "Face Pull",
  "pec deck": "Chest Fly",
  "pec fly": "Chest Fly",
  "pec dec": "Chest Fly",
  "chest fly": "Chest Fly",
  "cable fly": "Cable Fly",
  "cable crossover": "Cable Fly",
  "db fly": "Dumbbell Fly",
  "db flyes": "Dumbbell Fly",
  "incline db press": "Incline Bench Press",
  "incline dumbbell press": "Incline Bench Press",
  "incline press": "Incline Bench Press",
  "incline bench": "Incline Bench Press",
  "bench": "Barbell Bench Press",
  "bench press": "Barbell Bench Press",
  "flat bench": "Barbell Bench Press",
  "bb bench": "Barbell Bench Press",
  "db bench": "Dumbbell Bench Press",
  "dumbbell bench": "Dumbbell Bench Press",
  "db press": "Dumbbell Bench Press",
  "close grip bench": "Close-Grip Bench Press",
  "cgbp": "Close-Grip Bench Press",
  "dips": "Parallel Bar Dips",
  "dip": "Parallel Bar Dips",
  "pushup": "Push-Up",
  "pushups": "Push-Up",
  "push ups": "Push-Up",
  "push-up": "Push-Up",
  "squat": "Back Squat",
  "barbell squat": "Back Squat",
  "back squat": "Back Squat",
  "front squat": "Front Squat",
  "goblet squat": "Bodyweight Squat",
  "split squat": "Bulgarian Split Squat",
  "bulgarian split squat": "Bulgarian Split Squat",
  "bss": "Bulgarian Split Squat",
  "leg press": "Leg Press",
  "hack squat": "Hack Squat",
  "leg extension": "Leg Extension",
  "leg extensions": "Leg Extension",
  "leg ext": "Leg Extension",
  "quad extension": "Leg Extension",
  "leg curl": "Lying Leg Curl",
  "leg curls": "Lying Leg Curl",
  "ham curl": "Lying Leg Curl",
  "hamstring curl": "Lying Leg Curl",
  "seated leg curl": "Seated Leg Curl",
  "lying leg curl": "Lying Leg Curl",
  "nordic curl": "Nordic Ham Curl",
  "calf raise": "Standing Calf Raise",
  "calf raises": "Standing Calf Raise",
  "standing calf raise": "Standing Calf Raise",
  "seated calf raise": "Seated Calf Raise",
  "hip thrust": "Barbell Hip Thrust",
  "hip thrusts": "Barbell Hip Thrust",
  "bb hip thrust": "Barbell Hip Thrust",
  "glute bridge": "Banded Hip Thrust",
  "hip abduction": "Hip Abduction",
  "cable kickback": "Cable Glute Kickback",
  "bicep curl": "Barbell Curl",
  "biceps curl": "Barbell Curl",
  "barbell curl": "Barbell Curl",
  "bb curl": "Barbell Curl",
  "db curl": "Dumbbell Curl",
  "dumbbell curl": "Dumbbell Curl",
  "hammer curl": "Hammer Curl",
  "hammer curls": "Hammer Curl",
  "incline curl": "Incline Dumbbell Curl",
  "incline db curl": "Incline Dumbbell Curl",
  "preacher curl": "Preacher Curl",
  "ez bar curl": "EZ-Bar Curl",
  "ez curl": "EZ-Bar Curl",
  "cable curl": "Cable Curl",
  "skullcrusher": "Skull Crusher",
  "skull crusher": "Skull Crusher",
  "skullcrushers": "Skull Crusher",
  "skull crushers": "Skull Crusher",
  "tricep pushdown": "Triceps Pushdown",
  "triceps pushdown": "Triceps Pushdown",
  "pushdown": "Triceps Pushdown",
  "rope pushdown": "Triceps Pushdown",
  "overhead tricep extension": "Overhead Cable Triceps Extension",
  "overhead triceps extension": "Overhead Cable Triceps Extension",
  "tricep extension": "Overhead Cable Triceps Extension",
  "cable crunch": "Cable Crunch",
  "cable crunches": "Cable Crunch",
  "hanging leg raise": "Hanging Leg Raise",
  "leg raise": "Lying Leg Raise",
  "ab wheel": "Plank",
  "shrug": "Kelso Shrug",
  "shrugs": "Kelso Shrug",
  "db shrug": "Kelso Shrug",
  "dumbbell shrug": "Kelso Shrug",
};

const EQUIPMENT_WORDS = new Set([
  "barbell", "bb", "dumbbell", "dumbbells", "db", "cable", "machine", "smith",
  "ez", "kettlebell", "kb", "band", "banded", "weighted", "assisted",
]);

// Words that carry no identifying information, so they never help a match.
const NOISE = new Set([
  "barbell", "bb", "dumbbell", "dumbbells", "db", "cable", "machine", "smith",
  "machine", "weighted", "single", "two", "arm", "both", "alternating", "seated",
  "standing", "lying", "flat", "with", "the", "and", "on", "to", "a", "an",
  "exercise", "reps", "sets", "x", "of", "for",
]);

function normalizeName(raw: string): string {
  return raw
    .toLowerCase()
    // Strip trailing volume notation ("Bench Press 4x8", "Squat 3 x 5",
    // "RDL 3 sets") in case a set/rep count survived in the name.
    .replace(/\b\d+\s*(?:x|×)\s*\d+\b.*$/, " ")
    .replace(/\b\d+\s*(?:sets?|reps?)\b.*$/, " ")
    .replace(/[()\[\]]/g, " ")
    .replace(/[^a-z0-9\- ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type MatchConfidence = "exact" | "alias" | "fuzzy" | "none";

export interface NameMatch {
  movement: CatalogueMovement | null;
  confidence: MatchConfidence;
  /** The normalised input that was matched, for the review UI. */
  query: string;
}

/**
 * Resolve a freely typed exercise name to a catalogue movement.
 *
 * Deliberately conservative: a generic word ("press", "curl", "raise") that
 * could belong to several movements resolves to nothing rather than guessing,
 * because the caller can fall back to a custom exercise the user can see and
 * fix. Never returns a movement by substring accident.
 */
export function matchCatalogueExercise(raw: string | null | undefined): NameMatch {
  const query = normalizeName(raw ?? "");
  if (!query) return { movement: null, confidence: "none", query };

  // 1. Exact movement name.
  const exact = CATALOGUE_MOVEMENT_BY_NAME.get(query);
  if (exact) return { movement: exact, confidence: "exact", query };

  // 2. Shorthand / colloquial name.
  const shorthand = SHORTHAND[query];
  if (shorthand) {
    const movement = CATALOGUE_MOVEMENT_BY_NAME.get(shorthand.toLowerCase()) ?? null;
    if (movement) return { movement, confidence: "alias", query };
  }

  // 3. Shorthand with an equipment word in front ("Barbell RDL", "Dumbbell
  //    Shrug"): strip only equipment lead-ins, never a movement qualifier.
  //    "Zercher Squat" must stay unresolved instead of becoming Back Squat.
  const words = query.split(" ");
  for (let i = 1; i < words.length; i++) {
    if (!EQUIPMENT_WORDS.has(words[i - 1])) break;
    const rest = words.slice(i).join(" ");
    const hit = SHORTHAND[rest];
    if (hit) {
      const movement = CATALOGUE_MOVEMENT_BY_NAME.get(hit.toLowerCase()) ?? null;
      if (movement) return { movement, confidence: "alias", query };
    }
  }

  // 4. Everything except the noise words must point at one movement.
  const terms = words.filter((w) => w && !NOISE.has(w));
  if (terms.length === 0) return { movement: null, confidence: "none", query };

  const candidates = CATALOGUE_MOVEMENTS.filter((m) => movementMatchesQuery(m, query));
  if (candidates.length === 1) {
    return { movement: candidates[0], confidence: "fuzzy", query };
  }

  // 5. Many candidates: accept only an unambiguous one where every identifying
  //    term appears AND the movement adds nothing beyond generic vocabulary.
  //    This is what stops "Zercher Squat" resolving to "Back Squat": the extra
  //    qualifier "zercher" is not a noise word, so the input is not a match.
  const precise = candidates.filter((m) => {
    const words = normalizeName(m.name).split(" ");
    if (!terms.every((term) => words.some((w) => w === term || w.includes(term) || withinOneEdit(w, term)))) {
      return false;
    }
    // Every word of the candidate must be either generic ("barbell") or
    // literally present in the input. A qualifier the input does not contain
    // ("back" in "zercher squat") means this is a different movement, and a
    // 1-edit near-miss is not enough to assume otherwise.
    return words.every((w) => NOISE.has(w) || terms.includes(w));
  });
  if (precise.length === 1) {
    return { movement: precise[0], confidence: "fuzzy", query };
  }

  return { movement: null, confidence: "none", query };
}

export function movementMatchesQuery(movement: CatalogueMovement, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystacks = [movement.name, movement.equipment, ...movement.muscles].map((h) => h.toLowerCase());
  if (haystacks.some((h) => h.includes(q))) return true;
  const words = movement.name.toLowerCase().split(/[^a-z0-9-]+/);
  const terms = q.split(/\s+/).filter(Boolean);
  return terms.every((term) => words.some((w) => w.includes(term) || withinOneEdit(w, term)));
}

export function getActionForMovement(name: string | null | undefined): string | null {
  if (!name) return null;
  return ACTION_BY_MOVEMENT.get(name.trim().toLowerCase()) ?? null;
}
