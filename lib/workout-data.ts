export type Exercise = {
  id?: string;
  slotName: string;
  prescribedEquipment: string;
  sets: number;
  targetRIR: string;
  notes?: string;
  substitutions: string[];
  videoUrl?: string;
};

export type WorkoutDay = {
  id: string;
  dayNumber: number;
  isRestDay: boolean;
  title: string;
  totalSets: number;
  exercises: Exercise[];
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
        { slotName: "Quad-Biased Squat (Heavy)", prescribedEquipment: "Machine Squat", sets: 2, targetRIR: "1-0", substitutions: ["Hack Squat", "Pendulum Squat", "Leg Press"]           , videoUrl: "https://www.instagram.com/p/Cvk5D_-sgif/" },
        { slotName: "Quad-Biased Squat (Back-off)", prescribedEquipment: "Machine Squat", sets: 2, targetRIR: "2-1", substitutions: ["Hack Squat", "Pendulum Squat", "Leg Press"]           , videoUrl: "https://www.instagram.com/p/Cvk5D_-sgif/" },
        { slotName: "Overhead Press (Front Delt Focus)", prescribedEquipment: "Standing OHP", sets: 2, targetRIR: "1-0", substitutions: ["Seated DB Press", "Machine Shoulder Press"]           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Knee Flexion (Hamstring Isolation)", prescribedEquipment: "Nordic Ham Curl", sets: 2, targetRIR: "1-0", substitutions: ["Lying Leg Curl", "Seated Leg Curl"]           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Horizontal Row (Lat Bias)", prescribedEquipment: "Meadows Row", sets: 2, targetRIR: "1-0", substitutions: ["Single Arm DB Row", "Machine Lat Row"]           , videoUrl: "https://youtu.be/Cp_bShvMY4c" },
        { slotName: "Elbow-at-Side Curl (Bicep/Brachialis)", prescribedEquipment: "Inverse Zottman Curl", sets: 2, targetRIR: "1-0", substitutions: ["DB Hammer Curl", "EZ Bar Curl"]           , videoUrl: "https://www.youtube.com/shorts/_GziHDdJY10" },
        { slotName: "Lateral Raise (Side Delt Focus)", prescribedEquipment: "Machine Lateral Raise", sets: 2, targetRIR: "1-0", substitutions: ["Cable Lateral Raise", "DB Lateral Raise"]           , videoUrl: "https://www.youtube.com/shorts/f_OGBg2KxgY" },
        { slotName: "Chest Fly (Isolation)", prescribedEquipment: "Pec Deck", sets: 2, targetRIR: "1-0", substitutions: ["Cable Crossover", "Flat Bench DB Fly"]           , videoUrl: "https://www.youtube.com/shorts/g3T7LsEeDWQ" }
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
        { slotName: "Horizontal Press (Chest Focus - Heavy)", prescribedEquipment: "Machine Chest Press", sets: 2, targetRIR: "1-0", substitutions: ["Flat Barbell Bench", "Flat DB Press"]           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Horizontal Press (Chest Focus - Back-off)", prescribedEquipment: "Machine Chest Press", sets: 2, targetRIR: "2-1", substitutions: ["Flat Barbell Bench", "Flat DB Press"]           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Vertical Pull (Lat Focus)", prescribedEquipment: "Machine Pulldown", sets: 2, targetRIR: "1-0", substitutions: ["Lat Pulldown (Cable)", "Pull-Up"]           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Overhead Press (Front Delt Focus)", prescribedEquipment: "Standing OHP", sets: 2, targetRIR: "1-0", substitutions: ["Cable Shoulder Press", "Machine Shoulder Press", "DB Shoulder Press"]           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Chest-Supported Row (Mid-Back Focus)", prescribedEquipment: "Chest-Supported T-Bar Row", sets: 2, targetRIR: "1-0", substitutions: ["Helms DB Row", "Seal Row"]           , videoUrl: "https://youtu.be/vD-dEl7R2Bg?t=4m23s" },
        { slotName: "Overhead Tricep Extension (Long Head Focus)", prescribedEquipment: "Overhead Cable Triceps Extension", sets: 2, targetRIR: "1-0", substitutions: ["DB Overhead Extension", "EZ Bar French Press"]           , videoUrl: "https://www.youtube.com/shorts/68NDeHB1WSc" },
        { slotName: "Elbow-at-Side Curl", prescribedEquipment: "Cable EZ Curl", sets: 2, targetRIR: "1-0", substitutions: ["Barbell Curl", "DB Curl"]           , videoUrl: "https://www.youtube.com/shorts/j5f_0rNkPwU" }
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
        { slotName: "Hinged Posterior Chain Movement (Hamstring/Glute Focus)", prescribedEquipment: "Romanian Deadlift", sets: 2, targetRIR: "1-0", substitutions: ["DB RDL", "Deficit RDL"]           , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Unilateral Leg Extension/Press", prescribedEquipment: "Single Leg Press", sets: 2, targetRIR: "1-0", substitutions: ["Bulgarian Split Squat", "Sissy Squat"]           , videoUrl: "https://www.instagram.com/p/Cvk5D_-sgif/" },
        { slotName: "Leg Extension (Quad Short Position Isolation)", prescribedEquipment: "Leg Extension", sets: 2, targetRIR: "1-0", substitutions: ["Cable Leg Extension", "Single-Leg Extension"]           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Straight-Leg Calf Raise", prescribedEquipment: "Standing Calf Raise", sets: 2, targetRIR: "1-0", substitutions: ["Leg Press Calf Raise", "Donkey Calf Raise"]           , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" },
        { slotName: "Spinal Flexion (Core Isolation)", prescribedEquipment: "Plate-Weighted Crunch", sets: 2, targetRIR: "1-0", substitutions: ["Cable Crunch", "Machine Crunch"]           , videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s&t=166s&pp=ygUfd2VpZ2h0ZWQgY3J1bmNlcyBzZWFuIG5hbGV3YW55ag%3D%3D" }
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
      totalSets: 14,
      exercises: [
        { slotName: "Incline Press (Chest/Front Delt Focus)", prescribedEquipment: "Incline Bench Press", sets: 2, targetRIR: "1 RIR, 0 RIR", substitutions: ["Incline DB Press", "Incline Machine Press"]           , videoUrl: "https://www.youtube.com/shorts/ou6s32mJgjU" },
        { slotName: "Lateral Raise (Side Delt Focus)", prescribedEquipment: "Dumbbell Lateral Raise", sets: 3, targetRIR: "1-0", notes: "Start with weak side", substitutions: ["Cable Lateral Raise", "Machine Lateral Raise"]           , videoUrl: "https://www.youtube.com/shorts/f_OGBg2KxgY" },
        { slotName: "Vertical Pull (Lat Focus)", prescribedEquipment: "Pull-Up", sets: 2, targetRIR: "1 RIR / 0 RIR", substitutions: ["Neutral Grip Lat Pulldown", "Assisted Pull-Up"]           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Pushdown Variation (Triceps Short Position)", prescribedEquipment: "Tricep Bar Extension", sets: 3, targetRIR: "1-0", substitutions: ["Cable Rope Pushdown", "Dual Cable Tricep Extension"]  },
        { slotName: "Horizontal Row (Mid-Back Focus)", prescribedEquipment: "Cable Row", sets: 1, targetRIR: "1 RIR", substitutions: ["T-Bar Row", "Seated Machine Chest-Supported Row"]           , videoUrl: "https://youtu.be/vD-dEl7R2Bg?t=4m23s" },
        { slotName: "Preacher Curl (Stabilized Bicep Isolation)", prescribedEquipment: "Preacher Curl", sets: 2, targetRIR: "1-0", notes: "Full extension no compromise", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=rsrN-avWD60&pp=ygUNcHJlYWNoZXIgY3VybA%3D%3D" },
        { slotName: "Overhead Tricep Extension (Triceps Long Head Focus)", prescribedEquipment: "Overhead Extension", sets: 1, targetRIR: "1-0", substitutions: ["DB Overhead Extension", "Cable Overhead Rope Extension"]           , videoUrl: "https://www.youtube.com/shorts/68NDeHB1WSc" }
      ]
    },
    {
      id: "4d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Lower (Posterior Chain)",
      totalSets: 14,
      exercises: [
        { slotName: "Hinged Posterior Chain Movement (Hamstring/Glute Focus)", prescribedEquipment: "RDL", sets: 2, targetRIR: "1 RIR, 1 RIR", notes: "Safe Zone", substitutions: ["DB RDL", "Barbell RDL", "Deficit RDL"]           , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Leg Extension (Quad Short Position Isolation)", prescribedEquipment: "Leg Extension", sets: 3, targetRIR: "1-0", substitutions: ["Single-Leg Extension", "Cable Leg Extension"]           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Seated/Lying Leg Curl (Hamstring Isolation)", prescribedEquipment: "Leg Curl", sets: 2, targetRIR: "1-0", substitutions: ["Lying Leg Curl", "Seated Leg Curl"]           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Quad-Biased Squat Variation (Hypertrophy Focus)", prescribedEquipment: "Hack Squat", sets: 2, targetRIR: "1-0", substitutions: ["Hack Squat", "Smith Machine Squat", "Leg Press"]           , videoUrl: "https://www.instagram.com/p/Cvk5D_-sgif/" },
        { slotName: "Spinal Flexion (Core Isolation)", prescribedEquipment: "Weighted Crunches", sets: 2, targetRIR: "1-0", substitutions: ["Cable Crunch", "Machine Crunch"]           , videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s&t=166s&pp=ygUfd2VpZ2h0ZWQgY3J1bmNlcyBzZWFuIG5hbGV3YW55ag%3D%3D" },
        { slotName: "Rear Delt Isolation", prescribedEquipment: "Rear Delt", sets: 2, targetRIR: "1-0", substitutions: ["Reverse Pec Deck", "Cable Face Pulls"]           , videoUrl: "https://youtube.com/shorts/etOGEKcXWdU" },
        { slotName: "Straight-Leg Calf Raise", prescribedEquipment: "Calves", sets: 2, targetRIR: "1-0", substitutions: ["Standing Calf Raise", "Leg Press Calf Raise"]           , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" }
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
        { slotName: "Incline Press (Chest/Front Delt Focus)", prescribedEquipment: "Incline Bench Press", sets: 2, targetRIR: "1-2 RIR", notes: "3-5 rep range", substitutions: ["Incline DB Press", "Incline Machine Press"]           , videoUrl: "https://www.youtube.com/shorts/ou6s32mJgjU" },
        { slotName: "Lateral Raise (Side Delt Focus)", prescribedEquipment: "Lateral Raise", sets: 2, targetRIR: "1-0", substitutions: ["Cable Lateral Raise", "Machine Lateral Raise"]           , videoUrl: "https://www.youtube.com/shorts/f_OGBg2KxgY" },
        { slotName: "Vertical Pull (Lat Focus)", prescribedEquipment: "Pulldowns", sets: 2, targetRIR: "1-0", substitutions: ["Pull-Up", "Neutral Grip Lat Pulldown"]           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Chest-Supported Row (Mid-Back Focus)", prescribedEquipment: "Chest Supported Barbell Row", sets: 2, targetRIR: "0 RIR", substitutions: ["T-Bar Row", "Machine Chest-Supported Row"]           , videoUrl: "https://youtu.be/vD-dEl7R2Bg?t=4m23s" },
        { slotName: "Chest Fly (Isolation)", prescribedEquipment: "Pec Deck", sets: 2, targetRIR: "1-0", substitutions: ["Cable Crossover", "Flat Bench DB Fly"]           , videoUrl: "https://www.youtube.com/shorts/g3T7LsEeDWQ" },
        { slotName: "Unilateral Horizontal Pull (Lat Focus)", prescribedEquipment: "Lat-Focused Single-Arm Row", sets: 2, targetRIR: "1-0", substitutions: ["Single Arm Cable Row", "Meadows Row"]           , videoUrl: "https://youtube.com/shorts/bLVeOunB-c0" },
        { slotName: "Upper Abs (Spinal Flexion)", prescribedEquipment: "Upper Abs", sets: 2, targetRIR: "1-0", substitutions: ["Weighted Crunch", "Cable Crunch"]           , videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s&t=166s&pp=ygUfd2VpZ2h0ZWQgY3J1bmNlcyBzZWFuIG5hbGV3YW55ag%3D%3D" }
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
      totalSets: 14,
      exercises: [
        { slotName: "Overhead Press (Front/Side Delt Focus)", prescribedEquipment: "Standing OHP", sets: 3, targetRIR: "1, 0, 0", notes: "High reps", substitutions: ["Seated DB Press", "Machine Shoulder Press"]           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Elbow-at-Side Bicep Curl", prescribedEquipment: "EZ BAR Curl", sets: 2, targetRIR: "1, 1", substitutions: ["Barbell Curl", "DB Curl"]           , videoUrl: "https://www.youtube.com/shorts/j5f_0rNkPwU" },
        { slotName: "Pushdown Variation (Triceps Short Position)", prescribedEquipment: "Seated Tricep Pushdown", sets: 2, targetRIR: "1-0", substitutions: ["Cable Rope Pushdown", "V-Bar Pushdown"]           , videoUrl: "https://www.youtube.com/shorts/kwzz9WolqQk" },
        { slotName: "Neutral Grip Bicep/Brachialis Curl", prescribedEquipment: "Hammer Curls", sets: 2, targetRIR: "1-0", substitutions: ["Cable Rope Hammer Curl", "Cross-Body Hammer Curl"]           , videoUrl: "https://www.youtube.com/shorts/_GziHDdJY10" },
        { slotName: "Narrow-Grip Horizontal Press (Tricep/Chest Focus)", prescribedEquipment: "Close Grip Bench", sets: 1, targetRIR: "1-0", notes: "Innermost silver nurling on thumb nurling", substitutions: ["Weighted Dips", "Close Grip Smith Machine Press"]           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Leg Extension (Quad Short Position Isolation)", prescribedEquipment: "Leg Extension (Single Leg)", sets: 2, targetRIR: "1-0", substitutions: ["Cable Leg Extension", "Standard Leg Extension"]           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Seated/Lying Leg Curl (Hamstring Isolation)", prescribedEquipment: "Leg Curl", sets: 2, targetRIR: "1-0", substitutions: ["Lying Leg Curl", "Seated Leg Curl"]           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" }
      ]
    },
    {
      id: "4d-d7",
      dayNumber: 7,
      isRestDay: true,
      title: "REST (Active Abs)",
      totalSets: 2,
      exercises: [
        { slotName: "Core Isometric + Eccentric", prescribedEquipment: "Plank + Dragon Flags", sets: 2, targetRIR: "Failure", notes: "Active Rest Day core work", substitutions: ["Ab Wheel Rollout", "Hanging Leg Raises"]           , videoUrl: "https://www.youtube.com/shorts/hph0qDyyk2I" }
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
      totalSets: 13,
      exercises: [
        { slotName: "Incline Press (Chest/Front Delt Focus)", prescribedEquipment: "Incline Bench", sets: 3, targetRIR: "1-2", substitutions: ["Incline DB Press", "Incline Machine Press"]           , videoUrl: "https://www.youtube.com/shorts/ou6s32mJgjU" },
        { slotName: "Overhead Press (Front Delt Focus)", prescribedEquipment: "Frontal Delt Press", sets: 3, targetRIR: "1-2", substitutions: ["Seated DB Press", "Machine Shoulder Press"]           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Chest Fly (Isolation)", prescribedEquipment: "Pec Dec", sets: 2, targetRIR: "1-2", substitutions: ["Cable Crossover", "Flat Bench DB Fly"]           , videoUrl: "https://www.youtube.com/shorts/g3T7LsEeDWQ" },
        { slotName: "Preacher Curl (Stabilized Bicep Isolation)", prescribedEquipment: "Preacher Curl", sets: 2, targetRIR: "1-2", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=rsrN-avWD60&pp=ygUNcHJlYWNoZXIgY3VybA%3D%3D" },
        { slotName: "Lateral Raise (Side Delt Focus)", prescribedEquipment: "Lateral Raise", sets: 2, targetRIR: "1-2", substitutions: ["Cable Lateral Raise", "Machine Lateral Raise"]           , videoUrl: "https://www.youtube.com/shorts/f_OGBg2KxgY" },
        { slotName: "Neutral Grip Bicep/Brachialis Curl", prescribedEquipment: "Elbow Supp Hammer Curl", sets: 1, targetRIR: "0", substitutions: ["DB Hammer Curl", "Cable Rope Hammer Curl"]           , videoUrl: "https://www.youtube.com/shorts/_GziHDdJY10" }
      ]
    },
    {
      id: "5d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Legs 1",
      totalSets: 12,
      exercises: [
        { slotName: "Leg Extension (Quad Short Position Isolation)", prescribedEquipment: "Leg Ext", sets: 2, targetRIR: "1-2", substitutions: ["Single-Leg Extension", "Cable Leg Extension"]           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Seated/Lying Leg Curl (Hamstring Isolation)", prescribedEquipment: "Seated Curl", sets: 2, targetRIR: "1-2", substitutions: ["Lying Leg Curl"]           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Quad-Biased Squat Variation (Hypertrophy Focus)", prescribedEquipment: "Hack Squat", sets: 2, targetRIR: "1-2", substitutions: ["Pendulum Squat", "Heel-Elevated Smith Squat", "Leg Press"]           , videoUrl: "https://www.instagram.com/p/Cvk5D_-sgif/" },
        { slotName: "Straight-Leg Calf Raise", prescribedEquipment: "Calves", sets: 2, targetRIR: "1-2", substitutions: ["Standing Calf Raise", "Leg Press Calf Raise"]           , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" },
        { slotName: "Upper Abs (Spinal Flexion)", prescribedEquipment: "Upper Abs", sets: 2, targetRIR: "1-2", substitutions: ["Weighted Crunch", "Cable Crunch"]           , videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s&t=166s&pp=ygUfd2VpZ2h0ZWQgY3J1bmNlcyBzZWFuIG5hbGV3YW55ag%3D%3D" },
        { slotName: "Lower Abs (Pelvic Tilt)", prescribedEquipment: "Lower Abs", sets: 2, targetRIR: "1-2", substitutions: ["Hanging Leg Raises", "Lying Leg Raises"]           , videoUrl: "https://www.youtube.com/shorts/eLCBC6fjtQU" }
      ]
    },
    {
      id: "5d-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Pull",
      totalSets: 14,
      exercises: [
        { slotName: "Horizontal Row (Mid-Back Focus)", prescribedEquipment: "Barbell Row", sets: 2, targetRIR: "1-2", substitutions: ["T-Bar Row", "Machine Chest-Supported Row"]           , videoUrl: "https://youtu.be/vD-dEl7R2Bg?t=4m23s" },
        { slotName: "Trap/Upper Back Isolation", prescribedEquipment: "Kelso Shrug", sets: 1, targetRIR: "0", substitutions: ["DB Shrugs", "Barbell Shrugs"] },
        { slotName: "Vertical Pull (Lat Focus)", prescribedEquipment: "Lat Pulldown", sets: 2, targetRIR: "1-2", substitutions: ["Pull-Up", "Neutral Grip Pulldown"]           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Pushdown Variation (Triceps Short Position)", prescribedEquipment: "Bar Pushdown", sets: 3, targetRIR: "1-2", substitutions: ["Cable Rope Pushdown", "V-Bar Pushdown"]  },
        { slotName: "Unilateral Horizontal Pull (Lat Focus)", prescribedEquipment: "Single Arm Lat Row", sets: 2, targetRIR: "1-2", substitutions: ["Meadows Row", "Single Arm Cable Row"]           , videoUrl: "https://youtube.com/shorts/bLVeOunB-c0" },
        { slotName: "Rear Delt Isolation", prescribedEquipment: "Rear Delt Fly", sets: 1, targetRIR: "0", substitutions: ["Reverse Pec Deck", "Cable Face Pulls"]           , videoUrl: "https://youtube.com/shorts/etOGEKcXWdU" },
        { slotName: "Overhead Tricep Extension (Triceps Long Head Focus)", prescribedEquipment: "Overhead Pushdown", sets: 2, targetRIR: "1-2", substitutions: ["DB Overhead Extension", "Cable Overhead Rope Extension"]           , videoUrl: "https://www.youtube.com/shorts/68NDeHB1WSc" },
        { slotName: "Narrow-Grip Horizontal Press (Tricep/Chest Focus)", prescribedEquipment: "Close Grip Bench", sets: 1, targetRIR: "0", substitutions: ["Weighted Dips", "Close Grip Smith Machine Press"]           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" }
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
      totalSets: 14,
      exercises: [
        { slotName: "Incline Press (Chest/Front Delt Focus)", prescribedEquipment: "Incline Bench", sets: 2, targetRIR: "1-2", substitutions: ["Incline DB Press", "Incline Machine Press"]           , videoUrl: "https://www.youtube.com/shorts/ou6s32mJgjU" },
        { slotName: "Vertical Pull (Lat Focus)", prescribedEquipment: "PullUp", sets: 2, targetRIR: "1-2", substitutions: ["Lat Pulldown", "Assisted Pull-Up"]           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Overhead Press (Front Delt Focus)", prescribedEquipment: "Shoulder Press", sets: 2, targetRIR: "1-2", substitutions: ["Seated DB Press", "Machine Shoulder Press"]           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Elbow-at-Side Bicep Curl", prescribedEquipment: "EZ bar Curl", sets: 3, targetRIR: "1-2", substitutions: ["Barbell Curl", "DB Curl"]           , videoUrl: "https://www.youtube.com/shorts/j5f_0rNkPwU" },
        { slotName: "Pushdown Variation (Triceps Short Position)", prescribedEquipment: "Bar pushdown", sets: 2, targetRIR: "1-2", substitutions: ["Cable Rope Pushdown", "Dual Cable Tricep Extension"]  },
        { slotName: "Lateral Raise (Side Delt Focus)", prescribedEquipment: "Lateral Raise", sets: 2, targetRIR: "1-2", substitutions: ["Cable Lateral Raise", "Machine Lateral Raise"]           , videoUrl: "https://www.youtube.com/shorts/f_OGBg2KxgY" },
        { slotName: "Horizontal Row (Mid-Back Focus)", prescribedEquipment: "Cable Row", sets: 1, targetRIR: "0", substitutions: ["T-Bar Row", "Seated Machine Chest-Supported Row"]           , videoUrl: "https://youtu.be/vD-dEl7R2Bg?t=4m23s" }
      ]
    },
    {
      id: "5d-d6",
      dayNumber: 6,
      isRestDay: false,
      title: "Legs 2",
      totalSets: 12,
      exercises: [
        { slotName: "Hinged Posterior Chain Movement (Hamstring/Glute Focus)", prescribedEquipment: "RDL", sets: 2, targetRIR: "1-2", substitutions: ["DB RDL", "Barbell RDL", "Deficit RDL"]           , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Leg Extension (Quad Short Position Isolation)", prescribedEquipment: "Leg Ext", sets: 2, targetRIR: "1-2", substitutions: ["Single-Leg Extension", "Cable Leg Extension"]           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Rear Delt Isolation", prescribedEquipment: "Rear delt fly", sets: 2, targetRIR: "1-2", substitutions: ["Reverse Pec Deck", "Cable Face Pulls"]           , videoUrl: "https://youtube.com/shorts/etOGEKcXWdU" },
        { slotName: "Seated/Lying Leg Curl (Hamstring Isolation)", prescribedEquipment: "Lying Curl", sets: 2, targetRIR: "1-2", substitutions: ["Seated Leg Curl"]           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Quad-Biased Squat Variation (Hypertrophy Focus)", prescribedEquipment: "Hack", sets: 1, targetRIR: "0", substitutions: ["Pendulum Squat", "Leg Press", "Heel-Elevated Smith Squat"]           , videoUrl: "https://www.instagram.com/p/Cvk5D_-sgif/" },
        { slotName: "Upper Abs (Spinal Flexion)", prescribedEquipment: "Upper Abs", sets: 2, targetRIR: "1-2", substitutions: ["Weighted Crunch", "Cable Crunch"]           , videoUrl: "https://www.youtube.com/watch?v=jBtiDLz0y7s&t=166s&pp=ygUfd2VpZ2h0ZWQgY3J1bmNlcyBzZWFuIG5hbGV3YW55ag%3D%3D" },
        { slotName: "Straight-Leg Calf Raise", prescribedEquipment: "Calves", sets: 1, targetRIR: "0", substitutions: ["Standing Calf Raise", "Leg Press Calf Raise"]           , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" },
        { slotName: "Neck Flexion", prescribedEquipment: "Neck Curls", sets: 2, targetRIR: "1-2", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=gimeRpdqWQw&t=362s&pp=ygUKbmVjayBjdXJsc9IHCQlOCwGHKiGM7w%3D%3D" },
        { slotName: "Neck Extension", prescribedEquipment: "Neck Ext", sets: 2, targetRIR: "1-2", substitutions: []   , videoUrl: "https://www.youtube.com/watch?v=gimeRpdqWQw&t=362s&pp=ygUKbmVjayBjdXJsc9IHCQlOCwGHKiGM7w%3D%3D" }
      ],
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
      totalSets: 19,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Back Squat", sets: 3, targetRIR: "6 reps @ RPE 7", notes: "SIT BACK AND DOWN, 15° TOE FLARE, DRIVE YOUR KNEES OUT LATERALLY", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8&pp=ygUSc3F1YXQgamVmZiBuaXBwYXJk" },
        { slotName: "Horizontal Press", prescribedEquipment: "Barbell Bench Press", sets: 3, targetRIR: "8 reps @ RPE 7", notes: "TUCK ELBOWS AT A 45° ANGLE, SQUEEZE YOUR SHOULDER BLADES AND STAY FIRM ON THE BENCH", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Vertical Pull", prescribedEquipment: "Lat Pulldown", sets: 3, targetRIR: "10 reps @ RPE 8", notes: "PULL YOUR ELBOWS STRAIGHT OUT TO YOUR SIDES, USE A 1.5X SHOULDER WIDTH GRIP", substitutions: []           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Hinge Pattern", prescribedEquipment: "Romanian Deadlift", sets: 3, targetRIR: "10 reps @ RPE 7", notes: "MAINTAIN A NEUTRAL LOWER BACK, SET YOUR HIPS BACK, DON'T ALLOW YOUR SPINE TO ROUND", substitutions: []           , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Vertical Press / Dip", prescribedEquipment: "Assisted Dip", sets: 3, targetRIR: "8 reps @ RPE 7", notes: "TUCK ELBOWS AT A 45° ANGLE, LEAN YOUR TORSO FORWARD 15°", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Calf Isolation", prescribedEquipment: "Standing Calf Raise", sets: 2, targetRIR: "10 reps @ RPE 8", notes: "PRESS ALL THE WAY UP TO YOUR TOES, STRETCH YOUR CALVES AT THE BOTTOM, DON'T BOUNCE", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" },
        { slotName: "Elbow Flexion", prescribedEquipment: "Dumbbell Supinated Curl", sets: 2, targetRIR: "10 reps @ RPE 8", notes: "DRIVE YOUR PINKY INTO THE HANDLE HARDER THAN YOUR POINTER FINGER", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/j5f_0rNkPwU" }
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
      totalSets: 17,
      exercises: [
        { slotName: "Deadlift Pattern", prescribedEquipment: "Deadlift", sets: 3, targetRIR: "5 reps @ RPE 7", notes: "BRACE YOUR LATS, CHEST TALL, HIPS HIGH, PULL THE SLACK OUT OF THE BAR PRIOR TO MOVING IT OFF THE GROUND", substitutions: [] , videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" },
        { slotName: "Vertical Press", prescribedEquipment: "Military Press", sets: 3, targetRIR: "8 reps @ RPE 8", notes: "SQUEEZE YOUR GLUTES TO KEEP YOUR TORSO UPRIGHT, CLEAR YOUR HEAD OUT OF THE WAY, PRESS UP AND SLIGHTLY BACK", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Horizontal Pull", prescribedEquipment: "Chest-Supported T-Bar Row", sets: 3, targetRIR: "12 reps @ RPE 8", notes: "RETRACT YOUR SCAPULAE DURING THE CONCENTRIC, PROTRACT YOUR SCAPULAE DURING THE ECCENTRIC", substitutions: []           , videoUrl: "https://youtu.be/vD-dEl7R2Bg?t=4m23s" },
        { slotName: "Knee Extension", prescribedEquipment: "Leg Extension", sets: 2, targetRIR: "12 reps @ RPE 8", notes: "FOCUS ON SQUEEZING YOUR QUADS TO MAKE THE WEIGHT MOVE", substitutions: []           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Chest Flye", prescribedEquipment: "Cable Flye", sets: 2, targetRIR: "12 reps @ RPE 8", notes: "KEEP YOUR SCAPULAE RETRACTED, PULL YOUR INNER ELBOWS TOGETHER (NOT YOUR HANDS)", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/g3T7LsEeDWQ" },
        { slotName: "Core Isolation", prescribedEquipment: "Crunch", sets: 2, targetRIR: "12 reps @ RPE 7", notes: "FOCUS ON FLEXING YOUR SPINE, DON'T YANK YOUR HEAD WITH YOUR ARMS", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/hph0qDyyk2I" },
        { slotName: "Elbow Extension", prescribedEquipment: "Dumbbell Skull Crusher", sets: 2, targetRIR: "12 reps @ RPE 8", notes: "KEEP YOUR ELBOWS IN LINE WITH THE TOP OF YOUR HEAD, DON'T LET YOUR UPPER ARM MOVE", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/kwzz9WolqQk" }
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
      totalSets: 17,
      exercises: [
        { slotName: "Knee Extension", prescribedEquipment: "Leg Extension", sets: 2, targetRIR: "10 reps @ RPE 8", notes: "FOCUS ON SQUEEZING YOUR QUADS TO MAKE THE WEIGHT MOVE", substitutions: []           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Incline Press", prescribedEquipment: "Dumbbell Incline Press", sets: 3, targetRIR: "8 reps @ RPE 7", notes: "KEEP YOUR SCAPULAE RETRACTED AND DEPRESSED", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/ou6s32mJgjU" },
        { slotName: "Vertical Pull", prescribedEquipment: "Reverse Grip Lat Pulldown", sets: 3, targetRIR: "10 reps @ RPE 8", notes: "PULL YOUR ELBOWS DOWN AGAINST YOUR SIDES, USE SHOULDER WIDTH GRIP", substitutions: []           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Hip Extension", prescribedEquipment: "Barbell Hip Thrust", sets: 3, targetRIR: "12 reps @ RPE 8", notes: "TUCK YOUR CHIN AND RIB CAGE DOWN, ONLY MOVE YOUR HIPS. USE A PAD", substitutions: [] },
        { slotName: "Rear Delt Isolation", prescribedEquipment: "Seated Face Pull", sets: 2, targetRIR: "12 reps @ RPE 8", notes: "PULL YOUR ARMS BACK AND OUT", substitutions: []           , videoUrl: "https://youtube.com/shorts/etOGEKcXWdU" },
        { slotName: "Lateral Delt Isolation", prescribedEquipment: "Dumbbell Lateral Raise", sets: 2, targetRIR: "10 reps @ RPE 8", notes: "TILT THE DUMBBELL SUCH THAT YOUR PINKY COMES UP FIRST", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/f_OGBg2KxgY" },
        { slotName: "Knee Flexion", prescribedEquipment: "Lying Leg Curl", sets: 2, targetRIR: "10 reps @ RPE 8", notes: "FOCUS ON SQUEEZING YOUR HAMSTRINGS TO MAKE THE WEIGHT MOVE", substitutions: []           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" }
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
      totalSets: 13,
      exercises: [
        { slotName: "Horizontal Press", prescribedEquipment: "Barbell Bench Press", sets: 1, targetRIR: "AMRAP @ 85%", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Horizontal Press (Pause)", prescribedEquipment: "Pause Barbell Bench Press", sets: 2, targetRIR: "5 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Vertical Pull", prescribedEquipment: "Pull-Up", sets: 3, targetRIR: "10 reps", substitutions: []           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Vertical Press", prescribedEquipment: "Military Press", sets: 2, targetRIR: "8 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Horizontal Pull", prescribedEquipment: "Chest-Supported T-Bar Row", sets: 2, targetRIR: "10 reps", substitutions: []           , videoUrl: "https://youtu.be/vD-dEl7R2Bg?t=4m23s" },
        { slotName: "Elbow Flexion", prescribedEquipment: "Hammer Curl", sets: 3, targetRIR: "12 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/_GziHDdJY10" }
      ]
    },
    {
      id: "s4d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Lower Body #1",
      totalSets: 11,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Back Squat", sets: 3, targetRIR: "8 reps", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8&pp=ygUSc3F1YXQgamVmZiBuaXBwYXJk" },
        { slotName: "Hinge Pattern", prescribedEquipment: "Romanian Deadlift", sets: 2, targetRIR: "15 reps", substitutions: []           , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Knee Flexion", prescribedEquipment: "Lying Leg Curl", sets: 2, targetRIR: "12 reps", substitutions: []           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Knee Extension", prescribedEquipment: "Leg Extension", sets: 2, targetRIR: "12-15 reps", substitutions: []           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Calf Isolation", prescribedEquipment: "Standing Calf Raise", sets: 2, targetRIR: "8 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" }
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
      totalSets: 13,
      exercises: [
        { slotName: "Horizontal Press", prescribedEquipment: "Barbell Bench Press", sets: 3, targetRIR: "6-8 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Vertical Pull", prescribedEquipment: "Wide-Grip Lat Pulldown", sets: 2, targetRIR: "8 reps", substitutions: []           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Shoulder Isolation", prescribedEquipment: "Dumbbell Lateral Raise", sets: 2, targetRIR: "15 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/f_OGBg2KxgY" },
        { slotName: "Shoulder Isolation", prescribedEquipment: "Seated Face Pull", sets: 2, targetRIR: "20 reps", substitutions: [] },
        { slotName: "Trap Isolation", prescribedEquipment: "Prone Trap Raise", sets: 2, targetRIR: "15 reps", substitutions: [] },
        { slotName: "Elbow Flexion", prescribedEquipment: "EZ Bar Curl", sets: 2, targetRIR: "12 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/j5f_0rNkPwU" }
      ]
    },
    {
      id: "s4d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Lower Body #2",
      totalSets: 10,
      exercises: [
        { slotName: "Deadlift Pattern", prescribedEquipment: "Deadlift", sets: 2, targetRIR: "8 reps", substitutions: [] , videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" },
        { slotName: "Squat Pattern", prescribedEquipment: "Hack Squat", sets: 2, targetRIR: "12 reps", substitutions: []           , videoUrl: "https://www.instagram.com/p/Cvk5D_-sgif/" },
        { slotName: "Hinge Pattern", prescribedEquipment: "Reverse Hyperextension", sets: 2, targetRIR: "10 reps", substitutions: [] , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Knee Extension", prescribedEquipment: "Leg Extension", sets: 2, targetRIR: "15 reps", substitutions: []           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Knee Flexion", prescribedEquipment: "Seated Leg Curl", sets: 2, targetRIR: "12 reps", substitutions: []           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" }
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
      totalSets: 11,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Squat", sets: 5, targetRIR: "4-6 reps @ RPE 7-8", notes: "Progressing weekly", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8&pp=ygUSc3F1YXQgamVmZiBuaXBwYXJk" },
        { slotName: "Horizontal Press", prescribedEquipment: "Bench", sets: 3, targetRIR: "4-6 reps @ RPE 7-8", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Elbow Flexion", prescribedEquipment: "Biceps Curls", sets: 3, targetRIR: "10-15 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/j5f_0rNkPwU" }
      ]
    },
    {
      id: "s6d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Bench, Deadlift, Back",
      totalSets: 17,
      exercises: [
        { slotName: "Horizontal Press (Heavy)", prescribedEquipment: "Bench", sets: 1, targetRIR: "1 rep @ RPE 8 (~90% 1RM)", notes: "2-count pause", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Horizontal Press (Volume)", prescribedEquipment: "Bench", sets: 4, targetRIR: "3 reps @ ~85%", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Deadlift Pattern", prescribedEquipment: "Deadlift", sets: 3, targetRIR: "4-6 reps", notes: "Volume accumulation", substitutions: [] , videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" },
        { slotName: "Horizontal Pull", prescribedEquipment: "Horizontal Row", sets: 3, targetRIR: "6-8 reps", notes: "Heavy", substitutions: []           , videoUrl: "https://youtu.be/Cp_bShvMY4c" },
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Row / Pull-ups", sets: 3, targetRIR: "Heavy or high reps", substitutions: []           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Horizontal Pull", prescribedEquipment: "Second Row Variation", sets: 3, targetRIR: "10-15 reps", substitutions: []           , videoUrl: "https://youtu.be/Cp_bShvMY4c" }
      ]
    },
    {
      id: "s6d-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Shoulders, Arms, Abs",
      totalSets: 21,
      exercises: [
        { slotName: "Vertical Press", prescribedEquipment: "Dumbbell Overhead Press", sets: 3, targetRIR: "6-8 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Lateral Delt", prescribedEquipment: "Lateral Raises", sets: 3, targetRIR: "10-15 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/f_OGBg2KxgY" },
        { slotName: "Rear Delt", prescribedEquipment: "Rear Delt Flies", sets: 3, targetRIR: "10-15 reps", substitutions: []           , videoUrl: "https://youtube.com/shorts/etOGEKcXWdU" },
        { slotName: "Elbow Extension", prescribedEquipment: "Overhead Triceps Extensions", sets: 3, targetRIR: "10-15 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/kwzz9WolqQk" },
        { slotName: "Elbow Flexion (Heavy)", prescribedEquipment: "Heavy EZ Bar Curls", sets: 3, targetRIR: "6-8 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/j5f_0rNkPwU" },
        { slotName: "Elbow Flexion (Isolation)", prescribedEquipment: "Preacher Hammer Curls", sets: 3, targetRIR: "10-12 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/_GziHDdJY10" },
        { slotName: "Core", prescribedEquipment: "Cable Crunches", sets: 3, targetRIR: "10-15 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/hph0qDyyk2I" }
      ]
    },
    {
      id: "s6d-d4",
      dayNumber: 4,
      isRestDay: false,
      title: "Technique Day: Light Squat & Bench",
      totalSets: 6,
      warning: "Build technical efficiency; avoid fatigue. Intensity: Very light, ~70% or RPE <=6",
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Squat", sets: 3, targetRIR: "6-7 reps @ ~70%", notes: "Optional: pause squats or low-stress variants", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8&pp=ygUSc3F1YXQgamVmZiBuaXBwYXJk" },
        { slotName: "Horizontal Press", prescribedEquipment: "Larsen Press", sets: 3, targetRIR: "Light volume", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" }
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
      totalSets: 18,
      warning: "Phase 1 (Weeks 1-3): Sets of 3-4 reps. Phase 2 (Weeks 4-6): Sets of 1-2 reps.",
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Heavy Squat", sets: 3, targetRIR: "1-4 reps", notes: "Depending on phase", substitutions: []           , videoUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8&pp=ygUSc3F1YXQgamVmZiBuaXBwYXJk" },
        { slotName: "Horizontal Press", prescribedEquipment: "Heavy Bench", sets: 3, targetRIR: "1-4 reps", notes: "Depending on phase", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Deadlift Pattern", prescribedEquipment: "Heavy Deadlift", sets: 3, targetRIR: "1-4 reps", notes: "Depending on phase", substitutions: [] , videoUrl: "https://www.youtube.com/watch?v=VL5Ab0T07e4&pp=ygUVamVmZiBuaXBwYXJkIGRlYWRsaWZ0" },
        { slotName: "Leg Press", prescribedEquipment: "Leg Press", sets: 3, targetRIR: "Heavy", substitutions: []           , videoUrl: "https://www.instagram.com/p/Cvk5D_-sgif/" },
        { slotName: "Knee Extension", prescribedEquipment: "Leg Extensions", sets: 3, targetRIR: "Heavy", substitutions: []           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Knee Flexion", prescribedEquipment: "Leg Curls", sets: 3, targetRIR: "Heavy", substitutions: []           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" }
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
      totalSets: 15,
      exercises: [
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Pull Progression", sets: 3, targetRIR: "5-8 reps (or max negative)", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Horizontal Press", prescribedEquipment: "Horizontal Press Progression", sets: 3, targetRIR: "8-12 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 3, targetRIR: "15-20 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Core Compression", prescribedEquipment: "Core Compression Progression", sets: 3, targetRIR: "20-30s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Vertical Press Hold", prescribedEquipment: "Vertical Press Hold Progression", sets: 3, targetRIR: "30-45s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: []            }
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
      totalSets: 15,
      exercises: [
        { slotName: "Horizontal Pull", prescribedEquipment: "Horizontal Pull Progression", sets: 3, targetRIR: "8-12 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Vertical Press", prescribedEquipment: "Vertical Press Progression", sets: 3, targetRIR: "8-12 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Lunge Pattern", prescribedEquipment: "Lunge Pattern Progression", sets: 3, targetRIR: "12 reps per leg", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Core Anti-Extension", prescribedEquipment: "Core Anti-Extension Progression", sets: 3, targetRIR: "60s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Grip & Scapula", prescribedEquipment: "Grip & Scapula Progression", sets: 3, targetRIR: "30-45s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: [] }
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
      totalSets: 15,
      exercises: [
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Pull Progression", sets: 3, targetRIR: "1 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Horizontal Press", prescribedEquipment: "Horizontal Press Progression", sets: 3, targetRIR: "1 RIR", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 3, targetRIR: "10 reps per leg", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Hip Extension", prescribedEquipment: "Hip Extension Progression", sets: 3, targetRIR: "15 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Core Flexion", prescribedEquipment: "Core Flexion Progression", sets: 3, targetRIR: "15 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: [] }
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
      totalSets: 15,
      exercises: [
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Pull Progression", sets: 3, targetRIR: "5-8 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Horizontal Press", prescribedEquipment: "Horizontal Press Progression", sets: 3, targetRIR: "8-12 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Horizontal Pull", prescribedEquipment: "Horizontal Pull Progression", sets: 3, targetRIR: "8-12 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Vertical Press", prescribedEquipment: "Vertical Press Progression", sets: 3, targetRIR: "6-10 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Core", prescribedEquipment: "Core Progression", sets: 3, targetRIR: "30s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: [] }
      ]
    },
    {
      id: "c4d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Lower Body & Core",
      totalSets: 17,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 4, targetRIR: "15-20 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Lunge Pattern", prescribedEquipment: "Lunge Pattern Progression", sets: 3, targetRIR: "12 reps per leg", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Hip Extension", prescribedEquipment: "Hip Extension Progression", sets: 3, targetRIR: "15 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Calf Isolation", prescribedEquipment: "Calf Isolation Progression", sets: 4, targetRIR: "20 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Core", prescribedEquipment: "Core Progression", sets: 3, targetRIR: "20s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: [] }
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
      totalSets: 15,
      exercises: [
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Pull Progression", sets: 3, targetRIR: "5-8 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Vertical Press", prescribedEquipment: "Vertical Press Progression", sets: 3, targetRIR: "8-12 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Horizontal Press", prescribedEquipment: "Horizontal Press Progression", sets: 3, targetRIR: "8-12 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Grip & Scapula", prescribedEquipment: "Grip & Scapula Progression", sets: 3, targetRIR: "45s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Vertical Press Hold", prescribedEquipment: "Vertical Press Hold Progression", sets: 3, targetRIR: "30s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: []            }
      ]
    },
    {
      id: "c4d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Lower Body & Core",
      totalSets: 15,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 3, targetRIR: "10 reps per leg", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 3, targetRIR: "15 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Hip Extension", prescribedEquipment: "Hip Extension Progression", sets: 3, targetRIR: "10 reps per leg", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Core Flexion", prescribedEquipment: "Core Flexion Progression", sets: 3, targetRIR: "15 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Core Anti-Extension", prescribedEquipment: "Core Anti-Extension Progression", sets: 3, targetRIR: "60s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: [] }
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
      totalSets: 16,
      exercises: [
        { slotName: "Vertical Press Hold", prescribedEquipment: "Vertical Press Hold Progression", sets: 4, targetRIR: "30s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Vertical Press", prescribedEquipment: "Vertical Press Progression", sets: 3, targetRIR: "8-12 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Vertical Press", prescribedEquipment: "Vertical Press Progression", sets: 3, targetRIR: "8-12 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Horizontal Press", prescribedEquipment: "Horizontal Press Progression", sets: 3, targetRIR: "10-15 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Elbow Extension", prescribedEquipment: "Elbow Extension Progression", sets: 3, targetRIR: "10-15 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            }
      ]
    },
    {
      id: "c6d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Pull (Vertical Bias)",
      totalSets: 16,
      exercises: [
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Pull Progression", sets: 4, targetRIR: "5-8 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Grip & Scapula", prescribedEquipment: "Grip & Scapula Progression", sets: 3, targetRIR: "30-45s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Horizontal Pull", prescribedEquipment: "Horizontal Pull Progression", sets: 3, targetRIR: "8-12 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Isometric Pull", prescribedEquipment: "Isometric Pull Progression", sets: 3, targetRIR: "15-20s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Elbow Flexion", prescribedEquipment: "Elbow Flexion Progression", sets: 3, targetRIR: "10-15 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            }
      ]
    },
    {
      id: "c6d-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Legs & Core",
      totalSets: 17,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 4, targetRIR: "5-8 reps per leg", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 3, targetRIR: "10-12 reps per leg", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Hip Extension", prescribedEquipment: "Hip Extension Progression", sets: 3, targetRIR: "15 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Core Compression", prescribedEquipment: "Core Compression Progression", sets: 4, targetRIR: "15-20s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Core Flexion", prescribedEquipment: "Core Flexion Progression", sets: 3, targetRIR: "10-15 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: [] }
      ]
    },
    {
      id: "c6d-d4",
      dayNumber: 4,
      isRestDay: false,
      title: "Push (Horizontal Bias)",
      totalSets: 16,
      exercises: [
        { slotName: "Horizontal Press", prescribedEquipment: "Horizontal Press Progression", sets: 4, targetRIR: "5-8 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Horizontal Press", prescribedEquipment: "Horizontal Press Progression", sets: 3, targetRIR: "8-12 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Vertical Press", prescribedEquipment: "Vertical Press Progression", sets: 3, targetRIR: "12-15 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Vertical Press Hold", prescribedEquipment: "Vertical Press Hold Progression", sets: 3, targetRIR: "45s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Vertical Press", prescribedEquipment: "Vertical Press Progression", sets: 3, targetRIR: "8-12 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            }
      ]
    },
    {
      id: "c6d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Pull (Horizontal Bias)",
      totalSets: 17,
      exercises: [
        { slotName: "Horizontal Pull", prescribedEquipment: "Horizontal Pull Progression", sets: 4, targetRIR: "8-12 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Pull Progression", sets: 3, targetRIR: "5-8 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Core / Pull", prescribedEquipment: "Core / Pull Progression", sets: 4, targetRIR: "10-15s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Scapula Isolation", prescribedEquipment: "Scapula Isolation Progression", sets: 3, targetRIR: "10-15 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Vertical Pull", prescribedEquipment: "Vertical Pull Progression", sets: 3, targetRIR: "Failure", notes: "Select your tier from the Global Progression Scheme", substitutions: []            }
      ]
    },
    {
      id: "c6d-d6",
      dayNumber: 6,
      isRestDay: false,
      title: "Legs & Core (Volume)",
      totalSets: 20,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Squat Pattern Progression", sets: 4, targetRIR: "20-30 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: []            },
        { slotName: "Lunge Pattern", prescribedEquipment: "Lunge Pattern Progression", sets: 3, targetRIR: "15 reps per leg", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Hip Extension", prescribedEquipment: "Hip Extension Progression", sets: 3, targetRIR: "12 reps per leg", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Calf Isolation", prescribedEquipment: "Calf Isolation Progression", sets: 4, targetRIR: "20 reps", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Core", prescribedEquipment: "Core Progression", sets: 3, targetRIR: "45-60s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: [] },
        { slotName: "Core Anti-Extension", prescribedEquipment: "Core Anti-Extension Progression", sets: 3, targetRIR: "60s hold", notes: "Select your tier from the Global Progression Scheme", substitutions: [] }
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
  globalRule: "Equally Divided Cardio. Lift heavy, run fast, swim deep.",
  days: [
    {
      id: "h4d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Upper (Strength Focus) + Running",
      totalSets: 12,
      exercises: [
        { slotName: "Horizontal Press", prescribedEquipment: "Barbell Bench Press", sets: 3, targetRIR: "4-6 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Vertical Pull", prescribedEquipment: "Weighted Pull-ups", sets: 3, targetRIR: "4-6 reps", substitutions: []           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Vertical Press", prescribedEquipment: "Barbell Overhead Press", sets: 3, targetRIR: "6-8 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Horizontal Pull", prescribedEquipment: "Barbell Row", sets: 3, targetRIR: "6-8 reps", substitutions: [] }
      ],
      warning: "Cardio: 20-30 minutes real running or treadmill. Recovery: 5 min Upper Body stretches + 10 min meditation."
    },
    {
      id: "h4d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Lower (Strength Focus) + Cycling",
      totalSets: 12,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Barbell Squats", sets: 3, targetRIR: "4-6 reps", substitutions: [] , videoUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8&pp=ygUSc3F1YXQgamVmZiBuaXBwYXJk" },
        { slotName: "Hinge Pattern", prescribedEquipment: "Barbell RDL", sets: 3, targetRIR: "6-8 reps", substitutions: []           , videoUrl: "https://youtu.be/_oyxCn2iSjU" },
        { slotName: "Knee Extension", prescribedEquipment: "Machine Leg Extension", sets: 3, targetRIR: "8-10 reps", substitutions: []           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Knee Flexion", prescribedEquipment: "Machine Hamstring Curl", sets: 3, targetRIR: "8-10 reps", substitutions: []           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" }
      ],
      warning: "Cardio: 20-30 minutes real cycling or gym bike. Recovery: 5 min Lower Body stretches + 10 min meditation."
    },
    {
      id: "h4d-d3",
      dayNumber: 3,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
      exercises: []
    },
    {
      id: "h4d-d4",
      dayNumber: 4,
      isRestDay: false,
      title: "Upper (Hypertrophy - 0 RIR) + Swimming",
      totalSets: 12,
      exercises: [
        { slotName: "Incline Press", prescribedEquipment: "Incline DB Press", sets: 3, targetRIR: "8-12 reps", substitutions: [] },
        { slotName: "Vertical Pull", prescribedEquipment: "Machine Lat Pulldown", sets: 3, targetRIR: "8-12 reps", substitutions: []           , videoUrl: "https://youtube.com/shorts/JtR_jfdHYwY" },
        { slotName: "Shoulder Isolation", prescribedEquipment: "DB Lateral Raise", sets: 3, targetRIR: "12-15 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/f_OGBg2KxgY" },
        { slotName: "Arm Isolation", prescribedEquipment: "Bicep & Tricep Superset", sets: 3, targetRIR: "10-15 reps", substitutions: [] }
      ],
      warning: "Cardio: 20-30 minutes swimming. Recovery: 5 min Upper Body stretches + 10 min meditation."
    },
    {
      id: "h4d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Lower (Hypertrophy - 0 RIR) + Cardio",
      totalSets: 12,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Machine Leg Press", sets: 3, targetRIR: "8-12 reps", substitutions: []           , videoUrl: "https://www.instagram.com/p/Cvk5D_-sgif/" },
        { slotName: "Knee Extension", prescribedEquipment: "Machine Leg Extension", sets: 3, targetRIR: "12-15 reps", substitutions: []           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Knee Flexion", prescribedEquipment: "Machine Hamstring Curl", sets: 3, targetRIR: "12-15 reps", substitutions: []           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Calf Isolation", prescribedEquipment: "Machine Calf Raise", sets: 3, targetRIR: "12-15 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" }
      ],
      warning: "Cardio: 20-30 minutes (Pick the modality you didn't do on Day 1/2). Recovery: 5 min Lower Body stretches + 10 min meditation."
    },
    {
      id: "h4d-d6",
      dayNumber: 6,
      isRestDay: true,
      title: "REST",
      totalSets: 0,
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
  title: "6 DAYS: HYBRID PROTOCOL",
  globalRule: "Equally Divided Cardio. Lift heavy, run fast, swim deep.",
  days: [
    {
      id: "h6d-d1",
      dayNumber: 1,
      isRestDay: false,
      title: "Push (Strength) + Running",
      totalSets: 9,
      exercises: [
        { slotName: "Horizontal Press", prescribedEquipment: "Barbell Bench Press", sets: 3, targetRIR: "4-6 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/EdDqD4aKwxM" },
        { slotName: "Vertical Press", prescribedEquipment: "Barbell Overhead Press", sets: 3, targetRIR: "4-6 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/OLePvpxQEGk" },
        { slotName: "Chest/Tricep Isolation", prescribedEquipment: "Weighted Dips", sets: 3, targetRIR: "6-8 reps", substitutions: [] }
      ],
      warning: "Cardio: 20 minutes real running or treadmill (steady state). Recovery: 5 min Chest/Shoulder static stretches + 10 min meditation."
    },
    {
      id: "h6d-d2",
      dayNumber: 2,
      isRestDay: false,
      title: "Pull (Strength) + Swimming",
      totalSets: 9,
      exercises: [
        { slotName: "Vertical Pull", prescribedEquipment: "Weighted Pull-ups", sets: 3, targetRIR: "4-6 reps", substitutions: []           , videoUrl: "https://youtu.be/Hdc7Mw6BIEE" },
        { slotName: "Horizontal Pull", prescribedEquipment: "Barbell Row", sets: 3, targetRIR: "4-6 reps", substitutions: [] },
        { slotName: "Arm Isolation", prescribedEquipment: "Heavy Bicep Curls", sets: 3, targetRIR: "6-8 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/j5f_0rNkPwU" }
      ],
      warning: "Cardio: 20 minutes swimming (freestyle continuous laps). Recovery: 5 min Lat/Bicep static stretches + 10 min meditation."
    },
    {
      id: "h6d-d3",
      dayNumber: 3,
      isRestDay: false,
      title: "Legs (Strength) + Cycling",
      totalSets: 9,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Barbell Squats", sets: 3, targetRIR: "4-6 reps", substitutions: [] , videoUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8&pp=ygUSc3F1YXQgamVmZiBuaXBwYXJk" },
        { slotName: "Knee Flexion", prescribedEquipment: "Machine Hamstring Curl", sets: 3, targetRIR: "8-10 reps", substitutions: []           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Knee Extension", prescribedEquipment: "Machine Leg Extension", sets: 3, targetRIR: "8-10 reps", substitutions: []           , videoUrl: "https://youtu.be/m0FOpMEgero" }
      ],
      warning: "Cardio: 20 minutes real cycling or gym stationary bike (moderate resistance). Recovery: 5 min Quad/Hamstring static stretches + 10 min meditation."
    },
    {
      id: "h6d-d4",
      dayNumber: 4,
      isRestDay: false,
      title: "Push (Hypertrophy - 0 RIR) + Swimming",
      totalSets: 13,
      exercises: [
        { slotName: "Incline Press", prescribedEquipment: "Incline DB Press", sets: 3, targetRIR: "8-12 reps", substitutions: [] },
        { slotName: "Chest Isolation", prescribedEquipment: "Cable Crossovers", sets: 3, targetRIR: "10-15 reps", substitutions: []  },
        { slotName: "Shoulder Isolation", prescribedEquipment: "DB Lateral Raise", sets: 4, targetRIR: "12-15 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/f_OGBg2KxgY" },
        { slotName: "Tricep Isolation", prescribedEquipment: "Cable Tricep Extension", sets: 3, targetRIR: "10-15 reps", substitutions: []  }
      ],
      warning: "Cardio: 20 minutes swimming. Recovery: 5 min Chest/Triceps static stretches + 10 min meditation."
    },
    {
      id: "h6d-d5",
      dayNumber: 5,
      isRestDay: false,
      title: "Pull (Hypertrophy - 0 RIR) + Running",
      totalSets: 12,
      exercises: [
        { slotName: "Vertical Pull", prescribedEquipment: "Machine Lat Pulldown", sets: 3, targetRIR: "8-12 reps", substitutions: []           , videoUrl: "https://youtube.com/shorts/JtR_jfdHYwY" },
        { slotName: "Horizontal Pull", prescribedEquipment: "Machine Seated Row", sets: 3, targetRIR: "8-12 reps", substitutions: [] },
        { slotName: "Rear Delt Isolation", prescribedEquipment: "Cable Face Pull", sets: 3, targetRIR: "12-15 reps", substitutions: []  },
        { slotName: "Arm Isolation", prescribedEquipment: "DB Hammer Curl", sets: 3, targetRIR: "10-12 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/_GziHDdJY10" }
      ],
      warning: "Cardio: 20 minutes real running or treadmill. Recovery: 5 min Back/Forearm static stretches + 10 min meditation."
    },
    {
      id: "h6d-d6",
      dayNumber: 6,
      isRestDay: false,
      title: "Legs (Hypertrophy - 0 RIR) + Cycling",
      totalSets: 12,
      exercises: [
        { slotName: "Squat Pattern", prescribedEquipment: "Machine Leg Press", sets: 3, targetRIR: "8-12 reps", substitutions: []           , videoUrl: "https://www.instagram.com/p/Cvk5D_-sgif/" },
        { slotName: "Knee Extension", prescribedEquipment: "Machine Leg Extension", sets: 3, targetRIR: "12-15 reps", substitutions: []           , videoUrl: "https://youtu.be/m0FOpMEgero" },
        { slotName: "Knee Flexion", prescribedEquipment: "Machine Hamstring Curl", sets: 3, targetRIR: "12-15 reps", substitutions: []           , videoUrl: "https://youtube.com/shorts/FMCq0hT3KRU" },
        { slotName: "Calf Isolation", prescribedEquipment: "Machine Calf Raise", sets: 3, targetRIR: "12-15 reps", substitutions: []           , videoUrl: "https://www.youtube.com/shorts/baEXLy09Ncc" }
      ],
      warning: "Cardio: 20 minutes real cycling or gym stationary bike. Recovery: 5 min Full Leg static stretches + 10 min meditation."
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
