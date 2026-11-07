const fs = require('fs');
const EXTERNAL_JSON = '/Users/richardshajimekkaden/.gemini/antigravity-ide/brain/c7b02ec7-864c-48bc-86cd-a4f5c5a154b8/.system_generated/steps/1211/content.md';
const WORKOUT_DATA_FILE = 'lib/workout-data.ts';
const PROGRESSIONS_FILE = 'lib/progressions.ts';
const RAW = 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/';

let rawJsonStr = fs.readFileSync(EXTERNAL_JSON, 'utf8');
rawJsonStr = rawJsonStr.split('---\n')[1] || rawJsonStr; 
const exerciseDB = JSON.parse(rawJsonStr);

// Search external DB using keyword substring match on name
function searchDB(keyword) {
    const k = keyword.toLowerCase().trim();
    if (!k) return null;
    
    // Try exact name match first
    const exact = exerciseDB.find(ex => ex.name.toLowerCase() === k);
    if (exact && exact.gif_url) return RAW + exact.gif_url;
    
    // Try contains match, prefer shorter names (more specific)
    const matches = exerciseDB
        .filter(ex => ex.name.toLowerCase().includes(k) && ex.gif_url)
        .sort((a, b) => a.name.length - b.name.length);
    
    if (matches.length > 0) return RAW + matches[0].gif_url;
    return null;
}

// Extract all unique (prescribedEquipment, slotName) pairs from workout-data.ts
let workoutDataContent = fs.readFileSync(WORKOUT_DATA_FILE, 'utf8');
let lines = workoutDataContent.split('\n');
const exercisePairs = new Map(); // key = slotName or equipName, val = gifUrl

for (let line of lines) {
    let slotMatch = line.match(/slotName:\s*["']([^"']+)["']/);
    let equipMatch = line.match(/prescribedEquipment:\s*["']([^"']+)["']/);
    
    if (slotMatch || equipMatch) {
        const slotName = slotMatch ? slotMatch[1] : null;
        const equipName = equipMatch ? equipMatch[1] : null;
        
        // PRIORITY: Search ONLY with equipName (the bold header, e.g. "Dumbbell Lateral Raise")
        // No fallback to slotName to prevent garbage matching!
        let gifUrl = null;
        if (equipName) {
            gifUrl = searchDB(equipName);
        }
        
        if (gifUrl) {
            if (slotName) exercisePairs.set(slotName, gifUrl);
            if (equipName) exercisePairs.set(equipName, gifUrl);
        }
    }
}

// Also extract from progressions.ts
let progContent = fs.readFileSync(PROGRESSIONS_FILE, 'utf8');
let progMatches = progContent.matchAll(/"([^"]+)"/g);
for (const match of progMatches) {
    let name = match[1];
    if (!name.includes('Progression') && name.length < 60 && !exercisePairs.has(name)) {
        let gifUrl = searchDB(name);
        if (gifUrl) {
            exercisePairs.set(name, gifUrl);
        }
    }
}

// Build the output, deduplicating
let mapContent = `// Auto-generated mapping of exercise names to GitHub GIFs\n// Uses exact substring matching on prescribedEquipment names for accuracy\n\nexport const GIF_MAP: Record<string, string> = {\n`;
let count = 0;
const seen = new Set();
for (const [name, url] of exercisePairs) {
    if (!seen.has(name)) {
        seen.add(name);
        mapContent += `  "${name.replace(/"/g, '\\"')}": "${url}",\n`;
        count++;
    }
}
mapContent += `};\n`;

fs.writeFileSync('lib/gif-map.ts', mapContent);
console.log(`Mapped ${count} unique exercise names to GIFs`);

// Print some key ones to verify
const verify = [
    "Overhead Extension",
    "Overhead Tricep Extension (Long Head Focus)",
    "Overhead Tricep Extension (Triceps Long Head Focus)",
    "Overhead Cable Triceps Extension",
    "Dumbbell Lateral Raise",
    "Lateral Raise (Side Delt Focus)",
    "Machine Lateral Raise",
    "Incline DB Press",
    "Dumbbell Incline Press",
    "Barbell Bench Press",
    "Lat Pulldown",
    "Pull-Up",
];
console.log("\n--- VERIFICATION ---");
for (const v of verify) {
    console.log(`  ${v}: ${exercisePairs.get(v) || "NOT FOUND"}`);
}
