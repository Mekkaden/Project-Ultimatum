const fs = require('fs');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // We need to match each day block
  // A day block looks like:
  // {
  //   id: "...",
  //   dayNumber: 1,
  //   isRestDay: false,
  //   title: "...",
  //   totalSets: 13,
  //   exercises: [ ... ]
  // }
  
  // We can do this by finding all exercises arrays.
  
  // Actually, we can just do line-by-line or regex replacement.
  // Replace sets: 4 with sets: 3
  // Replace sets: 3 with sets: 2
  // We must do this carefully.
  
  let lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('sets: ')) {
      // Find sets: X
      let setsMatch = lines[i].match(/sets:\s*(\d+)/);
      if (setsMatch) {
        let sets = parseInt(setsMatch[1], 10);
        let newSets = sets;
        if (sets === 4) newSets = 3;
        else if (sets === 3) newSets = 2;
        
        lines[i] = lines[i].replace(/sets:\s*\d+/, `sets: ${newSets}`);
        
        // Also update targetRIR if it's an exercise line
        // targetRIR: "8-12 reps"
        // Let's append the RIR logic
        if (lines[i].includes('targetRIR:')) {
            let rirMatch = lines[i].match(/targetRIR:\s*"([^"]+)"/);
            if (rirMatch) {
                let currentRir = rirMatch[1];
                // Don't append if already appended
                if (!currentRir.includes('RIR')) {
                    let rirText = newSets === 3 ? " | S1: 2-1 RIR, S2-3: 1-0 RIR" : " | S1: 2-1 RIR, S2: 1-0 RIR";
                    // If it's a hold, maybe don't append RIR? "30s hold"
                    // User said "across all exercises".
                    let newTargetRir = currentRir + rirText;
                    lines[i] = lines[i].replace(/targetRIR:\s*"[^"]+"/, `targetRIR: "${newTargetRir}"`);
                }
            }
        }
      }
    }
  }
  
  content = lines.join('\n');
  
  // Now recalculate totalSets
  // This is tricky using regex, let's just find totalSets: X, and then sum the sets of the exercises below it until the next day or ]
  
  let currentTotalSetsLineIdx = -1;
  let runningSum = 0;
  
  lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/totalSets:\s*\d+,/)) {
          // If we had a previous one, we shouldn't update it here because we calculate looking forward
          currentTotalSetsLineIdx = i;
          runningSum = 0;
      }
      
      if (currentTotalSetsLineIdx !== -1) {
          let setsMatch = lines[i].match(/sets:\s*(\d+)/);
          if (setsMatch && lines[i].includes('slotName')) {
              runningSum += parseInt(setsMatch[1], 10);
          }
          
          if (lines[i].match(/^\s*]\s*$/) || lines[i].match(/^\s*},\s*$/)) {
              // end of exercises array probably
              // Let's just do a naive check: if we see ']' that closes exercises
              if (lines[i].includes(']')) {
                  lines[currentTotalSetsLineIdx] = lines[currentTotalSetsLineIdx].replace(/totalSets:\s*\d+/, `totalSets: ${runningSum}`);
                  currentTotalSetsLineIdx = -1;
              }
          }
      }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log('Updated ' + filePath);
}

processFile('./lib/workout-data.ts');
processFile('./react-native/lib/workout-data.ts');
