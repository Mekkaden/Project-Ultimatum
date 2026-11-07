const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/S1: 2-1 RIR, S2-3: 1-0 RIR/g, "S1: 2 RIR, S2: 1 RIR, S3: 0 RIR");
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed ' + filePath);
}

fixFile('./lib/workout-data.ts');
fixFile('./react-native/lib/workout-data.ts');
