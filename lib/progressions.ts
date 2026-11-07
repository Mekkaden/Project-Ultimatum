export interface ProgressionCategoryData {
  id: string;
  title: string;
  subtitle: string;
  tiers: string[];
}

const PROGRESSION_TIERS: Record<string, ProgressionCategoryData> = {
  "Vertical Pull Progression": {
    id: "vertical-pull",
    title: "1. Vertical Pull",
    subtitle: "Primary: Lats, Biceps, Scapular Retractors",
    tiers: [
      "Active Bar Hangs (60s)",
      "Scapular Pull-ups",
      "Negative (Eccentric) Pull-ups",
      "Strict Pull-ups / Chin-ups",
      "L-Sit Pull-ups",
      "Chest-to-Bar Pull-ups",
      "Archer Pull-ups",
      "One-Arm Pull-up Negatives",
      "Strict One-Arm Pull-up (OAP)"
    ]
  },
  "Horizontal Pull Progression": {
    id: "horizontal-pull",
    title: "2. Horizontal Pull",
    subtitle: "Primary: Mid-back, Rhomboids, Rear Delts",
    tiers: [
      "Vertical Wall Rows",
      "Incline Rows",
      "Horizontal Bodyweight Rows",
      "Wide Rows",
      "Archer Rows",
      "Straddle One-Arm Rows",
      "Strict One-Arm Rows",
      "Tuck Front Lever Rows",
      "Adv Tuck Front Lever Rows",
      "Straddle Front Lever Rows",
      "Full Front Lever Rows"
    ]
  },
  "Horizontal Press Progression": {
    id: "horizontal-press",
    title: "3. Horizontal Press",
    subtitle: "Primary: Pectorals, Anterior Deltoids, Triceps",
    tiers: [
      "Incline Push-ups",
      "Strict Push-ups",
      "Diamond Push-ups",
      "Pseudo Planche Push-ups",
      "Archer Push-ups",
      "Incline One-Arm Push-ups",
      "Straddle One-Arm Push-ups",
      "Strict One-Arm Push-up (OAPU)",
      "Tuck Planche Push-ups",
      "Adv Tuck Planche Push-ups",
      "Straddle Planche Push-ups",
      "Full Planche Push-ups"
    ]
  },
  "Vertical Press Progression": {
    id: "vertical-press",
    title: "4. Vertical Press (Dips & HSPU)",
    subtitle: "Primary: Anterior Deltoids, Triceps, Upper Chest",
    tiers: [
      "Parallel Bar Dips",
      "Ring Dips",
      "Rings Turned Out (RTO) Dips",
      "RTO 45° / 75° Dips",
      "Wall Handstand Push-up Negatives",
      "Wall Handstand Push-ups (HSPU)",
      "Headstand Push-ups (Freestanding)",
      "Freestanding Handstand Push-ups",
      "90 Degree Handstand Push-ups"
    ]
  },
  "Vertical Press Hold Progression": {
    id: "vertical-press-hold",
    title: "Vertical Press Holds",
    subtitle: "Primary: Shoulders, Core Stability",
    tiers: [
      "Wall Handstand Hold",
      "Freestanding Handstand Hold",
      "One Arm Handstand Hold"
    ]
  },
  "Squat Pattern Progression": {
    id: "squat-pattern",
    title: "5. Squat Pattern (Legs)",
    subtitle: "Primary: Quadriceps, Glutes, Hamstrings",
    tiers: [
      "Assisted Squats",
      "Deep Bodyweight Squats",
      "Split Squats",
      "Bulgarian Split Squats",
      "Step-ups / Deep Step-ups",
      "Cossack Squats",
      "Assisted Pistol Squats",
      "Strict Pistol Squats",
      "Beginner Shrimp Squats",
      "Advanced (Two-Hand) Shrimp Squats",
      "Nordic Curls (Posterior Chain)"
    ]
  },
  "Core Compression Progression": {
    id: "core-compression",
    title: "6. Core & Static Holds",
    subtitle: "Primary: Rectus Abdominis, Obliques, Shoulders",
    tiers: [
      "Lying Hollow Body Holds",
      "Tuck L-Sit",
      "Full L-Sit",
      "V-Sit",
      "Tuck Front / Back Lever",
      "Adv Tuck Front / Back Lever",
      "Straddle Front / Back Lever",
      "Full Front / Back Lever",
      "Human Flag"
    ]
  },
};
// NOTE: "Core Progression" key is intentionally removed — it was an exact duplicate of
// "Core Compression Progression" (same tiers, same title, same subtitle). Having both
// caused the ProgressionModal to silently discard one via deduplication, and the
// WorkoutTracker would never resolve the "Core Progression" key anyway since no campaign
// sets prescribedEquipment to that string. Use "Core Compression Progression" instead.

// Progression keys are selection helpers: the picker lists one row per key and a
// campaign stores the key as `prescribedEquipment`, which is why the catalogue
// keeps a movement per key. Campaigns that prescribe a real movement simply use
// that movement.
export const GLOBAL_PROGRESSIONS: Record<string, ProgressionCategoryData> = PROGRESSION_TIERS;

// The catalogue movement each progression is listed under, so choosing a
// progression in the picker prescribes a real, form-guide-backed movement.
export const PROGRESSION_MOVEMENTS: Record<string, string> = {
  "Vertical Pull Progression": "Pull-Up",
  "Horizontal Pull Progression": "Bodyweight Row",
  "Horizontal Press Progression": "Push-Up",
  "Vertical Press Progression": "Parallel Bar Dips",
  "Vertical Press Hold Progression": "Handstand Push-Up",
  "Squat Pattern Progression": "Bodyweight Squat",
  "Core Compression Progression": "Plank",
  "Core Flexion Progression": "Crunch",
  "Core Anti-Extension Progression": "Plank",
  "Core / Pull Progression": "Pull-Up",
  "Isometric Pull Progression": "Scapular Pull-Up",
  "Lunge Pattern Progression": "Bulgarian Split Squat",
  "Hip Extension Progression": "Barbell Hip Thrust",
  "Elbow Flexion Progression": "Dumbbell Curl",
  "Elbow Extension Progression": "Triceps Pushdown",
  "Grip & Scapula Progression": "Scapular Pull-Up",
  "Scapula Isolation Progression": "Scapular Pull-Up",
  "Calf Isolation Progression": "Standing Calf Raise",
};
