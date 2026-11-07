const fs = require('fs');
const EXTERNAL_JSON = '/Users/richardshajimekkaden/.gemini/antigravity-ide/brain/c7b02ec7-864c-48bc-86cd-a4f5c5a154b8/.system_generated/steps/1211/content.md';
let rawJsonStr = fs.readFileSync(EXTERNAL_JSON, 'utf8');
rawJsonStr = rawJsonStr.split('---\n')[1] || rawJsonStr; 
const exerciseDB = JSON.parse(rawJsonStr);

const ex = exerciseDB.find(e => e.media_id === 'guT8YnS');
if (ex) console.log("0140-guT8YnS =", ex.name, "| category:", ex.category, "| target:", ex.target);
else console.log("Not found");
