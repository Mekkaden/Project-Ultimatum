export type Exercise = {
  id?: string;
  slotName: string;
  prescribedEquipment: string;
  sets: number;
  targetRIR: string;
  notes?: string;
  substitutions: string[];
  videoUrl?: string;
  /** User-created movement: no catalogue entry, so no form guide. */
  isCustom?: boolean;
};

export type WorkoutDay = {
  id: string;
  dayNumber: number;
  isRestDay: boolean;
  title: string;
  /** Optional one-line description shown under the day title in the tracker. */
  subtitle?: string;
  totalSets: number;
  exercises: Exercise[];
  warningTitle?: string;
  warning?: string;
};

export type Campaign = {
  id: string;
  title: string;
  globalRule: string;
  days: WorkoutDay[];
};

export const CAMPAIGN_3_DAY: Campaign = {
  id: "3-day-split",
  title: "3 Days: The Minimum Dose",
  globalRule: "Heavy sets: 1-0 RIR. Back-off sets: 2-1 RIR. (Default guidelines)",
  days: [
    {
      id: "3d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Full Body",
      totalSets: 16,
      exercises: [
        { slotName: "Quad-Biased Squat (Heavy)", prescribedEquipment: "Machine Squat", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Hack Squat", "Pendulum Squat", "Leg Press"]           , videoUrl: "https://www.youtube.com/watch?v=0tn5K9NlCfo" },
        { slotName: "Quad-Biased Squat (Back-off)", prescribedEquipment: "Machine Squat", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Hack Squat", "Pendulum Squat", "Leg Press"]           , videoUrl: "https://www.youtube.com/watch?v=0tn5K9NlCfo" },
        { slotName: "Overhead Press (Front Delt Focus)", prescribedEquipment: "Barbell Overhead Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Seated DB Press", "Machine Shoulder Press"]           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Knee Flexion (Hamstring Isolation)", prescribedEquipment: "Nordic Ham Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Lying Leg Curl", "Seated Leg Curl"]           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Horizontal Row (Lat Bias)", prescribedEquipment: "Meadows Row", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Single Arm DB Row", "Machine Lat Row"]           , videoUrl: "https://www.youtube.com/shorts/OL8yGrkXyiQ" },
        { slotName: "Elbow-at-Side Curl (Bicep/Brachialis)", prescribedEquipment: "Inverse Zottman Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["DB Hammer Curl", "EZ Bar Curl"]           , videoUrl: "https://www.youtube.com/results?search_query=Inverse+Zottman+Curl+form" },
        { slotName: "Lateral Raise (Side Delt Focus)", prescribedEquipment: "Machine Lateral Raise", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Lateral Raise", "DB Lateral Raise"]           , videoUrl: "https://www.youtube.com/watch?v=pOmbQuGeHf8&pp=ygUYZHVtYmJlbGwgbGF0ZXJhbCByYWlzZXMg" },
        { slotName: "Chest Fly (Isolation)", prescribedEquipment: "Pec Deck", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Crossover", "Flat Bench DB Fly"]           , videoUrl: "https://www.youtube.com/shorts/g3T7LsEeDWQ" }
      ]
    },
    {
      id: "3d-d2",
      dayNumber: 2,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "3d-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Upper",
      totalSets: 14,
      exercises: [
        { slotName: "Horizontal Press (Chest Focus - Heavy)", prescribedEquipment: "Machine Chest Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Flat Barbell Bench", "Flat DB Press"]           , videoUrl: "https://www.youtube.com/shorts/1V3vpcaxRYQ" },
        { slotName: "Horizontal Press (Chest Focus - Back-off)", prescribedEquipment: "Machine Chest Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Flat Barbell Bench", "Flat DB Press"]           , videoUrl: "https://www.youtube.com/shorts/1V3vpcaxRYQ" },
        { slotName: "Vertical Pull (Lat Focus)", prescribedEquipment: "Machine Pulldown", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Lat Pulldown (Cable)", "Pull-Up"]           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Overhead Press (Front Delt Focus)", prescribedEquipment: "Barbell Overhead Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Shoulder Press", "Machine Shoulder Press", "DB Shoulder Press"]           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Chest-Supported Row (Mid-Back Focus)", prescribedEquipment: "Chest-Supported T-Bar Row", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Dumbbell Row", "Seal Row"]           , videoUrl: "https://www.youtube.com/shorts/OL8yGrkXyiQ" },
        { slotName: "Overhead Tricep Extension (Long Head Focus)", prescribedEquipment: "Overhead Cable Triceps Extension", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["DB Overhead Extension", "EZ Bar French Press"]           , videoUrl: "https://www.youtube.com/watch?v=sUFUQVMWdnU&pp=ygUYY2FibGUgb3ZlcmhlYWQgZXh0ZW5zaW9u0gcJCTMMAYcqIYzv" },
        { slotName: "Elbow-at-Side Curl", prescribedEquipment: "Cable EZ Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Barbell Curl", "DB Curl"]           , videoUrl: "https://www.youtube.com/results?search_query=Cable+EZ+Curl+form" }
      ]
    },
    {
      id: "3d-d4",
      dayNumber: 4,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "3d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Lower",
      totalSets: 10,
      exercises: [
        { slotName: "Hinged Posterior Chain Movement (Hamstring/Glute Focus)", prescribedEquipment: "Romanian Deadlift", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["DB RDL", "Deficit RDL"]           , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Unilateral Leg Extension/Press", prescribedEquipment: "Single Leg Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Bulgarian Split Squat", "Sissy Squat"]           , videoUrl: "https://www.youtube.com/shorts/nDh_BlnLCGc" },
        { slotName: "Leg Extension (Quad Short Position Isolation)", prescribedEquipment: "Leg Extension", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Leg Extension", "Single-Leg Extension"]           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Straight-Leg Calf Raise", prescribedEquipment: "Standing Calf Raise", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Leg Press Calf Raise", "Donkey Calf Raise"]           , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" },
        { slotName: "Spinal Flexion (Core Isolation)", prescribedEquipment: "Plate-Weighted Crunch", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Crunch", "Machine Crunch"]           , videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s&t=166s&pp=ygUfd2VpZ2h0ZWQgY3J1bmNlcyBzZWFuIG5hbGV3YW55ag%3D%3D" }
      ]
    },
    {
      id: "3d-d6",
      dayNumber: 6,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "3d-d7",
      dayNumber: 7,
      isRestDay: true,
      title: "Repeat / REST",
      totalSets: 0,
      exercises: []
    }
  ]
};

export const CAMPAIGN_4_DAY: Campaign = {
  id: "4-day-split",
  title: "4 Days: The Sweet Spot",
  globalRule: "Set 1 = 2-1 RIR (Heavy/Control) | Set 2 = 1-0 RIR (Kill Shot)",
  days: [
    {
      id: "4d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Upper (Strength Focus)",
      totalSets: 12,
      exercises: [
        { slotName: "Incline Press (Chest/Front Delt Focus)", prescribedEquipment: "Incline Bench Press", sets: 2, targetRIR: "1 RIR, 0 RIR", substitutions: ["Incline DB Press", "Incline Machine Press"]           , videoUrl: "https://www.youtube.com/watch?v=5k_enq6vXGM&pp=ygUhSU5DTElORSBCRU5DSCBQUkVTUyBCQVJCRUxMIExPR0lD" },
        { slotName: "Lateral Raise (Side Delt Focus)", prescribedEquipment: "Dumbbell Lateral Raise", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "Start with weak side", substitutions: ["Cable Lateral Raise", "Machine Lateral Raise"]           , videoUrl: "https://www.youtube.com/watch?v=pOmbQuGeHf8&pp=ygUYZHVtYmJlbGwgbGF0ZXJhbCByYWlzZXMg" },
        { slotName: "Vertical Pull (Lat Focus)", prescribedEquipment: "Pull-Up", sets: 2, targetRIR: "1 RIR / 0 RIR", substitutions: ["Neutral Grip Lat Pulldown", "Assisted Pull-Up"]           , videoUrl: "https://www.youtube.com/shorts/OEXosPwzFdc" },
        { slotName: "Pushdown Variation (Triceps Short Position)", prescribedEquipment: "Triceps Pushdown", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Rope Pushdown", "Dual Cable Tricep Extension"]  , videoUrl: "https://www.youtube.com/shorts/7lYeoKRXO-0" },
        { slotName: "Horizontal Row (Mid-Back Focus)", prescribedEquipment: "Cable Row", sets: 1, targetRIR: "1 RIR", substitutions: ["T-Bar Row", "Seated Machine Chest-Supported Row"]           , videoUrl: "https://www.youtube.com/shorts/5Z27soGfOns" },
        { slotName: "Preacher Curl (Stabilized Bicep Isolation)", prescribedEquipment: "Preacher Dumbbell Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "Full extension no compromise", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=rsrN-avWD60&pp=ygUNcHJlYWNoZXIgY3VybA%3D%3D" },
        { slotName: "Overhead Tricep Extension (Triceps Long Head Focus)", prescribedEquipment: "Cable Overhead Triceps Extension", sets: 1, targetRIR: "S1: 2-1 RIR", substitutions: ["DB Overhead Extension", "Cable Overhead Rope Extension"]           , videoUrl: "https://www.youtube.com/watch?v=sUFUQVMWdnU&pp=ygUYY2FibGUgb3ZlcmhlYWQgZXh0ZW5zaW9u0gcJCTMMAYcqIYzv" }
      ]
    },
    {
      id: "4d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Lower (Posterior Chain)",
      totalSets: 14,
      exercises: [
        { slotName: "Hinged Posterior Chain Movement (Hamstring/Glute Focus)", prescribedEquipment: "Barbell Romanian Deadlift", sets: 2, targetRIR: "1 RIR, 1 RIR", notes: "Safe Zone", substitutions: ["DB RDL", "Barbell RDL", "Deficit RDL"]           , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Leg Extension (Quad Short Position Isolation)", prescribedEquipment: "Leg Extension", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Single-Leg Extension", "Cable Leg Extension"]           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Seated/Lying Leg Curl (Hamstring Isolation)", prescribedEquipment: "Lying Leg Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Lying Leg Curl", "Seated Leg Curl"]           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Quad-Biased Squat Variation (Hypertrophy Focus)", prescribedEquipment: "Hack Squat", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Hack Squat", "Smith Machine Squat", "Leg Press"]           , videoUrl: "https://www.youtube.com/watch?v=0tn5K9NlCfo" },
        { slotName: "Spinal Flexion (Core Isolation)", prescribedEquipment: "Weighted Crunches", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Crunch", "Machine Crunch"]           , videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s&t=166s&pp=ygUfd2VpZ2h0ZWQgY3J1bmNlcyBzZWFuIG5hbGV3YW55ag%3D%3D" },
        { slotName: "Rear Delt Isolation", prescribedEquipment: "Rear Delt", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Reverse Pec Deck", "Cable Face Pulls"]           , videoUrl: "https://www.youtube.com/shorts/5v2tTaOKQtI" },
        { slotName: "Straight-Leg Calf Raise", prescribedEquipment: "Straight-Leg Calf Raise", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Standing Calf Raise", "Leg Press Calf Raise"]           , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" }
      ]
    },
    {
      id: "4d-d3",
      dayNumber: 3,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "4d-d4",
      dayNumber: 4,
      isRestDay: false,
      title: "Chest & Back",
      totalSets: 14,
      exercises: [
        { slotName: "Incline Press (Chest/Front Delt Focus)", prescribedEquipment: "Incline Bench Press", sets: 2, targetRIR: "1-2 RIR", notes: "3-5 rep range", substitutions: ["Incline DB Press", "Incline Machine Press"]           , videoUrl: "https://www.youtube.com/watch?v=5k_enq6vXGM&pp=ygUhSU5DTElORSBCRU5DSCBQUkVTUyBCQVJCRUxMIExPR0lD" },
        { slotName: "Lateral Raise (Side Delt Focus)", prescribedEquipment: "Lateral Raise", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Lateral Raise", "Machine Lateral Raise"]           , videoUrl: "https://www.youtube.com/watch?v=pOmbQuGeHf8&pp=ygUYZHVtYmJlbGwgbGF0ZXJhbCByYWlzZXMg" },
        { slotName: "Vertical Pull (Lat Focus)", prescribedEquipment: "Wide-Grip Lat Pulldown", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Pull-Up", "Neutral Grip Lat Pulldown"]           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Chest-Supported Row (Mid-Back Focus)", prescribedEquipment: "Chest-Supported Mid-Back Row", sets: 2, targetRIR: "0 RIR", substitutions: ["T-Bar Row", "Machine Chest-Supported Row"]           , videoUrl: "https://youtu.be/vD-dEl7R2Bg?t=4m23s" },
        { slotName: "Chest Fly (Isolation)", prescribedEquipment: "Pec Deck", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Crossover", "Flat Bench DB Fly"]           , videoUrl: "https://www.youtube.com/shorts/g3T7LsEeDWQ" },
        { slotName: "Unilateral Horizontal Pull (Lat Focus)", prescribedEquipment: "Lat-Focused Single-Arm Row", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Single Arm Cable Row", "Meadows Row"]           , videoUrl: "https://youtube.com/shorts/bLVeOunB-c0" },
        { slotName: "Upper Abs (Spinal Flexion)", prescribedEquipment: "Weighted Ab Crunches", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Weighted Crunch", "Cable Crunch"]           , videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s&t=166s&pp=ygUfd2VpZ2h0ZWQgY3J1bmNlcyBzZWFuIG5hbGV3YW55ag%3D%3D" }
      ]
    },
    {
      id: "4d-d5",
      dayNumber: 5,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "4d-d6",
      dayNumber: 6,
      isRestDay: false,
      title: "Arms & Legs (Accessory/Weak Point)",
      totalSets: 13,
      exercises: [
        { slotName: "Overhead Press (Front/Side Delt Focus)", prescribedEquipment: "Barbell Overhead Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "High reps", substitutions: ["Seated DB Press", "Machine Shoulder Press"]           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Elbow-at-Side Bicep Curl", prescribedEquipment: "EZ BAR Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Barbell Curl", "DB Curl"]           , videoUrl: "https://www.youtube.com/results?search_query=EZ+BAR+Curl+form" },
        { slotName: "Pushdown Variation (Triceps Short Position)", prescribedEquipment: "Triceps Pushdown", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Rope Pushdown", "V-Bar Pushdown"]           , videoUrl: "https://www.youtube.com/shorts/kwzz9WolqQk" },
        { slotName: "Neutral Grip Bicep/Brachialis Curl", prescribedEquipment: "Hammer Curls", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Rope Hammer Curl", "Cross-Body Hammer Curl"]           , videoUrl: "https://www.youtube.com/results?search_query=Hammer+Curls+form" },
        { slotName: "Narrow-Grip Horizontal Press (Tricep/Chest Focus)", prescribedEquipment: "Close Grip Bench", sets: 1, targetRIR: "S1: 2-1 RIR", notes: "Innermost silver nurling on thumb nurling", substitutions: ["Weighted Dips", "Close Grip Smith Machine Press"]           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Leg Extension (Quad Short Position Isolation)", prescribedEquipment: "Leg Extension", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Leg Extension", "Standard Leg Extension"]           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Seated/Lying Leg Curl (Hamstring Isolation)", prescribedEquipment: "Lying Leg Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Lying Leg Curl", "Seated Leg Curl"]           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" }
      ]
    },
    {
      id: "4d-d7",
      dayNumber: 7,
      isRestDay: true,
      title: "REST (Active Abs)",
      totalSets: 2,
      exercises: [
        { slotName: "Core Isometric + Eccentric", prescribedEquipment: "Plank + Dragon Flags", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "Active Rest Day core work", substitutions: ["Ab Wheel Rollout", "Hanging Leg Raises"]           , videoUrl: "https://www.youtube.com/shorts/7DoFMV1Dnow" }
      ],
      warning: "You should primarily be resting today, but complete the two sets of core work."
    }
  ]
};

export const CAMPAIGN_5_DAY: Campaign = {
  id: "5-day-split",
  title: "5 Days: The Redline (PPL-UL)",
  globalRule: "Target 1-2 RIR on all working sets.",
  days: [
    {
      id: "5d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Push",
      totalSets: 11,
      exercises: [
        { slotName: "Incline Press (Chest/Front Delt Focus)", prescribedEquipment: "Incline Bench", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Incline DB Press", "Incline Machine Press"]           , videoUrl: "https://www.youtube.com/watch?v=5k_enq6vXGM&pp=ygUhSU5DTElORSBCRU5DSCBQUkVTUyBCQVJCRUxMIExPR0lD" },
        { slotName: "Overhead Press (Front Delt Focus)", prescribedEquipment: "Frontal Delt Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Seated DB Press", "Machine Shoulder Press"]           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Chest Fly (Isolation)", prescribedEquipment: "Pec Dec", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Crossover", "Flat Bench DB Fly"]           , videoUrl: "https://www.youtube.com/shorts/g3T7LsEeDWQ" },
        { slotName: "Preacher Curl (Stabilized Bicep Isolation)", prescribedEquipment: "Preacher Dumbbell Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=rsrN-avWD60&pp=ygUNcHJlYWNoZXIgY3VybA%3D%3D" },
        { slotName: "Lateral Raise (Side Delt Focus)", prescribedEquipment: "Lateral Raise", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Lateral Raise", "Machine Lateral Raise"]           , videoUrl: "https://www.youtube.com/watch?v=pOmbQuGeHf8&pp=ygUYZHVtYmJlbGwgbGF0ZXJhbCByYWlzZXMg" },
        { slotName: "Neutral Grip Bicep/Brachialis Curl", prescribedEquipment: "Elbow Supp Hammer Curl", sets: 1, targetRIR: "S1: 2-1 RIR", substitutions: ["DB Hammer Curl", "Cable Rope Hammer Curl"]           , videoUrl: "https://www.youtube.com/results?search_query=Elbow+Supp+Hammer+Curl+form" }
      ]
    },
    {
      id: "5d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Legs 1",
      totalSets: 12,
      exercises: [
        { slotName: "Leg Extension (Quad Short Position Isolation)", prescribedEquipment: "Leg Ext", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Single-Leg Extension", "Cable Leg Extension"]           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Seated/Lying Leg Curl (Hamstring Isolation)", prescribedEquipment: "Seated Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Lying Leg Curl"]           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Quad-Biased Squat Variation (Hypertrophy Focus)", prescribedEquipment: "Hack Squat", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Pendulum Squat", "Heel-Elevated Smith Squat", "Leg Press"]           , videoUrl: "https://www.youtube.com/watch?v=0tn5K9NlCfo" },
        { slotName: "Straight-Leg Calf Raise", prescribedEquipment: "Straight-Leg Calf Raise", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Standing Calf Raise", "Leg Press Calf Raise"]           , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" },
        { slotName: "Upper Abs (Spinal Flexion)", prescribedEquipment: "Weighted Ab Crunches", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Weighted Crunch", "Cable Crunch"]           , videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s&t=166s&pp=ygUfd2VpZ2h0ZWQgY3J1bmNlcyBzZWFuIG5hbGV3YW55ag%3D%3D" },
        { slotName: "Lower Abs (Pelvic Tilt)", prescribedEquipment: "Lower Abs", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Hanging Leg Raises", "Lying Leg Raises"]           , videoUrl: "https://www.youtube.com/shorts/7DoFMV1Dnow" }
      ]
    },
    {
      id: "5d-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Pull",
      totalSets: 13,
      exercises: [
        { slotName: "Horizontal Row (Mid-Back Focus)", prescribedEquipment: "Barbell Row", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["T-Bar Row", "Machine Chest-Supported Row"]           , videoUrl: "https://youtu.be/vD-dEl7R2Bg?t=4m23s" },
        { slotName: "Trap/Upper Back Isolation", prescribedEquipment: "Kelso Shrug", sets: 1, targetRIR: "S1: 2-1 RIR", substitutions: ["DB Shrugs", "Barbell Shrugs"] , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Vertical Pull (Lat Focus)", prescribedEquipment: "Lat Pulldown", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Pull-Up", "Neutral Grip Pulldown"]           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Pushdown Variation (Triceps Short Position)", prescribedEquipment: "Bar Pushdown", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Rope Pushdown", "V-Bar Pushdown"]  , videoUrl: "https://youtube.com/shorts/bLVeOunB-c0" },
        { slotName: "Unilateral Horizontal Pull (Lat Focus)", prescribedEquipment: "Single Arm Lat Row", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Meadows Row", "Single Arm Cable Row"]           , videoUrl: "https://youtube.com/shorts/bLVeOunB-c0" },
        { slotName: "Rear Delt Isolation", prescribedEquipment: "Rear Delt Fly", sets: 1, targetRIR: "S1: 2-1 RIR", substitutions: ["Reverse Pec Deck", "Cable Face Pulls"]           , videoUrl: "https://www.youtube.com/shorts/5v2tTaOKQtI" },
        { slotName: "Overhead Tricep Extension (Triceps Long Head Focus)", prescribedEquipment: "Overhead Pushdown", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["DB Overhead Extension", "Cable Overhead Rope Extension"]           , videoUrl: "https://www.youtube.com/watch?v=sUFUQVMWdnU&pp=ygUYY2FibGUgb3ZlcmhlYWQgZXh0ZW5zaW9u0gcJCTMMAYcqIYzv" },
        { slotName: "Narrow-Grip Horizontal Press (Tricep/Chest Focus)", prescribedEquipment: "Close Grip Bench", sets: 1, targetRIR: "S1: 2-1 RIR", substitutions: ["Weighted Dips", "Close Grip Smith Machine Press"]           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" }
      ]
    },
    {
      id: "5d-d4",
      dayNumber: 4,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "5d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Upper",
      totalSets: 13,
      exercises: [
        { slotName: "Incline Press (Chest/Front Delt Focus)", prescribedEquipment: "Incline Bench", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Incline DB Press", "Incline Machine Press"]           , videoUrl: "https://www.youtube.com/watch?v=5k_enq6vXGM&pp=ygUhSU5DTElORSBCRU5DSCBQUkVTUyBCQVJCRUxMIExPR0lD" },
        { slotName: "Vertical Pull (Lat Focus)", prescribedEquipment: "PullUp", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Lat Pulldown", "Assisted Pull-Up"]           , videoUrl: "https://www.youtube.com/shorts/OEXosPwzFdc" },
        { slotName: "Overhead Press (Front Delt Focus)", prescribedEquipment: "Shoulder Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Seated DB Press", "Machine Shoulder Press"]           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Elbow-at-Side Bicep Curl", prescribedEquipment: "EZ bar Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Barbell Curl", "DB Curl"]           , videoUrl: "https://www.youtube.com/results?search_query=EZ+bar+Curl+form" },
        { slotName: "Pushdown Variation (Triceps Short Position)", prescribedEquipment: "Bar pushdown", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Rope Pushdown", "Dual Cable Tricep Extension"]  , videoUrl: "https://www.youtube.com/shorts/f_OGBg2KxgY" },
        { slotName: "Lateral Raise (Side Delt Focus)", prescribedEquipment: "Lateral Raise", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Cable Lateral Raise", "Machine Lateral Raise"]           , videoUrl: "https://www.youtube.com/watch?v=pOmbQuGeHf8&pp=ygUYZHVtYmJlbGwgbGF0ZXJhbCByYWlzZXMg" },
        { slotName: "Horizontal Row (Mid-Back Focus)", prescribedEquipment: "Cable Row", sets: 1, targetRIR: "S1: 2-1 RIR", substitutions: ["T-Bar Row", "Seated Machine Chest-Supported Row"]           , videoUrl: "https://www.youtube.com/shorts/5Z27soGfOns" }
      ]
    },
    {
      id: "5d-d6",
      dayNumber: 6,
      isRestDay: false,
      title: "Legs 2",
      totalSets: 12,
      exercises: [
        { slotName: "Hinged Posterior Chain Movement (Hamstring/Glute Focus)", prescribedEquipment: "Barbell Romanian Deadlift", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["DB RDL", "Barbell RDL", "Deficit RDL"]           , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Leg Extension (Quad Short Position Isolation)", prescribedEquipment: "Leg Ext", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Single-Leg Extension", "Cable Leg Extension"]           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Rear Delt Isolation", prescribedEquipment: "Rear delt fly", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Reverse Pec Deck", "Cable Face Pulls"]           , videoUrl: "https://www.youtube.com/shorts/5v2tTaOKQtI" },
        { slotName: "Seated/Lying Leg Curl (Hamstring Isolation)", prescribedEquipment: "Lying Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Seated Leg Curl"]           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Quad-Biased Squat Variation (Hypertrophy Focus)", prescribedEquipment: "Hack", sets: 1, targetRIR: "S1: 2-1 RIR", substitutions: ["Pendulum Squat", "Leg Press", "Heel-Elevated Smith Squat"]           , videoUrl: "https://www.instagram.com/p/Cvk5D_-sgif/" },
        { slotName: "Upper Abs (Spinal Flexion)", prescribedEquipment: "Weighted Ab Crunches", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: ["Weighted Crunch", "Cable Crunch"]           , videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s&t=166s&pp=ygUfd2VpZ2h0ZWQgY3J1bmNlcyBzZWFuIG5hbGV3YW55ag%3D%3D" },
        { slotName: "Straight-Leg Calf Raise", prescribedEquipment: "Straight-Leg Calf Raise", sets: 1, targetRIR: "S1: 2-1 RIR", substitutions: ["Standing Calf Raise", "Leg Press Calf Raise"]           , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" },
        { slotName: "Neck Flexion", prescribedEquipment: "Neck Curls", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=gimeRpdqWQw&t=362s&pp=ygUKbmVjayBjdXJsc9IHCQlOCwGHKiGM7w%3D%3D" },
        { slotName: "Neck Extension", prescribedEquipment: "Neck Ext", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []   , videoUrl: "https://www.youtube.com/watch?v=gimeRpdqWQw&t=362s&pp=ygUKbmVjayBjdXJsc9IHCQlOCwGHKiGM7w%3D%3D" }
      ],
      warningTitle: "Neck Training Warning",
      warning: "CRITICAL: Stop the set when speed slows. Do not jam chin into neck. Training to failure here degrades disc protection. Neck beyond 17-inch increases risk of airway collapse."
    },
    {
      id: "5d-d7",
      dayNumber: 7,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    }
  ]
};

export const CAMPAIGN_CUSTOM: Campaign = {
  id: "custom-code-split",
  title: "CUSTOM: OFF GRID",
  globalRule: "You dictate the rules. Total fatigue management is on you.",
  days: [
    {
      id: "custom-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Custom Programming",
      totalSets: 0,
      warning: "Custom programming active. You are entirely off-grid. Build your own protocol.",
      exercises: []
    }
  ]
};

export const CAMPAIGN_STRENGTH_3_DAY: Campaign = {
  id: "strength-3-day",
  title: "3 DAYS: THE MINIMUM DOSE",
  globalRule: "4 Week Strength Base. Focus on mechanics and managing RPE precisely.",
  days: [
    {
      id: "s3d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Full Body #1",
      totalSets: 14,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Back Squat", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "SIT BACK AND DOWN, 15° TOE FLARE, DRIVE YOUR KNEES OUT LATERALLY", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI" },
        { slotName: "Horizontal Press", prescribedEquipment: "Barbell Bench Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "TUCK ELBOWS AT A 45° ANGLE, SQUEEZE YOUR SHOULDER BLADES AND STAY FIRM ON THE BENCH", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Vertical Pull", prescribedEquipment: "Lat Pulldown", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "PULL YOUR ELBOWS STRAIGHT OUT TO YOUR SIDES, USE A 1.5X SHOULDER WIDTH GRIP", substitutions: []           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Hinge Pattern", prescribedEquipment: "Romanian Deadlift", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "MAINTAIN A NEUTRAL LOWER BACK, SET YOUR HIPS BACK, DON'T ALLOW YOUR SPINE TO ROUND", substitutions: []           , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Vertical Press / Dip", prescribedEquipment: "Assisted Dip", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "TUCK ELBOWS AT A 45° ANGLE, LEAN YOUR TORSO FORWARD 15°", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Calf Isolation", prescribedEquipment: "Standing Calf Raise", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "PRESS ALL THE WAY UP TO YOUR TOES, STRETCH YOUR CALVES AT THE BOTTOM, DON'T BOUNCE", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" },
        { slotName: "Elbow Flexion", prescribedEquipment: "Dumbbell Supinated Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "DRIVE YOUR PINKY INTO THE HANDLE HARDER THAN YOUR POINTER FINGER", substitutions: []           , videoUrl: "https://www.youtube.com/results?search_query=Dumbbell+Supinated+Curl+form" }
      ]
    },
    {
      id: "s3d-d2",
      dayNumber: 2,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "s3d-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Full Body #2",
      totalSets: 14,
      exercises: [
        { slotName: "Deadlift Pattern", prescribedEquipment: "Deadlift", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "BRACE YOUR LATS, CHEST TALL, HIPS HIGH, PULL THE SLACK OUT OF THE BAR PRIOR TO MOVING IT OFF THE GROUND", substitutions: [] , videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" },
        { slotName: "Vertical Press", prescribedEquipment: "Military Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "SQUEEZE YOUR GLUTES TO KEEP YOUR TORSO UPRIGHT, CLEAR YOUR HEAD OUT OF THE WAY, PRESS UP AND SLIGHTLY BACK", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Horizontal Pull", prescribedEquipment: "Chest-Supported T-Bar Row", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "RETRACT YOUR SCAPULAE DURING THE CONCENTRIC, PROTRACT YOUR SCAPULAE DURING THE ECCENTRIC", substitutions: []           , videoUrl: "https://youtu.be/vD-dEl7R2Bg?t=4m23s" },
        { slotName: "Knee Extension", prescribedEquipment: "Leg Extension", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "FOCUS ON SQUEEZING YOUR QUADS TO MAKE THE WEIGHT MOVE", substitutions: []           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Chest Flye", prescribedEquipment: "Cable Flye", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "KEEP YOUR SCAPULAE RETRACTED, PULL YOUR INNER ELBOWS TOGETHER (NOT YOUR HANDS)", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/g3T7LsEeDWQ" },
        { slotName: "Core Isolation", prescribedEquipment: "Crunch", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "FOCUS ON FLEXING YOUR SPINE, DON'T YANK YOUR HEAD WITH YOUR ARMS", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/hph0qDyyk2I" },
        { slotName: "Elbow Extension", prescribedEquipment: "Dumbbell Skull Crusher", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "KEEP YOUR ELBOWS IN LINE WITH THE TOP OF YOUR HEAD, DON'T LET YOUR UPPER ARM MOVE", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/kwzz9WolqQk" }
      ]
    },
    {
      id: "s3d-d4",
      dayNumber: 4,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "s3d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Full Body #3",
      totalSets: 14,
      exercises: [
        { slotName: "Knee Extension", prescribedEquipment: "Leg Extension", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "FOCUS ON SQUEEZING YOUR QUADS TO MAKE THE WEIGHT MOVE", substitutions: []           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Incline Press", prescribedEquipment: "Dumbbell Incline Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "KEEP YOUR SCAPULAE RETRACTED AND DEPRESSED", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=5k_enq6vXGM&pp=ygUhSU5DTElORSBCRU5DSCBQUkVTUyBCQVJCRUxMIExPR0lD" },
        { slotName: "Vertical Pull", prescribedEquipment: "Reverse Grip Lat Pulldown", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "PULL YOUR ELBOWS DOWN AGAINST YOUR SIDES, USE SHOULDER WIDTH GRIP", substitutions: []           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Hip Extension", prescribedEquipment: "Barbell Hip Thrust", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "TUCK YOUR CHIN AND RIB CAGE DOWN, ONLY MOVE YOUR HIPS. USE A PAD", substitutions: [] , videoUrl: "https://www.youtube.com/watch?v=pUdIL5x0fWg" },
        { slotName: "Rear Delt Isolation", prescribedEquipment: "Seated Face Pull", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "PULL YOUR ARMS BACK AND OUT", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/j5f_0rNkPwU" },
        { slotName: "Lateral Delt Isolation", prescribedEquipment: "Dumbbell Lateral Raise", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "TILT THE DUMBBELL SUCH THAT YOUR PINKY COMES UP FIRST", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=pOmbQuGeHf8&pp=ygUYZHVtYmJlbGwgbGF0ZXJhbCByYWlzZXMg" },
        { slotName: "Knee Flexion", prescribedEquipment: "Lying Leg Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "FOCUS ON SQUEEZING YOUR HAMSTRINGS TO MAKE THE WEIGHT MOVE", substitutions: []           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" }
      ]
    },
    {
      id: "s3d-d6",
      dayNumber: 6,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "s3d-d7",
      dayNumber: 7,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    }
  ]
};

export const CAMPAIGN_STRENGTH_4_DAY: Campaign = {
  id: "strength-4-day",
  title: "4 DAYS: JUGGERNAUT",
  globalRule: "Heavy focus on compound lifts. Moderate to heavy loads.",
  days: [
    {
      id: "s4d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Upper Body #1",
      totalSets: 11,
      exercises: [
        { slotName: "Horizontal Press", prescribedEquipment: "Barbell Bench Press", sets: 1, targetRIR: "S1: 2-1 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Horizontal Press (Pause)", prescribedEquipment: "Pause Barbell Bench Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Vertical Pull", prescribedEquipment: "Pull-Up", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Vertical Press", prescribedEquipment: "Military Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Horizontal Pull", prescribedEquipment: "Chest-Supported T-Bar Row", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://youtu.be/vD-dEl7R2Bg?t=4m23s" },
        { slotName: "Elbow Flexion", prescribedEquipment: "Hammer Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/results?search_query=Hammer+Curl+form" }
      ]
    },
    {
      id: "s4d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Lower Body #1",
      totalSets: 10,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Back Squat", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI" },
        { slotName: "Hinge Pattern", prescribedEquipment: "Romanian Deadlift", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Knee Flexion", prescribedEquipment: "Lying Leg Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Knee Extension", prescribedEquipment: "Leg Extension", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Calf Isolation", prescribedEquipment: "Standing Calf Raise", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" }
      ]
    },
    {
      id: "s4d-d3",
      dayNumber: 3,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "s4d-d4",
      dayNumber: 4,
      isRestDay: false,
      title: "Upper Body #2",
      totalSets: 12,
      exercises: [
        { slotName: "Horizontal Press", prescribedEquipment: "Barbell Bench Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Vertical Pull", prescribedEquipment: "Wide-Grip Lat Pulldown", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Shoulder Isolation", prescribedEquipment: "Dumbbell Lateral Raise", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=pOmbQuGeHf8&pp=ygUYZHVtYmJlbGwgbGF0ZXJhbCByYWlzZXMg" },
        { slotName: "Shoulder Isolation", prescribedEquipment: "Seated Face Pull", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: [] , videoUrl: "https://www.youtube.com/shorts/j5f_0rNkPwU" },
        { slotName: "Trap Isolation", prescribedEquipment: "Prone Trap Raise", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: [] , videoUrl: "https://www.youtube.com/shorts/5v2tTaOKQtI" },
        { slotName: "Elbow Flexion", prescribedEquipment: "EZ Bar Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/results?search_query=EZ+Bar+Curl+form" }
      ]
    },
    {
      id: "s4d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Lower Body #2",
      totalSets: 10,
      exercises: [
        { slotName: "Deadlift Pattern", prescribedEquipment: "Deadlift", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: [] , videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" },
        { slotName: "Squat Pattern", prescribedEquipment: "Hack Squat", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=0tn5K9NlCfo" },
        { slotName: "Hinge Pattern", prescribedEquipment: "Reverse Hyperextension", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: [] , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Knee Extension", prescribedEquipment: "Leg Extension", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Knee Flexion", prescribedEquipment: "Seated Leg Curl", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" }
      ]
    },
    {
      id: "s4d-d6",
      dayNumber: 6,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "s4d-d7",
      dayNumber: 7,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    }
  ]
};

export const CAMPAIGN_STRENGTH_6_DAY: Campaign = {
  id: "strength-6-day",
  title: "6 DAYS: ELITE RECOVERY",
  globalRule: "Extreme volume and frequency. Requires flawless sleep, nutrition, and advanced recovery protocols.",
  days: [
    {
      id: "s6d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Squat, Bench, Biceps (Volume #1)",
      totalSets: 9,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Squat", sets: 5, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "Progressing weekly", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI" },
        { slotName: "Horizontal Press", prescribedEquipment: "Bench", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Elbow Flexion", prescribedEquipment: "Biceps Curls", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/results?search_query=Biceps+Curls+form" }
      ]
    },
    {
      id: "s6d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Bench, Deadlift, Back",
      totalSets: 12,
      exercises: [
        { slotName: "Horizontal Press (Heavy)", prescribedEquipment: "Bench", sets: 1, targetRIR: "S1: 2-1 RIR", notes: "2-count pause", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Horizontal Press (Volume)", prescribedEquipment: "Bench", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Deadlift Pattern", prescribedEquipment: "Deadlift", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "Volume accumulation", substitutions: [] , videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" },
        { slotName: "Horizontal Pull", prescribedEquipment: "Horizontal Row", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "Heavy", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/5Z27soGfOns" },
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Row / Pull-ups", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Horizontal Pull", prescribedEquipment: "Second Row Variation", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/5Z27soGfOns" }
      ]
    },
    {
      id: "s6d-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Shoulders, Arms, Abs",
      totalSets: 14,
      exercises: [
        { slotName: "Vertical Press", prescribedEquipment: "Dumbbell Overhead Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Lateral Delt", prescribedEquipment: "Lateral Raises", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=pOmbQuGeHf8&pp=ygUYZHVtYmJlbGwgbGF0ZXJhbCByYWlzZXMg" },
        { slotName: "Rear Delt", prescribedEquipment: "Rear Delt Flies", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/5v2tTaOKQtI" },
        { slotName: "Elbow Extension", prescribedEquipment: "Overhead Triceps Extensions", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/kwzz9WolqQk" },
        { slotName: "Elbow Flexion (Heavy)", prescribedEquipment: "Heavy EZ Bar Curls", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/results?search_query=Heavy+EZ+Bar+Curls+form" },
        { slotName: "Elbow Flexion (Isolation)", prescribedEquipment: "Preacher Hammer Curls", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/results?search_query=Preacher+Hammer+Curls+form" },
        { slotName: "Core", prescribedEquipment: "Cable Crunches", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/hph0qDyyk2I" }
      ]
    },
    {
      id: "s6d-d4",
      dayNumber: 4,
      isRestDay: false,
      title: "Technique Day: Light Squat & Bench",
      totalSets: 4,
      warning: "Build technical efficiency; avoid fatigue. Intensity: Very light, ~70% or RPE <=6",
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Squat", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "Optional: pause squats or low-stress variants", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI" },
        { slotName: "Horizontal Press", prescribedEquipment: "Larsen Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" }
      ]
    },
    {
      id: "s6d-d5",
      dayNumber: 5,
      isRestDay: true,
      title: "Rest / Recovery",
      totalSets: 0,
      warning: "Recover before the heaviest session of the week. Methods: sauna, hot bath, high carbs, consistent protein.",
      exercises: []
    },
    {
      id: "s6d-d6",
      dayNumber: 6,
      isRestDay: false,
      title: "SBD Day (Peak Performance)",
      totalSets: 12,
      warning: "Phase 1 (Weeks 1-3): Sets of 3-4 reps. Phase 2 (Weeks 4-6): Sets of 1-2 reps.",
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Heavy Squat", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "Depending on phase", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8&pp=ygUSc3F1YXQgamVmZiBuaXBwYXJk" },
        { slotName: "Horizontal Press", prescribedEquipment: "Heavy Bench", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "Depending on phase", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Deadlift Pattern", prescribedEquipment: "Heavy Deadlift", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", notes: "Depending on phase", substitutions: [] , videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" },
        { slotName: "Leg Press", prescribedEquipment: "Leg Press", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/nDh_BlnLCGc" },
        { slotName: "Knee Extension", prescribedEquipment: "Leg Extensions", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Knee Flexion", prescribedEquipment: "Leg Curls", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: []           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" }
      ]
    },
    {
      id: "s6d-d7",
      dayNumber: 7,
      isRestDay: true,
      title: "Optional Upper Body OR Rest",
      totalSets: 0,
      warning: "Recommended rest for beginners or during week 3 of a training block. If training, do 2 exercises per upper muscle, 1 for triceps (Heavy compound first, isolation high reps second).",
      exercises: []
    }
  ]
};

export const CAMPAIGN_CALISTHENICS_3_DAY: Campaign = {
  id: "calisthenics-3-day",
  title: "3 DAYS: BODYWEIGHT FUNDAMENTALS",
  globalRule: "Master leverage and mechanical tension. Slow eccentrics and strict form.",
  days: [
    {
      id: "c3d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Full Body #1",
      totalSets: 10,
      exercises: [
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Pull Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/OEXosPwzFdc"},
        { slotName: "Horizontal Press", prescribedEquipment: "Horizontal Press Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/Vb7k11m4o5o"            },
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI"            },
        { slotName: "Core Compression", prescribedEquipment: "Core Compression Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/7DoFMV1Dnow"            },
        { slotName: "Vertical Press Hold", prescribedEquipment: "Vertical Press Hold Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=handstand+hold+progression+calisthenics"            }
      ]
    },
    {
      id: "c3d-d2",
      dayNumber: 2,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "c3d-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Full Body #2",
      totalSets: 10,
      exercises: [
        { slotName: "Horizontal Pull", prescribedEquipment: "Horizontal Pull Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=australian+pull+up+form"            },
        { slotName: "Vertical Press", prescribedEquipment: "Vertical Press Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=pike+push+up+form"            },
        { slotName: "Lunge Pattern", prescribedEquipment: "Lunge Pattern Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/nDh_BlnLCGc" },
        { slotName: "Core Anti-Extension", prescribedEquipment: "Core Anti-Extension Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/7DoFMV1Dnow" },
        { slotName: "Grip & Scapula", prescribedEquipment: "Grip & Scapula Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=active+hang+scapula+pull+up" }
      ]
    },
    {
      id: "c3d-d4",
      dayNumber: 4,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "c3d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Full Body #3 (Volume)",
      totalSets: 10,
      exercises: [
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Pull Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/OEXosPwzFdc"},
        { slotName: "Horizontal Press", prescribedEquipment: "Horizontal Press Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/Vb7k11m4o5o"            },
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI"            },
        { slotName: "Hip Extension", prescribedEquipment: "Hip Extension Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Core Flexion", prescribedEquipment: "Core Flexion Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s" }
      ]
    },
    {
      id: "c3d-d6",
      dayNumber: 6,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "c3d-d7",
      dayNumber: 7,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    }
  ]
};

export const CAMPAIGN_CALISTHENICS_4_DAY: Campaign = {
  id: "calisthenics-4-day",
  title: "4 DAYS: SKILL & STRENGTH",
  globalRule: "Upper/Lower Split. Master leverage and mechanical tension. Slow eccentrics.",
  days: [
    {
      id: "c4d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Upper Body",
      totalSets: 10,
      exercises: [
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Pull Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/OEXosPwzFdc"},
        { slotName: "Horizontal Press", prescribedEquipment: "Horizontal Press Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/Vb7k11m4o5o"            },
        { slotName: "Horizontal Pull", prescribedEquipment: "Horizontal Pull Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=australian+pull+up+form"            },
        { slotName: "Vertical Press", prescribedEquipment: "Vertical Press Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=pike+push+up+form"            },
        { slotName: "Abs Exercise", prescribedEquipment: "Core Compression Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/7DoFMV1Dnow" }
      ]
    },
    {
      id: "c4d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Lower Body & Core",
      totalSets: 12,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 4, targetRIR: "S1: 3 RIR, S2: 2 RIR, S3: 1 RIR, S4: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI"            },
        { slotName: "Lunge Pattern", prescribedEquipment: "Lunge Pattern Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/nDh_BlnLCGc" },
        { slotName: "Hip Extension", prescribedEquipment: "Hip Extension Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Calf Isolation", prescribedEquipment: "Calf Isolation Progression", sets: 4, targetRIR: "S1: 3 RIR, S2: 2 RIR, S3: 1 RIR, S4: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" },
        { slotName: "Abs Exercise", prescribedEquipment: "Core Compression Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/7DoFMV1Dnow" }
      ]
    },
    {
      id: "c4d-d3",
      dayNumber: 3,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "c4d-d4",
      dayNumber: 4,
      isRestDay: false,
      title: "Upper Body",
      totalSets: 10,
      exercises: [
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Pull Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/OEXosPwzFdc"},
        { slotName: "Vertical Press", prescribedEquipment: "Vertical Press Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=pike+push+up+form"            },
        { slotName: "Horizontal Press", prescribedEquipment: "Horizontal Press Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/Vb7k11m4o5o"            },
        { slotName: "Grip & Scapula", prescribedEquipment: "Grip & Scapula Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=active+hang+scapula+pull+up" },
        { slotName: "Vertical Press Hold", prescribedEquipment: "Vertical Press Hold Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=handstand+hold+progression+calisthenics"            }
      ]
    },
    {
      id: "c4d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Lower Body & Core",
      totalSets: 10,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI"            },
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI"            },
        { slotName: "Hip Extension", prescribedEquipment: "Hip Extension Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Core Flexion", prescribedEquipment: "Core Flexion Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s" },
        { slotName: "Core Anti-Extension", prescribedEquipment: "Core Anti-Extension Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/7DoFMV1Dnow" }
      ]
    },
    {
      id: "c4d-d6",
      dayNumber: 6,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "c4d-d7",
      dayNumber: 7,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    }
  ]
};

export const CAMPAIGN_CALISTHENICS_6_DAY: Campaign = {
  id: "calisthenics-6-day",
  title: "6 DAYS: ELITE PPL",
  globalRule: "Push/Pull/Legs twice a week. Manage your connective tissue recovery. Slow eccentrics.",
  days: [
    {
      id: "c6d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Push (Vertical Bias)",
      totalSets: 9,
      exercises: [
        { slotName: "Vertical Press Hold", prescribedEquipment: "Vertical Press Hold Progression", sets: 4, targetRIR: "S1: 3 RIR, S2: 2 RIR, S3: 1 RIR, S4: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=handstand+hold+progression+calisthenics"            },
        { slotName: "Vertical Press", prescribedEquipment: "Vertical Press Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=pike+push+up+form"            },
        { slotName: "Horizontal Press", prescribedEquipment: "Horizontal Press Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/Vb7k11m4o5o"            },
        { slotName: "Elbow Extension", prescribedEquipment: "Elbow Extension Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/kwzz9WolqQk"            }
      ]
    },
    {
      id: "c6d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Pull (Vertical Bias)",
      totalSets: 11,
      exercises: [
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Pull Progression", sets: 4, targetRIR: "S1: 3 RIR, S2: 2 RIR, S3: 1 RIR, S4: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/OEXosPwzFdc"},
        { slotName: "Grip & Scapula", prescribedEquipment: "Grip & Scapula Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=active+hang+scapula+pull+up" },
        { slotName: "Horizontal Pull", prescribedEquipment: "Horizontal Pull Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=australian+pull+up+form"            },
        { slotName: "Isometric Pull", prescribedEquipment: "Isometric Pull Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=isometric+pull+up+hold" },
        { slotName: "Elbow Flexion", prescribedEquipment: "Elbow Flexion Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=Elbow+Flexion+Progression+form"            }
      ]
    },
    {
      id: "c6d-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Legs & Core",
      totalSets: 12,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 4, targetRIR: "S1: 3 RIR, S2: 2 RIR, S3: 1 RIR, S4: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI"            },
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI"            },
        { slotName: "Hip Extension", prescribedEquipment: "Hip Extension Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Core Compression", prescribedEquipment: "Core Compression Progression", sets: 4, targetRIR: "S1: 3 RIR, S2: 2 RIR, S3: 1 RIR, S4: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/7DoFMV1Dnow"            },
        { slotName: "Core Flexion", prescribedEquipment: "Core Flexion Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s" }
      ]
    },
    {
      id: "c6d-d4",
      dayNumber: 4,
      isRestDay: false,
      title: "Push (Horizontal Bias)",
      totalSets: 9,
      exercises: [
        { slotName: "Horizontal Press", prescribedEquipment: "Horizontal Press Progression", sets: 4, targetRIR: "S1: 3 RIR, S2: 2 RIR, S3: 1 RIR, S4: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/Vb7k11m4o5o"            },
        { slotName: "Horizontal Press", prescribedEquipment: "Horizontal Press Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/Vb7k11m4o5o"            },
        { slotName: "Vertical Press", prescribedEquipment: "Vertical Press Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=pike+push+up+form"            },
        { slotName: "Elbow Extension", prescribedEquipment: "Elbow Extension Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/kwzz9WolqQk"            }
      ]
    },
    {
      id: "c6d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Pull (Horizontal Bias)",
      totalSets: 12,
      exercises: [
        { slotName: "Horizontal Pull", prescribedEquipment: "Horizontal Pull Progression", sets: 4, targetRIR: "S1: 3 RIR, S2: 2 RIR, S3: 1 RIR, S4: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=australian+pull+up+form"            },
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Pull Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/OEXosPwzFdc"},
        { slotName: "Core / Pull", prescribedEquipment: "Core / Pull Progression", sets: 4, targetRIR: "S1: 3 RIR, S2: 2 RIR, S3: 1 RIR, S4: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/7DoFMV1Dnow" },
        { slotName: "Scapula Isolation", prescribedEquipment: "Scapula Isolation Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=scapular+pull+ups" },
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Pull Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/OEXosPwzFdc"}
      ]
    },
    {
      id: "c6d-d6",
      dayNumber: 6,
      isRestDay: false,
      title: "Legs & Core (Volume)",
      totalSets: 14,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 4, targetRIR: "S1: 3 RIR, S2: 2 RIR, S3: 1 RIR, S4: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI"            },
        { slotName: "Lunge Pattern", prescribedEquipment: "Lunge Pattern Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/nDh_BlnLCGc" },
        { slotName: "Hip Extension", prescribedEquipment: "Hip Extension Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Calf Isolation", prescribedEquipment: "Calf Isolation Progression", sets: 4, targetRIR: "S1: 3 RIR, S2: 2 RIR, S3: 1 RIR, S4: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" },
        { slotName: "Abs Exercise", prescribedEquipment: "Core Compression Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/7DoFMV1Dnow" },
        { slotName: "Core Anti-Extension", prescribedEquipment: "Core Anti-Extension Progression", sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: [], videoUrl: "https://www.youtube.com/shorts/7DoFMV1Dnow" }
      ]
    },
    {
      id: "c6d-d7",
      dayNumber: 7,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    }
  ]
};

export const CAMPAIGN_HYBRID_4_DAY: Campaign = {
  id: "hybrid-4-day",
  title: "4 DAYS: HYBRID PROTOCOL",
  globalRule: "Consolidate stressors. Pair high-intensity lifting with high-intensity intervals. Keep your slow distance truly slow.",
  days: [
    {
      id: "h4d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Lower Body (Max Force) + High Intensity Intervals",
      totalSets: 12,
      warning: "Conditioning: Short, high-intensity intervals (e.g., 400m-800m repeats or AirDyne sprints). Exhaust the glycogen stores today.",
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Heavy Squat", sets: 4, targetRIR: "S1: 2-1 RIR, S2-4: 1-0 RIR", substitutions: [], videoUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8&pp=ygUSc3F1YXQgamVmZiBuaXBwYXJk" },
        { slotName: "Hinge Pattern", prescribedEquipment: "Heavy Deadlift", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: [], videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" },
        { slotName: "Quad Isolation", prescribedEquipment: "Front Squats", sets: 3, targetRIR: "S1: 2-1 RIR, S2-3: 1-0 RIR", substitutions: [], videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI" },
        { slotName: "Core Stability", prescribedEquipment: "Weighted Plank", sets: 3, targetRIR: "Hold to failure", substitutions: [], videoUrl: "https://www.youtube.com/shorts/7DoFMV1Dnow" }
      ]
    },
    {
      id: "h4d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Upper Body (Max Force) + Active Recovery",
      totalSets: 12,
      warning: "Conditioning: 20-30 min Active Recovery (Easy spin or light row). Flush the metabolites from yesterday.",
      exercises: [
        { slotName: "Horizontal Press", prescribedEquipment: "Heavy Bench Press", sets: 4, targetRIR: "S1: 2-1 RIR, S2-4: 1-0 RIR", substitutions: [], videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Vertical Press", prescribedEquipment: "Push Press", sets: 3, targetRIR: "S1: 2-1 RIR, S2-3: 1-0 RIR", substitutions: [], videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Horizontal Pull", prescribedEquipment: "Heavy Barbell Row", sets: 3, targetRIR: "S1: 2-1 RIR, S2-3: 1-0 RIR", substitutions: [], videoUrl: "https://youtu.be/vD-dEl7R2Bg?t=4m23s" },
        { slotName: "Vertical Pull", prescribedEquipment: "Weighted Pull-ups", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: [], videoUrl: "https://youtu.be/Hdc7Mw6BIEE" }
      ]
    },
    {
      id: "h4d-d3",
      dayNumber: 3,
      isRestDay: true,
      title: "Aerobic Base Building",
      totalSets: 0,
      warning: "Conditioning: Long Slow Run (LSR) or Long Slow Ride (LSRD) for 60-90 minutes. Strict Zone 2 heart rate. Build the aerobic base.",
      exercises: []
    },
    {
      id: "h4d-d4",
      dayNumber: 4,
      isRestDay: false,
      title: "Lower Body (Hypertrophy) + Tempo",
      totalSets: 12,
      warning: "Conditioning: 30-40 min Tempo Run. Push just below lactate threshold.",
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Cadenced Squats (3-0-2)", sets: 4, targetRIR: "S1-4: 1 RIR", substitutions: [], videoUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8&pp=ygUSc3F1YXQgamVmZiBuaXBwYXJk" },
        { slotName: "Unilateral Legs", prescribedEquipment: "Split Squats", sets: 3, targetRIR: "S1-3: 1 RIR", substitutions: [], videoUrl: "https://www.youtube.com/shorts/nDh_BlnLCGc" },
        { slotName: "Hinge Pattern", prescribedEquipment: "Romanian Deadlift", sets: 3, targetRIR: "S1-3: 1 RIR", substitutions: [], videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Calf Isolation", prescribedEquipment: "Standing Calf Raise", sets: 2, targetRIR: "S1-2: 0 RIR", substitutions: [], videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" }
      ]
    },
    {
      id: "h4d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Upper Body (Hypertrophy) + Short Depletion",
      totalSets: 12,
      warning: "Conditioning: 20-30 min short depletion ride or row. High carb intake post-workout.",
      exercises: [
        { slotName: "Incline Press", prescribedEquipment: "Incline DB Press", sets: 3, targetRIR: "S1-3: 1 RIR", substitutions: [], videoUrl: "https://youtube.com/shorts/JtR_jfdHYwY" },
        { slotName: "Horizontal Press", prescribedEquipment: "Close Grip Bench", sets: 3, targetRIR: "S1-3: 1 RIR", substitutions: [], videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Shoulder Isolation", prescribedEquipment: "Lateral Raises", sets: 3, targetRIR: "S1-3: 0 RIR", substitutions: [], videoUrl: "https://www.youtube.com/watch?v=pOmbQuGeHf8&pp=ygUYZHVtYmJlbGwgbGF0ZXJhbCByYWlzZXMg" },
        { slotName: "Arm Isolation", prescribedEquipment: "Barbell Curls", sets: 3, targetRIR: "S1-3: 0 RIR", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=Barbell+Curls+form" }
      ]
    },
    {
      id: "h4d-d6",
      dayNumber: 6,
      isRestDay: true,
      title: "Active Recovery",
      totalSets: 0,
      warning: "Light stretching and mobility work.",
      exercises: []
    },
    {
      id: "h4d-d7",
      dayNumber: 7,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    }
  ]
};

export const CAMPAIGN_HYBRID_6_DAY: Campaign = {
  id: "hybrid-6-day",
  title: "6 DAYS: ELITE HYBRID PROTOCOL",
  globalRule: "Extreme volume and frequency. Total fatigue management is required. Never redline your easy days.",
  days: [
    {
      id: "h6d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Squat/Bench/Biceps (Volume) + Tempo",
      totalSets: 10,
      warning: "Conditioning: 30-45 minute Tempo Run (Zone 3.5-4.0). Practice race-pace mechanics.",
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Back Squat", sets: 5, targetRIR: "S1-5: 2 RIR", substitutions: [], videoUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8&pp=ygUSc3F1YXQgamVmZiBuaXBwYXJk" },
        { slotName: "Horizontal Press", prescribedEquipment: "Bench Press", sets: 2, targetRIR: "S1-2: 2 RIR", substitutions: [], videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Elbow Flexion", prescribedEquipment: "Biceps Curls", sets: 3, targetRIR: "S1-3: 1 RIR", substitutions: [], videoUrl: "https://www.youtube.com/results?search_query=Biceps+Curls+form" }
      ]
    },
    {
      id: "h6d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Bench/Deadlift/Back (Max Force) + Intervals",
      totalSets: 10,
      warning: "Conditioning: High-intensity Intervals/Repeats. Consolidate your CNS stress today.",
      exercises: [
        { slotName: "Horizontal Press", prescribedEquipment: "Paused Bench Press", sets: 4, targetRIR: "S1: 2-1 RIR, S2-4: 1-0 RIR", substitutions: [], videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Hinge Pattern", prescribedEquipment: "Heavy Deadlift", sets: 2, targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR", substitutions: [], videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" },
        { slotName: "Horizontal Pull", prescribedEquipment: "Heavy Barbell Row", sets: 4, targetRIR: "S1: 2-1 RIR, S2-4: 1-0 RIR", substitutions: [], videoUrl: "https://youtu.be/vD-dEl7R2Bg?t=4m23s" }
      ]
    },
    {
      id: "h6d-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Shoulders/Arms/Abs + Active Recovery",
      totalSets: 12,
      warning: "Conditioning: 20-30 min recovery ride or swim.",
      exercises: [
        { slotName: "Vertical Press", prescribedEquipment: "Dumbbell Overhead Press", sets: 3, targetRIR: "S1-3: 1 RIR", substitutions: [], videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Lateral Delt", prescribedEquipment: "Lateral Raises", sets: 3, targetRIR: "S1-3: 1 RIR", substitutions: [], videoUrl: "https://www.youtube.com/watch?v=pOmbQuGeHf8&pp=ygUYZHVtYmJlbGwgbGF0ZXJhbCByYWlzZXMg" },
        { slotName: "Elbow Extension", prescribedEquipment: "Overhead Triceps Extensions", sets: 3, targetRIR: "S1-3: 1 RIR", substitutions: [], videoUrl: "https://www.youtube.com/shorts/kwzz9WolqQk" },
        { slotName: "Core", prescribedEquipment: "Cable Crunches", sets: 3, targetRIR: "S1-3: 1 RIR", substitutions: [], videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s" }
      ]
    },
    {
      id: "h6d-d4",
      dayNumber: 4,
      isRestDay: false,
      title: "Technique SBD + Aerobic Base",
      totalSets: 6,
      warning: "Conditioning: Long Slow Distance (LSR/LSRD). 90-120 minutes. Keep it strictly Zone 2.",
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Squat (Light)", sets: 2, targetRIR: "S1-2: 3 RIR", substitutions: [], videoUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8&pp=ygUSc3F1YXQgamVmZiBuaXBwYXJk" },
        { slotName: "Horizontal Press", prescribedEquipment: "Bench (Light)", sets: 2, targetRIR: "S1-2: 3 RIR", substitutions: [], videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Hinge Pattern", prescribedEquipment: "Deadlift (Light)", sets: 2, targetRIR: "S1-2: 3 RIR", substitutions: [], videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" }
      ]
    },
    {
      id: "h6d-d5",
      dayNumber: 5,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      warning: "Conditioning: Complete Rest. Eat to support tomorrow's peak performance.",
      exercises: []
    },
    {
      id: "h6d-d6",
      dayNumber: 6,
      isRestDay: false,
      title: "Peak Performance (SBD Heavy) + Short Sprints",
      totalSets: 6,
      warning: "Conditioning: Alactic sprints (AirDyne or hill sprints). Maximum power output, full recovery between sets.",
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Heavy Squat", sets: 2, targetRIR: "S1: 1 RIR, S2: 0 RIR", substitutions: [], videoUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8&pp=ygUSc3F1YXQgamVmZiBuaXBwYXJk" },
        { slotName: "Horizontal Press", prescribedEquipment: "Heavy Bench", sets: 2, targetRIR: "S1: 1 RIR, S2: 0 RIR", substitutions: [], videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Deadlift Pattern", prescribedEquipment: "Heavy Deadlift", sets: 2, targetRIR: "S1: 1 RIR, S2: 0 RIR", substitutions: [], videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" }
      ]
    },
    {
      id: "h6d-d7",
      dayNumber: 7,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    }
  ]
};

export const CAMPAIGN_FEMALE_3_DAY: Campaign = {
  id: "female-3-day-split",
  title: "3 Days: Women's Foundations (Full Body)",
  globalRule: "ULTIMATUM Foundations Protocol - 3 Day Split",
  days: [
    {
      id: "f3d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Full-Body #1",
      totalSets: 12,
      exercises: [
        { slotName: "Quads, Glutes", prescribedEquipment: "Back Squat", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Hack Squat", "Leg Press", "Smith Machine Squat"], notes: "SIT DOWN AND BACK, KEEP YOUR KNEES OUT" , videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI" },
        { slotName: "Deltoids, Triceps", prescribedEquipment: "DB Seated Shoulder Press", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Barbell Overhead Press", "Machine Shoulder Press"], notes: "KEEP YOUR TORSO UPRIGHT" , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Glutes", prescribedEquipment: "Barbell Hip Thrust", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Hip Thrust", "Glute Bridge", "Cable Pull-Through"], notes: "KEEP YOUR RIB CAGE AND CHIN TUCKED" , videoUrl: "https://www.youtube.com/watch?v=pUdIL5x0fWg" },
        { slotName: "Lats, Biceps", prescribedEquipment: "Isolateral Pulldown", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Lat Pulldown", "Pull-Up"], notes: "PULL YOUR ELBOWS DOWN AND IN" , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Hamstrings", prescribedEquipment: "Unilateral Seat Leg Curl", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Lying Leg Curl"], notes: "FOCUS ON SQUEEZING YOUR HAMSTRINGS" , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Abdominals", prescribedEquipment: "Bicycle Crunch", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Lying Leg Raises", "Crunches"], notes: "FOCUS ON FLEXING AND ROTATING YOUR SPINE" , videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s" }
      ]
    },
    {
      id: "f3d-d2",
      dayNumber: 2,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "f3d-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Full-Body #2",
      totalSets: 14,
      exercises: [
        { slotName: "Hamstrings, Glutes", prescribedEquipment: "Deadlift", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Romanian Deadlift", "Trap Bar Deadlift"], notes: "KEEP YOUR HIPS HIGH, LUMBAR SPINE NEUTRAL" , videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" },
        { slotName: "Chest, Deltoids, Triceps", prescribedEquipment: "Dumbbell Chest Press", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Barbell Bench Press", "Machine Chest Press"], notes: "KEEP YOUR SHOULDER BLADES BACK AND DOWN" , videoUrl: "https://www.youtube.com/shorts/1V3vpcaxRYQ" },
        { slotName: "Quads, Glutes", prescribedEquipment: "Unilateral Leg Press", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Bulgarian Split Squat", "Leg Press"], notes: "START WITH YOUR WEAKER LEG" , videoUrl: "https://www.youtube.com/shorts/nDh_BlnLCGc" },
        { slotName: "Lats, Biceps", prescribedEquipment: "Unilateral Cable Row", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Row", "Seated Cable Row"], notes: "PULL YOUR ELBOWS DOWN AND IN" , videoUrl: "https://www.youtube.com/shorts/OL8yGrkXyiQ" },
        { slotName: "Glutes", prescribedEquipment: "Knee-Banded Barbell Hip Thrust", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Hip Thrust", "Glute Bridge", "Cable Pull-Through"], notes: "KEEP YOUR KNEES OUT, CHIN AND RIBS TUCKED" , videoUrl: "https://www.youtube.com/watch?v=pUdIL5x0fWg" },
        { slotName: "Deltoids, Biceps", prescribedEquipment: "Cable Upright Row", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Upright Row", "Barbell Upright Row"], notes: "PULL UNTIL YOUR UPPER ARM IS PARALLEL WITH THE GROUND" , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Biceps", prescribedEquipment: "DB Alternating Curl", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Barbell Curl", "Cable Curl"], notes: "FOCUS ON SQUEEZING YOUR BICEPS" , videoUrl: "https://www.youtube.com/results?search_query=DB+Alternating+Curl+form" }
      ]
    },
    {
      id: "f3d-d4",
      dayNumber: 4,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "f3d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Full-Body #3",
      totalSets: 14,
      exercises: [
        { slotName: "Glutes", prescribedEquipment: "Barbell Hip Thrust", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Hip Thrust", "Glute Bridge", "Cable Pull-Through"], notes: "KEEP YOUR RIB CAGE AND CHIN TUCKED" , videoUrl: "https://www.youtube.com/watch?v=pUdIL5x0fWg" },
        { slotName: "Deltoids", prescribedEquipment: "Barbell Overhead Press", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Shoulder Press", "Machine Shoulder Press"], notes: "SQUEEZE YOUR GLUTES TO KEEP YOUR TORSO UPRIGHT" , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Hamstrings, Glutes", prescribedEquipment: "Unilateral Dumbbell RDL", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Barbell RDL", "Cable Pull-Through"], notes: "KEEP YOUR PLANTED SHIN VERTICAL, PUSH YOUR HIPS BACK" , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Rear Deltoids", prescribedEquipment: "Reverse Peck Deck", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Face Pull", "Dumbbell Rear Delt Fly"], notes: "SWING THE WEIGHT OUT" , videoUrl: "https://www.youtube.com/shorts/5v2tTaOKQtI" },
        { slotName: "Calves", prescribedEquipment: "Seated Calf Raise", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Standing Calf Raise", "Leg Press Calf Raise"], notes: "PRESS UP TO YOUR TOES" , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" },
        { slotName: "Glutes", prescribedEquipment: "Cable Hip Abduction", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Seated Hip Abduction Machine", "Band Hip Abduction"], notes: "KEEP YOUR TORSO UPRIGHT, SWING YOUR LEG OUT" , videoUrl: "https://www.youtube.com/watch?v=KgghFOMKnkE&pp=ygUPZG9ua2V5IGtpY2tiYWNr" },
        { slotName: "Triceps", prescribedEquipment: "Cable Rope Kickback", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Overhead Tricep Extension", "Tricep Pushdown"], notes: "KEEP YOUR ELBOW BEHIND YOUR TORSO" , videoUrl: "https://www.youtube.com/shorts/kwzz9WolqQk" }
      ]
    },
    {
      id: "f3d-d6",
      dayNumber: 6,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "f3d-d7",
      dayNumber: 7,
      isRestDay: true,
      title: "REST",
      totalSets: 12,
      exercises: []
    }
  ]
};

export const CAMPAIGN_FEMALE_4_DAY: Campaign = {
  id: "female-4-day-split",
  title: "4 Days: Women's Foundations",
  globalRule: "ULTIMATUM Foundations Protocol - 4 Day Split",
  days: [
    {
      id: "f4d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Lower #1",
      totalSets: 12,
      exercises: [
        { slotName: "Quads, Glutes", prescribedEquipment: "Back Squat", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Hack Squat", "Leg Press", "Smith Machine Squat"], notes: "SIT DOWN AND BACK, KEEP YOUR KNEES OUT" , videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI" },
        { slotName: "Glutes", prescribedEquipment: "Barbell Hip Thrust", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Hip Thrust", "Glute Bridge", "Cable Pull-Through"], notes: "KEEP YOUR RIB CAGE AND CHIN TUCKED" , videoUrl: "https://www.youtube.com/watch?v=pUdIL5x0fWg" },
        { slotName: "Glutes, Hamstrings", prescribedEquipment: "Cable Pull-Through", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Kettlebell Swing", "Barbell Hip Thrust"], notes: "FOCUS ON EXTENDING YOUR HIPS" , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Hamstrings", prescribedEquipment: "Unilateral Lying Leg Curl", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Seated Leg Curl", "Lying Leg Curl"], notes: "" , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Glutes", prescribedEquipment: "Cable Hip Abduction", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Seated Hip Abduction Machine", "Band Hip Abduction"], notes: "KEEP YOUR TORSO UPRIGHT, SWING YOUR LEG OUT" , videoUrl: "https://www.youtube.com/watch?v=KgghFOMKnkE&pp=ygUPZG9ua2V5IGtpY2tiYWNr" },
        { slotName: "Abdominals", prescribedEquipment: "Bicycle Crunch", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Lying Leg Raises", "Crunches"], notes: "FOCUS ON FLEXING AND ROTATING YOUR SPINE" , videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s" }
      ]
    },
    {
      id: "f4d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Upper #1",
      totalSets: 16,
      exercises: [
        { slotName: "Deltoids", prescribedEquipment: "Barbell Overhead Press", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Shoulder Press", "Machine Shoulder Press"], notes: "SQUEEZE YOUR GLUTES TO KEEP YOUR TORSO UPRIGHT" , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Lats, Biceps", prescribedEquipment: "Isolateral Pulldown", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Lat Pulldown", "Pull-Up"], notes: "PULL YOUR ELBOWS DOWN AND IN" , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Chest, Deltoids, Triceps", prescribedEquipment: "Dumbbell Chest Press", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Barbell Bench Press", "Machine Chest Press"], notes: "KEEP YOUR SHOULDER BLADES BACK AND DOWN" , videoUrl: "https://www.youtube.com/shorts/1V3vpcaxRYQ" },
        { slotName: "Lats, Biceps", prescribedEquipment: "Unilateral Cable Row", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Row", "Seated Cable Row"], notes: "PULL YOUR ELBOWS DOWN AND IN" , videoUrl: "https://www.youtube.com/shorts/OL8yGrkXyiQ" },
        { slotName: "Deltoids, Biceps", prescribedEquipment: "Cable Upright Row", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Upright Row", "Barbell Upright Row"], notes: "PULL UNTIL YOUR UPPER ARM IS PARALLEL WITH THE GROUND" , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Rear Deltoids", prescribedEquipment: "Seated Face Pull", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Cable Face Pull", "Reverse Pec Deck"], notes: "PULL YOUR ELBOWS UP AND OUT" , videoUrl: "https://www.youtube.com/shorts/j5f_0rNkPwU" },
        { slotName: "Biceps", prescribedEquipment: "DB Alternating Curl", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Barbell Curl", "Cable Curl"], notes: "FOCUS ON SQUEEZING YOUR BICEPS" , videoUrl: "https://www.youtube.com/results?search_query=DB+Alternating+Curl+form" },
        { slotName: "Triceps", prescribedEquipment: "Cable Rope Kickback", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Overhead Tricep Extension", "Tricep Pushdown"], notes: "KEEP YOUR ELBOW BEHIND YOUR TORSO" , videoUrl: "https://www.youtube.com/shorts/kwzz9WolqQk" }
      ]
    },
    {
      id: "f4d-d3",
      dayNumber: 3,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "f4d-d4",
      dayNumber: 4,
      isRestDay: false,
      title: "Lower #2",
      totalSets: 12,
      exercises: [
        { slotName: "Hamstrings, Glutes", prescribedEquipment: "Deadlift", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Romanian Deadlift", "Trap Bar Deadlift"], notes: "KEEP YOUR HIPS HIGH, LUMBAR SPINE NEUTRAL" , videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" },
        { slotName: "Quads, Glutes", prescribedEquipment: "Unilateral Leg Press", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Bulgarian Split Squat", "Leg Press"], notes: "START WITH YOUR WEAKER LEG" , videoUrl: "https://www.youtube.com/shorts/nDh_BlnLCGc" },
        { slotName: "Glutes", prescribedEquipment: "Knee-Banded Barbell Hip Thrust", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Hip Thrust", "Glute Bridge", "Cable Pull-Through"], notes: "KEEP YOUR KNEES OUT, CHIN AND RIBS TUCKED" , videoUrl: "https://www.youtube.com/watch?v=pUdIL5x0fWg" },
        { slotName: "Glutes", prescribedEquipment: "Donkey Kickback", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Cable Glute Kickback", "Machine Glute Kickback"], notes: "FOCUS ON SQUEEZING YOUR GLUTES" , videoUrl: "https://www.youtube.com/watch?v=KgghFOMKnkE&pp=ygUPZG9ua2V5IGtpY2tiYWNr" },
        { slotName: "Calves", prescribedEquipment: "Seated Calf Raise", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Standing Calf Raise", "Leg Press Calf Raise"], notes: "PRESS UP TO YOUR TOES" , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" },
        { slotName: "Abdominals", prescribedEquipment: "Hanging Leg Raise", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Lying Leg Raise", "Captain's Chair Leg Raise"], notes: "SQUEEZE YOUR GLUTES" , videoUrl: "https://www.youtube.com/shorts/7DoFMV1Dnow" }
      ]
    },
    {
      id: "f4d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Upper #2",
      totalSets: 16,
      exercises: [
        { slotName: "Chest, Deltoids, Triceps", prescribedEquipment: "Dumbbell Chest Press", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Barbell Bench Press", "Machine Chest Press"], notes: "KEEP YOUR SHOULDER BLADES BACK AND DOWN" , videoUrl: "https://www.youtube.com/shorts/1V3vpcaxRYQ" },
        { slotName: "Lats, Biceps", prescribedEquipment: "Assisted Pull-Up", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Lat Pulldown", "Pull-Up"], notes: "PULL YOUR ELBOWS DOWN TOWARDS YOUR WAIST" , videoUrl: "https://www.youtube.com/shorts/OEXosPwzFdc" },
        { slotName: "Deltoids, Triceps", prescribedEquipment: "DB Seated Shoulder Press", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Barbell Overhead Press", "Machine Shoulder Press"], notes: "KEEP YOUR TORSO UPRIGHT" , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Lats, Biceps", prescribedEquipment: "Dumbbell Row", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Cable Row", "Pendlay Row"], notes: "PULL YOUR ELBOW DOWN" , videoUrl: "https://www.youtube.com/shorts/OL8yGrkXyiQ" },
        { slotName: "Deltoids", prescribedEquipment: "DB Lateral Raise", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Cable Lateral Raise", "Machine Lateral Raise"], notes: "SLIGHTLY INTERNALLY ROTATE YOUR SHOULDER" , videoUrl: "https://www.youtube.com/watch?v=pOmbQuGeHf8&pp=ygUYZHVtYmJlbGwgbGF0ZXJhbCByYWlzZXMg" },
        { slotName: "Deltoids", prescribedEquipment: "Dumbbell Front Raise", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Cable Front Raise", "Barbell Front Raise"], notes: "FOCUS ON SQUEEZING YOUR FRONT DELT" , videoUrl: "https://www.youtube.com/shorts/NdQE5Fhfqn4" },
        { slotName: "Biceps", prescribedEquipment: "Cable Single-Arm Curl", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Curl", "Machine Preacher Curl"], notes: "FOCUS ON SQUEEZING YOUR BICEPS" , videoUrl: "https://www.youtube.com/results?search_query=Cable+Single-Arm+Curl+form" },
        { slotName: "Triceps", prescribedEquipment: "Rope Overhead Elbow Extension", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Overhead Extension", "EZ Bar Skull Crusher"], notes: "FOCUS ON SQUEEZING YOUR TRICEPS" , videoUrl: "https://www.youtube.com/watch?v=sUFUQVMWdnU&pp=ygUYY2FibGUgb3ZlcmhlYWQgZXh0ZW5zaW9u0gcJCTMMAYcqIYzv" }
      ]
    },
    {
      id: "f4d-d6",
      dayNumber: 6,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "f4d-d7",
      dayNumber: 7,
      isRestDay: true,
      title: "REST",
      totalSets: 12,
      exercises: []
    }
  ]
};

export const CAMPAIGN_FEMALE_5_DAY: Campaign = {
  id: "female-5-day-split",
  title: "5 Days: Women's Optimization",
  globalRule: "ULTIMATUM Optimization Protocol - 5 Day Split",
  days: [
    {
      id: "f5d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Lower Body Strength",
      totalSets: 12,
      exercises: [
        { slotName: "Squat", prescribedEquipment: "Back Squat", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Hack Squat", "Leg Press", "Smith Machine Squat"], notes: "SIT BACK AND DOWN, TAKE A DEEP BREATH GOING DOWN AND EXHALE COMING UP." , videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI" },
        { slotName: "Deadlift", prescribedEquipment: "Deadlift", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Romanian Deadlift", "Trap Bar Deadlift"], notes: "DO SUMO OR CONVENTIONAL, WHICHEVER FEELS MORE NATURAL." , videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" },
        { slotName: "Glutes", prescribedEquipment: "Barbell Hip Thrust", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Hip Thrust", "Glute Bridge", "Cable Pull-Through"], notes: "SQUEEZE YOUR GLUTES AT THE TOP. TUCK CHIN, DRIVE THROUGH HEELS" , videoUrl: "https://www.youtube.com/watch?v=pUdIL5x0fWg" },
        { slotName: "Quads", prescribedEquipment: "Leg Press", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Squat", "Hack Squat"], notes: "FEET HIGH AND WIDE. TRY TO FEEL YOUR GLUTES CONTRACT TO DRIVE THE PLATFORM FORWARD." , videoUrl: "https://www.youtube.com/shorts/nDh_BlnLCGc" },
        { slotName: "Glutes (Myo-Reps)", prescribedEquipment: "Machine Seated Hip Abduction (Myo-Reps)", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Cable Hip Abduction"], notes: "MYO REPS: 15 REPS/REST 5 SECS/3 REPS/REST 5 SECS/UNTIL FAIL. PUSH KNEES OUT WHILE CONTRACTING GLUTES" , videoUrl: "https://www.youtube.com/watch?v=KgghFOMKnkE&pp=ygUPZG9ua2V5IGtpY2tiYWNr" },
        { slotName: "Core", prescribedEquipment: "Plank", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Ab Wheel Rollout", "Deadbug"], notes: "FLEX YOUR GLUTES AND DON'T LET YOUR HIPS FALL OR GO UP TOO HIGH. STAY PARALLEL TO THE FLOOR" , videoUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw&t=29s&pp=ygUKcGxhbmsgZm9ybdIHCQmjCwGHKiGM7w%3D%3D" }
      ]
    },
    {
      id: "f5d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Upper Body",
      totalSets: 16,
      exercises: [
        { slotName: "Vertical Press", prescribedEquipment: "Barbell Overhead Press", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Shoulder Press", "Machine Shoulder Press"], notes: "CLAVICLE TO FULL LOCKOUT, FLEX GLUTES TO PREVENT LUMBAR ROUNDING." , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Vertical Pull", prescribedEquipment: "Chin-Up", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Lat Pulldown", "Assisted Pull-Up"], notes: "PULL YOUR ELBOWS DOWN AND IN. USE ASSISTANCE OR ADD WEIGHT IF NEEDED" , videoUrl: "https://www.youtube.com/shorts/OEXosPwzFdc" },
        { slotName: "Incline Press", prescribedEquipment: "Dumbbell Incline Press", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Incline Barbell Press", "Incline Machine Press"], notes: "SET BENCH TO 45° ANGLE. ELBOW TUCK 30° AND KEEP UPPER BACK TIGHT." , videoUrl: "https://www.youtube.com/shorts/ou6s32mJgjU" },
        { slotName: "Horizontal Pull", prescribedEquipment: "Pendlay Row", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Barbell Row", "Dumbbell Row"], notes: "TORSO PARALLEL TO THE GROUND. DOUBLE OVERHAND GRIP SHOULDER WIDTH. PULL UP STRAIGHT TOWARD YOUR CHEST." , videoUrl: "https://www.youtube.com/shorts/OL8yGrkXyiQ" },
        { slotName: "Lateral Delt", prescribedEquipment: "Dumbbell Lateral Raise Pulse", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Cable Lateral Raise"], notes: "ONLY DO THE TOP HALF OF RANGE OF MOTION" , videoUrl: "https://www.youtube.com/watch?v=pOmbQuGeHf8&pp=ygUYZHVtYmJlbGwgbGF0ZXJhbCByYWlzZXMg" },
        { slotName: "Rear Delt", prescribedEquipment: "Reverse Pec Deck", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Face Pull", "Dumbbell Rear Delt Fly"], notes: "SWING THE WEIGHT OUT, NOT BACK" , videoUrl: "https://www.youtube.com/shorts/5v2tTaOKQtI" },
        { slotName: "Biceps", prescribedEquipment: "Eccentric-Accentuated Preacher Curl", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Machine Preacher Curl", "Dumbbell Curl"], notes: "3 SECOND LOWERING PHASE. SUPINATE DURING THE CONCENTRIC AND ECCENTRIC." , videoUrl: "https://www.youtube.com/results?search_query=Eccentric-Accentuated+Preacher+Curl+form" },
        { slotName: "Triceps", prescribedEquipment: "V-Bar Press Down", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Rope Pushdown", "Straight Bar Pushdown"], notes: "KEEP YOUR ELBOW IN THE SAME POSITION. CONTRACT TRICEPS AND STAND WITH A SLIGHT BEND IN YOUR HIPS AND KNEES." , videoUrl: "https://www.youtube.com/shorts/kwzz9WolqQk" }
      ]
    },
    {
      id: "f5d-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Lower Body Hypertrophy",
      totalSets: 18,
      exercises: [
        { slotName: "Glutes", prescribedEquipment: "Pause Barbell Hip Thrust", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Hip Thrust", "Glute Bridge", "Cable Pull-Through"], notes: "3 SECOND PAUSE AT THE TOP AND SQUEEZE GLUTES." , videoUrl: "https://www.youtube.com/watch?v=pUdIL5x0fWg" },
        { slotName: "Hamstrings", prescribedEquipment: "Lying Leg Curl", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Seated Leg Curl", "Nordic Hamstring Curl"], notes: "SQUEEZE YOUR HAMSTRINGS. CONTROL THE ECCENTRIC" , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Glutes/Hinge", prescribedEquipment: "Kettlebell Swing", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Cable Pull-Through", "Romanian Deadlift"], notes: "FORCEFULLY THRUST YOUR HIPS FORWARD AND SQUEEZE GLUTES AT THE TOP (DON'T USE YOUR ARMS TO HELP)" , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Quads", prescribedEquipment: "Leg Extension", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Sissy Squat", "Bulgarian Split Squat"], notes: "SQUEEZE YOUR QUADS AT THE TOP. CONTROL THE ECCENTRIC." , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Leg Press", prescribedEquipment: "Knee Banded Leg Press", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Squat", "Hack Squat"], notes: "HIGH AND WIDE FOOT POSITION. KEEP YOUR KNEES OUT AGAINST BAND." , videoUrl: "https://www.youtube.com/shorts/nDh_BlnLCGc" },
        { slotName: "Glutes", prescribedEquipment: "Cable Standing Glute Kickback", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Donkey Kickback", "Machine Glute Kickback"], notes: "LEAN FORWARD. KICK FOOT BACK AND SLIGHTLY UP. SQUEEZE GLUTES." , videoUrl: "https://www.youtube.com/watch?v=KgghFOMKnkE&pp=ygUPZG9ua2V5IGtpY2tiYWNr" },
        { slotName: "Glutes", prescribedEquipment: "Cable Standing Hip Abduction", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Seated Hip Abduction Machine"], notes: "INTERNALLY ROTATE YOUR HIPS (TOE POINTED IN). SWING LEG OUT." , videoUrl: "https://www.youtube.com/watch?v=KgghFOMKnkE&pp=ygUPZG9ua2V5IGtpY2tiYWNr" },
        { slotName: "Calves", prescribedEquipment: "Seated Calf Raise", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Standing Calf Raise", "Leg Press Calf Raise"], notes: "PAUSE AT THE BOTTOM AND CONTRACT YOUR CALVES AT THE TOP." , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" },
        { slotName: "Core", prescribedEquipment: "Hanging Leg Raise", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Lying Leg Raise", "Captain's Chair Leg Raise"], notes: "SLOW AND CONTROLLED (DON'T CHEAT WITH MOMENTUM)" , videoUrl: "https://www.youtube.com/shorts/7DoFMV1Dnow" }
      ]
    },
    {
      id: "f5d-d4",
      dayNumber: 4,
      isRestDay: false,
      title: "Upper Body",
      totalSets: 16,
      exercises: [
        { slotName: "Horizontal Press", prescribedEquipment: "Barbell Bench Press", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Machine Variation", "Dumbbell Variation"], notes: "45° ELBOW TUCK. HOLD UPPER BACK TIGHT, HANDS SLIGHTLY WIDER THAN SHOULDER WIDTH." , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Vertical Pull", prescribedEquipment: "Isolateral Pulldown", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Lat Pulldown", "Pull-Up"], notes: "PULL YOUR ELBOWS BACK AND DOWN. 4 SETS PER ARM." , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Shoulders", prescribedEquipment: "Arnold Press", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Shoulder Press", "Overhead Press"], notes: "START IN TRANSVERSE ABDUCTION, PRESS UP WITH SHOULDER FLEXION. REVERSE ON THE WAY DOWN." , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Horizontal Row", prescribedEquipment: "Chest-Supported Row", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["T-Bar Row", "Dumbbell Row"], notes: "INITIATE EACH REP VIA SCAPULAR RETRACTION. PULL WITH YOUR ELBOWS BACK AND ~45 DEGREES FROM TORSO." , videoUrl: "https://www.youtube.com/shorts/OL8yGrkXyiQ" },
        { slotName: "Lateral Delt", prescribedEquipment: "Band Lateral Raise", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Lateral Raise", "Cable Lateral Raise"], notes: "LEAD WITH YOUR ELBOW. SWING THE BAND 'OUT', NOT 'UP'." , videoUrl: "https://www.youtube.com/watch?v=pOmbQuGeHf8&pp=ygUYZHVtYmJlbGwgbGF0ZXJhbCByYWlzZXMg" },
        { slotName: "Rear Delt", prescribedEquipment: "Cable Rope Face Pull", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Reverse Pec Deck", "Seated Face Pull"], notes: "STAND AND LEAN BACK SLIGHTLY. PULL YOUR ELBOWS UP AND BACK." , videoUrl: "https://www.youtube.com/shorts/5v2tTaOKQtI" },
        { slotName: "Biceps", prescribedEquipment: "EZ Bar Curl", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Barbell Curl", "Dumbbell Curl"], notes: "FLEX YOUR BICEPS AND MAKE SURE TO CONTROL THE ECCENTRIC." , videoUrl: "https://www.youtube.com/results?search_query=EZ+Bar+Curl+form" },
        { slotName: "Triceps", prescribedEquipment: "EZ Bar Skull Crusher", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Skull Crusher", "Tricep Pushdown"], notes: "LAY ON A FLAT BENCH OR THE FLOOR. EXTEND BAR ABOVE YOUR HEAD AND CONTRACT TRICEPS INTO EXTENSION." , videoUrl: "https://www.youtube.com/shorts/kwzz9WolqQk" }
      ]
    },
    {
      id: "f5d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Lower Body Strength",
      totalSets: 12,
      exercises: [
        { slotName: "Deadlift", prescribedEquipment: "Deadlift", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Romanian Deadlift", "Trap Bar Deadlift"], notes: "DO SUMO OR CONVENTIONAL, WHICHEVER FEELS MORE NATURAL." , videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" },
        { slotName: "Squat", prescribedEquipment: "Front Squat", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Back Squat", "Goblet Squat"], notes: "KEEP YOUR CHEST UPRIGHT. DRIVE THROUGH YOUR HEELS." , videoUrl: "https://www.youtube.com/shorts/MLoZuAkIyZI" },
        { slotName: "Glutes", prescribedEquipment: "Barbell Hip Thrust", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Dumbbell Hip Thrust", "Glute Bridge", "Cable Pull-Through"], notes: "SQUEEZE YOUR GLUTES AT THE TOP. TUCK CHIN, DRIVE THROUGH HEELS." , videoUrl: "https://www.youtube.com/watch?v=pUdIL5x0fWg" },
        { slotName: "Hinge", prescribedEquipment: "Bodyweight Round-Back 45° Hyperextension", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Romanian Deadlift", "Good Morning"], notes: "KEEP BACK ROUNDED AND LOCK THIS POSITION. CUE 'THRUSTING' HIPS INTO PAD." , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Glutes", prescribedEquipment: "Lateral Band Walk", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Cable Hip Abduction", "Seated Hip Abduction"], notes: "PRESS AGAINST THE BAND WITH THE LEADING LEG TO ABDUCT THE HIPS. FEEL SIDE GLUTE CONTRACT." , videoUrl: "https://www.youtube.com/watch?v=KgghFOMKnkE&pp=ygUPZG9ua2V5IGtpY2tiYWNr" },
        { slotName: "Core", prescribedEquipment: "Ab Vacuum", sets: 2, targetRIR: "S1: 2 RIR, S2: 1 RIR", substitutions: ["Plank", "Deadbug"], notes: "RELEASE AIR COMPLETELY. PULL YOUR BELLY BUTTON 'IN' AND 'UP' AND HOLD." , videoUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw&t=29s&pp=ygUKcGxhbmsgZm9ybdIHCQmjCwGHKiGM7w%3D%3D" }
      ]
    },
    {
      id: "f5d-d6",
      dayNumber: 6,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "f5d-d7",
      dayNumber: 7,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    }
  ]
};

export * from './stretching-data';
