const fs = require('fs');

const path = 'lib/workout-data.ts';
let content = fs.readFileSync(path, 'utf8');

// We only want to modify from CAMPAIGN_CALISTHENICS_3_DAY to the end
const splitIndex = content.indexOf('export const CAMPAIGN_CALISTHENICS_3_DAY');
const prefix = content.substring(0, splitIndex);
let targetSection = content.substring(splitIndex);

// Function to replace sets and RIR
targetSection = targetSection.replace(/sets:\s*(2|3)\s*,\s*targetRIR:\s*"([^"]+)"/g, (match, setsStr, rirStr) => {
    let sets = parseInt(setsStr, 10);
    
    if (sets === 2) {
        sets = 3;
        // The user wanted 3 sets to be 2, 1, 0 RIR
        return `sets: 3, targetRIR: "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR"`;
    } else if (sets === 3) {
        sets = 4;
        // The user didn't specify 4 sets explicitly, but logically it could be 3, 2, 1, 0 RIR
        // Let's use "S1: 3 RIR, S2: 2 RIR, S3: 1 RIR, S4: 0 RIR"
        return `sets: 4, targetRIR: "S1: 3 RIR, S2: 2 RIR, S3: 1 RIR, S4: 0 RIR"`;
    }
    return match;
});

fs.writeFileSync(path, prefix + targetSection);
console.log('Successfully updated sets and RIR for calisthenics campaigns.');
