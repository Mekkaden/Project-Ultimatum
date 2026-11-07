const fs = require('fs');

const EXTERNAL_JSON = '/Users/richardshajimekkaden/.gemini/antigravity-ide/brain/c7b02ec7-864c-48bc-86cd-a4f5c5a154b8/.system_generated/steps/1211/content.md';
let rawJsonStr = fs.readFileSync(EXTERNAL_JSON, 'utf8');
rawJsonStr = rawJsonStr.split('---\n')[1] || rawJsonStr; 
const exerciseDB = JSON.parse(rawJsonStr);

function findGif(term) {
    const match = exerciseDB.find(ex => ex.name.toLowerCase().includes(term.toLowerCase()));
    if (match && match.gif_url) {
        return "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/" + match.gif_url;
    }
    return null;
}

console.log("Lateral Raise: " + findGif("lateral raise"));
console.log("Vertical Pull: " + findGif("pull-up")); // fallback for vertical pull
console.log("Squat: " + findGif("squat"));
