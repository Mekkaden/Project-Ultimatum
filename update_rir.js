const fs = require('fs');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // We want to replace targetRIR: "something | S1: 2-1 RIR, S2: 1-0 RIR"
  // with targetRIR: "S1: 2-1 RIR, S2: 1-0 RIR"
  
  // Also handle S2-3
  
  content = content.replace(/targetRIR:\s*"[^"]+\|\s*(S1: 2-1 RIR, S2(?:-3)?: 1-0 RIR)"/g, 'targetRIR: "$1"');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + filePath);
}

processFile('./lib/workout-data.ts');
processFile('./react-native/lib/workout-data.ts');
