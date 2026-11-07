const fs = require('fs');
const EXTERNAL_JSON = '/Users/richardshajimekkaden/.gemini/antigravity-ide/brain/c7b02ec7-864c-48bc-86cd-a4f5c5a154b8/.system_generated/steps/1211/content.md';
let rawJsonStr = fs.readFileSync(EXTERNAL_JSON, 'utf8');
rawJsonStr = rawJsonStr.split('---\n')[1] || rawJsonStr; 
const exerciseDB = JSON.parse(rawJsonStr);

const matches = exerciseDB.filter(ex => ex.name.toLowerCase().includes("ez barbell"));
console.log("Matches for 'ez barbell':");
matches.forEach(m => console.log(m.name, m.gif_url));
