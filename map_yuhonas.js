const fs = require('fs');

const YUHONAS_JSON = '.temp_yuhonas.json';
const WORKOUT_DATA_FILE = 'lib/workout-data.ts';
const PROGRESSIONS_FILE = 'lib/progressions.ts';
const RAW_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/';

const db = JSON.parse(fs.readFileSync(YUHONAS_JSON, 'utf8'));

// Build a flat list of normalized exercise names in DB
const dbMap = db.map(ex => ({
    id: ex.id,
    name: ex.name.toLowerCase().trim(),
    original: ex.name
}));

// Manual overrides for tricky names in our app
const OVERRIDES = {
    "barbell bench press": "barbell bench press - medium grip",
    "barbell incline press": "barbell incline bench press",
    "dumbbell incline press": "dumbbell incline bench press",
    "incline db press": "dumbbell incline bench press",
    "overhead tricep extension (long head focus)": "cable seated overhead tricep extension",
    "overhead extension": "cable seated overhead tricep extension",
    "cable overhead triceps extension": "cable rope overhead triceps extension",
    "pull-up": "pullups",
    "barbell romanian deadlift": "romanian deadlift",
    "chest-supported mid-back row": "lying t-bar row",
    "weighted ab crunches": "weighted crunches",
    "barbell overhead press": "barbell shoulder press",
    "straight-leg calf raise": "standing calf raises",
    "lateral raise (side delt focus)": "dumbbell lateral raise",
    "dumbbell lateral raise": "dumbbell lateral raise",
    "cable lateral raise": "cable lateral raise",
    "pec deck": "butterfly",
    "rear delt fly": "reverse machine fly",
    "barbell curl (biceps focus)": "barbell curl",
    "preacher dumbbell curl": "two-arm dumbbell preacher curl",
    "bulgarian split squat": "barbell bulgarian split squat",
    "barbell full squat": "barbell squat",
    "squat": "barbell squat"
};

function searchDB(keyword) {
    if (!keyword) return null;
    let k = keyword.toLowerCase().trim();
    if (OVERRIDES[k]) k = OVERRIDES[k];
    
    // Exact match
    let exact = dbMap.find(ex => ex.name === k);
    if (exact) return exact.id;

    // Substring exact match (where DB name strictly contains our name, or vice versa)
    let strictMatches = dbMap.filter(ex => ex.name.includes(k) || k.includes(ex.name));
    if (strictMatches.length > 0) {
        // Find the one where it's closest in length to the original
        strictMatches.sort((a, b) => Math.abs(a.name.length - k.length) - Math.abs(b.name.length - k.length));
        return strictMatches[0].id;
    }

    // All-words match (e.g. "Dumbbell Lateral Raise" matches "Dumbbell Side Lateral Raise")
    let words = k.split(' ').filter(w => w.length > 3); // Ignore small words like 'the', 'for'
    if (words.length > 0) {
        let wordMatches = dbMap.filter(ex => words.every(w => ex.name.includes(w)));
        if (wordMatches.length > 0) {
            wordMatches.sort((a, b) => Math.abs(a.name.length - k.length) - Math.abs(b.name.length - k.length));
            return wordMatches[0].id;
        }
    }
    
    return null;
}

let workoutDataContent = fs.readFileSync(WORKOUT_DATA_FILE, 'utf8');
let lines = workoutDataContent.split('\n');
const exercisePairs = new Map(); 

for (let line of lines) {
    let slotMatch = line.match(/slotName:\s*["']([^"']+)["']/);
    let equipMatch = line.match(/prescribedEquipment:\s*["']([^"']+)["']/);
    
    if (slotMatch || equipMatch) {
        const slotName = slotMatch ? slotMatch[1] : null;
        const equipName = equipMatch ? equipMatch[1] : null;
        
        let targetId = null;
        // Priority 1: Prescribed equipment name
        if (equipName) targetId = searchDB(equipName);
        // Priority 2: Fallbacks
        if (!targetId && equipName) targetId = searchDB(equipName.split(' ')[0]); 

        if (targetId) {
            if (equipName) exercisePairs.set(equipName, targetId);
        }
    }
}

let progContent = fs.readFileSync(PROGRESSIONS_FILE, 'utf8');
let progMatches = progContent.matchAll(/"([^"]+)"/g);
for (const match of progMatches) {
    let name = match[1];
    if (!name.includes('Progression') && name.length < 60 && !exercisePairs.has(name)) {
        let targetId = searchDB(name);
        if (targetId) {
            exercisePairs.set(name, targetId);
        }
    }
}

// Write the mapping to a TS file
let mapContent = `// Auto-generated mapping to yuhonas/free-exercise-db IDs\n\nexport const EXERCISE_DB_MAP: Record<string, string> = {\n`;
let count = 0;
const seen = new Set();
for (const [name, id] of exercisePairs) {
    if (!seen.has(name)) {
        seen.add(name);
        mapContent += `  "${name.replace(/"/g, '\\"')}": "${id}",\n`;
        count++;
    }
}
mapContent += `};\n`;

fs.writeFileSync('lib/gif-map.ts', mapContent);
console.log(`Mapped ${count} exercises to Yuhonas DB IDs.`);

const verify = [
    "Overhead Extension",
    "Overhead Tricep Extension (Long Head Focus)",
    "Dumbbell Lateral Raise",
    "Lateral Raise (Side Delt Focus)",
    "Incline DB Press",
    "Dumbbell Incline Press",
    "Barbell Bench Press",
    "Lat Pulldown",
];
console.log("\\n--- VERIFICATION ---");
for (const v of verify) {
    console.log(`  ${v}: ${exercisePairs.get(v) || "NOT FOUND"}`);
}
