const fs = require('fs');
const EXTERNAL_JSON = '/Users/richardshajimekkaden/.gemini/antigravity-ide/brain/c7b02ec7-864c-48bc-86cd-a4f5c5a154b8/.system_generated/steps/1211/content.md';
let rawJsonStr = fs.readFileSync(EXTERNAL_JSON, 'utf8');
rawJsonStr = rawJsonStr.split('---\n')[1] || rawJsonStr; 
const exerciseDB = JSON.parse(rawJsonStr);
const RAW = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';

// Search the external DB for exercises containing a keyword
function search(keyword) {
    const k = keyword.toLowerCase();
    const matches = exerciseDB.filter(ex => ex.name.toLowerCase().includes(k));
    return matches.map(m => ({ name: m.name, gif: RAW + m.gif_url }));
}

// All the prescribedEquipment values we need to map
const terms = [
    "Overhead Extension",
    "Overhead Triceps Extension",
    "Overhead Cable Triceps Extension", 
    "Overhead Pushdown",
    "Overhead Press",
    "Incline DB Press",
    "Incline Bench Press",
    "Dumbbell Incline Press",
    "Lat Pulldown",
    "Pull-Up",
    "Barbell Curl",
    "Dumbbell Curl",
    "Face Pull",
    "Romanian Deadlift",
    "Leg Press",
    "Leg Extension",
    "Leg Curl",
    "Bench Press",
    "Cable Row",
    "Dumbbell Row",
    "Lateral Raise",
    "Dumbbell Lateral Raise",
    "Rear Delt Fly",
    "Calf Raise",
    "Hip Thrust",
    "Cable Flye",
    "Chest Fly",
    "Pendlay Row",
    "Preacher Curl",
    "Hammer Curl",
    "Skull Crusher",
    "Tricep Pushdown",
    "Cable Kickback",
];

for (const term of terms) {
    const results = search(term);
    if (results.length > 0) {
        console.log(`\n--- ${term} ---`);
        results.slice(0, 3).forEach(r => console.log(`  ${r.name} -> ${r.gif}`));
    } else {
        console.log(`\n--- ${term} --- NO MATCH`);
    }
}
