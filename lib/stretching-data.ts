import { Campaign } from "./workout-data";

// ---------------------------------------------------------------------------
// Global rules (surfaced via Campaign.globalRule on every flexibility screen)
// ---------------------------------------------------------------------------
export const FLEX_GLOBAL_RULE =
  "Global Tooltips — Contract–Relax (C–R): 1) Hold a comfortable stretch 10–30s. 2) Gently contract the stretched muscle (20–30% effort) against the floor/hand without moving for 5–10s. 3) Inhale, relax, exhale deeper into the stretch for 30–60s (5–10 slow breaths). 2:1 Asymmetry Rule: always start with your tighter side, then your looser side, then your tighter side a second time.";

const CR = "C–R Protocol";

// ---------------------------------------------------------------------------
// Tier 1 — Foundation (2-day full body). Variables used by the 3-day variant.
// ---------------------------------------------------------------------------
const T1_SPINE: [string, string, string[], string][] = [
  [
    "Elephant Walks (Alternating Forward Fold Warm-up)",
    "Floor / Bench",
    ["Standing forward fold hamstring warm-up", "Seated forward fold"],
    "Bend forward with hands on the floor or a bench, knees slightly bent. Alternate straightening one leg at a time, letting the lower back and hips loosen. 1–2 minutes.",
  ],
  [
    "Upper Back Round (Rounded Thoracic Flexion)",
    "Bench / Floor",
    ["Seated Cat-Cow", "Child's Pose"],
    "Sit on a bench hugging your knees (or kneel grabbing your heels with the crown of your head on the floor). Tuck the chin and pull back against the knees/feet to round the upper back. Targets traps, rhomboids, mid-back. 5 slow breaths.",
  ],
  [
    "Prone Press-Up Extension (Sphinx / Cobra)",
    "Floor",
    ["Sphinx Pose", "Cobra Pose"],
    "Lie face down and push the chest up onto the forearms or hands using arm strength only — keep glutes and lower back completely relaxed. Follow immediately by hugging both knees to the chest on your back. Targets abs and the anterior spine. 10 slow breaths.",
  ],
  [
    "Lying Knee-Across-Body Twist",
    "Floor",
    ["Supine Spinal Twist", "Reclined Twist with Block"],
    "Lie on your back, hug one knee toward the same-side armpit for 30s, then pull the knee across the body toward the floor while keeping the opposite shoulder pinned down. Targets glutes, lower back, obliques.",
  ],
  [
    "Seated Cross-Body Glute Hug",
    "Floor / Bench",
    ["Figure-4 Glute Stretch", "Pigeon Pose"],
    "Sit tall with one leg straight and cross the other foot outside that knee. Tilt the pelvis forward to arch the lower back slightly and hug the bent knee toward the opposite shoulder. Targets glutes and piriformis.",
  ],
  [
    "Deep Runner's Lunge (World's Greatest Stretch Base)",
    "Floor",
    ["Lunge Hip Flexor Stretch", "Half-Kneeling Hip Flexor Stretch"],
    "Step one foot forward into a wide lunge with hands on the floor inside the front foot and slide the back knee as far behind as possible. Try to straighten the back knee without letting the hips rise. Targets front glutes and groin, plus the back hip flexors.",
  ],
  [
    "Anchored Wall Pec & Biceps Stretch",
    "Wall",
    ["Doorway Pec Stretch", "Doorway Biceps Stretch"],
    "Stand next to a wall, palm flat at head height, and rotate the torso away. Set 1 with the thumb pointing UP (chest and front delt); Set 2 with the thumb pointing DOWN (biceps).",
  ],
];

const T1_LOWER: [string, string, string[], string][] = [
  [
    "Deep Bodyweight Squat + Wall Sit Warm-up",
    "Floor / Wall",
    ["Heel-Elevated Squat Hold", "Goblet Squat Hold"],
    "20 slow, controlled full-range squats keeping the heels flat on the floor, then hold a 90-degree wall sit for 30–60 seconds.",
  ],
  [
    "Standing Overhead Side Bend (Lat & Oblique)",
    "Wall",
    ["Doorway Lat Stretch", "Seated Side Bend"],
    "Stand with the back flat against a wall. Rest one hand on the hip or thigh and reach the other arm overhead, leaning sideways. Slowly roll the top shoulder forward on the way out. Targets obliques, lats and QL. 5 slow breaths per side.",
  ],
  [
    "Wall Calf Stretch (Straight-Leg Gastrocnemius)",
    "Wall",
    ["Step Calf Stretch", "Downward Dog Calf Stretch"],
    "Step one foot far back against a wall, lock the back knee straight and keep the heel flat on the floor (press slightly toward the pinky-toe side so the arch does not collapse).",
  ],
  [
    "Kneeling Chest-to-Thigh Hamstring Stretch",
    "Floor",
    ["Seated Single-Leg Hamstring Stretch", "Lying Strap Hamstring Stretch"],
    "From a kneeling lunge, wrap one arm under the front thigh and glue the ribs to the thigh. Keeping the chest glued to the leg, slide the front heel forward (or push the hips back) until you feel a deep hamstring stretch.",
  ],
  [
    "Upright Standing Quad Stretch",
    "Wall",
    ["Lying Quad Stretch", "Couch Stretch"],
    "Stand holding a wall, tuck the tailbone under (squeeze glutes and abs first so the lower back does not arch), pull the heel to the glute and pull the knee slightly back.",
  ],
  [
    "Seated Butterfly Stretch (Groin & Adductor)",
    "Floor / Wall",
    ["Reclined Butterfly", "Frog Stretch"],
    "Sit with the back flat against a wall, bring the soles of the feet together and press the knees toward the floor with the hands or elbows.",
  ],
  [
    "Seated Neck Release (Flexion & Trap Side Tilt)",
    "Chair",
    ["Supine Neck Flexion", "Levator Scapulae Stretch"],
    "Sit tall, lace the fingers lightly behind the top of the head and let the chin drop to the chest (push the head back into the hands for 3s, then relax deeper). Then hold the chair seat with one hand, lean away and tilt the ear toward the opposite shoulder. 5 breaths per side.",
  ],
];

function toExercises(
  rows: [string, string, string[], string][],
  target: string,
  sets = 3
) {
  return rows.map(([slotName, prescribedEquipment, substitutions, notes]) => ({
    slotName,
    prescribedEquipment,
    sets,
    targetRIR: target,
    substitutions,
    notes,
  }));
}

export const STRETCHING_BEGINNER_2_DAY: Campaign = {
  id: "stretching-beginner-2-day",
  title: "Tier 1 Foundation: 2-Day Full Body",
  globalRule: FLEX_GLOBAL_RULE,
  days: [
    {
      id: "stretching-beginner-2-day-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Full Body A",
      subtitle: "Spine, posterior chain, chest & shoulders",
      totalSets: T1_SPINE.length * 3,
      exercises: toExercises(T1_SPINE, CR),
    },
    {
      id: "stretching-beginner-2-day-d2",
      dayNumber: 2,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: [],
    },
    {
      id: "stretching-beginner-2-day-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Full Body B",
      subtitle: "Quads, hamstrings, groin & neck",
      totalSets: T1_LOWER.length * 3,
      exercises: toExercises(T1_LOWER, CR),
    },
  ],
};

// ---------------------------------------------------------------------------
// Tier 1 — Foundation (3-day). Full-body A/B plus an integration day.
// ---------------------------------------------------------------------------
export const STRETCHING_BEGINNER_3_DAY: Campaign = {
  id: "stretching-beginner-3-day",
  title: "Tier 1 Foundation: 3-Day Full Body",
  globalRule: FLEX_GLOBAL_RULE,
  days: [
    {
      id: "stretching-beginner-3-day-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Full Body A",
      subtitle: "Spine, posterior chain, chest & shoulders",
      totalSets: 21,
      exercises: toExercises(T1_SPINE, CR),
    },
    {
      id: "stretching-beginner-3-day-d2",
      dayNumber: 2,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: [],
    },
    {
      id: "stretching-beginner-3-day-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Full Body B",
      subtitle: "Quads, hamstrings, groin & neck",
      totalSets: 21,
      exercises: toExercises(T1_LOWER, CR),
    },
    {
      id: "stretching-beginner-3-day-d4",
      dayNumber: 4,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: [],
    },
    {
      id: "stretching-beginner-3-day-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Integration",
      subtitle: "Rotation & full-body flow",
      totalSets: 15,
      exercises: toExercises(
        [
          [
            "Lying Knee-Across-Body Twist",
            "Floor",
            ["Supine Spinal Twist", "Reclined Twist with Block"],
            "Both sides. Tighter side first, looser side, tighter side again (2:1 rule).",
          ],
          [
            "Deep Runner's Lunge (World's Greatest Stretch Base)",
            "Floor",
            ["Lunge Hip Flexor Stretch", "Half-Kneeling Hip Flexor Stretch"],
            "Add a gentle thoracic rotation at the top between C–R cycles.",
          ],
          [
            "Seated Cross-Body Glute Hug",
            "Floor / Bench",
            ["Figure-4 Glute Stretch", "Pigeon Pose"],
            "Sit tall, tilt the pelvis forward and hug the knee across the body.",
          ],
          [
            "Seated Butterfly Stretch (Groin & Adductor)",
            "Floor / Wall",
            ["Reclined Butterfly", "Frog Stretch"],
            "Close the session by opening the hips back up after the twists.",
          ],
          [
            "Prone Press-Up Extension (Sphinx / Cobra)",
            "Floor",
            ["Sphinx Pose", "Cobra Pose"],
            "Finish with a gentle extension, then hug the knees to the chest.",
          ],
        ],
        CR
      ),
    },
  ],
};

// ---------------------------------------------------------------------------
// Tier 2 — Intermediate (3-day regional split)
// ---------------------------------------------------------------------------
export const STRETCHING_INTERMEDIATE_3_DAY: Campaign = {
  id: "stretching-intermediate-3-day",
  title: "Tier 2 Intermediate: 3-Day Regional Split",
  globalRule: FLEX_GLOBAL_RULE,
  days: [
    {
      id: "stretching-intermediate-3-day-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Upper Body",
      subtitle: "Thoracic posture & shoulders",
      totalSets: 21,
      exercises: toExercises(
        [
          [
            "Standing Wall Puppy (Thoracic & Lat Extension)",
            "Wall",
            ["Puppy Pose", "Doorway Lat Stretch"],
            "Stand a step from a wall, hands overhead on the wall, and sink the chest and armpits toward the floor to arch the mid/upper back.",
          ],
          [
            "Kneeling Upper Back Round (Scapular C–R)",
            "Floor",
            ["Seated Cat-Cow", "Child's Pose"],
            "Kneel and grab the heels or arches (or knees while seated), rest the crown of the head on the floor and push the hips forward. Shrug the shoulders up for 5s, then squeeze the shoulder blades together for 5s.",
          ],
          [
            "Prone Cross-Body Rear Delt Stretch",
            "Floor",
            ["Cross-Body Shoulder Stretch", "Thread the Needle"],
            "Lie face down, thread one arm straight across under the throat (palm up) and slowly lower the chest weight onto the arm. Targets rear delts and rhomboids.",
          ],
          [
            "Behind-the-Back Chest & Biceps Opener",
            "Bench / Bar",
            ["Doorway Pec Stretch", "Doorway Biceps Stretch"],
            "Clasp the hands behind the back (or hold a towel), roll the shoulders back, rest the hands on a behind-the-back bar or high bench and squat down slightly to raise the arms.",
          ],
          [
            "Cow Face Arms (Triceps & Rotator Cuff)",
            "Floor / Strap",
            ["Overhead Triceps Stretch", "Sleeper Stretch"],
            "Reach one hand over the shoulder down the back and the other behind the lower back reaching up. Grab the fingers or a towel between the hands.",
          ],
          [
            "Anchored Neck Side Stretch + Rotations",
            "Chair",
            ["Levator Scapulae Stretch", "Scalene Stretch"],
            "Sit gripping the seat to pull one shoulder down and tilt the head away. Finish by slowly turning the chin over each shoulder, pausing 3s at the limit.",
          ],
        ],
        CR
      ),
    },
    {
      id: "stretching-intermediate-3-day-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Posterior Chain",
      subtitle: "Calves, glutes & hamstrings",
      totalSets: 18,
      exercises: toExercises(
        [
          [
            "Kneeling Bent-Knee Calf Stretch (Soleus)",
            "Floor",
            ["Seated Calf Stretch", "Wall Calf Stretch"],
            "Kneel on one knee with the other foot flat in front. Lean torso weight through the elbow onto the front knee, driving the knee forward over the toes with the heel glued down.",
          ],
          [
            "Downward Dog Single-Leg Calf & Sciatic",
            "Floor / Bench",
            ["Downward Dog Calf Stretch", "Seated Calf Stretch"],
            "Hands on the floor or a low bench in a pike, one foot stepped back with the heel flat. Keep the back flat and hinge further at the hips.",
          ],
          [
            "Supine Figure-4 Stretch (Lying Piriformis)",
            "Floor",
            ["Figure-4 Glute Stretch", "Pigeon Pose"],
            "Lie on your back, cross one ankle over the opposite knee, reach through and pull the bottom thigh toward the chest while keeping the tailbone flat.",
          ],
          [
            "Seated Pretzel Glute Stretch",
            "Floor",
            ["Pigeon Pose", "90/90 Hip Stretch"],
            "Sit with one shin folded in front and step the other foot over that knee. Keep both sit bones flat, sit tall and hug the top knee into the opposite armpit.",
          ],
          [
            "Kneeling Chest-to-Thigh Hamstring Stretch",
            "Floor",
            ["Seated Single-Leg Hamstring Stretch", "Lying Strap Hamstring Stretch"],
            "Two C–R cycles per leg. First hook the heel back for 5s; second, press the heel straight down for 5s, then slide the heel forward with the ribs glued to the thigh.",
          ],
          [
            "Lying Towel Hamstring Extension",
            "Floor / Strap",
            ["Lying Strap Hamstring Stretch", "Supine Hamstring Stretch"],
            "Lie on your back, pull one knee tight to the ribs and loop a strap around the foot. Keep the thigh pinned to the chest and slowly straighten the knee.",
          ],
        ],
        CR
      ),
    },
    {
      id: "stretching-intermediate-3-day-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Anterior Chain",
      subtitle: "Quads, hip flexors, adductors & lower back",
      totalSets: 18,
      exercises: toExercises(
        [
          [
            "Wide-Stance Straddle Fold Warm-up",
            "Floor",
            ["Cossack Squat", "Wide-Legged Forward Fold"],
            "Stand with feet 2.5× shoulder-width apart, shift side to side into gentle side lunges, then fold down the middle grabbing the ankles with a flat back. 2 minutes.",
          ],
          [
            "Seated Shin & Ankle Stretch (Toe-Pointed Instep)",
            "Floor",
            ["Kneeling Ankle Stretch", "Hero Pose"],
            "Sit with one leg folded beside the hip (toes pointing straight back), lean weight onto that hip and lift the bent knee slightly off the floor.",
          ],
          [
            "Reclined Single-Leg Quad Stretch (Hero Variation)",
            "Floor / Wall",
            ["Couch Stretch", "Lying Quad Stretch"],
            "From the folded-leg position (or a couch stretch against a wall), tuck the tailbone under, brace the abs and lean back onto the elbows.",
          ],
          [
            "Active Long-Lunge Hip Flexor Stretch",
            "Floor",
            ["Half-Kneeling Hip Flexor Stretch", "Couch Stretch"],
            "Take a very long lunge stance with hands resting on the front knee. Tuck the tailbone under, keep the torso vertical and try to straighten the back knee without letting the hips rise. Targets the deep psoas.",
          ],
          [
            "Seated Hurdler Side Bend (Lower Back / QL)",
            "Floor / Strap",
            ["Side Bend Stretch", "Seated Straddle Side Bend"],
            "Sit with one leg extended wide to the side and the other foot tucked into the groin. Rest the inside elbow on the floor, roll the top shoulder open and reach overhead toward the toes. Targets QL and lats.",
          ],
          [
            "Wall-Assisted Seated Pancake (Straddle)",
            "Wall",
            ["Seated Straddle Stretch", "Frog Stretch"],
            "Sit facing a wall with straight legs spread as wide as possible against the wall. Use the hands behind the hips to inch the pelvis closer.",
          ],
        ],
        CR
      ),
    },
  ],
};

// ---------------------------------------------------------------------------
// Tier 3 — Advanced (4-day mobility & splits progression)
// ---------------------------------------------------------------------------
export const STRETCHING_ADVANCED_4_DAY: Campaign = {
  id: "stretching-advanced-4-day",
  title: "Tier 3 Advanced: 4-Day Mobility & Splits",
  globalRule: FLEX_GLOBAL_RULE,
  days: [
    {
      id: "stretching-advanced-4-day-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Front Splits",
      subtitle: "Hamstrings, calves & front splits",
      totalSets: 18,
      exercises: toExercises(
        [
          [
            "Standing Chest-to-Thigh Forward Fold (Warm-up)",
            "Floor",
            ["Standing Forward Fold", "Seated Forward Fold"],
            "Stand on one or both legs, hug behind the thighs or calves with the ribs glued to the thighs, and slowly straighten the knees.",
          ],
          [
            "Weighted Single-Leg Step Calf Hang",
            "Step / Curb",
            ["Wall Calf Stretch", "Downward Dog Calf Stretch"],
            "Stand on the edge of a step on the ball of one foot with a straight knee and let full bodyweight sink the heel down.",
          ],
          [
            "Seated Single-Leg Pike (Hurdler Hamstring)",
            "Floor",
            ["Seated Single-Leg Hamstring Stretch", "Standing Split"],
            "Sit with one leg straight in front and the other tucked back or folded in, hinging forward from the hips with a completely flat spine.",
          ],
          [
            "Kneeling Outer-Hamstring Pyramid",
            "Floor",
            ["Half-Kneeling Hamstring Stretch", "Seated Single-Leg Hamstring Stretch"],
            "Half-kneeling hamstring stretch with the front foot turned slightly in across the midline to isolate the outer hamstring and sciatic tract.",
          ],
          [
            "Supine Chest-Pinned Hamstring Extension",
            "Floor",
            ["Lying Strap Hamstring Stretch", "Supine Hamstring Stretch"],
            "Lie on your back, hug the thigh tightly to the chest, grab the foot or heel and extend the knee toward 135–180° without letting the thigh leave the ribs. Two C–R cycles per side.",
          ],
          [
            "Supported Front Splits (Blocks / Pads)",
            "Blocks / Floor",
            ["Front Split", "Half Split"],
            "Slide into the deepest front split with hands on blocks or a rolled mat under the front hamstring, keeping the hips square.",
          ],
        ],
        CR
      ),
    },
    {
      id: "stretching-advanced-4-day-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Backbends",
      subtitle: "Hip flexors, quads & thoracic backbend",
      totalSets: 18,
      exercises: toExercises(
        [
          [
            "Prone Superman + Foam-Roller Ab Curls",
            "Floor / Foam Roller",
            ["Prone Back Extension", "Cobra Pose"],
            "10 slow prone arm and leg lifts with no momentum, followed by 10 slow crunches draped backward over a foam roller or rolled mat.",
          ],
          [
            "Couch Stretch / Deep Psoas Lunge",
            "Wall / Floor",
            ["Half-Kneeling Hip Flexor Stretch", "Long-Lunge Hip Flexor Stretch"],
            "Rear knee against a wall (shin vertical) or a deep floor lunge. Tuck the tailbone hard, brace the abs and drive the hips forward with an upright torso. Two C–R cycles.",
          ],
          [
            "Full Reclined Hero Quad Stretch (Single-Leg)",
            "Floor",
            ["Hero Pose", "Lying Quad Stretch"],
            "Sit with one leg folded beside the hip and lie flat on your back, pulling the opposite knee to the chest to lock the lower back flat.",
          ],
          [
            "Upward Facing Dog (Suspended Cobra)",
            "Floor",
            ["Cobra Pose", "Sphinx Pose"],
            "From a push-up position, lower the hips until the thighs hover just above the floor, arms locked straight, shoulders pulled back, and tilt the head back.",
          ],
          [
            "Thoracic Backbend Over Foam Roller",
            "Foam Roller / Bench",
            ["Thoracic Extension", "Supported Bridge"],
            "Lie face up with the mid/upper back draped over a roller or padded bench edge, extending straight arms overhead toward the floor.",
          ],
          [
            "Bow Pose (Prone Ankle-Grab) + Child's Pose",
            "Floor",
            ["Cobra Pose", "Child's Pose"],
            "Lie face down, grab both ankles and kick the legs back to arch the chest off the floor for 5–10 breaths, then roll onto your back and hug the knees to decompress the spine.",
          ],
        ],
        CR
      ),
    },
    {
      id: "stretching-advanced-4-day-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Side Splits",
      subtitle: "Hip turnout, adductors & side splits",
      totalSets: 18,
      exercises: toExercises(
        [
          [
            "Pry Squat (Garland / Sumo Hold)",
            "Floor",
            ["Sumo Squat Hold", "Deep Squat Hold"],
            "Squat all the way down, grab the ankles and use the elbows to pry the knees wide apart for 60s.",
          ],
          [
            "Elevated Butterfly Stretch (Deficit Groin)",
            "Blocks / Floor",
            ["Seated Butterfly Stretch", "Frog Stretch"],
            "Sit on a folded mat or block with a block between the soles of the feet so the knees can drop below hip level.",
          ],
          [
            "Frog Stretch (Kneeling Adductor Slide)",
            "Floor / Sliders",
            ["Seated Straddle Stretch", "Middle Splits"],
            "On elbows and knees with sliders under the knees, align the hips with the knees, keep the lower back flat and slide the knees wide.",
          ],
          [
            "Supine Wall Straddle Gravity Split",
            "Wall",
            ["Middle Splits", "Wall Straddle"],
            "Lie on your back with the butt flush against the wall and straight legs resting wide down the wall, letting gravity pull the legs apart for 3–5 minutes with gentle 10s C–R squeezes every minute.",
          ],
          [
            "Seated Wide Pancake Fold",
            "Floor",
            ["Straddle Stretch", "Seated Forward Fold"],
            "Sit in a wide straddle, externally rotate the thighs (kneecaps pointing up), arch the lower back slightly and walk the hands forward toward the floor.",
          ],
          [
            "Supine Pretzel Stretch (Quad + Twist Combo)",
            "Floor",
            ["Reclined Twist", "Lying Quad Stretch"],
            "Lie on your back, cross the top knee over to the floor (spinal twist) while the other hand reaches down to grab the foot of the bottom leg (quad and hip flexor stretch).",
          ],
        ],
        CR
      ),
    },
    {
      id: "stretching-advanced-4-day-d4",
      dayNumber: 4,
      isRestDay: false,
      title: "Shoulders & Wrists",
      subtitle: "Rotator cuff, wrists & lateral chain",
      totalSets: 18,
      exercises: toExercises(
        [
          [
            "Hanging Pole Side Bend (Human Flag Stretch)",
            "Pole / Rack",
            ["Doorway Side Bend", "Standing Side Bend"],
            "Grab a vertical rack upright or doorframe, step the feet in close and let the hips hang far out to the side from the top arm. Roll the hips slightly forward to hit TFL, slightly back to hit glute medius.",
          ],
          [
            "Extended Puppy Pose (Thoracic & Lat Melt)",
            "Floor",
            ["Puppy Pose", "Child's Pose"],
            "On knees with the hips stacked directly over the knees, walk the hands far forward and press the chest and chin to the mat.",
          ],
          [
            "Overhead Bar Lat Traction",
            "Bar",
            ["Hanging Lat Stretch", "Doorway Lat Stretch"],
            "Grab a pull-up bar or rack bar at chest or head height and sit the hips back and down, letting bodyweight traction the lats and shoulder joints.",
          ],
          [
            "Sleeper Stretch & External Rotation",
            "Floor / PVC",
            ["Sleeper Stretch", "90/90 Shoulder Stretch"],
            "Use a broomstick or floor position for two C–R sets of shoulder internal rotation (hand behind back or sleeper) and external rotation (90/90 arm position).",
          ],
          [
            "Seated Scalene & Levator Scapulae Release",
            "Chair",
            ["Levator Scapulae Stretch", "Scalene Stretch"],
            "Anchor a hand under the chair and tilt the head 45° forward toward the opposite armpit (levator scapulae), then 45° backward toward the opposite shoulder (scalenes).",
          ],
          [
            "4-Way Kneeling Wrist & Forearm Routine",
            "Floor",
            ["Wrist Flexion Stretch", "Wrist Extension Stretch"],
            "On all fours, lean over the wrists in four positions: palms down with fingers pointing back; backs of hands down; palms down with fingers sideways; fist rolls.",
          ],
        ],
        CR
      ),
    },
  ],
};

// ---------------------------------------------------------------------------
// Tier 4 — Pro / Master (5-day end poses & mastery)
// ---------------------------------------------------------------------------
export const STRETCHING_PRO_5_DAY: Campaign = {
  id: "stretching-pro-5-day",
  title: "Tier 4 Pro Mastery: 5-Day End Poses",
  globalRule: FLEX_GLOBAL_RULE,
  days: [
    {
      id: "stretching-pro-5-day-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Front Splits",
      subtitle: "Full front splits & pike",
      totalSets: 15,
      exercises: toExercises(
        [
          [
            "Ragdoll Forward Hang + Squat-to-Pike Extensions (Warm-up)",
            "Floor",
            ["Standing Forward Fold", "Deep Squat Hold"],
            "2 minutes: hang loose in a ragdoll fold, then transition between a deep squat and a pike push-up position to open the hamstrings.",
          ],
          [
            "Standing Split Against Wall",
            "Wall",
            ["Standing Split", "Lying Strap Hamstring Stretch"],
            "Back against the wall for support, lift one leg as high as possible with square hips and a flat spine.",
          ],
          [
            "Seated Chest-to-Floor Pancake",
            "Floor",
            ["Straddle Stretch", "Seated Forward Fold"],
            "Wide straddle, thighs turned out, fold the chest and belly toward the floor.",
          ],
          [
            "Full Seated Pike (Chest-to-Shins)",
            "Floor",
            ["Seated Forward Fold", "Single-Leg Pike"],
            "Legs together and straight, hinge from the hips and draw the chest to the shins.",
          ],
          [
            "Full Front Splits (Floor / Oversplit Prep)",
            "Floor / Blocks",
            ["Front Split", "Half Split"],
            "Square the hips, press the front heel and back knee down, and slide into the deepest front split with hands supported.",
          ],
        ],
        "C–R: End-range holds, 60s+ per side"
      ),
    },
    {
      id: "stretching-pro-5-day-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Middle Splits",
      subtitle: "Middle splits & hip rotation",
      totalSets: 15,
      exercises: toExercises(
        [
          [
            "Wide Horse-Stance Squat + Ankle Mobility (Warm-up)",
            "Floor / Wall",
            ["Sumo Squat Hold", "Pry Squat"],
            "Wide horse stance with toes turned out, sink between the hips, then run through ankle and foot mobility.",
          ],
          [
            "Double Pigeon / Firelog Pose",
            "Floor",
            ["Figure-4 Glute Stretch", "90/90 Hip Stretch"],
            "Stack the shins, keep the feet flexed, and fold forward over the front shin.",
          ],
          [
            "90/90 Hip External Rotator Press",
            "Floor",
            ["90/90 Hip Stretch", "Seated Pretzel Glute Stretch"],
            "Sit in 90/90 and press the knee down toward the floor against gentle hand resistance, alternating sides with the 2:1 rule.",
          ],
          [
            "Deep Frog Split",
            "Floor / Sliders",
            ["Frog Stretch", "Middle Splits"],
            "Knees wide, hips in line with knees, lower back flat, sink the hips back and down toward the floor.",
          ],
          [
            "Seated Straddle Leg Lifts (Active Compression)",
            "Floor",
            ["Straddle Leg Lifts", "Pancake Stretch"],
            "In a seated straddle with a flat back, actively lift and lower each straight leg to build compression strength.",
          ],
          [
            "Full Middle Splits (Side Splits)",
            "Floor / Blocks",
            ["Middle Splits", "Wall Straddle"],
            "Kneecaps pointing forward or up, slide out to full middle splits with hands or blocks supporting the weight.",
          ],
        ],
        "C–R: End-range holds, 60s+ per side"
      ),
    },
    {
      id: "stretching-pro-5-day-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Wheel & Bridge",
      subtitle: "Full wheel, bridge & deep quads",
      totalSets: 15,
      exercises: toExercises(
        [
          [
            "Deep Lunge Hip Flexor Flow (Warm-up)",
            "Floor",
            ["Long-Lunge Hip Flexor Stretch", "Couch Stretch"],
            "Flow through long lunges and low lunges with thoracic rotation to open the hip flexors before backbending.",
          ],
          [
            "Full Reclined Hero Pose (Double-Leg Supine Quad)",
            "Floor",
            ["Hero Pose", "Lying Quad Stretch"],
            "Sit between the heels and lie back flat, keeping the knees together and the lower back supported.",
          ],
          [
            "King Pigeon / Rear-Foot-Elevated Couch Stretch",
            "Floor / Wall",
            ["Couch Stretch", "Pigeon Pose"],
            "Rear foot elevated against a wall, tuck the tailbone, drive the hips forward, then reach back to open the chest.",
          ],
          [
            "Supported Thoracic Bridge",
            "Floor / Blocks",
            ["Bridge Pose", "Thoracic Extension"],
            "Shoulders on a block or the floor, hips lifted, and the thoracic spine extended over a roller to open the upper back.",
          ],
          [
            "Full Gymnastic Bridge / Wheel Pose",
            "Floor",
            ["Wheel Pose", "Bridge Pose"],
            "Hands and feet planted, drive the chest through the shoulders and press to a full bridge with straight arms.",
          ],
          [
            "Seated Knees-to-Chest Decompression",
            "Floor",
            ["Child's Pose", "Supine Knees-to-Chest"],
            "Finish by rounding the spine and hugging the knees to decompress the lower back after the bridge work.",
          ],
        ],
        "C–R: End-range holds, 60s+ per side"
      ),
    },
    {
      id: "stretching-pro-5-day-d4",
      dayNumber: 4,
      isRestDay: false,
      title: "Shoulders & Balance",
      subtitle: "Dislocates, rotator cuff & balance",
      totalSets: 15,
      exercises: toExercises(
        [
          [
            "PVC Shoulder Dislocates + 4-Way Wrist Prep (Warm-up)",
            "PVC Pipe",
            ["Shoulder Dislocates", "Wrist Circles"],
            "Slow, wide-grip overhead passes with a PVC pipe, then the four-position kneeling wrist sequence.",
          ],
          [
            "Doorway Pec Minor & Biceps Stretch",
            "Doorway",
            ["Doorway Pec Stretch", "Doorway Biceps Stretch"],
            "Forearm on the doorframe with the elbow slightly above shoulder height, then rotate away; switch to a thumb-down grip for the biceps.",
          ],
          [
            "Eagle Arms (Rear Delt & Infraspinatus)",
            "Floor",
            ["Cross-Body Shoulder Stretch", "Cow Face Arms"],
            "Cross the arms, wrap the forearms, and lift the elbows while drawing the shoulder blades apart.",
          ],
          [
            "Internal / External Rotator Cuff C–R",
            "Floor / PVC",
            ["Sleeper Stretch", "90/90 Shoulder Stretch"],
            "Two C–R sets each of internal and external rotation from the 90/90 arm position.",
          ],
          [
            "Plow Pose (Legs Overhead Spine Stretch)",
            "Floor",
            ["Plow Pose", "Supine Knee-to-Ear Pose"],
            "From a shoulder stand, lower the legs overhead until the toes touch the floor behind you, keeping the weight on the shoulders.",
          ],
          [
            "Crow Pose / Elbow Lever (Balance)",
            "Floor",
            ["Crow Pose", "Side Crow"],
            "Place the hands, stack the elbows under the navel, lean the weight forward and lift the feet.",
          ],
        ],
        "C–R: End-range holds, 60s+ per side"
      ),
    },
    {
      id: "stretching-pro-5-day-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Active Flexibility",
      subtitle: "Standing holds & core integration",
      totalSets: 15,
      exercises: toExercises(
        [
          [
            "Deep Squat Ankle-Hold Mobility Flow (Warm-up)",
            "Floor",
            ["Deep Squat Hold", "Pry Squat"],
            "Sit in a deep squat holding the ankles, and rock and shift through the full ankle and hip range.",
          ],
          [
            "Twisting Low Lunge (Thoracic Rotation)",
            "Floor",
            ["World's Greatest Stretch", "Lunge with Rotation"],
            "Low lunge, sink the hips, then rotate the torso and reach the top arm to the ceiling.",
          ],
          [
            "Deep Squat Thoracic Reach-Up",
            "Floor",
            ["Deep Squat Hold", "Squat Rotation"],
            "From a deep squat, one hand reaches up and back to open the thoracic spine, alternating sides.",
          ],
          [
            "Supine Active Y Leg Pull",
            "Floor",
            ["Active Hamstring Stretch", "Lying Strap Hamstring Stretch"],
            "On your back, drive one straight leg toward the chest using core and hip flexor strength alone, with no hand assist.",
          ],
          [
            "Standing Single-Leg Scale (Warrior III)",
            "Floor",
            ["Warrior III", "Standing Split"],
            "Balance on one leg, hinge forward and extend the free leg to horizontal with a long, flat back.",
          ],
          [
            "Standing Hand-to-Foot Hold + Hollow-Body Finisher",
            "Floor",
            ["Standing Split", "Hollow Body Hold"],
            "Grab the foot and lift the leg to end range standing tall, then finish with a full-range hollow-body core hold.",
          ],
        ],
        "C–R: End-range holds, 60s+ per side"
      ),
    },
  ],
};
