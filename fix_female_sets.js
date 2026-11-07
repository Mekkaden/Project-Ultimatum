const fs = require('fs');

let lines = fs.readFileSync('lib/workout-data.ts', 'utf8').split('\n');

let inFemaleCampaign = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const CAMPAIGN_')) {
    inFemaleCampaign = lines[i].includes('CAMPAIGN_FEMALE_');
  }
  
  if (!inFemaleCampaign) continue;

  if (lines[i].includes('dayNumber:')) {
    let exercises = [];
    let j = i;
    
    // Find the end of this day block and collect exercises
    while (j < lines.length) {
      let setsMatch = lines[j].match(/sets:\s*(\d+)/);
      if (setsMatch && lines[j].includes('slotName:')) {
        exercises.push({ lineIdx: j, sets: parseInt(setsMatch[1], 10) });
      }
      
      // Simple heuristic for end of day block: "    },"
      if (lines[j].match(/^\s*},\s*$/) && lines[j-1] && lines[j-1].includes(']')) {
         break;
      }
      j++;
    }
    
    let calculatedTotal = exercises.reduce((sum, ex) => sum + ex.sets, 0);
    
    if (calculatedTotal > 15) {
      console.log(`Found day starting at line ${i} with ${calculatedTotal} sets. Reducing...`);
      
      let newTotal = 0;
      exercises.forEach(ex => {
        let newSets = ex.sets;
        if (newSets === 4) newSets = 3;
        else if (newSets === 3) newSets = 2;
        else if (newSets === 2) newSets = 1;
        
        let lineStr = lines[ex.lineIdx];
        lineStr = lineStr.replace(/sets:\s*\d+/, `sets: ${newSets}`);
        
        if (newSets === 1) {
            lineStr = lineStr.replace(/S1:[^"]+S2(?:-3|-4)?:\s*1-0 RIR/, "1-0 RIR");
        } else if (newSets === 2) {
            lineStr = lineStr.replace(/S2-3:\s*1-0 RIR/, "S2: 1-0 RIR");
        } else if (newSets === 3) {
            lineStr = lineStr.replace(/S2-4:\s*1-0 RIR/, "S2-3: 1-0 RIR");
        }
        
        lines[ex.lineIdx] = lineStr;
        newTotal += newSets;
      });
      
      for (let k = i; k <= j; k++) {
        if (lines[k].includes('totalSets:')) {
           lines[k] = lines[k].replace(/totalSets:\s*\d+/, `totalSets: ${newTotal}`);
        }
      }
    }
  }
}

fs.writeFileSync('lib/workout-data.ts', lines.join('\n'), 'utf8');
console.log('Successfully updated lib/workout-data.ts');
