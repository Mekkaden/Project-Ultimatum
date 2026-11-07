const fs = require('fs');
const EXTERNAL_JSON = '/Users/richardshajimekkaden/.gemini/antigravity-ide/brain/c7b02ec7-864c-48bc-86cd-a4f5c5a154b8/.system_generated/steps/1211/content.md';
let rawJsonStr = fs.readFileSync(EXTERNAL_JSON, 'utf8');
rawJsonStr = rawJsonStr.split('---\n')[1] || rawJsonStr; 
const exerciseDB = JSON.parse(rawJsonStr);
const RAW = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';

function search(keyword) {
    const k = keyword.toLowerCase().trim();
    const matches = exerciseDB.filter(ex => ex.name.toLowerCase().includes(k) && ex.gif_url).sort((a,b) => a.name.length - b.name.length);
    return matches.slice(0, 5).map(m => ({ name: m.name, gif: RAW + m.gif_url }));
}

console.log("--- tricep bar extension ---");
console.log(search("tricep extension"));
console.log("\n--- pushdown ---");
console.log(search("pushdown"));
console.log("\n--- tricep pushdown ---");
console.log(search("tricep pushdown"));
