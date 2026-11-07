const fs = require('fs');
const EXTERNAL_JSON = '/Users/richardshajimekkaden/.gemini/antigravity-ide/brain/c7b02ec7-864c-48bc-86cd-a4f5c5a154b8/.system_generated/steps/1211/content.md';
let rawJsonStr = fs.readFileSync(EXTERNAL_JSON, 'utf8');
rawJsonStr = rawJsonStr.split('---\n')[1] || rawJsonStr; 
const exerciseDB = JSON.parse(rawJsonStr);

// Find what 1722-1xHyxys is
const ex = exerciseDB.find(e => e.media_id === '1xHyxys');
if (ex) console.log("1722-1xHyxys =", ex.name, "| category:", ex.category, "| target:", ex.target);

// Find what 0194-2IxROQ1 is (the cable overhead one)
const ex2 = exerciseDB.find(e => e.media_id === '2IxROQ1');
if (ex2) console.log("0194-2IxROQ1 =", ex2.name, "| category:", ex2.category, "| target:", ex2.target);

// Find what 0334-DsgkuIt is (dumbbell lateral raise)
const ex3 = exerciseDB.find(e => e.media_id === 'DsgkuIt');
if (ex3) console.log("0334-DsgkuIt =", ex3.name, "| category:", ex3.category, "| target:", ex3.target);

// Search for "overhead extension" substring matches
const matches = exerciseDB.filter(e => e.name.toLowerCase().includes('overhead extension'));
console.log("\nAll 'overhead extension' matches:");
matches.forEach(m => console.log(`  ${m.name} -> ${m.gif_url} | target: ${m.target}`));
