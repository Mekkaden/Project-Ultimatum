// ─────────────────────────────────────────────────────────────────────────────
// Campaign label → catalogue movement.
//
// Campaigns label a slot with the training intent ("Elbow Flexion (Isolation)",
// "Quad-Biased Squat (Heavy)") and name the movement separately. The picker and
// the Movement Database must only ever show the movement, so every label used
// by lib/workout-data.ts is mapped here to the catalogue movement it prescribes.
//
// Stored campaigns keep their original labels: the mapping is applied at read
// time, so no local or cloud data has to be migrated.
// ─────────────────────────────────────────────────────────────────────────────

import { CATALOGUE_MOVEMENT_BY_NAME } from "./exercise-catalogue";

export const LABEL_TO_MOVEMENT: Record<string, string> = {
  // ── Horizontal press ──
  Bench: "Barbell Bench Press",
  "Bench Press": "Barbell Bench Press",
  "Bench (Light)": "Barbell Bench Press",
  "Heavy Bench": "Barbell Bench Press",
  "Heavy Bench Press": "Barbell Bench Press",
  "Paused Bench Press": "Barbell Bench Press",
  "Pause Barbell Bench Press": "Barbell Bench Press",
  "Barbell Bench Press": "Barbell Bench Press",
  "Close Grip Bench": "Close-Grip Bench Press",
  "Larsen Press": "Larsen Press",
  "Incline Bench": "Incline Bench Press",
  "Incline Bench Press": "Incline Bench Press",
  "Incline DB Press": "Incline Bench Press",
  "Dumbbell Incline Press": "Incline Bench Press",
  "Dumbbell Chest Press": "Dumbbell Bench Press",
  "Machine Chest Press": "Machine Chest Press",
  "Pec Dec": "Chest Fly",
  "Pec Deck": "Chest Fly",
  "Cable Flye": "Cable Fly",

  // ── Vertical press ──
  "Barbell Overhead Press": "Barbell Overhead Press",
  "Frontal Delt Press": "Barbell Overhead Press",
  "Shoulder Press": "Machine Shoulder Press",
  "DB Seated Shoulder Press": "Dumbbell Shoulder Press",
  "Dumbbell Overhead Press": "Dumbbell Shoulder Press",
  "Military Press": "Military Press",
  "Push Press": "Push Press",
  "Arnold Press": "Arnold Press",
  "Assisted Dip": "Assisted Dip",
  "Plank + Dragon Flags": "Plank",

  // ── Lateral raise ──
  "Dumbbell Lateral Raise": "Dumbbell Lateral Raise",
  "DB Lateral Raise": "Dumbbell Lateral Raise",
  "Dumbbell Lateral Raise (Mid-Range)": "Dumbbell Lateral Raise",
  "Dumbbell Lateral Raise (Top-Range)": "Dumbbell Lateral Raise",
  "Dumbbell Lateral Raise Pulse": "Dumbbell Lateral Raise",
  "Lateral Raise": "Dumbbell Lateral Raise",
  "Lateral Raises": "Dumbbell Lateral Raise",
  "Machine Lateral Raise": "Machine Lateral Raise",
  "Band Lateral Raise": "Band Lateral Raise",
  "Dumbbell Front Raise": "Front Raise",

  // ── Rear delt ──
  "Rear Delt": "Rear Delt Fly",
  "Rear Delt Fly": "Rear Delt Fly",
  "Rear Delt Flies": "Rear Delt Fly",
  "Rear delt fly": "Rear Delt Fly",
  "Reverse Pec Deck": "Reverse Pec Deck",
  "Reverse Peck Deck": "Reverse Pec Deck",
  "Seated Face Pull": "Face Pull",
  "Cable Rope Face Pull": "Face Pull",
  "Prone Trap Raise": "Prone Trap Raise",
  "Kelso Shrug": "Kelso Shrug",

  // ── Vertical pull ──
  "Lat Pulldown": "Lat Pulldown",
  "Machine Pulldown": "Lat Pulldown",
  "Isolateral Pulldown": "Isolateral Pulldown",
  "Wide-Grip Lat Pulldown": "Wide-Grip Lat Pulldown",
  "Reverse Grip Lat Pulldown": "Reverse-Grip Lat Pulldown",
  "Pull-Up": "Pull-Up",
  PullUp: "Pull-Up",
  "Weighted Pull-ups": "Weighted Pull-Up",
  "Assisted Pull-Up": "Assisted Pull-Up",
  "Chin-Up": "Chin-Up",
  "Vertical Row / Pull-ups": "Pull-Up",
  "Vertical Pull Progression": "Pull-Up",
  "Isometric Pull Progression": "Scapular Pull-Up",
  "Scapula Isolation Progression": "Scapular Pull-Up",
  "Grip & Scapula Progression": "Scapular Pull-Up",

  // ── Horizontal pull ──
  "Barbell Row": "Barbell Row",
  "Heavy Barbell Row": "Barbell Row",
  "Pendlay Row": "Pendlay Row",
  "Cable Row": "Seated Cable Row",
  "Horizontal Row": "Seated Cable Row",
  "Second Row Variation": "Seated Cable Row",
  "Unilateral Cable Row": "Seated Cable Row",
  "Chest-Supported Row": "Chest-Supported Row",
  "Chest-Supported T-Bar Row": "Chest-Supported Row",
  "Chest-Supported Mid-Back Row": "Chest-Supported Row",
  "Meadows Row": "Meadows Row",
  "Dumbbell Row": "Single-Arm Dumbbell Row",
  "Single Arm Lat Row": "Single-Arm Dumbbell Row",
  "Lat-Focused Single-Arm Row": "Single-Arm Dumbbell Row",
  "Cable Upright Row": "Cable Upright Row",
  "Horizontal Pull Progression": "Bodyweight Row",

  // ── Squat ──
  Squat: "Back Squat",
  "Back Squat": "Back Squat",
  "Heavy Squat": "Back Squat",
  "Squat (Light)": "Back Squat",
  "Cadenced Squats (3-0-2)": "Back Squat",
  "Front Squat": "Front Squat",
  "Front Squats": "Front Squat",
  "Machine Squat": "Smith Machine Squat",
  Hack: "Hack Squat",
  "Hack Squat": "Hack Squat",
  "Leg Press": "Leg Press",
  "Unilateral Leg Press": "Single-Leg Leg Press",
  "Single Leg Press": "Single-Leg Leg Press",
  "Knee Banded Leg Press": "Leg Press",
  "Split Squats": "Bulgarian Split Squat",
  "Squat Pattern Progression": "Bodyweight Squat",
  "Lunge Pattern Progression": "Bulgarian Split Squat",

  // ── Hinge ──
  Deadlift: "Deadlift",
  "Heavy Deadlift": "Deadlift",
  "Deadlift (Light)": "Deadlift",
  "Romanian Deadlift": "Romanian Deadlift",
  "Barbell Romanian Deadlift": "Romanian Deadlift",
  "Unilateral Dumbbell RDL": "Dumbbell Romanian Deadlift",
  "Kettlebell Swing": "Kettlebell Swing",
  "Bodyweight Round-Back 45° Hyperextension": "Back Extension",
  "Reverse Hyperextension": "Reverse Hyperextension",
  "Cable Pull-Through": "Cable Pull-Through",

  // ── Hip extension ──
  "Barbell Hip Thrust": "Barbell Hip Thrust",
  "Pause Barbell Hip Thrust": "Barbell Hip Thrust",
  "Knee-Banded Barbell Hip Thrust": "Banded Hip Thrust",
  "Machine Seated Hip Abduction (Myo-Reps)": "Hip Abduction",
  "Cable Hip Abduction": "Cable Hip Abduction",
  "Cable Standing Hip Abduction": "Cable Hip Abduction",
  "Cable Standing Glute Kickback": "Cable Glute Kickback",
  "Donkey Kickback": "Glute Kickback",
  "Lateral Band Walk": "Lateral Band Walk",
  "Hip Extension Progression": "Barbell Hip Thrust",

  // ── Leg extension ──
  "Leg Extension": "Leg Extension",
  "Leg Extensions": "Leg Extension",
  "Leg Ext": "Leg Extension",

  // ── Leg curl ──
  "Lying Leg Curl": "Lying Leg Curl",
  "Lying Curl": "Lying Leg Curl",
  "Seated Leg Curl": "Seated Leg Curl",
  "Seated Curl": "Seated Leg Curl",
  "Leg Curls": "Lying Leg Curl",
  "Unilateral Lying Leg Curl": "Single-Leg Curl",
  "Unilateral Seat Leg Curl": "Single-Leg Curl",
  "Nordic Ham Curl": "Nordic Ham Curl",

  // ── Calf ──
  "Standing Calf Raise": "Standing Calf Raise",
  "Straight-Leg Calf Raise": "Straight-Leg Calf Raise",
  "Seated Calf Raise": "Seated Calf Raise",
  "Calf Isolation Progression": "Standing Calf Raise",

  // ── Biceps ──
  "Barbell Curls": "Barbell Curl",
  "Biceps Curls": "Barbell Curl",
  "EZ Bar Curl": "EZ-Bar Curl",
  "EZ BAR Curl": "EZ-Bar Curl",
  "EZ bar Curl": "EZ-Bar Curl",
  "Heavy EZ Bar Curls": "EZ-Bar Curl",
  "Cable EZ Curl": "EZ-Bar Curl",
  "Hammer Curl": "Hammer Curl",
  "Hammer Curls": "Hammer Curl",
  "Elbow Supp Hammer Curl": "Hammer Curl",
  "Preacher Hammer Curls": "Hammer Curl",
  "Dumbbell Supinated Curl": "Dumbbell Curl",
  "DB Alternating Curl": "Dumbbell Curl",
  "Preacher Dumbbell Curl": "Dumbbell Preacher Curl",
  "Eccentric-Accentuated Preacher Curl": "Preacher Curl",
  "Inverse Zottman Curl": "Zottman Curl",
  "Cable Single-Arm Curl": "Cable Curl",
  "Elbow Flexion Progression": "Dumbbell Curl",

  // ── Triceps ──
  "Triceps Pushdown": "Triceps Pushdown",
  "Bar Pushdown": "Triceps Pushdown",
  "Bar pushdown": "Triceps Pushdown",
  "V-Bar Press Down": "Triceps Pushdown",
  "Overhead Pushdown": "Overhead Cable Triceps Extension",
  "Overhead Cable Triceps Extension": "Overhead Cable Triceps Extension",
  "Cable Overhead Triceps Extension": "Overhead Cable Triceps Extension",
  "Rope Overhead Elbow Extension": "Overhead Cable Triceps Extension",
  "Overhead Triceps Extensions": "Overhead Triceps Extension",
  "EZ Bar Skull Crusher": "Skull Crusher",
  "Dumbbell Skull Crusher": "Dumbbell Skull Crusher",
  "Cable Rope Kickback": "Cable Kickback",
  "Elbow Extension Progression": "Triceps Pushdown",

  // ── Core ──
  "Cable Crunches": "Cable Crunch",
  "Weighted Crunches": "Weighted Crunch",
  "Weighted Ab Crunches": "Weighted Crunch",
  "Plate-Weighted Crunch": "Weighted Crunch",
  Crunch: "Crunch",
  "Bicycle Crunch": "Bicycle Crunch",
  "Lower Abs": "Lying Leg Raise",
  "Hanging Leg Raise": "Hanging Leg Raise",
  Plank: "Plank",
  "Weighted Plank": "Plank",
  "Ab Vacuum": "Ab Vacuum",
  "Core Compression Progression": "Plank",
  "Core Anti-Extension Progression": "Plank",
  "Core Flexion Progression": "Crunch",
  "Core / Pull Progression": "Pull-Up",
  "Horizontal Press Progression": "Push-Up",
  "Vertical Press Progression": "Parallel Bar Dips",
  "Vertical Press Hold Progression": "Handstand Push-Up",

  // ── Neck ──
  "Neck Curls": "Neck Curl",
  "Neck Ext": "Neck Extension",
};

export function resolveMovementName(...candidates: (string | null | undefined)[]): string | null {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    const mapped = LABEL_TO_MOVEMENT[trimmed];
    if (mapped) return mapped;
    // Already a canonical movement name (e.g. picked from the catalogue).
    if (CATALOGUE_MOVEMENT_BY_NAME.has(trimmed.toLowerCase())) {
      const canonical = CATALOGUE_MOVEMENT_BY_NAME.get(trimmed.toLowerCase())!;
      return canonical.name;
    }
  }
  return null;
}
