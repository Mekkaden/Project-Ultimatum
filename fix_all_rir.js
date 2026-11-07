const fs = require('fs');

let lines = fs.readFileSync('lib/workout-data.ts', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  let setsMatch = lines[i].match(/sets:\s*(\d+)/);
  let rirMatch = lines[i].match(/targetRIR:\s*"([^"]+)"/);
  
  if (setsMatch && rirMatch && lines[i].includes('slotName:')) {
    let sets = parseInt(setsMatch[1], 10);
    let rirStr = rirMatch[1];
    
    // Check if rirStr is comma separated with S1, S2, etc.
    // e.g. "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR"
    if (rirStr.includes('S1:') || rirStr.includes('S2:')) {
      let parts = rirStr.split(', ');
      
      // Some parts might be combined like "S2-3: 1-0 RIR"
      // If the string contains "S2-3", it actually covers 2 sets.
      // But in the female ones we just saw, it's explicitly "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR".
      if (parts.length > sets && parts.every(p => p.startsWith('S'))) {
          // just slice it
          let newParts = parts.slice(0, sets);
          let newRir = newParts.join(', ');
          lines[i] = lines[i].replace(/targetRIR:\s*"[^"]+"/, `targetRIR: "${newRir}"`);
          console.log(`Line ${i+1}: Updated RIR to ${newRir}`);
      } else if (parts.length > sets) {
          // If it has S2-3 we might need to handle it. Let's just log those for manual check.
          // console.log(`Line ${i+1}: Needs manual check: sets=${sets}, rir="${rirStr}"`);
      }
    }
  }
}
fs.writeFileSync('lib/workout-data.ts', lines.join('\n'), 'utf8');
